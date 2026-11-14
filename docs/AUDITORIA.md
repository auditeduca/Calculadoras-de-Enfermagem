# Auditoria e Padronização do Site — Novembro/2026

Avaliação completa do repositório em resposta às pendências apontadas:
componentes modulares ausentes em páginas, rotas quebradas no cabeçalho,
rodapé sem logotipo oficial, páginas fora de padrão e problemas de contraste.

## 1. Diagnóstico

### 1.1 Componentes modulares não integrados
- O site possui 262 arquivos HTML. Antes desta mudança, apenas **132** tinham
  os contêineres de injeção (`#header-container` / `#footer-container`).
- **Nenhuma das 68 páginas de `calculadoras/<nome>/index.html`** tinha
  cabeçalho, rodapé ou barra de acessibilidade — eram páginas "soltas".

### 1.2 Rotas do cabeçalho
- O cabeçalho antigo (`assets/components/header-v4.html`) tinha ~299 rotas
  únicas, e a maior parte estava quebrada:
  - toda a seção **Biblioteca** apontava para `biblioteca/*.html` — a pasta
    não existe no repositório;
  - toda a seção **Carreiras** (empregos, cursos, concursos, calculadoras
    trabalhistas) apontava para páginas inexistentes;
  - a seção **Calendário Vacinal** apontava para páginas inexistentes;
  - dezenas de escalas apontavam para `<nome>.html` na raiz, quando as
    páginas reais estão em `calculadoras/<nome>/`;
  - os links eram **relativos** (ex.: `missao.html`), quebrando em qualquer
    página dentro de subpastas.

### 1.3 Logotipos
- O logotipo do cabeçalho e o do rodapé eram carregados de
  `www.calculadorasdeenfermagem.com.br` — **ambos retornam 404**. O rodapé
  caía num SVG genérico "CE" e o cabeçalho ficava com imagem quebrada.
- O logotipo oficial existe no repositório:
  `assets/images/logotipo-calculadoras-de-enfermagem.webp`.

### 1.4 Contraste (WCAG 2.1 AA)
- `--text-muted: #9e9e9e` sobre branco = 2,8:1 (mínimo 4,5:1) — reprovado.
- Ciano `#00bcd4` usado como cor de texto em hover e anel de foco sobre
  fundo branco = 2,2:1 — reprovado (foco exige ≥ 3:1).
- Rodapé (fundo azul escuro) aprovado: texto branco/75% ≈ 9:1.

### 1.5 Falta de padrão
- Três gerações de componentes convivendo (v1, v2, v4) + cópias duplicadas
  em `components/` (raiz) e `assets/components/`.
- Arquivos residuais: `Novo(a) Documento de Texto*.txt`, `package.json.bak`,
  `teste.html`, `teste13.html`, `calculator-engine..js` (nome com ponto duplo).

## 2. O que foi implementado

### 2.1 Fonte única de verdade em JSON + Schema
- **`data/site.json`** — identidade do site, logotipos, navegação completa,
  idiomas e rodapé. É a única fonte de rotas do cabeçalho/rodapé.
- **`schema/site.schema.json`** — JSON Schema (draft-07) que documenta e
  valida essa configuração.

### 2.2 Gerador de componentes
- **`tools/gerar_componentes.py`** regenera `assets/components/header-v4.html`
  e `assets/components/footer-v4.html` a partir de `data/site.json`:
  - valida a estrutura contra o schema;
  - **verifica cada rota no disco** — rota cujo alvo não existe é excluída do
    HTML gerado e listada em `docs/relatorio-rotas.md`;
  - emite URLs absolutas (funcionam em qualquer profundidade de pasta);
  - usa o logotipo oficial local no cabeçalho, no menu mobile e no rodapé;
  - preserva todas as classes/IDs esperados por `header-v4.js`, `footer-v4.js`
    e pelo sistema de cookies.
- Fluxo de manutenção: editar `data/site.json` → rodar
  `python3 tools/gerar_componentes.py` → commit.

### 2.3 Navegação corrigida
- Menu **Ferramentas** agora cobre as 68 calculadoras/escalas reais de
  `calculadoras/` + as 7 páginas v4 da raiz (aldrete, apache, apgar, barthel,
  heparina, insulina, imc) + notificações compulsórias.
- Seções **Biblioteca**, **Carreiras** e **Calendário Vacinal** foram
  removidas do menu por não existirem páginas; quando as páginas forem
  criadas, basta declará-las em `data/site.json`.
- Rodapé com colunas institucionais apontando só para rotas existentes.

### 2.4 Integração dos modulares em todas as páginas
- **`assets/js/module-loader-v5.js`** — uma única tag de script integra os
  modulares em qualquer página: injeta os CSS v4, cria os contêineres se não
  existirem, busca os componentes e dispara os eventos de inicialização.
  Resolve o caminho base pelo próprio `src`, funcionando local e em produção.
- **`tools/integrar_paginas.py`** — varre o repositório e insere o carregador
  nas páginas sem modulares. Aplicado às **68 páginas de `calculadoras/`**.
  As 132 páginas que já tinham o sistema v4 próprio foram mantidas e passam a
  receber automaticamente o novo cabeçalho/rodapé (os componentes são
  compartilhados).

### 2.5 Contraste
- `--text-muted` → `#667085` (4,7:1).
- Anel de foco (`--focus-ring-color`) → `#00838f` (≥ 3:1).
- Acento do cabeçalho (`--color-accent` em `header-v4.css`) → `#00838f`
  (4,7:1 como texto sobre branco, mantém a família de cor da marca).

### 2.6 Template padrão
- **`templates/pagina-padrao-v5.html`** — casca canônica para novas páginas:
  meta/SEO padronizados, favicon e logotipo oficiais, tokens Tailwind do
  projeto e integração automática dos modulares via carregador.

## 3. Pendências sugeridas (não incluídas nesta mudança)

1. **Conteúdo da Biblioteca** — criar as páginas ou importá-las; depois
   declarar as rotas em `data/site.json`.
2. **Carreiras / Calendário Vacinal** — mesmas condições acima.
3. **Limpeza de legado** — remover componentes v1/v2 não referenciados, a
   pasta `components/` duplicada na raiz, arquivos `Novo(a) Documento...`,
   `package.json.bak`, `teste*.html` e `calculator-engine..js`.
4. **Migração das 68 calculadoras para o motor JSON v4** — hoje cada página
   de `calculadoras/` tem lógica própria embutida; o alvo é `PAGE_CONFIG` +
   `calculator-engine.js`, como nas páginas v4 da raiz (apgar.html etc.).
5. **Revisão de contraste página a página** — os tokens globais foram
   corrigidos; vale auditar usos pontuais de cores fora dos tokens.
6. **Unificar domínio canônico** — há referências mistas a
   `auditeduca.github.io`, `calculadoras-enfermagem.github.io` e
   `www.calculadorasdeenfermagem.com.br` (fora do ar). O `baseUrl` em
   `data/site.json` centraliza isso para os componentes; os metadados das
   páginas antigas ainda carregam os valores antigos.
