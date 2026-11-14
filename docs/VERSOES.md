# Versões do site

A versão publicada fica em `data/site.json` (`site.version`) e aparece no rodapé.
O número usa três partes: mudança de molde, inclusão de páginas, correção.

## 1.1.0 — 14 de novembro de 2026

Áreas e modelos canônicos, no visual desta versão.

Revisão das branches de `IndiciumFIN/dev-chatgpt-workspace`. Entrou o que
serve a este site e cabe na casca atual:

- Entrar, com a autenticação desligada nesta origem.
- Conta do visitante, sem senha e sem prontuário.
- Área do assinante, que lista o catálogo publicado. O cálculo continua o da página pública.
- Modelos reutilizáveis de artigo, quiz, flashcard, caso e guia de bolso. Os blocos vêm do contrato; a página não inventa conteúdo clínico.
- SBAR como formulário local de passagem de plantão.

Ficou de fora, por não caber neste site ou por trazer outro desenho: tokens e HTML do CKO, as 19 línguas sem tradução própria, Supabase, bancos de questões, cardiologia, PMO, nota fiscal, área infantil e calculadoras trabalhistas sem página.

## 1.0.1 — 14 de novembro de 2026

Correções da auditoria de conclusão.

- O card de Termos aponta para `politica.html`.
- Objetivo descreve as 70 ferramentas em português, o mapa e a busca. Saiu a afirmação de 18 idiomas, biblioteca de provas, quiz, simulados, NANDA e passagem de plantão SBAR.
- Balanço hídrico, dimensionamento, gasometria, idade gestacional, gotejamento, heparina, IMC e medicamentos ganharam aba Referências.
- A documentação passa a descrever esta geração. O gerador Jinja e o pacote Next, que não publicam o site, saíram do repositório.

## 1.0.0 — 14 de novembro de 2026

Molde publicado em `main`, até o commit `0a98f98`.

- 70 ferramentas: 51 escores, 17 fórmulas e 2 funções nomeadas.
- Páginas institucionais, governança, reembolso, métricas, fórum e equipe editorial.
- Mapa do site, busca por tópico, cabeçalho e rodapé gerados de `data/site.json`.
- Idioma do menu: português. Outro idioma só entra com `configs/i18n/<idioma>/*.json`.
