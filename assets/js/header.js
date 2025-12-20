/**
 * HEADER.JS - Lógica Completa do Header Modular
 * 
 * Funcionalidades:
 * - Skip links funcionais (topo, conteúdo, rodapé)
 * - Menu hambúrguer expandindo corretamente
 * - Mega-menus com fundo padronizado
 * - Borda azul nas extremidades das imagens
 * - Detecção de idioma ativo
 * - Integração com Google Analytics, GTM e AdSense
 * - Modal de cookies com comunicação Google
 * - Modularidade preservada
 */

// ============================================================================
// 1. CONFIGURAÇÕES GLOBAIS E DETECÇÃO DE IDIOMA
// ============================================================================

const AppConfig = {
    // Detecção de idioma ativo
    currentLanguage: function() {
        // Tenta obter do atributo lang do HTML
        const htmlLang = document.documentElement.lang;
        if (htmlLang) return htmlLang.split('-')[0];
        
        // Fallback para localStorage
        const saved = localStorage.getItem('language');
        if (saved) return saved;
        
        // Fallback para URL params
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        if (langParam) return langParam.split('-')[0];
        
        // Fallback para navigator
        const navLang = navigator.language || navigator.userLanguage;
        return navLang.split('-')[0];
    },
    
    // Dicionário de textos por idioma
    i18n: {
        pt: {
            skipToContent: 'Pular para o conteúdo',
            skipToTop: 'Voltar ao topo',
            skipToFooter: 'Ir para o rodapé',
            cookieTitle: 'Preferências de Cookies',
            cookieMessage: 'Utilizamos cookies para melhorar sua experiência.',
            cookieAccept: 'Aceitar',
            cookieReject: 'Rejeitar',
            cookieSettings: 'Configurações'
        },
        en: {
            skipToContent: 'Skip to content',
            skipToTop: 'Back to top',
            skipToFooter: 'Go to footer',
            cookieTitle: 'Cookie Preferences',
            cookieMessage: 'We use cookies to improve your experience.',
            cookieAccept: 'Accept',
            cookieReject: 'Reject',
            cookieSettings: 'Settings'
        },
        es: {
            skipToContent: 'Saltar al contenido',
            skipToTop: 'Volver al inicio',
            skipToFooter: 'Ir al pie de página',
            cookieTitle: 'Preferencias de Cookies',
            cookieMessage: 'Utilizamos cookies para mejorar su experiencia.',
            cookieAccept: 'Aceptar',
            cookieReject: 'Rechazar',
            cookieSettings: 'Configuración'
        },
        fr: {
            skipToContent: 'Aller au contenu',
            skipToTop: 'Retour au début',
            skipToFooter: 'Aller au pied de page',
            cookieTitle: 'Préférences de cookies',
            cookieMessage: 'Nous utilisons des cookies pour améliorer votre expérience.',
            cookieAccept: 'Accepter',
            cookieReject: 'Rejeter',
            cookieSettings: 'Paramètres'
        },
        de: {
            skipToContent: 'Zum Inhalt springen',
            skipToTop: 'Zurück nach oben',
            skipToFooter: 'Zur Fußzeile',
            cookieTitle: 'Cookie-Einstellungen',
            cookieMessage: 'Wir verwenden Cookies, um Ihr Erlebnis zu verbessern.',
            cookieAccept: 'Akzeptieren',
            cookieReject: 'Ablehnen',
            cookieSettings: 'Einstellungen'
        }
    },
    
    // Obter texto traduzido
    getText: function(key) {
        const lang = this.currentLanguage();
        return (this.i18n[lang] || this.i18n.pt)[key] || key;
    },
    
    // Google Analytics ID (placeholder)
    GA_ID: 'G-XXXXXXXXXX',
    
    // Google AdSense ID (placeholder)
    ADSENSE_ID: 'ca-pub-xxxxxxxxxxxxxxxx',
    
    // Google Tag Manager ID (placeholder)
    GTM_ID: 'GTM-XXXXXXX'
};

// ============================================================================
// 2. CONTROLADOR DO HEADER
// ============================================================================

