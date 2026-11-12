-- Fyw · propostas comerciais do painel (Supabase / Postgres)
-- Como usar: no Supabase, abra SQL Editor → New query → cole este arquivo inteiro → Run.
-- Pode rodar de novo quantas vezes quiser: ele só cria o que falta (não apaga propostas).
-- A tabela fica fechada (RLS ligado e sem políticas): só o servidor do site, com a chave secreta, lê e grava.

create table if not exists public.propostas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null default '',     -- nome do projeto
  cliente text not null default '',    -- para quem é a proposta
  tipo text not null default '',       -- hotsite, website, agenda, rebranding...
  preco text not null default '',      -- valor final, como aparece na proposta
  logo text not null default '',       -- logo do cliente (endereço ou imagem embutida)
  dados jsonb not null default '{}'::jsonb, -- todo o conteúdo da proposta
  criado timestamptz not null default now(),
  atualizado timestamptz not null default now()
);
create index if not exists propostas_atualizado on public.propostas (atualizado desc);
alter table public.propostas enable row level security;

-- Tabela de preços editável no painel (/propostas → Tabela de preços). Guarda um único registro com a chave 'tabela-precos'.
create table if not exists public.fyw_config (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb,
  atualizado timestamptz not null default now()
);
alter table public.fyw_config enable row level security;
