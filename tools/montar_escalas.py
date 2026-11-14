#!/usr/bin/env python3
"""Fonte das 57 escalas que estavam em revisão.

Gera configs/paginas/<id>.json, inclui os links no menu e no mapa do site.
O JSON publicado é o que a casca lê. Rode este arquivo de novo só para
reconstruir esses JSON a partir daqui.
"""
from __future__ import annotations

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
BASE = "https://auditeduca.github.io/Calculadoras-de-Enfermagem"
AVISO = (
    "O escore apoia o julgamento clínico. Não substitui o instrumento original, "
    "o protocolo da instituição nem a avaliação à beira do leito."
)


def opcoes(pares):
    vistos = {}
    saida = []
    for nota, rotulo in pares:
        chave = str(nota)
        n = vistos.get(chave, 0)
        vistos[chave] = n + 1
        valor = chave if n == 0 else f"{chave}-{n}"
        item = {"value": valor, "label": rotulo, "score": nota}
        if isinstance(nota, int) and n == 0:
            item["value"] = nota
        saida.append(item)
    return saida


def yn(pontos, sim, nao="Não — 0"):
    return opcoes([(0, nao), (pontos, sim)])


def faixa(maximo, rotulo, conduta, cor, fundo):
    return {"max": maximo, "label": rotulo, "conduct": conduta, "color": cor, "bg": fundo}


def pintar(bandas, melhor_alto):
    """bandas: lista de (max, rótulo, conduta). A primeira faixa é a dos escores menores."""
    n = len(bandas)
    pior_primeiro = [
        ("text-red-700", "bg-red-50"),
        ("text-orange-700", "bg-orange-50"),
        ("text-amber-700", "bg-amber-50"),
        ("text-lime-700", "bg-lime-50"),
        ("text-green-700", "bg-green-50"),
    ]
    pal = pior_primeiro if melhor_alto else list(reversed(pior_primeiro))
    saida = []
    for i, (mx, rot, cond) in enumerate(bandas):
        cor, fundo = pal[round(i * (len(pal) - 1) / max(n - 1, 1))]
        saida.append(faixa(mx, rot, cond, cor, fundo))
    return saida


def pagina(pid, titulo, descricao, itens, bandas, *, melhor_alto=False, formula=None,
           chave="total", unidade="pontos", decimais=0, sobre="", referencia="",
           instrucao="", grupo="Escalas"):
    campos = []
    for item in itens:
        if item[0] == "numero":
            _, fid, rotulo, minimo, maximo, dica = item
            campos.append({
                "id": fid, "type": "number", "label": rotulo, "required": True,
                "min": minimo, "max": maximo, "step": 1,
                "tooltip": dica or f"Informe de {minimo} a {maximo}.",
            })
        else:
            fid, rotulo, pares = item
            campos.append({
                "id": fid, "type": "select", "label": rotulo, "required": True,
                "options": opcoes(pares),
            })
    modo = "formula" if formula else "score"
    calc = {
        "mode": modo,
        "formula": formula or "total = score",
        "result": {
            "label": titulo,
            "unit": unidade,
            "decimals": decimais,
            "key": chave,
            "interpretationOf": chave,
        },
        "interpretation": pintar(bandas, melhor_alto),
        "audit": {
            "title": "Itens considerados",
            "steps": [{"label": c["label"], "sourceField": c["id"]} for c in campos]
            + [{"label": "Resultado", "sourceField": chave, "suffix": unidade}],
        },
        "actionButtons": [
            {"type": "primary", "label": "Gerar PDF", "icon": "fa-file-pdf", "action": "generatePDF"},
            {"type": "secondary", "label": "Copiar Resultado", "icon": "fa-copy", "action": "copyResult"},
        ],
    }
    return {
        "metadata": {
            "id": pid, "title": titulo, "category": "escalas",
            "version": "1.0.0", "lastUpdate": "2026-11-14", "type": "scale",
        },
        "seo": {
            "title": f"{titulo} | Calculadoras de Enfermagem",
            "description": descricao,
            "keywords": f"{titulo}, enfermagem, escala",
            "author": "Calculadoras de Enfermagem",
            "canonical": f"{BASE}/calculadoras/{pid}/",
            "ogImage": f"{BASE}/assets/images/logotipo-calculadoras-de-enfermagem.webp",
            "ogLocale": "pt_BR",
            "twitterCard": "summary_large_image",
        },
        "header": {"badge": grupo, "title": titulo, "description": descricao},
        "breadcrumb": [
            {"text": "Início", "url": "index.html"},
            {"text": "Ferramentas", "url": None},
            {"text": titulo, "url": None, "active": True},
        ],
        "form": {
            "sections": [
                {"title": "Dados do paciente", "fields": [
                    {"id": "patientName", "type": "text", "label": "Nome do paciente",
                     "placeholder": "Opcional", "optional": True},
                    {"id": "patientBirthdate", "type": "date", "label": "Data de nascimento",
                     "optional": True},
                ]},
                {"title": "Avaliação", "fields": campos},
            ]
        },
        "calculation": calc,
        "tabs": [
            {"id": "calculator", "label": "Avaliação", "type": "calculator"},
            {"id": "about", "label": "Sobre", "type": "content", "content": {
                "title": titulo,
                "body": f"<p>{descricao}</p><p>{sobre}</p><p>{AVISO}</p>",
            }},
            {"id": "instructions", "label": "Instruções", "type": "list", "items": [
                instrucao or "Leia cada item e escolha a opção que descreve o paciente agora.",
                "O primeiro item de cada lista permanece selecionado até ser trocado. Revise todos antes de calcular.",
                "Em caso de dúvida entre dois níveis, use o de maior gravidade clínica.",
                "Registre o resultado no prontuário junto com a hora e o contexto.",
            ]},
            {"id": "references", "label": "Referências", "type": "content", "content": {
                "body": f"<p>{referencia}</p><p>Conselho Federal de Enfermagem. Resolução COFEN nº 736/2024 — código de ética. A ferramenta não substitui a Sistematização da Assistência de Enfermagem.</p>",
            }},
        ],
    }


def likert(fid, rotulo, textos, inicio=0):
    return (fid, rotulo, [(inicio + i, f"{inicio + i} — {t}") for i, t in enumerate(textos)])


def zero_um(fid, rotulo, sim):
    return (fid, rotulo, [(0, "Não — 0"), (1, f"Sim — 1 ({sim})")])


def g04():
    return ["ausente", "leve", "moderado", "grave", "muito grave / incapacitante"]


ESCALAS = []


def add(pid, titulo, desc, itens, bandas, **kw):
    ESCALAS.append(pagina(pid, titulo, desc, itens, bandas, **kw))


# --- risco, pele, queda, equilíbrio ---

add("asa", "Classificação ASA",
    "Estado físico perioperatório da American Society of Anesthesiologists.",
    [("asa", "Classe ASA", [
        (1, "I — hígido, sem doença sistêmica"),
        (2, "II — doença sistêmica leve, sem limitação funcional"),
        (3, "III — doença sistêmica grave, com limitação funcional"),
        (4, "IV — doença grave com ameaça constante à vida"),
        (5, "V — moribundo, sem expectativa de sobreviver sem a cirurgia"),
        (6, "VI — morte encefálica, doador de órgãos"),
    ])],
    [(1, "ASA I", "Risco basal. O sufixo E (emergência) é registrado à parte e não soma ponto."),
     (2, "ASA II", "Doença leve controlada."),
     (3, "ASA III", "Doença grave. Planejar monitorização e pós-operatório."),
     (4, "ASA IV", "Ameaça constante à vida."),
     (5, "ASA V", "Moribundo."),
     (6, "ASA VI", "Morte encefálica declarada.")],
    sobre="A classe descreve o estado físico, não o risco isolado do procedimento. Emergência recebe o sufixo E no prontuário.",
    referencia="American Society of Anesthesiologists. ASA Physical Status Classification System.")

add("braden", "Escala de Braden",
    "Risco de lesão por pressão em seis domínios. Quanto menor o escore, maior o risco.",
    [likert("sensorial", "Percepção sensorial",
            ["completamente limitada", "muito limitada", "levemente limitada", "nenhum prejuízo"], 1),
     likert("umidade", "Umidade",
            ["constantemente úmida", "muito úmida", "ocasionalmente úmida", "raramente úmida"], 1),
     likert("atividade", "Atividade",
            ["acamado", "confinado à cadeira", "deambula ocasionalmente", "deambula com frequência"], 1),
     likert("mobilidade", "Mobilidade",
            ["completamente imóvel", "muito limitada", "levemente limitada", "sem limitação"], 1),
     likert("nutricao", "Nutrição",
            ["muito pobre", "provavelmente inadequada", "adequada", "excelente"], 1),
     likert("friccao", "Fricção e cisalhamento",
            ["problema", "problema em potencial", "nenhum problema aparente"], 1)],
    [(9, "Risco muito alto", "Superfície de redistribuição, reposicionamento rigoroso e nutrição."),
     (12, "Risco alto", "Plano intensivo de prevenção de lesão por pressão."),
     (14, "Risco moderado", "Prevenção padrão reforçada."),
     (18, "Risco baixo", "Manter prevenção e reavaliar se o estado mudar."),
     (23, "Sem risco pela Braden", "Manter inspeção da pele.")],
    melhor_alto=True,
    sobre="Seis subescalas, de 6 a 23. O corte clássico de risco é 18 ou menos.",
    referencia="Bergstrom N, Braden B, Laguzza A, Holman V. The Braden Scale for Predicting Pressure Sore Risk. Nurs Res. 1987.")

add("norton", "Escala de Norton",
    "Risco de lesão por pressão. Quanto menor o escore, maior o risco.",
    [likert("fisico", "Condição física", ["ruim", "pobre", "regular", "boa"], 1),
     likert("mental", "Estado mental", ["estuporoso", "confuso", "apático", "alerta"], 1),
     likert("atividade", "Atividade", ["acamado", "cadeira de rodas", "deambula com ajuda", "deambula"], 1),
     likert("mobilidade", "Mobilidade", ["imóvel", "muito limitada", "levemente limitada", "plena"], 1),
     likert("continencia", "Incontinência",
            ["dupla", "urinária habitual", "ocasional", "nenhuma / continente"], 1)],
    [(12, "Risco alto", "Prevenção intensiva de lesão por pressão."),
     (14, "Risco moderado", "O corte clássico de Norton é 14 ou menos."),
     (20, "Menor risco", "Manter inspeção da pele.")],
    melhor_alto=True,
    sobre="Cinco itens de 1 a 4. Total de 5 a 20.",
    referencia="Norton D, McLaren R, Exton-Smith AN. An investigation of geriatric nursing problems in hospital. 1962.")

add("gosnell", "Escala de Gosnell",
    "Adaptação da Norton para lesão por pressão, com nutrição no lugar de um domínio isolado.",
    [likert("fisico", "Condição física", ["ruim", "pobre", "regular", "boa"], 1),
     likert("mental", "Estado mental", ["estuporoso", "confuso", "apático", "alerta"], 1),
     likert("atividade", "Atividade", ["acamado", "cadeira", "deambula com ajuda", "deambula"], 1),
     likert("mobilidade", "Mobilidade", ["imóvel", "muito limitada", "levemente limitada", "plena"], 1),
     likert("nutricao", "Nutrição",
            ["muito pobre / jejum", "inadequada", "adequada com ajuda", "adequada e independente"], 1)],
    [(12, "Risco alto", "Prevenção intensiva."),
     (14, "Risco moderado", "Mesmo corte da Norton (14 ou menos)."),
     (20, "Menor risco", "Manter inspeção da pele.")],
    melhor_alto=True,
    sobre="Gosnell acrescentou a nutrição à lógica da Norton. Esta página usa cinco itens de 1 a 4 e o corte 14.",
    referencia="Gosnell DJ. An assessment tool to identify pressure sores. Nurs Res. 1973.")

add("waterlow", "Escala de Waterlow",
    "Risco de lesão por pressão. Quanto maior o escore, maior o risco.",
    [("imc", "Complexão / IMC", [
        (0, "0 — IMC 20–24,9"), (1, "1 — IMC 25–29,9"), (2, "2 — IMC ≥ 30"), (3, "3 — IMC < 20")]),
     ("sexo", "Sexo", [(1, "1 — masculino"), (2, "2 — feminino")]),
     ("idade", "Idade", [
        (1, "1 — 14 a 49 anos"), (2, "2 — 50 a 64"), (3, "3 — 65 a 74"),
        (4, "4 — 75 a 80"), (5, "5 — 81 ou mais")]),
     ("pele", "Tipo de pele (some os achados e escolha o total)", [
        (0, "0 — saudável"), (1, "1 — um achado: papel, seca, edemaciada ou úmida"),
        (2, "2 — descorada ou dois achados leves"), (3, "3 — pele quebrada ou três achados")]),
     ("continencia", "Continência", [
        (0, "0 — continente ou cateter"), (1, "1 — incontinência ocasional"),
        (2, "2 — incontinência fecal ou cateter e fezes"), (3, "3 — dupla incontinência")]),
     ("mobilidade", "Mobilidade", [
        (0, "0 — plena"), (1, "1 — inquieto"), (2, "2 — apático"),
        (3, "3 — restrito"), (4, "4 — inerte ou tração"), (5, "5 — restrito à cadeira")]),
     ("apetite", "Apetite", [
        (0, "0 — médio / adequado"), (1, "1 — pobre"),
        (2, "2 — só sonda ou líquidos"), (3, "3 — jejum ou anorético")]),
     ("tabagismo", "Tabagismo", [(0, "0 — não"), (1, "1 — sim")]),
     ("anemia", "Anemia", [(0, "0 — não"), (2, "2 — sim")]),
     ("icc", "Insuficiência cardíaca", [(0, "0 — não"), (5, "5 — sim")]),
     ("dvp", "Doença vascular periférica", [(0, "0 — não"), (5, "5 — sim")]),
     ("caquexia", "Caquexia terminal", [(0, "0 — não"), (8, "8 — sim")]),
     ("neuro", "Déficit neurológico", [
        (0, "0 — nenhum"), (4, "4 — diabetes, AVC ou déficit motor/sensitivo"),
        (6, "6 — paraplegia")]),
     ("cirurgia", "Cirurgia ou trauma maior", [
        (0, "0 — não"), (5, "5 — ortopédica abaixo da cintura, coluna ou mais de 2 h de mesa")]),
     ("farmacos", "Medicação de risco", [
        (0, "0 — não"), (4, "4 — corticoide em dose alta, citotóxico ou anti-inflamatório")]),
    ],
    [(9, "Sem risco pela Waterlow", "Manter inspeção da pele."),
     (14, "Em risco", "A partir de 10 pontos."),
     (19, "Risco alto", "A partir de 15 pontos."),
     (64, "Risco muito alto", "A partir de 20 pontos. Prevenção máxima.")],
    sobre="Itens clássicos de Waterlow mais riscos especiais. Se houver vários tipos de pele, some os pontos originais e escolha a faixa correspondente.",
    referencia="Waterlow J. Pressure sores: a risk assessment card. Nurs Times. 1985.")

