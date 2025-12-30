/**
 * UTILS.JS
 * Funções Utilitárias Compartilhadas
 * Versão: 1.0 - Criado para Sistema Modular
 * 
 * Funcionalidades:
 * - Funções de renderização de cards
 * - Utilitários de DOM
 * - Debounce e Throttle
 * - Helpers de eventos
 */

const Utils = {
    /**
     * Renderiza um card de ferramenta/escala
     * @param {Object} tool - Dados da ferramenta
     * @param {Object} state - Estado atual da aplicação
     * @param {string} typeFilter - Tipo de filtro ('calculator', 'scale', 'other')
     * @returns {string} HTML do card
     */
    /**
     * Renderiza um card de ferramenta/escala
     * @param {Object} tool - Dados da ferramenta
     * @param {Object} state - Estado atual da aplicação
     * @param {string} typeFilter - Tipo de filtro ('calculator', 'scale', 'other')
     * @returns {string} HTML do card
     */
    renderCard(tool, state, typeFilter) {
        const isHighlighted = this.isHighlighted(tool, state);
        const highlightClass = isHighlighted ? 'highlighted' : '';
        const categoryLower = tool.category.toLowerCase().replace(/\s+/g, '-');

        // Determinar o texto do botão baseado no tipo
        const actionButtonText = this.getActionButtonText(typeFilter);

        // Gerar tags de categoria
        const categoryTags = this.generateCategoryTags(tool, typeFilter);

        return `
            <article class="tool-card color-${tool.color} ${highlightClass}" data-category="${categoryLower}" data-id="${tool.id}">
                <div class="card-icon-wrapper">
                    <i class="${tool.icon}"></i>
                </div>
                <h3>${this.escapeHtml(tool.name)}</h3>
                <span class="category">${this.escapeHtml(tool.category)}</span>
                <p class="description">${this.escapeHtml(tool.description)}</p>
                ${categoryTags}
                <div class="card-footer">
                    <a href="pages/${tool.filename}" class="btn btn-primary" aria-label="${actionButtonText} ${this.escapeHtml(tool.name)}">
                        <i class="fas fa-arrow-right mr-2"></i>${actionButtonText}
                    </a>
                </div>
            </article>
        `;
    },

    /**
     * Retorna o texto do botão de ação baseado no tipo de ferramenta
     * @param {string} typeFilter - Tipo de ferramenta
     * @returns {string} Texto do botão
     */
    getActionButtonText(typeFilter) {
        const actionTexts = {
            'calculator': 'Calcular',
            'scale': 'Classificar',
            'other': 'Consultar'
        };
        return actionTexts[typeFilter] || 'Acessar';
    },

    /**
     * Gera as tags de categoria para o card
     * @param {Object} tool - Dados da ferramenta
     * @param {string} typeFilter - Tipo de ferramenta
     * @returns {string} HTML das tags
     */
    generateCategoryTags(tool, typeFilter) {
        const typeLabels = {
            'calculator': 'Calculadora',
            'scale': 'Escala',
            'other': 'Informação'
        };

        const typeColor = {
            'calculator': 'blue',
            'scale': 'emerald',
            'other': 'amber'
        };

        return `
            <div class="card-tags">
                <span class="card-tag type-tag" data-type="${typeFilter}">${typeLabels[typeFilter] || 'Ferramenta'}</span>
                <span class="card-tag category-tag" data-category="${this.escapeHtml(tool.category)}">${this.escapeHtml(tool.category)}</span>
            </div>
        `;
    },

    /**
     * Verifica se uma ferramenta deve ser destacada
     * @param {Object} tool - Dados da ferramenta
     * @param {Object} state - Estado atual
     * @returns {boolean}
     */
    isHighlighted(tool, state) {
        // Lógica para destacar ferramentas baseado no estado
        if (!state || !state.filterCategory || state.filterCategory === 'all') {
            return false;
        }
        return tool.category === state.filterCategory;
    },

    /**
     * Debounce - Atraso na execução de funções
     * @param {Function} func - Função a ser executada
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle - Limita frequência de execução
     * @param {Function} func - Função a ser executada
     * @param {number} limit - Tempo limite entre execuções
     * @returns {Function}
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Executa função quando o DOM estiver pronto
     * @param {Function} callback - Função a ser executada
     */
    onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    },

    /**
     * Cria um elemento com atributos e conteúdo
     * @param {string} tag - Tag do elemento
     * @param {Object} attributes - Atributos do elemento
     * @param {string|HTMLElement} content - Conteúdo do elemento
     * @returns {HTMLElement}
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        // Adiciona atributos
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });

        // Adiciona conteúdo
        if (content instanceof HTMLElement) {
            element.appendChild(content);
        } else if (content) {
            element.innerHTML = content;
        }

        return element;
    },

    /**
     *escapar HTML para evitar XSS
     * @param {string} text - Texto a ser escapado
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Formatar data para display
     * @param {Date|string} date - Data
     * @returns {string}
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    /**
     * Obter parâmetros da URL
     * @param {string} name - Nome do parâmetro
     * @returns {string|null}
     */
    getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    /**
     * Scroll suave para elemento
     * @param {string|HTMLElement} target - Elemento alvo
     * @param {number} offset - Offset em pixels
     */
    scrollTo(target, offset = 0) {
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
     * Copiar texto para clipboard
     * @param {string} text - Texto a ser copiado
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            return false;
        }
    },

    /**
     * Verificar se elemento está visível na viewport
     * @param {HTMLElement} element - Elemento a verificar
     * @returns {boolean}
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Expor Utils globalmente
window.Utils = Utils;
