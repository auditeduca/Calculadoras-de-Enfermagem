/**
 * UTILS.JS - Versão Final Ajustada
 * Este arquivo gera o HTML que o seu global-main-index.css estiliza.
 */

const Utils = {
    escapeHTML: function(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    },

    onReady: function(callback) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(callback, 1);
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    },

    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * Renderização de cards usando as classes do seu global-main-index.css
     */
    renderCard: function(tool, state = {}) {
        const viewMode = (typeof state === 'string') ? state : (state.viewMode || 'grid');
        const colorClass = `color-${tool.color || 'blue'}`;

        if (viewMode === 'list') {
            return `
                <div class="tool-card tool-card-list ${colorClass}">
                    <div class="card-content-wrapper flex items-start gap-4 p-4">
                        <div class="card-icon-wrapper">
                            <i class="${tool.icon}"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="card-title font-semibold text-gray-900">${tool.name}</h3>
                            <p class="card-category text-[10px] font-bold uppercase tracking-wider text-gray-500">${tool.category}</p>
                            <p class="card-description line-clamp-2 text-sm text-gray-600 mt-1">${tool.description}</p>
                        </div>
                        <div class="card-action-wrapper self-center">
                            <a href="${tool.filename}" class="btn-access px-4 py-2 bg-nurse-primary text-white text-sm font-medium rounded-lg hover:bg-nurse-primary-light transition-colors shadow-sm">
                                Acessar
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // Modo Grid (Padrão) - Estrutura exata para o global-main-index.css
        return `
            <div class="tool-card ${colorClass}">
                <div class="card-body p-6 flex flex-col h-full relative">
                    <div class="card-icon-bg absolute top-0 right-0 p-4 opacity-5">
                        <i class="${tool.icon} text-6xl"></i>
                    </div>
                    
                    <div class="card-icon-wrapper">
                        <i class="${tool.icon}"></i>
                    </div>

                    <div class="card-info flex-1">
                        <div class="mb-2">
                            <span class="card-badge text-[10px] font-bold tracking-wider uppercase bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                                ${tool.category}
                            </span>
                        </div>
                        <h3 class="card-title text-lg font-bold text-gray-900 mb-2" title="${tool.name}">
                            ${tool.name}
                        </h3>
                        <p class="card-description line-clamp-3 text-sm text-gray-600 leading-relaxed mb-4">
                            ${tool.description}
                        </p>
                    </div>

                    <div class="card-footer pt-4 border-t border-gray-100 mt-auto">
                        <a href="${tool.filename}" class="btn-card-action block w-full text-center py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-lg hover:bg-nurse-primary hover:text-white transition-all duration-300 text-sm">
                            Acessar Ferramenta
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
};

window.Utils = Utils;