add("elpo", "Escala ELPO",
    "Risco de lesão decorrente do posicionamento cirúrgico. De 7 a 35; 20 ou mais é maior risco.",
    [("posicao", "Posição cirúrgica", [
        (1, "1 — supina"), (2, "2 — lateral"), (3, "3 — Trendelenburg"),
        (4, "4 — prona"), (5, "5 — litotômica")]),
     ("tempo", "Tempo de cirurgia", [
        (1, "1 — até 1 hora"), (2, "2 — mais de 1 até 2 horas"),
        (3, "3 — mais de 2 até 4 horas"), (4, "4 — mais de 4 até 6 horas"),
        (5, "5 — acima de 6 horas")]),
     ("anestesia", "Tipo de anestesia", [
        (1, "1 — local"), (2, "2 — sedação"), (3, "3 — regional"),
        (4, "4 — geral"), (5, "5 — geral e regional")]),
     ("suporte", "Superfície de suporte", [
        (1, "1 — colchão e coxins viscoelásticos"),
        (2, "2 — colchão convencional e coxins viscoelásticos"),
        (3, "3 — colchão convencional e coxins de espuma"),
        (4, "4 — colchão convencional e coxins de algodão"),
        (5, "5 — sem suporte, suporte rígido ou perneiras estreitas")]),
     ("membros", "Posição dos membros", [
        (1, "1 — anatômica"),
        (2, "2 — abertura dos membros superiores menor que 90°"),
        (3, "3 — joelhos ou membros inferiores abaixo de 90°, ou pescoço sem alinhamento"),
        (4, "4 — joelhos acima de 90° ou membros inferiores acima de 90°"),
        (5, "5 — joelhos acima de 90° com abertura acima de 90°, ou membros superiores acima de 90°")]),
     ("comorbidade", "Comorbidade de maior risco", [
        (1, "1 — nenhuma"), (2, "2 — doença vascular"), (3, "3 — diabetes"),
        (4, "4 — obesidade ou desnutrição"),
        (5, "5 — lesão por pressão prévia, neuropatia ou trombose venosa diagnosticada")]),
     ("idade", "Idade", [
        (1, "1 — 18 a 39 anos"), (2, "2 — 40 a 59"), (3, "3 — 60 a 69"),
        (4, "4 — 70 a 79"), (5, "5 — 80 ou mais")]),
    ],
    [(19, "Menor risco", "Escore até 19. Manter proteção de proeminências."),
     (35, "Maior risco", "Escore de 20 ou mais. Reforçar dispositivos e reavaliar se a posição mudar.")],
    melhor_alto=False,
    sobre="Sete itens de 1 a 5 (Lopes e colaboradores, versão 2). Estime o tempo ao posicionar e reclassifique ao final. Havendo mais de uma comorbidade, use a de maior pontuação.",
    referencia="Lopes CMM et al. Escala de avaliação de risco para lesões decorrentes do posicionamento cirúrgico. Rev. Latino-Am. Enfermagem. 2016.")

add("morse", "Escala de Morse",
    "Risco de queda em adulto hospitalizado.",
    [("queda", "Queda recente", [(0, "0 — não"), (25, "25 — sim")]),
     ("diagnostico", "Diagnóstico secundário", [(0, "0 — não"), (15, "15 — sim")]),
     ("auxilio", "Auxílio para deambular", [
        (0, "0 — nenhum, acamado ou cadeira de rodas"),
        (15, "15 — muleta, bengala ou andador"),
        (30, "30 — apoia-se na mobília")]),
     ("acesso", "Acesso venoso ou heparinizado", [(0, "0 — não"), (20, "20 — sim")]),
     ("marcha", "Marcha", [
        (0, "0 — normal, acamado ou cadeira"),
        (10, "10 — fraca"),
        (20, "20 — comprometida")]),
     ("mental", "Estado mental", [
        (0, "0 — orientado quanto à própria capacidade"),
        (15, "15 — superestima ou esquece limitações")]),
    ],
    [(24, "Risco baixo", "Precaução padrão de queda."),
     (44, "Risco médio", "Precaução reforçada."),
     (125, "Risco alto", "45 ou mais. Plano individual de prevenção de quedas.")],
    referencia="Morse JM, Morse RM, Tylko SJ. Development of a scale to identify the fall-prone patient. Can J Aging. 1989.")

add("downton", "Escala de Downton",
    "Risco de queda, muito usada em idosos. Três ou mais pontos indicam risco.",
    [("quedas", "Quedas anteriores", [(0, "0 — não"), (1, "1 — sim")]),
     ("farmaco", "Medicamento de maior pontuação em uso", [
        (0, "0 — nenhum destes"), (1, "1 — tranquilizante ou sedativo"),
        (2, "2 — diurético"), (3, "3 — anti-hipertensivo"),
        (4, "4 — antiparkinsoniano"), (5, "5 — antidepressivo")]),
     ("sensorial", "Déficits sensoriais presentes", [
        (0, "0 — nenhum"), (1, "1 — um (visual, auditivo ou de membro)"),
        (2, "2 — dois"), (3, "3 — três")]),
     ("mental", "Estado mental", [(0, "0 — orientado"), (1, "1 — confuso")]),
     ("marcha", "Deambulação", [
        (0, "0 — normal"), (1, "1 — segura com ajuda"),
        (2, "2 — insegura, com ou sem ajuda"), (3, "3 — impossível")]),
    ],
    [(2, "Risco baixo", "Abaixo de 3."),
     (11, "Risco alto", "3 ou mais. Prevenção de quedas.")],
    sobre="Medicamentos: escolha o grupo de maior pontuação, não some todos. Déficits sensoriais somam.",
    referencia="Downton JH. Falls in the elderly. London: Edward Arnold; 1993.")

add("hendrich", "Escala de Hendrich II",
    "Risco de queda hospitalar. Cinco ou mais pontos indicam risco alto.",
    [("confusao", "Confusão, desorientação ou impulsividade", [(0, "0 — não"), (4, "4 — sim")]),
     ("depressao", "Depressão sintomática", [(0, "0 — não"), (2, "2 — sim")]),
     ("eliminacao", "Eliminação alterada", [(0, "0 — não"), (1, "1 — sim")]),
     ("tontura", "Tontura ou vertigem", [(0, "0 — não"), (1, "1 — sim")]),
     ("sexo", "Sexo masculino", [(0, "0 — não"), (1, "1 — sim")]),
     ("antiepiletico", "Antiepiléptico", [(0, "0 — não"), (2, "2 — qualquer um")]),
     ("benzo", "Benzodiazepínico", [(0, "0 — não"), (1, "1 — qualquer um")]),
     ("levantar", "Teste de levantar e andar", [
        (0, "0 — levanta em um movimento"),
        (1, "1 — empurra e consegue em uma tentativa"),
        (3, "3 — várias tentativas, mas consegue"),
        (4, "4 — não levanta sem ajuda")]),
    ],
    [(4, "Risco baixo", "Abaixo de 5."),
     (16, "Risco alto", "5 ou mais.")],
    referencia="Hendrich AL, Bender PS, Nyhuis A. Validation of the Hendrich II Fall Risk Model. Appl Nurs Res. 2003.")

add("humpty", "Escala Humpty Dumpty",
    "Risco de queda em criança hospitalizada. De 7 a 23; 12 ou mais é risco alto.",
    [("idade", "Idade", [
        (4, "4 — menor de 3 anos"), (3, "3 — 3 a menos de 7"),
        (2, "2 — 7 a menos de 13"), (1, "1 — 13 ou mais")]),
     ("sexo", "Sexo", [(2, "2 — masculino"), (1, "1 — feminino")]),
     ("diagnostico", "Diagnóstico", [
        (4, "4 — neurológico"),
        (3, "3 — oxigenação, respiratório, desidratação, anemia, anorexia, síncope ou tontura"),
        (2, "2 — psiquiátrico ou comportamental"),
        (1, "1 — outro")]),
     ("cognicao", "Cognição", [
        (3, "3 — não percebe as próprias limitações"),
        (2, "2 — esquece as limitações"),
        (1, "1 — orientado quanto à própria capacidade")]),
     ("ambiente", "Fator ambiental", [
        (4, "4 — queda prévia ou lactente colocado em cama"),
        (3, "3 — usa dispositivo de auxílio ou lactente no berço"),
        (2, "2 — criança colocada em cama"),
        (1, "1 — área ambulatorial")]),
     ("sedacao", "Cirurgia, sedação ou anestesia", [
        (3, "3 — nas últimas 24 horas"),
        (2, "2 — nas últimas 48 horas"),
        (1, "1 — há mais de 48 horas ou nenhuma")]),
     ("farmaco", "Medicação", [
        (3, "3 — dois ou mais: hipnótico, barbitúrico, fenotiazina, antidepressivo, laxante, diurético ou opioide"),
        (2, "2 — um desses"),
        (1, "1 — outra medicação ou nenhuma")]),
    ],
    [(11, "Risco baixo", "7 a 11. Precaução padrão pediátrica."),
     (23, "Risco alto", "12 ou mais. Protocolo de alto risco.")],
    referencia="Hill-Rodriguez D et al. The Humpty Dumpty Falls Scale. J Spec Pediatr Nurs. 2009.")

add("johns", "Escala Johns Hopkins de queda",
    "Risco de queda em adulto. Abaixo de 6 é baixo, 6 a 13 moderado, 14 ou mais alto.",
    [("idade", "Idade", [
        (0, "0 — menor de 60 anos"), (1, "1 — 60 a 69"),
        (2, "2 — 70 a 79"), (3, "3 — 80 ou mais")]),
     ("queda", "Queda nos últimos 6 meses", [(0, "0 — não"), (5, "5 — sim")]),
     ("eliminacao", "Eliminação", [
        (0, "0 — sem urgência nem incontinência"),
        (2, "2 — incontinência ou urgência/frequência"),
        (4, "4 — incontinência e urgência/frequência")]),
     ("farmaco", "Medicação de risco", [
        (0, "0 — nenhuma das classes de risco"),
        (3, "3 — uma classe (opioide, anticonvulsivante, anti-hipertensivo, diurético, hipnótico, laxante, sedativo ou psicotrópico)"),
        (5, "5 — duas ou mais"),
        (7, "7 — procedimento com sedação nas últimas 24 horas")]),
     ("equipamento", "Equipamentos que limitam a mobilidade", [
        (0, "0 — nenhum"), (1, "1 — um"), (2, "2 — dois"), (3, "3 — três ou mais")]),
     ("mobilidade", "Mobilidade (some os critérios presentes)", [
        (0, "0 — nenhum"),
        (2, "2 — um: precisa de ajuda, marcha instável ou déficit sensorial que atrapalha a marcha"),
        (4, "4 — dois critérios"),
        (6, "6 — os três critérios")]),
     ("cognicao", "Cognição (some os critérios presentes)", [
        (0, "0 — nenhum"),
        (1, "1 — consciência alterada da própria capacidade"),
        (2, "2 — impulsividade"),
        (4, "4 — não compreende as limitações"),
        (3, "3 — consciência alterada e impulsividade"),
        (5, "5 — consciência alterada e não compreende limitações"),
        (6, "6 — impulsividade e não compreende limitações"),
        (7, "7 — os três")]),
    ],
    [(5, "Risco baixo", "Abaixo de 6."),
     (13, "Risco moderado", "6 a 13."),
     (35, "Risco alto", "14 ou mais.")],
    referencia="Poe SS et al. The Johns Hopkins Fall Risk Assessment Tool. J Nurs Care Qual. 2007. Mobilidade e cognição somam os critérios marcados.")

add("ofras", "Escala OFRAS",
    "Risco de queda em paciente obstétrica, com a lógica da Morse e um fator próprio da gestação e do puerpério.",
    [("queda", "Queda nesta gestação ou nesta internação", [(0, "0 — não"), (25, "25 — sim")]),
     ("intercorrencia", "Intercorrência ou segundo diagnóstico", [(0, "0 — não"), (15, "15 — sim")]),
     ("auxilio", "Auxílio para deambular", [
        (0, "0 — nenhum"), (15, "15 — bengala, muleta ou andador"), (30, "30 — apoia-se na mobília")]),
     ("acesso", "Acesso venoso ou dispositivo", [(0, "0 — não"), (20, "20 — sim")]),
     ("marcha", "Marcha", [(0, "0 — normal"), (10, "10 — fraca"), (20, "20 — comprometida")]),
     ("mental", "Estado mental", [
        (0, "0 — orientada quanto à própria capacidade"),
        (15, "15 — superestima ou esquece limitações")]),
     ("obstetrico", "Fator obstétrico", [
        (0, "0 — nenhum"),
        (10, "10 — urgência miccional ou edema que atrapalha a marcha"),
        (15, "15 — pós-parto imediato ou analgesia de parto")]),
    ],
    [(24, "Risco baixo", "Precaução padrão, inclusive ao levantar após analgesia."),
     (44, "Risco médio", "Acompanhar deambulação."),
     (125, "Risco alto", "45 ou mais, o mesmo corte alto da Morse.")],
    sobre="Não existe um único OFRAS internacional com os mesmos pesos. Esta página usa os pesos da Morse e acrescenta o fator obstétrico, para a ferramenta anunciada no sítio deixar de ser um aviso vazio.",
    referencia="Morse JM. Preventing patient falls. 2nd ed. Springer; 2009. Adaptação obstétrica explícita nesta página.")

