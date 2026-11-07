-- Fyw · análise própria do site (Supabase / Postgres) · v2
-- Como usar: no Supabase, abra SQL Editor → New query → cole este arquivo inteiro → Run.
-- Pode rodar de novo quantas vezes quiser: ele só cria o que falta e atualiza os relatórios (não apaga visitas).
-- A tabela fica fechada (RLS ligado e sem políticas): só o servidor do site, com a chave secreta, lê e grava.

create table if not exists public.fa_events (
  id bigserial primary key,
  ts timestamptz not null default now(),
  t text not null,                 -- pv (página vista), click, leave (saída), perf (velocidade), err (erro), goal (contato)
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
alter table public.fa_events add column if not exists scr text;     -- resolução da tela (ex.: 1920×1080)
alter table public.fa_events add column if not exists vh int;       -- altura da janela
alter table public.fa_events add column if not exists dpr real;     -- densidade de pixels
alter table public.fa_events add column if not exists load int;     -- ms até a página terminar de carregar
alter table public.fa_events add column if not exists ttfb int;     -- ms até o servidor responder
alter table public.fa_events add column if not exists lcp int;      -- ms até o maior conteúdo aparecer
create index if not exists fa_events_ts on public.fa_events (ts);
create index if not exists fa_events_sid on public.fa_events (sid, ts);
create index if not exists fa_events_tp on public.fa_events (t, p);
alter table public.fa_events enable row level security;

-- canal de cada origem
create or replace function public.fa_channel(src text, campaign text)
returns text language sql immutable as $$
  select case
    when campaign is not null and campaign <> '' then 'Campanhas'
    when src in ('google', 'bing', 'duckduckgo', 'yahoo') then 'Busca'
    when src in ('instagram', 'facebook', 'linkedin', 'x', 'youtube', 'tiktok', 'whatsapp', 'pinterest', 'threads', 'behance') then 'Redes sociais'
    when src in ('chatgpt', 'perplexity', 'gemini', 'claude') then 'Inteligência artificial'
    when src is null or src = 'direto' then 'Direto'
    else 'Outros sites' end;
$$;

drop function if exists public.fa_stats(int);
create or replace function public.fa_stats(dias int default 7)
returns json language sql stable as $$
  with e as (select * from public.fa_events where ts > now() - make_interval(days => dias)),
  pv as (select * from e where t = 'pv'),
  fv as (select * from pv where first),
  lv as (select * from e where t = 'leave'),
  pf as (select * from e where t = 'perf' and (load > 0 or lcp > 0)),
  ss as (  -- visitas com consentimento
    select sid, min(ts) start, max(ts) last,
      (array_agg(src order by ts) filter (where t = 'pv' and src is not null))[1] src,
      (array_agg(p order by ts) filter (where t = 'pv'))[1] land,
      (array_agg(p order by ts desc) filter (where t = 'pv'))[1] exitp,
      count(*) filter (where t = 'pv') pages, coalesce(sum(dur), 0) secs
    from e where sid is not null group by sid
  ),
  tr as (  -- de qual página para qual
    select p, lead(p) over (partition by sid order by ts) nx from e where t = 'pv' and sid is not null
  ),
  old as (select distinct who from public.fa_events where t = 'pv' and ts <= now() - make_interval(days => dias))
  select json_build_object(
    'pv', (select count(*) from pv),
    'uv', (select count(distinct who) from pv),
    'visits', (select count(*) from fv),
    'live', (select count(distinct coalesce(sid, who)) from e where ts > now() - interval '5 minutes'),
    'livepages', (select coalesce(json_agg(r), '[]') from (select p k, count(distinct coalesce(sid, who)) n from e where t = 'pv' and ts > now() - interval '5 minutes' group by 1 order by 2 desc limit 6) r),
    'avgdur', (select coalesce(round(avg(dur)), 0) from lv),
    'avgdepth', (select coalesce(round(avg(depth)), 0) from lv),
    'sessions', (select count(*) from ss),
    'bounce', (select coalesce(round(100.0 * count(*) filter (where pages <= 1) / nullif(count(*), 0)), 0) from ss),
    'sessdur', (select coalesce(round(avg(secs)), 0) from ss),
    'returning', (select count(distinct who) from pv where who in (select who from old)),
    'byday', (select coalesce(json_agg(r order by r.d), '[]') from (select to_char(ts at time zone 'America/Sao_Paulo', 'YYYY-MM-DD') d, count(*) pv, count(distinct who) uv from pv group by 1) r),
    'hours', (select coalesce(json_agg(r order by r.k), '[]') from (select extract(hour from ts at time zone 'America/Sao_Paulo')::int k, count(*) n from pv group by 1) r),
    'weekdays', (select coalesce(json_agg(r order by r.k), '[]') from (select extract(dow from ts at time zone 'America/Sao_Paulo')::int k, count(*) n from pv group by 1) r),
    'channels', (select coalesce(json_agg(r), '[]') from (select public.fa_channel(src, campaign) k, count(*) n from fv group by 1 order by 2 desc) r),
    'src', (select coalesce(json_agg(r), '[]') from (select coalesce(src, 'direto') k, count(*) n from fv group by 1 order by 2 desc limit 15) r),
    'social', (select coalesce(json_agg(r), '[]') from (
        select s.k, coalesce(v.n, 0) n, coalesce(v.who, 0) who, coalesce(x.pages, 0) pages, coalesce(x.secs, 0) secs, coalesce(x.bounce, 0) bounce
        from unnest(array['instagram', 'facebook', 'linkedin', 'x', 'youtube', 'tiktok', 'whatsapp']) s(k)
        left join (select src, count(*) n, count(distinct who) who from fv group by src) v on v.src = s.k
        left join (select src, round(avg(pages), 1) pages, round(avg(secs)) secs, round(100.0 * count(*) filter (where pages <= 1) / count(*)) bounce from ss group by src) x on x.src = s.k) r),
    'refs', (select coalesce(json_agg(r), '[]') from (select ref_host k, count(*) n from fv where ref_host is not null and ref_host <> '' group by 1 order by 2 desc limit 12) r),
    'camp', (select coalesce(json_agg(r), '[]') from (select campaign k, count(*) n from fv where campaign is not null and campaign <> '' group by 1 order by 2 desc limit 10) r),
    'pages', (select coalesce(json_agg(r), '[]') from (select p k, count(*) n from pv group by 1 order by 2 desc limit 15) r),
    'land', (select coalesce(json_agg(r), '[]') from (select p k, count(*) n from fv group by 1 order by 2 desc limit 10) r),
    'exits', (select coalesce(json_agg(r), '[]') from (select exitp k, count(*) n from ss where exitp is not null group by 1 order by 2 desc limit 10) r),
    'flows', (select coalesce(json_agg(r), '[]') from (select p || ' → ' || nx k, count(*) n from tr where nx is not null and nx <> p group by 1 order by 2 desc limit 10) r),
    'time', (select coalesce(json_agg(r), '[]') from (select p k, round(avg(dur)) n, round(avg(depth)) d from lv group by 1 order by count(*) desc limit 12) r),
    'country', (select coalesce(json_agg(r), '[]') from (select coalesce(country, '??') k, count(*) n from fv group by 1 order by 2 desc limit 12) r),
    'city', (select coalesce(json_agg(r), '[]') from (select city || coalesce(' · ' || nullif(region, ''), '') || ' · ' || coalesce(country, '') k, count(*) n from fv where city is not null and city <> '' group by 1 order by 2 desc limit 12) r),
    'dev', (select coalesce(json_agg(r), '[]') from (select coalesce(dev, '?') k, count(*) n from fv group by 1 order by 2 desc) r),
    'br', (select coalesce(json_agg(r), '[]') from (select coalesce(br, '?') k, count(*) n from fv group by 1 order by 2 desc limit 10) r),
    'lang', (select coalesce(json_agg(r), '[]') from (select coalesce(lang, '?') k, count(*) n from fv group by 1 order by 2 desc) r),
    'scr', (select coalesce(json_agg(r), '[]') from (select scr k, count(*) n from fv where scr is not null group by 1 order by 2 desc limit 12) r),
    'win', (select coalesce(json_agg(r), '[]') from (select case when w < 400 then 'até 399 px' when w < 600 then '400–599 px' when w < 900 then '600–899 px' when w < 1280 then '900–1279 px' when w < 1600 then '1280–1599 px' when w < 1920 then '1600–1919 px' else '1920 px ou mais' end k, count(*) n, min(w) o from fv where w is not null group by 1 order by 3) r),
    'clicks', (select coalesce(json_agg(r), '[]') from (select coalesce(nullif(txt, ''), '(sem texto)') || ' ⟶ ' || p k, count(*) n from e where t = 'click' group by 1 order by 2 desc limit 15) r),
    'goals', (select coalesce(json_agg(r), '[]') from (select txt k, count(*) n from e where t = 'goal' group by 1 order by 2 desc) r),
    'goaltotal', (select count(*) from e where t = 'goal'),
    'perf', (select json_build_object(
        'n', count(*),
        'load50', percentile_cont(.5) within group (order by load) filter (where load > 0),
        'load75', percentile_cont(.75) within group (order by load) filter (where load > 0),
        'lcp75', percentile_cont(.75) within group (order by lcp) filter (where lcp > 0),
        'ttfb75', percentile_cont(.75) within group (order by ttfb) filter (where ttfb > 0),
        'fast', count(*) filter (where lcp > 0 and lcp <= 2500), 'mid', count(*) filter (where lcp > 2500 and lcp <= 4000), 'slow', count(*) filter (where lcp > 4000)) from pf),
    'perfdev', (select coalesce(json_agg(r), '[]') from (select coalesce(dev, '?') k, round(percentile_cont(.75) within group (order by lcp)) n, count(*) c from pf where lcp > 0 group by 1 order by 1) r),
    'slow', (select coalesce(json_agg(r), '[]') from (select p k, round(percentile_cont(.75) within group (order by lcp)) n, count(*) c from pf where lcp > 0 group by 1 order by 2 desc limit 10) r),
    'errtotal', (select count(*) from e where t = 'err'),
    'errs', (select coalesce(json_agg(r), '[]') from (select txt k, p, href, count(*) n, max(ts) last from e where t = 'err' group by txt, p, href order by 4 desc limit 20) r)
  );
$$;

-- visitas recentes (só quem aceitou os cookies tem sessão)
drop function if exists public.fa_sessions(int);
create or replace function public.fa_sessions(lim int default 60)
returns json language sql stable as $$
  select coalesce(json_agg(r order by r.last desc), '[]') from (
    select sid, min(ts) start, max(ts) last,
      (array_agg(src order by ts) filter (where src is not null))[1] src,
      (array_agg(ref order by ts) filter (where ref is not null and ref <> ''))[1] ref,
      (array_agg(p order by ts) filter (where t = 'pv'))[1] land,
      (array_agg(p order by ts desc) filter (where t = 'pv'))[1] exitp,
      (array_agg(scr order by ts) filter (where scr is not null))[1] scr,
      max(w) w, max(vh) vh,
      count(*) filter (where t = 'pv') pages, count(*) filter (where t = 'click') clicks, count(*) filter (where t = 'goal') goals, count(*) filter (where t = 'err') errs,
      coalesce(sum(dur), 0) secs,
      max(country) country, max(city) city, max(dev) dev, max(br) br
    from public.fa_events where sid is not null and ts > now() - interval '60 days'
    group by sid order by max(ts) desc limit lim
  ) r;
$$;

create or replace function public.fa_session(s text)
returns json language sql stable as $$
  select coalesce(json_agg(json_build_object('t', t, 'p', p, 'ts', ts, 'title', title, 'txt', txt, 'href', href, 'dur', dur, 'depth', depth, 'lcp', lcp, 'load', load) order by ts), '[]')
  from public.fa_events where sid = s;
$$;

-- cliques de uma página (mapa de calor), com a largura da tela de quem clicou
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

create or replace function public.fa_cleanup()
returns void language sql as $$ delete from public.fa_events where ts < now() - interval '180 days'; $$;

-- só o servidor (chave secreta) pode chamar as funções
revoke execute on function public.fa_stats(int), public.fa_sessions(int), public.fa_session(text), public.fa_clicks(text, int), public.fa_clickpages(int), public.fa_cleanup(), public.fa_channel(text, text) from public, anon, authenticated;
grant execute on function public.fa_stats(int), public.fa_sessions(int), public.fa_session(text), public.fa_clicks(text, int), public.fa_clickpages(int), public.fa_cleanup(), public.fa_channel(text, text) to service_role;
