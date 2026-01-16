/**
 * Footer JavaScript - VERSÃO CORRIGIDA
 * Consentimento de Cookies Google Analytics/Ads
 * Modais com estilos de sombreamento nos botões fechar
 * Conteúdo com apenas letras iniciais maiúsculas
 * Array com expansão e retração
 * Botões voltar, salvar preferências, concordar com tudo e rejeitar não-essenciais
 * Integração com EventBus para comunicação entre módulos
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

    // ==========================================
    // ESTADO
    // ==========================================
    const state = {
        modalStack: [],
        lastFocusedElement: null,
        isBannerVisible: false,
        initialized: false,
        eventBusReady: false,
        consent: {
            necessary: true,
            analytics: false,
            marketing: false
        },
        expandedCategories: {}
    };

    // ==========================================
    // EVENTBUS INTEGRATION
    // ==========================================
    function setupFooterEventBusIntegration() {
        if (!window.EventBus) {
            window.addEventListener('eventbus:ready', function onEventBusReady() {
                window.removeEventListener('eventbus:ready', onEventBusReady);
                registerFooterEventBusListeners();
                state.eventBusReady = true;
                console.log('[Footer] EventBus integration activated');
            });
        } else {
            registerFooterEventBusListeners();
            state.eventBusReady = true;
        }
    }

    function registerFooterEventBusListeners() {
        if (!window.EventBus) return;

        // Escutar eventos de theme para sincronização
        window.EventBus.on('theme:changed', function(data) {
            console.log('[Footer] Tema alterado detectado via EventBus:', data.theme);
        }, { module: 'footer' });

        // Escutar eventos de accessibility
        window.EventBus.on('accessibility:settings:changed', function(data) {
            console.log('[Footer] Configurações de acessibilidade alteradas via EventBus');
        }, { module: 'footer' });
    }

    function emitFooterEvent(eventName, data) {
        const eventData = {
            ...data,
            source: 'footer',
            timestamp: Date.now()
        };

        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('footer:' + eventName, eventData);
        }

        window.dispatchEvent(new CustomEvent('footer:' + eventName, {
            detail: eventData
        }));
    }

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
    function setupGoogleAnalyticsConsent() {
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

    // ==========================================
    // GERENCIAMENTO DE MODAIS
    // ==========================================
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById(CONFIG.selectors.overlay);
        
        if (!modal) return;

        state.lastFocusedElement = document.activeElement;
        state.modalStack.push(modalId);

        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.setAttribute('aria-hidden', 'false');
        }

        // Focar no primeiro elemento focável
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();

        // Capturar tecla Escape
        document.addEventListener('keydown', handleEscapeKey);
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById(CONFIG.selectors.overlay);
        
        if (!modal) return;

        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');

        state.modalStack = state.modalStack.filter(id => id !== modalId);

        if (state.modalStack.length === 0 && overlay) {
            overlay.classList.add('hidden');
            overlay.setAttribute('aria-hidden', 'true');
            document.removeEventListener('keydown', handleEscapeKey);
        }

        // Restaurar foco
        if (state.lastFocusedElement) {
            state.lastFocusedElement.focus();
        }
    }

    function handleEscapeKey(e) {
        if (e.key === 'Escape' && state.modalStack.length > 0) {
            const topModal = state.modalStack[state.modalStack.length - 1];
            closeModal(topModal);
        }
    }

    // ==========================================
    // BANNER DE COOKIES
    // ==========================================
    function showCookieBanner() {
        const banner = document.getElementById(CONFIG.selectors.banner);
        if (!banner) return;

        banner.classList.remove('hidden');
        banner.setAttribute('aria-hidden', 'false');
        state.isBannerVisible = true;
    }

    function hideCookieBanner() {
        const banner = document.getElementById(CONFIG.selectors.banner);
        if (!banner) return;

        banner.classList.add('hidden');
        banner.setAttribute('aria-hidden', 'true');
        state.isBannerVisible = false;
    }

    function initCookieBanner() {
        const banner = document.getElementById(CONFIG.selectors.banner);
        if (!banner) return;

        const acceptAllBtn = banner.querySelector('#cookie-accept-all');
        const rejectAllBtn = banner.querySelector('#cookie-reject-all');
        const settingsBtn = banner.querySelector('#cookie-settings');

        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', function(e) {
                e.preventDefault();
                acceptAllCookies();
            });
        }

        if (rejectAllBtn) {
            rejectAllBtn.addEventListener('click', function(e) {
                e.preventDefault();
                rejectNonEssentialCookies();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                hideCookieBanner();
                openModal(CONFIG.selectors.modal);
            });
        }

        // Verificar se já tem consentimento
        const existingConsent = getCookie(CONFIG.cookieName);
        if (!existingConsent) {
            showCookieBanner();
        }
    }

    // ==========================================
    // MODAL DE PREFERÊNCIAS
    // ==========================================
    function initCookieModal() {
        const modal = document.getElementById(CONFIG.selectors.modal);
        if (!modal) return;

        // Botão fechar com sombreamento
        const closeBtn = modal.querySelector('#cookie-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                closeModal(CONFIG.selectors.modal);
                showCookieBanner();
            });
            // Adicionar classe de sombreamento
            closeBtn.classList.add('modal-close-btn-shadow');
        }

        // Botão voltar
        const backBtn = modal.querySelector('[data-action="back"]');
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                closeModal(CONFIG.selectors.modal);
                showCookieBanner();
            });
        }

        // Botão salvar preferências
        const saveBtn = modal.querySelector('[data-action="save"]');
        if (saveBtn) {
            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                savePreferences();
            });
        }

        // Botão concordar com tudo
        const agreeAllBtn = modal.querySelector('[data-action="agree-all"]');
        if (agreeAllBtn) {
            agreeAllBtn.addEventListener('click', function(e) {
                e.preventDefault();
                acceptAllCookies();
            });
        }

        // Botão rejeitar não-essenciais
        const rejectNonEssentialBtn = modal.querySelector('[data-action="reject-non-essential"]');
        if (rejectNonEssentialBtn) {
            rejectNonEssentialBtn.addEventListener('click', function(e) {
                e.preventDefault();
                rejectNonEssentialCookies();
            });
        }

        // Configurar categorias expansíveis
        setupCookieCategories();
    }

    // ==========================================
    // CATEGORIAS DE COOKIES EXPANSÍVEIS
    // ==========================================
    function setupCookieCategories() {
        const categories = document.querySelectorAll('.cookie-category');
        
        categories.forEach(category => {
            const header = category.querySelector('.cookie-category-header');
            const servicesList = category.querySelector('.cookie-services-list');
            
            if (header && servicesList) {
                header.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCategoryExpansion(category);
                });

                // Acessibilidade com teclado
                header.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleCategoryExpansion(category);
                    }
                });
            }

            // Configurar toggle de categoria
            const toggle = category.querySelector('.cookie-switch input');
            if (toggle) {
                toggle.addEventListener('change', function(e) {
                    const categoryName = category.getAttribute('data-category');
                    state.consent[categoryName] = this.checked;
                });
            }
        });
    }

    function toggleCategoryExpansion(category) {
        const isExpanded = category.classList.contains('expanded');
        
        if (isExpanded) {
            category.classList.remove('expanded');
            category.setAttribute('aria-expanded', 'false');
        } else {
            category.classList.add('expanded');
            category.setAttribute('aria-expanded', 'true');
        }
    }

    // ==========================================
    // AÇÕES DE CONSENTIMENTO
    // ==========================================
    function acceptAllCookies() {
        state.consent = {
            necessary: true,
            analytics: true,
            marketing: true
        };

        setCookie(CONFIG.cookieName, 'all', CONFIG.expirationDays);
        updateGoogleAnalyticsConsent('all');
        hideCookieBanner();
        closeModal(CONFIG.selectors.modal);
        showToast('Preferências salvas com sucesso!');
        emitFooterEvent('consent:updated', { consent: state.consent });
    }

    function rejectNonEssentialCookies() {
        state.consent = {
            necessary: true,
            analytics: false,
            marketing: false
        };

        setCookie(CONFIG.cookieName, 'necessary', CONFIG.expirationDays);
        updateGoogleAnalyticsConsent('necessary');
        hideCookieBanner();
        closeModal(CONFIG.selectors.modal);
        showToast('Preferências salvas com sucesso!');
        emitFooterEvent('consent:updated', { consent: state.consent });
    }

    function savePreferences() {
        const consentString = JSON.stringify(state.consent);
        setCookie(CONFIG.cookieName, consentString, CONFIG.expirationDays);
        updateGoogleAnalyticsConsent(state.consent.analytics ? 'analytics' : 'necessary');
        closeModal(CONFIG.selectors.modal);
        showToast('Preferências salvas com sucesso!');
        emitFooterEvent('consent:updated', { consent: state.consent });
    }

    // ==========================================
    // INICIALIZAÇÃO PRINCIPAL
    // ==========================================
    function initFooter() {
        if (state.initialized) return;

        console.log('[Footer] Iniciando módulo de footer');

        // Configurar Google Analytics
        setupGoogleAnalyticsConsent();

        // Inicializar EventBus
        setupFooterEventBusIntegration();

        // Inicializar componentes
        initCookieBanner();
        initCookieModal();

        state.initialized = true;

        console.log('[Footer] Módulo de footer inicializado com sucesso');
    }

    // ==========================================
    // AUTO-INICIALIZAÇÃO
    // ==========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooter);
    } else {
        initFooter();
    }

    // Expor API pública
    window.FooterModule = {
        init: initFooter,
        openModal: openModal,
        closeModal: closeModal,
        acceptAllCookies: acceptAllCookies,
        rejectNonEssentialCookies: rejectNonEssentialCookies,
        savePreferences: savePreferences,
        state: state
    };
})();