add("berg", "Escala de equilíbrio de Berg",
    "Quatorze tarefas de equilíbrio, de 0 a 4. Total de 0 a 56.",
    [likert(fid, rot, [
        "incapaz ou precisa de ajuda máxima",
        "precisa de ajuda mínima ou várias tentativas",
        "realiza com supervisão ou apoio das mãos",
        "realiza com pequena instabilidade",
        "realiza com segurança, sem as mãos",
    ]) for fid, rot in [
        ("sentado_pe", "De sentado para de pé"),
        ("em_pe", "Permanecer em pé sem apoio"),
        ("sentado", "Permanecer sentado sem apoio"),
        ("pe_sentado", "De pé para sentado"),
        ("transferencia", "Transferências"),
        ("olhos_fechados", "Em pé, olhos fechados"),
        ("pes_juntos", "Em pé, pés juntos"),
        ("alcance", "Alcance à frente com o braço estendido"),
        ("objeto", "Apanhar objeto do chão"),
        ("olhar_tras", "Virar-se para olhar para trás"),
        ("giro", "Girar 360 graus"),
        ("banco", "Colocar os pés alternados em um banco"),
        ("tandem", "Um pé à frente do outro"),
        ("unipodal", "Apoio unipodal"),
    ]],
    [(20, "Risco alto de queda", "0 a 20. Em geral restrito à cadeira de rodas."),
     (40, "Risco médio", "21 a 40. Deambula com assistência."),
     (56, "Risco baixo", "41 a 56. Independente. Abaixo de 45 o risco de queda já é maior.")],
    melhor_alto=True,
    sobre="Cada tarefa tem critério próprio no instrumento original. Aqui os cinco níveis resumem a gradação de 0 a 4; use o descritor fino da ficha de Berg se dois níveis parecerem iguais.",
    referencia="Berg K, Wood-Dauphinee S, Williams JI, Maki B. Measuring balance in the elderly: validation of an instrument. Can J Public Health. 1992.")

add("tinetti", "Escala de Tinetti (POMA)",
    "Equilíbrio (16) e marcha (12). Total de 0 a 28. Quanto maior, melhor.",
    [likert("sentado", "Equilíbrio sentado", ["inclina ou escorrega", "estável"], 0),
     likert("levanta", "Levantar da cadeira", ["incapaz sem ajuda", "consegue com os braços", "consegue sem os braços"]),
     likert("tentativas", "Tentativas para levantar", ["incapaz", "mais de uma", "uma"]),
     likert("pe_imediato", "Equilíbrio de pé imediato", ["instável", "estável com apoio", "estável sem apoio"]),
     likert("pe", "Equilíbrio de pé", ["instável", "estável com base alargada ou apoio", "base estreita, sem apoio"]),
     likert("empurrar", "Empurrão no esterno", ["começa a cair", "agarra ou dá mais de um passo", "estável"]),
     likert("olhos", "Olhos fechados", ["instável", "estável"]),
     likert("giro360", "Girar 360°", ["passos descontínuos ou instável", "contínuo mas lento", "contínuo e estável"]),
     likert("sentar", "Sentar", ["inseguro, avalia mal a distância", "usa os braços ou cai sentado", "seguro"]),
     likert("inicio", "Início da marcha", ["hesitação ou várias tentativas", "sem hesitação"]),
     likert("passo_cd", "Comprimento do passo direito", ["não ultrapassa o esquerdo", "ultrapassa o esquerdo"]),
     likert("passo_ad", "Altura do passo direito", ["não sai totalmente do chão", "sai do chão"]),
     likert("passo_ce", "Comprimento do passo esquerdo", ["não ultrapassa o direito", "ultrapassa o direito"]),
     likert("passo_ae", "Altura do passo esquerdo", ["não sai totalmente do chão", "sai do chão"]),
     likert("simetria", "Simetria do passo", ["desigual", "igual"]),
     likert("continuidade", "Continuidade do passo", ["para entre os passos", "contínuo"]),
     likert("trajeto", "Trajeto", ["desvio marcado", "desvio leve ou usa auxílio", "reto, sem auxílio"]),
     likert("tronco", "Tronco", ["balanço marcado ou usa auxílio", "flexão ou abertura dos braços", "sem balanço nem flexão"]),
     likert("base", "Base de apoio", ["calcanhares afastados", "calcanhares quase se tocam"])],
    [(18, "Risco alto de queda", "Até 18."),
     (23, "Risco moderado", "19 a 23."),
     (28, "Risco baixo", "24 a 28.")],
    melhor_alto=True,
    referencia="Tinetti ME. Performance-oriented assessment of mobility problems in elderly patients. J Am Geriatr Soc. 1986.")

# --- dor e sedação ---

add("escalanumerica", "Escala numérica de dor",
    "Intensidade da dor de 0 a 10 referida pelo paciente.",
    [("dor", "Nota referida", [(i, f"{i} — {'sem dor' if i == 0 else 'dor máxima' if i == 10 else 'dor'}") for i in range(11)])],
    [(0, "Sem dor", "Reavaliar conforme o quadro."),
     (3, "Dor leve", "1 a 3."),
     (6, "Dor moderada", "4 a 6. Rever analgesia."),
     (10, "Dor intensa", "7 a 10. Analgesia e reavaliação em curto prazo.")],
    referencia="Jensen MP, Karoly P, Braver S. The measurement of clinical pain intensity. Pain. 1986.")

add("bps", "Escala BPS",
    "Dor em paciente crítico sob ventilação mecânica. Total de 3 a 12.",
    [likert("face", "Expressão facial",
            ["relaxada", "parcialmente tensa", "totalmente tensa", "careta"], 1),
     likert("membros", "Membros superiores",
            ["sem movimento", "parcialmente fletidos", "totalmente fletidos, com flexão dos dedos", "permanentemente retraídos"], 1),
     likert("ventila", "Adaptação ao ventilador",
            ["tolera", "tosse, mas tolera", "briga com o ventilador", "não é possível ventilar"], 1)],
    [(3, "Sem dor", "Escore 3."),
     (5, "Dor leve", "4 ou 5."),
     (8, "Dor moderada", "6 a 8. Muitos protocolos tratam a partir de 6."),
     (12, "Dor intensa", "9 a 12.")],
    referencia="Payen JF et al. Assessing pain in critically ill sedated patients by using a behavioral pain scale. Crit Care Med. 2001.")

add("flacc", "Escala FLACC",
    "Dor comportamental em criança não verbal ou pessoa incapaz de relatar. Total de 0 a 10.",
    [likert(fid, rot, txt) for fid, rot, txt in [
        ("face", "Face", ["sem expressão especial ou sorriso", "careta ocasional ou sobrancelha franzida", "queixo trêmulo, mandíbula cerrada"]),
        ("pernas", "Pernas", ["relaxadas", "inquietas ou tensas", "chutando ou encolhidas"]),
        ("atividade", "Atividade", ["quieto, posição normal", "contorce-se, muda de posição", "em arco, rígido ou agitado"]),
        ("choro", "Choro", ["sem choro", "geme ou choraminga", "choro contínuo, grito ou soluço"]),
        ("consolo", "Consolabilidade", ["contente, relaxado", "acalmado por toque ou voz", "difícil de consolar"]),
    ]],
    [(0, "Relaxado", "Sem sinais de dor."),
     (3, "Dor leve", "1 a 3."),
     (6, "Dor moderada", "4 a 6."),
     (10, "Dor intensa", "7 a 10.")],
    referencia="Merkel SI et al. The FLACC: a behavioral scale for scoring postoperative pain in young children. Pediatr Nurs. 1997.")

add("cries", "Escala CRIES",
    "Dor no recém-nascido, sobretudo no pós-operatório. Total de 0 a 10. A partir de 4, tratar.",
    [likert("choro", "Choro", ["ausente", "agudo", "agudo e inconsolável"]),
     likert("oxigenio", "Oxigênio para SatO₂ acima de 95%", ["não", "até 30%", "mais de 30%"]),
     likert("sinais", "Sinais vitais", ["iguais ao basal", "até 20% acima", "mais de 20% acima"]),
     likert("expressao", "Expressão", ["nenhuma", "careta", "careta e gemido"]),
     likert("sono", "Sono", ["sem interrupção", "despertares frequentes", "constantemente acordado"])],
    [(3, "Dor mínima ou ausente", "Até 3."),
     (6, "Dor moderada", "4 a 6. Analgesia."),
     (10, "Dor intensa", "7 a 10.")],
    referencia="Krechel SW, Bildner J. CRIES: a new neonatal postoperative pain measurement score. Paediatr Anaesth. 1995.")

add("nips", "Escala NIPS",
    "Dor no recém-nascido e no prematuro. Total de 0 a 7.",
    [("face", "Face", [(0, "0 — relaxada"), (1, "1 — careta")]),
     ("choro", "Choro", [(0, "0 — ausente"), (1, "1 — resmungo"), (2, "2 — vigoroso")]),
     ("resp", "Respiração", [(0, "0 — relaxada"), (1, "1 — diferente do basal")]),
     ("bracos", "Braços", [(0, "0 — relaxados"), (1, "1 — fletidos ou estendidos")]),
     ("pernas", "Pernas", [(0, "0 — relaxadas"), (1, "1 — fletidas ou estendidas")]),
     ("alerta", "Estado de alerta", [(0, "0 — dormindo ou calmo"), (1, "1 — inquieto")])],
    [(2, "Dor mínima ou ausente", "0 a 2."),
     (4, "Dor moderada", "3 a 4."),
     (7, "Dor intensa", "5 a 7.")],
    referencia="Lawrence J et al. The development of a tool to assess neonatal pain. Neonatal Netw. 1993.")

add("painad", "Escala PAINAD",
    "Dor em idoso com demência avançada. Total de 0 a 10.",
    [likert(fid, rot, txt) for fid, rot, txt in [
        ("resp", "Respiração", ["normal", "ocasionalmente difícil", "ruidosa, rápida ou Cheyne-Stokes"]),
        ("vocal", "Vocalização", ["nenhuma", "gemido ou fala negativa ocasional", "chamado repetido, gemido alto ou choro"]),
        ("face", "Expressão facial", ["sorrindo ou inexpressiva", "triste, assustada ou carrancuda", "careta"]),
        ("corpo", "Linguagem corporal", ["relaxado", "tenso, inquieto", "rígido, punhos cerrados ou agressivo"]),
        ("consolo", "Consolabilidade", ["não precisa", "distraído por voz ou toque", "impossível consolar"]),
    ]],
    [(0, "Sem dor observável", "Reavaliar se o quadro mudar."),
     (3, "Dor leve", "1 a 3."),
     (6, "Dor moderada", "4 a 6."),
     (10, "Dor intensa", "7 a 10.")],
    referencia="Warden V, Hurley AC, Volicer L. Development and psychometric evaluation of the Pain Assessment in Advanced Dementia (PAINAD) scale. J Am Med Dir Assoc. 2003.")

add("lanss", "Escala LANSS",
    "Discrimina dor neuropática. Total de 0 a 24. Doze ou mais sugere mecanismo neuropático.",
    [("formigamento", "A dor parece uma sensação estranha na pele (agulhada, formigamento)?", [(0, "Não — 0"), (5, "Sim — 5")]),
     ("aspecto", "A pele da área dolorosa parece diferente (cor, mancha, fina)?", [(0, "Não — 0"), (5, "Sim — 5")]),
     ("toque", "A pele está anormalmente sensível ao toque?", [(0, "Não — 0"), (3, "Sim — 3")]),
     ("choque", "A dor vem em crises, como choque ou explosão?", [(0, "Não — 0"), (2, "Sim — 2")]),
     ("queimacao", "A dor parece queimação?", [(0, "Não — 0"), (1, "Sim — 1")]),
     ("alodinia", "Alodinia ao roçar leve na área dolorosa", [(0, "Não — 0"), (5, "Sim — 5")]),
     ("agulha", "Limiar de picada de agulha alterado na área dolorosa", [(0, "Não — 0"), (3, "Sim — 3")])],
    [(11, "Dor provavelmente não neuropática", "Abaixo de 12."),
     (24, "Dor provavelmente neuropática", "12 ou mais. Correlacionar com o exame.")],
    referencia="Bennett M. The LANSS Pain Scale. Pain. 2001.")

add("ramsay", "Escala de Ramsay",
    "Nível de sedação de 1 a 6.",
    [("ramsay", "Nível", [
        (1, "1 — ansioso, agitado ou inquieto"),
        (2, "2 — cooperativo, orientado e tranquilo"),
        (3, "3 — responde apenas a comandos"),
        (4, "4 — resposta rápida ao estímulo glabelar ou auditivo forte"),
        (5, "5 — resposta lenta a esses estímulos"),
        (6, "6 — sem resposta"),
    ])],
    [(1, "Ansioso ou agitado", "Nível 1."),
     (2, "Cooperativo e tranquilo", "Nível 2. Alvo frequente fora da ventilação."),
     (4, "Sedação leve a moderada", "Níveis 3 e 4."),
     (6, "Sedação profunda", "Níveis 5 e 6. Reservar a indicação explícita.")],
    referencia="Ramsay MA et al. Controlled sedation with alphaxalone-alphadolone. Br Med J. 1974.")

