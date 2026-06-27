# Glossary — Matema

## Termos do domínio

| Termo | Definição |
|---|---|
| **Módulo** | Agrupamento de lições por tema matemático (ex: Álgebra e Funções) |
| **Lição** | Unidade de aprendizado com teoria + exercícios |
| **Exercício** | Questão individual dentro de uma lição |
| **XP** | Experience Points — pontos acumulados ao completar lições e partidas |
| **Nível** | Calculado do XP via fórmula exponencial. Level = floor(√(xp/50)) + 1 |
| **Moedas** | Moeda do jogo usada na loja de cosméticos |
| **Streak** | Dias consecutivos de estudo ativo |
| **ELO** | Sistema de ranking ranqueado (inspirado em Chess ELO + LoL) |
| **Tier** | Nível do ELO: Bronze, Prata, Ouro, Platina, Diamante, Mestre |
| **Divisão** | Subdivisão dentro de um tier (IV=baixo, I=alto). Mestre não tem divisões |
| **LP** | League Points — pontos dentro de uma divisão (0–99) |
| **Placement Test** | 15 questões para determinar ELO inicial de um jogador |
| **PDL** | Pontos de Derrota — sinônimo de LP negativo (perda de LP) |
| **Score** | Pontuação calculada ao fim de uma partida ranqueada (0–1) |
| **Modo Estilo ENEM** | Modo que filtra apenas questões do ENEM |
| **Simulado ENEM** | Prova longa de 45 questões, com sessão salva/retomável (`simulado_sessions`) |
| **Duelo** | Partida 1v1 assíncrona entre dois jogadores (estilo Perguntados), com rating próprio |
| **Duel Rating** | Pontuação de Duelo (`duel_rating`, default 1000), separada do ELO ranqueado |
| **Amigo** | Outro usuário com amizade `accepted` (tabela `friendships`) |
| **Pro** | Assinatura paga que libera o Simulado ENEM. Acesso ativo enquanto `pro_until > now()`; admins têm bypass |
| **Trial** | Teste grátis de 7 dias do Pro, uma vez por usuário (`start_pro_trial`) |
| **AbacatePay** | Gateway de pagamento (PIX + cartão + assinatura) usado na versão Pro |
| **Gabarito** | Resposta correta (`correct_answer`); não é enviada ao cliente fora do Simulado (anti-cheat) |
| **Acessório** | Item cosmético equipável no avatar (comprado na loja) |
| **Avatar** | Representação visual do jogador (SVG procedural customizável) |
| **Theory** | Texto explicativo exibido antes dos exercícios de uma lição |

## Termos técnicos

| Termo | Definição |
|---|---|
| **DDD** | Domain-Driven Design — arquitetura que separa domínio, aplicação, infraestrutura e apresentação |
| **RSC** | React Server Component — componente que roda no servidor, sem JS no cliente |
| **Server Action** | Função `'use server'` que roda no servidor, chamada diretamente do cliente |
| **RLS** | Row Level Security — política de acesso por linha no PostgreSQL |
| **RPC** | Remote Procedure Call — função SQL chamada via `supabase.rpc()` |
| **LaTeX** | Linguagem de marcação matemática (ex: `$\frac{a}{b}$`) |
| **KaTeX** | Biblioteca de renderização LaTeX rápida para web |
| **Zod** | Biblioteca TypeScript para validação de schema em runtime |
| **Supabase SSR** | Pacote `@supabase/ssr` para usar Supabase com cookies HttpOnly no Next.js |
| **Turbopack** | Bundler Rust integrado no Next.js (substituto do Webpack no dev) |
| **App Router** | Sistema de roteamento baseado em pastas do Next.js 13+ |
| **revalidatePath** | Função Next.js que invalida o cache de uma rota (atualiza dados) |
| **Slug** | Identificador URL-friendly (ex: 'algebra-e-funcoes') |
| **SECURITY DEFINER** | Função SQL que roda com privilégios do criador; usada em RPCs atômicos (ex: `apply_duel_ratings`) |
| **migration repair** | Comando do Supabase CLI que ajusta o histórico de migrations sem rodar SQL (ver ADR-011) |

## Abreviações usadas no código

| Abreviação | Significado |
|---|---|
| `repo` | Instância de repositório |
| `supabase` | Cliente Supabase |
| `userId` | ID do usuário autenticado (UUID) |
| `lessonId` | UUID de uma lição |
| `exerciseId` | UUID de um exercício |
| `xpEarned` | XP ganho na operação atual |
| `coinsEarned` | Moedas ganhas na operação atual |
| `lpDelta` | Variação de LP na partida ranqueada |
| `isCorrect` | Se a resposta está correta |
| `timeMs` | Tempo de resposta em milissegundos |
| `MC` | Multiple Choice (múltipla escolha) |
