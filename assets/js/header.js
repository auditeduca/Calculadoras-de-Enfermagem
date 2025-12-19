/**
 * HEADER-SCRIPTS.JS - Versão Final Consolidada
 * Inclui: Utils, ConsoleCleaner (Corrigido), ModalsManager e Lógica do Header
 */

// --- 1. UTILS (Ferramentas de Animação e DOM) ---
window.Utils = {
    animate: {
        fadeIn: function(element, duration = 300) {
            element.style.opacity = '0';
            element.style.display = 'block';
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        },
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
    },
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};

// --- 2. CONSOLE CLEANER (Ajustado para permitir manutenção do Menu) ---
class ConsoleCleaner {
    constructor() {
        this.originalConsole = { ...console };
        this.init();
    }
    init() {
        this.overrideConsole();
        this.originalConsole.log('🧹 Console Cleaner: Ativo. Filtros de "mega-menu" desativados para debug.');
    }
    overrideConsole() {
        const filter = (args, type) => {
            const msg = args.join(' ');
            // Padrões de ruído que ainda queremos filtrar
            const patterns = [/Failed to load resource/, /404/, /CORS/, /Template Engine/];
            // Se a mensagem for de debug do menu, deixamos passar sempre
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
    }
}
new ConsoleCleaner();

// --- 3. MODALS MANAGER (Gestão de Diálogos) ---
class ModalsManager {
    constructor() {
        this.modals = new Map();
        this.modalConfigs = {
            'accessibility-menu': { id: 'accessibility-menu', activeClass: 'open' },
            'cookie-prefs-modal': { id: 'cookie-prefs-modal', activeClass: 'show' },
            'suggestion-modal': { id: 'suggestion-modal', activeClass: 'show' }
        };
        this.init();
    }
    init() {
        this.refresh();
        this.bindEvents();
    }
    refresh() {
        Object.entries(this.modalConfigs).forEach(([key, config]) => {
            const el = document.getElementById(config.id);
            if (el) this.modals.set(key, { element: el, config: config });
        });
    }
    bindEvents() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('.accessibility-menu-trigger')) this.openModal('accessibility-menu');
            if (target.closest('.modal-close') || target.matches('.modal-backdrop')) this.closeAll();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeAll(); });
    }
    openModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.element.classList.add(modal.config.activeClass);
            document.body.style.overflow = 'hidden';
        }
    }
    closeAll() {
        this.modals.forEach(m => m.element.classList.remove(m.config.activeClass));
        document.body.style.overflow = '';
    }
}
window.modalsManager = new ModalsManager();

// --- 4. LÓGICA DO HEADER E MEGA MENU ---
document.addEventListener('DOMContentLoaded', () => {
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const megaPanels = document.querySelectorAll('.mega-panel');

    function closeAllPanels() {
        megaPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.classList.add('hidden');
            panel.style.display = 'none'; // Garante o fecho absoluto
        });
        navTriggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
            const icon = trigger.querySelector('.fa-chevron-down');
            if (icon) icon.style.transform = 'rotate(0deg)';
        });
    }

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const targetId = this.getAttribute('data-panel');
            const targetPanel = document.getElementById(targetId);

            if (!targetPanel) {
                console.error('❌ [Menu Debug] Painel não encontrado para o ID:', targetId);
                return;
            }

            const isAlreadyOpen = targetPanel.classList.contains('active') && targetPanel.style.display === 'block';

            closeAllPanels();

            if (!isAlreadyOpen) {
                // Remove classes de ocultação do Tailwind e aplica ativação
                targetPanel.classList.remove('hidden');
                targetPanel.classList.add('active');
                
                // Força o display block via style inline para vencer qualquer CSS !important
                targetPanel.style.setProperty('display', 'block', 'important');
                
                if (window.Utils.animate.fadeIn) {
                    window.Utils.animate.fadeIn(targetPanel, 200);
                }

                this.setAttribute('aria-expanded', 'true');
                const icon = this.querySelector('.fa-chevron-down');
                if (icon) icon.style.transform = 'rotate(180deg)';
                
                console.log('✅ [Menu Debug] Painel expandido com sucesso:', targetId);
            }
        });
    });

    // Fecha o menu ao clicar fora do header
    document.addEventListener('click', (e) => {
        const header = document.querySelector('header');
        if (header && !header.contains(e.target)) closeAllPanels();
    });

    // --- 5. TABS INTERNAS (MEGA MENU) ---
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function() {
            const parent = this.closest('.mega-panel');
            if (!parent) return;

            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            // Reset de todas as abas no painel atual
            parent.querySelectorAll('.menu-tab-trigger').forEach(t => {
                t.classList.remove('active', 'bg-gray-100', 'dark:bg-gray-800');
            });
            parent.querySelectorAll('.tab-content').forEach(c => {
                c.classList.add('hidden');
                c.style.display = 'none';
            });

            // Ativa a aba selecionada
            this.classList.add('active', 'bg-gray-100', 'dark:bg-gray-800');
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.style.display = 'block';
            }
        });
    });

    // --- 6. MENU MOBILE ---
    const mobileBtn = document.getElementById('mobile-menu-trigger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const closeMobile = document.getElementById('close-mobile-menu');

    if (mobileBtn && mobileMenu) {
        mobileBtn.onclick = () => {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => mobileDrawer?.classList.add('open'), 10);
            document.body.style.overflow = 'hidden';
        };
    }

    if (closeMobile) {
        closeMobile.onclick = () => {
            mobileDrawer?.classList.remove('open');
            setTimeout(() => {
                mobileMenu?.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        };
    }

    // Accordions no Mobile (Submenus)
    document.querySelectorAll('.mobile-accordion-trigger').forEach(btn => {
        btn.onclick = function() {
            const sub = this.nextElementSibling;
            if (sub) {
                sub.classList.toggle('open');
                if (sub.classList.contains('open')) {
                    sub.style.maxHeight = sub.scrollHeight + "px";
                } else {
                    sub.style.maxHeight = "0px";
                }
            }
        };
    });
});

/**
 * ACESSIBILIDADE E TEMA (Globais)
 */
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

function changeFontSize(action) {
    let current = parseInt(document.documentElement.style.fontSize) || 100;
    if (action === 'increase' && current < 130) current += 5;
    if (action === 'decrease' && current > 85) current -= 5;
    if (action === 'reset') current = 100;
    document.documentElement.style.fontSize = current + '%';
}

// Inicialização automática do tema guardado
if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');