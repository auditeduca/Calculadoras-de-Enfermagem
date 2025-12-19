/**
 * HEADER-SCRIPTS.JS - Lógica de Interação e Menu (Mega-Menu)
 * Foco: Delegação de Eventos para compatibilidade com Template Engines.
 * * ATENÇÃO: Este arquivo NÃO contém as classes ConsoleCleaner ou Utils, 
 * pois estas devem ser carregadas via console-cleaner.js e utils.js.
 */

// --- 1. LÓGICA DO MENU (DELEGAÇÃO DE EVENTOS) ---
/**
 * O HeaderController gerencia o Mega-Menu Desktop, abas internas e Menu Mobile.
 * Utiliza delegação de eventos para funcionar mesmo com injeção dinâmica de HTML.
 */
const HeaderController = {
    init: function() {
        this.bindEvents();
        console.log('✅ [Menu Debug] Sistema de Delegação do Header Inicializado');
    },

    /**
     * Fecha todos os painéis do Mega-Menu e reseta os ícones de seta
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
        // 1. Clique nos Nav Triggers (Gatilhos do Mega Menu Desktop)
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.nav-trigger');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = trigger.getAttribute('data-panel');
                const targetPanel = document.getElementById(targetId);
                
                if (!targetPanel) {
                    console.error('❌ [Menu Debug] Painel do Mega-Menu não encontrado:', targetId);
                    return;
                }

                const isOpen = targetPanel.classList.contains('active') && targetPanel.style.display === 'block';

                this.closeAllPanels();

                if (!isOpen) {
                    targetPanel.classList.remove('hidden');
                    targetPanel.classList.add('active');
                    // Força display block para sobrepor classes utilitárias de ocultação
                    targetPanel.style.setProperty('display', 'block', 'important');
                    
                    trigger.setAttribute('aria-expanded', 'true');
                    const icon = trigger.querySelector('.fa-chevron-down');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                    
                    // Executa animação se o Utils global estiver disponível (carregado via utils.js)
                    if (window.Utils && window.Utils.animate && window.Utils.animate.fadeIn) {
                        window.Utils.animate.fadeIn(targetPanel, 200);
                    }
                    console.log('✅ [Menu Debug] Mega-Menu Expandido:', targetId);
                }
            } else if (!e.target.closest('.mega-panel')) {
                // Fechar ao clicar fora do menu ou do painel
                this.closeAllPanels();
            }
        });

        // 2. Comportamento de Abas Internas (Hover no Mega Menu)
        document.addEventListener('mouseover', (e) => {
            const tabTrigger = e.target.closest('.menu-tab-trigger');
            if (tabTrigger) {
                const parent = tabTrigger.closest('.mega-panel');
                if (!parent) return;

                const targetId = tabTrigger.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);

                // Reset de abas e conteúdos no painel atual
                parent.querySelectorAll('.menu-tab-trigger').forEach(t => {
                    t.classList.remove('active', 'bg-gray-100', 'dark:bg-gray-800');
                });
                parent.querySelectorAll('.tab-content').forEach(c => {
                    c.classList.add('hidden');
                    c.style.display = 'none';
                });

                // Ativar a aba e o conteúdo correspondente
                tabTrigger.classList.add('active', 'bg-gray-100', 'dark:bg-gray-800');
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    targetContent.style.display = 'block';
                }
            }
        });

        // 3. Controlo do Menu Mobile (Drawer e Accordions)
        document.addEventListener('click', (e) => {
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

            // Submenus (Accordions) no Mobile
            const accordionTrigger = e.target.closest('.mobile-accordion-trigger');
            if (accordionTrigger) {
                const sub = accordionTrigger.nextElementSibling;
                if (sub) {
                    sub.classList.toggle('open');
                    sub.style.maxHeight = sub.classList.contains('open') ? sub.scrollHeight + "px" : "0px";
                }
            }
        });
    }
};

// --- 2. INICIALIZAÇÃO DO HEADER ---
function startHeaderServices() {
    HeaderController.init();
}

// Suporte para Template Engines (dispara quando o HTML é injetado)
window.addEventListener('templateEngineReady', startHeaderServices);

// Fallback para carregamento padrão do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o serviço já não foi iniciado pelo evento do template engine
    if (typeof window.headerInitialized === 'undefined') {
        startHeaderServices();
        window.headerInitialized = true;
    }
});

/**
 * FUNÇÕES GLOBAIS DE ACESSIBILIDADE E TEMA
 */
window.toggleTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
};

window.changeFontSize = function(action) {
    let current = parseInt(document.documentElement.style.fontSize) || 100;
    if (action === 'increase' && current < 130) current += 5;
    if (action === 'decrease' && current > 85) current -= 5;
    if (action === 'reset') current = 100;
    document.documentElement.style.fontSize = current + '%';
};

// Aplicação de tema persistente
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}