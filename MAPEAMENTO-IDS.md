# Mapeamento de IDs e Consistência do Sistema

Este arquivo descreve a geração anterior. O mapa da versão 1.0.1 está em
`INDEX.md`. Vários containers citados abaixo não existem mais no site.

## 📋 Visão Geral

Este documento garante que todos os IDs, classes e referências estejam consistentes entre HTML, JSON, JS e componentes modulares.

---

## 🎯 Containers Principais (HTML)

### Containers de Injeção

| Container ID | Arquivo Injetado | Responsável |
|-------------|------------------|-------------|
| `accessibility-container` | `accessibility-v4.html` | Sistema global (CDN) |
| `header-container` | `header-v4.html` | Sistema global (CDN) |
| `footer-container` | `footer-v4.html` | Sistema global (CDN) |
| `author-container` | `author-section.html` | Local |
| `modal-container` | `modal-generic.html` | Local |
| `sidebar-simulado-enfermagem` | `sidebar-simulado-enfermagem.html` | Local |
| `sidebar-compartilhar` | `sidebar-compartilhar.html` | Local |
| `sidebar-outras-calculadoras` | `sidebar-outras-calculadoras.html` | Local |

### Containers de Conteúdo Dinâmico

| Container ID | Renderizado Por | Fonte de Dados |
|-------------|-----------------|----------------|
| `sidebar-tools` | `CalculatorEngine.renderSidebarMenu()` | `config.menu_lateral[]` |
| `pane-calc` | `CalculatorEngine.renderForm()` | `config.formulario` |
| `pane-sobre` | `CalculatorEngine.renderContentTabs()` | `config.conteudo.sobre` |
| `pane-ajuda` | `CalculatorEngine.renderContentTabs()` | `config.conteudo.ajuda` |
| `pane-referencia` | `CalculatorEngine.renderContentTabs()` | `config.conteudo.referencia` |

---

## 🔗 IDs do Formulário

### Campos de Entrada (config.formulario.campos)

| Campo ID | Tipo | Usado em |
|----------|------|----------|
| `prescricao_medica` | number | Cálculo de insulina |
| `concentracao_insulina` | select | Cálculo de insulina |
| `volume_total` | number | Cálculo de gotejamento |
| `tempo_horas` | number | Cálculo de gotejamento |
| `tipo_equipo` | select | Cálculo de gotejamento |

**Convenção**: snake_case para IDs de campos

---

## 📊 IDs de Resultado

### Exibição de Resultados

| ID | Elemento | Conteúdo |
|----|----------|----------|
| `results-wrapper` | div | Container dos resultados |
| `res-total` | div | Valor numérico do resultado |
| `res-unit` | p | Unidade de medida |
| `audit-list` | ul | Lista de auditoria |

**Renderizado por**: `CalculatorEngine.calculate()`

---

## 🎨 IDs de Navegação

### Abas (config.abas)

| Aba ID | Botão ID | Painel ID | Ação |
|--------|----------|-----------|------|
| `calc` | `btn-tab-calc` | `pane-calc` | Calculadora |
| `sobre` | `btn-tab-sobre` | `pane-sobre` | Sobre o cálculo |
| `ajuda` | `btn-tab-ajuda` | `pane-ajuda` | Instruções |
| `referencia` | `btn-tab-referencia` | `pane-referencia` | Referências |

**Renderizado por**: `CalculatorEngine.renderTabs()`

---

## 🪟 IDs do Modal

### Modal Genérico

| ID | Elemento | Função |
|----|----------|--------|
| `reference-modal` | div | Container do modal |
| `modal-icon` | i | Ícone do header |
| `modal-title` | h3 | Título do modal |
| `modal-content` | div | Conteúdo dinâmico |

**Controlado por**: `CALCULATOR_SYSTEM.openModal()` e `closeModal()`

---

## 🎯 Menu Lateral (config.menu_lateral)

### Estrutura de Ação

Cada item do menu possui:

```json
{
  "id": "identificador-unico",
  "icone": "fa-classe-icone",
  "label": "Texto do Botão",
  "acao": "nomeDaFuncao",
  "parametro": "parametroDaAcao"
}
```

