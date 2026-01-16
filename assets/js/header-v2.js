/**
 * Header Module - VERSÃO FUNCIONAL
 * Mega-menus e Menu Hamburguer Totalmente Operacionais
 * Abertura/Fechamento, Expansão/Retração de Sub-menus
 * Responsividade Mobile
 */

// ============================================
// ESTADO GLOBAL
// ============================================
const HeaderState = {
    currentFontSize: 16,
    fontSizeLevels: [13, 16, 19, 24, 32],
    fontSizeLabels: ['85%', '100%', '120%', '150%', '200%'],
    currentFontIndex: 1,
    isDarkMode: false,
    openMegaMenu: null,
    mobileMenuOpen: false,
    eventBusReady: false
};

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Header] Inicializando módulo...');
    
    // Aguardar EventBus
    waitForEventBus(() => {
        initHeader();
    });
});

function waitForEventBus(callback) {
    if (window.EventBus && window.EventBus.initialized) {
        HeaderState.eventBusReady = true;
        callback();
    } else {
        const checkInterval = setInterval(() => {
            if (window.EventBus && window.EventBus.initialized) {
                clearInterval(checkInterval);
                HeaderState.eventBusReady = true;
                callback();
            }
        }, 100);
        
        // Timeout após 3 segundos
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn('[Header] EventBus não carregado, continuando sem sincronização');
            callback();
        }, 3000);
    }
}

function initHeader() {
    console.log('[Header] Inicializando componentes...');
    
    // Carregar preferências salvas
    loadSavedPreferences();
    
    // Inicializar controles de fonte
    initFontControls();
    
    // Inicializar toggle de tema
    initThemeToggle();
    
    // Inicializar skip buttons
    initSkipButtons();
    
    // Inicializar mega-menus
    initMegaMenus();
    
    // Inicializar menu hamburguer
    initMobileMenu();
    
    // Listeners de eventos
    setupEventListeners();
    
    console.log('[Header] Módulo inicializado com sucesso');
}

// ============================================
// PREFERÊNCIAS SALVAS
// ============================================
function loadSavedPreferences() {
    try {
        const saved = localStorage.getItem('header-preferences');
        if (saved) {
            const prefs = JSON.parse(saved);
            if (prefs.fontSize !== undefined) {
                HeaderState.currentFontIndex = prefs.fontSize;
                applyFontSize();
            }
        }
    } catch (e) {
        console.warn('[Header] Erro ao carregar preferências:', e);
    }
}

function savePreferences() {
    try {
        const prefs = {
            fontSize: HeaderState.currentFontIndex
        };
        localStorage.setItem('header-preferences', JSON.stringify(prefs));
    } catch (e) {
        console.warn('[Header] Erro ao salvar preferências:', e);
    }
}

// ============================================
// CONTROLES DE FONTE
// ============================================
function initFontControls() {
    const increaseBtn = document.getElementById('font-increase');
    const decreaseBtn = document.getElementById('font-reduce');
    const mobileIncreaseBtn = document.getElementById('mobile-font-increase');
    const mobileDecreaseBtn = document.getElementById('mobile-font-reduce');
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', increaseFontSize);
    }
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', decreaseFontSize);
    }
    if (mobileIncreaseBtn) {
        mobileIncreaseBtn.addEventListener('click', increaseFontSize);
    }
    if (mobileDecreaseBtn) {
        mobileDecreaseBtn.addEventListener('click', decreaseFontSize);
    }
    
    // Aplicar tamanho inicial
    applyFontSize();
}

function increaseFontSize() {
    if (HeaderState.currentFontIndex < HeaderState.fontSizeLevels.length - 1) {
        HeaderState.currentFontIndex++;
    } else {
        HeaderState.currentFontIndex = 0;
    }
    
    applyFontSize();
    savePreferences();
    emitEvent('font:changed', {
        size: HeaderState.fontSizeLevels[HeaderState.currentFontIndex],
        label: HeaderState.fontSizeLabels[HeaderState.currentFontIndex],
        index: HeaderState.currentFontIndex
    });
}

function decreaseFontSize() {
    if (HeaderState.currentFontIndex > 0) {
        HeaderState.currentFontIndex--;
    } else {
        HeaderState.currentFontIndex = HeaderState.fontSizeLevels.length - 1;
    }
    
    applyFontSize();
    savePreferences();
    emitEvent('font:changed', {
        size: HeaderState.fontSizeLevels[HeaderState.currentFontIndex],
        label: HeaderState.fontSizeLabels[HeaderState.currentFontIndex],
        index: HeaderState.currentFontIndex
    });
}