add("richmond", "Escala de Richmond (RASS)",
    "Agitação e sedação de −5 a +4. O alvo usual em ventilação é 0 a −2, salvo outra meta.",
    [("rass", "RASS", [
        (-5, "−5 — não desperta a voz nem a dor"),
        (-4, "−4 — sem resposta à voz, move-se à dor"),
        (-3, "−3 — movimento ou abertura ocular à voz, sem contato visual"),
        (-2, "−2 — desperta brevemente à voz, contato visual menor que 10 segundos"),
        (-1, "−1 — desperta à voz e mantém contato por 10 segundos ou mais"),
        (0, "0 — alerta e calmo"),
        (1, "1 — inquieto, ansioso, sem movimento agressivo"),
        (2, "2 — agitação frequente, briga com o ventilador"),
        (3, "3 — muito agitado, remove tubos"),
        (4, "4 — combativo, violento"),
    ])],
    [(-4, "Sedação profunda", "−5 ou −4."),
     (-1, "Sedação leve", "−3 a −1."),
     (0, "Alerta e calmo", "RASS 0."),
     (1, "Inquieto", "RASS +1."),
     (4, "Agitado", "+2 a +4. Proteger e tratar a causa.")],
    referencia="Sessler CN et al. The Richmond Agitation-Sedation Scale. Am J Respir Crit Care Med. 2002.")

# --- neurologia e cognição ---

add("glasgow", "Escala de coma de Glasgow",
    "Abertura ocular, resposta verbal e motora. Total de 3 a 15.",
    [("ocular", "Abertura ocular", [
        (4, "4 — espontânea"), (3, "3 — à voz"), (2, "2 — à dor"), (1, "1 — nenhuma")]),
     ("verbal", "Resposta verbal", [
        (5, "5 — orientada"), (4, "4 — confusa"), (3, "3 — palavras"),
        (2, "2 — sons"), (1, "1 — nenhuma (se intubado, registre tubo à parte; a soma clássica usa 1)")]),
     ("motora", "Resposta motora", [
        (6, "6 — obedece a comandos"), (5, "5 — localiza a dor"), (4, "4 — retirada"),
        (3, "3 — flexão anormal"), (2, "2 — extensão"), (1, "1 — nenhuma")])],
    [(8, "Grave", "3 a 8."),
     (12, "Moderado", "9 a 12."),
     (15, "Leve", "13 a 15.")],
    melhor_alto=True,
    referencia="Teasdale G, Jennett B. Assessment of coma and impaired consciousness. Lancet. 1974. Teasdale G et al. The Glasgow Coma Scale at 40 years. Lancet Neurol. 2014.")

add("four", "Escala FOUR",
    "Resposta ocular, motora, de tronco e respiratória. Útil quando a verbal da Glasgow não pode ser testada. Total de 0 a 16.",
    [likert("ocular", "Resposta ocular", [
        "não abre, mesmo à dor", "abre à dor", "abre à voz forte",
        "aberta, mas não acompanha", "aberta e acompanha ou pisca ao comando"]),
     likert("motora", "Resposta motora", [
        "sem resposta ou estado mioclônico", "extensão à dor", "flexão à dor",
        "localiza a dor", "polegar, punho ou sinal de paz"]),
     likert("tronco", "Reflexos de tronco", [
        "pupila, córnea e tosse ausentes", "pupila e córnea ausentes",
        "pupila ou córnea ausente", "uma pupila larga e fixa", "pupila e córnea presentes"]),
     likert("resp", "Respiração", [
        "no ritmo do ventilador ou apneia", "respira acima do ventilador",
        "não intubado, irregular", "não intubado, Cheyne-Stokes", "não intubado, regular"])],
    [(8, "Comprometimento grave", "0 a 8."),
     (12, "Comprometimento moderado", "9 a 12."),
     (16, "Comprometimento leve ou ausente", "13 a 16.")],
    melhor_alto=True,
    referencia="Wijdicks EFM et al. Validation of a new coma scale: The FOUR score. Ann Neurol. 2005.")

add("jouvet", "Escala de coma de Jouvet",
    "Classificação clínica do rebaixamento da consciência usada no ensino de neurologia.",
    [("grau", "Grau que melhor descreve o paciente", [
        (1, "1 — obnubilação: sonolento, responde à voz, orienta-se com dificuldade"),
        (2, "2 — coma leve: não abre os olhos ao chamado, localiza a dor"),
        (3, "3 — coma médio: só retirada ou resposta inespecífica à dor"),
        (4, "4 — coma profundo: sem resposta de despertar; podem restar reflexos de tronco"),
        (5, "5 — arreativo: sem resposta e sem reflexos de tronco"),
    ])],
    [(1, "Obnubilação", "Proteger via aérea e investigar a causa."),
     (2, "Coma leve", "Monitorizar e tratar a causa."),
     (3, "Coma médio", "Risco de via aérea. Avaliação neurológica urgente."),
     (4, "Coma profundo", "Suporte avançado."),
     (5, "Coma arreativo", "Avaliar reflexos de tronco e seguir o protocolo de morte encefálica se for o caso.")],
    sobre="A Jouvet descreve perceptividade, reatividade e vigilância. Esta página registra o grau clínico correspondente, não uma soma de subitens.",
    referencia="Jouvet M. Coma and other disorders of consciousness. In: Vinken PJ, Bruyn GW, eds. Handbook of Clinical Neurology. 1969.")

add("cincinnati", "Escala de Cincinnati",
    "Triagem pré-hospitalar de acidente vascular cerebral. Qualquer item alterado é suspeita.",
    [("face", "Face", [(0, "0 — simétrica"), (1, "1 — assimetria ao sorrir ou mostrar os dentes")]),
     ("braco", "Braço", [(0, "0 — sustenta os dois por 10 segundos"), (1, "1 — um braço não sustenta ou cai")]),
     ("fala", "Fala", [(0, "0 — repete a frase corretamente"), (1, "1 — arrastada, errada ou ausente")])],
    [(0, "Sem sinal da Cincinnati", "Não afasta AVC. Seguir o protocolo se a suspeita clínica permanecer."),
     (3, "Suspeita de AVC", "Um ou mais itens. Anotar a hora do início e acionar o protocolo.")],
    referencia="Kothari RU et al. Cincinnati Prehospital Stroke Scale. Ann Emerg Med. 1999.")

add("fast", "Escala FAST",
    "Face, braço e fala na triagem do AVC. O tempo de início é registrado à parte e não entra na soma.",
    [("face", "Face", [(0, "0 — simétrica"), (1, "1 — desvio ou assimetria")]),
     ("braco", "Braço", [(0, "0 — sustenta"), (1, "1 — fraqueza ou queda")]),
     ("fala", "Fala", [(0, "0 — normal"), (1, "1 — anormal ou ausente")])],
    [(0, "FAST sem alteração", "Registrar mesmo assim a hora em que a pessoa foi vista bem pela última vez."),
     (3, "FAST alterado", "Um ou mais itens. Acionar o protocolo de AVC e anotar o horário.")],
    referencia="American Stroke Association. Stroke warning signs: Face, Arm, Speech, Time.")

NIHSS = [
    ("loc", "1a. Nível de consciência", [(0, "0 — alerta"), (1, "1 — desperta a estímulo menor"), (2, "2 — precisa de estímulo repetido ou doloroso"), (3, "3 — só reflexo ou sem resposta")]),
    ("perguntas", "1b. Perguntas (mês e idade)", [(0, "0 — duas certas"), (1, "1 — uma certa"), (2, "2 — nenhuma")]),
    ("comandos", "1c. Comandos (abrir os olhos e fechar a mão)", [(0, "0 — os dois"), (1, "1 — um"), (2, "2 — nenhum")]),
    ("olhar", "2. Olhar conjugado", [(0, "0 — normal"), (1, "1 — paralisia parcial"), (2, "2 — desvio forçado ou paralisia total")]),
    ("visual", "3. Campos visuais", [(0, "0 — sem perda"), (1, "1 — hemianopsia parcial"), (2, "2 — hemianopsia completa"), (3, "3 — cegueira bilateral ou cortical")]),
    ("face", "4. Paralisia facial", [(0, "0 — normal"), (1, "1 — apagamento do sulco"), (2, "2 — paralisia parcial"), (3, "3 — paralisia completa")]),
    ("braco_e", "5a. Braço esquerdo", [(0, "0 — não cai em 10 s"), (1, "1 — cai sem tocar a cama"), (2, "2 — algum esforço contra a gravidade"), (3, "3 — sem esforço contra a gravidade"), (4, "4 — sem movimento")]),
    ("braco_d", "5b. Braço direito", [(0, "0 — não cai em 10 s"), (1, "1 — cai sem tocar a cama"), (2, "2 — algum esforço contra a gravidade"), (3, "3 — sem esforço contra a gravidade"), (4, "4 — sem movimento")]),
    ("perna_e", "6a. Perna esquerda", [(0, "0 — não cai em 5 s"), (1, "1 — cai sem tocar a cama"), (2, "2 — algum esforço contra a gravidade"), (3, "3 — sem esforço contra a gravidade"), (4, "4 — sem movimento")]),
    ("perna_d", "6b. Perna direita", [(0, "0 — não cai em 5 s"), (1, "1 — cai sem tocar a cama"), (2, "2 — algum esforço contra a gravidade"), (3, "3 — sem esforço contra a gravidade"), (4, "4 — sem movimento")]),
    ("ataxia", "7. Ataxia de membro", [(0, "0 — ausente"), (1, "1 — um membro"), (2, "2 — dois membros")]),
    ("sensibilidade", "8. Sensibilidade", [(0, "0 — normal"), (1, "1 — perda leve a moderada"), (2, "2 — perda grave ou total")]),
    ("linguagem", "9. Linguagem", [(0, "0 — normal"), (1, "1 — afasia leve a moderada"), (2, "2 — afasia grave"), (3, "3 — mudo ou afasia global")]),
    ("disartria", "10. Disartria", [(0, "0 — normal"), (1, "1 — leve a moderada"), (2, "2 — grave ou anartria")]),
    ("extincao", "11. Extinção ou desatenção", [(0, "0 — nenhuma"), (1, "1 — uma modalidade"), (2, "2 — mais de uma modalidade")]),
]
add("nihss", "Escala NIHSS",
    "Gravidade do déficit neurológico no AVC. Total de 0 a 42.",
    NIHSS,
    [(0, "Sem déficit mensurado", "NIHSS 0."),
     (4, "Leve", "1 a 4."),
     (15, "Moderado", "5 a 15."),
     (20, "Moderado a grave", "16 a 20."),
     (42, "Grave", "21 a 42.")],
    referencia="Brott T et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989. National Institutes of Health Stroke Scale.")

add("rancholosamigos", "Escala Rancho Los Amigos",
    "Nível cognitivo-comportamental depois de lesão cerebral, de I a VIII.",
    [("nivel", "Nível", [
        (1, "I — sem resposta"),
        (2, "II — resposta generalizada"),
        (3, "III — resposta localizada"),
        (4, "IV — confuso-agitado"),
        (5, "V — confuso, inapropriado, não agitado"),
        (6, "VI — confuso, apropriado"),
        (7, "VII — automático, apropriado"),
        (8, "VIII — propositado, apropriado"),
    ])],
    [(3, "Resposta ausente ou inespecífica", "Níveis I a III."),
     (5, "Confuso", "Níveis IV e V. Proteger no nível IV."),
     (8, "Apropriado", "Níveis VI a VIII. O VIII é o mais funcional desta versão.")],
    melhor_alto=True,
    referencia="Hagen C, Malkmus D, Durham P. Levels of cognitive functioning. Rancho Los Amigos Hospital. 1972.")

add("meem", "Mini-Exame do Estado Mental",
    "Informe os pontos obtidos em cada domínio. Total de 0 a 30. O corte de 24 é o clássico; a escolaridade muda o limiar.",
    [("numero", "tempo", "Orientação no tempo (0 a 5)", 0, 5, "Ano, estação, mês, dia e dia da semana."),
     ("numero", "local", "Orientação no espaço (0 a 5)", 0, 5, "Estado, cidade, bairro, local e andar."),
     ("numero", "registro", "Registro de três palavras (0 a 3)", 0, 3, "Repetição imediata."),
     ("numero", "atencao", "Atenção e cálculo (0 a 5)", 0, 5, "Cem menos sete, cinco vezes, ou soletrar mundo de trás para frente."),
     ("numero", "evocacao", "Evocação das três palavras (0 a 3)", 0, 3, ""),
     ("numero", "linguagem", "Linguagem (0 a 8)", 0, 8, "Nomear, repetir, comando de três etapas, ler, escrever."),
     ("numero", "praxia", "Cópia do desenho (0 ou 1)", 0, 1, "")],
    [(17, "Comprometimento importante", "Reavaliar com a escolaridade. Abaixo de 20 no analfabeto já é o corte de Brucki."),
     (23, "Abaixo do corte clássico", "Menor que 24 sugere comprometimento no corte não ajustado."),
     (30, "No corte clássico ou acima", "24 a 30. Brucki: analfabeto 20, 1–4 anos 25, 5–8 anos 26, 9–11 anos 28, 12 anos ou mais 29.")],
    melhor_alto=True, formula="meem = tempo + local + registro + atencao + evocacao + linguagem + praxia", chave="meem",
    sobre="Os estímulos do teste não são reproduzidos aqui. Lance só a pontuação de cada domínio. Compare o total com a escolaridade (Brucki e colaboradores, 2003).",
    referencia="Folstein MF, Folstein SE, McHugh PR. Mini-mental state. J Psychiatr Res. 1975. Brucki SMD et al. Sugestões para o uso do mini-exame do estado mental no Brasil. Arq Neuropsiquiatr. 2003.")

