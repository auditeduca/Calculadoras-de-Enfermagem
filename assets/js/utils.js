/**
 * UTILS.JS - Atualizado com Helper de Inicialização
 */

const Utils = {
    // ... (Mantenha suas funções de escapeHTML e safeInjectText aqui) ...
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

    // --- NOVO HELPER DE INICIALIZAÇÃO ---
    /**
     * Executa callback quando o DOM estiver pronto, lidando com estados assíncronos.
     */
    onReady: function(callback) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(callback, 1);
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
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
    w