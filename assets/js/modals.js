/**
 * MODALS.JS - Gerenciador de Modais Otimizado
 * Versão: 3.1.0 (Compatível com TemplateEngine v3.0)
 * * Responsabilidades:
 * - Escuta o evento 'templateEngineReady' para inicialização
 * - Monitora o '#modals-container' para injeções dinâmicas via MutationObserver
 * - Gerencia estados de abertura/fecho e acessibilidade (Aria e Focus)
 */

class ModalsManager {
    constructor() {
        this.modals = new Map();
        this.isInitialized = false;
        this.init();
    }

    /**
     * Inicialização segura: evita múltiplas instâncias e prepara eventos globais
     */
    init() {
        if (this.isInitialized) return;
        
        this.bindGlobalEvents();
        this.refresh();
        this.setupObserver();
        
        this.isInitialized = true;
        this._debug('Sistema de modais integrado e pronto.');
    }

    /**
     * Sincroniza o estado interno com o que existe no DOM atualmente.
     * Mapeia os IDs dos modais configurados.
     */
    refresh() {
        const modalConfigs = {
            'accessibility-menu': { id: 'accessibility-menu' },
            'cookie-prefs-modal': { id: 'cookie-prefs-modal' },
            'suggestion-modal': { id: 'suggestion-modal' }
        };

        Object.entries(modalConfigs).forEach(([key, config]) => {
            const el = document.getElementById(config.id);
            if (el) {
                this.modals.set(key, {
                    element: el,
                    config: config,
                    isOpen: el.classList.contains('modal-open')
                });
            }
        });
        
        if (this.modals.size > 0) {
            this._debug(`Modais vinculados: ${Array.from(this.modals.keys()).join(', ')}`);
        }
    }

    /**
     * Observa mudanças no DOM para capturar modais injetados dinamicamente
     * pelo TemplateEngine após o carregamento inicial.
     */
    setupObserver() {
        const target = document.getElementById('modals-container') || document.body;
        
        const observer = new MutationObserver((mutations) => {
            let shouldRefresh = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    shouldRefresh = true;
                    break;
                }
            }
            if (shouldRefresh) this.refresh();
        });

        observer.observe(target, { childCode: true, subtree: true, childList: true });
    }

    /**
     * Configura ouvintes de eventos globais (cliques e teclado)
     */
    bindGlobalEvents() {
        // Event Delegation: Captura cliques em gatilhos e botões de fechar
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Gatilhos de Abertura (suporta cliques em ícones internos via closest)
            if (target.closest('.accessibility-menu-trigger')) {
                e.preventDefault();
                this.openModal('accessibility-menu');
            }
            
            if (target.closest('.cookie-btn-tertiary')) {
                e.preventDefault();
                this.openModal('cookie-prefs-modal');
            }

            if (target.closest('.suggestion-btn')) {
                e.preventDefault();
                this.openModal('suggestion-modal');
            }

            // Gatilhos de Fecho (Backdrop, X, ou botão cancelar)
            if (
                target.matches('.modal-close') || 
                target.closest('.modal-close') || 
                target.matches('.modal-backdrop') ||
                target.matches('.accessibility-menu-close')
            ) {
                this.closeAllModals();
            }
        }, true);

        // Tecla ESC para fechar modais abertos
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });
    }

    /**
     * Abre um modal específico pelo ID interno
     */
    openModal(modalId) {
        // Se o modal não estiver mapeado, tenta um refresh rápido
        if (!this.modals.has(modalId)) this.refresh();

        const modal = this.modals.get(modalId);
        if (modal) {
            // Trava o scroll do fundo
            document.body.style.overflow = 'hidden';
            
            modal.element.classList.add('modal-open');
            modal.isOpen = true;
            modal.element.setAttribute('aria-hidden', 'false');
            
            // Foco inicial para acessibilidade
            const focusable = modal.element.querySelector('input, button, select, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                setTimeout(() => focusable.focus(), 50);
            }
            
            this._debug(`Modal "${modalId}" aberto.`);
        } else {
            console.warn(`[ModalsManager] Modal "${modalId}" não encontrado no DOM.`);
        }
    }

    /**
     * Fecha um modal específico
     */
    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal && modal.isOpen) {
            modal.element.classList.remove('modal-open');
            modal.isOpen = false;
            modal.element.setAttribute('aria-hidden', 'true');
            
            // Verifica se ainda existem outros modais abertos para restaurar o scroll
            const anyOpen = Array.from(this.modals.values()).some(m => m.isOpen);
            if (!anyOpen) {
                document.body.style.overflow = '';
            }
        }
    }

    /**
     * Fecha todos os modais ativos
     */
    closeAllModals() {
        this.modals.forEach((_, id) => this.closeModal(id));
    }

    /**
     * Helper de log integrado ao debug do TemplateEngine
     */
    _debug(msg) {
        const isDebug = window.TemplateEngine && window.TemplateEngine.config && window.TemplateEngine.config.debug;
        if (isDebug || true) { // 'true' forçado para desenvolvimento inicial
            console.log(`%c[ModalsManager] ${msg}`, 'color: #3b82f6; font-weight: bold;');
        }
    }
}

/**
 * PONTO DE ENTRADA INTEGRADO
 */
function initializeModals() {
    if (!window.modalsManager) {
        window.modalsManager = new ModalsManager();
    } else {
        window.modalsManager.refresh();
    }
}

// Escuta o evento disparado pelo seu TemplateEngine.js
window.addEventListener('templateEngineReady', initializeModals);

// Fallback caso o script seja carregado após o evento ou em páginas estáticas
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeModals();
} else {
    window.addEventListener('DOMContentLoaded', initializeModals);
}