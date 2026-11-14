#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador das páginas que não são calculadora.

Fonte editável: configs/conteudo/<id>.json e a navegação de data/site.json.
O layout visual das institucionais fica em templates/institucional/<id>.html,
com o miolo, o estilo e a faixa de imagens que a página já tinha. A casca
templates/pagina-casca.html continua sendo o único escritor do HTML final.

Uso:
    python3 tools/gerar_conteudo.py
    python3 tools/gerar_conteudo.py --check
"""

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIR_CONTEUDO = RAIZ / "configs" / "conteudo"
DIR_LAYOUT = RAIZ / "templates" / "institucional"
CASCA = RAIZ / "templates" / "pagina-casca.html"
MAIN_SIMPLES = "max-w-6xl mx-auto px-4 pt-8 pb-16"
MAIN_INSTITUCIONAL = "flex-grow max-w-7xl mx-auto px-4 py-8 md:py-12 w-full"
SITE = RAIZ / "data" / "site.json"

PERIODO = {"imediata": "Imediata (24h)", "semanal": "Semanal"}
TIPO = {"doenca": "Doença", "agravo": "Agravo", "evento": "Evento"}


def carregar_site():
    return json.loads(SITE.read_text(encoding="utf-8"))


def base_url():
    return carregar_site()["site"]["baseUrl"].rstrip("/")


def esc(valor):
    return (
        str(valor)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def configs():
    erros = []
    saida = {}
    if not DIR_CONTEUDO.is_dir():
        return saida, [f"pasta ausente: {DIR_CONTEUDO.relative_to(RAIZ)}"]
    for arq in sorted(DIR_CONTEUDO.glob("*.json")):
        cfg = json.loads(arq.read_text(encoding="utf-8"))
        pid = str(cfg.get("id", ""))
        if pid != arq.stem:
            erros.append(f"{arq.name}: id '{pid}' diferente do arquivo")
        if not cfg.get("title") or not cfg.get("description"):
            erros.append(f"{arq.name}: title e description são obrigatórios")
        saida[pid] = cfg
    return saida, erros


def destino(pid):
    return RAIZ / ("index.html" if pid == "index" else f"{pid}.html")


def rota(pid):
    return "index.html" if pid == "index" else f"{pid}.html"


def escrever(caminho, conteudo, somente_checar, divergencias):
    atual = caminho.read_text(encoding="utf-8") if caminho.is_file() else None
    if atual == conteudo:
        return
    divergencias.append(str(caminho.relative_to(RAIZ)))
    if not somente_checar:
        caminho.write_text(conteudo, encoding="utf-8")


def layout_de(pid):
    arq = DIR_LAYOUT / f"{pid}.html"
    if not arq.is_file():
        return None
    bruto = arq.read_text(encoding="utf-8")
    estilo, _, resto = bruto.partition("<!--CORPO-->")
    miolo, _, depois = resto.partition("<!--DEPOIS-->")
    return estilo.strip(), miolo.strip(), depois.strip()


def render_casca(cfg, corpo, extra="", head_extra="", depois="", main_class=MAIN_SIMPLES):
    site = carregar_site()["site"]
    canonical = f"{base_url()}/{rota(cfg['id'])}"
    if cfg["id"] == "index":
        canonical = base_url() + "/"
    og = base_url() + "/" + site["logoHeader"].lstrip("/")
    favicon = base_url() + "/" + site["favicon"].lstrip("/")
    modelo = CASCA.read_text(encoding="utf-8")
    troca = {
        "TITLE": esc(cfg["title"] if cfg["title"].endswith("Enfermagem") else cfg["title"] + " | Calculadoras de Enfermagem"),
        "DESCRIPTION": esc(cfg.get("description") or ""),
        "KEYWORDS": esc(cfg.get("keywords") or ""),
        "CANONICAL": esc(canonical),
        "OG_IMAGE": esc(og),
        "FAVICON": esc(favicon),
        "BODY": corpo,
        "EXTRA": extra,
        "HEAD_EXTRA": head_extra,
        "AFTER": depois,
        "MAIN_CLASS": main_class,
    }
    if cfg["id"] == "index":
        troca["TITLE"] = esc(cfg["title"])
    for chave, valor in troca.items():
        modelo = modelo.replace("{{" + chave + "}}", valor)
    return modelo


def render_secoes(secoes):
    blocos = []
    for secao in secoes or []:
        partes = []
        titulo = (secao.get("heading") or "").strip()
        if titulo:
            partes.append(
                f'<h2 class="text-2xl font-black text-nurse-primary dark:text-white mt-10 mb-3">{esc(titulo)}</h2>'
            )
        for paragrafo in secao.get("paragraphs") or []:
            partes.append(
                f'<p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{esc(paragrafo)}</p>'
            )
        itens = secao.get("items") or []
        if itens:
            lis = "\n".join(
                '<li class="flex gap-2"><span class="text-nurse-secondary" aria-hidden="true">•</span>'
                f"<span>{esc(item)}</span></li>"
                for item in itens
            )
            partes.append(f'<ul class="space-y-2 mb-4 text-slate-700 dark:text-slate-300">{lis}</ul>')
        if partes:
            blocos.append("\n".join(partes))
    return "\n".join(blocos)


def render_relacionados(cfg, existentes):
    cards = []
    for item in cfg.get("related") or []:
        href = item.get("href") or ""
        if href not in existentes:
            continue
        texto = f'<p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{esc(item.get("text") or "")}</p>' if item.get("text") else ""
        cards.append(
            f'<a href="{esc(href)}" class="block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">'
            f'<h3 class="font-bold text-nurse-primary dark:text-white">{esc(item.get("title") or href)}</h3>{texto}</a>'
        )
    if not cards:
        return ""
    return (
        '<section class="mt-12">'
        '<h2 class="text-xl font-black text-nurse-primary dark:text-white mb-4">Páginas relacionadas</h2>'
        f'<div class="grid md:grid-cols-3 gap-4">{"".join(cards)}</div></section>'
    )


def grupos_de(site, somente_id=None):
    grupos = []
    for item in site.get("nav") or []:
        if item.get("type") == "mega" and (somente_id is None or item.get("id") == somente_id):
            for aba in item.get("tabs") or []:
                grupos.append((aba.get("label") or item.get("label"), aba.get("links") or []))
        elif somente_id is None and item.get("type") == "link":
            grupos.append((item.get("label"), [{"text": item.get("label"), "href": item.get("href")}]))
    if somente_id is None:
        for coluna in site.get("footer", {}).get("columns") or []:
            grupos.append((coluna.get("title") or "Rodapé", coluna.get("links") or []))
        legais = site.get("footer", {}).get("legalLinks") or []
        if legais:
            grupos.append(("Informações legais", legais))
    return grupos


def render_diretorio(grupos):
    vistos = set()
    blocos = []
    for titulo, links in grupos:
        itens = []
        for link in links:
            href = link.get("href") or ""
            if not href or href in vistos:
                continue
            vistos.add(href)
            itens.append(
                f'<li><a class="text-nurse-secondary font-semibold hover:underline" href="{esc(href)}">{esc(link.get("text") or href)}</a></li>'
            )
        if not itens:
            continue
        blocos.append(
            f'<section class="mt-8"><h2 class="text-xl font-black text-nurse-primary dark:text-white mb-3">{esc(titulo)}</h2>'
            f'<ul class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{"".join(itens)}</ul></section>'
        )
    return "\n".join(blocos)


def render_notificacao(cfg):
    def botao(grupo, valor, rotulo, ativo=False):
        classe = "px-3 py-1 rounded-full border text-sm "
        classe += "bg-nurse-primary text-white border-nurse-primary" if ativo else "bg-white dark:bg-slate-900 border-slate-300"
        press = "true" if ativo else "false"
        return (
            f'<button type="button" class="{classe}" data-group="{grupo}" data-filter="{esc(valor)}" aria-pressed="{press}">{esc(rotulo)}</button>'
        )

    filtros = (
        '<div class="flex flex-wrap gap-2 mb-3"><span class="text-sm font-bold w-full">Período</span>'
        + botao("periodicity", "all", "Ambas", True)
        + botao("periodicity", "imediata", "Imediata (24h)")
        + botao("periodicity", "semanal", "Semanal")
        + '</div><div class="flex flex-wrap gap-2"><span class="text-sm font-bold w-full">Classificação</span>'
        + botao("type", "all", "Todas", True)
        + botao("type", "doenca", "Doença")
        + botao("type", "agravo", "Agravo")
        + botao("type", "evento", "Evento")
        + "</div>"
    )
    linhas = []
    for item in cfg.get("items") or []:
        nota = f'<div class="text-xs text-slate-500 mt-1">{esc(item.get("note"))}</div>' if item.get("note") else ""
        linhas.append(
            '<li class="p-4 rounded-xl border border-slate-200 dark:border-slate-700" '
            f'data-periodicity="{esc(item.get("periodicity"))}" data-type="{esc(item.get("type"))}">'
            '<div class="flex justify-between gap-4">'
            f'<div><h3 class="font-bold text-nurse-primary dark:text-white">{esc(item.get("name"))}</h3>'
            f'<p class="text-sm text-slate-500 mt-1">{esc(item.get("detail") or "")}</p></div>'
            f'<div class="text-right"><span class="text-xs font-bold uppercase text-nurse-secondary">{esc(PERIODO.get(item.get("periodicity"), item.get("periodicity")))}</span>'
            f'{nota}</div></div></li>'
        )
    caminhos = []
    for estado in cfg.get("states") or []:
        caminhos.append(
            f'<path id="{esc(estado["id"])}" title="{esc(estado["title"])}" class="state" '
            f'd="{esc(estado["d"])}" fill="#cbd5e1" stroke="#ffffff" stroke-width="1"/>'
        )
    return f"""<section data-notif class="mb-10">
  <div class="grid lg:grid-cols-5 gap-6">
    <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
      <h2 class="text-sm font-bold uppercase tracking-wide text-nurse-secondary mb-3">Local</h2>
      <p class="text-sm mb-3">Seleção: <strong data-notif-local>Nacional</strong></p>
      <svg viewBox="0 0 600 600" class="w-full h-auto" role="img" aria-label="Mapa do Brasil">{''.join(caminhos)}</svg>
      <button type="button" data-notif-limpar class="mt-3 text-sm font-bold text-nurse-secondary">Limpar filtros</button>
    </div>
    <div class="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
      <label class="block text-sm font-bold mb-2" for="notif-busca">Buscar doença, agravo ou CID</label>
      <input id="notif-busca" data-notif-busca type="search" class="w-full mb-4 px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-950"/>
      {filtros}
      <ul data-notif-lista class="mt-4 space-y-2 max-h-[520px] overflow-y-auto">{''.join(linhas)}</ul>
      <p data-notif-vazio class="hidden mt-4 text-slate-500">Nenhuma notificação encontrada para os filtros.</p>
    </div>
  </div>
