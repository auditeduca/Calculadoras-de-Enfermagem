#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agente auditor do site (somente leitura).

Executa verificações determinísticas e escreve docs/relatorio-auditoria.md.
Sai com código 1 se houver falhas bloqueantes (schemas inválidos, rotas
quebradas ou páginas fora de sincronia com suas fontes JSON).

Verificações:
  1. data/site.json válido e todas as rotas existentes no disco.
  2. configs/paginas/*.json válidos e páginas raiz sincronizadas (round-trip).
  3. Páginas de calculadoras/ com CALCULATOR_DATA corrompida (campos de
     formulário de comentários/newsletter em vez de campos clínicos).
  4. Arquivos órfãos: html/css/js/json não referenciados por nenhuma página
     ou script (candidatos a expurgo — apenas relatório, nada é removido).

Uso:
    python3 tools/auditar.py
"""

import json
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
RELATORIO = RAIZ / "docs" / "relatorio-auditoria.md"

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gerar_componentes  # noqa: E402
import gerar_conteudo  # noqa: E402
import gerar_paginas  # noqa: E402

PASTAS_FORA_DO_SITE = {".git", "node_modules", "tools", "docs", "schema", "templates", ".cursor"}
MARCAS_CONFIG_CORROMPIDA = ('"id": "company"', '"id": "comment-name"', '"newsletterConsent"')


def check_site_json():
    falhas = []
    cfg = json.loads((RAIZ / "data" / "site.json").read_text(encoding="utf-8"))
    falhas.extend(gerar_componentes.validar_estrutura(cfg))
    quebradas = []

    def varrer_links(links):
        for ln in links:
            if not gerar_componentes.rota_existe(ln["href"]):
                quebradas.append(f"{ln['text']}: {ln['href']}")

    for item in cfg.get("nav", []):
        if item.get("type") == "link":
            if not gerar_componentes.rota_existe(item.get("href", "")):
                quebradas.append(f"{item['label']}: {item.get('href')}")
        for tab in item.get("tabs", []) or []:
            varrer_links(tab.get("links", []))
    for col in cfg.get("footer", {}).get("columns", []):
        varrer_links(col.get("links", []))
    varrer_links(cfg.get("footer", {}).get("legalLinks", []))
    return falhas, quebradas


def check_paginas():
    falhas, _ = [], []
    _validas, erros = gerar_paginas.configs_validas()
    falhas.extend(erros)
    dessinc = [] if erros else gerar_paginas.gerar(somente_checar=True)
    falhas_conteudo = gerar_conteudo.gerar(somente_checar=True)
    conteudo_erros = [f for f in falhas_conteudo if not f.endswith(".html")]
    conteudo_dessinc = [f for f in falhas_conteudo if f.endswith(".html")]
    falhas.extend(conteudo_erros)
    dessinc.extend(conteudo_dessinc)
    return falhas, dessinc


def fila_revisao():
    publicados = {p.stem for p in gerar_paginas.DIR_CONFIGS.glob("*.json")}
    fila = []
    for pasta in sorted((RAIZ / "calculadoras").iterdir()):
        if not pasta.is_dir() or pasta.name in publicados or pasta.name == "estrutura":
            continue
        if (pasta / "index.html").is_file():
            fila.append(pasta.name)
    return fila


def check_lixo_clinico():
    restos = []
    for arq in sorted(RAIZ.glob("calculadoras/*/index.html")):
        texto = arq.read_text(encoding="utf-8", errors="replace")
        if "CALCULATOR_DATA" in texto or any(marca in texto for marca in MARCAS_CONFIG_CORROMPIDA):
            restos.append(str(arq.relative_to(RAIZ)))
    return restos


