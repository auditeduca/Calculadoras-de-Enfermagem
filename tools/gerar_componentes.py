#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de componentes modulares (header-v4.html e footer-v4.html)
a partir da fonte única de verdade data/site.json.

Uso:
    python3 tools/gerar_componentes.py            # gera os componentes
    python3 tools/gerar_componentes.py --check    # só valida, não escreve

Regras:
- Valida data/site.json contra schema/site.schema.json (validação estrutural).
- Toda rota interna é verificada no disco: arquivo .html existente ou
  diretório com index.html. Rotas quebradas são EXCLUÍDAS do componente
  gerado e listadas em docs/relatorio-rotas.md.
- Links e imagens são emitidos como URLs absolutas baseadas em site.baseUrl,
  para funcionarem em qualquer profundidade de diretório.
- As classes e IDs do HTML gerado são compatíveis com assets/js/header-v4.js
  e assets/js/footer-v4.js (mega menu, abas, menu mobile, cookies).
"""

import json
import re
import sys
from html import escape
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PARTIALS = Path(__file__).resolve().parent / "partials"
ARQ_CONFIG = RAIZ / "data" / "site.json"
ARQ_SCHEMA = RAIZ / "schema" / "site.schema.json"
SAIDA_HEADER = RAIZ / "assets" / "components" / "header-v4.html"
SAIDA_FOOTER = RAIZ / "assets" / "components" / "footer-v4.html"
RELATORIO = RAIZ / "docs" / "relatorio-rotas.md"


# ---------------------------------------------------------------- validação

def validar_estrutura(cfg):
    """Validação estrutural mínima, alinhada ao schema (sem dependências)."""
    erros = []

    def exigir(obj, chave, tipo, ctx):
        if chave not in obj:
            erros.append(f"{ctx}: falta a chave obrigatória '{chave}'")
            return None
        if tipo is not None and not isinstance(obj[chave], tipo):
            erros.append(f"{ctx}.{chave}: tipo inválido (esperado {tipo.__name__})")
            return None
        return obj[chave]

    site = exigir(cfg, "site", dict, "raiz")
    if site is not None:
        for ch in ("name", "baseUrl", "logoHeader", "logoFooter", "version"):
            exigir(site, ch, str, "site")
        if isinstance(site.get("version"), str) and not re.fullmatch(r"\d+\.\d+\.\d+", site["version"]):
            erros.append("site.version deve usar três números, como 1.0.1")
        if isinstance(site.get("baseUrl"), str) and not site["baseUrl"].startswith("http"):
            erros.append("site.baseUrl deve começar com http(s)://")

    nav = exigir(cfg, "nav", list, "raiz")
    if nav is not None:
        for i, item in enumerate(nav):
            ctx = f"nav[{i}]"
            tipo = exigir(item, "type", str, ctx)
            exigir(item, "label", str, ctx)
            if tipo == "link":
                exigir(item, "href", str, ctx)
            elif tipo == "mega":
                exigir(item, "id", str, ctx)
                tabs = exigir(item, "tabs", list, ctx)
                for j, tab in enumerate(tabs or []):
                    tctx = f"{ctx}.tabs[{j}]"
                    exigir(tab, "id", str, tctx)
                    exigir(tab, "label", str, tctx)
                    links = exigir(tab, "links", list, tctx)
                    for k, ln in enumerate(links or []):
                        exigir(ln, "text", str, f"{tctx}.links[{k}]")
                        exigir(ln, "href", str, f"{tctx}.links[{k}]")
            else:
                erros.append(f"{ctx}.type: valor inválido '{tipo}'")

    idiomas = exigir(cfg, "languages", dict, "raiz")
    if idiomas is not None:
        exigir(idiomas, "default", str, "languages")
        grupos = exigir(idiomas, "groups", list, "languages")
        for g in grupos or []:
            for item in g.get("items", []):
                for ch in ("code", "label", "flag"):
                    exigir(item, ch, str, f"languages.groups[{g.get('id')}]")

    rodape = exigir(cfg, "footer", dict, "raiz")
    if rodape is not None:
        exigir(rodape, "columns", list, "footer")
        exigir(rodape, "legalLinks", list, "footer")
        exigir(rodape, "social", list, "footer")

    return erros


def rota_existe(href):
    """Verifica se uma rota interna existe no repositório."""
    if href.startswith(("http://", "https://", "#", "mailto:")):
        return True
    caminho = href.split("#", 1)[0].split("?", 1)[0]
    if not caminho:
        return True
    alvo = RAIZ / caminho
    if caminho.endswith("/"):
        return (alvo / "index.html").is_file()
    if alvo.is_file():
        return True
    return (alvo / "index.html").is_file()


# ----------------------------------------------------------------- helpers

def abs_url(base, rota):
    if rota.startswith(("http://", "https://", "#", "mailto:")):
        return rota
    return f"{base}/{rota.lstrip('/')}"


def ler_partial(nome):
    return (PARTIALS / nome).read_text(encoding="utf-8")


def absolutizar_hrefs(html, base):
    """Converte hrefs internos do partial para a URL absoluta do site."""
    marca = 'href="'
    partes = []
    resto = html
    while True:
        i = resto.find(marca)
        if i < 0:
            partes.append(resto)
            break
        fim = resto.find('"', i + len(marca))
        href = resto[i + len(marca):fim]
        partes.append(resto[:i] + f'href="{escape(abs_url(base, href))}"')
        resto = resto[fim + 1:]
    return "".join(partes)


def hrefs_internos(html):
    marca = 'href="'
    resto = html
    achados = []
    while True:
        i = resto.find(marca)
        if i < 0:
            break
        fim = resto.find('"', i + len(marca))
        achados.append(resto[i + len(marca):fim])
        resto = resto[fim + 1:]
    return achados


# ---------------------------------------------------------------- geração

def gerar_links(links, base, quebradas, indent=8):
    pad = " " * indent
    out = []
    for ln in links:
        if not rota_existe(ln["href"]):
            quebradas.append(ln)
            continue
        out.append(
            f'{pad}<li><a href="{escape(abs_url(base, ln["href"]))}">{escape(ln["text"])}</a></li>'
        )
    return "\n".join(out)


def gerar_mega_item(item, base, quebradas):
    mid = item["id"]
    label = escape(item["label"])
    triggers, contents = [], []
    for idx, tab in enumerate(item["tabs"]):
        ativo = " active" if idx == 0 else ""
        sel = "true" if idx == 0 else "false"
        triggers.append(
            f'<button type="button" class="menu-tab-trigger{ativo}" data-tab="{tab["id"]}" aria-selected="{sel}">{escape(tab["label"])}</button>'
        )
        links_html = gerar_links(tab["links"], base, quebradas)
        contents.append(
            f'<div class="tab-content{ativo}" id="tab-{tab["id"]}">\n'
            f'    <h3 class="mega-content-title">{escape(tab["label"])}</h3>\n'
            f'    <ul class="mega-content-links">\n{links_html}\n    </ul>\n'
            f"</div>"
        )
    promo = ""
    if item.get("promoImage"):
        promo = (
            '<aside class="panel-promo-area">\n'
            '    <div class="glowing-frame mega-image-frame">\n'
            '        <div class="frame-image-container mega-image-container">\n'
            f'            <img src="{escape(abs_url(base, item["promoImage"]))}" alt="{label}" loading="lazy" style="max-width: 100%; height: auto;">\n'
            "        </div>\n    </div>\n</aside>"
        )
    return f"""<li class="nav-item has-mega-menu">
    <button type="button" class="nav-link nav-link-dropdown" aria-expanded="false" aria-haspopup="true" data-menu="{mid}">{label}</button>
    <div class="mega-panel mega-panel-{mid}" id="mega-panel-{mid}" data-menu="{mid}">
        <div class="panel-standard-height">
            <aside class="panel-sidebar header-scroll">
                <nav class="menu-tabs" aria-label="Categorias de {label}">
                    {'''
                    '''.join(triggers)}
                </nav>
            </aside>
            <main class="panel-main-content header-scroll">
                {'''
                '''.join(contents)}
            </main>
            {promo}
        </div>
    </div>
