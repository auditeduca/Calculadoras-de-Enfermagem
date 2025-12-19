/**
 * FooterManager - Gerencia Cookies, LGPD/GTM e UX do Rodapé.
 * FOOTER.JS - LGPD e UI do Rodapé
 */
class FooterManager {
    constructor() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    constructor() { this.init(); }

    init() {
        this.initCookieSystem();
        this.initBackToTop();
        this.initFooterConfigBtn();
        this.updateYear();
        this.initCookieBanner();
        this.initBackToTop();
    }

    updateYear() {
        const yearEl = document.getElementById('current-year');
        if (yearEl) {
            const year = new Date().getFullYear();
            yearEl.textContent = year > 2025 ? `2025-${year}` : year;
        }
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    initCookieSystem() {
    initCookieBanner() {
        const banner = document.getElementById('cookie-banner');
        const overlay = document.getElementById('cookie-overlay');
        const modalContent = document.getElementById('cookie-modal-content');
        const fab = document.getElementById('cookie-fab');
        let lastFocusedElement = null;

        // Se os elementos não existirem, aborta silenciosamente
        if (!banner || !overlay) return;

        // Verifica estado inicial dos cookies
        setTimeout(() => {
            try {
                if (!localStorage.getItem('cookiesAccepted')) {
                    banner.classList.remove('translate-y-full');
                    document.body.classList.add('cookie-banner-active');
                    if (fab) fab.classList.add('opacity-0', 'pointer-events-none');
                }
            } catch(e) {} // Proteção contra bloqueadores de armazenamento
        }, 500);

        // Envia atualização para o Google Consent Mode v2
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
            
            if (window.dataLayer) {
                window.dataLayer.push({'event': 'cookie_consent_update'});
            }
        };

        const openModal = () => {
            lastFocusedElement = document.activeElement;
            banner.classList.add('translate-y-full');
            document.body.classList.remove('cookie-banner-active');
            overlay.classList.remove('opacity-0', 'invisible');
            modalContent.classList.remove('translate-y-full');
            if (fab) fab.classList.add('opacity-0', 'pointer-events-none');
            document.body.classList.add('overflow-hidden');
            
            // Foco acessível
            setTimeout(() => {
                const first = modalContent.querySelector('button, [href], input, select, textarea');
                if (first) first.focus();
            }, 300);
        };

        const closeAll = () => {
            overlay.classList.add('opacity-0', 'invisible');
            modalContent.classList.add('translate-y-full');
            banner.classList.add('translate-y-full');
            document.body.classList.remove('overflow-hidden');
            document.body.classList.remove('cookie-banner-active');
            
            updateConsentToGoogle();

            setTimeout(() => {
                if (fab) fab.classList.remove('opacity-0', 'pointer-events-none');
                if (lastFocusedElement) lastFocusedElement.focus();
            }, 300);
            
            try { localStorage.setItem('cookiesAccepted', 'true'); } catch(e) {}
        };

        // Focus Trap para Acessibilidade (Modal)
        const handleFocusTrap = (e) => {
            if (e.key === 'Tab' && !overlay.classList.contains('invisible')) {
                const focusable = modalContent.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) { 
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else { 
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            }
        };

        // Event Listeners Globais
        document.addEventListener('keydown', (e) => {
            if (overlay.classList.contains('invisible')) return;
            if (e.key === 'Escape') closeAll();
            if (e.key === 'Tab') handleFocusTrap(e);
        });

        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAll(); });

        // Helper para bind seguro
        const bind = (id, event, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, fn);
        };

        // Ações dos Botões
        bind('banner-accept', 'click', () => {
            const chkMkt = document.getElementById('check-mkt');
            const chkStats = document.getElementById('check-stats');
            if(chkMkt) chkMkt.checked = true;
            if(chkStats) chkStats.checked = true;
            closeAll();
        });
        if (!banner || localStorage.getItem('cookiesAccepted')) return;
        
        bind('banner-options', 'click', openModal);
        bind('modal-save', 'click', closeAll);
        bind('modal-close-x', 'click', closeAll);
        bind('modal-reject-all', 'click', () => {
            const chkMkt = document.getElementById('check-mkt');
            const chkStats = document.getElementById('check-stats');
            if(chkMkt) chkMkt.checked = false;
            if(chkStats) chkStats.checked = false;
            closeAll();
        });

        if (fab) fab.addEventListener('click', openModal);

        // Accordion (Detalhes Técnicos)
        document.querySelectorAll('.cookie-desc-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetEl = document.getElementById(targetId);
                const icon = btn.querySelector('.fa-chevron-down');
                const isExpanded = btn.getAttribute('aria-expanded') === 'true';

                if (targetEl) {
                    targetEl.classList.toggle('hidden');
                    btn.setAttribute('aria-expanded', !isExpanded);
                    if (icon) icon.style.transform = targetEl.classList.contains('hidden') ? "rotate(0deg)" : "rotate(180deg)";
                }
            });
        });
        setTimeout(() => banner.classList.remove('translate-y-full'), 1000);
        
        // Expor método para uso externo
        this.openCookieModal = openModal;
        document.getElementById('banner-accept')?.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            banner.classList.add('translate-y-full');
        });
    }

    initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;
        
        let isScrolling;
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            window.cancelAnimationFrame(isScrolling);
            isScrolling = window.requestAnimationFrame(() => {
                if (window.scrollY > 300) backToTopBtn.classList.add('is-visible');
                else backToTopBtn.classList.remove('is-visible');
            });
        }, { passive: true });
        
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    initFooterConfigBtn() {
        const configBtn = document.getElementById('footer-config-btn');
        if (configBtn) {
            configBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.openCookieModal) this.openCookieModal();
            });
        }
            btn.classList.toggle('is-visible', window.scrollY > 300);
        });
        btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Inicializa a classe automaticamente
window.footerManager = new FooterManager();
new FooterManager();