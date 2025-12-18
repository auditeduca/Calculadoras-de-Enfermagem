/**
 * MODALS.JS - JavaScript para Modais e Funcionalidades de Compatibilidade
 * Calculadoras de Enfermagem - Arquitetura Modular
 * 
 * Responsabilidades:
 * - Gerenciamento de modais de acessibilidade
 * - Funções globais de compatibilidade
 * - Sistema de debugging
 * - Funções de espera por componentes
 * - Inicialização de funcionalidades auxiliares
 */

class ModalsManager {
    constructor() {
        this.modals = new Map();
        this.isInitialized = false;
        this.init();
    }

    init() {
        this.setupModals();
        this.bindEvents();
        this.isInitialized = true;
        console.log('✅ ModalsManager inicializado');
    }

    setupModals() {
        // Configurar todos os modais disponíveis
        const modalConfigs = {
            'accessibility-menu': {
                trigger: '.accessibility-menu-trigger',
                close: '.accessibility-menu-close',
                overlay: '.accessibility-menu'
            },
            'cookie-prefs-modal': {
                trigger: '.cookie-btn-tertiary',
                close: '.modal-close',
                overlay: '.modal'
            },
            'suggestion-modal': {
                trigger: '.suggestion-btn',
                close: '.modal-close',
                overlay: '.modal'
            }
        };

        Object.entries(modalConfigs).forEach(([modalId, config]) => {
            const modal = document.getElementById(modalId);
            if (modal) {
                this.modals.set(modalId, {
                    element: modal,
                    config: config,
                    isOpen: false
                });
            }
        });
    }

    bindEvents() {
        // Event delegation para modais
        document.addEventListener('click', (e) => {
            // Abrir modal de acessibilidade
            if (e.target.matches('.accessibility-menu-trigger') || 
                e.target.closest('.accessibility-menu-trigger')) {
                e.preventDefault();
                this.openModal('accessibility-menu');
            }

            // Fechar modais
            if (e.target.matches('.accessibility-menu-close') ||
                e.target.matches('.modal-close') ||
                e.target.matches('.modal-backdrop')) {
                this.closeAllModals();
            }

            // Abrir modal de cookies
            if (e.target.matches('.cookie-btn-tertiary') ||
                e.target.closest('.cookie-btn-tertiary')) {
                e.preventDefault();
                this.openModal('cookie-prefs-modal');
            }

            // Abrir modal de sugestão
            if (e.target.matches('.suggestion-btn') ||
                e.target.closest('.suggestion-btn')) {
                e.preventDefault();
                this.openModal('suggestion-modal');
            }
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    openModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal && !modal.isOpen) {
            modal.element.classList.add('modal-open');
            modal.isOpen = true;
            modal.element.setAttribute('aria-hidden', 'false');
            
            // Focar no primeiro elemento focável
            const focusable = modal.element.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                focusable.focus();
            }
            
            console.log(`📱 Modal ${modalId} aberto`);
        }
    }

    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal && modal.isOpen) {
            modal.element.classList.remove('modal-open');
            modal.isOpen = false;
            modal.element.setAttribute('aria-hidden', 'true');
            console.log(`📱 Modal ${modalId} fechado`);
        }
    }

    closeAllModals() {
        this.modals.forEach((modal, modalId) => {
            if (modal.isOpen) {
                this.closeModal(modalId);
            }
        });
    }
}

// =================================================================================
// FUNÇÕES GLOBAIS DE COMPATIBILIDADE (MOVIDAS DO INDEX.JS)
// =================================================================================

// Função para re-inicializar componentes (chamada após carregamento de conteúdo)
window.reinitializeComponents = function() {
    // Re-inicializar event listeners específicos da página
    console.log('Re-inicializando componentes da página...');
};

// Função para carregar página via JavaScript
window.loadPage = function(pageName, options = {}) {
    const path = options.path || `/${pageName}`;
    if (window.app) {
        window.app.navigate(path);
    }
};

// Função para obter componente
window.getComponent = function(name) {
    return window.app ? window.app.getComponent(name) : null;
};

// Template Engine convenience functions
window.loadPageByName = function(pageName, options = {}) {
    if (window.app) {
        window.app.loadPageByName(pageName, options);
    }
};

window.renderToElement = function(elementId, templateName, data = {}) {
    if (window.app) {
        window.app.renderToElement(elementId, templateName, data);
    }
};

window.registerAppTemplate = function(name, template) {
    if (window.app) {
        window.app.registerAppTemplate(name, template);
    }
};

window.registerAppPartial = function(name, partial) {
    if (window.app) {
        window.app.registerAppPartial(name, partial);
    }
};

// Wait for template engine to be ready
window.whenTemplateEngineReady = function(callback) {
    if (window.templateEngine) {
        callback(window.templateEngine);
    } else {
        // Wait for template engine to load
        const checkEngine = setInterval(() => {
            if (window.templateEngine) {
                clearInterval(checkEngine);
                callback(window.templateEngine);
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkEngine);
            console.warn('Template Engine não carregou em 5 segundos');
        }, 5000);
    }
};

// Safety check for Utils availability
window.waitForUtils = function(callback) {
    if (window.Utils) {
        callback();
    } else {
        const checkUtils = setInterval(() => {
            if (window.Utils) {
                clearInterval(checkUtils);
                callback();
            }
        }, 50);
        
        // Timeout after 3 seconds
        setTimeout(() => {
            clearInterval(checkUtils);
            console.warn('Utils não carregou em 3 segundos');
        }, 3000);
    }
};

// =================================================================================
// SISTEMA DE DEBUGGING AVANÇADO (MOVIDO DO INDEX.JS)
// =================================================================================

window.debugApp = function() {
    console.log('=== Application Debug Info ===');
    console.log('Initialized:', window.app ? window.app.isInitialized : false);
    console.log('Current Route:', window.app ? window.app.currentRoute : null);
    console.log('Components:', window.app ? window.app.components : {});
    console.log('Routes:', window.app ? Array.from(window.app.routes.keys()) : []);
    console.log('Utils Available:', !!window.Utils);
    console.log('TemplateEngine Available:', !!window.templateEngine);
    console.log('ModalsManager Available:', !!window.modalsManager);
    console.log('DOM Elements:');
    console.log('  - header-container:', !!document.getElementById('header-container'));
    console.log('  - footer-container:', !!document.getElementById('footer-container'));
    console.log('  - modals-container:', !!document.getElementById('modals-container'));
    console.log('  - main-content:', !!document.getElementById('main-content'));
    console.log('  - accessibility-menu:', !!document.getElementById('accessibility-menu'));
    console.log('  - cookie-prefs-modal:', !!document.getElementById('cookie-prefs-modal'));
    console.log('  - suggestion-modal:', !!document.getElementById('suggestion-modal'));
};

// Função de debugging específica para modais
window.debugModals = function() {
    if (window.modalsManager) {
        console.log('=== Modals Debug Info ===');
        window.modalsManager.modals.forEach((modal, modalId) => {
            console.log(`Modal ${modalId}:`, {
                isOpen: modal.isOpen,
                hasConfig: !!modal.config,
                elementExists: !!modal.element
            });
        });
    } else {
        console.warn('ModalsManager não disponível');
    }
};

// =================================================================================
// INICIALIZAÇÃO
// =================================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar ModalsManager
    window.modalsManager = new ModalsManager();
    
    console.log('🚀 Sistema de modais carregado');
    console.log('💡 Use debugModals() para informações de debug dos modais');
    console.log('💡 Use debugApp() para informações gerais da aplicação');
});

// Export para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalsManager };
}