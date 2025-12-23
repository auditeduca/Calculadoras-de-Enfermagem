/**
 * SISTEMA GESTOR DE FOOTER, PRIVACIDADE E INTERAÇÃO (2025)
 * ---------------------------------------------------------
 * Resolve: Banner de Cookies, Modal de Preferências, FABs Dinâmicos.
 * Refatorado para usar classes CSS customizadas (sem dependência de Tailwind).
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. MAPEAMENTO DE ELEMENTOS (IDs baseados no seu HTML)
    const ui = {
        banner: document.getElementById('cookie-banner'),
        overlay: document.getElementById('cookie-overlay'),
        modal: document.getElementById('cookie-modal-content'),
        backToTop: document.getElementById('backToTop'),
        cookieFab: document.getElementById('cookie-fab'),
        yearSpan: document.getElementById('current-year'),
        // Checkboxes de consentimento (Marketing e AdSense)
        statsCheck: document.getElementById('check-stats'),
        adsCheck: document.getElementById('check-adsense')
    };

    const CONSENT_KEY = 'ce_cookie_consent_v4_2025';
    let lastFocusedElement;

    /**
     * FUNÇÃO: ATUALIZAR POSIÇÃO DOS BOTÕES (FABs)
     * Garante que os botões flutuantes subam dinamicamente para não cobrir o banner.
     */
    const updateFabsPosition = () => {
        if (!ui.banner) return;

        // Verifica se o banner está visível através da classe 'visible'
        const isVisible = ui.banner.classList.contains('visible');
        if (isVisible) {
            const height = ui.banner.offsetHeight;
            document.documentElement.style.setProperty('--banner-height', `${height}px`);
            document.body.classList.add('fabs-above-banner');
        } else {
            document.body.classList.remove('fabs-above-banner');
            document.documentElement.style.setProperty('--banner-height', '0px');
        }
    };

    /**
     * FUNÇÃO: CONTROLE DO BANNER
     */
    const showBanner = () => {
        if (ui.banner) {
            ui.banner.classList.remove('hidden');
            ui.banner.classList.add('visible');
            updateFabsPosition();
        }
    };

    const hideBanner = () => {
        if (ui.banner) {
            ui.banner.classList.remove('visible');
            ui.banner.classList.add('hidden');
            updateFabsPosition();
        }
    };

    /**
     * FUNÇÃO: PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
     */
    const saveConsent = (acceptAll = false) => {
        const preferences = {
            date: new Date().toISOString(),
            version: '4.2',
            analytics: acceptAll ? true : (ui.statsCheck?.checked || false),
            adsense: acceptAll ? true : (ui.adsCheck?.checked || false)
        };

        localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
        hideBanner();
        
        // Dispara evento para outros scripts (ex: inicializar GTM/Ads após consentimento)
        window.dispatchEvent(new CustomEvent('consentUpdated', { detail: preferences }));
    };

    const checkExistingConsent = () => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            // Delay para uma experiência de usuário menos intrusiva
            setTimeout(showBanner, 1500);
        }
    };

    /**
     * FUNÇÃO: MODAL DE CONFIGURAÇÕES (Preferências de Privacidade)
     */
    const openModal = () => {
        if (!ui.overlay || !ui.modal) return;

        lastFocusedElement = document.activeElement;
        
        // Sincroniza os toggles com o estado salvo no LocalStorage
        const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || '{}');
        if (ui.statsCheck) ui.statsCheck.checked = saved.analytics || false;
        if (ui.adsCheck) ui.adsCheck.checked = saved.adsense || false;

        // Mostrar overlay e modal
        ui.overlay.classList.remove('hidden');
        ui.overlay.classList.add('visible');
        ui.modal.classList.remove('hidden');
        ui.modal.classList.add('visible');
        
        // Previne scroll da página principal com o modal aberto
        document.body.classList.add('modal-open');

        // Acessibilidade: focar no botão de fechar ou primeiro elemento
        setTimeout(() => ui.modal.querySelector('button')?.focus(), 300);
    };

    const closeModal = () => {
        if (!ui.overlay || !ui.modal) return;

        ui.overlay.classList.remove('visible');
        ui.overlay.classList.add('hidden');
        ui.modal.classList.remove('visible');
        ui.modal.classList.add('hidden');
        document.body.classList.remove('modal-open');

        setTimeout(() => {
            lastFocusedElement?.focus();
        }, 300);
    };

    /**
     * FUNÇÃO: CONTROLE DO BOTÃO VOLTAR AO TOPO
     */
    const updateBackToTopVisibility = () => {
        if (!ui.backToTop) return;

        if (window.scrollY > 400) {
            ui.backToTop.classList.remove('hidden');
            ui.backToTop.classList.add('visible');
        } else {
            ui.backToTop.classList.add('hidden');
            ui.backToTop.classList.remove('visible');
        }
    };

    /**
     * EVENTOS DE INTERAÇÃO
     */

    // 1. Botão Voltar ao Topo (Scroll Progressivo)
    window.addEventListener('scroll', updateBackToTopVisibility);

    ui.backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 2. Banner Actions
    document.getElementById('banner-accept')?.addEventListener('click', () => saveConsent(true));
    document.getElementById('banner-options')?.addEventListener('click', openModal);

    // 3. FAB de Cookies
    ui.cookieFab?.addEventListener('click', openModal);

    // 4. Modal Actions
    document.getElementById('modal-close-x')?.addEventListener('click', closeModal);
    
    // Fechar ao clicar fora do modal (overlay)
    ui.overlay?.addEventListener('click', (e) => {
        if (e.target === ui.overlay) closeModal();
    });

    document.getElementById('modal-save')?.addEventListener('click', () => {
        saveConsent(false);
        closeModal();
    });

    document.getElementById('modal-reject-all')?.addEventListener('click', () => {
        if (ui.statsCheck) ui.statsCheck.checked = false;
        if (ui.adsCheck) ui.adsCheck.checked = false;
        saveConsent(false);
        closeModal();
    });

    // 5. Accordion / Detalhes Técnicos (Toggle)
    document.querySelectorAll('.cookie-desc-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                const isHidden = target.classList.contains('hidden');
                target.classList.toggle('hidden');
                
                // Animação do ícone de seta (Chevron)
                const icon = btn.querySelector('i.fa-chevron-down');
                if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                btn.setAttribute('aria-expanded', !isHidden);
            }
        });
    });

    // 6. Acessibilidade (Tecla Esc para fechar modal)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && ui.overlay && ui.overlay.classList.contains('visible')) {
            closeModal();
        }
    });

    // 7. Inicialização (Ano e Verificação de Consentimento)
    if (ui.yearSpan) ui.yearSpan.textContent = new Date().getFullYear();
    
    window.addEventListener('resize', updateFabsPosition);
    
    // Inicializar visibilidade do botão voltar ao topo
    updateBackToTopVisibility();
    
    // Inicia o processo de verificação de consentimento
    checkExistingConsent();
});