function applyFontSize() {
    const size = HeaderState.fontSizeLevels[HeaderState.currentFontIndex];
    document.documentElement.style.fontSize = size + 'px';
    
    // Atualizar hints dos botões
    updateFontButtonHints();
}

function updateFontButtonHints() {
    const increaseBtn = document.getElementById('font-increase');
    const decreaseBtn = document.getElementById('font-reduce');
    const mobileIncreaseBtn = document.getElementById('mobile-font-increase');
    const mobileDecreaseBtn = document.getElementById('mobile-font-reduce');
    
    const nextIndex = (HeaderState.currentFontIndex + 1) % HeaderState.fontSizeLevels.length;
    const prevIndex = HeaderState.currentFontIndex === 0 ? HeaderState.fontSizeLevels.length - 1 : HeaderState.currentFontIndex - 1;
    
    const nextLabel = HeaderState.fontSizeLabels[nextIndex];
    const prevLabel = HeaderState.fontSizeLabels[prevIndex];
    
    if (increaseBtn) {
        increaseBtn.setAttribute('aria-label', `Aumentar fonte para ${nextLabel}`);
        increaseBtn.title = `Aumentar fonte para ${nextLabel}`;
    }
    if (decreaseBtn) {
        decreaseBtn.setAttribute('aria-label', `Reduzir fonte para ${prevLabel}`);
        decreaseBtn.title = `Reduzir fonte para ${prevLabel}`;
    }
    if (mobileIncreaseBtn) {
        mobileIncreaseBtn.setAttribute('aria-label', `Aumentar fonte para ${nextLabel}`);
        mobileIncreaseBtn.title = `Aumentar fonte para ${nextLabel}`;
    }
    if (mobileDecreaseBtn) {
        mobileDecreaseBtn.setAttribute('aria-label', `Reduzir fonte para ${prevLabel}`);
        mobileDecreaseBtn.title = `Reduzir fonte para ${prevLabel}`;
    }
}

// ============================================
// TOGGLE DE TEMA
// ============================================
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    if (window.ThemeManager && typeof window.ThemeManager.toggle === 'function') {
        window.ThemeManager.toggle();
    } else {
        console.warn('[Header] ThemeManager não disponível');
    }
}

// ============================================
// SKIP BUTTONS
// ============================================
function initSkipButtons() {
    const skipButtons = {
        'skip-top': 'main-header',
        'skip-content': 'main-content',
        'skip-footer': 'footer'
    };
    
    Object.entries(skipButtons).forEach(([btnId, targetId]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                scrollToElement(targetId);
            });
        }
    });
}

function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Anúncio para leitores de tela
        announceToScreenReader(`Navegando para ${elementId}`);
    }
}

// ============================================
// MEGA-MENUS
// ============================================
function initMegaMenus() {
    console.log('[Header] Inicializando mega-menus...');
    
    const megaMenuButtons = document.querySelectorAll('[data-menu]');
    
    megaMenuButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMegaMenu(this);
        });
        
        // Teclado
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMegaMenu(this);
            }
            if (e.key === 'Escape') {
                closeMegaMenu();
            }
        });
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('[data-menu]') && !e.target.closest('.mega-panel')) {
            closeMegaMenu();
        }
    });
    
    // Inicializar abas dentro dos mega-menus
    initMegaMenuTabs();
}

function toggleMegaMenu(button) {
    const menuName = button.getAttribute('data-menu');
    const panelId = `mega-panel-${menuName}`;
    const panel = document.getElementById(panelId);
    
    if (!panel) {
        console.warn(`[Header] Painel não encontrado: ${panelId}`);
        return;
    }
    
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    
    if (isOpen) {
        closeMegaMenu();
    } else {
        // Fechar outros menus abertos
        closeMegaMenu();
        
        // Abrir novo menu
        button.setAttribute('aria-expanded', 'true');
        panel.classList.remove('hidden');
        panel.style.display = 'block';
        
        console.log(`[Header] Mega-menu aberto: ${menuName}`);
    }
}

function closeMegaMenu() {
    const openButtons = document.querySelectorAll('[data-menu][aria-expanded="true"]');
    
    openButtons.forEach(button => {
        const menuName = button.getAttribute('data-menu');
        const panelId = `mega-panel-${menuName}`;
        const panel = document.getElementById(panelId);
        
        if (panel) {
            button.setAttribute('aria-expanded', 'false');
            panel.classList.add('hidden');
            panel.style.display = 'none';
        }
    });
    
    HeaderState.openMegaMenu = null;
}

