/**
 * HEADER.JS - Lógica de Interação e Menu (Mega-Menu)
 * Foco: Resiliência na inicialização e compatibilidade com Template Engines.
 */

const HeaderController = {
    isInitialized: false,

    init: function() {
        if (this.isInitialized) return;

        // Verifica se o container do header existe. 
        // Removida a verificação restritiva de children.length para permitir inicialização mais rápida.
        const headerContainer = document.getElementById('header-container') || document.querySelector('header');
        if (!headerContainer) {
            // Tenta novamente em breve se o header ainda não estiver no DOM
            setTimeout(() => this.init(), 100);
            return;
        }

        this.applySavedPreferences();
        this.bindEvents();
        this.isInitialized = true;
        console.log('✅ [Menu Debug] Sistema de Header estabilizado e inicializado.');
    },

    applySavedPreferences: function() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            this.updateThemeUI(true);
        } else {
            this.updateThemeUI(false);
        }

        const savedFontSize = localStorage.getItem('fontSizeScale');
        if (savedFontSize) {
            document.documentElement.style.fontSize = savedFontSize + '%';
        }
    },

    updateThemeUI: function(isDark) {
        const themeBtn = document.querySelector('#theme-toggle');
        if (!themeBtn) return;

        const icon = themeBtn.querySelector('i');
        const span = themeBtn.querySelector('span');
        
        if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        if (span) span.innerText = isDark ? 'Modo Claro' : 'Modo Escuro';
    },

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
        // Usamos uma única delegação de evento no document para maior eficiência
        document.addEventListener('click', (e) => {
            
            // 1. Mega Menu Triggers
            const trigger = e.target.closest('.nav-trigger');
            if (trigger) {
                e.preventDefault();
                const targetId = trigger.getAttribute('data-panel');
                const targetPanel = document.getElementById(targetId);
                
                if (!targetPanel) return;

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

            // 2. Acessibilidade (Fonte e Tema)
            if (e.target.closest('[aria-label*="Aumentar fonte"]')) return window.changeFontSize('increase');
            if (e.target.closest('[aria-label*="Diminuir fonte"]')) return window.changeFontSize('decrease');
            if (e.target.closest('#theme-toggle')) return window.toggleTheme();

            // 3. CORREÇÃO: Skip Links (Pular para Conteúdo/Topo/Rodapé)
            // Melhorada a detecção para aceitar qualquer link interno que aponte para IDs comuns de estrutura
            const skipLink = e.target.closest('a[href^="#"]');
            if (skipLink) {
                const href = skipLink.getAttribute('href');
                // Lista de IDs comuns para skip links caso a classe não esteja presente
                const commonIds = ['topo', 'conteudo', 'rodape', 'main', 'content', 'footer', 'header'];
                const targetId = href.substring(1);
                
                if (skipLink.classList.contains('skip-link') || commonIds.some(id => targetId.toLowerCase().includes(id))) {
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        // Garante foco para leitores de tela
                        targetEl.setAttribute('tabindex', '-1');
                        targetEl.focus();
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                        console.log('✅ [Acessibilidade] Navegando para:', targetId);
                        return;
                    }
                }
            }

            // 4. CORREÇÃO: Menu Mobile (Hambúrguer)
            const mobileBtn = e.target.closest('#mobile-menu-trigger') || e.target.closest('.mobile-menu-toggle');
            const closeBtn = e.target.closest('#close-mobile-menu') || e.target.closest('.close-menu');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileDrawer = document.getElementById('mobile-menu-drawer');

            if (mobileBtn) {
                console.log('📱 [Menu Mobile] Abrindo...');
                if (mobileMenu) mobileMenu.classList.remove('hidden');
                // Pequeno delay para garantir que a transição CSS ocorra
                setTimeout(() => {
                    if (mobileDrawer) mobileDrawer.classList.add('open');
                }, 10);
                document.body.style.overflow = 'hidden';
                return;
            }

            if (closeBtn || e.target.matches('#mobile-menu-backdrop') || e.target.closest('.mobile-backdrop')) {
                console.log('📱 [Menu Mobile] Fechando...');
                if (mobileDrawer) mobileDrawer.classList.remove('open');
                setTimeout(() => {
                    if (mobileMenu) mobileMenu.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 300);
                return;
            }

            // 5. Accordion Mobile
            const accordionTrigger = e.target.closest('.mobile-accordion-trigger');
            if (accordionTrigger) {
                const sub = accordionTrigger.nextElementSibling;
                if (sub) {
                    const isOpen = sub.classList.toggle('open');
                    sub.style.maxHeight = isOpen ? sub.scrollHeight + "px" : "0px";
                }
                return;
            }

            // 6. Fechar ao clicar fora (Mega Menu)
            if (!e.target.closest('.mega-panel') && !e.target.closest('header')) {
                this.closeAllPanels();
            }
        });

        // Hover para abas internas do Mega Menu
        document.addEventListener('mouseover', (e) => {
            const tabTrigger = e.target.closest('.menu-tab-trigger');
            if (tabTrigger) {
                const parent = tabTrigger.closest('.mega-panel');
                if (!parent) return;

                const targetId = tabTrigger.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);

                parent.querySelectorAll('.menu-tab-trigger').forEach(t => t.classList.remove('active', 'bg-gray-100', 'dark:bg-gray-800'));
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

// Inicialização robusta
function startApp() {
    HeaderController.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// Fallback para garantir inicialização em sistemas com carregamento dinâmico
window.addEventListener('load', startApp);
window.addEventListener('templateEngineReady', startApp);

// Funções Globais
window.toggleTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    HeaderController.updateThemeUI(isDark);
};

window.changeFontSize = function(action) {
    let current = parseInt(document.documentElement.style.fontSize) || 100;
    if (action === 'increase' && current < 130) current += 5;
    else if (action === 'decrease' && current > 85) current -= 5;
    else if (action === 'reset') current = 100;
    
    document.documentElement.style.fontSize = current + '%';
    localStorage.setItem('fontSizeScale', current);
};