add("moca", "MoCA — escore por domínio",
    "Lance os pontos de cada domínio do Montreal Cognitive Assessment. Não reproduz os estímulos do teste, que são de uso licenciado. Total até 30.",
    [("numero", "visuo", "Visuoespacial e executivo (0 a 5)", 0, 5, ""),
     ("numero", "nomeacao", "Nomeação (0 a 3)", 0, 3, ""),
     ("numero", "atencao", "Atenção (0 a 6)", 0, 6, ""),
     ("numero", "linguagem", "Linguagem (0 a 3)", 0, 3, ""),
     ("numero", "abstracao", "Abstração (0 a 2)", 0, 2, ""),
     ("numero", "evocacao", "Evocação diferida (0 a 5)", 0, 5, ""),
     ("numero", "orientacao", "Orientação (0 a 6)", 0, 6, ""),
     ("ajuste", "Ajuste de escolaridade", [
        (0, "0 — não somar"),
        (1, "1 — somar 1 se a escolaridade é de 12 anos ou menos e o bruto ainda não é 30")])],
    [(25, "Abaixo do corte", "Menor que 26 sugere comprometimento cognitivo leve, no corte original."),
     (31, "No corte ou acima", "26 a 30.")],
    melhor_alto=True,
    formula="moca = visuo + nomeacao + atencao + linguagem + abstracao + evocacao + orientacao + ajuste",
    chave="moca",
    sobre="O teste completo (trilhas, cubo, relógio, figuras e listas) pertence aos autores e não é copiado nesta página. Use a folha oficial para aplicar e lance aqui só o resultado.",
    referencia="Nasreddine ZS et al. The Montreal Cognitive Assessment, MoCA. J Am Geriatr Soc. 2005.")

add("cam", "CAM-ICU",
    "Delirium na UTI. Positivo se a alteração é aguda ou flutuante, há desatenção e, além disso, consciência alterada ou pensamento desorganizado.",
    [("inicio", "Início agudo ou curso flutuante", [(0, "0 — não"), (1, "1 — sim")]),
     ("desatencao", "Desatenção (mais de dois erros no teste de letras ou de figuras)", [(0, "0 — não"), (1, "1 — sim")]),
     ("consciencia", "Nível de consciência diferente de RASS zero", [(0, "0 — RASS zero"), (1, "1 — RASS diferente de zero")]),
     ("pensamento", "Pensamento desorganizado", [(0, "0 — não"), (1, "1 — sim")])],
    [(0, "CAM-ICU negativo", "Não preenche o critério neste momento. Reavaliar se fluctuar."),
     (4, "CAM-ICU positivo", "Tratar causa, revisar fármacos e aplicar as medidas não farmacológicas.")],
    formula="cam = inicio * desatencao * (consciencia + pensamento)", chave="cam",
    sobre="O produto é zero quando falta a alteração aguda ou a desatenção, ou quando os dois últimos itens são negativos. Qualquer valor maior que zero é positivo.",
    referencia="Ely EW et al. Delirium in mechanically ventilated patients: validity and reliability of the CAM-ICU. JAMA. 2001.")

GDS = [
    ("satisfeito", "Está satisfeito com a vida?", True),
    ("atividades", "Abandonou muitas atividades e interesses?", False),
    ("vazia", "Sente a vida vazia?", False),
    ("tedio", "Sente-se entediado com frequência?", False),
    ("animo", "Está de bom ânimo a maior parte do tempo?", True),
    ("medo", "Tem medo de que algo ruim lhe aconteça?", False),
    ("feliz", "Sente-se feliz a maior parte do tempo?", True),
    ("desamparo", "Sente-se frequentemente desamparado?", False),
    ("casa", "Prefere ficar em casa a sair e fazer coisas novas?", False),
    ("memoria", "Acha que tem mais problemas de memória do que a maioria?", False),
    ("viver", "Acha maravilhoso estar vivo?", True),
    ("inutil", "Sente-se inútil no estado atual?", False),
    ("energia", "Sente-se cheio de energia?", True),
    ("desespero", "Acha a situação sem esperança?", False),
    ("outros", "Acha que a maioria das pessoas está melhor do que você?", False),
]
add("gds", "Escala de depressão geriátrica (GDS-15)",
    "Quinze perguntas sim ou não. O ponto vale quando a resposta é a depressiva.",
    [(fid, pergunta, [
        (0 if inversa else 1, "Sim — " + ("0" if inversa else "1")),
        (1 if inversa else 0, "Não — " + ("1" if inversa else "0")),
    ]) for fid, pergunta, inversa in GDS],
    [(5, "Sem depressão pelo rastreio", "0 a 5."),
     (10, "Depressão leve", "6 a 10."),
     (15, "Depressão grave", "11 a 15. Encaminhar avaliação.")],
    sobre="Versão de 15 itens. Nas perguntas de bem-estar, o ponto é o Não.",
    referencia="Sheikh JI, Yesavage JA. Geriatric Depression Scale (GDS): recent evidence and development of a shorter version. Clin Gerontol. 1986.")

CORNELL = [
    "Ansiedade", "Tristeza", "Falta de reatividade a fatos agradáveis", "Irritabilidade",
    "Agitação", "Retardo", "Múltiplas queixas físicas", "Perda de interesse",
    "Apetite", "Perda de peso", "Falta de energia",
    "Variação diurna do humor", "Dificuldade para iniciar o sono", "Despertares múltiplos", "Despertar precoce",
    "Ideação suicida", "Baixa autoestima", "Pessimismo", "Delírios de humor",
]
add("cornell", "Escala de Cornell para depressão na demência",
    "Dezenove itens de 0 a 2, informados pelo paciente e pelo informante. Total de 0 a 38.",
    [likert(f"c{i}", nome, ["ausente", "leve ou intermitente", "grave"]) for i, nome in enumerate(CORNELL, 1)],
    [(10, "Sem depressão maior", "Até 10."),
     (18, "Depressão maior provável", "Acima de 10 até 18."),
     (38, "Depressão maior definida", "Acima de 18.")],
    referencia="Alexopoulos GS et al. Cornell Scale for Depression in Dementia. Biol Psychiatry. 1988.")

add("hamilton", "Escala de Hamilton para ansiedade (HAM-A)",
    "Quatorze itens de 0 a 4. Total de 0 a 56.",
    [likert(f"h{i}", nome, g04()) for i, nome in enumerate([
        "Humor ansioso", "Tensão", "Medos", "Insônia", "Dificuldade intelectual",
        "Humor deprimido", "Sintomas musculares", "Sintomas sensoriais",
        "Sintomas cardiovasculares", "Sintomas respiratórios", "Sintomas gastrintestinais",
        "Sintomas geniturinários", "Sintomas autonômicos", "Comportamento na entrevista",
    ], 1)],
    [(17, "Ansiedade leve", "Até 17."),
     (24, "Ansiedade leve a moderada", "18 a 24."),
     (30, "Ansiedade moderada a grave", "25 a 30."),
     (56, "Ansiedade grave", "31 ou mais.")],
    referencia="Hamilton M. The assessment of anxiety states by rating. Br J Med Psychol. 1959.")

ZARIT = [
    "Pede mais ajuda do que precisa", "Não sobra tempo para você",
    "Estresse entre o cuidado e outras responsabilidades", "Constrangimento com o comportamento",
    "Raiva quando a pessoa está por perto", "A relação foi prejudicada",
    "Medo do que o futuro reserva", "A pessoa depende de você",
    "Sente-se tenso perto da pessoa", "A saúde foi afetada",
    "Não tem privacidade suficiente", "A vida social foi prejudicada",
    "Desconforto em receber visitas por causa da pessoa", "A pessoa espera que só você cuide dela",
    "Dinheiro insuficiente para o cuidado", "Não conseguirá cuidar por muito mais tempo",
    "Perdeu o controle da própria vida", "Gostaria de entregar o cuidado a outra pessoa",
    "Incerteza sobre o que fazer", "Sente que deveria fazer mais",
    "Sente que poderia cuidar melhor", "De modo global, quanto se sente sobrecarregado",
]
add("zarit", "Escala de Zarit",
    "Sobrecarga do cuidador. Vinte e dois itens de 0 a 4. Total de 0 a 88.",
    [likert(f"z{i}", texto, ["nunca", "raramente", "às vezes", "frequentemente", "quase sempre"])
     for i, texto in enumerate(ZARIT, 1)],
    [(20, "Sobrecarga ausente ou leve", "0 a 20."),
     (40, "Sobrecarga leve a moderada", "21 a 40."),
     (60, "Sobrecarga moderada a grave", "41 a 60."),
     (88, "Sobrecarga grave", "61 a 88. Oferecer suporte ao cuidador.")],
    referencia="Zarit SH, Reever KE, Bach-Peterson J. Relatives of the impaired elderly: correlates of feelings of burden. Gerontologist. 1980.")

# --- funcional ---

add("katz", "Índice de Katz",
    "Atividades básicas da vida diária. Cada independência vale 1. Total de 0 a 6.",
    [zero_um(fid, rot, "independente") for fid, rot in [
        ("banho", "Banho"), ("vestir", "Vestir-se"), ("banheiro", "Uso do banheiro"),
        ("transferir", "Transferência"), ("continencia", "Continência"), ("alimentar", "Alimentação"),
    ]],
    [(1, "Dependência importante", "0 ou 1 atividade independente."),
     (3, "Dependência acentuada", "2 ou 3."),
     (5, "Dependência parcial", "4 ou 5."),
     (6, "Independente", "As seis atividades.")],
    melhor_alto=True,
    referencia="Katz S et al. Studies of illness in the aged. The index of ADL. JAMA. 1963.")

add("lawton", "Escala de Lawton",
    "Atividades instrumentais. Cada uma independente vale 1. Total de 0 a 8.",
    [zero_um(fid, rot, "independente") for fid, rot in [
        ("telefone", "Usar o telefone"), ("compras", "Fazer compras"),
        ("comida", "Preparar comida"), ("casa", "Cuidar da casa"),
        ("roupa", "Lavar roupa"), ("transporte", "Usar transporte"),
        ("medicacao", "Tomar a própria medicação"), ("dinheiro", "Cuidar do dinheiro"),
    ]],
    [(2, "Dependência importante", "Até 2."),
     (5, "Dependência parcial", "3 a 5."),
     (8, "Independente", "6 a 8. A versão original às vezes omite três itens domésticos nos homens; registre quais foram avaliados.")],
    melhor_alto=True,
    referencia="Lawton MP, Brody EM. Assessment of older people: self-maintaining and instrumental activities of daily living. Gerontologist. 1969.")

add("lachs", "Rastreio funcional de Lachs",
    "Onze itens. Marque sim quando o rastreio daquele domínio está alterado.",
    [zero_um(fid, rot, "alterado") for fid, rot in [
        ("visao", "Visão"), ("audicao", "Audição"), ("braco", "Função do braço"),
        ("perna", "Função da perna"), ("urina", "Continência urinária"),
        ("nutricao", "Nutrição ou perda de peso"), ("cognicao", "Estado mental"),
        ("humor", "Humor deprimido"), ("avd", "Atividades de vida diária"),
        ("casa", "Ambiente doméstico inseguro"), ("apoio", "Apoio social insuficiente"),
    ]],
    [(0, "Nenhum item alterado", "Repetir o rastreio no intervalo institucional."),
     (2, "Poucos itens alterados", "Investigar cada um."),
     (11, "Vários itens alterados", "Três ou mais. Avaliação geriátrica ampla.")],
    referencia="Lachs MS et al. A simple procedure for general screening for functional disability in elderly patients. Ann Intern Med. 1990.")

# --- obstetrícia e neonatologia ---

add("bishop", "Escore de Bishop",
    "Maturidade do colo para indução do parto. Total de 0 a 13.",
    [("dilatacao", "Dilatação", [
        (0, "0 — fechado"), (1, "1 — 1 a 2 cm"), (2, "2 — 3 a 4 cm"), (3, "3 — 5 cm ou mais")]),
     ("apagamento", "Apagamento", [
        (0, "0 — 0 a 30%"), (1, "1 — 40 a 50%"), (2, "2 — 60 a 70%"), (3, "3 — 80% ou mais")]),
     ("plano", "Plano da apresentação", [
        (0, "0 — −3"), (1, "1 — −2"), (2, "2 — −1 ou 0"), (3, "3 — +1 ou +2")]),
     ("consistencia", "Consistência", [
        (0, "0 — firme"), (1, "1 — média"), (2, "2 — amolecida")]),
     ("posicao", "Posição", [
        (0, "0 — posterior"), (1, "1 — média"), (2, "2 — anterior")])],
    [(5, "Desfavorável", "Até 5. A indução tem menor chance de sucesso."),
     (8, "Intermediário", "6 a 8."),
     (13, "Favorável", "9 ou mais.")],
    melhor_alto=True,
    referencia="Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964.")

