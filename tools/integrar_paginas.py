#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Integrador de componentes modulares nas páginas do site.

Varre todos os .html do repositório e garante que cada página de conteúdo
tenha o carregador de módulos (module-loader-v5.js), que injeta topo de
acessibilidade, cabeçalho com rotas e rodapé oficiais.

Uso:
    python3 tools/integrar_paginas.py --check   # só relatório, não escreve
    python3 tools/integrar_paginas.py           # aplica a integração

Regras:
- Página de conteúdo = arquivo com </head> e <body (documento completo).
- Páginas que já têm #header-container (sistema v4 próprio) ou que já
  referenciam module-loader-v5.js são deixadas como estão.
- Fragmentos (sidebars, modais, seções) e pastas de infraestrutura são
  ignorados.
"""

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

PASTAS_IGNORADAS = {
    "assets", "components", "template", "templates", "sidebars",
    "dist", "tools", "node_modules", "core", "data", "configs",
    "schema", "docs", ".git", "pages", "styles", "js",
    "Calculadoras-de-Enfermagem",
}

ARQUIVOS_IGNORADOS_PREFIXO = (
    "sidebar-", "author-section", "modal-generic", "teste",
)

LOADER = "module-loader-v5.js"


def paginas_alvo():
    for arq in sorted(RAIZ.rglob("*.html")):
        rel = arq.relative_to(RAIZ)
        if any(parte in PASTAS_IGNORADAS for parte in rel.parts[:-1]):
            continue
        if rel.name.startswith(ARQUIVOS_IGNORADOS_PREFIXO):
            continue
        yield arq, rel


def caminho_relativo_loader(rel):
    profundidade = len(rel.parts) - 1
    prefixo = "../" * profundidade if profundidade else "./"
    return f"{prefixo}assets/js/{LOADER}"


def integrar(conteudo, rel):
    tag = f'  <script src="{caminho_relativo_loader(rel)}" defer></script>\n'
    m = re.search(r"</head>", conteudo, flags=re.IGNORECASE)
    if not m:
        return None
    pos = m.start()
    return conteudo[:pos] + tag + conteudo[pos:]


def main():
    somente_checar = "--check" in sys.argv
    integradas, ja_ok, fragmentos = [], [], []

    for arq, rel in paginas_alvo():
        conteudo = arq.read_text(encoding="utf-8", errors="replace")
        if "</head>" not in conteudo.lower() or "<body" not in conteudo.lower():
            fragmentos.append(str(rel))
            continue
        if "header-container" in conteudo or LOADER in conteudo:
            ja_ok.append(str(rel))
            continue
        novo = integrar(conteudo, rel)
        if novo is None:
            fragmentos.append(str(rel))
            continue
        integradas.append(str(rel))
        if not somente_checar:
            arq.write_text(novo, encoding="utf-8")

    print(f"Páginas já integradas (mantidas): {len(ja_ok)}")
    print(f"Fragmentos/ignoradas: {len(fragmentos)}")
    acao = "a integrar" if somente_checar else "integradas agora"
    print(f"Páginas {acao}: {len(integradas)}")
    for p in integradas:
        print(f"  + {p}")


if __name__ == "__main__":
    main()
