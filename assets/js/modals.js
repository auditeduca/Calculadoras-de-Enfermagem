/**
 * MODALS-MANAGER.JS - Gerenciamento Centralizado v2025 (Híbrido)
 * * MERGE FINAL:
 * - Mantém compatibilidade com classes legadas (.trigger-class).
 * - Mantém integração com Utils.animate.
 * - Adiciona Focus Trap, ARIA e prevenção de Memory Leaks.
 */

class ModalsManager {
    constructor() {
        this.modals = new Map();
        this.isInitialized = false;
        this.observer = null;
        this.lastFocusedElement = null; // Para restaurar o foco ao fechar

        // Mapeamento de configuração (Mantido do original)
        this.modalConfigs = {
            'accessibility-menu': { id: 'accessibility-menu', activeClass: 'open' },
            'cookie-prefs-modal': { id: 'cookie-prefs-modal', activeClass: 'show' },
            'suggestion-modal': { id: 'suggestion-modal', activeClass: 'show' }
        };

        // Binds fixos para garantir contexto e permitir remoção correta
        this._handleOutsideClick = this._handleOutsideClick.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleTriggerClick = this._handleTriggerClick.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.refresh();
        this.bindGlobalEvents();
        this.setupObserver();
        
        this.isInitialized = true;
        this._debug('Gerenciador inicializado (Modo Híbrido: A11Y + Legado).');
    }

    /**
     * Atualiza o mapa de modais com base no DOM atual.
     */
    refresh() {
        this.modals.clear();
        Object.entries(this.modalConfigs).forEach(([key, config]) => {
            const el = document.getElementById(config.id);
            if (el) {
                this.modals.set(key, {
                    element: el,
                    config: config,
                    isOpen: el.classList.contains(config.activeClass)
                });

                // Inicialização de atributos ARIA (Melhoria A11Y)
                if (!el.hasAttribute('role')) el.setAttribute('role', 'dialog');
                if (!el.hasAttribute('aria-modal')) el.setAttribute('aria-modal', 'true');
                if (!el.hasAttribute('aria-hidden')) el.setAttribute('aria-hidden', 'true');
                if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
            }
        });
        
        if (this.modals.size > 0) {
            this._debug(`Modais detectados: ${Array.from(this.modals.keys()).join(', ')}`);
        }
    }

    /**
     * OBSERVER (Restaurada lógica de performance do original)
     * Prioriza #modals-container para evitar observar o body inteiro desnecessariamente.
     */
    setupObserver() {
        if (this.observer) this.observer.disconnect();

        // Tenta pegar o container específico primeiro (otimização do original)
        const target = document.getElementById('modals-container') || document.body;

        this.observer = new MutationObserver((mutations) => {
            const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
            // Verifica se os nós adicionados são relevantes para os modais configurados
            if (hasNewNodes) {
                // Verificação leve para não dar refresh à toa
                const needsRefresh = mutations.some(m => 
                    Array.from(m.addedNodes).some(node => 
                        node.nodeType === 1 && (node.id in this.modalConfigs || node.querySelector && node.querySelector('[id]'))
                    )
                );
                
                if (needsRefresh) {
                    this._debug('Injeção dinâmica detectada. Atualizando referências...');
                    this.refresh();
                }
            }
        });

        this.observer.observe(target, { childList: true, subtree: true });
    }

    /**
     * Gerenciamento de Eventos Globais
     * Remove listeners antigos (Fix Memory Leak)
     */
    bindGlobalEvents() {
        document.removeEventListener('click', this._handleOutsideClick);
        document.removeEventListener('keydown', this._handleKeyDown);
        document.removeEventListener('click', this._handleTriggerClick); // Centralizado

        document.addEventListener('click', this._handleOutsideClick);
        document.addEventListener('keydown', this._handleKeyDown);
        document.addEventListener('click', this._handleTriggerClick);
    }

    /**
     * Handler unificado: Suporta tanto data-attributes (Novo) quanto classes (Legado)
     */
    _handleTriggerClick(e) {
        const target = e.target;
        let modalId = null;
        let triggerElement = null;

        // 1. Tenta via data-attribute (Padrão Novo)
        const dataTrigger = target.closest('[data-modal-target]');
        if (dataTrigger) {
            modalId = dataTrigger.getAttribute('data-modal-target');
            triggerElement = dataTrigger;
        }

        // 2. Fallback para classes legadas (Restaurado do Original)
        if (!modalId) {
            if (target.closest('.accessibility-menu-trigger')) {
                modalId = 'accessibility-menu';
                triggerElement = target.closest('.accessibility-menu-trigger');
            }
            else if (target.closest('.cookie-prefs-trigger')) {
                modalId = 'cookie-prefs-modal';
                triggerElement = target.closest('.cookie-prefs-trigger');
            }
            else if (target.closest('.suggestion-modal-trigger')) {
                modalId = 'suggestion-modal';
                triggerElement = target.closest('.suggestion-modal-trigger');
            }
        }

        // Abertura
        if (modalId) {
            e.preventDefault();
            this.openModal(modalId, triggerElement);
            return;
        }

        // Fechamento (Compatível com ambos)
        if (
            target.matches('[data-modal-close]') || 
            target.closest('[data-modal-close]') ||
            target.matches('.modal-close') || 
            target.closest('.modal-close') ||
            target.matches('.accessibility-menu-close') ||
            target.closest('.accessibility-menu-close')
        ) {
            e.preventDefault();
            // Tenta descobrir qual modal fechar (passado no data ou fecha tudo se genérico)
            const closeBtn = target.closest('[data-modal-close]');
            const specificId = closeBtn ? closeBtn.getAttribute('data-modal-close') : null;
            
            if (specificId) this.closeModal(specificId);
            else this.closeAllModals();
        }
    }

