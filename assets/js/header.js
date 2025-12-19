/**
 * HEADER-SCRIPTS.JS - Lógica de Interação e Menu (Mega-Menu)
 * Foco: Resiliência na inicialização e compatibilidade com Template Engines.
 * Nota: Requer utils.js e console-cleaner.js carregados previamente.
 */

// --- 1. CONTROLADOR DO HEADER ---
const HeaderController = {
    isInitialized: false,

    /**
     * Inicializa o controlador com verificações de estabilidade do DOM.
     */
    init: function() {
        if (this.isInitialized) return;

        // Verifica se o container do header já possui conteúdo injetado
        const headerContainer = document.getElementById('header-container');
        if (!headerContainer || headerContainer.children.length === 0) {
            // Se ainda não houver conteúdo, tenta novamente no próximo frame
            requestAnimationFrame(() => this.init());
            return;
        }

        this.applySavedPreferences();
        this.bindEvents();
        this.isInitialized = true;
        console.log('✅ [Menu Debug] Sistema de Header estabilizado e inicializado.');
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
                    console.error('❌ [Menu Debug] Painel alvo não encontrado:', targetId);
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
                    
                    if (window.Utils?.animate?.fadeIn) {
                        window.Utils.animate.fadeIn(targetPanel, 200);
                    }
                }
                return;
            }

            // 2. Fechar ao clicar fora
            if (!e.target.closest('.mega-panel') && !e.target.closest('header')) {
                this.closeAllPanels();
            }

            // 3. Controlo Mobile
            const mobileBtn = e.target.closest('#mobile-menu-trigger');
            const closeBtn = e.target.closest('#close-mobile-menu');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileDrawer = document.getElementById('mobile-menu-drawer');

            if (mobileBtn) {
                mobileMenu?.classList.remove('hidden');
                setTimeout(() => mobileDrawer?.classList.add('open'), 10);
                document.body.style.overflow = 'hidden';
            }

            if (closeBtn || e.target.matches('#mobile-menu-backdrop')) {
                mobileDrawer?.classList.remove('open');
                setTimeout(() => {
                    mobileMenu?.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 300);
            }

            // 4. Accordion Mobile
            const accordionTrigger = e.target.closest('.mobile-accordion-trigger');
            if (accordionTrigger) {
                const sub = accordionTrigger.nextElementSibling;
                if (sub) {
                    sub.classList.toggle('open');
                    sub.style.maxHeight = sub.classList.contains('open') ? sub.scrollHeight + "px" : "0px";
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

// --- 2. ORQUESTRAÇÃO DE INICIALIZAÇÃO ---
function attemptInitialization() {
    setTimeout(() => HeaderController.init(), 0);
}

window.addEventListener('templateEngineReady', attemptInitialization);

if (document.readyState === 'complete') {
    attemptInitialization();
} else {
    window.addEventListener('load', attemptInitialization);
}

/**
 * FUNÇÕES GLOBAIS (ACESSIBILIDADE E TEMA)
 * Disponíveis no escopo window para chamadas via onclick
 */
window.toggleTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    HeaderController.updateThemeUI(isDark);
};

window.changeFontSize = function(action) {
    // Busca o valor atual direto do estilo computado ou do inline para evitar NaN
    let current = parseInt(document.documentElement.style.fontSize) || 100;
    
    if (action === 'increase' && current < 130) current += 5;
    if (action === 'decrease' && current > 85) current -= 5;
    if (action === 'reset') current = 100;
    
    const newValue = current + '%';
    document.documentElement.style.fontSize = newValue;
    localStorage.setItem('fontSizeScale', current);
};