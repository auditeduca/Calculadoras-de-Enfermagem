# Calculadoras de Enfermagem — versão 1.1.0

Site estático. A versão corrente e o histórico estão em `docs/VERSOES.md`.
O número também fica em `data/site.json` e no rodapé.

## O que se edita

| Fonte | Gera |
|---|---|
| `data/site.json` | `assets/components/header-v4.html` e `footer-v4.html` |
| `configs/paginas/<id>.json` | casca em `calculadoras/<id>/` e o atalho `<id>.html` |
| `configs/conteudo/<id>.json` e `templates/institucional/<id>.html` | página na raiz |
| `configs/i18n/<idioma>/<id>.json` | página daquele idioma, quando o arquivo existir |

Comandos:

```bash
python3 tools/gerar_componentes.py
python3 tools/gerar_paginas.py
python3 tools/gerar_conteudo.py
python3 tools/auditar.py
```

`tools/auditar.py` falha se uma rota do menu, do rodapé, do aviso de cookies ou do corpo das páginas não existir, se uma ferramenta não tiver aba Referências, ou se a casca divergir da fonte.

## O que está publicado

- 70 ferramentas no menu Ferramentas, mais o SBAR.
- Páginas institucionais, mapa e busca por tópico.
- Entrar, conta e área do assinante. A autenticação desta origem está desligada.
- Modelos de artigo, quiz, flashcard, caso e guia de bolso em `configs/conteudo/modelo-*.json`.
- Menu de idioma só com português, até haver tradução em `configs/i18n`.

`js/calculadora.js` lê o JSON da ferramenta. Os modos são `score`, `formula` e `named` (gasometria e idade gestacional).
