/**
 * MODALS.JS - Gerenciador sincronizado com Utils.js
 */
class ModalsManager {
    constructor() {
        this.modals = new Map();
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        this.bindGlobalEvents();
        this.setupObserver();
        this.refresh();
        this.isInitialized = true;
        console.log("%c[Modals] Sistema sincronizado.", "color: #8b5cf6; font-weight: bold;");
    }

    refresh() {
        const configs = {
            'accessibility-menu': { activeClass: 'open' },
            'cookie-prefs-modal': { activeClass: 'show' },
            'suggestion-modal': { activeClass: 'show' }
        };

        Object.entries(configs).forEach(([id, cfg]) => {
            const el = document.getElementById(id);
            if (el) this.modals.set(id, { element: el, config: cfg, isOpen: el.classList.contains(cfg.activeClass) });
        });
    }

    setupObserver() {
        const target = document.getElementById('modals-container') || document.body;
        new MutationObserver(() => this.refresh()).observe(target, { childList: true, subtree: true });
    }

    bindGlobalEvents() {
        document.addEventListener('click', (e) => {
            const t = e.target;
            if (t.closest('.accessibility-menu-trigger')) this.openModal('accessibility-menu');
            if (t.closest('.modal-close') || t.matches('.modal-backdrop')) this.closeAll();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeAll(); });
    }

    openModal(id) {
        const m = this.modals.get(id);
        if (!m) return;
        document.body.style.overflow = 'hidden';
        m.element.classList.add(m.config.activeClass);
        m.isOpen = true;
        if (window.Utils?.animate?.fadeIn) window.Utils.animate.fadeIn(m.element);
        const first = m.element.querySelector('button, input');
        if (first) setTimeout(() => first.focus(), 100);
    }

    closeAll() {
        this.modals.forEach((m) => {
            m.element.classList.remove(m.config.activeClass);
            m.isOpen = false;
        });
        document.body.style.overflow = '';
    }
}

window.addEventListener('templateEngineReady', () => {
    window.modalsManager = new ModalsManager();
    window.modalsManager.init();
});