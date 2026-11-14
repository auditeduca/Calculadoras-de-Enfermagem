#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador determinístico das calculadoras.

Fonte editável: configs/paginas/<id>.json e, quando houver tradução real,
configs/i18n/<lang>/<id>.json. Este script é o único escritor de:

  calculadoras/<id>/index.html   casca da ferramenta
  <id>.html                      redirecionamento para a URL canônica
  <lang>/<id>.html               casca do idioma, só se o overlay existir
  calculadoras/<id>/index.html   aviso de revisão, quando não há config válida

Uso:
    python3 tools/gerar_paginas.py
    python3 tools/gerar_paginas.py --check
    python3 tools/gerar_paginas.py --i18n-extrair
"""

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIR_CONFIGS = RAIZ / "configs" / "paginas"
DIR_I18N = RAIZ / "configs" / "i18n"
CASCA = RAIZ / "templates" / "calculadora-casca.html"
SITE = RAIZ / "data" / "site.json"

NOMEADAS = {"gasometria", "gestacional"}
IDS_PROIBIDOS = {"company", "comment-name", "comment-text", "newsletterConsent"}
LANGS = [
    "ar_eg", "de", "en", "es", "fr", "id", "in", "it", "ja", "ko",
    "nl", "pl", "pt", "ru", "sv", "tr", "uk", "vi", "zh_cn",
]
CHAVES_URL = {"canonical", "ogImage", "image", "url", "href", "screenshot"}
CHAVES_TEXTO = {
    "title", "description", "label", "text", "body", "conduct",
    "placeholder", "tooltip", "keywords", "badge", "message",
}
PADRAO_CONFIG = re.compile(r'window\.PAGE_CONFIG = "(.*)";')


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


def campos(cfg):
    saida = []
    for sec in cfg.get("form", {}).get("sections", []):
        saida.extend(sec.get("fields") or [])
    return saida


def _prim(tokens, env_nomes):
    if not tokens:
        raise ValueError("expressão incompleta")
    tok = tokens.pop(0)
    if tok == "(":
        val = _soma(tokens, env_nomes)
        if not tokens or tokens.pop(0) != ")":
            raise ValueError("parêntese não fechado")
        return val
    if tok in "+-":
        val = _prim(tokens, env_nomes)
        return val
    if re.fullmatch(r"\d+(?:\.\d+)?", tok):
        return tok
    if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", tok):
        if tok not in env_nomes:
            raise ValueError(f"identificador desconhecido: {tok}")
        return tok
    raise ValueError(f"token inválido: {tok}")


def _prod(tokens, env_nomes):
    _prim(tokens, env_nomes)
    while tokens and tokens[0] in "*/":
        tokens.pop(0)
        _prim(tokens, env_nomes)


def _soma(tokens, env_nomes):
    _prod(tokens, env_nomes)
    while tokens and tokens[0] in "+-":
        tokens.pop(0)
        _prod(tokens, env_nomes)


def tokenizar(expr):
    return re.findall(r"[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|[()+\-*/]", expr.replace(" ", ""))


def validar_formula(formula, ids, modo):
    erros = []
    if modo == "named":
        if formula not in NOMEADAS:
            erros.append(f"função nomeada desconhecida: {formula}")
        return erros
    if modo == "score":
        if formula.strip() not in {"total = score", "score"}:
            erros.append("modo score aceita apenas 'total = score'")
        return erros
    conhecidos = set(ids) | {"score"}
    for parte in formula.split(";"):
        trecho = parte.strip()
        if not trecho:
            continue
        if "=" not in trecho:
            erros.append(f"atribuição ausente em '{trecho}'")
            continue
        nome, expr = [p.strip() for p in trecho.split("=", 1)]
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", nome):
            erros.append(f"nome inválido: {nome}")
            continue
        tokens = tokenizar(expr)
        bruto = expr.replace(" ", "")
        if "".join(tokens) != bruto:
            erros.append(f"expressão contém símbolo fora de + - * / ( ): {expr}")
            continue
        try:
            copia = list(tokens)
            _soma(copia, conhecidos)
            if copia:
                erros.append(f"sobra na expressão: {expr}")
        except ValueError as exc:
            erros.append(f"{expr}: {exc}")
        conhecidos.add(nome)
    return erros


def trava_clinica(cfg, origem):
    """Regras que decidem se a calculadora pode ser publicada."""
    erros = []
    for chave in ("metadata", "seo", "header", "form", "calculation", "tabs"):
        if chave not in cfg:
            erros.append(f"{origem}: falta '{chave}'")
    meta = cfg.get("metadata") or {}
    if not re.fullmatch(r"[a-z0-9-]+", str(meta.get("id", ""))):
        erros.append(f"{origem}: metadata.id inválido")
    calc = cfg.get("calculation") or {}
    modo = calc.get("mode")
    if modo not in ("formula", "score", "named"):
        erros.append(f"{origem}: calculation.mode inválido")
    interp = calc.get("interpretation")
    if not isinstance(interp, list) or not interp:
        erros.append(f"{origem}: interpretation vazio")
    ids = []
    for campo in campos(cfg):
        cid = str(campo.get("id", ""))
        ids.append(cid)
        if cid in IDS_PROIBIDOS or cid.startswith("comment"):
            erros.append(f"{origem}: campo proibido '{cid}'")
        if modo == "score" and campo.get("type") == "select":
            opcoes = campo.get("options") or []
            scores = [o.get("score") for o in opcoes if isinstance(o, dict)]
            if not opcoes or any(not isinstance(s, (int, float)) for s in scores):
                erros.append(f"{origem}: opção sem score numérico em '{cid}'")
            elif not any(s != 0 for s in scores):
                erros.append(f"{origem}: '{cid}' só tem score zero")
        if modo == "formula" and campo.get("type") == "select" and cid in str(calc.get("formula", "")):
            for opt in campo.get("options") or []:
                valor = opt.get("value") if isinstance(opt, dict) else None
                if isinstance(valor, bool) or not isinstance(valor, (int, float)):
                    if not (isinstance(valor, str) and re.fullmatch(r"-?\d+(?:\.\d+)?", valor)):
                        erros.append(f"{origem}: opção não numérica em '{cid}'")
    if modo:
        erros.extend(f"{origem}: {e}" for e in validar_formula(str(calc.get("formula", "")), ids, modo))
    if not cfg.get("tabs"):
        erros.append(f"{origem}: tabs vazio")
    return erros


def html_lang(pasta):
    if pasta in (None, "", "pt", "pt-br"):
        return "pt-br"
    return pasta.replace("_", "-")


def render_casca(cfg, prefix, i18n_url, hreflang, html_lang_code):
    seo = cfg.get("seo") or {}
    modelo = CASCA.read_text(encoding="utf-8")
    troca = {
        "HTML_LANG": html_lang_code,
        "TITLE": esc(seo.get("title") or cfg["metadata"]["title"]),
        "DESCRIPTION": esc(seo.get("description") or ""),
        "KEYWORDS": esc(seo.get("keywords") or ""),
        "CANONICAL": esc(seo.get("canonical") or ""),
        "HREFLANG": hreflang,
        "OG_IMAGE": esc(seo.get("ogImage") or ""),
        "OG_LOCALE": esc(seo.get("ogLocale") or "pt_BR"),
        "FAVICON": esc(carregar_site()["site"]["favicon"] if False else seo.get("ogImage") or ""),
        "PREFIX": prefix,
        "CALC_ID": esc(cfg["metadata"]["id"]),
        "CONFIG_URL": esc(f"{prefix}configs/paginas/{cfg['metadata']['id']}.json"),
        "I18N_URL": esc(i18n_url),
    }
    # Favicon oficial do site, não a imagem de OG.
    site = carregar_site()
    favicon = site["site"]["baseUrl"].rstrip("/") + "/" + site["site"]["favicon"].lstrip("/")
    troca["FAVICON"] = esc(favicon)
    for chave, valor in troca.items():
        modelo = modelo.replace("{{" + chave + "}}", valor)
    return modelo


def render_redirect(pid, titulo):
    destino = f"calculadoras/{pid}/"
    return (
        "<!DOCTYPE html>\n"
        f'<html lang="pt-br"><head><meta charset="utf-8"/>'
        f'<title>{esc(titulo)}</title>'
        f'<link rel="canonical" href="{esc(base_url() + "/" + destino)}"/>'
        f'<meta http-equiv="refresh" content="0; url={destino}"/>'
        f'<script>location.replace("{destino}")</script>'
        f'</head><body><p><a href="{destino}">{esc(titulo)}</a></p></body></html>\n'
    )


def render_revisao(pid):
    return f"""<!DOCTYPE html>
