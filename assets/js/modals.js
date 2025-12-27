/**
 * MODALS-MANAGER.JS - Versão Production-Ready
 * Corrige problemas de race condition e inicialização tardia.
 */

class ModalsManager {
    constructor() {
        this.modals = new Map();
        this.isInitialized = false;
        
        // Configurações
        this.modalConfigs = {
            'accessibility-menu': { id: 'accessibility-menu', activeClass: 'open' },
            'cookie-prefs-modal': { id: 'cookie-prefs-modal', activeClass: 'show' },
            'suggestion-modal': { id: 'suggestion-modal', activeClass: 'show' }
        };

        this._handleOutsideClick = this._handleOutsideClick.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
    }

    init() {
        if (this.isInitialized) return;

        console.log('[ModalsManager] Inicializando...');
        
        // Tenta encontrar os elementos no DOM
        let foundAny = false;
        
        // 1. Registrar Modais
        for (const [key, config] of Object.entries(this.modalConfigs)) {
            const el = document.getElementById(config.id);
            if (el) {
                this.modals.set(key, {
                    element: el,
                    config: config,
                    isOpen: false,
                    triggers: document.querySelectorAll(`[data-modal-trigger="${key}"]`)
                });
                foundAny = true;
            } else {
                // Não loga erro, pois o modal pode não estar na página atual
                // console.debug(`Modal ${key} não encontrado no DOM.`);
            }
        }

        if (!foundAny) {
            console.warn('[ModalsManager] Nenhum modal encontrado. HTML carregou?');
            return;
        }

        this.bindGlobalEvents();
        this.bindTriggers();
        this.isInitialized = true;
    }

    bindGlobalEvents() {
        document.addEventListener('keydown', this._handleKeyDown);
        document.addEventListener('click', this._handleOutsideClick);
        
        // Bind especial para botões de fechar
        document.querySelectorAll('.modal-close, .accessibility-menu-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalEl = btn.closest('.accessibility-menu, .modal, [role="dialog"]');
                if (modalEl) {
                    const key = this._getModalKeyByElement(modalEl);
                    if (key) this.closeModal(key);
                }
            });
        });
    }

    bindTriggers() {
        // Triggers via data-attribute
        document.querySelectorAll('[data-modal-trigger]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetKey = btn.dataset.modalTrigger;
                this.openModal(targetKey);
            });
        });
        
        // Suporte legado (se necessário)
        const accessBtn = document.getElementById('accessibility-btn');
        if (accessBtn) {
            accessBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('accessibility-menu');
            });
        }
    }

    openModal(key) {
        const data = this.modals.get(key);
        if (!data) return;

        // Fecha outros se necessário (opcional)
        // this.closeAllModals();

        data.element.classList.add(data.config.activeClass);
        data.element.setAttribute('aria-hidden', 'false');
        data.isOpen = true;
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
    }

    closeModal(key) {
        const data = this.modals.get(key);
        if (!data || !data.isOpen) return;

        data.element.classList.remove(data.config.activeClass);
        data.element.setAttribute('aria-hidden', 'true');
        data.isOpen = false;

        // Só libera scroll se nenhum outro estiver aberto
        const anyOpen = Array.from(this.modals.values()).some(m => m.isOpen);
        if (!anyOpen) {
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        this.modals.forEach((_, key) => this.closeModal(key));
    }

    _handleOutsideClick(e) {
        this.modals.forEach((data, key) => {
            if (data.isOpen && e.target === data.element) {
                // Clicou no backdrop (overlay)
                this.closeModal(key);
            }
        });
    }

    _handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    _getModalKeyByElement(el) {
        for (const [key, data] of this.modals.entries()) {
            if (data.element === el) return key;
        }
        return null;
    }
}

// Inicialização Robusta
window.modalsManager = new ModalsManager();

// 1. Listener do Template Engine
window.addEventListener('components:loaded', () => {
    window.modalsManager.init();
});

// 2. Fallback para DOMContentLoaded (se scripts carregarem estaticamente)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Pequeno delay para garantir que scripts injetados processaram
    setTimeout(() => window.modalsManager.init(), 100);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.modalsManager.init();
    });
}