BALLARD_NEURO = [
    ("postura", "Postura", [(0, "0 — extensão"), (1, "1 — flexão parcial das pernas"),
                            (2, "2 — flexão de braços e pernas"), (3, "3 — flexão dos quatro membros"),
                            (4, "4 — flexão acentuada")]),
    ("punho", "Ângulo do punho", [(-1, "−1 — maior que 90°"), (0, "0 — 90°"), (1, "1 — 60°"),
                                  (2, "2 — 45°"), (3, "3 — 30°"), (4, "4 — 0°")]),
    ("braco", "Recuo do braço", [(0, "0 — 180°"), (1, "1 — 140 a 180°"), (2, "2 — 110 a 140°"),
                                 (3, "3 — 90 a 110°"), (4, "4 — menor que 90°")]),
    ("popliteo", "Ângulo poplíteo", [(-1, "−1 — 180°"), (0, "0 — 160°"), (1, "1 — 140°"),
                                     (2, "2 — 120°"), (3, "3 — 100°"), (4, "4 — 90°"), (5, "5 — menor que 90°")]),
    ("xale", "Sinal do xale", [(-1, "−1 — cotovelo passa a linha axilar oposta"),
                               (0, "0 — cotovelo na linha axilar oposta"),
                               (1, "1 — cotovelo além da linha média"),
                               (2, "2 — cotovelo na linha média"),
                               (3, "3 — cotovelo não chega à linha média"),
                               (4, "4 — cotovelo perto do ombro")]),
    ("calcaneo", "Calcanhar-orelha", [(-1, "−1 — sem resistência"), (0, "0 — pouca resistência"),
                                      (1, "1 — resistência leve"), (2, "2 — resistência moderada"),
                                      (3, "3 — resistência importante"), (4, "4 — pernas permanecem estendidas")]),
]
BALLARD_FIS = [
    ("pele", "Pele", [(-1, "−1 — pegajosa, friável, transparente"), (0, "0 — gelatinosa, vermelha"),
                      (1, "1 — lisa, rosada, veias visíveis"), (2, "2 — descamação superficial"),
                      (3, "3 — áreas pálidas, raras veias"), (4, "4 — fissuras, sem veias"),
                      (5, "5 — couro, rachada")]),
    ("lanugo", "Lanugo", [(-1, "−1 — ausente"), (0, "0 — esparso"), (1, "1 — abundante"),
                          (2, "2 — afinando"), (3, "3 — áreas sem pelo"), (4, "4 — quase ausente")]),
    ("plantar", "Superfície plantar", [(-1, "−1 — menor que 40 mm, sem pregas"),
                                       (0, "0 — maior que 50 mm, sem pregas"),
                                       (1, "1 — marcas vermelhas tênues"),
                                       (2, "2 — prega transversa anterior"),
                                       (3, "3 — pregas nos dois terços anteriores"),
                                       (4, "4 — pregas em toda a planta")]),
    ("mama", "Mama", [(-1, "−1 — imperceptível"), (0, "0 — pouco perceptível"),
                      (1, "1 — aréola plana, sem broto"), (2, "2 — broto de 1 a 2 mm"),
                      (3, "3 — broto de 3 a 4 mm"), (4, "4 — broto de 5 a 10 mm")]),
    ("olho", "Olho e orelha", [(-1, "−1 — pálpebras fundidas, frouxas"),
                               (0, "0 — pálpebras fundidas, firmes"),
                               (1, "1 — pavilhão plano, fica dobrado"),
                               (2, "2 — pavilhão curvo, recolhe devagar"),
                               (3, "3 — formado e firme, recolhe pronto"),
                               (4, "4 — cartilagem espessa")]),
    ("genitalia", "Genitália do sexo do recém-nascido", [
        (-1, "−1 — escroto liso e vazio, ou clitóris proeminente com lábios planos"),
        (0, "0 — escroto vazio com rugas mínimas, ou pequenos lábios salientes"),
        (1, "1 — testículos no canal alto, ou clitóris visível e pequenos lábios proeminentes"),
        (2, "2 — testículos em descenso, ou grandes e pequenos lábios iguais"),
        (3, "3 — testículos na bolsa, ou grandes lábios cobrem os pequenos"),
        (4, "4 — testículos pendentes, ou grandes lábios cobrem clitóris e pequenos lábios"),
    ]),
]
add("ballard", "New Ballard Score",
    "Idade gestacional pelo New Ballard. A soma vai de −10 a 50 e cada 5 pontos equivalem a 2 semanas, a partir de 20.",
    BALLARD_NEURO + BALLARD_FIS,
    [(36.9, "Pré-termo", "Menos de 37 semanas."),
     (41.9, "A termo", "37 a 41 semanas."),
     (50, "Pós-termo", "42 semanas ou mais.")],
    formula=("total = postura + punho + braco + popliteo + xale + calcaneo + pele + lanugo "
             "+ plantar + mama + olho + genitalia; semanas = 24 + total * 0.4"),
    chave="semanas", unidade="semanas", decimais=1,
    sobre="Escolha, na genitália, o critério do sexo do recém-nascido. Semanas = 24 + 0,4 × escore.",
    referencia="Ballard JL et al. New Ballard Score, expanded to include extremely premature infants. J Pediatr. 1991.")

add("capurro", "Método de Capurro somático",
    "Idade gestacional somática. Dias = 204 + escore. O método somatoneurológico usa outros sinais e a constante 200; não está nesta página.",
    [("pele", "Textura da pele", [(0, "0 — gelatinosa"), (5, "5 — fina e lisa"), (10, "10 — mais grossa, descamação superficial"),
                                  (15, "15 — grossa, fissuras superficiais"), (20, "20 — grossa, fissuras profundas")]),
     ("orelha", "Forma da orelha", [(0, "0 — chata, sem incurvação"), (8, "8 — borda parcial"),
                                    (16, "16 — pavilhão parcialmente incurvado"), (24, "24 — pavilhão incurvado")]),
     ("glandula", "Tamanho da glândula mamária", [(0, "0 — não palpável"), (5, "5 — palpável até 5 mm"),
                                                  (10, "10 — 5 a 10 mm"), (15, "15 — maior que 10 mm")]),
     ("mamilo", "Formação do mamilo", [(0, "0 — pouco visível, sem aréola"), (5, "5 — visível, aréola lisa e menor que 7,5 mm"),
                                       (10, "10 — pontilhado, aréola maior que 7,5 mm"), (15, "15 — aréola de borda elevada")]),
     ("pregas", "Pregas plantares", [(0, "0 — sem pregas"), (5, "5 — marcas mal definidas"),
                                     (10, "10 — marcas na metade anterior"), (15, "15 — marcas além da metade anterior"),
                                     (20, "20 — pregas em toda a planta")])],
    [(36.9, "Pré-termo", "Menos de 37 semanas."),
     (41.9, "A termo", "37 a 41 semanas."),
     (50, "Pós-termo", "42 semanas ou mais.")],
    formula="soma = pele + orelha + glandula + mamilo + pregas; dias = 204 + soma; semanas = dias / 7",
    chave="semanas", unidade="semanas", decimais=1,
    referencia="Capurro H et al. A simplified method for diagnosis of gestational age in the newborn infant. J Pediatr. 1978.")

add("silverman", "Boletim de Silverman-Andersen",
    "Desconforto respiratório do recém-nascido. Cinco sinais de 0 a 2. Total de 0 a 10.",
    [likert(fid, rot, ["ausente", "leve", "acentuado"]) for fid, rot in [
        ("torax_sup", "Retração torácica superior"),
        ("torax_inf", "Retração torácica inferior"),
        ("xifoide", "Retração xifoide"),
        ("batimento", "Batimento de asa de nariz"),
        ("gemido", "Gemido expiratório"),
    ]],
    [(3, "Desconforto leve", "0 a 3."),
     (6, "Desconforto moderado", "4 a 6."),
     (10, "Desconforto grave", "7 a 10.")],
    referencia="Silverman WA, Andersen DH. A controlled clinical trial of effects of water mist on obstructive respiratory signs, death rate and necropsy findings among premature infants. Pediatrics. 1956.")

add("downes", "Wood-Downes modificada por Ferres",
    "Desconforto respiratório e bronquiolite no lactente. Cinco itens de 0 a 3.",
    [("sibilo", "Sibilos", [(0, "0 — ausentes"), (1, "1 — no fim da expiração"),
                            (2, "2 — em toda a expiração"), (3, "3 — inspiração e expiração")]),
     ("tiragem", "Tiragem", [(0, "0 — ausente"), (1, "1 — subcostal ou intercostal"),
                              (2, "2 — mais supraclavicular ou batimento nasal leve"),
                              (3, "3 — universal, com batimento de asa")]),
     ("fr", "Frequência respiratória do lactente", [(0, "0 — até 30"), (1, "1 — 31 a 45"),
                                                     (2, "2 — 46 a 60"), (3, "3 — acima de 60")]),
     ("fc", "Frequência cardíaca", [(0, "0 — abaixo de 120"), (1, "1 — 120 a 140"),
                                     (2, "2 — 141 a 160"), (3, "3 — acima de 160")]),
     ("entrada", "Entrada de ar e cianose", [
        (0, "0 — boa, sem cianose"), (1, "1 — diminuída ou cianose ao chorar"),
        (2, "2 — muito diminuída ou cianose em ar ambiente"),
        (3, "3 — quase ausente ou cianose em repouso")])],
    [(3, "Leve", "0 a 3."),
     (7, "Moderado", "4 a 7."),
     (15, "Grave", "8 a 15.")],
    referencia="Wood DW, Downes JJ, Lecks HI. A clinical scoring system for the diagnosis of respiratory failure. Am J Dis Child. 1972. Modificação de Ferres.")

add("meows", "MEOWS",
    "Escore obstétrico de alerta precoce, no formato somado. Um parâmetro com 3 pontos, mesmo isolado, também pede avaliação imediata.",
    [("fr", "Frequência respiratória", [
        (3, "3 — 9 ou menos, ou 30 ou mais"), (2, "2 — 25 a 29"),
        (1, "1 — 21 a 24"), (0, "0 — 10 a 20")]),
     ("spo2", "Saturação de oxigênio", [
        (3, "3 — 93% ou menos"), (2, "2 — 94 ou 95%"), (0, "0 — 96% ou mais")]),
     ("temp", "Temperatura (°C)", [
        (3, "3 — 35 ou menos"), (1, "1 — 35,1 a 36"), (0, "0 — 36,1 a 37,9"),
        (1, "1 — 38 a 38,9"), (2, "2 — 39 ou mais")]),
     ("pas", "Pressão arterial sistólica", [
        (3, "3 — 90 ou menos, ou 160 ou mais"), (2, "2 — 91 a 100, ou 140 a 159"),
        (0, "0 — 101 a 139")]),
     ("pad", "Pressão arterial diastólica", [
        (3, "3 — 110 ou mais"), (2, "2 — 90 a 109"), (0, "0 — abaixo de 90")]),
     ("fc", "Frequência cardíaca", [
        (3, "3 — abaixo de 50 ou acima de 120"), (2, "2 — 111 a 120"),
        (1, "1 — 100 a 110"), (0, "0 — 50 a 99")]),
     ("consciencia", "Consciência", [(0, "0 — alerta"), (3, "3 — alterada")]),
     ("aspecto", "Aspecto clínico", [(0, "0 — habitual"), (2, "2 — a equipe se preocupa com o aspecto")]),
    ],
    [(1, "Rotina", "0 ou 1, e nenhum parâmetro em 3."),
     (3, "Alerta", "2 ou 3. Avisar a equipe e repetir em curto prazo."),
     (24, "Resposta imediata", "4 ou mais, ou qualquer parâmetro vermelho de 3 pontos.")],
    sobre="Os limites são os gatilhos usuais do MEOWS britânico convertidos em pontos (vermelho 3, âmbar 1 ou 2). Confirme o cartão da maternidade se os cortes locais forem outros.",
    referencia="Lewis G, ed. Saving Mothers' Lives: CEMACH. The Seventh Report on Confidential Enquiries into Maternal Deaths. 2007.")

add("pews", "PEWS de Brighton",
    "Alerta pediátrico em comportamento, circulação e respiração, mais dois pontos se houver nebulização contínua ou vômito persistente.",
    [likert("comportamento", "Comportamento",
            ["brincando ou apropriado", "sonolento", "irritável", "letárgico, confuso ou resposta reduzida à dor"]),
     likert("circulacao", "Circulação",
            ["rosado, enchimento capilar 1 a 2 s", "pálido ou enchimento de 3 s",
             "acinzentado ou enchimento de 4 s, ou taquicardia acima do esperado",
             "moteado, acinzentado, enchimento de 5 s ou mais, ou bradicardia"]),
     likert("respiracao", "Respiração",
            ["normal para a idade, sem esforço", "mais de 10 acima do normal ou uso leve de músculo acessório",
             "mais de 20 acima do normal, retração ou 50% ou mais de oxigênio",
             "mais de 5 abaixo do normal, gemido, estridor ou 50% ou mais com retração grave"]),
     ("extra", "Nebulização ou vômito", [
        (0, "0 — não"), (2, "2 — nebulização a cada 15 minutos ou vômito persistente")])],
    [(2, "Rotina", "0 a 2."),
     (4, "Chamar avaliação", "3 ou 4. Um domínio isolado em 3 também pede revisão."),
     (11, "Resposta imediata", "5 ou mais.")],
    referencia="Monaghan A. Detecting and managing deterioration in children. Paediatr Nurs. 2005. PEWS de Brighton.")

add("prism", "PRISM",
    "Parâmetros fisiológicos do PRISM original para gravidade em terapia intensiva pediátrica. Não calcula a mortalidade do PRISM III ou IV, que são licenciados.",
    [("pas", "Pressão arterial sistólica", [
        (0, "0 — na faixa esperada para a idade"),
        (2, "2 — baixa para a idade, sem choque"),
        (6, "6 — muito baixa para a idade ou em choque")]),
     ("fc", "Frequência cardíaca", [
        (0, "0 — na faixa"), (4, "4 — taquicardia ou bradicardia acentuada para a idade")]),
     ("fr", "Frequência respiratória ou apneia", [
        (0, "0 — na faixa"), (1, "1 — taquipneia acentuada"), (5, "5 — apneia")]),
     ("oxigenacao", "Oxigenação", [
        (0, "0 — PaO₂/FiO₂ acima de 300, sem suporte invocado"),
        (2, "2 — PaO₂/FiO₂ 200 a 300"),
        (3, "3 — PaO₂/FiO₂ abaixo de 200 ou PaCO₂ acima de 50 mmHg")]),
     ("glasgow", "Glasgow", [
        (0, "0 — 15"), (1, "1 — 13 ou 14"), (3, "3 — 8 a 12"), (5, "5 — 7 ou menos")]),
     ("pupila", "Pupilas", [(0, "0 — reagentes"), (4, "4 — uma ou as duas fixas")]),
     ("coagulacao", "Coagulação", [
        (0, "0 — TP e TTPa habituais"), (2, "2 — TP ou TTPa acima de 1,5 vez o controle")]),
     ("bilirrubina", "Bilirrubina total", [
        (0, "0 — abaixo de 2 mg/dL fora do período neonatal imediato"),
        (6, "6 — 2 mg/dL ou mais")]),
     ("potassio", "Potássio", [
        (0, "0 — 3 a 6,5 mEq/L"), (1, "1 — 6,5 a 7,5"), (5, "5 — abaixo de 3 ou acima de 7,5")]),
     ("calcio", "Cálcio total", [
        (0, "0 — 8 a 12 mg/dL"), (2, "2 — 7 a 8 ou 12 a 15"), (6, "6 — abaixo de 7 ou acima de 15")]),
     ("glicose", "Glicose", [
        (0, "0 — 40 a 200 mg/dL"), (4, "4 — abaixo de 40 ou acima de 200"),
        (8, "8 — abaixo de 40 com convulsão ou acima de 400")]),
     ("bicarbonato", "Bicarbonato", [
        (0, "0 — acima de 16 mEq/L"), (3, "3 — 16 ou menos")]),
    ],
    [(5, "Disfunção leve", "Reavaliar a tendência, não um percentual de morte."),
     (15, "Disfunção moderada", "Suporte de órgão e reavaliação seriada."),
     (40, "Disfunção grave", "Quanto maior o escore, maior a gravidade fisiológica.")],
    sobre="Os pesos seguem a lógica publicada do PRISM de Pollack (1988) em faixas de beira-leito. Pressão e frequência precisam ser julgadas para a idade. O PRISM III e o IV têm tabelas licenciadas e não são calculados aqui.",
    referencia="Pollack MM, Ruttimann UE, Getson PR. Pediatric risk of mortality (PRISM) score. Crit Care Med. 1988.")