<!-- gerado por tools/gerar_paginas.py — não editar à mão -->
<html lang="pt-br">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="robots" content="noindex"/>
  <title>Em revisão clínica | Calculadoras de Enfermagem</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="../../assets/js/module-loader-v5.js" defer></script>
</head>
<body class="bg-slate-50 text-slate-800">
  <div id="accessibility-container"></div>
  <div id="header-container" class="min-h-[70px]"></div>
  <main class="max-w-2xl mx-auto px-4 py-16">
    <h1 class="text-2xl font-black text-slate-900">Ferramenta em revisão clínica</h1>
    <p class="mt-4 leading-relaxed">A calculadora <strong>{esc(pid)}</strong> deixa de ser publicada enquanto não houver uma configuração clínica válida em <code>configs/paginas/{esc(pid)}.json</code>. O conteúdo anterior misturava campos de formulário que não calculam o escore.</p>
  </main>
  <div id="footer-container"></div>
</body>
</html>
"""


def configs_validas():
    erros = []
    validas = {}
    if not DIR_CONFIGS.is_dir():
        return validas, [f"pasta ausente: {DIR_CONFIGS}"]
    for arq in sorted(DIR_CONFIGS.glob("*.json")):
        cfg = json.loads(arq.read_text(encoding="utf-8"))
        falhas = trava_clinica(cfg, str(arq.relative_to(RAIZ)))
        if falhas:
            erros.extend(falhas)
        else:
            validas[cfg["metadata"]["id"]] = cfg
    return validas, erros


def bloco_hreflang(pid, langs_com_overlay):
    base = base_url()
    linhas = [
        f'<link rel="alternate" hreflang="pt-br" href="{base}/calculadoras/{pid}/"/>',
        f'<link rel="alternate" hreflang="x-default" href="{base}/calculadoras/{pid}/"/>',
    ]
    for lang in langs_com_overlay:
        linhas.append(
            f'<link rel="alternate" hreflang="{html_lang(lang)}" href="{base}/{lang}/{pid}.html"/>'
        )
    return "\n  ".join(linhas)


def overlays_de(pid):
    achados = []
    if not DIR_I18N.is_dir():
        return achados
    for lang in LANGS:
        if (DIR_I18N / lang / f"{pid}.json").is_file():
            achados.append(lang)
    return achados


def aplicar_overlay(cfg, lang):
    caminho = DIR_I18N / lang / f"{cfg['metadata']['id']}.json"
    if not caminho.is_file():
        return cfg
    overlay = json.loads(caminho.read_text(encoding="utf-8"))

    def juntar(base, extra):
        if isinstance(base, dict) and isinstance(extra, dict):
            saida = dict(base)
            for k, v in extra.items():
                saida[k] = juntar(base.get(k), v) if k in base else v
            return saida
        if isinstance(base, list) and isinstance(extra, list):
            return [juntar(b, e) if e is not None else b for b, e in zip(base, extra)] + base[len(extra):]
        return extra if extra is not None else base

    return juntar(cfg, overlay)


def escrever(caminho, conteudo, somente_checar, divergencias):
    atual = caminho.read_text(encoding="utf-8") if caminho.is_file() else None
    if atual == conteudo:
        return
    divergencias.append(str(caminho.relative_to(RAIZ)))
    if not somente_checar:
        caminho.parent.mkdir(parents=True, exist_ok=True)
        caminho.write_text(conteudo, encoding="utf-8")


def gerar(somente_checar=False):
    validas, erros = configs_validas()
    if erros:
        for e in erros:
            print(f"ERRO {e}")
        return erros
    divergencias = []
    ids_publicados = set(validas)
    for pid, cfg in validas.items():
        langs = overlays_de(pid)
        hreflang = bloco_hreflang(pid, langs)
        canonical = f"{base_url()}/calculadoras/{pid}/"
        cfg = json.loads(json.dumps(cfg))
        cfg.setdefault("seo", {})["canonical"] = canonical
        casca = render_casca(cfg, "../../", "", hreflang, "pt-br")
        escrever(RAIZ / "calculadoras" / pid / "index.html", casca, somente_checar, divergencias)
        escrever(RAIZ / f"{pid}.html", render_redirect(pid, cfg["header"]["title"]), somente_checar, divergencias)
        for lang in langs:
            local = aplicar_overlay(cfg, lang)
            local.setdefault("seo", {})["canonical"] = f"{base_url()}/{lang}/{pid}.html"
            pagina = render_casca(
                local,
                "../",
                f"../configs/i18n/{lang}/{pid}.json",
                hreflang,
                html_lang(lang),
            )
            escrever(RAIZ / lang / f"{pid}.html", pagina, somente_checar, divergencias)

    for pasta in sorted(p for p in (RAIZ / "calculadoras").iterdir() if p.is_dir()):
        if pasta.name in ids_publicados or pasta.name == "estrutura":
            continue
        indice = pasta / "index.html"
        if not indice.exists() and somente_checar:
            continue
        escrever(indice, render_revisao(pasta.name), somente_checar, divergencias)

    if divergencias and somente_checar:
        print("Páginas fora de sincronia:")
        for d in divergencias:
            print(f"  - {d}")
        return divergencias
    if not somente_checar:
        for d in divergencias:
            print(f"✔ {d}")
        if not divergencias:
            print("= páginas já sincronizadas")
    return []


def _decodificar_pagina(texto):
    m = PADRAO_CONFIG.search(texto)
    if not m:
        return None
    return json.loads(json.loads(f'"{m.group(1)}"'))


def _folhas(obj, prefixo=""):
    if isinstance(obj, dict):
        saida = {}
        for k, v in obj.items():
            saida.update(_folhas(v, f"{prefixo}.{k}" if prefixo else k))
        return saida
    if isinstance(obj, list):
        saida = {}
        for i, v in enumerate(obj):
            saida.update(_folhas(v, f"{prefixo}[{i}]"))
        return saida
    return {prefixo: obj}


def _ignorar_folha(caminho, valor):
    ultimo = caminho.split(".")[-1].split("[")[0]
    if ultimo in CHAVES_URL:
        return True
    if isinstance(valor, str) and valor.startswith("http"):
        return True
    return False


def aninhar(mapa):
    """Converte folhas 'a.b[0].c' no objeto esparso que o gerador mescla."""
    raiz = {}
    for caminho, valor in mapa.items():
        tokens = re.findall(r"\w+|\[\d+\]", caminho)
        cursor = raiz
        for i, tok in enumerate(tokens):
            ultimo = i == len(tokens) - 1
            if tok.startswith("["):
                idx = int(tok[1:-1])
                while len(cursor) <= idx:
                    cursor.append(None)
                if ultimo:
                    cursor[idx] = valor
                else:
                    if cursor[idx] is None:
                        cursor[idx] = [] if tokens[i + 1].startswith("[") else {}
                    cursor = cursor[idx]
            elif ultimo:
                cursor[tok] = valor
            else:
                if tok not in cursor or cursor[tok] is None:
                    cursor[tok] = [] if tokens[i + 1].startswith("[") else {}
                cursor = cursor[tok]
    return raiz


def extrair_i18n():
    """Grava overlay só quando uma página de idioma difere em texto, não em URL."""
    DIR_I18N.mkdir(parents=True, exist_ok=True)
    gravados = 0
    for lang in LANGS:
        pasta = RAIZ / lang
        if not pasta.is_dir():
            continue
        for arq in sorted(pasta.glob("*.html")):
            traduzido = _decodificar_pagina(arq.read_text(encoding="utf-8", errors="replace"))
            if not traduzido:
                continue
            pid = traduzido.get("metadata", {}).get("id", arq.stem)
            origem = DIR_CONFIGS / f"{pid}.json"
            if not origem.is_file():
                continue
            base = json.loads(origem.read_text(encoding="utf-8"))
            folhas_base = _folhas(base)
            folhas_lang = _folhas(traduzido)
            diff = {}
            for caminho, valor in folhas_lang.items():
                if caminho not in folhas_base or folhas_base[caminho] == valor:
                    continue
                if not isinstance(valor, str) or not isinstance(folhas_base[caminho], str):
                    continue
                ultimo = caminho.split(".")[-1].split("[")[0]
                if ultimo not in CHAVES_TEXTO:
                    continue
                if _ignorar_folha(caminho, valor):
                    continue
                diff[caminho] = valor
            destino = DIR_I18N / lang / f"{pid}.json"
            if not diff:
                if destino.is_file():
                    destino.unlink()
                continue
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_text(
                json.dumps(aninhar(diff), ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            gravados += 1
            print(f"✔ overlay {destino.relative_to(RAIZ)} ({len(diff)} strings)")
    if gravados == 0:
        print("= nenhum overlay: as páginas de idioma não tinham strings próprias")
    return gravados


def remover_forks_de_idioma():
    """Apaga o HTML forkado. A geração seguinte recria só o que tem overlay."""
    removidos = []
    for lang in LANGS:
        pasta = RAIZ / lang
        if not pasta.is_dir():
            continue
        for arq in pasta.glob("*.html"):
            # Preserva uma casca já gerada (marcador do gerador).
            texto = arq.read_text(encoding="utf-8", errors="replace")
            if texto.startswith("<!DOCTYPE html>\n<!-- gerado por tools/gerar_paginas.py"):
                continue
            removidos.append(arq)
            arq.unlink()
    return removidos


def relativizar_assets():
    """Troca os scripts v4 absolutos pelo carregador relativo, só em páginas.

    Não mexe em fragmentos (o cabeçalho usa URL absoluta de propósito, para
    funcionar em qualquer profundidade) nem em cascas geradas.
    """
    fora = {".git", "node_modules", "assets", "components", "templates", "dist", "calculadoras", "template"}
    alterados = []
    for arq in RAIZ.rglob("*.html"):
        if any(p in fora for p in arq.relative_to(RAIZ).parts):
            continue
        texto = arq.read_text(encoding="utf-8", errors="replace")
        if "assets/js/header-v4.js" not in texto and "assets/css/header-v4.css" not in texto:
            continue
        if "page-loader-v4.js" in texto:
            continue
        if "gerado por tools/gerar_paginas.py" in texto[:240]:
            continue
        profundidade = len(arq.relative_to(RAIZ).parts) - 1
        prefixo = "../" * profundidade
        novo = texto
        novo = re.sub(
            r"\n?[ \t]*<link rel=\"stylesheet\" href=\"[^\"]*assets/css/(?:variables-v4|header-v4|footer-v4|accessibility-v4)\.css\"[^>]*>",
            "",
            novo,
        )
        novo = re.sub(
            r"\n?[ \t]*<script src=\"[^\"]*assets/js/(?:event-bus-v4|header-v4|footer-v4|accessibility-v4)\.js\"[^>]*>\s*</script>",
            "",
            novo,
        )
        if "module-loader-v5.js" not in novo and "</body>" in novo:
            tag = f'\n  <script src="{prefixo}assets/js/module-loader-v5.js" defer></script>\n'
            novo = novo.replace("</body>", tag + "</body>", 1)
        if novo != texto:
            arq.write_text(novo, encoding="utf-8")
            alterados.append(str(arq.relative_to(RAIZ)))
    return alterados


if __name__ == "__main__":
    if "--i18n-extrair" in sys.argv:
        extrair_i18n()
    else:
        falhas = gerar(somente_checar="--check" in sys.argv)
        if falhas:
            sys.exit(1)
        if "--check" not in sys.argv and "--sem-assets" not in sys.argv:
            for caminho in relativizar_assets():
                print(f"✔ asset relativo {caminho}")
