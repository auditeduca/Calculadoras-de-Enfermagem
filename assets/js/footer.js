/**
 * FOOTER-MANAGER.JS - Gerencia Cookies (LGPD), UX do Rodapé e Comportamentos Globais
 * Versão: 2.0 - Integrado com TemplateEngine e ModalsManager
 */
class FooterManager {
    constructor() {
        // IDs dos elementos esperados no componente footer.html e modals-main.html
        this.elements = {
            year: 'current-year',
            cookieBanner: 'cookie-banner',
            cookieOverlay: 'cookie-overlay',
            cookieModal: 'cookie-modal-content',
            cookieFab: 'cookie-fab',
            backToTop: 'backToTop',
            configBtn: 'footer-config-btn'
        };

        this.lastFocusedElement = null;
        this.init();
    }

    /**
     * Inicialização segura: Verifica se o DOM está pronto ou se foi injetado pelo motor
     */
    init() {
        // Se o DOM ainda está carregando, aguarda. Caso contrário, executa.
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.updateYear();
        this.initCookieBanner();
        this.initBackToTop();
        this.initFooterConfigBtn();
        console.log("%c[FooterManager] 🛠️ Funcionalidades de UX e LGPD carregadas.", "color: #10b981; font-weight: bold;");
    }

    /**
     * Atualiza o ano de copyright dinamicamente
     * Lógica: Se o ano atual for 2025, exibe apenas 2025. Se for posterior, exibe 2025-20XX.
     */
    updateYear() {
        const yearEl = document.getElementById(this.elements.year);
        if (yearEl) {
            const currentYear = new Date().getFullYear();
            yearEl.textContent = currentYear > 2025 ? `2025-${currentYear}` : "2025";
        }
    }

    /**
     * Gerencia o Banner de Cookies e o Modal de Preferências (LGPD)
     */
    initCookieBanner() {
        const banner = document.getElementById(this.elements.cookieBanner);
        const overlay = document.getElementById(this.elements.cookieOverlay);
        const modalContent = document.getElementById(this.elements.cookieModal);
        const fab = document.getElementById(this.elements.cookieFab);

        if (!banner || !overlay) return;

        // 1. Exibição Inicial: Verifica se o usuário já aceitou os cookies
        setTimeout(() => {
            try {
                const consent = localStorage.getItem('cookiesAccepted');
                if (!consent) {
                    banner.classList.remove('translate-y-full');
                    document.body.classList.add('cookie-banner-active');
                }
            } catch (e) {
                console.warn("[FooterManager] LocalStorage inacessível para cookies.");
            }
        }, 1500);

        // 2. Lógica de Abertura do Modal de Preferências
        const openModal = () => {
            this.lastFocusedElement = document.activeElement;
            banner.classList.add('translate-y-full');
            overlay.classList.remove('opacity-0', 'invisible');
            modalContent.classList.remove('translate-y-full');
            document.body.style.overflow = 'hidden';
            
            // Foco inicial para acessibilidade
            setTimeout(() => {
                const first = modalContent.querySelector('button, input');
                if (first) first.focus();
            }, 300);
        };

        // 3. Lógica de Fechamento e Salvamento
        const closeAll = (accepted = true) => {
            overlay.classList.add('opacity-0', 'invisible');
            modalContent.classList.add('translate-y-full');
            banner.classList.add('translate-y-full');
            document.body.style.overflow = '';
            document.body.classList.remove('cookie-banner-active');
            
            if (accepted) {
                try { 
                    localStorage.setItem('cookiesAccepted', 'true');
                    localStorage.setItem('cookieDate', new Date().toISOString());
                } catch (e) {}
            }

            if (this.lastFocusedElement) this.lastFocusedElement.focus();
        };

        // 4. Atribuição de Eventos aos Botões
        const btnAccept = document.getElementById('banner-accept');
        const btnOptions = document.getElementById('banner-options');
        const btnSave = document.getElementById('modal-save');
        const btnCloseX = document.getElementById('modal-close-x');

        if (btnAccept) btnAccept.onclick = () => closeAll(true);
        if (btnOptions) btnOptions.onclick = openModal;
        if (btnSave) btnSave.onclick = () => closeAll(true);
        if (btnCloseX) btnCloseX.onclick = () => closeAll(false);
        if (fab) fab.onclick = openModal;

        // 5. Accordion das descrições de cookies no modal
        document.querySelectorAll('.cookie-desc-toggle').forEach(btn => {
            btn.onclick = () => {
                const target = document.getElementById(btn.dataset.target);
                if (target) {
                    const isHidden = target.classList.contains('hidden');
                    target.classList.toggle('hidden');
                    btn.querySelector('i')?.classList.toggle('fa-chevron-up', isHidden);
                    btn.querySelector('i')?.classList.toggle('fa-chevron-down', !isHidden);
                }
            };
        });

        // Expondo o método de abertura globalmente
        this.openCookieModal = openModal;
    }

    /**
     * Botão Voltar ao Topo: Aparece após 300px de scroll
     */
    initBackToTop() {
        const btn = document.getElementById(this.elements.backToTop);
        if (!btn) return;

        window.addEventListener('scroll', () => {
            // Usa window.scrollY para navegadores modernos
            const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollPos > 300) {
                btn.classList.add('is-visible');
            } else {
                btn.classList.remove('is-visible');
            }
        }, { passive: true });

        btn.onclick = (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    /**
     * Link de Configurações no rodapé: Abre o modal de cookies
     */
    initFooterConfigBtn() {
        const btn = document.getElementById(this.elements.configBtn);
        if (btn) {
            btn.onclick = (e) => {
                e.preventDefault();
                if (this.openCookieModal) this.openCookieModal();
            };
        }
    }
}

// Instanciação Global para que outros scripts possam interagir com o Manager
window.footerManager = new FooterManager();