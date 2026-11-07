-- Fyw · análise própria do site (Supabase / Postgres)
-- Como usar: no Supabase, abra SQL Editor → New query → cole este arquivo inteiro → Run. Pode rodar de novo sem problema.
-- A tabela fica fechada (RLS ligado e sem políticas): só o servidor do site, com a chave de serviço, lê e grava.

create table if not exists public.fa_events (
  id bigserial primary key,
  ts timestamptz not null default now(),
  t text not null,                 -- pv (página vista), click, leave (saída da página)
  p text not null,                 -- caminho da página
  sid text,                        -- sessão (só de quem aceitou os cookies de análise)
  who text,                        -- visitante (código; sem IP)
  first boolean not null default false, -- primeira página da visita
  src text, ref text, ref_host text, campaign text,
  country text, city text, region text,
  dev text, br text, lang text, title text,
  x real, y int, h int, w int, txt text, href text,
  dur int, depth int
);
create index if not exists fa_events_ts on public.fa_events (ts);
create index if not exists fa_events_sid on public.fa_events (sid, ts);
create index if not exists fa_events_tp on public.fa_events (t, p);
alter table public.fa_events enable row level security;

-- números do período (painel)
create or replace function public.fa_stats(dias int default 7)
returns json language sql stable as $$
  with e as (select * from public.fa_events where ts > now() - make_interval(days => dias)),
  pv as (select * from e where t = 'pv'),
  fv as (select * from pv where first),
  lv as (select * from e where t = 'leave')
  select json_build_object(
    'pv', (select count(*) from pv),
    'uv', (select count(distinct who) from pv),
    'visits', (select count(*) from fv),
    'live', (select count(distinct coalesce(sid, who)) from e where ts > now() - interval '5 minutes'),
    'avgdur', (select coalesce(round(avg(dur)), 0) from lv),
    'avgdepth', (select coalesce(round(avg(depth)), 0) from lv),
    'byday', (select coalesce(json_agg(r order by r.d), '[]') from (select to_char(ts at time zone 'America/Sao_Paulo', 'YYYY-MM-DD') d, count(*) pv, count(distinct who) uv from pv group by 1) r),
    'src', (select coalesce(json_agg(r), '[]') from (select coalesce(src, 'direto') k, count(*) n from fv group by 1 order by 2 desc limit 15) r),
    'refs', (select coalesce(json_agg(r), '[]') from (select ref_host k, count(*) n from fv where ref_host is not null and ref_host <> '' group by 1 order by 2 desc limit 15) r),
    'camp', (select coalesce(json_agg(r), '[]') from (select campaign k, count(*) n from fv where campaign is not null and campaign <> '' group by 1 order by 2 desc limit 10) r),
    'pages', (select coalesce(json_agg(r), '[]') from (select p k, count(*) n from pv group by 1 order by 2 desc limit 20) r),
    'land', (select coalesce(json_agg(r), '[]') from (select p k, count(*) n from fv group by 1 order by 2 desc limit 10) r),
    'country', (select coalesce(json_agg(r), '[]') from (select coalesce(country, '??') k, count(*) n from fv group by 1 order by 2 desc limit 15) r),
    'city', (select coalesce(json_agg(r), '[]') from (select city || coalesce(' · ' || nullif(region, ''), '') || ' · ' || coalesce(country, '') k, count(*) n from fv where city is not null and city <> '' group by 1 order by 2 desc limit 15) r),
    'dev', (select coalesce(json_agg(r), '[]') from (select coalesce(dev, '?') k, count(*) n from fv group by 1 order by 2 desc) r),
    'br', (select coalesce(json_agg(r), '[]') from (select coalesce(br, '?') k, count(*) n from fv group by 1 order by 2 desc limit 10) r),
    'clicks', (select coalesce(json_agg(r), '[]') from (select coalesce(nullif(txt, ''), '(sem texto)') || ' ⟶ ' || p k, count(*) n from e where t = 'click' group by 1 order by 2 desc limit 20) r),
    'time', (select coalesce(json_agg(r), '[]') from (select p k, round(avg(dur)) n, round(avg(depth)) d from lv group by 1 order by count(*) desc limit 15) r)
  );
$$;

-- visitas recentes (só quem aceitou os cookies tem sessão)
create or replace function public.fa_sessions(lim int default 60)
returns json language sql stable as $$
  select coalesce(json_agg(r order by r.last desc), '[]') from (
    select sid, min(ts) start, max(ts) last,
      (array_agg(src order by ts) filter (where src is not null))[1] src,
      (array_agg(ref order by ts) filter (where ref is not null and ref <> ''))[1] ref,
      (array_agg(p order by ts))[1] land,
      count(*) filter (where t = 'pv') pages, count(*) filter (where t = 'click') clicks,
      coalesce(sum(dur), 0) secs,
      max(country) country, max(city) city, max(dev) dev, max(br) br
    from public.fa_events where sid is not null and ts > now() - interval '60 days'
    group by sid order by max(ts) desc limit lim
  ) r;
$$;

-- linha do tempo de uma visita
create or replace function public.fa_session(s text)
returns json language sql stable as $$
  select coalesce(json_agg(json_build_object('t', t, 'p', p, 'ts', ts, 'title', title, 'txt', txt, 'href', href, 'dur', dur, 'depth', depth) order by ts), '[]')
  from public.fa_events where sid = s;
$$;

-- cliques de uma página (mapa de calor) e lista de páginas com cliques
create or replace function public.fa_clicks(path text, dias int default 30)
returns json language sql stable as $$
  select coalesce(json_agg(json_build_array(x, y, h, w)), '[]') from (
    select x, y, h, w from public.fa_events where t = 'click' and p = path and ts > now() - make_interval(days => dias) order by ts desc limit 5000
  ) r;
$$;
create or replace function public.fa_clickpages(dias int default 30)
returns json language sql stable as $$
  select coalesce(json_agg(r), '[]') from (select p k, count(*) n from public.fa_events where t = 'click' and ts > now() - make_interval(days => dias) group by 1 order by 2 desc) r;
$$;

-- limpeza: apaga eventos com mais de 180 dias (o site chama de vez em quando)
create or replace function public.fa_cleanup()
returns void language sql as $$ delete from public.fa_events where ts < now() - interval '180 days'; $$;

-- só o servidor (chave de serviço) pode chamar as funções
revoke execute on function public.fa_stats(int), public.fa_sessions(int), public.fa_session(text), public.fa_clicks(text, int), public.fa_clickpages(int), public.fa_cleanup() from public, anon, authenticated;
grant execute on function public.fa_stats(int), public.fa_sessions(int), public.fa_session(text), public.fa_clicks(text, int), public.fa_clickpages(int), public.fa_cleanup() to service_role;