</li>"""


def overlay_de_idioma(code):
    """Há tradução publicada só quando existe configs/i18n/<code>/*.json."""
    pasta = RAIZ / "configs" / "i18n" / str(code)
    return pasta.is_dir() and any(pasta.glob("*.json"))


def idiomas_publicaveis(idiomas):
    padrao = idiomas.get("default")
    grupos = []
    for grupo in idiomas.get("groups") or []:
        itens = [
            it for it in grupo.get("items") or []
            if it.get("code") == padrao or overlay_de_idioma(it.get("code"))
        ]
        if itens:
            novo = dict(grupo)
            novo["items"] = itens
            grupos.append(novo)
    saida = dict(idiomas)
    saida["groups"] = grupos
    return saida


def href_idioma(it, padrao, base):
    if it["code"] == padrao or not overlay_de_idioma(it["code"]):
        return abs_url(base, "index.html")
    return abs_url(base, f"{it['code']}/")


def gerar_idiomas_desktop(idiomas, base):
    idiomas = idiomas_publicaveis(idiomas)
    padrao = idiomas["default"]
    bandeira_padrao = None
    triggers, contents = [], []
    for gidx, grupo in enumerate(idiomas["groups"]):
        ativo = " active" if gidx == 0 else ""
        sel = "true" if gidx == 0 else "false"
        triggers.append(
            f'<button type="button" class="menu-tab-trigger{ativo}" data-tab="{grupo["id"]}" aria-selected="{sel}">{escape(grupo["label"])}</button>'
        )
        itens = []
        for it in grupo["items"]:
            if it["code"] == padrao:
                bandeira_padrao = it
            itens.append(
                f'<li>\n    <a href="{escape(href_idioma(it, padrao, base))}" data-lang="{escape(it["code"])}" hreflang="{escape(it["code"])}">\n'
                f'        <img src="{escape(abs_url(base, it["flag"]))}" alt="{escape(it["label"])}" class="idioma-flag-link">\n'
                f'        {escape(it["label"])}\n    </a>\n</li>'
            )
        contents.append(
            f'<div class="tab-content{ativo}" id="tab-{grupo["id"]}">\n'
            f'    <h3 class="mega-content-title">{escape(grupo["label"])}</h3>\n'
            f'    <ul class="mega-content-links idiomas-list">\n' + "\n".join(itens) + "\n    </ul>\n</div>"
        )
    promo = ""
    if idiomas.get("promoImage"):
        promo = (
            '<aside class="panel-promo-area">\n'
            '    <div class="glowing-frame mega-image-frame">\n'
            '        <div class="frame-image-container mega-image-container">\n'
            f'            <img src="{escape(abs_url(base, idiomas["promoImage"]))}" alt="Idiomas" loading="lazy" style="max-width: 100%; height: auto;">\n'
            "        </div>\n    </div>\n</aside>"
        )
    flag_img = ""
    if bandeira_padrao:
        flag_img = (
            f'<img src="{escape(abs_url(base, bandeira_padrao["flag"]))}" alt="{escape(bandeira_padrao["label"])}" '
            'class="active-lang-flag" id="active-lang-flag" loading="lazy" '
            'style="width: 24px; height: 18px; border-radius: 3px; vertical-align: middle;">'
        )
    return f"""<li class="nav-item has-mega-menu">
    <button type="button" class="nav-link nav-link-dropdown" aria-expanded="false" aria-haspopup="true" data-menu="idiomas" id="nav-idiomas">
        <i class="fas fa-globe" aria-hidden="true"></i>
        {flag_img}
    </button>
    <div class="mega-panel mega-panel-idiomas" id="mega-panel-idiomas" data-menu="idiomas">
        <div class="panel-standard-height">
            <aside class="panel-sidebar header-scroll">
                <nav class="menu-tabs" aria-label="Regiões de Idiomas">
                    {'''
                    '''.join(triggers)}
                </nav>
            </aside>
            <main class="panel-main-content header-scroll">
                {'''
                '''.join(contents)}
            </main>
            {promo}
        </div>
    </div>
</li>"""


def gerar_busca_desktop(base, logo):
    return f"""<li class="nav-item has-mega-menu">
    <button type="button" class="nav-link nav-link-dropdown" aria-expanded="false" aria-haspopup="true" data-menu="buscar">
        <i class="fas fa-search" aria-hidden="true"></i>
    </button>
    <div class="mega-panel mega-search-panel" id="mega-panel-buscar" data-menu="buscar">
        <div class="panel-standard-height">
            <aside class="panel-sidebar header-scroll">
                <nav class="menu-tabs" aria-label="Categorias de Busca">
                    <button type="button" class="menu-tab-trigger active" data-tab="buscar-site" aria-selected="true">Buscar no Site</button>
                </nav>
            </aside>
            <main class="panel-main-content search-main-content">
                <div class="search-container">
                    <h3 class="mega-content-title">Buscar no Site</h3>
                    <div class="search-box">
                        <input type="search" class="search-input" id="header-search-input" placeholder="Buscar no site..." aria-label="Buscar no site">
                        <button type="button" class="search-btn" id="header-search-btn" aria-label="Buscar">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </main>
            <aside class="panel-promo-area">
                <div class="glowing-frame mega-image-frame">
                    <div class="frame-image-container mega-image-container">
                        <img src="{escape(abs_url(base, logo))}" alt="Buscar" loading="lazy" style="max-width: 100%; height: auto;">
                    </div>
                </div>
            </aside>
        </div>
    </div>
</li>"""


def gerar_menu_mobile(cfg, base, quebradas):
    itens = []
    for item in cfg["nav"]:
        if item["type"] == "link":
            if not rota_existe(item["href"]):
                quebradas.append({"text": item["label"], "href": item["href"]})
                continue
            itens.append(
                f'<li class="mobile-nav-item">\n'
                f'    <a href="{escape(abs_url(base, item["href"]))}" class="mobile-nav-link">{escape(item["label"])}</a>\n</li>'
            )
            continue
        subs = []
        for tab in item["tabs"]:
            links = []
            for ln in tab["links"]:
                if not rota_existe(ln["href"]):
                    continue  # já registrado na passagem desktop
                links.append(f'<li><a href="{escape(abs_url(base, ln["href"]))}">{escape(ln["text"])}</a></li>')
            if not links:
                continue
            subs.append(
                '<li class="mobile-submenu-item has-mobile-submenu">\n'
                '    <button type="button" class="mobile-submenu-dropdown" aria-expanded="false">\n'
                f'        <span>{escape(tab["label"])}</span>\n'
                '        <span class="submenu-arrow"><i class="fas fa-chevron-down"></i></span>\n'
                "    </button>\n"
                '    <ul class="mobile-submenu level-3">\n' + "\n".join(links) + "\n    </ul>\n</li>"
            )
        itens.append(
            '<li class="mobile-nav-item has-mobile-submenu">\n'
            '    <button type="button" class="mobile-nav-link mobile-nav-dropdown" aria-expanded="false">\n'
            f'        <span>{escape(item["label"])}</span>\n'
            '        <span class="submenu-arrow"><i class="fas fa-chevron-down"></i></span>\n'
            "    </button>\n"
            '    <ul class="mobile-submenu">\n' + "\n".join(subs) + "\n    </ul>\n</li>"
        )
    return "\n".join(itens)


def gerar_idiomas_mobile(idiomas, base):
    idiomas = idiomas_publicaveis(idiomas)
    padrao = idiomas["default"]
    todos = [it for g in idiomas["groups"] for it in g["items"]]
    atual = next((it for it in todos if it["code"] == padrao), todos[0])
    flags = []
    for it in todos:
        ativo = " active" if it["code"] == padrao else ""
        flags.append(
            f'<a href="{escape(href_idioma(it, padrao, base))}" data-lang="{escape(it["code"])}" hreflang="{escape(it["code"])}" class="language-flag-item{ativo}" title="{escape(it["label"])}">\n'
            f'    <img src="{escape(abs_url(base, it["flag"]))}" alt="{escape(it["label"])}">\n</a>'
        )
    return f"""<div class="mobile-language-section" id="mobile-idiomas-section">
    <span class="mobile-language-label">Selecionar idioma</span>
    <button type="button" class="mobile-language-toggle" id="mobile-idiomas-toggle" aria-expanded="false">
        <span class="language-icon"><i class="fas fa-globe"></i></span>
        <span class="language-current" id="mobile-idiomas-current">
            <img src="{escape(abs_url(base, atual["flag"]))}" alt="{escape(atual["label"])}" style="width:20px;height:15px;border-radius:2px;margin-right:8px;vertical-align:middle">
            <span>{escape(atual["label"])}</span>
        </span>
        <span class="language-arrow"><i class="fas fa-chevron-down" id="mobile-idiomas-arrow"></i></span>
    </button>
    <div class="mobile-language-grid" id="mobile-idiomas-list" style="display:none">
{chr(10).join(flags)}
    </div>
</div>"""


def gerar_header(cfg, quebradas):
    base = cfg["site"]["baseUrl"].rstrip("/")
    logo = cfg["site"]["logoHeader"]
    nome = escape(cfg["site"]["name"])
    logo_url = escape(abs_url(base, logo))
    inicio = abs_url(base, "index.html")

    itens_nav = []
    for item in cfg["nav"]:
        if item["type"] == "link":
            if not rota_existe(item["href"]):
                quebradas.append({"text": item["label"], "href": item["href"]})
                continue
            itens_nav.append(
                '<li class="nav-item">\n'
                f'    <a href="{escape(abs_url(base, item["href"]))}" class="nav-link">{escape(item["label"])}</a>\n</li>'
            )
        else:
            itens_nav.append(gerar_mega_item(item, base, quebradas))
    itens_nav.append(gerar_idiomas_desktop(cfg["languages"], base))
    itens_nav.append(gerar_busca_desktop(base, logo))

    topbar = ler_partial("topbar-v4.html").rstrip()

    return f"""<!-- ============================================================
     COMPONENTE GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
     Fonte: data/site.json  |  Gerador: tools/gerar_componentes.py
     ============================================================ -->
{topbar}
<header class="main-header" id="main-header">
    <div class="header-container">
        <a href="{inicio}" class="site-logo" aria-label="{nome} - Página Inicial">
            <img src="{logo_url}" alt="{nome}" class="logo-image" style="height: 50px; width: auto;">
        </a>
        <nav class="main-nav" id="main-nav" aria-label="Navegação principal">
            <ul class="nav-list">
{chr(10).join(itens_nav)}
            </ul>
        </nav>
    </div>
</header>

<!-- Mobile Header -->
<div class="mobile-main-header">
    <div class="mobile-band-1">
        <div class="mobile-band-1-container">
            <div class="mobile-band-1-left">
                <div class="mobile-font-controls">
                    <button type="button" class="mobile-font-btn" id="mobile-font-reduce" aria-label="Reduzir fonte">
                        <span class="font-btn-icon">A-</span>
                    </button>
                    <button type="button" class="mobile-font-btn" id="mobile-font-increase" aria-label="Aumentar fonte">
                        <span class="font-btn-icon">A+</span>
                    </button>
                </div>
                <button type="button" class="mobile-theme-btn" id="mobile-theme-toggle" aria-label="Alternar tema">
                    <i class="fas fa-moon"></i>
                </button>
                <button type="button" class="mobile-animation-btn" id="mobile-animation-toggle" aria-label="Pausar animações" title="Pausar animações">
                    <i class="fas fa-pause"></i>
                </button>
            </div>
            <button type="button" class="mobile-search-btn" id="mobile-search-toggle" aria-label="Buscar">
                <i class="fas fa-search"></i>
            </button>
        </div>
    </div>
    <div class="mobile-band-2">
        <div class="mobile-band-2-container">
            <a href="{inicio}" class="mobile-header-logo">
                <img src="{logo_url}" alt="{nome}" style="height: 45px; width: auto;">
            </a>
            <button type="button" class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Abrir menu" aria-expanded="false">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </div>
    <div class="mobile-search-container" id="mobile-search-container">
        <div class="search-box">
            <input type="search" class="search-input" id="mobile-menu-search-input" placeholder="Buscar no site..." aria-label="Buscar no site">
            <button type="button" class="search-btn" id="mobile-search-submit" aria-label="Buscar">
                <i class="fas fa-search"></i>
            </button>
        </div>
    </div>
</div>

<div class="mobile-menu-overlay" id="mobile-menu-overlay"></div>
<nav class="mobile-menu" id="mobile-menu" aria-label="Menu mobile">
    <div class="mobile-menu-header">
        <a href="{inicio}" class="mobile-menu-logo-link" aria-label="{nome}">
            <img src="{logo_url}" alt="{nome}" class="mobile-menu-logo-image" style="height: 45px; width: auto;">
        </a>
        <button type="button" class="mobile-menu-close" id="mobile-menu-close" aria-label="Fechar menu">
            <span class="close-icon"><i class="fas fa-times"></i></span>
        </button>
    </div>
    <ul class="mobile-nav-list">
{gerar_menu_mobile(cfg, base, quebradas)}
    </ul>
{gerar_idiomas_mobile(cfg["languages"], base)}
</nav>
"""


def gerar_footer(cfg, quebradas):
    base = cfg["site"]["baseUrl"].rstrip("/")
    rodape = cfg["footer"]
    nome = escape(cfg["site"]["name"])
    logo_url = escape(abs_url(base, cfg["site"]["logoFooter"]))
    cookies = absolutizar_hrefs(ler_partial("cookies-v4.html"), base).rstrip()

    colunas = []
    for col in rodape["columns"]:
        links_html = gerar_links(col["links"], base, quebradas, indent=20)
        colunas.append(
            '            <div class="footer-section">\n'
            f'                <h3>{escape(col["title"])}</h3>\n'
            '                <ul class="footer-links">\n'
            f"{links_html}\n"
            "                </ul>\n"
            "            </div>"
        )

    compromisso = ""
    if rodape.get("commitment"):
        compromisso = (
            '            <div class="footer-section footer-brand-section">\n'
            f'                <h3>{escape(rodape["commitment"].get("title", ""))}</h3>\n'
            '                <p class="footer-tagline">\n'
            f'                    {escape(rodape["commitment"].get("text", ""))}\n'
            "                </p>\n"
            "            </div>"
        )

    legais = []
    for ln in rodape["legalLinks"]:
        if not rota_existe(ln["href"]):
            quebradas.append(ln)
            continue
        legais.append(
            f'                    <a href="{escape(abs_url(base, ln["href"]))}">{escape(ln["text"])}</a>'
        )

    sociais = []
    for s in rodape["social"]:
        sociais.append(
            f'                    <a href="{escape(s["url"])}" target="_blank" rel="noopener" aria-label="{escape(s["name"])}">\n'
            f'                        <i class="{escape(s["icon"])}"></i>\n'
            "                    </a>"
        )

    copyright_nome = escape(rodape.get("copyrightName", cfg["site"]["name"]))
    versao = escape(cfg["site"].get("version", ""))
    linha_versao = f"\n                <p>Versão {versao}</p>" if versao else ""

    return f"""<!-- ============================================================
     COMPONENTE GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
     Fonte: data/site.json  |  Gerador: tools/gerar_componentes.py
     ============================================================ -->
<!-- Sistema de Consentimento de Cookies -->
{cookies}
<!-- Main Footer Content -->
<div id="footer">
    <div class="footer-container">
        <div class="footer-header">
            <img src="{logo_url}"
                 alt="{nome}"
                 class="footer-main-logo"
                 style="max-height: 120px; width: auto;">
        </div>
        <div class="footer-main-divider"></div>
        <div class="footer-content">
{chr(10).join(colunas)}
{compromisso}
        </div>
        <div class="footer-bottom-divider"></div>
        <div class="footer-bottom">
            <div class="footer-copyright">
                <p>&copy; <span id="current-year">2026</span> {copyright_nome}. Todos os direitos reservados.</p>{linha_versao}
                <div class="footer-legal-links">
{chr(10).join(legais)}
                </div>
            </div>
            <div class="social-links-container">
                <span class="social-links-label">Siga-nos</span>
                <div class="social-links">
{chr(10).join(sociais)}
                </div>
            </div>
        </div>
    </div>
</div>
"""


def gerar_relatorio(quebradas):
    linhas = [
        "# Relatório de Rotas — Componentes Gerados",
        "",
        "Gerado por `tools/gerar_componentes.py` a partir de `data/site.json`.",
        "",
    ]
    if quebradas:
        linhas.append("## Rotas excluídas (alvo não existe no repositório)")
        linhas.append("")
        linhas.append("| Texto | Rota |")
        linhas.append("|---|---|")
        vistos = set()
        for ln in quebradas:
            chave = (ln["text"], ln["href"])
            if chave in vistos:
                continue
            vistos.add(chave)
            linhas.append(f"| {ln['text']} | `{ln['href']}` |")
    else:
        linhas.append("Todas as rotas declaradas em `data/site.json` existem no repositório. ✔")
    linhas.append("")
    return "\n".join(linhas)


def main():
    somente_checar = "--check" in sys.argv

    cfg = json.loads(ARQ_CONFIG.read_text(encoding="utf-8"))
    erros = validar_estrutura(cfg)
    if erros:
        print("ERROS de validação em data/site.json:")
        for e in erros:
            print(f"  - {e}")
        sys.exit(1)
    print("✔ data/site.json válido")

    quebradas = []
    header = gerar_header(cfg, quebradas)
    footer = gerar_footer(cfg, quebradas)

    if quebradas:
        print(f"⚠ {len(quebradas)} rota(s) excluída(s) por não existirem no repositório:")
        for ln in quebradas:
            print(f"  - {ln['text']}: {ln['href']}")

    if somente_checar:
        print("Modo --check: nada foi escrito.")
        sys.exit(1 if quebradas else 0)

    SAIDA_HEADER.write_text(header, encoding="utf-8")
    SAIDA_FOOTER.write_text(footer, encoding="utf-8")
    RELATORIO.parent.mkdir(exist_ok=True)
    RELATORIO.write_text(gerar_relatorio(quebradas), encoding="utf-8")
    print(f"✔ {SAIDA_HEADER.relative_to(RAIZ)} gerado")
    print(f"✔ {SAIDA_FOOTER.relative_to(RAIZ)} gerado")
    print(f"✔ {RELATORIO.relative_to(RAIZ)} gerado")


if __name__ == "__main__":
    main()
