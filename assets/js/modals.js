/**
 * MODALS-MANAGER.JS - Gerenciamento Centralizado de Diálogos e Modais
 * Integrado com TemplateEngine v3.1 e Utils.js
 */
class ModalsManager {
    constructor() {
        this.modals = new Map();
        this.isInitialized = false;
        // Referência para as configurações de cada modal
        this.modalConfigs = {
            'accessibility-menu': { id: 'accessibility-menu', activeClass: 'open' },
            'cookie-prefs-modal': { id: 'cookie-prefs-modal', activeClass: 'show' },
            'suggestion-modal': { id: 'suggestion-modal', activeClass: 'show' }
        };
        this.init();
    }

    /**
     * Inicialização protegida: evita múltiplas instâncias e prepara eventos globais
     */
    init() {
        if (this.isInitialized) return;

        this.refresh();
        this.bindGlobalEvents();
        this.setupObserver();
        
        this.isInitialized = true;
        this._debug('Gerenciador inicializado e sincronizado com Utils.js');
    }

    /**
     * Sincroniza o mapa de modais com o que existe no DOM atualmente.
     * Mapeia os IDs e define as classes de ativação corretas (open/show).
     */
    refresh() {
        Object.entries(this.modalConfigs).forEach(([key, config]) => {
            const el = document.getElementById(config.id);
            if (el) {
                this.modals.set(key, {
                    element: el,
                    config: config,
                    // Verifica o estado atual baseado na classe específica de cada modal
                    isOpen: el.classList.contains(config.activeClass)
                });
            }
        });
        
        if (this.modals.size > 0) {
            this._debug(`Modais ativos no DOM: ${Array.from(this.modals.keys()).join(', ')}`);
        }
    }

    /**
     * Observa o container de modais para capturar injeções dinâmicas do TemplateEngine.
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
     * Delegação de eventos global para abertura e fechamento.
     */
    bindGlobalEvents() {
        document.addEventListener('click', (e) => {
            const target = e.target;

            // --- Gatilhos de Abertura ---
            if (target.closest('.accessibility-menu-trigger')) {
                e.preventDefault();
                this.openModal('accessibility-menu');
            }
            if (target.closest('.cookie-prefs-trigger')) {
                e.preventDefault();
                this.openModal('cookie-prefs-modal');
            }
            if (target.closest('.suggestion-modal-trigger')) {
                e.preventDefault();
                this.openModal('suggestion-modal');
            }

            // --- Gatilhos de Fechamento ---
            // Captura cliques no Backdrop (fundo), botões de fechar (X) ou botões cancelar específicos
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

        // Tecla ESC para acessibilidade
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });
    }

    /**
     * Abre o modal aplicando a classe correta definida no config.
     */
    openModal(modalId) {
        // Tenta atualizar referências caso o modal tenha sido injetado recentemente
        if (!this.modals.has(modalId)) this.refresh();

        const modal = this.modals.get(modalId);
        if (modal) {
            const activeClass = modal.config.activeClass;
            
            // Lógica de UI: Trava o scroll e aplica classe
            document.body.style.overflow = 'hidden';
            modal.element.classList.add(activeClass);
            modal.isOpen = true;
            modal.element.setAttribute('aria-hidden', 'false');
            
            // Suporte a animação se disponível no Utils.js
            if (window.Utils && window.Utils.animate && window.Utils.animate.fadeIn) {
                window.Utils.animate.fadeIn(modal.element);
            }

            // Foco automático para acessibilidade
            const focusable = modal.element.querySelector('button, input, select, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                setTimeout(() => focusable.focus(), 100);
            }
            
            this._debug(`Exibindo modal: ${modalId} (Classe: ${activeClass})`);
        } else {
            console.error(`[ModalsManager] Falha crítica: Elemento #${modalId} não existe no DOM.`);
        }
    }

    /**
     * Fecha o modal removendo a classe de ativação.
     */
    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal && modal.isOpen) {
            const activeClass = modal.config.activeClass;
            
            modal.element.classList.remove(activeClass);
            modal.isOpen = false;
            modal.element.setAttribute('aria-hidden', 'true');
            
            // Restaura o scroll apenas se não houver outros modais abertos
            const anyOpen = Array.from(this.modals.values()).some(m => m.isOpen);
            if (!anyOpen) {
                document.body.style.overflow = '';
            }
            
            this._debug(`Modal "${modalId}" fechado.`);
        }
    }

    /**
     * Fecha todos os modais ativos de uma vez.
     */
    closeAllModals() {
        this.modals.forEach((_, id) => this.closeModal(id));
    }

    /**
     * Debug compatível com ConsoleCleaner.
     * Utiliza um prefixo único para evitar ser filtrado como "ruído".
     */
    _debug(msg) {
        // Ignora o filtro do ConsoleCleaner usando um prefixo específico
        console.log(`%c[MODAL-SYSTEM] ${msg}`, 'color: #8b5cf6; font-weight: bold;');
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

// Vinculo ao TemplateEngine para inicializar assim que os componentes forem injetados
window.addEventListener('templateEngineReady', () => {
    // Pequeno delay para garantir que o DOM inserido foi processado pelo browser
    setTimeout(initializeModals, 50);
});

// Fallback de segurança para páginas estáticas ou carregamento atrasado
if (document.readyState === 'complete') {
    initializeModals();
} else {
    window.addEventListener('load', initializeModals);
}