/**
 * ============================================
 * UTILS.JS - Calculadoras de Enfermagem
 * 
 * Funcionalidades:
 * - Renderização de cards com diferenciação por tipo
 * - Sistema de classificação e ordenação
 * - Controle de visualização de ícones
 * - Alternância entre modos de visualização
 * ============================================
 */

const Utils = {
    /**
     * Renderiza um card de ferramenta com estrutura completa
     * @param {Object} item - Dados da ferramenta
     * @param {Object} options - Opções de configuração
     * @param {string} type - Tipo de ferramenta (calculator, scale, other)
     * @returns {string} HTML do card
     */
    renderCard: function(item, options = {}, type = 'calculator') {
        const isHighlighted = this.isHighlighted(item, options);
        const highlightClass = isHighlighted ? 'highlighted' : '';
        const iconHiddenClass = options.hideIcons ? 'icon-hidden' : '';
        
        // Cores por tipo de ferramenta
        const typeColors = {
            calculator: { border: 'blue', bg: 'rgba(59, 130, 246, 0.1)', icon: '#3b82f6' },
            scale: { border: 'emerald', bg: 'rgba(16, 185, 129, 0.1)', icon: '#10b981' },
            other: { border: 'amber', bg: 'rgba(245, 158, 11, 0.1)', icon: '#f59e0b' }
        };
        
        const colors = typeColors[type] || typeColors.calculator;
        const actionText = this.getActionButtonText(type);
        const categoryTags = this.generateCategoryTags(item, type, colors);
        
        return `
            <article class="tool-card ${highlightClass} ${iconHiddenClass}" 
                     data-type="${type}" 
                     data-id="${item.id}"
                     tabindex="0"
                     role="article"
                     aria-label="Ferramenta: ${this.escapeHtml(item.name)}">
                <a href="pages/${item.filename}" 
                   class="card-link" 
                   aria-label="Acessar ${this.escapeHtml(item.name)}"></a>
                <div class="card-header">
                    <div class="card-icon-container" style="background-color: ${colors.bg}">
                        <i class="${item.icon} card-icon" style="color: ${colors.icon}" aria-hidden="true"></i>
                    </div>
                    ${categoryTags}
                </div>
                <div class="card-body">
                    <h3 class="tool-title">${this.escapeHtml(item.name)}</h3>
                    <p class="tool-description">${this.escapeHtml(item.description)}</p>
                </div>
                <div class="card-footer">
                    <span class="access-indicator" aria-hidden="true">
                        ${actionText}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </span>
                </div>
            </article>
        `;
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
        
        return `
            <span class="category-badge" 
                  style="background-color: ${colorSet.bg}; color: ${colorSet.text}">
                ${this.escapeHtml(item.category)}
            </span>
        `;
    },

    /**
     * Verifica se o card deve ser destacado
     */
    isHighlighted: function(item, options) {
        return options && options.filterCategory && 
               options.filterCategory !== 'all' && 
               item.category === options.filterCategory;
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
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search text-gray-400 text-5xl mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Nenhuma ferramenta encontrada</h3>
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
    let sortOptions = ['az', 'za', 'category'];
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
                case 'category':
                    const catCompare = a.category.localeCompare(b.category);
                    if (catCompare !== 0) return catCompare;
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
            toggleBtn.innerHTML = '<i class="fas fa-eye" aria-hidden="true"></i>';
            toggleBtn.setAttribute('aria-pressed', 'false');
            toggleBtn.setAttribute('aria-label', 'Ocultar ícones dos cards');
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash" aria-hidden="true"></i>';
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
