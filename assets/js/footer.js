/**
 * FOOTER.JS - REFATORADO PARA CARREGAMENTO DINÂMICO
 * Solução: Não depende mais apenas de DOMContentLoaded, mas responde à inicialização.
 */

(function() {
    // --- Funções Auxiliares Internas ---
    const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // --- Lógica Principal ---
    function initFooterLogic() {
        console.log('[Footer] Inicializando lógica...');

        const ui = {
            banner: document.getElementById('cookie-overlay'),
            fab: document.getElementById('cookie-fab'),
            yearSpan: document.getElementById('current-year'),
            backToTop: document.getElementById('backToTop'),
            modalContent: document.getElementById('cookie-modal-content'),
            acceptBtn: document.getElementById('accept-cookies'),
            rejectBtn: document.getElementById('reject-cookies'),
            saveBtn: document.getElementById('save-preferences'),
            closeBtn: document.getElementById('close-cookie-modal'), // Pode não existir em todos os layouts
            statsCheck: document.getElementById('marketing-cookies'),
            adsCheck: document.getElementById('adsense-cookies'),
            detailsBtn: document.getElementById('cookie-details-btn'),
            detailsPanel: document.getElementById('cookie-details-panel')
        };

        // Verificação de Segurança: Se os elementos principais não existem, aborta.
        // Isso evita erros se o HTML ainda não foi injetado.
        if (!ui.fab && !ui.banner) {
            console.warn('[Footer] Elementos de UI não encontrados. HTML injetado?');
            return;
        }

        const CONSENT_KEY = 'nurse_calc_consent_v1';

        // --- 1. GESTÃO DE COOKIES ---
        const showBanner = () => {
            if (!ui.banner) return;
            ui.banner.classList.remove('invisible', 'opacity-0');
            ui.banner.setAttribute('aria-hidden', 'false');
            
            // Animação de entrada
            if(ui.modalContent) {
                ui.modalContent.classList.remove('translate-y-full');
            }
        };

        const hideBanner = () => {
            if (!ui.banner) return;
            if(ui.modalContent) {
                ui.modalContent.classList.add('translate-y-full');
            }
            
            setTimeout(() => {
                ui.banner.classList.add('invisible', 'opacity-0');
                ui.banner.setAttribute('aria-hidden', 'true');
            }, 300);
        };

        // Handlers de Cookies
        const saveConsent = (prefs) => {
            localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
            window.dispatchEvent(new CustomEvent('consentUpdated', { detail: prefs }));
            hideBanner();
        };

        if (ui.acceptBtn) {
            ui.acceptBtn.addEventListener('click', () => saveConsent({ necessary: true, marketing: true, adsense: true }));
        }

        if (ui.rejectBtn) {
            ui.rejectBtn.addEventListener('click', () => saveConsent({ necessary: true, marketing: false, adsense: false }));
        }
        
        if (ui.saveBtn) {
            ui.saveBtn.addEventListener('click', () => {
                saveConsent({
                    necessary: true,
                    marketing: ui.statsCheck ? ui.statsCheck.checked : false,
                    adsense: ui.adsCheck ? ui.adsCheck.checked : false
                });
            });
        }

        if (ui.fab) {
            ui.fab.addEventListener('click', showBanner);
        }

        if (ui.closeBtn) {
            ui.closeBtn.addEventListener('click', hideBanner);
        }

        // Toggle Detalhes
        if (ui.detailsBtn && ui.detailsPanel) {
            ui.detailsBtn.addEventListener('click', () => {
                const isHidden = ui.detailsPanel.classList.contains('hidden');
                if (isHidden) {
                    ui.detailsPanel.classList.remove('hidden');
                    ui.detailsBtn.textContent = 'Ocultar Detalhes';
                } else {
                    ui.detailsPanel.classList.add('hidden');
                    ui.detailsBtn.textContent = 'Personalizar Preferências';
                }
            });
        }

        // --- 2. BACK TO TOP ---
        const handleScroll = throttle(() => {
            if (!ui.backToTop) return;
            if (window.scrollY > 300) {
                ui.backToTop.classList.remove('opacity-0', 'pointer-events-none');
                ui.backToTop.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                ui.backToTop.classList.add('opacity-0', 'pointer-events-none');
                ui.backToTop.classList.remove('opacity-100', 'pointer-events-auto');
            }
        }, 200);

        window.addEventListener('scroll', handleScroll);

        if (ui.backToTop) {
            ui.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // --- 3. INICIALIZAÇÃO DE ESTADO ---
        if (ui.yearSpan) {
            ui.yearSpan.textContent = new Date().getFullYear();
        }

        // Checar consentimento salvo
        const saved = localStorage.getItem(CONSENT_KEY);
        if (!saved) {
            setTimeout(showBanner, 1500); // Pequeno delay para UX
        } else {
            // Se já tem salvo, restaura checkboxes
            try {
                const prefs = JSON.parse(saved);
                if (ui.statsCheck) ui.statsCheck.checked = prefs.marketing;
                if (ui.adsCheck) ui.adsCheck.checked = prefs.adsense;
            } catch (e) {
                console.error('Erro ao ler consentimento', e);
            }
        }
    }

    // --- MECANISMO DE BOOTSTRAP HÍBRIDO ---
    // Tenta rodar se o evento customizado disparar OU se o DOM já estiver pronto
    
    // 1. Ouve o evento do Template Engine
    window.addEventListener('components:loaded', initFooterLogic);

    // 2. Fallback: Se o script for carregado DEPOIS do evento (raro, mas possível),
    // verifica se o elemento chave já existe no DOM.
    if (document.getElementById('cookie-fab') || document.readyState === 'complete') {
        initFooterLogic();
    }

})();