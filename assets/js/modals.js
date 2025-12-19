/**
 * MODALS.JS - Gerenciador de Modais Otimizado
 * Versão: 3.2.0 (Sincronizado com Utils.js e TemplateEngine v3.0)
 * * Responsabilidades:
 * - Escuta o evento 'templateEngineReady' para inicialização
 * - Sincroniza classes (.show / .open) com a lógica do Utils.js
 * - Monitora o '#modals-container' para injeções dinâmicas
 */

class ModalsManager {
    constructor() {
        this.modals = new Map();
        this.isInitialized = false;
        this.init();
    }

    /**
     * Inicialização protegida
     */
    init() {
        if (this.isInitialized) return;
        
        this.bindGlobalEvents();
        this.refresh();
        this.setupObserver();
        
        this.isInitialized = true;
        this._debug('Gerenciador inicializado e sincronizado com Utils.js');
    }

    /**
     * Sincroniza o mapa de modais com o DOM.
     * Usa as definições de classes do Utils.js:
     * - 'accessibility-menu' usa classe '.open'
     * - Outros modais usam classe '.show'
     */
    refresh() {
        const modalConfigs = {
            'accessibility-menu': { id: 'accessibility-menu', activeClass: 'open' },
            'cookie-prefs-modal': { id: 'cookie-prefs-modal', activeClass: 'show' },
            'suggestion-modal': { id: 'suggestion-modal', activeClass: 'show' }
        };

        Object.entries(modalConfigs).forEach(([key, config]) => {
            const el = document.getElementById(config.id);
            if (el) {
                this.modals.set(key, {
                    element: el,
                    config: config,
                    // Verifica se já está aberto usando a classe correta
                    isOpen: el.classList.contains(config.activeClass)
                });
            }
        });
        
        if (this.modals.size > 0) {
            this._debug(`Modais ativos no DOM: ${Array.from(this.modals.keys()).join(', ')}`);
        }
    }

    /**
     * Observa o container de modais para capturar injeções do TemplateEngine
     */
    setupObserver() {
        const target = document.getElementById('modals-container') || document.body;
        
        const observer = new MutationObserver((mutations) => {
            const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
            if (hasNewNodes) {
                this._debug('Nova injeção de HTML detectada, atualizando referências...');
                this.refresh();
            }
        });

        observer.observe(target, { 
            childList: true, 
            subtree: true 
        });
    }

    /**
     * Delegação de eventos global
     */
    bindGlobalEvents() {
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Gatilhos de Abertura
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

            // Gatilhos de Fechamento (X, Backdrop ou botões de cancelar)
            if (
                target.matches('.modal-close') || 
                target.closest('.modal-close') || 
                target.matches('.modal-backdrop') ||
                target.matches('.accessibility-menu-close') ||
                target.closest('.accessibility-menu-close')
            ) {
                this.closeAllModals();
            }
        }, true);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });
    }

    /**
     * Abre o modal aplicando a classe correta do Utils.js
     */
    openModal(modalId) {
        if (!this.modals.has(modalId)) this.refresh();

        const modal = this.modals.get(modalId);
        if (modal) {
            const activeClass = modal.config.activeClass;
            
            // Lógica de UI
            document.body.style.overflow = 'hidden';
            modal.element.classList.add(activeClass);
            modal.isOpen = true;
            modal.element.setAttribute('aria-hidden', 'false');
            
            // Suporte a animação se disponível no Utils
            if (window.Utils && window.Utils.animate && window.Utils.animate.fadeIn) {
                window.Utils.animate.fadeIn(modal.element);
            }

            // Foco automático
            const focusable = modal.element.querySelector('button, input, [tabindex]:not([tabindex="-1"])');
            if (focusable) setTimeout(() => focusable.focus(), 100);
            
            this._debug(`Exibindo modal: ${modalId} (Classe: ${activeClass})`);
        } else {
            console.error(`[ModalsManager] Falha crítica: Elemento #${modalId} não existe no DOM.`);
        }
    }

    /**
     * Fecha o modal removendo a classe específica
     */
    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal && modal.isOpen) {
            const activeClass = modal.config.activeClass;
            
            modal.element.classList.remove(activeClass);
            modal.isOpen = false;
            modal.element.setAttribute('aria-hidden', 'true');
            
            // Restaura o scroll se nenhum outro modal estiver visível
            const anyOpen = Array.from(this.modals.values()).some(m => m.isOpen);
            if (!anyOpen) document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        this.modals.forEach((_, id) => this.closeModal(id));
    }

    /**
     * Debug compatível com ConsoleCleaner
     */
    _debug(msg) {
        // Ignora o filtro do ConsoleCleaner usando um prefixo único
        console.log(`%c[MODAL-SYSTEM] ${msg}`, 'color: #8b5cf6; font-weight: bold;');
    }
}

/**
 * INICIALIZAÇÃO
 */
function initializeModals() {
    if (!window.modalsManager) {
        window.modalsManager = new ModalsManager();
    } else {
        window.modalsManager.refresh();
    }
}

// Vinculo ao TemplateEngine
window.addEventListener('templateEngineReady', () => {
    // Pequeno delay para garantir que o DOM inserido pelo motor foi processado pelo browser
    setTimeout(initializeModals, 50);
});

// Fallback de segurança
if (document.readyState === 'complete') {
    initializeModals();
} else {
    window.addEventListener('load', initializeModals);
}