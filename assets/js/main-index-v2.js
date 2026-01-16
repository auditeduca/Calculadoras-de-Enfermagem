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

    window.EventBus.on('theme:changed', function(data) {
        console.log('[Main] Tema alterado detectado via EventBus:', data.theme);
        updateMainForTheme(data.isDark);
    }, { module: 'main' });

    window.EventBus.on('font:changed', function(data) {
        console.log('[Main] Fonte alterada detectada via EventBus:', data.size);
        updateMainForFontSize(data.size);
    }, { module: 'main' });

    window.EventBus.on('header:ready', function(data) {
        console.log('[Main] Header está pronto, sincronizando...');
    }, { module: 'main' });

    window.EventBus.on('accessibility:settings:changed', function(data) {
        console.log('[Main] Configurações de acessibilidade alteradas via EventBus');
        updateMainForAccessibility(data);
    }, { module: 'main' });
}

function emitMainEvent(eventName, data) {
    if (window.EventBus && MainModule.eventBusReady) {
        window.EventBus.emit('main:' + eventName, {
            ...data,
            source: 'main',
            timestamp: Date.now()
        });
    }
    window.dispatchEvent(new CustomEvent('main:' + eventName, {
        detail: { ...data, source: 'main' }
    }));
}

function updateMainForTheme(isDark) {
    const mainContent = document.getElementById('main-v2-content');
    if (mainContent) {
        mainContent.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
}

function updateMainForFontSize(size) {
    const mainContent = document.getElementById('main-v2-content');
    if (mainContent) {
        mainContent.setAttribute('data-font-size', size);
    }
}

function updateMainForAccessibility(settings) {
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
// Utility Functions
// ============================================
const Utils = (function() {
'use strict';

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
    // Capitalizar primeira letra da tag
    const capitalizedTag = tagText.charAt(0).toUpperCase() + tagText.slice(1);

    return `
<a href="${tool.filename}" class="calculator-card ${type}" data-id="${tool.id}" data-category="${tool.category}">
    <div class="calculator-icon" style="background-color: var(--${tool.color}-light, #e3f2fd); color: var(--${tool.color}-primary, #1976d2);">
        <i class="${iconClass}" aria-hidden="true"></i>
    </div>
    <div class="calculator-content">
        <h3 class="calculator-title">${escapeHtml(tool.name)}</h3>
        <span class="calculator-tag">${capitalizedTag}</span>
        <p class="calculator-description">${escapeHtml(tool.description)}</p>
    </div>
    <div class="calculator-meta">
        <span class="calculator-action">
            <i class="fas ${actionIcon}" aria-hidden="true"></i>
            ${actionText}
        </span>
    </div>
</a>
`;
}

function getActionButton(type) {
    const buttons = {
        calculator: { icon: 'fa-calculator', text: 'Calcular' },
        scale: { icon: 'fa-clipboard-list', text: 'Classificar' },
        other: { icon: 'fa-calendar-check', text: 'Consultar' }
    };
    const btn = buttons[type] || buttons.other;
    return `<button class="action-btn"><i class="fas ${btn.icon}"></i> ${btn.text}</button>`;
}

function isHighlighted(tool, sectionState) {
    if (sectionState.filterCategory === 'all') return true;
    return tool.category === sectionState.filterCategory;
}

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

function onReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function scrollTo(target, offset = 100) {
    const element = typeof target === 'string'
        ? document.querySelector(target)
        : target;
    if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

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
// Tool Data
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
    { id: 'apache', name: 'APACHE II', category: 'UTI', type: 'calculator', description: 'Avaliação de gravidade em pacientes críticos: Acute Physiology and Chronic Health Evaluation.', filename: 'score-apache.html', icon: 'fas fa-hospital-user', color: 'primary' },

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
        bgImage: 'assets/images/hero-section/hero-section-welcome.webp'
    },
    {
        id: 'diagnosticos',
        title: 'Plano de Enfermagem',
        subtitle: 'Diagnósticos NANDA, NIC e NOC com intervenções personalizadas para cada caso clínico.',
        buttonText: 'Acessar Diagnósticos',
        buttonUrl: 'pages/diagnosticosnanda.html',
        imageIcon: 'fa-clipboard-list',
        gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
        bgImage: 'assets/images/hero-section/hero-section-nanda-tools.webp'
    },
    {
        id: 'simulado',
        title: 'Simulado de Enfermagem',
        subtitle: 'Teste seus conhecimentos com questões comentadas de concursos e provas de residência.',
        buttonText: 'Acessar Simulado',
        buttonUrl: 'pages/simulado-de-enfermagem2.html',
        imageIcon: 'fa-graduation-cap',
        gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
        bgImage: 'assets/images/hero-section/hero-section-simulator-tools.webp'
    },
    {
        id: 'biblioteca',
        title: 'Biblioteca de Enfermagem',
        subtitle: 'Downloads de materiais, apostilas, protocolos e diretrizes clínicas atualizadas.',
        buttonText: 'Acessar Biblioteca',
        buttonUrl: 'pages/downloads.html',
        imageIcon: 'fa-book-open',
        gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
        bgImage: 'assets/images/hero-section/hero-section-library-tools.webp'
    },
    {
        id: 'notificacao',
        title: 'Notificação Compulsória',
        subtitle: 'Sistema de registro e acompanhamento de doenças e agravos de notificação obrigatória.',
        buttonText: 'Acessar Lista de Notificações',
        buttonUrl: 'pages/notificacao-compulsoria.html',
        imageIcon: 'fa-bell',
        gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
        bgImage: 'assets/images/hero-section/hero-section-notification-tools.webp'
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
<div class="carousel-item ${index === 0 ? 'active' : ''}" data-slide="${index}">
    <div class="hero-slide" style="background-image: ${slide.gradient}, url('${slide.bgImage}')">
        <div class="hero-content">
            <h2 class="hero-title">${slide.title}</h2>
            <p class="hero-subtitle">${slide.subtitle}</p>
            ${slide.buttonText ? `<a href="${slide.buttonUrl}" class="hero-btn">${slide.buttonText}</a>` : ''}
        </div>
        <div class="hero-icon-container">
            <div class="hero-icon">
                <i class="fas ${slide.imageIcon}" aria-hidden="true"></i>
            </div>
        </div>
    </div>
</div>
`).join('');

    return `
<div class="hero-carousel" role="region" aria-label="Destaques">
    <div class="carousel-inner">
        ${slidesHTML}
    </div>
    <div class="carousel-indicators" aria-label="Navegação do carrossel">
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
    const iconHTML = icon ? `<i class="fas ${icon}" aria-hidden="true"></i>` : '';
    return `
<section id="${id}" class="section" aria-labelledby="${id}-title">
    <header class="section-header">
        <h2 id="${id}-title" class="section-title">
            ${iconHTML}
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
<div class="visualizar-section" role="region" aria-label="Controles de visualização">
    <div class="visualizar-row">
        <div class="visualizar-group">
            <span class="visualizar-label">Exibição:</span>
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
        </div>

        <div class="visualizar-group">
            <span class="visualizar-label">Ordenar:</span>
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
        </div>

        <div class="visualizar-group">
            <span class="visualizar-label">Ícones:</span>
            <label class="toggle-switch">
                <input type="checkbox" id="icon-toggle" ${state.showIcons ? 'checked' : ''} aria-label="Mostrar ícones">
                <span class="toggle-slider"></span>
            </label>
        </div>
    </div>
</div>
`;
}

// ============================================
// Render Functions
// ============================================
function renderHero() {
    const heroContainer = document.getElementById('hero-container');
    if (!heroContainer) {
        console.warn('[Main] Elemento #hero-container não encontrado');
        return;
    }

    const heroHTML = generateHeroHTML();
    heroContainer.innerHTML = heroHTML;
    console.log('[Main] Hero renderizado com sucesso');

    // Inicializar eventos do carrossel
    initializeCarouselEvents();
}

function renderMainContent() {
    const mainContent = document.getElementById('main-v2-content');
    if (!mainContent) {
        console.warn('[Main] Elemento #main-v2-content não encontrado');
        return;
    }

    console.log('[Main] Renderizando ferramentas...');
    console.log('[Main] toolsData length:', toolsData.length);

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

    const visualizarHTML = generateVisualizarHTML();
    const sectionCalculadoras = generateSectionHTML('calculadoras', 'Calculadoras Clínicas', calculators, 'calculator');
    const sectionEscalas = generateSectionHTML('escalas', 'Escalas Clínicas', scales, 'scale');
    const sectionVacinas = generateSectionHTML('vacinas', 'Calendário Vacinal', vaccines, 'other');

    console.log('[Main] Visualizar HTML length:', visualizarHTML.length);
    console.log('[Main] Section HTML length:', sectionCalculadoras.length + sectionEscalas.length + sectionVacinas.length);

    mainContent.innerHTML = visualizarHTML + sectionCalculadoras + sectionEscalas + sectionVacinas;
    console.log('[Main] Ferramentas renderizadas, innerHTML length:', mainContent.innerHTML.length);

    // Inicializar eventos de visualização
    initializeViewEvents();
}

function renderAllTools() {
    renderHero();
    renderMainContent();

    state.loaded = true;

    emitMainEvent('ready', { loaded: true, toolsCount: toolsData.length });

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

    items[currentSlide].classList.remove('active');
    items[currentSlide].classList.add('prev');
    items[currentSlide].setAttribute('aria-hidden', 'true');
    indicators[currentSlide].classList.remove('active');

    currentSlide = (index + heroSlides.length) % heroSlides.length;

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

    document.querySelectorAll('.tools-grid').forEach(grid => {
        grid.className = `tools-grid view-${state.viewMode}`;
        if (!state.showIcons) {
            grid.classList.add('hide-icons');
        }
    });
}

function initializeCarouselEvents() {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    document.querySelectorAll('.indicator').forEach(dot => {
        dot.addEventListener('click', function() {
            const slideIndex = parseInt(this.dataset.slide);
            goToSlide(slideIndex);
            startSlideInterval();
        });
    });

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

    carousel.addEventListener('mouseenter', stopSlideInterval);
    carousel.addEventListener('mouseleave', startSlideInterval);

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

    startSlideInterval();
}

function initializeViewEvents() {
    const viewBtn = document.querySelector('.view-btn');
    const viewMenu = document.querySelector('.view-dropdown .dropdown-menu');
    const sortBtn = document.querySelector('.sort-btn');
    const sortMenu = document.querySelector('.sort-dropdown .dropdown-menu');

    if (viewBtn && viewMenu) {
        viewBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Fechar o outro dropdown antes de abrir este
            if (sortMenu && sortMenu.classList.contains('show')) {
                sortMenu.classList.remove('show');
            }
            viewMenu.classList.toggle('show');
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

    if (sortBtn && sortMenu) {
        sortBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Fechar o outro dropdown antes de abrir este
            if (viewMenu && viewMenu.classList.contains('show')) {
                viewMenu.classList.remove('show');
            }
            sortMenu.classList.toggle('show');
        });

        sortMenu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const value = this.dataset.value;
                if (value && value !== state.sortOrder) {
                    state.sortOrder = value;
                    saveState();
                    renderMainContent();
                }
                sortMenu.classList.remove('show');
            });
        });
    }

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

    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    });

    // Eventos de ancoragem suave
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

function initializeEventListeners() {
    initializeCarouselEvents();
    initializeViewEvents();
}

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

function init() {
    loadState();
    renderAllTools();
}

function initMain() {
    // Aguardar hero-container
    const heroContainer = document.getElementById('hero-container');
    const mainContent = document.getElementById('main-v2-content');

    if (!heroContainer || !mainContent) {
        console.warn('[Main] Elementos necessários não encontrados, tentando novamente...');
        setTimeout(initMain, 100);
        return;
    }

    setupMainEventBusIntegration();
    loadState();
    renderAllTools();
    console.log('[Main] Inicializado com sucesso');
}

window.MainInit = initMain;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Main] DOM pronto, aguardando componentes...');
    });
}

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
