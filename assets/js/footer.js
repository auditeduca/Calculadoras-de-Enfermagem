/**
 * FOOTER.JS - Gerenciador do Footer
 * Calculadoras de Enfermagem
 * 
 * Baseado no código de referência funcional
 * Integra sistema de cookies e botões flutuantes
 */

class FooterManager {
    constructor() {
        console.log('FooterManager: Script carregado. Iniciando...');
        this.init();
    }

    init() {
        // Aguarda carregamento do HTML do footer
        document.addEventListener('componentsLoaded', () => {
            console.log('FooterManager: Evento componentsLoaded recebido. Inicializando componentes...');
            this.initCookieSystem();
            this.initBackToTop();
            this.initFooterConfigBtn();
        });
        
        // Fallback: se componentes já carregados
        if (window.__COMPONENTS_LOADED__) {
            this.initCookieSystem();
            this.initBackToTop();
            this.initFooterConfigBtn();
        }
    }

    // --- Sistema de Cookies ---
    initCookieSystem() {
        const banner = document.getElementById('cookie-banner');
        const overlay = document.getElementById('cookie-overlay');
        const modalContent = document.getElementById('cookie-modal-content');
        const fab = document.getElementById('cookie-fab');
        const checkMkt = document.getElementById('check-mkt');
        const checkStats = document.getElementById('check-stats');

        // Diagnóstico: Se os elementos não existem, avisa no console (provável cache de HTML antigo)
        if (!banner || !overlay) {
            console.warn('FooterManager: Elementos de cookies (banner/overlay) NÃO encontrados. O arquivo assets/components/footer.html pode estar em cache (versão antiga). Dê um Ctrl+F5.');
            return;
        }

        // Exibe o Banner após 0.5s se não houver consentimento
        setTimeout(() => {
            if (!localStorage.getItem('cookiesAccepted')) {
                banner.classList.remove('translate-y-full');
                if (fab) fab.classList.add('opacity-0', 'pointer-events-none');
            } else {
                if (fab) fab.classList.remove('opacity-0', 'pointer-events-none');
            }
        }, 500);

        // Métodos de Controle
        const openModal = () => {
            banner.classList.add('translate-y-full');
            overlay.classList.remove('opacity-0', 'invisible');
            modalContent.classList.remove('translate-y-full');
            if (fab) fab.classList.add('opacity-0', 'pointer-events-none');
            document.body.classList.add('overflow-hidden');
        };

        const closeAll = () => {
            overlay.classList.add('opacity-0', 'invisible');
            modalContent.classList.add('translate-y-full');
            banner.classList.add('translate-y-full');
            document.body.classList.remove('overflow-hidden');
            
            // Reativa o FAB
            setTimeout(() => {
                if (fab) fab.classList.remove('opacity-0', 'pointer-events-none');
            }, 300);

            localStorage.setItem('cookiesAccepted', 'true');
        };

        const toggleDesc = (btn) => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            const icon = btn.querySelector('.fa-chevron-right');
            
            if (targetEl) {
                targetEl.classList.toggle('hidden');
                targetEl.classList.toggle('show');
                
                if (icon) {
                    if (targetEl.classList.contains('show')) icon.style.transform = "rotate(90deg)";
                    else icon.style.transform = "rotate(0deg)";
                }
            }
        };

        // Event Listeners
        const btnAccept = document.getElementById('banner-accept');
        const btnOptions = document.getElementById('banner-options');
        const btnSave = document.getElementById('modal-save');
        const btnReject = document.getElementById('modal-reject-all');
        const btnCloseX = document.getElementById('modal-close-x');
        const descToggles = document.querySelectorAll('.cookie-desc-toggle');

        if (btnAccept) btnAccept.addEventListener('click', () => {
            if (checkMkt) checkMkt.checked = true;
            if (checkStats) checkStats.checked = true;
            closeAll();
        });

        if (btnOptions) btnOptions.addEventListener('click', openModal);
        if (fab) fab.addEventListener('click', openModal);
        
        if (btnSave) btnSave.addEventListener('click', closeAll);
        
        if (btnReject) btnReject.addEventListener('click', () => {
            if (checkMkt) checkMkt.checked = false;
            if (checkStats) checkStats.checked = false;
            closeAll();
        });

        if (btnCloseX) btnCloseX.addEventListener('click', () => {
            overlay.classList.add('opacity-0', 'invisible');
            modalContent.classList.add('translate-y-full');
            document.body.classList.remove('overflow-hidden');
            
            if (!localStorage.getItem('cookiesAccepted')) {
                banner.classList.remove('translate-y-full');
            } else {
                if (fab) fab.classList.remove('opacity-0', 'pointer-events-none');
            }
        });

        descToggles.forEach(btn => {
            btn.addEventListener('click', () => toggleDesc(btn));
        });
        
        // Expor openModal para o botão de Configurações no rodapé
        this.openCookieModal = openModal;
    }

    // --- Botão Voltar ao Topo ---
    initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    initFooterConfigBtn() {
        const configBtn = document.getElementById('footer-config-btn');
        if (configBtn) {
            configBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.openCookieModal) this.openCookieModal();
            });
        } else {
            // Log discreto para não poluir se o botão não for essencial
            // console.log('FooterManager: Botão de configuração do rodapé não encontrado.');
        }
    }
}

// Instanciar automaticamente
const footerManager = new FooterManager();

// Disponibilizar globalmente
window.FooterManager = FooterManager;