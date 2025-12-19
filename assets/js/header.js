/**
 * Calculadoras de Enfermagem - Header JavaScript
 * Versão: 1.1 (Modular Ready)
 * Atualização: Correção de ciclo de vida para TemplateEngine
 */

function initHeader() {
    console.log('%c[Header] Inicializando componentes...', 'color: #10b981; font-weight: bold;');

    // ===== 1. LÓGICA DO MEGA MENU DESKTOP (CLIQUE) =====
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const megaPanels = document.querySelectorAll('.mega-panel');

    function closeAllPanels() {
        megaPanels.forEach(panel => panel.classList.remove('active'));
        navTriggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
            const icon = trigger.querySelector('.fa-chevron-down');
            if(icon) icon.style.transform = 'rotate(0deg)';
        });
    }

    navTriggers.forEach(trigger => {
        // Removemos listeners antigos para evitar duplicação em re-renderizações
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);

        newTrigger.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            const targetId = newTrigger.dataset.panel;
            const targetPanel = document.getElementById(targetId);
            const isAlreadyOpen = targetPanel && targetPanel.classList.contains('active');

            closeAllPanels(); 

            if (!isAlreadyOpen && targetPanel) {
                targetPanel.classList.add('active');
                newTrigger.setAttribute('aria-expanded', 'true');
                const icon = newTrigger.querySelector('.fa-chevron-down');
                if(icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('header')) {
            closeAllPanels();
        }
    });

    // ===== 2. LÓGICA DE ABAS INTERNAS (TABS) =====
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => { 
            const parentPanel = trigger.closest('.mega-panel');
            if (!parentPanel) return;

            parentPanel.querySelectorAll('.menu-tab-trigger').forEach(t => {
                t.classList.remove('active');
                const icon = t.querySelector('.fa-chevron-right');
                if(icon) icon.style.opacity = '0';
            });
            
            parentPanel.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            trigger.classList.add('active');
            const icon = trigger.querySelector('.fa-chevron-right');
            if(icon) icon.style.opacity = '1';

            const targetContentId = trigger.dataset.target;
            const targetContent = document.getElementById(targetContentId);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // ===== 3. LÓGICA DO MENU MOBILE =====
    const mobileBtn = document.getElementById('mobile-menu-trigger');
    const closeMobileBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');

    function openMobileMenu() {
        if (mobileMenu) mobileMenu.classList.remove('hidden');
        setTimeout(() => {
            if (mobileBackdrop) mobileBackdrop.classList.remove('opacity-0');
            if (mobileDrawer) mobileDrawer.classList.remove('-translate-x-full');
        }, 10);
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        if (mobileBackdrop) mobileBackdrop.classList.add('opacity-0');
        if (mobileDrawer) mobileDrawer.classList.add('-translate-x-full');
        
        setTimeout(() => {
            if (mobileMenu) mobileMenu.classList.add('hidden');
        }, 300);
        document.body.style.overflow = '';
    }

    if (mobileBtn) mobileBtn.onclick = openMobileMenu;
    if (closeMobileBtn) closeMobileBtn.onclick = closeMobileMenu;
    if (mobileBackdrop) mobileBackdrop.onclick = closeMobileMenu;

    // Acordeões Mobile
    const accordionTriggers = document.querySelectorAll('.mobile-accordion-trigger');
    accordionTriggers.forEach(acc => {
        acc.onclick = () => {
            const submenu = acc.nextElementSibling;
            const icon = acc.querySelector('.fa-chevron-down');
            
            if (submenu && submenu.classList.contains('open')) {
                submenu.classList.remove('open');
                if(icon) icon.style.transform = 'rotate(0deg)';
            } else if (submenu) {
                submenu.classList.add('open');
                if(icon) icon.style.transform = 'rotate(180deg)';
            }
        };
    });
}

/**
 * Ponto de entrada inteligente:
 * Verifica se o DOM já está pronto ou se o script foi injetado via TemplateEngine
 */
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Se o motor de templates injetou o script, o DOM já está "interativo" ou "completo"
    initHeader();
} else {
    // Se for um carregamento de página normal
    document.addEventListener('DOMContentLoaded', initHeader);
}

// Exportar para que o TemplateEngine possa chamar manualmente se necessário
window.reinitHeader = initHeader;