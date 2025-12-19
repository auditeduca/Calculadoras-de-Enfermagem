/**
 * FooterManager - Otimizado e Modular
 */
class FooterManager {
    constructor() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.initCookieSystem();
        this.initBackToTop();
        this.initFooterConfigBtn();
        this.updateYear();
    }

    updateYear() {
        const yearEl = document.getElementById('current-year');
        if (yearEl) {
            const year = new Date().getFullYear();
            yearEl.textContent = year > 2025 ? `2025-${year}` : year;
        }
    }

    initCookieSystem() {
        const banner = document.getElementById('cookie-banner');
        const overlay = document.getElementById('cookie-overlay');
        const modalContent = document.getElementById('cookie-modal-content');
        const fab = document.getElementById('cookie-fab');
        let lastFocusedElement = null;

        if (!banner || !overlay) return;

        setTimeout(() => {
            try {
                if (!localStorage.getItem('cookiesAccepted')) {
                    banner.classList.remove('translate-y-full');
                    document.body.classList.add('cookie-banner-active');
                    if (fab) fab.classList.add('opacity-0', 'pointer-events-none');
                }
            } catch(e) {}
        }, 500);

        const updateConsentToGoogle = () => {
            if (typeof gtag !== 'function') return;
            const adStorage = document.getElementById('check-mkt')?.checked ? 'granted' : 'denied';
            const analyticsStorage = document.getElementById('check-stats')?.checked ? 'granted' : 'denied';
            
            gtag('consent', 'update', {
                'ad_storage': adStorage,
                'analytics_storage': analyticsStorage,
                'ad_user_data': adStorage,
                'ad_personalization': adStorage
            });
            
            window.dataLayer.push({'event': 'cookie_consent_update'});
        };

        const openModal = () => {
            lastFocusedElement = document.activeElement;
            banner.classList.add('translate-y-full');
            document.body.classList.remove('cookie-banner-active');
            overlay.classList.remove('opacity-0', 'invisible');
            modalContent.classList.remove('translate-y-full');
            if (fab) fab.classList.add('opacity-0', 'pointer-events-none');
            document.body.classList.add('overflow-hidden');
            setTimeout(() => modalContent.querySelector('button')?.focus(), 300);
        };

        const closeAll = () => {
            overlay.classList.add('opacity-0', 'invisible');
            modalContent.classList.add('translate-y-full');
            banner.classList.add('translate-y-full');
            document.body.classList.remove('overflow-hidden', 'cookie-banner-active');
            updateConsentToGoogle();
            setTimeout(() => {
                if (fab) fab.classList.remove('opacity-0', 'pointer-events-none');
                if (lastFocusedElement) lastFocusedElement.focus();
            }, 300);
            try { localStorage.setItem('cookiesAccepted', 'true'); } catch(e) {}
        };

        const handleFocusTrap = (e) => {
            if (e.key === 'Tab' && !overlay.classList.contains('invisible')) {
                const focusable = modalContent.querySelectorAll('button, [href], input, select, textarea');
                const first = focusable[0], last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.addEventListener('keydown', (e) => {
            if (overlay.classList.contains('invisible')) return;
            if (e.key === 'Escape') closeAll();
            if (e.key === 'Tab') handleFocusTrap(e);
        });

        overlay.addEventListener('click', (e) => e.target === overlay && closeAll());

        const bind = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
        bind('banner-accept', () => {
            const m = document.getElementById('check-mkt'), s = document.getElementById('check-stats');
            if(m) m.checked = true; if(s) s.checked = true;
            closeAll();
        });
        bind('banner-options', openModal);
        bind('modal-save', closeAll);
        bind('modal-close-x', closeAll);
        bind('modal-reject-all', () => {
            const m = document.getElementById('check-mkt'), s = document.getElementById('check-stats');
            if(m) m.checked = false; if(s) s.checked = false;
            closeAll();
        });

        if (fab) fab.addEventListener('click', openModal);

        document.querySelectorAll('.cookie-desc-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.getAttribute('data-target'));
                const icon = btn.querySelector('.fa-chevron-down');
                if (target) {
                    target.classList.toggle('hidden');
                    if (icon) icon.style.transform = target.classList.contains('hidden') ? "rotate(0deg)" : "rotate(180deg)";
                }
            });
        });
        this.openCookieModal = openModal;
    }

    initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) btn.classList.add('is-visible');
            else btn.classList.remove('is-visible');
        }, { passive: true });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    initFooterConfigBtn() {
        document.getElementById('footer-config-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.openCookieModal) this.openCookieModal();
        });
    }
}

window.footerManager = new FooterManager();