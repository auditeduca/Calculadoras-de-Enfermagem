/**
 * UTILS.JS - Atualizado com Helper de Inicialização e renderCard
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

    safeInjectText: function(elementId, text) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = text;
    },

    /**
     * Executa callback quando o DOM estiver pronto.
     */
    onReady: function(callback) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(callback, 1);
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    },

    /**
     * Renderização padrão de cards para garantir consistência
     */
    renderCard: function(tool, state = {}) {
        const viewMode = state.viewMode || 'grid';
        // Mapeamento simples de cores para classes Tailwind
        const colorMap = {
            'emerald': 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600',
            'blue': 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
            'purple': 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
            'amber': 'from-amber-50 to-amber-100 border-amber-200 text-amber-600'
        };
        const themeClass = colorMap[tool.color] || colorMap['blue'];
        const iconColor = themeClass.split(' ').pop(); // Pega a última classe (text-color)

        if (viewMode === 'list') {
            return `
                <div class="group p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 hover:border-nurse-primary/30">
                    <div class="flex items-start gap-4">
                        <div class="text-2xl ${iconColor} group-hover:scale-110 transition-transform"><i class="${tool.icon}"></i></div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900 group-hover:text-nurse-primary transition-colors">${tool.name}</h3>
                            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">${tool.category}</p>
                            <p class="text-sm text-gray-600 mt-2 line-clamp-2">${tool.description}</p>
                        </div>
                        <a href="${tool.filename}" class="self-center px-4 py-2 bg-nurse-primary text-white text-sm font-medium rounded-lg hover:bg-nurse-primary-light transition-colors shadow-sm">
                            Acessar
                        </a>
                    </div>
                </div>
            `;
        }

        // Modo Grid (Padrão)
        return `
            <div class="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full hover:border-nurse-primary/30">
                <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <i class="${tool.icon} text-6xl text-nurse-primary"></i>
                </div>
                
                <div class="mb-4">
                    <div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl ${iconColor} group-hover:scale-110 transition-transform duration-300 shadow-sm border border-gray-100">
                        <i class="${tool.icon}"></i>
                    </div>
                </div>

                <div class="flex-1">
                    <div class="mb-2">
                        <span class="text-[10px] font-bold tracking-wider text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded-full">${tool.category}</span>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-nurse-primary transition-colors line-clamp-1" title="${tool.name}">
                        ${tool.name}
                    </h3>
                    <p class="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                        ${tool.description}
                    </p>
                </div>

                <div class="pt-4 border-t border-gray-100 mt-auto">
                    <a href="${tool.filename}" class="block w-full text-center py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-lg hover:bg-nurse-primary hover:text-white transition-all duration-300 text-sm">
                        Acessar Ferramenta
                    </a>
                </div>
            </div>
        `;
    },

    error: {
        handle: function(error, context = 'Unknown') {
            console.error(`Error in ${context}:`, error);
        }
    }
};

// Exportação universal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
}