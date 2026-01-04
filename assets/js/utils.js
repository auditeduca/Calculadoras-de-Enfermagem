/**
 * ============================================
 * UTILS.JS - Enhanced with Main Index Loader
 * Calculadoras de Enfermagem
 * Portal de Ferramentas Clínicas
 *
 * Funcionalidades:
 * - Dados das ferramentas clínicas (merged from main-index-loader.js)
 * - Renderização de cards com diferenciação por tipo
 * - Sistema de classificação e ordenação
 * - Controle de visualização de ícones
 * - Alternância entre modos de visualização
 * - AppLoader para componentes dinâmicos
 * - CSS inline para cards
 * ============================================
 */
const Utils = {
  // ============================================
  // DADOS DAS FERRAMENTAS (from main-index-loader.js)
  // ============================================
  toolsData: [
    // Calculadoras
    { id: "balanco-hidrico", name: "Balanço Hídrico", type: "calculator", description: "Controle preciso de líquidos e fluidos corporais.", filename: "balancohidrico.html", icon: "fas fa-tint", color: "blue" },
    { id: "gasometria", name: "Cálculo de Gasometria", type: "calculator", description: "Interpretação de gasometria arterial e distúrbios ácido-básicos.", filename: "gasometria.html", icon: "fas fa-vial", color: "blue" },
    { id: "gotejamento", name: "Cálculo de Gotejamento", type: "calculator", description: "Velocidade de infusão de soluções parenterais.", filename: "gotejamento.html", icon: "fas fa-hand-holding-water", color: "blue" },
    { id: "aspiracao-heparina", name: "Cálculo de Heparina", type: "calculator", description: "Cálculo seguro de doses de heparina.", filename: "heparina.html", icon: "fas fa-syringe", color: "blue" },
    { id: "imc", name: "Índice de Massa Corporal (IMC)", type: "calculator", description: "Avaliação nutricional e classificação de peso.", filename: "imc.html", icon: "fas fa-weight", color: "blue" },
    { id: "aspiracao-insulina", name: "Cálculo de Insulina", type: "calculator", description: "Cálculo de doses e unidades de insulina.", filename: "insulina.html", icon: "fas fa-syringe", color: "blue" },
    { id: "medicamentos", name: "Cálculo de Medicamentos", type: "calculator", description: "Regra de três para doses e diluições.", filename: "medicamentos.html", icon: "fas fa-pills", color: "blue" },
    { id: "dimensionamento", name: "Dimensionamento de Equipe", type: "calculator", description: "Organização de recursos humanos segundo COFEN.", filename: "dimensionamento.html", icon: "fas fa-users-cog", color: "blue" },
    { id: "idade-gestacional", name: "Idade Gestacional e DPP", type: "calculator", description: "Cálculo de DUM, DPP e idade gestacional.", filename: "gestacional.html", icon: "fas fa-baby", color: "blue" },
    
    // Escalas
    { id: "aldrete-e-kroulik", name: "Escala de Aldrete e Kroulik", type: "scale", description: "Avaliação do paciente em recuperação pós-anestésica.", filename: "aldrete.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "apache-ii", name: "Escala de APACHE II", type: "scale", description: "Avaliação de gravidade em pacientes críticos.", filename: "apache.html", icon: "fa-solid fa-receipt", color: "blue" },
    { id: "apgar", name: "Escala de Apgar", type: "scale", description: "Avaliação imediata do recém-nascido.", filename: "apgar.html", icon: "fas fa-baby-carriage", color: "blue" },
    { id: "asa", name: "Risco Perioperatório - ASA", type: "scale", description: "Classificação do estado físico pré-operatório.", filename: "asa.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "ballard", name: "Escala de Ballard", type: "scale", description: "Maturidade neuromuscular do recém-nascido.", filename: "ballard.html", icon: "fas fa-baby-carriage", color: "blue" },
    { id: "barthel", name: "Escala de Barthel", type: "scale", description: "Nível de independência funcional do paciente.", filename: "barthel.html", icon: "fas fa-walking", color: "blue" },
    { id: "bps", name: "Escala de Behavioural (BPS)", type: "scale", description: "Avaliação de dor em pacientes sedados/ventilados.", filename: "bps.html", icon: "fa-solid fa-mask-face", color: "blue" },
    { id: "berg", name: "Escala de BERG (BBS)", type: "scale", description: "Equilíbrio estático e dinâmico.", filename: "berg.html", icon: "fa-solid fa-person", color: "blue" },
    { id: "bishop", name: "Índice de Bishop", type: "scale", description: "Maturidade cervical para parto.", filename: "bishop.html", icon: "fa-solid fa-user-doctor", color: "blue" },
    { id: "braden", name: "Escala de Braden", type: "scale", description: "Risco de desenvolvimento de lesão por pressão.", filename: "braden.html", icon: "fas fa-bed", color: "blue" },
    { id: "cam-icu", name: "Escala CAM-ICU", type: "scale", description: "Avaliação de delirium em unidade intensiva.", filename: "cam.html", icon: "fas fa-hospital-alt", color: "blue" },
    { id: "capurro", name: "Método de Capurro", type: "scale", description: "Estimativa da idade gestacional ao nascer.", filename: "capurro.html", icon: "fas fa-baby", color: "blue" },
    { id: "charlson", name: "Índice de Charlson", type: "scale", description: "Predição de mortalidade por comorbidades.", filename: "charlson.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "cpot", name: "Escala de CPOT", type: "scale", description: "Avaliação de dor em pacientes críticos.", filename: "cpot.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "cristal-samur", name: "Escala de Cristal-Samur", type: "scale", description: "Avaliação de gravidade de pacientes críticos.", filename: "cristal.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "downton", name: "Escala de Downton", type: "scale", description: "Avaliação do risco de quedas.", filename: "downton.html", icon: "fas fa-user-injured", color: "blue" },
    { id: "epworth", name: "Escala de Epworth", type: "scale", description: "Avaliação de sonolência diurna.", filename: "epworth.html", icon: "fas fa-bed", color: "blue" },
    { id: "flacc", name: "Escala de FLACC", type: "scale", description: "Avaliação de dor em crianças.", filename: "flacc.html", icon: "fas fa-child", color: "blue" },
    { id: "fugulin", name: "Sistema de Fugulin", type: "scale", description: "Classificação de cuidados de enfermagem.", filename: "fugulin.html", icon: "fas fa-user-nurse", color: "blue" },
    { id: "glasgow-adulto", name: "Escala de Glasgow - Adulto", type: "scale", description: "Avaliação do nível de consciência em adultos.", filename: "glasgow.html", icon: "fas fa-brain", color: "blue" },
    { id: "glasgow-pediatrico", name: "Escala de Glasgow - Pediátrico", type: "scale", description: "Avaliação do nível de consciência em crianças.", filename: "glasgowped.html", icon: "fas fa-child", color: "blue" },
    { id: "morse", name: "Escala de Morse", type: "scale", description: "Avaliação do risco de quedas.", filename: "morse.html", icon: "fas fa-user-injured", color: "blue" },
    { id: "nips", name: "Escala de NIPS", type: "scale", description: "Avaliação de dor em neonatos.", filename: "nips.html", icon: "fas fa-baby", color: "blue" },
    { id: "norton", name: "Escala de Norton", type: "scale", description: "Risco de desenvolvimento de úlceras por pressão.", filename: "norton.html", icon: "fas fa-bed", color: "blue" },
    { id: "painad", name: "Escala de PAINAD", type: "scale", description: "Avaliação de dor em demência avançada.", filename: "painad.html", icon: "fas fa-user-injured", color: "blue" },
    { id: "push", name: "Escala de PUSH", type: "scale", description: "Cicatrização de úlceras por pressão.", filename: "push.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "rass", name: "Escala de RASS", type: "scale", description: "Avaliação de agitação e sedação.", filename: "rass.html", icon: "fas fa-bed", color: "blue" },
    { id: "saps-ii", name: "Escala de SAPS II", type: "scale", description: "Fisiologia aguda e avaliação crônica de saúde.", filename: "saps.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "sofa", name: "Escala de SOFA", type: "scale", description: "Avaliação sequencial de falência orgânica.", filename: "sofa.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "susan-halfen", name: "Escala de Susan Halfen", type: "scale", description: "Avaliação do risco de quedas.", filename: "susan.html", icon: "fas fa-user-injured", color: "blue" },
    { id: "waterlow", name: "Escala de Waterlow", type: "scale", description: "Risco de desenvolvimento de úlceras por pressão.", filename: "waterlow.html", icon: "fas fa-bed", color: "blue" },
    { id: "wong-baker", name: "Escala de Wong-Baker", type: "scale", description: "Avaliação de dor usando faces.", filename: "wong.html", icon: "fas fa-smile", color: "blue" }
  ],

  // ============================================
  // APPLOADER PARA COMPONENTES DINÂMICOS
  // ============================================
  AppLoader: {
    loadComponent: function(componentName, target) {
      console.log(`[AppLoader] Carregando componente: ${componentName}`);
      
      if (!target) {
        console.error(`[AppLoader] Target não encontrado para ${componentName}`);
        return;
      }
      
      const componentPath = `components/${componentName}.html`;
      
      fetch(componentPath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(html => {
          target.innerHTML = html;
          console.log(`[AppLoader] Componente ${componentName} carregado com sucesso`);
          
          // Disparar evento customizado para componentes que dependem do carregamento
          const event = new CustomEvent('AppReady', { 
            detail: { component: componentName } 
          });
          window.dispatchEvent(event);
        })
        .catch(error => {
          console.error(`[AppLoader] Erro ao carregar ${componentName}:`, error);
          target.innerHTML = `<div class="error">Erro ao carregar ${componentName}</div>`;
        });
    },
    
    // Carregamento automático baseado em data attributes
    autoLoad: function() {
      console.log('[AppLoader] Iniciando carregamento automático');
      const components = document.querySelectorAll('[data-component]');
      
      components.forEach(element => {
        const componentName = element.getAttribute('data-component');
        if (componentName) {
          this.loadComponent(componentName, element);
        }
      });
    },
    
    // Inicialização
    init: function() {
      document.addEventListener('DOMContentLoaded', () => {
        this.autoLoad();
      });
    }
  },

  // ============================================
  // RENDERIZAÇÃO DE CARDS (Enhanced)
  // ============================================
  /**
   * Processa dados das ferramentas e adiciona links
   */
  processToolsData: function(data, baseUrl = 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/') {
    return data.map(tool => ({
      ...tool,
      link: `${baseUrl}${tool.filename}`,
      category: tool.type === 'calculator' ? 'calculators' : 'scales'
    }));
  },

  /**
   * Filtra ferramentas por tipo e busca
   */
  filterTools: function(tools, filterType = 'all', searchQuery = '') {
    let filtered = tools;
    
    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(tool => tool.type === filterType);
    }
    
    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  },

  /**
   * Renderiza um card de ferramenta com estrutura completa
   * @param {Object} item - Dados da ferramenta
   * @param {Object} options - Opções de configuração
   * @param {string} type - Tipo de ferramenta (calculator, scale, other)
   * @returns {string} HTML do card
   */
  renderCard: function(item, options = {}, type = null) {
    // Auto-detectar tipo se não fornecido
    const cardType = type || item.type || 'calculator';
    const isHighlighted = this.isHighlighted(item, options);
    const highlightClass = isHighlighted ? 'highlighted' : '';
    const iconHiddenClass = options.hideIcons ? 'icon-hidden' : '';
    
    // Cores por tipo de ferramenta
    const typeColors = {
      calculator: { border: 'blue', bg: 'rgba(59, 130, 246, 0.1)', icon: '#3b82f6' },
      scale: { border: 'emerald', bg: 'rgba(16, 185, 129, 0.1)', icon: '#10b981' },
      other: { border: 'amber', bg: 'rgba(245, 158, 11, 0.1)', icon: '#f59e0b' }
    };
    const colors = typeColors[cardType] || typeColors.calculator;
    const actionText = this.getActionButtonText(cardType);
    const categoryTags = this.generateCategoryTags(item, cardType, colors);
    
    // Gerar link se não existir
    const itemLink = item.link || `https://auditeduca.github.io/Calculadoras-de-Enfermagem/${item.filename}`;
    
    return `
      <div class="tool-card bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${highlightClass} ${iconHiddenClass}"
           data-type="${cardType}" data-name="${this.escapeHtml(item.name)}" data-id="${item.id}">
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            ${categoryTags}
            <div class="tool-icon hidden lg:block text-${colors.border}-500 text-2xl" style="color: ${colors.icon};">
              <i class="${item.icon || 'fas fa-calculator'}"></i>
            </div>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">${this.escapeHtml(item.name)}</h3>
          <p class="text-gray-600 text-sm mb-4">${this.escapeHtml(item.description)}</p>
          <div class="text-right">
            <a href="${itemLink}" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-${colors.border}-600 hover:bg-${colors.border}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${colors.border}-500 transition-colors duration-200" target="_blank" rel="noopener">
              ${actionText}
              <i class="fas fa-external-link-alt ml-2"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renderiza grade de ferramentas
   */
  renderGrid: function(containerId = 'tools-grid') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} não encontrado`);
      return;
    }

    container.innerHTML = '';
    
    // Processar dados das ferramentas
    const processedTools = this.processToolsData(this.toolsData);
    
    processedTools.forEach(tool => {
      const cardElement = document.createElement('div');
      cardElement.innerHTML = this.renderCard(tool);
      container.appendChild(cardElement.firstElementChild);
    });

    console.log(`Renderizados ${processedTools.length} cards no container ${containerId}`);
  },
  /**
   * Retorna o texto do botão de ação baseado no tipo
   */
  getActionButtonText: function(type) {
    const texts = {
      calculator: 'Calcular',
      scale: 'Classificar',
      other: 'Consultar'
    };
    return texts[type] || 'Acessar';
  },
  /**
   * Gera badges de categoria com cores customizadas
   */
  generateCategoryTags: function(item, type, colors = null) {
    const typeLabels = {
      calculator: 'Calculadora',
      scale: 'Escala',
      other: 'Informação'
    };
    const defaultColors = {
      calculator: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
      scale: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
      other: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' }
    };
    const colorSet = colors || defaultColors[type] || defaultColors.other;
    const label = typeLabels[type] || typeLabels.calculator;
    return `
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style="background-color: ${colorSet.bg}; color: ${colorSet.text};">
        ${this.escapeHtml(label)}
      </span>
    `;
  },
  /**
   * Verifica se o card deve ser destacado
   */
  isHighlighted: function(item, options) {
    return options && options.filterType &&
           options.filterType !== 'all' &&
           item.type === options.filterType;
  },
  /**
   * Renderiza lista de cards em container
   * @param {HTMLElement} container - Elemento container
   * @param {Array} items - Array de itens
   * @param {Object} options - Opções de renderização
   * @param {string} type - Tipo de ferramenta
   */
  renderCardList: function(container, items, options = {}, type = 'calculator') {
    if (!container) return;
    container.innerHTML = '';
    if (!items || items.length === 0) {
      container.innerHTML = this.getEmptyState();
      return;
    }
    // Renderização com animação escalonada
    items.forEach((item, index) => {
      const cardHTML = this.renderCard(item, options, type);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cardHTML;
      const cardElement = tempDiv.firstElementChild;
      // Adicionar delay de animação
      cardElement.style.animationDelay = `${index * 50}ms`;
      cardElement.classList.add('fade-in-up');
      container.appendChild(cardElement);
    });
  },
  /**
   * Retorna HTML para estado vazio
   */
  getEmptyState: function() {
    return `
      <div class="col-span-full text-center py-10">
        <i class="far fa-folder-open text-6xl text-gray-400 mb-4"></i>
        <h3 class="text-2xl font-semibold text-gray-700 mb-2">Nenhuma ferramenta encontrada</h3>
        <p class="text-gray-500">Tente verificar os filtros ou categorias disponíveis.</p>
      </div>
    `;
  },
  /**
   * Função utilitária de debounce
   */
  debounce: function(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      const later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  /**
   * Função utilitária de throttle
   */
  throttle: function(func, limit) {
    let inThrottle;
    return function(...args) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  /**
   * Executa callback quando DOM estiver pronto
   */
  onReady: function(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  },
  /**
   * Cria elemento HTML com atributos e conteúdo
   */
  createElement: function(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    if (content instanceof HTMLElement) {
      element.appendChild(content);
    } else if (content) {
      element.innerHTML = content;
    }
    return element;
  },
  /**
   * Escapa caracteres HTML para evitar XSS
   */
  escapeHtml: function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  /**
   * Formata data para padrão brasileiro
   */
  formatDate: function(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },
  /**
   * Obtém parâmetro da URL
   */
  getUrlParam: function(param) {
    return new URLSearchParams(window.location.search).get(param);
  },
  /**
   * Rola suavemente até elemento
   */
  scrollTo: function(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({
        top: rect.top + scrollTop - offset,
        behavior: 'smooth'
      });
    }
  },
  /**
   * Copia texto para clipboard
   */
  async copyToClipboard: async function(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erro ao copiar para clipboard:', error);
      return false;
    }
  },
  /**
   * Verifica se elemento está visível na viewport
   */
  isElementInViewport: function(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // ============================================
  // SISTEMA DE BUSCA E FILTROS (from global-main-index.js)
  // ============================================
  
  /**
   * Renderiza contadores das categorias
   */
  renderCategoryCounts: function(tools) {
    const counts = {
      all: tools.length,
      calculator: tools.filter(t => t.type === 'calculator').length,
      scale: tools.filter(t => t.type === 'scale').length
    };
    
    // Atualizar badges de contagem
    Object.entries(counts).forEach(([type, count]) => {
      const badge = document.querySelector(`[data-filter="${type}"] .count-badge`);
      if (badge) {
        badge.textContent = count;
      }
    });
    
    return counts;
  },

  /**
   * Configura sistema de busca
   */
  setupSearch: function() {
    const searchInput = document.getElementById('search-tools');
    if (!searchInput) return;
    
    const debouncedSearch = this.debounce((query) => {
      this.onSearchChange(query);
    }, 300);
    
    searchInput.addEventListener('input', function(e) {
      debouncedSearch(e.target.value);
    });
    
    // Botão de limpar busca
    const clearBtn = document.getElementById('clear-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.onSearchChange('');
      });
    }
  },

  /**
   * Callback para mudanças na busca (deve ser implementado pela página)
   */
  onSearchChange: function(query) {
    // Esta função pode ser sobrescrita pela página que usa Utils
    console.log('Busca alterada:', query);
  },

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================
  storage: {
    set: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        return false;
      }
    },
    
    get: function(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Erro ao ler do localStorage:', error);
        return defaultValue;
      }
    },
    
    remove: function(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Erro ao remover do localStorage:', error);
        return false;
      }
    }
  },

  // ============================================
  // INICIALIZAÇÃO PRINCIPAL (Enhanced)
  // ============================================
  init: function() {
    console.log('[Utils] Inicializando sistema...');
    
    // Inicializar AppLoader
    this.AppLoader.init();
    
    // Configurar filtros se existirem
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const filterType = e.target.getAttribute('data-filter');
        
        // Atualizar estado visual dos botões
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Callback para filtro (pode ser sobrescrito)
        if (this.onFilterChange) {
          this.onFilterChange(filterType);
        }
      });
    });

    // Configurar busca
    this.setupSearch();

    // Renderizar grid principal se existir
    const mainGrid = document.getElementById('tools-grid');
    if (mainGrid && this.toolsData.length > 0) {
      this.renderGrid('tools-grid');
    }

    console.log('[Utils] Sistema inicializado com sucesso');
  },

  /**
   * Callback para mudanças no filtro (pode ser sobrescrito)
   */
  onFilterChange: function(filterType) {
    console.log('Filtro alterado:', filterType);
  }
};
/**
 * ============================================
 * MÓDULO DE CLASSIFICAÇÃO (SortManager)
 * Gerencia ordenação dos cards
 * ============================================
 */
