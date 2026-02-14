/**
 * Módulo de Controle de Acessibilidade (AccessControl)
 * Gerencia todas as funcionalidades de acessibilidade do site
 * Versão completa com suporte a daltonismo, TTS, glossário, atalhos de teclado e mais
 */

window.AccessControl = window.AccessControl || (function() {
    'use strict';

    // ===========================================
    // ESTADO DO MÓDULO
    // ===========================================
    const state = {
        fontSize: 0,
        fontStyle: 0,
        letterSpacing: 0,
        lineHeight: 0,
        readingMask: 0,
        readingGuide: 0,
        contrast: 0,
        colorblind: 0,
        saturation: 0,
        bigCursor: 0,
        ttsSpeed: 0,
        ttsActive: false,
        stopSounds: false,
        magnifierActive: false,
        theme: 'system',
        _initialized: false
    };

    // Variável de controle para o intervalo do VLibras
    let vlInterval = null;

    // Elementos cacheados
    let elements = {};

    // Handlers de eventos
    let mouseMoveHandler = null;
    let readingGuideHandler = null;
    let magnifierHandler = null;
    let magnifierMoveHandler = null;
    let ttsClickHandler = null;

    // Dados do glossário
    let glossaryData = [];

    // ===========================================
    // UTILITÁRIOS
    // ===========================================

    // --- CÓDIGO EXISTENTE OMITIDO (Mantenha o conteúdo original aqui) ---
    // (Apenas a função init foi alterada abaixo)

    /**
     * Gerenciador de Tema (Dark Mode)
     */
    const ThemeManager = {
        init() {
            // Verifica preferência salva
            const savedTheme = localStorage.getItem('theme') || 'system';
            this.setTheme(savedTheme);

            // Listener para mudança no sistema
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (state.theme === 'system') {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        },

        setTheme(theme) {
            state.theme = theme;
            localStorage.setItem('theme', theme);
            
            if (theme === 'system') {
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.applyTheme(systemDark ? 'dark' : 'light');
            } else {
                this.applyTheme(theme);
            }
            
            // Atualiza botões da UI se existirem
            this.updateUI();
        },

        applyTheme(mode) {
            if (mode === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },

        updateUI() {
            const btns = document.querySelectorAll('[data-theme-btn]');
            btns.forEach(btn => {
                const theme = btn.dataset.themeBtn;
                if (theme === state.theme) {
                    btn.classList.add('ring-2', 'ring-nurse-primary');
                } else {
                    btn.classList.remove('ring-2', 'ring-nurse-primary');
                }
            });
        }
    };
    
    function ensureElements() {
        return true; // Simplificado para este snippet
    }

    function setupEvents() {
        // Implementação dos eventos
    }

    function setupDrag() {
        // Implementação do drag
    }

    function loadGlossary() {
        // Implementação do glossário
    }

    function setupTermLinks() {
        // Implementação dos links
    }

    // ===========================================
    // INICIALIZAÇÃO (Comportamento Opt-In)
    // ===========================================
    function init() {
        if (state._initialized) return;

        ThemeManager.init();

        if (ensureElements()) {
            setupEvents();
            setupDrag();
            // REMOVIDO: loadSavedState() - não restaura automaticamente
            // Regra opt-in: recursos só são aplicados após interação explícita
            loadGlossary();
            setupTermLinks();

            // Correção do ReferenceError: Verifica se vlInterval foi definido
            // e limpa após 15 segundos (timeout de carregamento do widget)
            if (typeof vlInterval !== 'undefined' && vlInterval !== null) {
                 setTimeout(() => clearInterval(vlInterval), 15000);
            }
        }

        state._initialized = true;
    }

    // ===========================================
    // API PÚBLICA
    // ===========================================
    return {
        init,
        ThemeManager,
        state
    };

})();

// ===========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ===========================================
function tryInit() {
    const panel = document.getElementById('accessibility-panel');
    if (panel) {
        window.AccessControl.init();
    } else {
        setTimeout(tryInit, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
} else {
    tryInit();
}