</section>"""


def corpo(cfg, site, paginas):
    miolo = [
        '<nav class="text-sm text-slate-500 mb-4" aria-label="Trilha">'
        f'<a class="hover:underline" href="index.html">Início</a>'
        + ("" if cfg["id"] == "index" else f' <span aria-hidden="true">&gt;</span> <span>{esc(cfg["title"])}</span>')
        + "</nav>",
        f'<h1 class="text-3xl md:text-4xl font-black text-nurse-primary dark:text-white font-nunito">{esc(cfg["title"])}</h1>',
    ]
    if cfg.get("lead"):
        miolo.append(f'<p class="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-3xl">{esc(cfg["lead"])}</p>')
    tipo = cfg.get("kind") or "pagina"
    if tipo == "inicio":
        miolo.append(render_diretorio(grupos_de(site, "ferramentas")))
        miolo.append(
            '<p class="mt-8"><a class="font-bold text-nurse-secondary hover:underline" href="mapa-do-site.html">Ver o mapa do site</a></p>'
        )
    elif tipo == "mapa":
        miolo.append(render_diretorio(grupos_de(site)))
    elif tipo == "notificacao":
        miolo.append(render_notificacao(cfg))
    miolo.append(render_secoes(cfg.get("sections")))
    miolo.append(render_relacionados(cfg, paginas))
    return "\n".join(parte for parte in miolo if parte)


def extra(cfg):
    if cfg.get("kind") == "notificacao":
        return '  <script src="js/notificacao.js" defer></script>\n'
    return ""


def gerar(somente_checar=False):
    paginas, erros = configs()
    if erros:
        return erros
    site = carregar_site()
    existentes = {rota(pid) for pid in paginas}
    divergencias = []
    for pid, cfg in paginas.items():
        layout = layout_de(pid)
        if layout:
            estilo, miolo, depois = layout
            html = render_casca(
                cfg, miolo, extra(cfg), estilo, depois, MAIN_INSTITUCIONAL
            )
        else:
            html = render_casca(cfg, corpo(cfg, site, existentes), extra(cfg))
        escrever(destino(pid), html, somente_checar, divergencias)
    return divergencias


def main():
    checar = "--check" in sys.argv
    falhas = gerar(somente_checar=checar)
    if falhas and any(not f.endswith(".html") for f in falhas):
        # erros de config não têm sufixo de página gerada apenas quando são mensagens
        pass
    erros = [f for f in falhas if ":" in f and not f.endswith(".html")]
    divergencias = [f for f in falhas if f not in erros]
    if erros:
        for erro in erros:
            print(f"ERRO {erro}")
        sys.exit(1)
    if checar and divergencias:
        print("Fora de sincronia:")
        for item in divergencias:
            print(f"  - {item}")
        sys.exit(1)
    if checar:
        print("Páginas de conteúdo sincronizadas.")
    else:
        print(f"✔ {len(list(DIR_CONTEUDO.glob('*.json')))} páginas de conteúdo")
        if divergencias:
            for item in divergencias:
                print(f"  escreveu {item}")


if __name__ == "__main__":
    main()
