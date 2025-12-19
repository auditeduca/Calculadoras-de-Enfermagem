/**
 * FOOTER.JS - LGPD e UI do Rodapé
 */
class FooterManager {
    constructor() { this.init(); }

    init() {
        this.updateYear();
        this.initCookieBanner();
        this.initBackToTop();
    }

    updateYear() {
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    initCookieBanner() {
        const banner = document.getElementById('cookie-banner');
        if (!banner || localStorage.getItem('cookiesAccepted')) return;
        
        setTimeout(() => banner.classList.remove('translate-y-full'), 1000);
        
        document.getElementById('banner-accept')?.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            banner.classList.add('translate-y-full');
        });
    }

    initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('is-visible', window.scrollY > 300);
        });
        btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

new FooterManager();