const HeaderController = {
    isInitialized: false,

    /**
     * Inicializa o controlador com verificações de estabilidade do DOM.
     */
    init: function() {
        if (this.isInitialized) return;

        // Verifica se o header já existe
        const header = document.getElementById('header');
        if (!header) {
            // Se ainda não houver header, tenta novamente no próximo frame
            requestAnimationFrame(() => this.init());
            return;
        }

        this.applySavedPreferences();
        this.setupSkipLinks();
        this.setupMobileMenu();
        this.bindEvents();
        this.isInitialized = true;
        console.log('✅ [Header] Sistema de Header estabilizado e inicializado.');
    },

    /**
     * Aplica as preferências de tema e fonte salvas no localStorage
     */
    applySavedPreferences: function() {
        // Tema
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            this.updateThemeUI(true);
        } else {
            this.updateThemeUI(false);
        }

        // Tamanho da Fonte
        const savedFontSize = localStorage.getItem('fontSizeScale');
        if (savedFontSize) {
            document.documentElement.style.fontSize = savedFontSize + '%';
        }
    },

    /**
     * Atualiza os ícones e textos do botão de tema
     */
    updateThemeUI: function(isDark) {
        const themeBtn = document.querySelector('#theme-toggle');
        if (!themeBtn) return;

        const icon = themeBtn.querySelector('i');
        const span = themeBtn.querySelector('span');
        
        if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        if (span) span.innerText = isDark ? 'Modo Claro' : 'Modo Escuro';
    },

    /**
     * Configura os skip links para acessibilidade
     */
    setupSkipLinks: function() {
        // Encontra todos os skip links
        const skipLinks = document.querySelectorAll('a[href="#header"], a[href="#main-content"], a[href="#footer"]');
        
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetEl = document.getElementById(targetId);
                
                if (!targetEl) {
                    console.warn(`⚠️ [Skip Link] Elemento alvo não encontrado: ${targetId}`);
                    return;
                }
                
                // Garante que o elemento pode receber foco
                if (!/^(?:a|select|input|button|textarea)$/i.test(targetEl.tagName)) {
                    targetEl.setAttribute('tabindex', '-1');
                }
                
                targetEl.focus();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                console.log('✅ [Skip Link] Navegação para:', targetId);
            });
        });
    },

    /**
     * Configura o menu mobile (hambúrguer)
     */
    setupMobileMenu: function() {
        const mobileBtn = document.getElementById('mobile-menu-trigger');
        const closeBtn = document.getElementById('close-mobile-menu');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileDrawer = document.getElementById('mobile-menu-drawer');
        const mobileBackdrop = document.getElementById('mobile-menu-backdrop');

        if (!mobileBtn || !mobileMenu || !mobileDrawer) {
            console.warn('⚠️ [Mobile Menu] Elementos do menu mobile não encontrados');
            return;
        }

        // Abrir menu
        mobileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            mobileMenu.classList.remove('hidden');
            mobileMenu.style.display = 'block';
            
            setTimeout(() => {
                mobileDrawer.classList.remove('-translate-x-full');
                mobileDrawer.classList.add('translate-x-0');
                if (mobileBackdrop) {
                    mobileBackdrop.classList.remove('opacity-0');
                    mobileBackdrop.classList.add('opacity-100');
                }
            }, 10);
            
            document.body.style.overflow = 'hidden';
            console.log('✅ [Mobile Menu] Menu aberto');
        });

        // Fechar menu
        const closeMenu = () => {
            mobileDrawer.classList.add('-translate-x-full');
            mobileDrawer.classList.remove('translate-x-0');
            if (mobileBackdrop) {
                mobileBackdrop.classList.add('opacity-0');
                mobileBackdrop.classList.remove('opacity-100');
            }
            
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
                mobileMenu.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
            
            console.log('✅ [Mobile Menu] Menu fechado');
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }

        if (mobileBackdrop) {
            mobileBackdrop.addEventListener('click', closeMenu);
        }

        // Fechar ao clicar em um link
        const mobileLinks = mobileDrawer.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
    },

    /**
     * Fecha todos os painéis do Mega-Menu de forma robusta.
     */
    closeAllPanels: function() {
        const panels = document.querySelectorAll('.mega-panel');
        const triggers = document.querySelectorAll('.nav-trigger');
        
        panels.forEach(p => {
            p.classList.add('hidden');
            p.classList.remove('active');
            p.style.display = 'none';
        });

        triggers.forEach(t => {
            t.setAttribute('aria-expanded', 'false');
            const icon = t.querySelector('.fa-chevron-down');
            if (icon) icon.style.transform = 'rotate(0deg)';
        });
    },

    bindEvents: function() {
        // --- DELEGAÇÃO DE EVENTOS GLOBAL ---
        document.addEventListener('click', (e) => {
            // 1. Mega Menu Triggers
            const trigger = e.target.closest('.nav-trigger');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = trigger.getAttribute('data-panel');
                const targetPanel = document.getElementById(targetId);
                
                if (!targetPanel) {
                    console.error('❌ [Menu] Painel alvo não encontrado:', targetId);
                    return;
                }

                const isOpen = targetPanel.classList.contains('active') && targetPanel.style.display === 'block';
                this.closeAllPanels();

                if (!isOpen) {
                    targetPanel.classList.remove('hidden');
                    targetPanel.classList.add('active');
                    targetPanel.style.setProperty('display', 'block', 'important');
                    
                    trigger.setAttribute('aria-expanded', 'true');
                    const icon = trigger.querySelector('.fa-chevron-down');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                }
                return;
            }

            // 2. Botões de Acessibilidade (Fonte e Tema)
            const fontIncrease = e.target.closest('[aria-label="Aumentar fonte"]');
            const fontDecrease = e.target.closest('[aria-label="Diminuir fonte"]');
            const themeToggle = e.target.closest('#theme-toggle');

            if (fontIncrease) {
                window.changeFontSize('increase');
                return;
            }
            if (fontDecrease) {
                window.changeFontSize('decrease');
                return;
            }
            if (themeToggle) {
                window.toggleTheme();
                return;
            }

            // 3. Fechar ao clicar fora
            if (!e.target.closest('.mega-panel') && !e.target.closest('header')) {
                this.closeAllPanels();
            }

            // 4. Accordion Mobile
            const accordionTrigger = e.target.closest('.mobile-accordion-trigger');
            if (accordionTrigger) {
                const sub = accordionTrigger.nextElementSibling;
                if (sub && sub.classList.contains('mobile-submenu')) {
                    const isOpen = sub.classList.contains('open');
                    sub.classList.toggle('open');
                    
                    if (!isOpen) {
                        sub.style.maxHeight = sub.scrollHeight + "px";
                    } else {
                        sub.style.maxHeight = "0px";
                    }
                }
            }

            // 5. Sub-accordion Mobile
            const subTrigger = e.target.closest('.mobile-sub-trigger');
            if (subTrigger) {
                const subAccordion = subTrigger.nextElementSibling;
                if (subAccordion && subAccordion.classList.contains('mobile-sub-accordion')) {
                    const isOpen = subAccordion.classList.contains('open');
                    subAccordion.classList.toggle('open');
                    
                    if (!isOpen) {
                        subAccordion.style.maxHeight = subAccordion.scrollHeight + "px";
                    } else {
                        subAccordion.style.maxHeight = "0px";
                    }
                }
            }
        });

        // --- COMPORTAMENTO DE ABAS INTERNAS ---
        document.addEventListener('mouseover', (e) => {
            const tabTrigger = e.target.closest('.menu-tab-trigger');
            if (tabTrigger) {
                const parent = tabTrigger.closest('.mega-panel');
                if (!parent) return;

                const targetId = tabTrigger.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);

                parent.querySelectorAll('.menu-tab-trigger').forEach(t => {
                    t.classList.remove('active', 'bg-gray-100', 'dark:bg-gray-800');
                });
                parent.querySelectorAll('.tab-content').forEach(c => {
                    c.classList.add('hidden');
                    c.style.display = 'none';
                });

                tabTrigger.classList.add('active', 'bg-gray-100', 'dark:bg-gray-800');
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    targetContent.style.display = 'block';
                }
            }
        });
    }
};