### Mapeamento de Ações

| ID | Label | Ação | Parâmetro | Resultado |
|----|-------|------|-----------|-----------|
| `guia-rapido` | Ajuda | `switchTab` | `ajuda` | Abre aba Ajuda |
| `nove-certos` | 9 Acertos | `showModal` | `nove_certos` | Abre modal 9 Certos |
| `referencias` | Referências | `switchTab` | `referencia` | Abre aba Referência |

**Renderizado por**: `CalculatorEngine.renderSidebarMenu()`

---

## 📑 Mapeamento de Conteúdo Compartilhado

### 1. Aba Ajuda ↔ Sidebar Guia Rápido

**MESMO CONTEÚDO**

**Fonte**: `config.conteudo.ajuda`

**Locais**:
- Aba: `#pane-ajuda` (renderizado por `renderContentTabs()`)
- Botão Menu: Abre a aba `ajuda` via `switchTab('ajuda')`

### 2. Aba Referência ↔ Sidebar Referências Técnicas

**MESMO CONTEÚDO**

**Fonte**: `config.conteudo.referencia`

**Locais**:
- Aba: `#pane-referencia` (renderizado por `renderContentTabs()`)
- Botão Menu: Abre a aba `referencia` via `switchTab('referencia')`

### 3. Modal 9 Certos ↔ Sidebar 9 Acertos

**MESMO CONTEÚDO**

**Fonte**: `config.modais.nove_certos`

**Locais**:
- Modal: `#reference-modal` (aberto por `showModal('nove_certos')`)
- Botão Menu: Abre o modal via `showModal('nove_certos')`

---

## 🔄 Fluxo de Renderização

### Inicialização

```
1. DOMContentLoaded
   ↓
2. CALCULATOR_SYSTEM.init('config.json')
   ↓
3. CalculatorEngine.init()
   ├─→ renderSEO()
   ├─→ renderBreadcrumb()
   ├─→ renderHeader()
   ├─→ renderTabs()
   ├─→ renderForm()
   ├─→ renderContentTabs()
   └─→ renderSidebarMenu()
   ↓
4. loadModule() carrega componentes
   ├─→ author-section.html → #author-container
   ├─→ modal-generic.html → #modal-container
   ├─→ sidebar-simulado-enfermagem.html → #sidebar-simulado-enfermagem
   ├─→ sidebar-compartilhar.html → #sidebar-compartilhar
   └─→ sidebar-outras-calculadoras.html → #sidebar-outras-calculadoras
   ↓
5. Sistema pronto
```

---

## ✅ Checklist de Validação

Use este checklist para verificar consistência:

### IDs do HTML

- [ ] `#accessibility-container` existe
- [ ] `#header-container` existe
- [ ] `#footer-container` existe
- [ ] `#author-container` existe
- [ ] `#modal-container` existe
- [ ] `#sidebar-tools` existe
- [ ] `#main-content` existe
- [ ] `#calculator-container` existe
- [ ] `#pane-calc` existe
- [ ] `#pane-sobre` existe
- [ ] `#pane-ajuda` existe
- [ ] `#pane-referencia` existe
- [ ] `#results-wrapper` existe
- [ ] `#res-total` existe
- [ ] `#res-unit` existe
- [ ] `#audit-list` existe

### IDs Dinâmicos (renderizados via JS)

- [ ] `#btn-tab-calc` é criado
- [ ] `#btn-tab-sobre` é criado
- [ ] `#btn-tab-ajuda` é criado
- [ ] `#btn-tab-referencia` é criado

### IDs do Modal (após injeção)

- [ ] `#reference-modal` é injetado
- [ ] `#modal-icon` é injetado
- [ ] `#modal-title` é injetado
- [ ] `#modal-content` é injetado

### IDs de Sidebars

- [ ] `#sidebar-simulado-enfermagem` existe
- [ ] `#sidebar-compartilhar` existe
- [ ] `#sidebar-outras-calculadoras` existe

### IDs de Campos (dinâmicos do JSON)