const SortManager = (function() {
  // Estado do classificador
  let currentSortOrder = 'az';
  let sortOptions = ['az', 'za', 'type'];
  const STORAGE_KEY = 'sortPreference';

  /**
   * Inicializa o sistema de classificação
   */
  function init(options = {}) {
    sortOptions = options.options || sortOptions;
    loadSavedPreference();
    setupEventListeners();
  }

  /**
   * Carrega preferência salva do localStorage
   */
  function loadSavedPreference() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && sortOptions.includes(saved)) {
      currentSortOrder = saved;
    }
  }

  /**
   * Salva preferência atual
   */
  function savePreference() {
    localStorage.setItem(STORAGE_KEY, currentSortOrder);
  }

  /**
   * Configura event listeners dos botões
   */
  function setupEventListeners() {
    document.querySelectorAll('[data-sort]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const sortValue = this.dataset.sort;
        if (sortValue && sortOptions.includes(sortValue)) {
          setSortOrder(sortValue);
        }
      });
    });
    updateSortButtons();
  }

  /**
   * Define nova ordem de classificação
   */
  function setSortOrder(order) {
    if (order === currentSortOrder) return;
    currentSortOrder = order;
    savePreference();
    updateSortButtons();
    document.dispatchEvent(new CustomEvent('sortChanged', { detail: { order: currentSortOrder } }));
  }

  /**
   * Atualiza estado visual dos botões
   */
  function updateSortButtons() {
    document.querySelectorAll('[data-sort]').forEach(btn => {
      const isActive = btn.dataset.sort === currentSortOrder;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
  }

  /**
   * Retorna lista ordenada de itens
   */
  function sortItems(items) {
    return [...items].sort((a, b) => {
      switch (currentSortOrder) {
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        case 'type':
          const typeCompare = a.type.localeCompare(b.type);
          if (typeCompare !== 0) return typeCompare;
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  /**
   * Retorna ordem atual
   */
  function getCurrentOrder() {
    return currentSortOrder;
  }

  // API pública
  return {
    init,
    setSortOrder,
    getCurrentOrder,
    sortItems
  };
})();

/**
 * ============================================
 * MÓDULO DE ÍCONES (IconToggleManager)
 * Controla visibilidade dos ícones nos cards
 * ============================================
 */
const IconToggleManager = (function() {
  let iconsVisible = true;
  const STORAGE_KEY = 'iconsVisible';

  function init() {
    loadSavedState();
    setupEventListeners();
    applyCurrentState();
  }

  function loadSavedState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      iconsVisible = saved === 'true';
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, iconsVisible.toString());
  }

  function setupEventListeners() {
    const toggleBtn = document.getElementById('toggle-icons-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleIcons);
      updateButtonState();
    }
  }

  function toggleIcons() {
    iconsVisible = !iconsVisible;
    saveState();
    applyCurrentState();
    updateButtonState();
    document.dispatchEvent(new CustomEvent('iconsToggled', { detail: { visible: iconsVisible } }));
  }

  function applyCurrentState() {
    const cards = document.querySelectorAll('.tool-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        if (iconsVisible) {
          card.classList.remove('icon-hidden');
        } else {
          card.classList.add('icon-hidden');
        }
      }, index * 20);
    });
  }

  function updateButtonState() {
    const toggleBtn = document.getElementById('toggle-icons-btn');
    if (!toggleBtn) return;
    if (iconsVisible) {
      toggleBtn.innerHTML = '<i class="fas fa-eye text-sm mr-2"></i> Ocultar Ícones';
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.setAttribute('aria-label', 'Ocultar ícones dos cards');
    } else {
      toggleBtn.innerHTML = '<i class="fas fa-eye-slash text-sm mr-2"></i> Mostrar Ícones';
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.setAttribute('aria-label', 'Mostrar ícones dos cards');
    }
    toggleBtn.classList.toggle('active', !iconsVisible);
  }

  function isVisible() {
    return iconsVisible;
  }

  function setVisible(visible) {
    if (iconsVisible !== visible) {
      toggleIcons();
    }
  }

  return {
    init,
    toggle: toggleIcons,
    setVisible,
    isVisible
  };
})();

