/**
 * Footer JavaScript - Consentimento de Cookies Google Analytics/Ads
 * Fundo azul #1A3E74, modal de preferências, accordion funcional
 */

(function() {
    "use strict";

    // ==========================================
    // CONFIGURAÇÕES
    // ==========================================
    const CONFIG = {
        cookieName: "ce_cookie_consent_v8_2025",
        expirationDays: 365,
        analyticsCookieName: "ce_analytics_consent",
        selectors: {
            banner: "cookie-banner",
            overlay: "cookie-overlay",
            modal: "cookie-modal",
            modalContent: "cookie-modal-content",
            backToTop: "backToTop",
            cookieFab: "cookie-fab",
            yearSpan: "current-year",
            toast: "toast-notification"
        },
        scripts: {
            analytics: ["GA_SCRIPT_ID", "GTM_SCRIPT_ID"],
            ads: ["ADS_SCRIPT_ID", "GOOGLE_ADS_ID"]
        }
    };

    // Estado
    const state = {
        modalStack: [],
        lastFocusedElement: null,
        isBannerVisible: false,
        initialized: false,
        consent: {
            necessary: true,
            analytics: false,
            marketing: false
        }
    };

    // ==========================================
    // UTILITÁRIOS
    // ==========================================
    function getCookie(name) {
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        } catch (e) {
            console.warn("[Footer] Cookie bloqueado:", e);
            return null;
        }
    }

    function setCookie(name, value, days) {
        try {
            const d = new Date();
            d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${d.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
        } catch (e) {
            console.warn("[Footer] Erro ao definir cookie:", e);
        }
    }

    function showToast(message) {
        const toast = document.getElementById(CONFIG.selectors.toast);
        if (!toast) return;
        
        const toastMessage = toast.querySelector?.('.toast-message') || toast;
        if (toastMessage) toastMessage.textContent = message;
        
        toast.classList.add('visible');
        
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // ==========================================
    // GOOGLE ANALYTICS/ADS CONSENT MODE
    // ==========================================
    
    /**
     * Configura o consentimento do Google Analytics conforme LGPD
     */
    function setupGoogleAnalyticsConsent() {
        // Configuração inicial de consentimento (deny por padrão)
        if (typeof gtag === 'function') {
            gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'wait_for_update': 500
            });
            console.log('[Footer] Google Analytics consent mode configurado como denied');
        }
    }

    /**
     * Atualiza o consentimento do Google Analytics quando usuário aceita
     */
    function updateGoogleAnalyticsConsent(consentType) {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': consentType === 'all' || consentType === 'analytics' ? 'granted' : 'denied',
                'ad_storage': consentType === 'all' || consentType === 'marketing' ? 'granted' : 'denied',
                'ad_user_data': consentType === 'all' || consentType === 'marketing' ? 'granted' : 'denied',
                'ad_personalization': consentType === 'all' || consentType === 'marketing' ? 'granted' : 'denied'
            });
            console.log('[Footer] Google Analytics consent atualizado:', consentType);
        }
    }

    /**
     * Carrega scripts do Google Analytics se houver consentimento
     */
    function loadAnalyticsScripts(consent) {
        if (!consent.analytics) {
            console.log('[Footer] Analytics não autorizado - scripts não serão carregados');
            return;
        }

        console.log('[Footer] Carregando scripts do Google Analytics...');
        
        // Carregar Google Analytics
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
        document.head.appendChild(gaScript);

        // Carregar Google Tag Manager se necessário
        const gtmScript = document.createElement('script');
        gtmScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
        `;
        document.head.appendChild(gtmScript);

        console.log('[Footer] Scripts do Google Analytics carregados com sucesso');
    }

    /**
     * Remove scripts de analytics quando usuário revoga consentimento
     */
    function removeAnalyticsScripts() {
        console.log('[Footer] Removendo scripts de analytics...');
        
        // Remover scripts do Google Analytics
        const scripts = document.querySelectorAll('script[src*="googletagmanager"], script[src*="google-analytics"]');
        scripts.forEach(script => script.remove());
        
        // Limpar dataLayer
        window.dataLayer = [];
        
        console.log('[Footer] Scripts de analytics removidos');
    }

    /**
     * Verifica e aplica consentimento salvo
     */
    function applyStoredConsent() {
        try {
            const savedConsent = getCookie(CONFIG.cookieName);
            if (savedConsent) {
                const consent = JSON.parse(savedConsent);
                state.consent = consent;
                
                // Atualizar switches na interface
                updateSwitchesState(consent);
                
                // Aplicar consentimento ao Google Analytics
                if (consent.analytics || consent.marketing) {
                    updateGoogleAnalyticsConsent(
                        consent.analytics && consent.marketing ? 'all' : 
                        consent.analytics ? 'analytics' : 'marketing'
                    );
                    loadAnalyticsScripts(consent);
                } else {
                    setupGoogleAnalyticsConsent();
                }
                
                console.log('[Footer] Consentimento aplicado:', consent);
                return true;
            }
        } catch (e) {
            console.warn('[Footer] Erro ao aplicar consentimento salvo:', e);
        }
        return false;
    }

    /**
     * Atualiza o estado visual dos switches baseado no consentimento
     */
    function updateSwitchesState(consent) {
        const analyticsSwitch = document.getElementById('check-analytics');
        const marketingSwitch = document.getElementById('check-marketing');
        
        if (analyticsSwitch) {
            analyticsSwitch.checked = consent.analytics;
            const slider = analyticsSwitch.nextElementSibling;
            if (slider) {
                slider.style.backgroundColor = consent.analytics ? '#1A3E74' : '#ccc';
            }
        }
        
        if (marketingSwitch) {
            marketingSwitch.checked = consent.marketing;
            const slider = marketingSwitch.nextElementSibling;
            if (slider) {
                slider.style.backgroundColor = consent.marketing ? '#1A3E74' : '#ccc';
            }
        }
    }

    // ==========================================
    // GERENCIAMENTO DE UI
    // ==========================================
    function toggleBanner(show) {
        const banner = document.getElementById(CONFIG.selectors.banner);
        const fab = document.getElementById(CONFIG.selectors.cookieFab);
        if (!banner) return;

        state.isBannerVisible = show;

        if (show) {
            banner.classList.remove('hidden');
            banner.classList.add('visible');
            banner.setAttribute('aria-hidden', 'false');
            document.body.classList.add('cookie-banner-open');
            
            if (fab) {
                fab.classList.add('hidden');
                fab.classList.remove('visible');
            }
        } else {
            banner.classList.remove('visible');
            banner.classList.add('hidden');
            banner.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('cookie-banner-open');
            
            const consent = getCookie(CONFIG.cookieName);
            if (consent && fab) {
                fab.classList.remove('hidden');
                fab.classList.add('visible');
            }
        }
    }

    function openModal() {
        const modal = document.getElementById(CONFIG.selectors.modal) ||
                      document.getElementById(CONFIG.selectors.modalContent);
        const overlay = document.getElementById(CONFIG.selectors.overlay);

        if (!modal || !overlay) {
            console.warn('[Footer] Modal não encontrado');
            return;
        }

        state.lastFocusedElement = document.activeElement;
        state.modalStack.push(modal);

        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
        modal.classList.remove('hidden');
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        const banner = document.getElementById(CONFIG.selectors.banner);
        if (banner && banner.classList.contains('visible')) {
            banner.classList.remove('visible');
            banner.classList.add('hidden');
        }
    }

    function openDetailModal(modalId) {
        if (!modalId) return;
        
        const detailModal = document.getElementById(modalId);
        const overlay = document.getElementById(CONFIG.selectors.overlay);

        if (!detailModal || !overlay) {
            console.warn('[Footer] Submodal não encontrado:', modalId);
            return;
        }

        state.lastFocusedElement = document.activeElement;
        state.modalStack.push(detailModal);

        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
        detailModal.classList.remove('hidden');
        detailModal.classList.add('visible');
        detailModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDetailModal(modalId) {
        if (!modalId) return;
        
        const detailModal = document.getElementById(modalId);
        if (!detailModal) return;

        const index = state.modalStack.indexOf(detailModal);
        if (index > -1) {
            state.modalStack.splice(index, 1);
        }

        detailModal.classList.remove('visible');
        detailModal.classList.add('hidden');
        detailModal.setAttribute('aria-hidden', 'true');

        if (state.modalStack.length === 0) {
            const overlay = document.getElementById(CONFIG.selectors.overlay);
            if (overlay) {
                overlay.classList.remove('visible');
                overlay.classList.add('hidden');
            }
            document.body.style.overflow = '';

            const mainModal = document.getElementById(CONFIG.selectors.modal) ||
                             document.getElementById(CONFIG.selectors.modalContent);
            if (mainModal) {
                mainModal.classList.add('visible');
                mainModal.classList.remove('hidden');
                mainModal.setAttribute('aria-hidden', 'false');
                state.modalStack.push(mainModal);
            }

            if (state.lastFocusedElement) {
                state.lastFocusedElement.focus();
            }
        }
    }

    function closeModal() {
        const overlay = document.getElementById(CONFIG.selectors.overlay);
        const banner = document.getElementById(CONFIG.selectors.banner);

        const currentModal = state.modalStack.pop();
        if (currentModal) {
            currentModal.classList.remove('visible');
            currentModal.classList.add('hidden');
            currentModal.setAttribute('aria-hidden', 'true');
        }

        if (state.modalStack.length === 0) {
            if (overlay) {
                overlay.classList.remove('visible');
                overlay.classList.add('hidden');
            }
            document.body.style.overflow = '';

            const hasConsent = getCookie(CONFIG.cookieName);
            if (!hasConsent && state.isBannerVisible && banner) {
                banner.classList.remove('hidden');
                banner.classList.add('visible');
            }

            if (state.lastFocusedElement) {
                state.lastFocusedElement.focus();
            }
        }
    }

    // ==========================================
    // CONSENTIMENTO
    // ==========================================
    function saveConsent(type) {
        let preferences = {};

        if (type === 'all') {
            preferences = { necessary: true, analytics: true, marketing: true };
        } else if (type === 'reject') {
            preferences = { necessary: true, analytics: false, marketing: false };
        } else {
            preferences = {
                necessary: true,
                analytics: document.getElementById('check-analytics')?.checked || false,
                marketing: document.getElementById('check-marketing')?.checked || false
            };
        }

        state.consent = preferences;
        setCookie(CONFIG.cookieName, JSON.stringify(preferences), CONFIG.expirationDays);
        
        try {
            localStorage.setItem(CONFIG.cookieName, JSON.stringify(preferences));
        } catch (e) {
            console.warn('[Footer] localStorage bloqueado:', e);
        }

        // Aplicar consentimento do Google Analytics/Ads
        updateGoogleAnalyticsConsent(
            preferences.analytics && preferences.marketing ? 'all' : 
            preferences.analytics ? 'analytics' : 
            preferences.marketing ? 'marketing' : 'reject'
        );

        // Carregar ou remover scripts baseados no consentimento
        if (preferences.analytics) {
            loadAnalyticsScripts(preferences);
        } else {
            removeAnalyticsScripts();
        }

        showToast('Preferências salvas com sucesso!');

        state.isBannerVisible = false;

        while (state.modalStack.length > 0) {
            const m = state.modalStack.pop();
            if (m) {
                m.classList.remove('visible');
                m.classList.add('hidden');
                m.setAttribute('aria-hidden', 'true');
            }
        }

        const overlay = document.getElementById(CONFIG.selectors.overlay);
        if (overlay) {
            overlay.classList.remove('visible');
            overlay.classList.add('hidden');
        }
        document.body.style.overflow = '';

        toggleBanner(false);

        const fab = document.getElementById(CONFIG.selectors.cookieFab);
        if (fab) {
            fab.classList.remove('hidden');
            fab.classList.add('visible');
        }

        // Disparar evento para outras partes da aplicação
        window.dispatchEvent(new CustomEvent('CookieConsentUpdated', { detail: preferences }));
    }

    // ==========================================
    // EVENT LISTENERS - ACORDEON CORRIGIDO
    // ==========================================
    function setupEventListeners() {
        console.log('[Footer] Configurando event listeners...');

        // Clique no documento
        document.addEventListener('click', function(e) {
            const target = e.target;
            const button = target.closest('button');
            if (!button) return;

            const btnId = button.id;

            // Aceitar todos do banner
            if (btnId === 'cookie-accept-all') {
                saveConsent('all');
                e.preventDefault();
                return;
            }

            // Definições - abre modal de preferências
            if (btnId === 'cookie-settings') {
                openModal();
                e.preventDefault();
                return;
            }

            // Salvar preferências
            if (btnId === 'cookie-save-preferences') {
                saveConsent('custom');
                e.preventDefault();
                return;
            }

            // Fechar modal
            if (btnId === 'cookie-modal-close') {
                closeModal();
                e.preventDefault();
                return;
            }

            // Aceitar todos do modal
            if (btnId === 'cookie-accept-all') {
                saveConsent('all');
                e.preventDefault();
                return;
            }

            // Rejeitar
            if (btnId === 'cookie-reject') {
                saveConsent('reject');
                e.preventDefault();
                return;
            }

            // Rejeitar do modal
            if (btnId === 'cookie-reject-all') {
                saveConsent('reject');
                e.preventDefault();
                return;
            }

            // FAB de cookies
            if (btnId === 'cookie-fab') {
                openModal();
                e.preventDefault();
                return;
            }

            // Voltar ao topo
            if (btnId === 'backToTop') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                e.preventDefault();
                return;
            }

            // Botões de info (submodais)
            const infoBtn = target.closest('.cookie-info-btn');
            if (infoBtn) {
                const modalTarget = infoBtn.getAttribute('data-modal-target');
                if (modalTarget) {
                    state.lastFocusedElement = infoBtn;
                    openDetailModal(modalTarget);
                    e.preventDefault();
                }
                return;
            }

            // Fechar submodal
            const closeBtn = target.closest('.cookie-detail-modal .cookie-modal-close');
            if (closeBtn) {
                const modal = closeBtn.closest('.cookie-detail-modal');
                if (modal && modal.id) {
                    closeDetailModal(modal.id);
                    e.preventDefault();
                }
                return;
            }

            // Voltar no submodal
            const backBtn = target.closest('.cookie-detail-back');
            if (backBtn) {
                const modalTarget = backBtn.getAttribute('data-close');
                if (modalTarget) {
                    closeDetailModal(modalTarget);
                    e.preventDefault();
                }
                return;
            }
        });

        // Clique no overlay fecha modal de detalhe ou modal principal
        const overlay = document.getElementById(CONFIG.selectors.overlay);
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    // Verificar se há um modal de detalhe aberto
                    const topModal = state.modalStack[state.modalStack.length - 1];
                    if (topModal && topModal.classList.contains('cookie-detail-modal')) {
                        // Fechar apenas o modal de detalhe
                        closeDetailModal(topModal.id);
                    } else {
                        // Fechar o modal principal
                        closeModal();
                    }
                }
            });
        }

        // ==========================================
        // ACORDEON DE CATEGORIAS
        // ==========================================
        setupAccordion();
        
        // Prevenir que clique no switch expanda o accordion
        document.querySelectorAll('.cookie-switch').forEach(function(switchEl) {
            switchEl.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
        
        // Switches de cores
        document.querySelectorAll('.cookie-switch input[type="checkbox"]').forEach(function(chk) {
            chk.addEventListener('change', function(e) {
                e.stopPropagation();
                const slider = this.nextElementSibling;
                if (slider) {
                    slider.style.backgroundColor = this.checked ? '#1A3E74' : '#ccc';
                }
            });
        });

        // Scroll para botão topo
        window.addEventListener('scroll', function() {
            const backToTop = document.getElementById(CONFIG.selectors.backToTop);
            if (!backToTop) return;

            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
                backToTop.classList.remove('hidden');
            } else {
                backToTop.classList.remove('visible');
                backToTop.classList.add('hidden');
            }
        });

        // ESC fecha modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && state.modalStack.length > 0) {
                const topModal = state.modalStack[state.modalStack.length - 1];
                if (topModal.classList.contains('cookie-detail-modal')) {
                    const modalId = topModal.id;
                    if (modalId) {
                        closeDetailModal(modalId);
                        return;
                    }
                }
                closeModal();
            }
        });
    }

    // ==========================================
    // FUNÇÃO DO ACORDEON
    // ==========================================
    function setupAccordion() {
        console.log('[Footer] Configurando accordion...');
        
        const headers = document.querySelectorAll('.cookie-category-header');
        console.log('[Footer] Headers encontrados:', headers.length);
        
        if (headers.length === 0) {
            console.warn('[Footer] Nenhum header de categoria encontrado');
            return;
        }
        
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            
            header.onclick = function(e) {
                // Não expandir se clicar no switch ou info-btn
                if (e.target.closest('.cookie-switch') || e.target.closest('.cookie-info-btn')) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                
                const group = this.parentElement;
                if (!group) return;
                
                const isExpanded = group.classList.contains('active');
                
                // Fechar outros accordions (exceto o primeiro que é tecnicamente necessário)
                const allGroups = document.querySelectorAll('.cookie-category, .cookie-category-active');
                for (let j = 0; j < allGroups.length; j++) {
                    if (allGroups[j] !== group) {
                        allGroups[j].classList.remove('active');
                    }
                }
                
                // Toggle do atual
                if (isExpanded) {
                    group.classList.remove('active');
                } else {
                    group.classList.add('active');
                }
            };
            
            // Enter ou Space para accessibility
            header.onkeydown = function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            };
        }
        
        console.log('[Footer] Accordion configurado com', headers.length, 'itens');
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================
    function updateYear() {
        const yearSpan = document.getElementById(CONFIG.selectors.yearSpan);
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    function diagnoseFooter() {
        console.log('[Footer] === DIAGNÓSTICO ===');
        
        const elements = [
            { id: 'cookie-banner', name: 'Banner' },
            { id: 'cookie-overlay', name: 'Overlay' },
            { id: 'cookie-modal', name: 'Modal' },
            { id: 'cookie-fab', name: 'FAB' },
            { id: 'backToTop', name: 'Topo' }
        ];
        
        elements.forEach(function(item) {
            const el = document.getElementById(item.id);
            console.log('[Footer]', item.name + ':', el ? 'OK' : 'FALTA');
        });
        
        const categories = document.querySelectorAll('.cookie-category');
        console.log('[Footer] Categorias:', categories.length);
        
        const headers = document.querySelectorAll('.cookie-category-header');
        console.log('[Footer] Headers accordion:', headers.length);
        
        // Verificar consentimento do Google Analytics
        if (typeof gtag !== 'undefined') {
            console.log('[Footer] Google Analytics detectado');
        }
        
        console.log('[Footer] === FIM ===');
    }

    function initFooter() {
        if (state.initialized) return;

        console.log('[Footer] Iniciando...');

        // Verificar se elementos existem
        const hasFooter = document.querySelector('.footer-content') ||
                          document.querySelector('.footer-brand-section') ||
                          document.getElementById('footer');

        if (!hasFooter) {
            console.warn('[Footer] Footer não encontrado');
            return;
        }

        // Configurar Google Analytics Consent Mode
        setupGoogleAnalyticsConsent();

        // Verificar consentimento salvo
        const savedConsent = getCookie(CONFIG.cookieName);
        console.log('[Footer] Consentimento salvo:', savedConsent);

        // Aplicar consentimento salvo se existir
        const hasStoredConsent = applyStoredConsent();

        state.initialized = true;
        updateYear();
        setupEventListeners();

        setTimeout(diagnoseFooter, 1000);

        // Para fins de teste - remova esta linha em produção
        const testMode = false; // Mude para true para forçar exibição do banner

        if (!hasStoredConsent || testMode) {
            console.log('[Footer] Mostrando banner...');
            setTimeout(function() {
                toggleBanner(true);
                console.log('[Footer] Banner deve estar visível agora');
                // Expor função para teste via console
                window.showCookieBanner = function() { toggleBanner(true); };
                window.hideCookieBanner = function() { toggleBanner(false); };
            }, 500);
        } else {
            console.log('[Footer] Mostrando FAB...');
            const fab = document.getElementById(CONFIG.selectors.cookieFab);
            if (fab) {
                fab.classList.remove('hidden');
                fab.classList.add('visible');
            }
        }
    }

    // ==========================================
    // EXECUÇÃO
    // ==========================================
    window.addEventListener('Module:footer-container:Ready', initFooter);
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initFooter, 100);
        });
    } else {
        setTimeout(initFooter, 100);
    }

})();
