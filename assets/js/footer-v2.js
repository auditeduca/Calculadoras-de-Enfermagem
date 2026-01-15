/**
 * Footer JavaScript - Consentimento de Cookies Google Analytics/Ads
 * Fundo azul #1A3E74, modal de preferências, accordion funcional
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
        }
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
            // O footer não precisa reagir a mudanças de tema diretamente
        }, { module: 'footer' });

        // Escutar eventos de accessibility
        window.EventBus.on('accessibility:settings:changed', function(data) {
            console.log('[Footer] Configurações de acessibilidade alteradas via EventBus');
            // O footer pode ajustar UI se necessário
        }, { module: 'footer' });
    }

    function emitFooterEvent(eventName, data) {
        const eventData = {
            ...data,
            source: 'footer',
            timestamp: Date.now()
        };

        // Emitir via EventBus
        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('footer:' + eventName, eventData);
        }

        // Manter compatibilidade com CustomEvents legados
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
    function loadAnalyticsScripts(consent) {
        if (!consent.analytics) {
            console.log('[Footer] Analytics não autorizado - scripts não serão carregados');
            return;
        }
        console.log('[Footer] Carregando scripts do Google Analytics...');
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
        document.head.appendChild(gaScript);
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
    function removeAnalyticsScripts() {
        console.log('[Footer] Removendo scripts de analytics...');
        const scripts = document.querySelectorAll('script[src*="googletagmanager"], script[src*="google-analytics"]');
        scripts.forEach(script => script.remove());
        window.dataLayer = [];
        console.log('[Footer] Scripts de analytics removidos');
    }
    function applyStoredConsent() {
        try {
            const savedConsent = getCookie(CONFIG.cookieName);
            if (savedConsent) {
                const consent = JSON.parse(savedConsent);
                state.consent = consent;
                updateSwitchesState(consent);
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
    function updateSwitchesState(consent) {
        const analyticsSwitch = document.getElementById('cookie-analytics');
        const marketingSwitch = document.getElementById('cookie-marketing');
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
                analytics: document.getElementById('cookie-analytics')?.checked || false,
                marketing: document.getElementById('cookie-marketing')?.checked || false
            };
        }
        state.consent = preferences;
        setCookie(CONFIG.cookieName, JSON.stringify(preferences), CONFIG.expirationDays);
        try {
            localStorage.setItem(CONFIG.cookieName, JSON.stringify(preferences));
        } catch (e) {
            console.warn('[Footer] localStorage bloqueado:', e);
        }
        updateGoogleAnalyticsConsent(
            preferences.analytics && preferences.marketing ? 'all' : 
            preferences.analytics ? 'analytics' : 
            preferences.marketing ? 'marketing' : 'reject'
        );
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
        
        // Emitir evento de atualização de consentimento via EventBus
        emitFooterEvent('consent:updated', preferences);
        
        window.dispatchEvent(new CustomEvent('CookieConsentUpdated', { detail: preferences }));
    }
    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    function setupEventListeners() {
        console.log('[Footer] Configurando event listeners...');
        document.addEventListener('click', function(e) {
            const target = e.target;
            const button = target.closest('button');
            if (!button) return;
            const btnId = button.id;
            if (btnId === 'cookie-accept-all') {
                saveConsent('all');
                e.preventDefault();
                return;
            }
            if (btnId === 'cookie-settings') {
                openModal();
                e.preventDefault();
                return;
            }
            if (btnId === 'cookie-save-preferences') {
                saveConsent('custom');
                e.preventDefault();
                return;
            }
            if (btnId === 'cookie-modal-close') {
                closeModal();
                e.preventDefault();
                return;
            }
            if (btnId === 'cookie-reject') {
                saveConsent('reject');
                e.preventDefault();
                return;
            }
            if (btnId === 'cookie-reject-all') {
                saveConsent('reject');
                e.preventDefault();
                return;
            }
            if (btnId === 'cookie-fab') {
                openModal();
                e.preventDefault();
                return;
            }
            if (btnId === 'backToTop') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                e.preventDefault();
                return;
            }
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
            const closeBtn = target.closest('.cookie-detail-modal .cookie-modal-close');
            if (closeBtn) {
                const modal = closeBtn.closest('.cookie-detail-modal');
                if (modal && modal.id) {
                    closeDetailModal(modal.id);
                    e.preventDefault();
                }
                return;
            }
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
        const overlay = document.getElementById(CONFIG.selectors.overlay);
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    const topModal = state.modalStack[state.modalStack.length - 1];
                    if (topModal && topModal.classList.contains('cookie-detail-modal')) {
                        closeDetailModal(topModal.id);
                    } else {
                        closeModal();
                    }
                }
            });
        }
        setupAccordion();
        document.querySelectorAll('.cookie-switch').forEach(function(switchEl) {
            switchEl.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
        document.querySelectorAll('.cookie-switch input[type="checkbox"]').forEach(function(chk) {
            chk.addEventListener('change', function(e) {
                e.stopPropagation();
                const slider = this.nextElementSibling;
                if (slider) {
                    slider.style.backgroundColor = this.checked ? '#1A3E74' : '#ccc';
                }
            });
        });
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
                if (e.target.closest('.cookie-switch') || e.target.closest('.cookie-info-btn')) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                const group = this.parentElement;
                if (!group) return;
                const isExpanded = group.classList.contains('active');
                const allGroups = document.querySelectorAll('.cookie-category, .cookie-category-active');
                for (let j = 0; j < allGroups.length; j++) {
                    if (allGroups[j] !== group) {
                        allGroups[j].classList.remove('active');
                    }
                }
                if (isExpanded) {
                    group.classList.remove('active');
                } else {
                    group.classList.add('active');
                }
            };
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
        if (typeof gtag !== 'undefined') {
            console.log('[Footer] Google Analytics detectado');
        }
        console.log('[Footer] === FIM ===');
    }
    function initFooter() {
        if (state.initialized) return;
        console.log('[Footer] Iniciando...');

        // Aguardar footer ser carregado
        const hasFooter = document.querySelector('.footer-content') ||
                          document.querySelector('.footer-brand-section') ||
                          document.getElementById('footer');
        if (!hasFooter) {
            console.warn('[Footer] Footer não encontrado, tentando novamente em 200ms...');
            setTimeout(initFooter, 200);
            return;
        }

        console.log('[Footer] Elementos do footer encontrados');

        // Iniciar integração com EventBus
        setupFooterEventBusIntegration();

        setupGoogleAnalyticsConsent();
        const savedConsent = getCookie(CONFIG.cookieName);
        console.log('[Footer] Consentimento salvo no cookie:', savedConsent);

        const hasStoredConsent = applyStoredConsent();
        state.initialized = true;
        updateYear();
        setupEventListeners();
        setTimeout(diagnoseFooter, 1000);

        // Expor funções globalmente
        window.showCookieBanner = function() { toggleBanner(true); };
        window.hideCookieBanner = function() { toggleBanner(false); };
        window.openCookieSettings = function() { openModal(); };

        // Emitir evento de ready via EventBus
        emitFooterEvent('ready', { initialized: true });

        const testMode = false;
        if (!hasStoredConsent || testMode) {
            console.log('[Footer] Mostrando banner...');
            setTimeout(function() {
                toggleBanner(true);
                console.log('[Footer] Banner deve estar visível agora');

                // Debug: verificar se banner está visível
                const banner = document.getElementById('cookie-banner');
                console.log('[Footer] Banner classes:', banner?.className);
                console.log('[Footer] Banner display:', window.getComputedStyle(banner).display);
                console.log('[Footer] Banner transform:', window.getComputedStyle(banner).transform);
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
    // Tentar iniciar imediatamente, com retry
    function tryInitFooter() {
        if (state.initialized) return;

        const hasFooter = document.querySelector('.footer-content') ||
                          document.querySelector('.footer-brand-section') ||
                          document.getElementById('footer');

        if (hasFooter) {
            initFooter();
        } else {
            // Aguardar o evento customizado ou DOM ready
            console.log('[Footer] Aguardando footer ser carregado...');
        }
    }

    // Escutar evento customizado de pronto do footer
    window.addEventListener('Module:footer-container:Ready', initFooter);

    // Tentar inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(tryInitFooter, 50);
        });
    } else {
        // DOM já carregado, tentar imediatamente
        setTimeout(tryInitFooter, 50);
    }
})();