function initMegaMenuTabs() {
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const tabName = this.getAttribute('data-tab');
            const tabContent = document.getElementById(`tab-${tabName}`);
            
            if (!tabContent) {
                console.warn(`[Header] Tab não encontrado: tab-${tabName}`);
                return;
            }
            
            // Encontrar o painel pai
            const panel = this.closest('.mega-panel');
            if (!panel) return;
            
            // Desativar todas as abas e conteúdos do painel
            const allTriggers = panel.querySelectorAll('.menu-tab-trigger');
            const allContents = panel.querySelectorAll('.tab-content');
            
            allTriggers.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            
            allContents.forEach(c => {
                c.classList.remove('active');
            });
            
            // Ativar aba e conteúdo selecionados
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            tabContent.classList.add('active');
            
            console.log(`[Header] Aba ativada: ${tabName}`);
        });
        
        // Teclado
        trigger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// ============================================
// MENU HAMBURGUER
// ============================================
function initMobileMenu() {
    console.log('[Header] Inicializando menu hamburguer...');
    
    const hamburger = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const closeBtn = document.getElementById('mobile-menu-close');
    
    if (!hamburger || !mobileNav) {
        console.warn('[Header] Elementos do menu hamburguer não encontrados');
        return;
    }
    
    // Botão hamburger
    hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Botão fechar
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
        });
    }
    
    // Links do menu
    const mobileLinks = mobileNav.querySelectorAll('a, button');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Fechar menu ao clicar em um link
            closeMobileMenu();
        });
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', function(e) {
        if (HeaderState.mobileMenuOpen && 
            !e.target.closest('#mobile-nav') && 
            !e.target.closest('#mobile-menu-toggle')) {
            closeMobileMenu();
        }
    });
    
    // Teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && HeaderState.mobileMenuOpen) {
            closeMobileMenu();
        }
    });
    
    // Inicializar sub-menus mobile
    initMobileSubmenus();
}

function toggleMobileMenu() {
    if (HeaderState.mobileMenuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const hamburger = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (hamburger && mobileNav) {
        HeaderState.mobileMenuOpen = true;
        hamburger.setAttribute('aria-expanded', 'true');
        mobileNav.classList.remove('hidden');
        mobileNav.style.display = 'block';
        
        console.log('[Header] Menu hamburguer aberto');
    }
}

function closeMobileMenu() {
    const hamburger = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (hamburger && mobileNav) {
        HeaderState.mobileMenuOpen = false;
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.classList.add('hidden');
        mobileNav.style.display = 'none';
        
        console.log('[Header] Menu hamburguer fechado');
    }
}

function initMobileSubmenus() {
    const mobileNav = document.getElementById('mobile-nav');
    if (!mobileNav) return;
    
    const subMenuButtons = mobileNav.querySelectorAll('button[aria-haspopup="true"]');
    
    subMenuButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const submenu = this.nextElementSibling;
            if (submenu && submenu.classList.contains('mobile-submenu')) {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                if (isExpanded) {
                    this.setAttribute('aria-expanded', 'false');
                    submenu.classList.remove('expanded');
                    submenu.style.display = 'none';
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    submenu.classList.add('expanded');
                    submenu.style.display = 'block';
                }
            }
        });
    });
}

// ============================================
// EVENT BUS
// ============================================
function emitEvent(eventName, detail) {
    if (window.EventBus && typeof window.EventBus.emit === 'function') {
        window.EventBus.emit(eventName, detail);
    } else {
        // Fallback para CustomEvent
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
}

function setupEventListeners() {
    // Escutar mudanças de tema
    document.addEventListener('theme:changed', function(e) {
        console.log('[Header] Tema alterado:', e.detail);
        updateThemeIcon();
    });
    
    // Escutar mudanças de fonte
    document.addEventListener('font:changed', function(e) {
        console.log('[Header] Fonte alterada:', e.detail);
    });
}

function updateThemeIcon() {
    const isDark = window.ThemeManager && window.ThemeManager.isDark ? window.ThemeManager.isDark() : false;
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    
    if (themeToggle) {
        themeToggle.innerHTML = isDark ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', isDark ? 'Ativar tema claro' : 'Ativar tema escuro');
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.innerHTML = isDark ? '☀️' : '🌙';
        mobileThemeToggle.setAttribute('aria-label', isDark ? 'Ativar tema claro' : 'Ativar tema escuro');
    }
}

// ============================================
// UTILITÁRIOS
// ============================================
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        announcement.remove();
    }, 1000);
}

// ============================================
// API PÚBLICA
// ============================================
window.HeaderModule = {
    increaseFontSize,
    decreaseFontSize,
    toggleTheme,
    toggleMobileMenu,
    closeMobileMenu,
    toggleMegaMenu,
    closeMegaMenu,
    state: HeaderState
};

console.log('[Header] Módulo carregado e pronto para uso');
