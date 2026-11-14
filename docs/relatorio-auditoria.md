# Relatório de Auditoria

Gerado por `tools/auditar.py`. Somente leitura — nada foi alterado.

## 1. Fontes JSON e sincronismo

- `data/site.json`: OK
- Rotas do menu/rodapé: todas existem
- `configs/paginas/*.json`: OK
- Cascas geradas sincronizadas: sim
- Páginas ainda com CALCULATOR_DATA ou campo de scraping: nenhuma

## 2. Fila de revisão clínica (57)

Estas pastas não têm `configs/paginas/<id>.json` que passe na trava.
O gerador publica só o aviso de revisão e o menu não aponta para elas.

- `asa`
- `ballard`
- `berg`
- `bishop`
- `bps`
- `braden`
- `cam`
- `capurro`
- `cincinnati`
- `cornell`
- `cries`
- `curb-65`
- `downes`
- `downton`
- `elpo`
- `escalanumerica`
- `fast`
- `flacc`
- `four`
- `fugulin`
- `gds`
- `glasgow`
- `gosnell`
- `hamilton`
- `hendrich`
- `humpty`
- `johns`
- `jouvet`
- `katz`
- `lachs`
- `lanss`
- `lawton`
- `manchester`
- `meem`
- `meows`
- `moca`
- `morse`
- `news`
- `nihss`
- `nips`
- `norton`
- `ofras`
- `painad`
- `pelod`
- `perroca`
- `pews`
- `prism`
- `qsofa`
- `ramsay`
- `rancholosamigos`
- `richmond`
- `saps`
- `silverman`
- `sofa`
- `tinetti`
- `waterlow`
- `zarit`

## 3. Arquivos órfãos — candidatos a expurgo (0)

Nenhum outro arquivo do site referencia estes caminhos. Candidatos a
remoção após conferência manual:

- nenhum