/**
 * ============================================
 * MÓDULO DE VISUALIZAÇÃO (ViewModeManager)
 * Alterna entre visualização grid e lista
 * ============================================
 */
const ViewModeManager = (function() {
  let currentViewMode = 'grid';
  const STORAGE_KEY = 'viewMode';
  const validModes = ['grid', 'list'];

  function init() {
    loadSavedState();
    setupEventListeners();
    applyCurrentState();
  }

  function loadSavedState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && validModes.includes(saved)) {
      currentViewMode = saved;
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, currentViewMode);
  }

  function setupEventListeners() {
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const mode = this.dataset.view;
        if (mode && validModes.includes(mode)) {
          setViewMode(mode);
        }
      });
    });
    updateViewButtons();
  }

  function setViewMode(mode) {
    if (mode === currentViewMode) return;
    currentViewMode = mode;
    saveState();
    applyCurrentState();
    updateViewButtons();
    document.dispatchEvent(new CustomEvent('viewModeChanged', { detail: { mode: currentViewMode } }));
  }

  function applyCurrentState() {
    const containers = document.querySelectorAll('[data-view-container]');
    containers.forEach(container => {
      validModes.forEach(mode => {
        container.classList.remove(`view-${mode}`);
      });
      container.classList.add(`view-${currentViewMode}`);
    });
  }

  function updateViewButtons() {
    document.querySelectorAll('[data-view]').forEach(btn => {
      const isActive = btn.dataset.view === currentViewMode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
  }

  function getViewMode() {
    return currentViewMode;
  }

  return {
    init,
    setViewMode,
    getViewMode
  };
})();

// Exportar Utils globalmente
window.Utils = Utils;