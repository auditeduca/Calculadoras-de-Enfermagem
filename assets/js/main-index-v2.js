/**
 * main-index.js - Main Application Logic
 * Sistema Modular de Carregamento e Renderização
 * Calculadoras de Enfermagem
 * Inclui funções utilitárias anteriormente em utils.js
 * Integração com EventBus para comunicação entre módulos
 */
(function() {
'use strict';

// ============================================
// EVENTBUS INTEGRATION
// ============================================
const MainModule = {
state: null,
initialized: false,
eventBusReady: false
};

function setupMainEventBusIntegration() {
if (!window.EventBus) {
// Aguardar EventBus estar pronto
window.addEventListener('eventbus:ready', function onEventBusReady() {
window.removeEventListener('eventbus:ready', onEventBusReady);
registerMainEventBusListeners();
MainModule.eventBusReady = true;
console.log('[Main] EventBus integration activated');
});
} else {
registerMainEventBusListeners();
MainModule.eventBusReady = true;
}
}

function registerMainEventBusListeners() {
if (!window.EventBus) return;

// Escutar eventos de theme para atualizar visualização
window.EventBus.on('theme:changed', function(data) {
console.log('[Main] Tema alterado detectado via EventBus:', data.theme);
// Atualizar estilos específicos do main se necessário
updateMainForTheme(data.isDark);
}, { module: 'main' });

// Escutar eventos de fonte para atualizar visualização
window.EventBus.on('font:changed', function(data) {
console.log('[Main] Fonte alterada detectada via EventBus:', data.size);
// Atualizar estilos específicos do main se necessário
updateMainForFontSize(data.size);
}, { module: 'main' });

// Escutar eventos de header ready
window.EventBus.on('header:ready', function(data) {
console.log('[Main] Header está pronto, sincronizando...');
// Sincronizar estado com header se necessário
}, { module: 'main' });

// Escutar eventos de accessibility
window.EventBus.on('accessibility:settings:changed', function(data) {
console.log('[Main] Configurações de acessibilidade alteradas via EventBus');
// Atualizar main para refletir mudanças de acessibilidade
updateMainForAccessibility(data);
}, { module: 'main' });
}

function emitMainEvent(eventName, data) {
// Emitir via EventBus
if (window.EventBus && MainModule.eventBusReady) {
window.EventBus.emit('main:' + eventName, {
...data,
source: 'main',
timestamp: Date.now()
});
}

// Manter compatibilidade com CustomEvents legados
window.dispatchEvent(new CustomEvent('main:' + eventName, {
detail: {
...data,
source: 'main'
}
}));
}

function updateMainForTheme(isDark) {
// Atualizar estilos do main quando tema muda
const mainContent = document.getElementById('main-v2-content');
if (mainContent) {
// Adicionar classes específicas se necessário
mainContent.setAttribute('data-theme', isDark ? 'dark' : 'light');
}
}

function updateMainForFontSize(size) {
// Atualizar estilos do main quando fonte muda
const mainContent = document.getElementById('main-v2-content');
if (mainContent) {
mainContent.setAttribute('data-font-size', size);
}
}

function updateMainForAccessibility(settings) {
// Atualizar main quando configurações de acessibilidade mudam
const mainContent = document.getElementById('main-v2-content');
if (mainContent) {
if (settings.highlightLinks) {
mainContent.classList.add('accessibility-links-highlighted');
} else {
mainContent.classList.remove('accessibility-links-highlighted');
}
if (settings.highlightHeaders) {
mainContent.classList.add('accessibility-headers-highlighted');
} else {
mainContent.classList.remove('accessibility-headers-highlighted');
}
if (settings.readingMode) {
mainContent.classList.add('accessibility-reading-mode');
} else {
mainContent.classList.remove('accessibility-reading-mode');
}
}
}

// ============================================
// Utility Functions (from utils.js)
// ============================================
const Utils = (function() {
'use strict';

/**
 * Render a complete tool card with all elements
 * @param {Object} tool - Tool data object
 * @param {Object} sectionState - Current section state
 * @param {string} type - Tool type (calculator, scale, other)
 * @returns {string} HTML string for the card
 */
function renderCard(tool, sectionState, type) {
const icons = {
calculator: 'fa-calculator',
scale: 'fa-clipboard-list',
other: 'fa-calendar-check'
};

const actionIcons = {
calculator: 'fa-calculator',
scale: 'fa-clipboard-list',
other: 'fa-calendar-check'
};

const actionTexts = {
calculator: 'Calcular',
scale: 'Classificar',
other: 'Consultar'
};

const tags = {
calculator: 'calculadora',
scale: 'escala',
other: 'informação'
};

const iconClass = tool.icon || 'fas fa-' + (icons[type] || 'calculator');
const actionIcon = actionIcons[type] || 'fa-calculator';
const actionText = actionTexts[type] || 'Acessar';
const tagText = tags[type] || 'informação';

return `
<div class="tool-card ${type}" data-id="${tool.id}" data-category="${tool.category}">
    <div class="tool-header">
        <div class="tool-icon ${iconClass}" style="background-color: var(--${tool.color}-light, #e3f2fd); color: var(--${tool.color}-primary, #1976d2);">
            <i class="${iconClass}" aria-hidden="true"></i>
        </div>
        <div class="tool-info">
            <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
            <span class="tool-tag">${tagText}</span>
        </div>
    </div>
    <div class="tool-body">
        <p class="tool-description">${escapeHtml(tool.description)}</p>
    </div>
    <div class="tool-footer">
        <a href="${tool.filename}" class="tool-btn" aria-label="${actionText} ${tool.name}">
            <i class="fas ${actionIcon}" aria-hidden="true"></i>
            <span>${actionText}</span>
        </a>
    </div>
</div>
`;
}

/**
 * Render action button based on tool type
 * @param {string} type - Tool type
 * @returns {string} Button HTML
 */
function getActionButton(type) {
const buttons = {
calculator: { icon: 'fa-calculator', text: 'Calcular' },
scale: { icon: 'fa-clipboard-list', text: 'Classificar' },
other: { icon: 'fa-calendar-check', text: 'Consultar' }
};

const btn = buttons[type] || buttons.other;
return `<button class="action-btn"><i class="fas ${btn.icon}"></i> ${btn.text}</button>`;
}

/**
 * Check if tool should be highlighted based on filter
 * @param {Object} tool - Tool data
 * @param {Object} sectionState - Current state
 * @returns {boolean}
 */
function isHighlighted(tool, sectionState) {
if (sectionState.filterCategory === 'all') return true;
return tool.category === sectionState.filterCategory;
}

/**
 * Debounce function - delays execution until after wait ms
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function}
 */
function debounce(func, wait) {
let timeout;
return function executedFunction(...args) {
const later = () => {
clearTimeout(timeout);
func(...args);
};
clearTimeout(timeout);
timeout = setTimeout(later, wait);
};
}

/**
 * Throttle function - limits execution to once per limit ms
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function}
 */
function throttle(func, limit) {
let inThrottle;
return function executedFunction(...args) {
if (!inThrottle) {
func(...args);
inThrottle = true;
setTimeout(() => inThrottle = false, limit);
}
};
}

/**
 * Execute callback when DOM is ready
 * @param {Function} callback - Function to execute
 */
function onReady(callback) {
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', callback);
} else {
callback();
}
}

/**
 * Create a DOM element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|Array} children - Child elements or text
 * @returns {HTMLElement}
 */
function createElement(tag, attributes, children) {
const element = document.createElement(tag);
if (attributes) {
Object.keys(attributes).forEach(key => {
if (key.startsWith('on') && typeof attributes[key] === 'function') {
element.addEventListener(key.slice(2).toLowerCase(), attributes[key]);
} else if (key === 'className') {
element.className = attributes[key];
} else {
element.setAttribute(key, attributes[key]);
}
});
}
if (children) {
if (Array.isArray(children)) {
children.forEach(child => {
if (typeof child === 'string') {
element.appendChild(document.createTextNode(child));
} else if (child instanceof Node) {
element.appendChild(child);
}
});
} else if (typeof children === 'string') {
element.innerHTML = children;
}
}
return element;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
const div = document.createElement('div');
div.textContent = text;
return div.innerHTML;
}

/**
 * Format date to Brazilian locale
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
const date = new Date(dateStr);
return date.toLocaleDateString('pt-BR', {
day: '2-digit',
month: '2-digit',
year: 'numeric'
});
}

/**
 * Get URL parameter value
 * @param {string} param - Parameter name
 * @returns {string|null}
 */
function getUrlParam(param) {
const urlParams = new URLSearchParams(window.location.search);
return urlParams.get(param);
}

/**
 * Smooth scroll to element
 * @param {string|HTMLElement} target - Target element or selector
 * @param {number} offset - Offset in pixels
 */
function scrollTo(target, offset = 100) {
const element = typeof target === 'string'
? document.querySelector(target)
: target;
if (element) {
const top = element.getBoundingClientRect().top + window.scrollY - offset;
window.scrollTo({ top, behavior: 'smooth' });
}
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise}
 */
async function copyToClipboard(text) {
try {
await navigator.clipboard.writeText(text);
return true;
} catch (err) {
console.error('Failed to copy:', err);
return false;
}
}

/**
 * Check if element is fully visible in viewport
 * @param {HTMLElement} el - Element to check
 * @returns {boolean}
 */
function isElementInViewport(el) {
const rect = el.getBoundingClientRect();
return (
rect.top >= 0 &&
rect.left >= 0 &&
rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
rect.right <= (window.innerWidth || document.documentElement.clientWidth)
);
}

/**
 * Generate unique ID
 * @returns {string}
 */
function generateId() {
return 'id-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
function clamp(value, min, max) {
return Math.min(Math.max(value, min), max);
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object}
 */
function deepClone(obj) {
return JSON.parse(JSON.stringify(obj));
}

/**
 * Local storage wrapper with error handling
 */
const Storage = {
get(key, defaultValue = null) {
try {
const item = localStorage.getItem(key);
return item ? JSON.parse(item) : defaultValue;
} catch (e) {
console.warn('Storage get error:', e);
return defaultValue;
}
},
set(key, value) {
try {
localStorage.setItem(key, JSON.stringify(value));
return true;
} catch (e) {
console.warn('Storage set error:', e);
return false;
}
},
remove(key) {
try {
localStorage.removeItem(key);
return true;
} catch (e) {
console.warn('Storage remove error:', e);
return false;
}
}
};

// Public API
return {
renderCard,
getActionButton,
isHighlighted,
debounce,
throttle,
onReady,
createElement,
escapeHtml,
formatDate,
getUrlParam,
scrollTo,
copyToClipboard,
isElementInViewport,
generateId,
clamp,
deepClone,
Storage
};
})();

// ============================================
// Tool Data - All content stored here
// ============================================
const toolsData = [
// Calculadoras Clínicas
{ id: 'balanco-hidrico', name: 'Balanço Hídrico', category: 'Controle Hídrico', type: 'calculator', description: 'Controle preciso de líquidos e fluidos corporais.', filename: 'balancohidrico.html', icon: 'fas fa-tint', color: 'blue' },
{ id: 'gasometria', name: 'Cálculo de Gasometria', category: 'Exames', type: 'calculator', description: 'Interpretação de gasometria arterial e distúrbios ácido-básicos.', filename: 'gasometria.html', icon: 'fas fa-vial', color: 'blue' },
{ id: 'gotejamento', name: 'Cálculo de Gotejamento', category: 'Medicamentos', type: 'calculator', description: 'Velocidade de infusão de soluções parenterais.', filename: 'gotejamento.html', icon: 'fas fa-hand-holding-water', color: 'blue' },
{ id: 'heparina', name: 'Cálculo de Heparina', category: 'Medicamentos', type: 'calculator', description: 'Cálculo seguro de doses de heparina.', filename: 'heparina.html', icon: 'fas fa-syringe', color: 'blue' },
{ id: 'imc', name: 'Índice de Massa Corporal (IMC)', category: 'Nutrição', type: 'calculator', description: 'Avaliação nutricional e classificação de peso.', filename: 'imc.html', icon: 'fas fa-weight', color: 'blue' },
{ id: 'insulina', name: 'Cálculo de Insulina', category: 'Medicamentos', type: 'calculator', description: 'Cálculo de doses e unidades de insulina.', filename: 'insulina.html', icon: 'fas fa-syringe', color: 'blue' },
{ id: 'medicamentos', name: 'Cálculo de Medicamentos', category: 'Medicamentos', type: 'calculator', description: 'Regra de três para doses e diluições.', filename: 'medicamentos.html', icon: 'fas fa-pills', color: 'blue' },
{ id: 'dimensionamento', name: 'Dimensionamento de Equipe', category: 'Gestão', type: 'calculator', description: 'Organização de recursos humanos segundo COFEN.', filename: 'dimensionamento.html', icon: 'fas fa-users-cog', color: 'blue' },
{ id: 'gestacional', name: 'Idade Gestacional e DPP', category: 'Obstetrícia', type: 'calculator', description: 'Cálculo de DUM, DPP e idade gestacional.', filename: 'gestacional.html', icon: 'fas fa-baby', color: 'blue' },
{ id: 'glicemia', name: 'Calculadora de Glicemia', category: 'Laboratorial', type: 'calculator', description: 'Conversão entre mg/dL e mmol/L, interpretação de resultados e classificação de hipoglicemia.', filename: 'glicemia.html', icon: 'fas fa-tint', color: 'blue' },
{ id: 'betabloqueador', name: 'Conversão de Betabloqueador', category: 'Cardiológico', type: 'calculator', description: 'Equivalência entre diferentes betabloqueadores: carvedilol, metoprolol e propranolol.', filename: 'betabloqueador.html', icon: 'fas fa-heart-pulse', color: 'blue' },
{ id: 'drip', name: 'Gotejamento', category: 'Farmácia', type: 'calculator', description: 'Cálculo de gotejamento de soro: macrogotas, microgotas e bombas de infusão.', filename: 'drip.html', icon: 'fas fa-droplet', color: 'blue' },
{ id: 'peso-ideal', name: 'Peso Ideal', category: 'Antropometria', type: 'calculator', description: 'Cálculo do peso ideal baseado em fórmulas de Lorentz, Devine e IMCP.', filename: 'peso-ideal.html', icon: 'fas fa-child', color: 'blue' },
{ id: 'queimaduras', name: 'Regra dos 9', category: 'Emergência', type: 'calculator', description: 'Cálculo da área de superfície corporal afetada por queimaduras segundo a regra dos 9.', filename: 'queimaduras.html', icon: 'fas fa-fire-flame-curved', color: 'blue' },
{ id: 'rule', name: 'RULE', category: 'Risco', type: 'calculator', description: 'Score de risco para trombose venosa profunda (TVP) em pacientes clínicos.', filename: 'rule.html', icon: 'fas fa-calculator', color: 'blue' },
{ id: 'apache', name: 'APACHE II', category: 'UTI', type: 'calculator', description: 'Avaliação de gravidade em pacientes críticos: Acute Physiology and Chronic Health Evaluation.', filename: 'score-apache.html', icon: 'fas fa-hospital-user', color: 'blue' },

// Escalas Clínicas
{ id: 'braden', name: 'Escala de Braden', category: 'Lesões', type: 'scale', description: 'Avaliação do risco para desenvolvimento de úlceras por pressão.', filename: 'braden.html', icon: 'fas fa-bed', color: 'green' },
{ id: 'morse', name: 'Escala de Morse', category: 'Quedas', type: 'scale', description: 'Avaliação do risco para quedas em ambiente hospitalar.', filename: 'morse.html', icon: 'fas fa-person-falling', color: 'green' },
{ id: 'hamd', name: 'Escala de Hamilton', category: 'Psiquiatria', type: 'scale', description: 'Avaliação da gravidade da depressão (HAM-D17).', filename: 'hamd.html', icon: 'fas fa-face-sad-tear', color: 'green' },
{ id: 'edmonton', name: 'Escala de Edmonton', category: 'Geriatria', type: 'scale', description: 'Avaliação do estado funcional em pacientes idosos (Frailty).', filename: 'edmonton.html', icon: 'fas fa-stethoscope', color: 'green' },
{ id: 'gcs', name: 'Escala de Glasgow', category: 'Neurologia', type: 'scale', description: 'Avaliação do nível de consciência e coma.', filename: 'gcs.html', icon: 'fas fa-brain', color: 'green' },
{ id: 'sad', name: 'SAD', category: 'Respiratório', type: 'scale', description: 'Escala de avaliação da dispneia para triagem de emergência.', filename: 'sad.html', icon: 'fas fa-lungs', color: 'green' },
{ id: 'aldrete', name: 'Escala de Aldrete', category: 'Recuperação', type: 'scale', description: 'Avaliação de recuperação pós-anestesia.', filename: 'aldrete.html', icon: 'fas fa-heartbeat', color: 'green' },
{ id: 'apgar', name: 'Escala de Apgar', category: 'Neonatologia', type: 'scale', description: 'Avaliação do recém-nascido após o parto.', filename: 'apgar.html', icon: 'fas fa-baby-carriage', color: 'green' },
{ id: 'asa', name: 'Classificação ASA', category: 'Anestesia', type: 'scale', description: 'Avaliação do estado físico pré-operatório.', filename: 'asa.html', icon: 'fas fa-user-md', color: 'green' },
{ id: 'barthel', name: 'Índice de Barthel', category: 'Funcional', type: 'scale', description: 'Avaliação da independência em atividades diárias.', filename: 'barthel.html', icon: 'fas fa-shower', color: 'green' },
{ id: 'bishop', name: 'Escala de Bishop', category: 'Obstetrícia', type: 'scale', description: 'Avaliação da prontidão cervical para indução.', filename: 'bishop.html', icon: 'fas fa-venus', color: 'green' },
{ id: 'cam-icu', name: 'CAM-ICU', category: 'UTI', type: 'scale', description: 'Método de avaliação de delirium em pacientes críticos.', filename: 'cam-icu.html', icon: 'fas fa-brain', color: 'green' },
{ id: 'capurro', name: 'Escala de Capurro', category: 'Neonatologia', type: 'scale', description: 'Avaliação da idade gestacional do recém-nascido.', filename: 'capurro.html', icon: 'fas fa-baby', color: 'green' },
{ id: 'downton', name: 'Escala de Downton', category: 'Quedas', type: 'scale', description: 'Avaliação do risco de quedas em idosos.', filename: 'downton.html', icon: 'fas fa-person-falling', color: 'green' },
{ id: 'flacc', name: 'Escala FLACC', category: 'Dor', type: 'scale', description: 'Avaliação de dor em crianças que não conseguem se expressar.', filename: 'flacc.html', icon: 'fas fa-child', color: 'green' },
{ id: 'hamilton', name: 'Escala de Hamilton', category: 'Psiquiatria', type: 'scale', description: 'Avaliação da gravidade da depressão.', filename: 'hamilton.html', icon: 'fas fa-face-sad-tear', color: 'green' },
{ id: 'johns', name: 'Escala de Johns', category: 'Sono', type: 'scale', description: 'Avaliação da qualidade do sono.', filename: 'johns.html', icon: 'fas fa-bed', color: 'green' },
{ id: 'katz', name: 'Índice de Katz', category: 'Funcional', type: 'scale', description: 'Avaliação da independência em atividades diárias.', filename: 'katz.html', icon: 'fas fa-walking', color: 'green' },
{ id: 'lachs', name: 'Escala de Lachs', category: 'Fragilidade', type: 'scale', description: 'Avaliação de fragilidade em idosos.', filename: 'lachs.html', icon: 'fas fa-person-cane', color: 'green' },
{ id: 'lanss', name: 'LANSS', category: 'Dor', type: 'scale', description: 'Avaliação de dor neuropática.', filename: 'lanss.html', icon: 'fas fa-bolt', color: 'green' },
{ id: 'lawton', name: 'Escala de Lawton', category: 'Funcional', type: 'scale', description: 'Avaliação da autonomia para atividades instrumentais.', filename: 'lawton.html', icon: 'fas fa-home', color: 'green' },
{ id: 'meem', name: 'Mini-Mental (MEEM)', category: 'Cognitivo', type: 'scale', description: 'Avaliação do estado mental.', filename: 'meem.html', icon: 'fas fa-brain', color: 'green' },
{ id: 'news', name: 'NEWS', category: 'Triagem', type: 'scale', description: 'Escala Nacional de Alerta Precoce.', filename: 'news.html', icon: 'fas fa-heartbeat', color: 'green' },
{ id: 'nihss', name: 'NIHSS', category: 'AVC', type: 'scale', description: 'Avaliação da gravidade do AVC.', filename: 'nihss.html', icon: 'fas fa-brain', color: 'green' },
{ id: 'norton', name: 'Escala de Norton', category: 'Lesões', type: 'scale', description: 'Avaliação do risco de úlceras por pressão.', filename: 'norton.html', icon: 'fas fa-bed', color: 'green' },
{ id: 'nrs', name: 'Escala NRS', category: 'Dor', type: 'scale', description: 'Avaliação numérica da dor.', filename: 'nrs.html', icon: 'fas fa-face-angry', color: 'green' },
{ id: 'pews', name: 'PEWS', category: 'Pediatria', type: 'scale', description: 'Escala de Alerta Pediátrico.', filename: 'pews.html', icon: 'fas fa-child', color: 'green' },
{ id: 'prism', name: 'PRISM', category: 'UTI', type: 'scale', description: 'Índice de Mortalidade Pediátrica.', filename: 'prism.html', icon: 'fas fa-hospital-user', color: 'green' },
{ id: 'qsofa', name: 'qSOFA', category: 'Sepse', type: 'scale', description: 'Avaliação rápida de sepse.', filename: 'qsofa.html', icon: 'fas fa-thermometer-half', color: 'green' },
{ id: 'ramsay', name: 'Escala de Ramsay', category: 'Sedação', type: 'scale', description: 'Avaliação do nível de sedação.', filename: 'ramsay.html', icon: 'fas fa-bed', color: 'green' },
{ id: 'richmond', name: 'RASS', category: 'Sedação', type: 'scale', description: 'Escala de Agitação e Sedação.', filename: 'richmond.html', icon: 'fas fa-bed', color: 'green' },
{ id: 'saps', name: 'SAPS III', category: 'UTI', type: 'scale', description: 'Simplified Acute Physiology Score.', filename: 'saps.html', icon: 'fas fa-calculator', color: 'green' },

// Calendário Vacinal
{ id: 'crianca', name: 'Criança', category: 'Pediátria', type: 'other', description: 'Calendário vacinal completo para crianças de 0 a 10 anos.', filename: 'crianca.html', icon: 'fas fa-baby', color: 'orange' },
{ id: 'adolescente', name: 'Adolescente', category: 'Adolescência', type: 'other', description: 'Vacinas recomendadas para adolescentes de 11 a 19 anos.', filename: 'adolescente.html', icon: 'fas fa-child-reaching', color: 'orange' },
{ id: 'adulto', name: 'Adulto', category: 'Adulto', type: 'other', description: 'Calendário vacinal para adultos de 20 a 59 anos.', filename: 'adulto.html', icon: 'fas fa-user', color: 'orange' },
{ id: 'idoso', name: 'Idoso', category: 'Geriatria', type: 'other', description: 'Vacinas específicas para idosos acima de 60 anos.', filename: 'idoso.html', icon: 'fas fa-person-cane', color: 'orange' },
{ id: 'gestante', name: 'Gestante', category: 'Obstetrícia', type: 'other', description: 'Vacinas recomendadas durante a gravidez.', filename: 'gestante.html', icon: 'fas fa-person-pregnant', color: 'orange' },
{ id: 'trabalhador', name: 'Trabalhador', category: 'Ocupacional', type: 'other', description: 'Vacinas ocupacionais e obrigatórias para trabalhadores.', filename: 'trabalhador.html', icon: 'fas fa-hard-hat', color: 'orange' },
{ id: 'imunodeprimido', name: 'Imunodeprimido', category: 'Especial', type: 'other', description: 'Vacinas para pacientes imunocomprometidos.', filename: 'imunodeprimido.html', icon: 'fas fa-user-shield', color: 'orange' },
{ id: 'viajante', name: 'Viajante', category: 'Travel', type: 'other', description: 'Vacinas recomendadas para viagens internacionais.', filename: 'viajante.html', icon: 'fas fa-plane-departure', color: 'orange' },
{ id: 'vacinas', name: 'Calendário Vacinal 2024', category: 'Imunização', type: 'other', description: 'Calendário vacinal atualizado para 2024.', filename: 'vacinas.html', icon: 'fas fa-calendar-check', color: 'orange' }
];

// ============================================
// Global State
// ============================================
let state = {
searchTerm: '',
filterCategory: 'all',
sortOrder: 'az',
showIcons: true,
viewMode: 'medio',
loaded: false
};

// ============================================
// Hero Slides Configuration
// ============================================
const heroSlides = [
{
id: 'welcome',
title: 'Calculadoras de Enfermagem',
subtitle: 'Conhecer e dominar escalas clínicas é fundamental para o enfermeiro: auxilia na tomada de decisões, otimiza a assistência e fortalece a prática profissional.',
buttonText: null,
buttonUrl: '#calculadoras',
imageIcon: 'fa-calculator',
gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section-welcome.webp'
},
{
id: 'diagnosticos',
title: 'Plano de Enfermagem',
subtitle: 'Diagnósticos NANDA, NIC e NOC com intervenções personalizadas para cada caso clínico.',
buttonText: 'Acessar Diagnósticos',
buttonUrl: 'pages/diagnosticosnanda.html',
imageIcon: 'fa-clipboard-list',
gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section-nanda-tools.webp'
},
{
id: 'simulado',
title: 'Simulado de Enfermagem',
subtitle: 'Teste seus conhecimentos com questões comentadas de concursos e provas de residência.',
buttonText: 'Acessar Simulado',
buttonUrl: 'pages/simulado-de-enfermagem2.html',
imageIcon: 'fa-graduation-cap',
gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section-simulator-tools.webp'
},
{
id: 'biblioteca',
title: 'Biblioteca de Enfermagem',
subtitle: 'Downloads de materiais, apostilas, protocolos e diretrizes clínicas atualizadas.',
buttonText: 'Acessar Biblioteca',
buttonUrl: 'pages/downloads.html',
imageIcon: 'fa-book-open',
gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section-library-tools.webp'
},
{
id: 'notificacao',
title: 'Notificação Compulsória',
subtitle: 'Sistema de registro e acompanhamento de doenças e agravos de notificação obrigatória.',
buttonText: 'Acessar Lista de Notificações',
buttonUrl: 'pages/notificacao-compulsoria.html',
imageIcon: 'fa-bell',
gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section-notification-tools.webp'
}
];

let currentSlide = 0;
let slideInterval;

// ============================================
// Template Generators
// ============================================
function generateHeroHTML() {
const dotsHTML = heroSlides.map((slide, index) =>
`<button class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-label="Ir para slide ${index + 1}"></button>`
).join('');

const slidesHTML = heroSlides.map((slide, index) => `
<div class="carousel-item ${index === 0 ? 'active' : ''}" data-slide="${index}" style="background-image: ${slide.gradient}, url('${slide.bgImage}')">
    <div class="carousel-content">
        <div class="carousel-icon">
            <i class="fas ${slide.imageIcon}" aria-hidden="true"></i>
        </div>
        <h2 class="carousel-title">${slide.title}</h2>
        <p class="carousel-subtitle">${slide.subtitle}</p>
        ${slide.buttonText ? `<a href="${slide.buttonUrl}" class="carousel-btn">${slide.buttonText}</a>` : ''}
    </div>
</div>
`).join('');

return `
<div class="hero-carousel" role="region" aria-label="Destaques">
    <div class="carousel-container">
        ${slidesHTML}
    </div>
    <div class="carousel-dots" aria-label="Navegação do carrossel">
        ${dotsHTML}
    </div>
    <button class="carousel-control prev" aria-label="Slide anterior">
        <i class="fas fa-chevron-left" aria-hidden="true"></i>
    </button>
    <button class="carousel-control next" aria-label="Próximo slide">
        <i class="fas fa-chevron-right" aria-hidden="true"></i>
    </button>
</div>
`;
}

function generateSectionHTML(id, title, tools, type, icon) {
return `
<section id="${id}" class="tools-section" aria-labelledby="${id}-title">
    <header class="section-header">
        <h2 id="${id}-title" class="section-title">
            <i class="fas ${icon}" aria-hidden="true"></i>
            ${title}
        </h2>
    </header>
    <div class="tools-grid view-${state.viewMode} ${state.showIcons ? '' : 'hide-icons'}" role="list">
        ${tools.map(t => Utils.renderCard(t, state, type)).join('')}
    </div>
</section>
`;
}

function generateVisualizarHTML() {
const viewModes = [
{ value: 'extra-grande', label: 'Extra Grande', icon: 'fa-th-large' },
{ value: 'grande', label: 'Grande', icon: 'fa-th' },
{ value: 'medio', label: 'Médio', icon: 'fa-square' },
{ value: 'pequeno', label: 'Pequeno', icon: 'fa-minus-square' },
{ value: 'lista', label: 'Lista', icon: 'fa-list' },
{ value: 'detalhes', label: 'Detalhes', icon: 'fa-info-circle' },
{ value: 'blocos', label: 'Blocos', icon: 'fa-border-all' },
{ value: 'compacto', label: 'Compacto', icon: 'fa-compress-arrows-alt' }
];

const sortOptions = [
{ value: 'asc', label: 'A-Z (Crescente)', icon: 'fa-sort-alpha-down' },
{ value: 'desc', label: 'Z-A (Decrescente)', icon: 'fa-sort-alpha-up' }
];

const sortLabels = {
asc: 'A-Z (Crescente)',
desc: 'Z-A (Decrescente)'
};

const sortIcons = {
asc: 'fa-sort-alpha-down',
desc: 'fa-sort-alpha-up'
};

const viewLabels = {
'extra-grande': 'Extra Grande',
'grande': 'Grande',
'medio': 'Médio',
'pequeno': 'Pequeno',
'lista': 'Lista',
'detalhes': 'Detalhes',
'blocos': 'Blocos',
'compacto': 'Compacto'
};

const viewIcons = {
'extra-grande': 'fa-th-large',
'grande': 'fa-th',
'medio': 'fa-square',
'pequeno': 'fa-minus-square',
'lista': 'fa-list',
'detalhes': 'fa-info-circle',
'blocos': 'fa-border-all',
'compacto': 'fa-compress-arrows-alt'
};

const currentViewLabel = viewLabels[state.viewMode] || 'Médio';
const currentViewIcon = viewIcons[state.viewMode] || 'fa-square';
const currentSortLabel = sortLabels[state.sortOrder] || 'A-Z (Crescente)';
const currentSortIcon = sortIcons[state.sortOrder] || 'fa-sort-alpha-down';

return `
<div class="visualizar-controls" role="region" aria-label="Controles de visualização">
    <div class="view-dropdown dropdown">
        <button class="view-btn dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Exibição">
            <i class="fas ${currentViewIcon}" aria-hidden="true"></i>
            <span class="view-current">${currentViewLabel} <i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="dropdown-menu" role="menu">
            ${viewModes.map(m => `
            <button class="dropdown-item ${state.viewMode === m.value ? 'active' : ''}" data-value="${m.value}" role="menuitem">
                <i class="fas ${m.icon}" aria-hidden="true"></i>
                ${m.label}
            </button>
            `).join('')}
        </div>
    </div>

    <div class="sort-dropdown dropdown">
        <button class="sort-btn dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Ordenar">
            <i class="fas ${currentSortIcon}" aria-hidden="true"></i>
            <span class="sort-current">${currentSortLabel} <i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="dropdown-menu" role="menu">
            ${sortOptions.map(o => `
            <button class="dropdown-item ${state.sortOrder === o.value ? 'active' : ''}" data-value="${o.value}" role="menuitem">
                <i class="fas ${o.icon}" aria-hidden="true"></i>
                ${o.label}
            </button>
            `).join('')}
        </div>
    </div>

    <div class="icon-toggle-wrapper">
        <label class="icon-toggle" for="icon-toggle">
            <input type="checkbox" id="icon-toggle" ${state.showIcons ? 'checked' : ''} aria-label="Mostrar ícones">
            <span class="toggle-slider"></span>
            <span class="toggle-label">Ícones</span>
        </label>
    </div>
</div>
`;
}

// ============================================
// Render Functions
// ============================================
function renderAllTools() {
const mainContent = document.getElementById('main-v2-content');
if (!mainContent) {
console.warn('[Main] Elemento #main-v2-container não encontrado');
return;
}

console.log('[Main] Renderizando ferramentas...');
console.log('[Main] toolsData length:', toolsData.length);

// Sort function based on state.sortOrder
const sortTools = (tools) => {
const sorted = [...tools].sort((a, b) => a.name.localeCompare(b.name));
if (state.sortOrder === 'desc') {
return sorted.reverse();
}
return sorted;
};

const calculators = sortTools(toolsData.filter(t => t.type === 'calculator'));
const scales = sortTools(toolsData.filter(t => t.type === 'scale'));
const vaccines = sortTools(toolsData.filter(t => t.type === 'other'));

console.log('[Main] calculators:', calculators.length);
console.log('[Main] scales:', scales.length);
console.log('[Main] vaccines:', vaccines.length);

const heroHTML = generateHeroHTML();
const visualizarHTML = generateVisualizarHTML();
const sectionCalculadoras = generateSectionHTML('calculadoras', 'Calculadoras Clínicas', calculators, 'calculator', 'fa-calculator');
const sectionEscalas = generateSectionHTML('escalas', 'Escalas Clínicas', scales, 'scale', 'fa-clipboard-list');
const sectionVacinas = generateSectionHTML('vacinas', 'Calendário Vacinal', vaccines, 'other', 'fa-calendar-check');

console.log('[Main] Hero HTML length:', heroHTML.length);
console.log('[Main] Visualizar HTML length:', visualizarHTML.length);
console.log('[Main] Section HTML length:', sectionCalculadoras.length + sectionEscalas.length + sectionVacinas.length);

mainContent.innerHTML = heroHTML + visualizarHTML + sectionCalculadoras + sectionEscalas + sectionVacinas;
console.log('[Main] Conteúdo renderizado, innerHTML length:', mainContent.innerHTML.length);

state.loaded = true;
initializeEventListeners();

// Emitir evento de página pronta via EventBus
emitMainEvent('ready', { loaded: true, toolsCount: toolsData.length });

// Manter compatibilidade com CustomEvents legados
window.dispatchEvent(new CustomEvent('Page:Ready', {
detail: { loaded: true, toolsCount: toolsData.length }
}));
}

// ============================================
// Event Handlers
// ============================================
function goToSlide(index) {
const items = document.querySelectorAll('.carousel-item');
const indicators = document.querySelectorAll('.indicator');

if (items.length === 0 || indicators.length === 0) return;

// Remove active class from current slide
items[currentSlide].classList.remove('active');
items[currentSlide].classList.add('prev');
items[currentSlide].setAttribute('aria-hidden', 'true');
indicators[currentSlide].classList.remove('active');

// Calculate new index (loop)
currentSlide = (index + heroSlides.length) % heroSlides.length;

// Add active class to new slide
items.forEach((item, i) => {
item.classList.remove('active', 'next', 'prev');
if (i === currentSlide) {
item.classList.add('active');
item.setAttribute('aria-hidden', 'false');
} else if (i < currentSlide) {
item.classList.add('prev');
} else {
item.classList.add('next');
}
});

indicators[currentSlide].classList.add('active');
}

function nextSlide() {
goToSlide(currentSlide + 1);
}

function prevSlide() {
goToSlide(currentSlide - 1);
}

function startSlideInterval() {
stopSlideInterval();
slideInterval = setInterval(nextSlide, 5000);
}

function stopSlideInterval() {
if (slideInterval) {
clearInterval(slideInterval);
slideInterval = null;
}
}

function updateViewMode() {
// Update view button label
const viewBtn = document.querySelector('.view-btn');
const viewCurrent = viewBtn?.querySelector('.view-current');

const viewLabels = {
'extra-grande': 'Extra Grande',
'grande': 'Grande',
'medio': 'Médio',
'pequeno': 'Pequeno',
'lista': 'Lista',
'detalhes': 'Detalhes',
'blocos': 'Blocos',
'compacto': 'Compacto'
};

const viewIcons = {
'extra-grande': 'fa-th-large',
'grande': 'fa-th',
'medio': 'fa-square',
'pequeno': 'fa-minus-square',
'lista': 'fa-list',
'detalhes': 'fa-info-circle',
'blocos': 'fa-border-all',
'compacto': 'fa-compress-arrows-alt'
};

if (viewCurrent) {
viewCurrent.innerHTML = `${viewLabels[state.viewMode] || 'Médio'} <i class="fas fa-chevron-down"></i>`;
}

// Update grid classes
document.querySelectorAll('.tools-grid').forEach(grid => {
grid.className = `tools-grid view-${state.viewMode}`;
if (!state.showIcons) {
grid.classList.add('hide-icons');
}
});
}

function initializeEventListeners() {
// View Mode Dropdown
const viewBtn = document.querySelector('.view-btn');
const viewMenu = document.querySelector('.view-dropdown .dropdown-menu');

if (viewBtn && viewMenu) {
viewBtn.addEventListener('click', function(e) {
e.stopPropagation();
viewMenu.classList.toggle('show');
sortMenu?.classList.remove('show');
});

viewMenu.querySelectorAll('.dropdown-item').forEach(item => {
item.addEventListener('click', function(e) {
e.preventDefault();
const value = this.dataset.value;
if (value && value !== state.viewMode) {
state.viewMode = value;
saveState();
updateViewMode();
}
viewMenu.classList.remove('show');
});
});
}

// Sort Dropdown
const sortBtn = document.querySelector('.sort-btn');
const sortMenu = document.querySelector('.sort-dropdown .dropdown-menu');

if (sortBtn && sortMenu) {
sortBtn.addEventListener('click', function(e) {
e.stopPropagation();
sortMenu.classList.toggle('show');
viewMenu?.classList.remove('show');
});

sortMenu.querySelectorAll('.dropdown-item').forEach(item => {
item.addEventListener('click', function(e) {
e.preventDefault();
const value = this.dataset.value;
if (value && value !== state.sortOrder) {
state.sortOrder = value;
saveState();
renderAllTools();
}
sortMenu.classList.remove('show');
});
});
}

// Icon Toggle
const iconToggle = document.getElementById('icon-toggle');
if (iconToggle) {
iconToggle.addEventListener('change', function() {
state.showIcons = this.checked;
saveState();
document.querySelectorAll('.tools-grid').forEach(grid => {
grid.classList.toggle('hide-icons', !state.showIcons);
});
});
}

// Close dropdowns when clicking outside
document.addEventListener('click', function() {
document.querySelectorAll('.dropdown-menu').forEach(menu => {
menu.classList.remove('show');
});
});

// Hero Carousel Navigation
const carousel = document.querySelector('.hero-carousel');
if (carousel) {
// Dot navigation
document.querySelectorAll('.indicator').forEach(dot => {
dot.addEventListener('click', function() {
const slideIndex = parseInt(this.dataset.slide);
goToSlide(slideIndex);
startSlideInterval();
});
});

// Arrow navigation
const prevBtn = document.querySelector('.carousel-control.prev');
const nextBtn = document.querySelector('.carousel-control.next');

if (prevBtn) {
prevBtn.addEventListener('click', function() {
prevSlide();
startSlideInterval();
});
}

if (nextBtn) {
nextBtn.addEventListener('click', function() {
nextSlide();
startSlideInterval();
});
}

// Pause on hover
carousel.addEventListener('mouseenter', stopSlideInterval);
carousel.addEventListener('mouseleave', startSlideInterval);

// Keyboard navigation
document.addEventListener('keydown', function(e) {
if (carousel.getBoundingClientRect().top <= window.scrollY &&
carousel.getBoundingClientRect().bottom >= window.scrollY) {
if (e.key === 'ArrowLeft') {
prevSlide();
startSlideInterval();
} else if (e.key === 'ArrowRight') {
nextSlide();
startSlideInterval();
}
}
});

// Start auto-rotation
startSlideInterval();
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function(e) {
const targetId = this.getAttribute('href');
if (targetId === '#') return;

const target = document.querySelector(targetId);
if (target) {
e.preventDefault();
const offset = 100;
const top = target.getBoundingClientRect().top + window.scrollY - offset;
window.scrollTo({ top, behavior: 'smooth' });
}
});
});
}

