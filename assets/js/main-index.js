/**
 * main-index.js - Main Application Logic
 * Sistema Modular de Carregamento e Renderização
 * Calculadoras de Enfermagem
 * 
 * Este é um módulo DELEGATE - delega funcionalidades de acessibilidade
 * para o módulo master AccessControl (accessibility.js).
 * Gerencia a renderização das ferramentas e controles de visualização.
 */

(function() {
  'use strict';

  // ============================================
  // Utility Functions (from utils.js)
  // Mantidos pois são específicos da aplicação
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
        <a href="pages/${tool.filename}" class="tool-card" role="listitem">
          <div class="tool-card-content">
            <div class="tool-icon">
              <i class="${iconClass}"></i>
            </div>
            <h3 class="tool-title">${escapeHtml(tool.name)}</h3>
            <p class="tool-description">${escapeHtml(tool.description)}</p>
            <div class="tool-meta">
              <span class="tool-category-tag">${tagText}</span>
              <span class="tool-action">
                <i class="fas ${actionIcon}"></i>
                ${actionText}
              </span>
            </div>
          </div>
        </a>
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
      return `<span class="tool-action">${btn.text} <i class="fas fa-arrow-right"></i></span>`;
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
      const element = typeof target === string 
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
     * @returns {Promise<boolean>}
     */
    async function copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('[MainIndex] Failed to copy:', err);
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

    // Public API - Removido Storage pois delega para AccessControl
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
      deepClone
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
  // State Management (Page-specific)
  // Este estado é específico da página de índice e não interfere com o AccessControl
  // ============================================
  const state = {
    searchTerm: '',
    filterCategory: 'all',
    sortOrder: 'asc',
    showIcons: true,
    viewMode: 'medio',
    loaded: false
  };

  // Chave específica para esta página
  const STORAGE_KEY = 'main_index_view_state';

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
      bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section/hero-section-welcome.webp'
    },
    {
      id: 'diagnosticos',
      title: 'Plano de Enfermagem',
      subtitle: 'Diagnósticos NANDA, NIC e NOC com intervenções personalizadas para cada caso clínico.',
      buttonText: 'Acessar Diagnósticos',
      buttonUrl: 'pages/diagnosticosnanda.html',
      imageIcon: 'fa-clipboard-list',
      gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
      bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section/hero-section-nanda-tools.webp'
    },
    {
      id: 'simulado',
      title: 'Simulado de Enfermagem',
      subtitle: 'Teste seus conhecimentos com questões comentadas de concursos e provas de residência.',
      buttonText: 'Acessar Simulado',
      buttonUrl: 'pages/simulado-de-enfermagem2.html',
      imageIcon: 'fa-graduation-cap',
      gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
      bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section/hero-section-simulator-tools.webp'
    },
    {
      id: 'biblioteca',
      title: 'Biblioteca de Enfermagem',
      subtitle: 'Downloads de materiais, apostilas, protocolos e diretrizes clínicas atualizadas.',
      buttonText: 'Acessar Biblioteca',
      buttonUrl: 'pages/downloads.html',
      imageIcon: 'fa-book-open',
      gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
      bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section/hero-section-library-tools.webp'
    },
    {
      id: 'notificacao',
      title: 'Notificação Compulsória',
      subtitle: 'Sistema de registro e acompanhamento de doenças e agravos de notificação obrigatória.',
      buttonText: 'Acessar Lista de Notificações',
      buttonUrl: 'pages/notificacao-compulsoria.html',
      imageIcon: 'fa-bell',
      gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
      bgImage: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/hero-section/hero-section-notification-tools.webp'
    }
  ];

  let currentSlide = 0;
  let slideInterval;

  // ============================================
  // Template Generators
  // ============================================
  
  function generateHeroHTML() {
    const dotsHTML = heroSlides.map((slide, index) => 
      `<span class="hero-dot ${index === 0 ? 'active' : ''}" data-slide="${index}" role="button" aria-label="Ir para slide ${index + 1}"></span>`
    ).join('');

    const slidesHTML = heroSlides.map((slide, index) => `
      <div class="hero-slide ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-hidden="${index !== 0}">
        <div class="hero-slide-content">
          <div class="hero-text-section">
            <h1 class="hero-title">${slide.title}</h1>
            <div class="hero-divider"></div>
            <p class="hero-subtitle">${slide.subtitle}</p>
            ${slide.buttonText ? `
            <a href="${slide.buttonUrl}" class="hero-btn primary">
              <i class="fas fa-arrow-right"></i>
              ${slide.buttonText}
            </a>` : ''}
          </div>
          <div class="hero-image-section">
            <div class="hero-icon-container">
              <i class="fas ${slide.imageIcon}"></i>
            </div>
          </div>
        </div>
        <div class="hero-slide-bg" style="background: ${slide.gradient} ${slide.bgImage ? `, url('${slide.bgImage}') center/cover` : ''}"></div>
      </div>
    `).join('');

    return `
      <section class="hero-carousel" aria-label="Destaques">
        <div class="hero-slides-container">
          ${slidesHTML}
        </div>
        <div class="hero-dots">
          ${dotsHTML}
        </div>
        <button class="hero-nav hero-nav-prev" aria-label="Slide anterior">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="hero-nav hero-nav-next" aria-label="Próximo slide">
          <i class="fas fa-chevron-right"></i>
        </button>
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

    return `
      <section class="visualizar-section" aria-label="Controles de visualização">
        <div class="visualizar-row">
          <div class="visualizar-group">
            <span class="visualizar-label">Exibição:</span>
            <div class="view-dropdown">
              <button class="view-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
                <span class="view-current">Médio <i class="fas fa-square"></i></span>
                <i class="fas fa-chevron-down"></i>
              </button>
              <div class="dropdown-menu" role="listbox">
                ${viewModes.map(m => `<a class="dropdown-item" data-value="${m.value}" role="option"><i class="fas ${m.icon}"></i>${m.label}</a>`).join('')}
              </div>
            </div>
          </div>

          <div class="visualizar-group">
            <span class="visualizar-label">Ordenar:</span>
            <div class="sort-dropdown">
              <button class="sort-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
                <span class="sort-current">A-Z (Crescente) <i class="fas fa-sort-alpha-down"></i></span>
                <i class="fas fa-chevron-down"></i>
              </button>
              <div class="dropdown-menu" role="listbox">
                ${sortOptions.map(o => `<a class="dropdown-item" data-value="${o.value}" role="option"><i class="fas ${o.icon}"></i>${o.label}</a>`).join('')}
              </div>
            </div>
          </div>

          <div class="visualizar-group icon-toggle">
            <span class="visualizar-label">Ícones:</span>
            <label class="toggle-switch">
              <input type="checkbox" id="icon-toggle" ${state.showIcons ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>
    `;
  }

  function generateSectionHTML(id, title, tools, type) {
    return `
      <section id="${id}" aria-labelledby="titulo-${id}">
        <div class="section-container">
          <h2 class="section-title" id="titulo-${id}">${title}</h2>
          <div class="tools-grid view-${state.viewMode}" data-category="${id}" role="list">
            ${tools.map(t => Utils.renderCard(t, state, type)).join('')}
          </div>
        </div>
      </section>
    `;
  }

  // ============================================
  // Render Functions
  // ============================================

  function renderAllTools() {
    const app = document.getElementById('app');
    if (!app) {
      console.warn('[MainIndex] Elemento #app não encontrado');
      return;
    }

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

    // Update current labels based on state
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

    const viewLabel = viewLabels[state.viewMode] || 'Médio';
    const viewIcon = viewIcons[state.viewMode] || 'fa-square';
    const sortLabel = sortLabels[state.sortOrder] || 'A-Z (Crescente)';
    const sortIcon = sortIcons[state.sortOrder] || 'fa-sort-alpha-down';

    app.innerHTML = `
      ${generateHeroHTML()}
      ${generateVisualizarHTML()}
      ${generateSectionHTML('calculadoras', 'Calculadoras Clínicas', calculators, 'calculator')}
      ${generateSectionHTML('escalas', 'Escalas Clínicas', scales, 'scale')}
      ${generateSectionHTML('vacinas', 'Calendário Vacinal', vaccines, 'other')}
    `;

    // Update labels and states after render
    const viewCurrent = app.querySelector('.view-current');
    const sortCurrent = app.querySelector('.sort-current');
    if (viewCurrent) viewCurrent.innerHTML = `${viewLabel} <i class="fas ${viewIcon}"></i>`;
    if (sortCurrent) sortCurrent.innerHTML = `${sortLabel} <i class="fas ${sortIcon}"></i>`;

    // Apply current state to UI
    app.querySelectorAll('.tools-grid').forEach(grid => {
      grid.className = `tools-grid view-${state.viewMode}`;
      if (!state.showIcons) {
        grid.classList.add('hide-icons');
      }
    });

    state.loaded = true;
    initializeEventListeners();

    // Disparar evento de prontidão para outros módulos
    window.dispatchEvent(new CustomEvent('MainIndex:Ready'));
  }

  // ============================================
  // Event Handlers
  // ============================================

  function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    
    if (slides.length === 0 || dots.length === 0) return;

    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].setAttribute('aria-hidden', 'true');
    dots[currentSlide].classList.remove('active');

    // Calculate new index (loop)
    currentSlide = (index + heroSlides.length) % heroSlides.length;

    // Add active class to new slide
    slides[currentSlide].classList.add('active');
    slides[currentSlide].setAttribute('aria-hidden', 'false');
    dots[currentSlide].classList.add('active');
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

  function initializeEventListeners() {
    // Hero Carousel Navigation
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      // Dot navigation
      document.querySelectorAll('.hero-dot').forEach(dot => {
        dot.addEventListener('click', function() {
          const slideIndex = parseInt(this.dataset.slide);
          goToSlide(slideIndex);
          startSlideInterval();
        });
      });

      // Arrow navigation
      const prevBtn = document.querySelector('.hero-nav-prev');
      const nextBtn = document.querySelector('.hero-nav-next');

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

    // View dropdown toggle
    document.querySelectorAll('.view-dropdown').forEach(dropdown => {
      dropdown.querySelector('.view-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        document.querySelectorAll('.view-dropdown.open, .sort-dropdown.open').forEach(dd => {
          dd.classList.remove('open');
        });
        if (!isOpen) {
          dropdown.classList.add('open');
        }
      });
    });

    // Sort dropdown toggle
    document.querySelectorAll('.sort-dropdown').forEach(dropdown => {
      dropdown.querySelector('.sort-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        document.querySelectorAll('.view-dropdown.open, .sort-dropdown.open').forEach(dd => {
          dd.classList.remove('open');
        });
        if (!isOpen) {
          dropdown.classList.add('open');
        }
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.view-dropdown') && !e.target.closest('.sort-dropdown')) {
        document.querySelectorAll('.view-dropdown.open, .sort-dropdown.open').forEach(dd => {
          dd.classList.remove('open');
        });
      }
    });

    // View mode selection
    document.querySelectorAll('.view-dropdown .dropdown-item').forEach(item => {
      item.addEventListener('click', function() {
        const value = this.dataset.value;
        state.viewMode = value;
        saveState();

        const dropdown = this.closest('.view-dropdown');
        const label = this.textContent.trim();

        // Extract icon class and remove 'fas' prefix for cleaner HTML
        const iconElement = this.querySelector('i');
        let iconClass = 'fa-square';
        if (iconElement && iconElement.classList.length > 0) {
          iconClass = Array.from(iconElement.classList)
            .filter(c => c !== 'fas')
            .join(' ');
        }

        // Update button display
        const viewCurrent = dropdown.querySelector('.view-current');
        viewCurrent.innerHTML = `${label} <i class="fas ${iconClass}"></i>`;

        // Update all grids
        document.querySelectorAll('.tools-grid').forEach(grid => {
          grid.className = `tools-grid view-${value}`;
        });

        dropdown.classList.remove('open');
      });
    });

    // Sort selection
    document.querySelectorAll('.sort-dropdown .dropdown-item').forEach(item => {
      item.addEventListener('click', function() {
        const value = this.dataset.value;
        state.sortOrder = value;
        saveState();

        const dropdown = this.closest('.sort-dropdown');
        const label = this.textContent.trim();

        // Extract icon class and remove 'fas' prefix
        const iconElement = this.querySelector('i');
        let iconClass = 'fa-sort-alpha-down';
        if (iconElement && iconElement.classList.length > 0) {
          iconClass = Array.from(iconElement.classList)
            .filter(c => c !== 'fas')
            .join(' ');
        }

        // Update button display
        const sortCurrent = dropdown.querySelector('.sort-current');
        sortCurrent.innerHTML = `${label} <i class="fas ${iconClass}"></i>`;

        renderAllTools();
        dropdown.classList.remove('open');
      });
    });

    // Icon toggle
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
  // State Management (Page-specific)
  // ============================================

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[MainIndex] Falha ao salvar estado:', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
      }
    } catch (e) {
      console.warn('[MainIndex] Falha ao carregar estado:', e);
    }
  }

  // ============================================
  // Initialization
  // ============================================

  function init() {
    // Aguardar o AccessControl estar pronto (delegação)
    if (window.AccessControl && typeof window.AccessControl.isLoaded === 'function') {
      if (!window.AccessControl.isLoaded()) {
        window.addEventListener('AccessControl:Ready', handleInit, { once: true });
        return;
      }
    }
    
    handleInit();
  }

  function handleInit() {
    loadState();
    renderAllTools();
    console.log('[MainIndex] Módulo inicializado');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  // Global API (Page-specific)
  // Não interfere com AccessControl
  // ============================================
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