    _handleOutsideClick(e) {
        // Verifica se clicou no backdrop (fundo escuro)
        if (e.target.matches('.modal-backdrop')) {
            this.closeAllModals();
            return;
        }

        this.modals.forEach((data, key) => {
            if (data.isOpen && e.target === data.element) {
                this.closeModal(key);
            }
        });
    }

    _handleKeyDown(e) {
        const activeModal = this._getActiveModal();
        if (!activeModal) return;

        if (e.key === 'Escape') {
            this.closeAllModals();
            return;
        }

        if (e.key === 'Tab') {
            this._handleFocusTrap(e, activeModal.element);
        }
    }

    _handleFocusTrap(e, modalElement) {
        const focusableElements = modalElement.querySelectorAll(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    _getActiveModal() {
        for (let [_, data] of this.modals) {
            if (data.isOpen) return data;
        }
        return null;
    }

    openModal(modalKey, triggerElement = null) {
        // Retry se não achar no map (pode ter sido injetado agora)
        if (!this.modals.has(modalKey)) this.refresh();

        const key = this.modals.has(modalKey) ? modalKey : 
                    Object.keys(this.modalConfigs).find(k => this.modalConfigs[k].id === modalKey);

        const data = this.modals.get(key);
        
        if (data) {
            // Salva foco anterior
            if (triggerElement) {
                this.lastFocusedElement = triggerElement;
            } else {
                this.lastFocusedElement = document.activeElement;
            }

            this.closeAllModals(); 
            
            data.element.classList.add(data.config.activeClass);
            data.element.setAttribute('aria-hidden', 'false');
            data.isOpen = true;
            document.body.style.overflow = 'hidden';

            // Integração com Utils (Restaurado do Original)
            if (window.Utils && window.Utils.animate && window.Utils.animate.fadeIn) {
                window.Utils.animate.fadeIn(data.element);
            }
            
            // Foco com delay para garantir renderização
            setTimeout(() => {
                const focusable = data.element.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
                if (focusable) {
                    focusable.focus();
                } else {
                    data.element.focus();
                }
            }, 100);

            this._debug(`Modal "${key}" aberto.`);
        } else {
            console.error(`[ModalsManager] Modal não encontrado: ${modalKey}`);
        }
    }

    closeModal(modalKey) {
        const key = this.modals.has(modalKey) ? modalKey : 
                    Object.keys(this.modalConfigs).find(k => this.modalConfigs[k].id === modalKey);

        const data = this.modals.get(key);
        if (data && data.isOpen) {
            data.element.classList.remove(data.config.activeClass);
            data.element.setAttribute('aria-hidden', 'true');
            data.isOpen = false;
            
            const anyOpen = Array.from(this.modals.values()).some(m => m.isOpen);
            if (!anyOpen) document.body.style.overflow = '';

            // Restaura foco
            if (this.lastFocusedElement && document.body.contains(this.lastFocusedElement)) {
                this.lastFocusedElement.focus();
                this.lastFocusedElement = null;
            }

            this._debug(`Modal "${key}" fechado.`);
        }
    }

    closeAllModals() {
        this.modals.forEach((_, key) => {
            if (this.modals.get(key).isOpen) {
                this.closeModal(key);
            }
        });
    }

    _debug(msg) {
        console.log(`%c[MODAL-SYSTEM] ${msg}`, 'color: #8b5cf6; font-weight: bold;');
    }
}

/**
 * PONTO DE ENTRADA (Restaurado padrão global)
 */
function initializeModals() {
    if (!window.modalsManager) {
        window.modalsManager = new ModalsManager();
    } else {
        window.modalsManager.refresh();
    }
}

// Inicialização segura com TemplateEngine (Mantido)
window.addEventListener('templateEngineReady', () => {
    setTimeout(initializeModals, 100);
});

// Fallback padrão
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModals);
} else {
    initializeModals();
}