def check_orfaos():
    """Arquivos html/css/js/json cujo nome não aparece em nenhum outro arquivo."""
    candidatos = []
    for arq in sorted(RAIZ.rglob("*")):
        if not arq.is_file() or arq.suffix not in {".html", ".css", ".js", ".json"}:
            continue
        rel = arq.relative_to(RAIZ)
        if any(p in PASTAS_FORA_DO_SITE for p in rel.parts):
            continue
        if rel.parts[0] == "configs" or rel.name in ("site.json", "package.json", "package-lock.json"):
            continue  # fontes de dados têm consumidores via tools/
        if rel.name == "index.html":
            continue  # alcançável pela URL do diretório
        if rel.parts == (rel.name,) and rel.suffix == ".html":
            texto = arq.read_text(encoding="utf-8", errors="replace")
            if 'url=calculadoras/' in texto and "http-equiv=\"refresh\"" in texto:
                continue  # apelido gerado da calculadora; a URL canônica é a pasta
        candidatos.append((arq, rel))

    orfaos = []
    for arq, rel in candidatos:
        nome = re.escape(arq.name)
        res = subprocess.run(
            ["grep", "-rl", "--include=*.html", "--include=*.js", "--include=*.css",
             "--include=*.tsx", "--include=*.py", "--exclude-dir=.git",
             "--exclude-dir=node_modules", "--exclude-dir=docs", nome, str(RAIZ)],
            capture_output=True, text=True,
        )
        referencias = [l for l in res.stdout.splitlines() if Path(l) != arq]
        if not referencias:
            orfaos.append(str(rel))
    return orfaos


def main():
    falhas_site, rotas_quebradas = check_site_json()
    falhas_paginas, dessinc = check_paginas()
    fila = fila_revisao()
    lixo = check_lixo_clinico()
    orfaos = check_orfaos()

    bloqueantes = falhas_site + falhas_paginas + rotas_quebradas + dessinc + lixo

    linhas = [
        "# Relatório de Auditoria",
        "",
        "Gerado por `tools/auditar.py`. Somente leitura — nada foi alterado.",
        "",
        "## 1. Fontes JSON e sincronismo",
        "",
        f"- `data/site.json`: {'OK' if not falhas_site else 'FALHAS: ' + '; '.join(falhas_site)}",
        f"- Rotas do menu/rodapé: {'todas existem' if not rotas_quebradas else 'QUEBRADAS: ' + '; '.join(rotas_quebradas)}",
        f"- `configs/paginas/*.json`: {'OK' if not falhas_paginas else 'FALHAS: ' + '; '.join(falhas_paginas)}",
        f"- Cascas geradas sincronizadas: {'sim' if not dessinc else 'NÃO: ' + ', '.join(dessinc)}",
        f"- Páginas ainda com CALCULATOR_DATA ou campo de scraping: {'nenhuma' if not lixo else ', '.join(lixo)}",
        "",
        f"## 2. Fila de revisão clínica ({len(fila)})",
        "",
        "Estas pastas não têm `configs/paginas/<id>.json` que passe na trava.",
        "O gerador publica só o aviso de revisão e o menu não aponta para elas.",
        "",
    ]
    linhas += [f"- `{p}`" for p in fila] or ["- nenhuma"]
    linhas += [
        "",
        f"## 3. Arquivos órfãos — candidatos a expurgo ({len(orfaos)})",
        "",
        "Nenhum outro arquivo do site referencia estes caminhos. Candidatos a",
        "remoção após conferência manual:",
        "",
    ]
    linhas += [f"- `{p}`" for p in orfaos] or ["- nenhum"]
    linhas.append("")

    RELATORIO.write_text("\n".join(linhas), encoding="utf-8")
    print(f"Relatório: {RELATORIO.relative_to(RAIZ)}")
    print(f"Fila de revisão clínica: {len(fila)}")
    print(f"Órfãos: {len(orfaos)}")
    if bloqueantes:
        print(f"FALHAS BLOQUEANTES: {len(bloqueantes)}")
        sys.exit(1)
    print("Sem falhas bloqueantes.")


if __name__ == "__main__":
    main()