// ============================================================================
// 3. ORQUESTRAÇÃO DE INICIALIZAÇÃO
// ============================================================================

function attemptInitialization() {
    setTimeout(() => HeaderController.init(), 0);
}

window.addEventListener('templateEngineReady', attemptInitialization);

if (document.readyState === 'complete') {
    attemptInitialization();
} else {
    window.addEventListener('load', attemptInitialization);
}

// ============================================================================
// 4. FUNÇÕES GLOBAIS (ACESSIBILIDADE E TEMA)
// ============================================================================

window.toggleTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    HeaderController.updateThemeUI(isDark);
};

window.changeFontSize = function(action) {
    let current = parseInt(document.documentElement.style.fontSize) || 100;
    
    if (action === 'increase' && current < 130) current += 5;
    if (action === 'decrease' && current > 85) current -= 5;
    if (action === 'reset') current = 100;
    
    const newValue = current + '%';
    document.documentElement.style.fontSize = newValue;
    localStorage.setItem('fontSizeScale', current);
};

// ============================================================================
// 5. GOOGLE ANALYTICS E GTM
// ============================================================================

/**
 * Inicializa Google Analytics
 */
window.initGoogleAnalytics = function() {
    if (!AppConfig.GA_ID || AppConfig.GA_ID.includes('XXXXXXXXXX')) {
        console.warn('⚠️ [Analytics] Google Analytics ID não configurado');
        return;
    }

    // Script de carregamento do Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${AppConfig.GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', AppConfig.GA_ID);
    
    window.gtag = gtag;
    console.log('✅ [Analytics] Google Analytics inicializado');
};

/**
 * Inicializa Google Tag Manager
 */
window.initGoogleTagManager = function() {
    if (!AppConfig.GTM_ID || AppConfig.GTM_ID.includes('XXXXXXX')) {
        console.warn('⚠️ [GTM] Google Tag Manager ID não configurado');
        return;
    }

    // Script de carregamento do GTM
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${AppConfig.GTM_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        'event': 'gtm.js'
    });
    
    console.log('✅ [GTM] Google Tag Manager inicializado');
};

