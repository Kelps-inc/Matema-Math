# Project Overview — Matema

## O que é

**Matema** é uma plataforma de aprendizado de matemática gamificada para estudantes brasileiros do ensino fundamental ao médio, com foco especial em preparação para o **ENEM**.

O projeto combina mecânicas de jogos (XP, moedas, níveis, sistema de ELO ranqueado) com conteúdo matemático estruturado, tornando o estudo mais engajante e divertido.

## Público-alvo

- Estudantes do ensino médio (14–18 anos)
- Vestibulandos focados no ENEM
- Qualquer pessoa que queira praticar matemática de forma lúdica

## Proposta de valor

| Tradicional | Matema |
|---|---|
| Apostilas estáticas | Lições interativas com feedback imediato |
| Sem progressão visível | XP, níveis, ELO e conquistas |
| Estudo isolado | Modo ranqueado competitivo |
| Interface genérica | Avatar customizável, tema cozy |
| Sem personalização | Sistema de loja com cosméticos |

## Features principais

### Aprendizado
- **Módulos e Lições**: 4 módulos de conteúdo com lições progressivas
- **3 tipos de exercício**: múltipla escolha, verdadeiro/falso, resposta numérica
- **Teoria por lição**: Texto explicativo antes dos exercícios
- **Renderização LaTeX**: Equações matemáticas via KaTeX

### Gamificação
- **XP e Níveis**: Fórmula exponencial — Nível = floor(√(xp/50)) + 1
- **Moedas**: Ganhas ao completar lições/partidas ranqueadas
- **Streak**: Dias consecutivos de estudo (schema pronto, lógica pendente)
- **Avatar customizável**: Procedural SVG com dezenas de variações

### Modo Ranqueado
- **Placement test**: 15 perguntas para determinar ELO inicial
- **Tiers**: Bronze → Prata → Ouro → Platina → Diamante → Mestre
- **Divisões**: IV a I dentro de cada tier (exceto Mestre)
- **LP (League Points)**: 0–99 por divisão com promoção/rebaixamento

### Loja e Cosméticos
- Itens compráveis com moedas
- Acessórios equipáveis no avatar

### Interface
- Design cozy com paleta personalizada
- Modo claro/escuro
- Mobile-first responsivo
- Áudio ambiente (chuva) + SFX sintetizados

## Conteúdo matemático

| Módulo | Ícone | Cor | Tópicos |
|---|---|---|---|
| Números e Operações | 🔢 | #D4845A | MMC, MDC, frações, potências |
| Álgebra e Funções | 📐 | #6B9E7A | Equações, funções, PA/PG |
| Geometria | 📏 | #8B7CC4 | Geometria plana/espacial, trigonometria |
| Estatística e Probabilidade | 📊 | #E8A838 | Média, mediana, moda, probabilidade |

## Status atual (junho 2026)

- ✅ Autenticação completa (signup/login/logout)
- ✅ Sistema de módulos e lições
- ✅ Player de exercícios com feedback
- ✅ Sistema de XP, moedas, níveis
- ✅ Avatar procedural + editor
- ✅ Loja de cosméticos
- ✅ Modo ranqueado com ELO
- ✅ Placement test
- ✅ Dashboard com estatísticas
- ✅ Questões ENEM (modo Estilo ENEM)
- ⏳ Streaks (schema pronto, lógica pendente)
- ❌ Duelos 1v1
- ❌ Simulado ENEM completo
- ❌ AI Tutor
- ❌ Planos de estudo
- ❌ Modo sala de aula