add("pelod", "PELOD-2",
    "Disfunção de órgãos pediátrica. Os cortes de PAM e creatinina dependem da idade: escolha a opção depois de consultar a linha etária da tabela.",
    [("glasgow", "Glasgow", [(0, "0 — 11 ou mais"), (1, "1 — 5 a 10"), (4, "4 — 3 ou 4")]),
     ("pupila", "Pupilas", [(0, "0 — as duas reagentes"), (5, "5 — as duas fixas")]),
     ("lactato", "Lactato", [(0, "0 — abaixo de 5 mmol/L"), (1, "1 — 5 a 10,9"), (4, "4 — 11 ou mais")]),
     ("pam", "Pressão arterial média", [
        (0, "0 — na faixa etária do PELOD-2"),
        (2, "2 — abaixo do limite etário do PELOD-2"),
        (4, "4 — muito abaixo do limite, com sinais de hipoperfusão")]),
     ("creatinina", "Creatinina", [
        (0, "0 — abaixo do limite etário"),
        (2, "2 — no primeiro degrau acima do limite etário"),
        (4, "4 — no degrau máximo da tabela etária")]),
     ("pao2", "PaO₂/FiO₂", [(0, "0 — acima de 60"), (2, "2 — 60 ou menos, ou PaCO₂ acima de 58 mmHg")]),
     ("vm", "Ventilação mecânica invasiva", [(0, "0 — não"), (3, "3 — sim")]),
     ("leucocitos", "Leucócitos", [(0, "0 — 2.000/mm³ ou mais"), (2, "2 — abaixo de 2.000/mm³")]),
     ("plaquetas", "Plaquetas", [
        (0, "0 — 142.000/mm³ ou mais"), (1, "1 — 77.000 a 141.000"), (2, "2 — abaixo de 77.000")]),
    ],
    [(5, "Disfunção leve", "Reavaliar em série. A mortalidade do modelo logístico não é calculada nesta página."),
     (10, "Disfunção moderada", "Suporte de órgão."),
     (30, "Disfunção grave", "Quanto maior o escore, maior a disfunção orgânica.")],
    sobre="Leteurtre e colaboradores, 2013. PAM e creatinina têm limites por idade na tabela original; a opção deve ser a da linha etária, não um número único para toda criança.",
    referencia="Leteurtre S et al. PELOD-2: an update of the Pediatric Logistic Organ Dysfunction score. Crit Care Med. 2013.")

# --- gravidade e triagem ---

add("news", "NEWS2",
    "Alerta precoce em adulto. Escala 1 de saturação. Um parâmetro isolado com 3 pontos também exige resposta urgente.",
    [("fr", "Frequência respiratória", [
        (3, "3 — 8 ou menos"), (1, "1 — 9 a 11"), (0, "0 — 12 a 20"),
        (2, "2 — 21 a 24"), (3, "3 — 25 ou mais")]),
     ("spo2", "Saturação, escala 1", [
        (3, "3 — 91% ou menos"), (2, "2 — 92 ou 93%"), (1, "1 — 94 ou 95%"), (0, "0 — 96% ou mais")]),
     ("oxigenio", "Oxigênio suplementar", [(0, "0 — ar ambiente"), (2, "2 — em uso")]),
     ("pas", "Pressão arterial sistólica", [
        (3, "3 — 90 ou menos"), (2, "2 — 91 a 100"), (1, "1 — 101 a 110"),
        (0, "0 — 111 a 219"), (3, "3 — 220 ou mais")]),
     ("fc", "Frequência cardíaca", [
        (3, "3 — 40 ou menos"), (1, "1 — 41 a 50"), (0, "0 — 51 a 90"),
        (1, "1 — 91 a 110"), (2, "2 — 111 a 130"), (3, "3 — 131 ou mais")]),
     ("consciencia", "Consciência", [(0, "0 — alerta"), (3, "3 — confusão nova, voz, dor ou irresponsivo")]),
     ("temp", "Temperatura (°C)", [
        (3, "3 — 35 ou menos"), (1, "1 — 35,1 a 36"), (0, "0 — 36,1 a 38"),
        (1, "1 — 38,1 a 39"), (2, "2 — 39,1 ou mais")])],
    [(4, "Baixo", "0 a 4. Se houver um parâmetro em 3, responda como risco baixo-médio."),
     (6, "Médio", "5 ou 6. Avaliação urgente."),
     (20, "Alto", "7 ou mais. Resposta de emergência.")],
    sobre="Escala 1 de saturação. Para insuficiência respiratória hipercápnica use a escala 2 do cartão oficial, que não está nesta página.",
    referencia="Royal College of Physicians. National Early Warning Score (NEWS) 2. London: RCP; 2017.")

add("qsofa", "qSOFA",
    "Dois ou mais pontos, com suspeita de infecção, identificam maior risco de desfecho ruim.",
    [("fr", "Frequência respiratória de 22 ou mais", [(0, "0 — não"), (1, "1 — sim")]),
     ("pas", "Pressão arterial sistólica de 100 mmHg ou menos", [(0, "0 — não"), (1, "1 — sim")]),
     ("glasgow", "Glasgow menor que 15", [(0, "0 — não"), (1, "1 — sim")])],
    [(1, "qSOFA baixo", "0 ou 1. Não afasta sepse."),
     (3, "qSOFA alto", "2 ou 3. Avaliar disfunção orgânica e não atrasar o tratamento.")],
    referencia="Seymour CW et al. Assessment of clinical criteria for sepsis. JAMA. 2016.")

add("sofa", "SOFA",
    "Disfunção de seis órgãos, de 0 a 4 cada um. Total de 0 a 24. O aumento em relação ao basal importa tanto quanto o valor.",
    [("resp", "Respiração (PaO₂/FiO₂)", [
        (0, "0 — 400 ou mais"), (1, "1 — menos de 400"), (2, "2 — menos de 300"),
        (3, "3 — menos de 200 com suporte ventilatório"), (4, "4 — menos de 100 com suporte ventilatório")]),
     ("coag", "Coagulação (plaquetas ×10³/mm³)", [
        (0, "0 — 150 ou mais"), (1, "1 — menos de 150"), (2, "2 — menos de 100"),
        (3, "3 — menos de 50"), (4, "4 — menos de 20")]),
     ("figado", "Fígado (bilirrubina mg/dL)", [
        (0, "0 — menor que 1,2"), (1, "1 — 1,2 a 1,9"), (2, "2 — 2 a 5,9"),
        (3, "3 — 6 a 11,9"), (4, "4 — 12 ou mais")]),
     ("cardio", "Cardiovascular", [
        (0, "0 — sem hipotensão"), (1, "1 — PAM menor que 70 mmHg"),
        (2, "2 — dopamina até 5 µg/kg/min ou qualquer dobutamina"),
        (3, "3 — dopamina acima de 5, ou adrenalina/noradrenalina até 0,1 µg/kg/min"),
        (4, "4 — dopamina acima de 15, ou adrenalina/noradrenalina acima de 0,1 µg/kg/min")]),
     ("neuro", "Neurológico (Glasgow)", [
        (0, "0 — 15"), (1, "1 — 13 ou 14"), (2, "2 — 10 a 12"),
        (3, "3 — 6 a 9"), (4, "4 — menor que 6")]),
     ("renal", "Renal", [
        (0, "0 — creatinina menor que 1,2 mg/dL"),
        (1, "1 — 1,2 a 1,9"),
        (2, "2 — 2 a 3,4"),
        (3, "3 — 3,5 a 4,9 ou diurese menor que 500 mL/dia"),
        (4, "4 — 5 ou mais, ou diurese menor que 200 mL/dia")])],
    [(1, "Disfunção mínima", "0 ou 1."),
     (6, "Disfunção leve a moderada", "2 a 6."),
     (9, "Disfunção importante", "7 a 9."),
     (12, "Disfunção grave", "10 a 12."),
     (24, "Disfunção muito grave", "13 a 24. A mortalidade varia com a população; use a tendência de 24 horas.")],
    referencia="Vincent JL et al. The SOFA score to describe organ dysfunction/failure. Intensive Care Med. 1996.")

add("curb-65", "CURB-65",
    "Gravidade da pneumonia adquirida na comunidade. Total de 0 a 5.",
    [("confusao", "Confusão mental", [(0, "0 — não"), (1, "1 — sim")]),
     ("ureia", "Ureia acima de 42 mg/dL (7 mmol/L)", [(0, "0 — não"), (1, "1 — sim")]),
     ("fr", "Frequência respiratória de 30 ou mais", [(0, "0 — não"), (1, "1 — sim")]),
     ("pressao", "Pressão sistólica abaixo de 90 ou diastólica de 60 ou menos", [(0, "0 — não"), (1, "1 — sim")]),
     ("idade", "Idade de 65 anos ou mais", [(0, "0 — não"), (1, "1 — sim")])],
    [(1, "Baixo — em geral ambulatorial", "0 ou 1. Mortalidade baixa no estudo original."),
     (2, "Considerar internação", "Escore 2."),
     (3, "Internação, avaliar gravidade", "Escore 3."),
     (5, "Alto — considerar UTI", "4 ou 5.")],
    referencia="Lim WS et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax. 2003.")

SAPS_ITENS = [
    ("idade", "Idade", [(0, "0 — menor de 40"), (5, "5 — 40 a 59"), (9, "9 — 60 a 69"),
                        (13, "13 — 70 a 74"), (15, "15 — 75 a 79"), (18, "18 — 80 ou mais")]),
    ("permanencia", "Dias no hospital antes da UTI", [(0, "0 — menos de 14"), (6, "6 — 14 a 27"), (7, "7 — 28 ou mais")]),
    ("procedencia", "Local antes da UTI", [(0, "0 — centro cirúrgico"), (5, "5 — emergência"),
                                            (7, "7 — outra UTI"), (8, "8 — enfermaria ou outro")]),
    ("vasoativa", "Droga vasoativa antes da UTI", [(0, "0 — não"), (3, "3 — sim")]),
    ("cancer_terapia", "Terapia oncológica, imunossupressão ou corticoide", [(0, "0 — não"), (3, "3 — sim")]),
    ("cancer_hemato", "Câncer hematológico", [(0, "0 — não"), (6, "6 — sim")]),
    ("ic_nyha", "Insuficiência cardíaca NYHA IV", [(0, "0 — não"), (6, "6 — sim")]),
    ("cirrose", "Cirrose", [(0, "0 — não"), (8, "8 — sim")]),
    ("aids", "AIDS", [(0, "0 — não"), (8, "8 — sim")]),
    ("cancer_meta", "Câncer metastático", [(0, "0 — não"), (11, "11 — sim")]),
    ("admissao", "Admissão na UTI", [(0, "0 — planejada"), (3, "3 — não planejada")]),
    ("cirurgia", "Situação cirúrgica", [(0, "0 — cirurgia eletiva"), (5, "5 — sem cirurgia"), (6, "6 — cirurgia de emergência")]),
    ("sitio", "Sítio cirúrgico, se houver", [
        (-11, "−11 — transplante"), (-8, "−8 — trauma isolado ou múltiplo"),
        (-6, "−6 — revascularização miocárdica sem troca valvar"),
        (0, "0 — outro ou sem cirurgia"), (5, "5 — neurocirurgia por acidente vascular")]),
    ("ritmo", "Motivo: distúrbio do ritmo", [(0, "0 — não"), (-5, "−5 — sim. Se também houver convulsão, deixe este em não e marque só a convulsão")]),
    ("convulsao", "Motivo: convulsão", [(0, "0 — não"), (-4, "−4 — sim")]),
    ("choque_hipo", "Motivo: choque hipovolêmico ou abdome agudo", [(0, "0 — não"), (3, "3 — sim")]),
    ("choque_septico", "Motivo: choque séptico, anafilático, misto ou indefinido", [(0, "0 — não"), (5, "5 — sim")]),
    ("coma_neuro", "Motivo: coma, estupor, agitação, confusão ou delirium", [(0, "0 — não"), (4, "4 — sim")]),
    ("falencia_hepatica", "Motivo: falência hepática", [(0, "0 — não"), (6, "6 — sim")]),
    ("deficit_focal", "Motivo: déficit neurológico focal", [(0, "0 — não"), (7, "7 — sim")]),
    ("pancreatite", "Motivo: pancreatite grave", [(0, "0 — não"), (9, "9 — sim")]),
    ("efeito_massa", "Motivo: efeito de massa intracraniano", [(0, "0 — não"), (10, "10 — sim")]),
    ("infeccao_nosocomial", "Infecção adquirida no hospital", [(0, "0 — não"), (4, "4 — sim")]),
    ("infeccao_resp", "Infecção do trato respiratório inferior", [(0, "0 — não"), (5, "5 — sim")]),
    ("gcs", "Menor Glasgow estimado", [(15, "15 — 3 ou 4"), (10, "10 — 5"), (7, "7 — 6"),
                                       (2, "2 — 7 a 12"), (0, "0 — 13 ou mais")]),
    ("bilirrubina", "Maior bilirrubina", [(0, "0 — menor que 2 mg/dL"), (4, "4 — 2 a menos de 6"), (5, "5 — 6 ou mais")]),
    ("temperatura", "Maior temperatura", [(7, "7 — menor que 35 °C"), (0, "0 — 35 ou mais")]),
    ("creatinina", "Maior creatinina", [(0, "0 — menor que 1,2 mg/dL"), (2, "2 — 1,2 a menos de 2"),
                                        (7, "7 — 2 a menos de 3,5"), (8, "8 — 3,5 ou mais")]),
    ("fc", "Maior frequência cardíaca", [(0, "0 — menor que 120"), (5, "5 — 120 a 159"), (7, "7 — 160 ou mais")]),
    ("leucocitos", "Maior leucócito", [(0, "0 — menor que 15.000/mm³"), (2, "2 — 15.000 ou mais")]),
    ("ph", "Menor pH", [(3, "3 — 7,25 ou menos"), (0, "0 — maior que 7,25")]),
    ("plaquetas", "Menor plaqueta", [(13, "13 — menor que 20.000"), (8, "8 — 20.000 a menos de 50.000"),
                                     (5, "5 — 50.000 a menos de 100.000"), (0, "0 — 100.000 ou mais")]),
    ("pas", "Menor pressão sistólica", [(11, "11 — menor que 40"), (8, "8 — 40 a 69"),
                                        (3, "3 — 70 a 119"), (0, "0 — 120 ou mais")]),
    ("oxigenacao", "Oxigenação", [
        (11, "11 — PaO₂/FiO₂ menor que 100 em ventilação mecânica"),
        (7, "7 — PaO₂/FiO₂ de 100 ou mais em ventilação mecânica"),
        (5, "5 — PaO₂ menor que 60 sem ventilação mecânica"),
        (0, "0 — PaO₂ de 60 ou mais sem ventilação mecânica")]),
]
SAPS_IDS = " + ".join(item[0] for item in SAPS_ITENS)
add("saps", "SAPS 3",
    "Escore de admissão na UTI. Todo paciente recebe 16 pontos de base. A probabilidade de morte não é calculada aqui.",
    SAPS_ITENS,
    [(40, "Escore baixo a moderado", "A mortalidade sobe com o escore. Esta página não aplica a equação logística."),
     (60, "Escore intermediário", "Reavaliar o contexto cirúrgico e infeccioso."),
     (80, "Escore alto", "Gravidade elevada na admissão."),
     (217, "Escore muito alto", "O máximo teórico do SAPS 3 é 217.")],
    formula=f"saps = 16 + {SAPS_IDS}", chave="saps",
    sobre="Comorbidades e motivos somam quando coexistem, como na ficha original. Se houver distúrbio do ritmo e convulsão, marque só a convulsão (−4). A equação de Moreno (logit = −32,6659 + ln(SAPS 3 + 20,5958) × 7,3068) fica registrada na referência e não é executada, porque a casca só faz aritmética.",
    referencia="Moreno RP et al. SAPS 3 — from evaluation of the patient to evaluation of the intensive care unit. Part 2. Intensive Care Med. 2005.")