/**
 * Inicializa Google AdSense
 */
window.initGoogleAdSense = function() {
    if (!AppConfig.ADSENSE_ID || AppConfig.ADSENSE_ID.includes('xxxxxxxxxxxxxxxx')) {
        console.warn('⚠️ [AdSense] Google AdSense ID não configurado');
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AppConfig.ADSENSE_ID}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    
    console.log('✅ [AdSense] Google AdSense inicializado');
};

// ============================================================================
// 6. MODAL DE COOKIES COM INTEGRAÇÃO GOOGLE
// ============================================================================

const CookieManager = {
    COOKIE_NAME: 'user_cookie_preferences',
    EXPIRY_DAYS: 365,

    /**
     * Inicializa o gerenciador de cookies
     */
    init: function() {
        if (this.hasUserConsent()) {
            this.applyConsent();
            return;
        }

        this.showCookieModal();
    },

    /**
     * Verifica se o usuário já deu consentimento
     */
    hasUserConsent: function() {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(this.COOKIE_NAME));
        return !!cookie;
    },

    /**
     * Mostra o modal de cookies
     */
    showCookieModal: function() {
        const lang = AppConfig.currentLanguage();
        const texts = AppConfig.i18n[lang] || AppConfig.i18n.pt;

        const modal = document.createElement('div');
        modal.id = 'cookie-consent-modal';
        modal.className = 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-[100]';
        modal.innerHTML = `
            <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex-1">
                    <h3 class="font-bold text-gray-900 mb-1">${texts.cookieTitle}</h3>
                    <p class="text-sm text-gray-600">${texts.cookieMessage}</p>
                </div>
                <div class="flex gap-2 whitespace-nowrap">
                    <button id="cookie-reject" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        ${texts.cookieReject}
                    </button>
                    <button id="cookie-settings" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        ${texts.cookieSettings}
                    </button>
                    <button id="cookie-accept" class="px-4 py-2 text-sm font-medium text-white bg-[#1A3E74] rounded-lg hover:bg-[#143260] transition">
                        ${texts.cookieAccept}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('cookie-accept').addEventListener('click', () => {
            this.setConsent(true);
            modal.remove();
        });

        document.getElementById('cookie-reject').addEventListener('click', () => {
            this.setConsent(false);
            modal.remove();
        });

        document.getElementById('cookie-settings').addEventListener('click', () => {
            this.showSettingsModal();
        });

        console.log('✅ [Cookies] Modal de consentimento exibido');
    },

    /**
     * Define o consentimento do usuário
     */
    setConsent: function(accepted) {
        const preferences = {
            analytics: accepted,
            marketing: accepted,
            functional: true,
            timestamp: new Date().toISOString()
        };

        const date = new Date();
        date.setTime(date.getTime() + (this.EXPIRY_DAYS * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;

        document.cookie = `${this.COOKIE_NAME}=${JSON.stringify(preferences)}; ${expires}; path=/`;

        // Comunicar com Google Analytics
        if (accepted && window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted'
            });
        }

        if (accepted) {
            this.applyConsent();
            console.log('✅ [Cookies] Consentimento aceito');
        } else {
            console.log('✅ [Cookies] Consentimento rejeitado');
        }
    },

    /**
     * Aplica o consentimento (ativa scripts)
     */
    applyConsent: function() {
        const preferences = this.getPreferences();
        
        if (preferences && preferences.analytics) {
            window.initGoogleAnalytics();
            window.initGoogleTagManager();
        }

        console.log('✅ [Cookies] Preferências aplicadas:', preferences);
    },

    /**
     * Obtém as preferências do usuário
     */
    getPreferences: function() {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(this.COOKIE_NAME));
        
        if (!cookie) return null;

        try {
            return JSON.parse(cookie.split('=')[1]);
        } catch (e) {
            console.error('❌ [Cookies] Erro ao parsear preferências:', e);
            return null;
        }
    },

    /**
     * Mostra modal de configurações
     */
    showSettingsModal: function() {
        const lang = AppConfig.currentLanguage();
        const texts = AppConfig.i18n[lang] || AppConfig.i18n.pt;

        alert(`${texts.cookieSettings}\n\nFuncionalidade de configurações detalhadas em desenvolvimento.`);
    }
};

// Inicializar cookies quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieManager.init());
} else {
    CookieManager.init();
}

// ============================================================================
// 7. EXPORTAR PARA ACESSO GLOBAL
// ============================================================================

window.AppConfig = AppConfig;
window.HeaderController = HeaderController;
window.CookieManager = CookieManager;

console.log('✅ [Header] Todos os módulos carregados com sucesso');