- [ ] Todos os IDs em `config.formulario.campos[].id` são únicos
- [ ] IDs usados em `calculate()` existem no formulário
- [ ] IDs usados em validações existem no formulário

---

## 🎨 Classes Principais

### Classes Reutilizáveis (Tailwind)

| Classe | Uso |
|--------|-----|
| `.card-base` | Cards padrão |
| `.sidebar-module` | Módulos de sidebar |
| `.input-field` | Campos de input |
| `.btn-primary-action` | Botões principais |
| `.btn-secondary-action` | Botões secundários |
| `.tab-btn` | Botões de aba |
| `.tab-btn.active` | Aba ativa |
| `.tab-pane` | Painel de aba |
| `.toast-msg` | Notificações |
| `.share-btn` | Botões de compartilhamento |
| `.tool-btn` | Botões do menu lateral |
| `.btn-label` | Labels dos botões |

---

## 🔍 Debugging

### Verificar se IDs existem

```javascript
// No console do navegador
console.log('Results wrapper:', document.getElementById('results-wrapper'));
console.log('Modal container:', document.getElementById('modal-container'));
console.log('Sidebar tools:', document.getElementById('sidebar-tools'));
```

### Verificar configuração carregada

```javascript
// No console
console.log('Config:', CALCULATOR_SYSTEM.engine?.config);
console.log('Sidebars:', CALCULATOR_SYSTEM.engine?.config?.sidebars);
console.log('Menu lateral:', CALCULATOR_SYSTEM.engine?.config?.menu_lateral);
```

### Verificar modais disponíveis

```javascript
// No console
console.log('Modais:', CALCULATOR_SYSTEM.engine?.config?.modais);
```

---

## 📝 Convenções de Nomenclatura

### IDs

- **Containers**: `kebab-case-container`
  - Exemplo: `author-container`, `modal-container`

- **Campos de formulário**: `snake_case`
  - Exemplo: `prescricao_medica`, `volume_total`

- **Elementos de UI**: `kebab-case`
  - Exemplo: `btn-tab-calc`, `res-total`

### Classes

- **Componentes**: `kebab-case`
  - Exemplo: `.card-base`, `.sidebar-module`

- **Estados**: `.base-class.modifier`
  - Exemplo: `.tab-btn.active`

### Arquivos

- **Componentes**: `kebab-case.html`
  - Exemplo: `author-section.html`, `modal-generic.html`

- **Sidebars**: `sidebar-nome.html`
  - Exemplo: `sidebar-compartilhar.html`

- **Configuração**: `nome-config.json`
  - Exemplo: `insulina-config.json`

---

## ⚠️ Erros Comuns

### 1. ID não encontrado

**Erro**: `Cannot read property 'innerHTML' of null`

**Causa**: ID não existe no HTML ou foi escrito errado

**Solução**: Verificar se o container existe antes da injeção

### 2. Modal não abre

**Erro**: Modal config not found

**Causa**: Nome do modal no `menu_lateral.parametro` não bate com `modais.[nome]`

**Solução**: Garantir que os nomes são idênticos

### 3. Sidebar não carrega

**Erro**: Módulo não carregado

**Causa**: Nome do arquivo não bate com array `sidebars[]`

**Solução**: Verificar nomes no JSON e nome do arquivo

---

## 🔐 Validação Automática

### Script de Validação

```javascript
// Adicionar ao calculator-system.js para debug
function validateIDs() {
  const requiredIDs = [
    'accessibility-container',
    'header-container',
    'footer-container',
    'author-container',
    'modal-container',
    'sidebar-tools',
    'main-content',
    'calculator-container',
    'pane-calc',
    'pane-sobre',
    'pane-ajuda',
    'pane-referencia'
  ];
  
  const missing = requiredIDs.filter(id => !document.getElementById(id));
  
  if (missing.length > 0) {
    console.error('IDs ausentes:', missing);
    return false;
  }
  
  console.log('✓ Todos os IDs obrigatórios presentes');
  return true;
}

// Chamar após DOMContentLoaded
// validateIDs();
```

---

**Versão**: 4.0  
**Última Atualização**: 2025-02-13  
**Status**: ✅ Validado