add("manchester", "Prioridade do Protocolo de Manchester",
    "Registra a cor já classificada por profissional treinado e o tempo-alvo. Não reproduz os fluxogramas e discriminadores, que são licenciados.",
    [("cor", "Prioridade definida na classificação", [
        (1, "1 — vermelho, emergência, imediato"),
        (2, "2 — laranja, muito urgente, 10 minutos"),
        (3, "3 — amarelo, urgente, 60 minutos"),
        (4, "4 — verde, pouco urgente, 120 minutos"),
        (5, "5 — azul, não urgente, 240 minutos"),
    ])],
    [(1, "Vermelho — imediato", "Risco imediato de morte."),
     (2, "Laranja — 10 minutos", "Muito urgente."),
     (3, "Amarelo — 60 minutos", "Urgente."),
     (4, "Verde — 120 minutos", "Pouco urgente."),
     (5, "Azul — 240 minutos", "Não urgente.")],
    sobre="A classificação de Manchester é feita no fluxograma oficial, por quem tem o treinamento. Esta página guarda a prioridade e o tempo-alvo; não substitui o sistema licenciado.",
    referencia="Manchester Triage Group. Emergency Triage. Wiley. O material dos discriminadores permanece com os detentores dos direitos.")

FUGULIN = [
    ("mental", "Estado mental", ["orientado", "períodos de desorientação", "períodos de inconsciência", "inconsciente"]),
    ("oxigenio", "Oxigenação", ["sem suporte", "cateter ou máscara", "ventilação intermitente ou traqueostomia estável", "ventilação mecânica contínua"]),
    ("sinais", "Sinais vitais", ["controle de rotina", "intervalos de 4 horas", "intervalos de 2 horas", "controle contínuo"]),
    ("motilidade", "Motilidade", ["move todos os segmentos", "limitação", "dificuldade para se mover", "incapaz"]),
    ("deambulacao", "Deambulação", ["sem ajuda", "com ajuda", "cadeira de rodas", "restrito ao leito"]),
    ("alimentacao", "Alimentação", ["via oral sozinho", "via oral com ajuda", "sonda", "parenteral"]),
    ("corpo", "Cuidado corporal", ["banho de chuveiro", "banho com ajuda", "banho no leito com participação", "banho no leito pela equipe"]),
    ("eliminacao", "Eliminação", ["banheiro sozinho", "comadre ou fralda", "sonda vesical", "evacuação no leito e dispositivo"]),
    ("terapeutica", "Terapêutica", ["via oral, intramuscular ou subcutânea", "endovenosa intermitente", "endovenosa contínua", "droga vasoativa"]),
    ("pele", "Integridade da pele", ["íntegra", "cor ou umidade alteradas", "lesão em cicatrização", "lesão extensa ou várias"]),
    ("curativo", "Curativos em 24 horas", ["nenhum ou um simples", "um curativo", "dois ou três", "quatro ou mais, ou curativo complexo"]),
    ("tempo_curativo", "Tempo de enfermagem nos curativos", ["até 15 minutos", "15 a 30 minutos", "30 a 60 minutos", "mais de 60 minutos"]),
]
add("fugulin", "Escala de Fugulin",
    "Complexidade do cuidado de enfermagem em doze áreas de 1 a 4. Total de 12 a 48.",
    [likert(fid, rot, niveis, 1) for fid, rot, niveis in FUGULIN],
    [(17, "Cuidados mínimos", "12 a 17."),
     (22, "Cuidados intermediários", "18 a 22."),
     (28, "Alta dependência", "23 a 28."),
     (34, "Semi-intensivo", "29 a 34."),
     (48, "Intensivo", "Acima de 34.")],
    sobre="Versão de doze áreas usada no dimensionamento (as nove originais mais pele, curativo e tempo de curativo). As horas de enfermagem por categoria seguem a resolução vigente do COFEN.",
    referencia="Fugulin FMT, Gaidzinski RR, Kurcgant P. Sistema de classificação de pacientes. Rev Latino-am Enfermagem. Santos F et al., 2007, para as áreas de curativo. COFEN, Resolução 543/2017.")

PERROCA = [
    "Estado mental e nível de consciência", "Oxigenação", "Sinais vitais",
    "Nutrição e hidratação", "Motilidade", "Locomoção", "Cuidado corporal",
    "Eliminações", "Terapêutica", "Educação à saúde", "Comportamento",
    "Comunicação", "Integridade cutâneo-mucosa",
]
add("perroca", "Escala de Perroca",
    "Treze áreas de cuidado, de 1 a 5. Total de 13 a 65.",
    [likert(f"p{i}", nome, [
        "menor complexidade", "baixa complexidade", "complexidade intermediária",
        "alta complexidade", "complexidade máxima",
    ], 1) for i, nome in enumerate(PERROCA, 1)],
    [(26, "Cuidados mínimos", "13 a 26."),
     (39, "Cuidados intermediários", "27 a 39."),
     (52, "Cuidados semi-intensivos", "40 a 52."),
     (65, "Cuidados intensivos", "53 a 65.")],
    sobre="Instrumento original de 13 indicadores. Em cada área, 1 é o menor nível de atenção e 5 o máximo. A versão posterior, de nove áreas e notas de 1 a 4, é outro instrumento e não está nesta página.",
    referencia="Perroca MG, Gaidzinski RR. Sistema de classificação de pacientes: construção e validação de um instrumento. Rev Esc Enferm USP. 1998.")


MENU = [
    ("calculadoras-clinicas", "Calculadoras clínicas", [
        ("heparina", "Aspiração de heparina"),
        ("insulina", "Aspiração de insulina"),
        ("balancohidrico", "Balanço hídrico"),
        ("dimensionamento", "Dimensionamento de pessoal"),
        ("gasometria", "Gasometria arterial"),
        ("gotejamento", "Gotejamento"),
        ("gestacional", "Idade gestacional e DPP"),
        ("imc", "Índice de massa corporal"),
        ("medicamentos", "Cálculo de medicamentos"),
    ]),
    ("risco-assistencial", "Risco assistencial", [
        ("aldrete", "Aldrete e Kroulik"),
        ("asa", "Classificação ASA"),
        ("braden", "Braden"),
        ("norton", "Norton"),
        ("gosnell", "Gosnell"),
        ("waterlow", "Waterlow"),
        ("elpo", "ELPO"),
        ("morse", "Morse"),
        ("downton", "Downton"),
        ("hendrich", "Hendrich II"),
        ("humpty", "Humpty Dumpty"),
        ("johns", "Johns Hopkins"),
        ("ofras", "OFRAS"),
        ("berg", "Berg"),
        ("tinetti", "Tinetti"),
    ]),
    ("dor-sedacao", "Dor e sedação", [
        ("escalanumerica", "Escala numérica"),
        ("bps", "BPS"),
        ("flacc", "FLACC"),
        ("cries", "CRIES"),
        ("nips", "NIPS"),
        ("painad", "PAINAD"),
        ("lanss", "LANSS"),
        ("ramsay", "Ramsay"),
        ("richmond", "Richmond (RASS)"),
    ]),
    ("neurologia", "Neurologia e cognição", [
        ("glasgow", "Glasgow"),
        ("four", "FOUR"),
        ("jouvet", "Jouvet"),
        ("cincinnati", "Cincinnati"),
        ("fast", "FAST"),
        ("nihss", "NIHSS"),
        ("rancholosamigos", "Rancho Los Amigos"),
        ("meem", "Mini-Exame do Estado Mental"),
        ("moca", "MoCA"),
        ("cam", "CAM-ICU"),
        ("gds", "Depressão geriátrica"),
        ("cornell", "Cornell"),
        ("hamilton", "Hamilton — ansiedade"),
        ("zarit", "Zarit"),
    ]),
    ("funcionalidade", "Funcionalidade", [
        ("barthel", "Barthel"),
        ("katz", "Katz"),
        ("lawton", "Lawton"),
        ("lachs", "Lachs"),
    ]),
    ("obstetricia-neonato", "Obstetrícia e neonatologia", [
        ("apgar", "Apgar"),
        ("bishop", "Bishop"),
        ("ballard", "Ballard"),
        ("capurro", "Capurro somático"),
        ("silverman", "Silverman-Andersen"),
        ("downes", "Wood-Downes"),
        ("meows", "MEOWS"),
        ("pews", "PEWS"),
        ("prism", "PRISM"),
        ("pelod", "PELOD-2"),
    ]),
    ("gravidade", "Gravidade e triagem", [
        ("apache", "APACHE II"),
        ("news", "NEWS2"),
        ("qsofa", "qSOFA"),
        ("sofa", "SOFA"),
        ("curb-65", "CURB-65"),
        ("saps", "SAPS 3"),
        ("manchester", "Manchester"),
        ("fugulin", "Fugulin"),
        ("perroca", "Perroca"),
    ]),
    ("ferramentas-especificas", "Ferramentas específicas", [
        ("__html__notificacao-compulsoria.html", "Notificações compulsórias"),
    ]),
]


def gravar():
    pasta = RAIZ / "configs" / "paginas"
    for cfg in ESCALAS:
        destino = pasta / f"{cfg['metadata']['id']}.json"
        destino.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"✔ {destino.relative_to(RAIZ)}")
    site = json.loads((RAIZ / "data" / "site.json").read_text(encoding="utf-8"))
    for item in site["nav"]:
        if item.get("id") != "ferramentas":
            continue
        item["tabs"] = []
        for tid, rotulo, links in MENU:
            item["tabs"].append({
                "id": tid,
                "label": rotulo,
                "links": [
                    {"text": texto, "href": href if href.startswith("__html__") is False else href.removeprefix("__html__")}
                    if False else {
                        "text": texto,
                        "href": (alvo.removeprefix("__html__") if alvo.startswith("__html__")
                                 else f"calculadoras/{alvo}/"),
                    }
                    for alvo, texto in links
                ],
            })
    (RAIZ / "data" / "site.json").write_text(
        json.dumps(site, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("✔ data/site.json")
    mapa = (RAIZ / "mapa-do-site.html").read_text(encoding="utf-8")
    bloco = []
    vistos = set()
    for _tid, _rot, links in MENU:
        for alvo, texto in links:
            if alvo.startswith("__html__"):
                continue
            if alvo in vistos:
                continue
            vistos.add(alvo)
            bloco.append(f'                                <a href="{alvo}.html" class="sitemap-link">{texto}</a>')
    inicio = mapa.find('<section id="pane-escalas"')
    fim = mapa.find('<section id="pane-biblioteca"')
    if inicio < 0 or fim < 0:
        raise SystemExit("mapa do site sem as seções esperadas")
    novo = (
        mapa[:inicio]
        + """<section id="pane-escalas" class="mb-14 scroll-mt-24">
                            <h2 class="sitemap-category-title"><i class="fa-solid fa-ruler-combined"></i> Escalas de Avaliação</h2>
                            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-sm">
"""
        + "\n".join(bloco)
        + """
                            </div>
                        </section>

                        """
        + mapa[fim:]
    )
    (RAIZ / "mapa-do-site.html").write_text(novo, encoding="utf-8")
    print(f"✔ mapa-do-site.html ({len(vistos)} escalas)")


if __name__ == "__main__":
    gravar()
