/**
 * FooterManager - Gerencia Cookies, LGPD/GTM e UX do Rodapé.
 */
class FooterManager {
    constructor() {
        // Garantir inicialização única
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.updateYear();
        this.initCookieBanner();
        this.initBackToTop();
        this.initFooterConfigBtn();
    }

    updateYear() {
        const yearEl = document.getElementById('current-year');
        if (yearEl) {
            const year = new Date().getFullYear();
            yearEl.textContent = year > 2025 ? `2025-${year}` : year;
        }
    }

    initCookieBanner() {
        const banner = document.getElementById('cookie-banner');
        const overlay = document.getElementById('cookie-overlay');
        const modalContent = document.getElementById('cookie-modal-content');
        const fab = document.getElementById('cookie-fab');
        let lastFocusedElement = null;

        if (!banner || !overlay) return;

        // Verifica estado inicial
        setTimeout(() => {
            try {
                if (!localStorage.getItem('cookiesAccepted')) {
                    banner.classList.remove('translate-y-full');
                    document.body.classList.add('cookie-banner-active');
                }
            } catch(e) {}
        }, 1000);

        const openModal = () => {
            lastFocusedElement = document.activeElement;
            banner.classList.add('translate-y-full');
            overlay.classList.remove('opacity-0', 'invisible');
            modalContent.classList.remove('translate-y-full');
            document.body.classList.add('overflow-hidden');
            
            setTimeout(() => {
                const first = modalContent.querySelector('button, input');
                if (first) first.focus();
            }, 300);
        };

        const closeAll = (accepted = true) => {
            overlay.classList.add('opacity-0', 'invisible');
            modalContent.classList.add('translate-y-full');
            banner.classList.add('translate-y-full');
            document.body.classList.remove('overflow-hidden');
            document.body.classList.remove('cookie-banner-active');
            
            if (accepted) {
                try { localStorage.setItem('cookiesAccepted', 'true'); } catch(e) {}
            }

            if (lastFocusedElement) lastFocusedElement.focus();
        };

        // Binds
        const btnAccept = document.getElementById('banner-accept');
        const btnOptions = document.getElementById('banner-options');
        const btnSave = document.getElementById('modal-save');
        const btnCloseX = document.getElementById('modal-close-x');

        if (btnAccept) btnAccept.onclick = () => closeAll(true);
        if (btnOptions) btnOptions.onclick = openModal;
        if (btnSave) btnSave.onclick = () => closeAll(true);
        if (btnCloseX) btnCloseX.onclick = () => closeAll(false);
        if (fab) fab.onclick = openModal;

        // Accordion
        document.querySelectorAll('.cookie-desc-toggle').forEach(btn => {
            btn.onclick = () => {
                const target = document.getElementById(btn.dataset.target);
                if (target) target.classList.toggle('hidden');
            };
        });

        this.openCookieModal = openModal;
    }

    initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('is-visible', window.scrollY > 300);
        }, { passive: true });
        btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    initFooterConfigBtn() {
        const btn = document.getElementById('footer-config-btn');
        if (btn) btn.onclick = (e) => { e.preventDefault(); this.openCookieModal(); };
    }
}

window.footerManager = new FooterManager();