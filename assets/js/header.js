/**
 * HEADER-SCRIPTS.JS - Versão Final Consolidada e Blindada
 * Foco: Delegação de Eventos para compatibilidade com Template Engines
 */

// --- 1. UTILS (Ferramentas de Animação e DOM) ---
window.Utils = {
    animate: {
        /**
         * Efeito de aparecimento gradual
         * @param {HTMLElement} element 
         * @param {number} duration 
         */
        fadeIn: function(element, duration = 300) {
            element.style.opacity = '0';
            element.style.display = 'block';
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        },
        /**
         * Efeito de desaparecimento gradual
         * @param {HTMLElement} element 
         * @param {number} duration 
         */
        fadeOut: function(element, duration = 300) {
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            requestAnimationFrame(() => {
                element.style.opacity = '0';
            });
            setTimeout(() => {
                element.style.display = 'none';
            }, duration);
        }
    }
};

// --- 2. CONSOLE CLEANER (Filtro Inteligente) ---
class ConsoleCleaner {
    constructor() {
        this.originalConsole = { ...console };
        this.init();
    }
    init() {
        const filter = (args, type) => {
            const msg = args.join(' ');
            const patterns = [/Failed to load resource/, /404/, /CORS/, /Template Engine/];
            // Permite logs de debug do menu para facilitar a manutenção
            if (msg.includes('[Menu Debug]') || msg.includes('✅')) {
                this.originalConsole[type](...args);
                return;
            }
            if (patterns.some(p => p.test(msg))) return;
            this.originalConsole[type](...args);
        };
        console.log = (...args) => filter(args, 'log');
        console.warn = (...args) => filter(args, 'warn');
        console.error = (...args) => filter(args, 'error');
        this.originalConsole.log('🧹 Console Cleaner: Ativo (Debug de Menu Liberado)');
    }
}
new ConsoleCleaner();

// --- 3. LÓGICA DO MENU (DELEGAÇÃO DE EVENTOS) ---
/**
 * Esta secção utiliza delegação de eventos no "document". 
 * Garante o funcionamento mesmo que o HTML seja injetado após o script.
 */
const HeaderController = {
    init: function() {
        this.bindEvents();
        console.log('✅ [Menu Debug] Sistema de Delegação Inicializado');
    },

    /**
     * Fecha todos os painéis abertos e reseta ícones
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
        // 1. Clique nos Nav Triggers (Mega Menu Desktop)
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.nav-trigger');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = trigger.getAttribute('data-panel');
                const targetPanel = document.getElementById(targetId);
                
                if (!targetPanel) {
                    console.error('❌ [Menu Debug] Painel não encontrado:', targetId);
                    return;
                }

                const isOpen = targetPanel.classList.contains('active') && targetPanel.style.display === 'block';

                this.closeAllPanels();

                if (!isOpen) {
                    targetPanel.classList.remove('hidden');
                    targetPanel.classList.add('active');
                    // Força display block para sobrepor classes do Tailwind
                    targetPanel.style.setProperty('display', 'block', 'important');
                    
                    trigger.setAttribute('aria-expanded', 'true');
                    const icon = trigger.querySelector('.fa-chevron-down');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                    
                    if (window.Utils.animate.fadeIn) window.Utils.animate.fadeIn(targetPanel, 200);
                    console.log('✅ [Menu Debug] Expandido:', targetId);
                }
            } else if (!e.target.closest('.mega-panel')) {
                // Clique fora do header ou painel fecha tudo
                this.closeAllPanels();
            }
        });

        // 2. Mouseover nas Tabs Internas (Mega Menu)
        document.addEventListener('mouseover', (e) => {
            const tabTrigger = e.target.closest('.menu-tab-trigger');
            if (tabTrigger) {
                const parent = tabTrigger.closest('.mega-panel');
                if (!parent) return;

                const targetId = tabTrigger.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);

                // Reset de abas irmãs dentro do mesmo painel
                parent.querySelectorAll('.menu-tab-trigger').forEach(t => t.classList.remove('active', 'bg-gray-100'));
                parent.querySelectorAll('.tab-content').forEach(c => {
                    c.classList.add('hidden');
                    c.style.display = 'none';
                });

                // Ativa a aba atual
                tabTrigger.classList.add('active', 'bg-gray-100');
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    targetContent.style.display = 'block';
                }
            }
        });

        // 3. Menu Mobile
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

            // Accordion Mobile (Submenus)
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

// --- 4. MODALS MANAGER ---
class ModalsManager {
    constructor() {
        this.configs = {
            'accessibility-menu': 'open',
            'cookie-prefs-modal': 'show',
            'suggestion-modal': 'show'
        };
        this.init();
    }
    init() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.accessibility-menu-trigger')) this.toggle('accessibility-menu', true);
            if (e.target.closest('.modal-close') || e.target.matches('.modal-backdrop')) this.closeAll();
        });
    }
    toggle(id, force) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.toggle(this.configs[id], force);
            document.body.style.overflow = el.classList.contains(this.configs[id]) ? 'hidden' : '';
        }
    }
    closeAll() {
        Object.keys(this.configs).forEach(id => this.toggle(id, false));
    }
}

// --- 5. INICIALIZAÇÃO ---
function startAll() {
    HeaderController.init();
    window.modalsManager = new ModalsManager();
}

// Escuta o evento do seu template-engine ou carregamento do DOM
window.addEventListener('templateEngineReady', startAll);
document.addEventListener('DOMContentLoaded', () => {
    // Caso o template engine não esteja ativo ou já tenha terminado, inicia manualmente
    if (!window.templateEngineActive) startAll(); 
});

/**
 * FUNÇÕES GLOBAIS DE ACESSIBILIDADE
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

// Aplica tema preferido ao carregar
if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');