// ============================================
// SEO - Multilingual Links
// ============================================
(function initSEO() {
const canonical = document.querySelector('link[rel="canonical"]');
if (!canonical) return;

const currentUrl = canonical.href;
const head = document.querySelector('head');

const languages = [
{ lang: 'pt-br', href: currentUrl },
{ lang: 'en', href: currentUrl.replace('/pt-BR', '/en').replace('/pt/', '/en') },
{ lang: 'es', href: currentUrl.replace('/pt-BR', '/es').replace('/pt/', '/es') }
];

languages.forEach(({ lang, href }) => {
const link = document.createElement('link');
link.rel = 'alternate';
link.hreflang = lang;
link.href = href;
head.appendChild(link);
});
})();

// ============================================
// State Management
// ============================================
function saveState() {
try {
localStorage.setItem('toolsViewState', JSON.stringify(state));
} catch (e) {
console.warn('Failed to save state:', e);
}
}

function loadState() {
try {
const saved = localStorage.getItem('toolsViewState');
if (saved) {
const parsed = JSON.parse(saved);
state = { ...state, ...parsed };
}
} catch (e) {
console.warn('Failed to load state:', e);
}
}

// ============================================
// Initialization
// ============================================
function init() {
loadState();
renderAllTools();
}

function initMain() {
const mainContent = document.getElementById('main-v2-content');
if (!mainContent) {
console.warn('[Main] Elemento #main-v2-container não encontrado, tentando novamente...');
setTimeout(initMain, 100);
return;
}

// Iniciar integração com EventBus
setupMainEventBusIntegration();
loadState();
renderAllTools();
console.log('[Main] Inicializado com sucesso');
}

// Expor initMain globalmente para ser chamado após injeção do HTML
window.MainInit = initMain;

// Run when DOM is ready - mas esperar para renderização
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', function() {
// Não inicializar imediatamente, esperar carga dos componentes
// A inicialização será chamada pelo index.html
console.log('[Main] DOM pronto, aguardando componentes...');
});
}

// Global API
window.App = {
renderAllTools,
setViewMode: function(mode) {
state.viewMode = mode;
saveState();
renderAllTools();
},
setSortOrder: function(order) {
state.sortOrder = order;
saveState();
renderAllTools();
},
toggleIcons: function(show) {
state.showIcons = show;
saveState();
renderAllTools();
},
getState: function() {
return { ...state };
}
};

})();
