document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DO MEGA MENU DESKTOP (CLIQUE) ---
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
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            const targetId = trigger.dataset.panel;
            const targetPanel = document.getElementById(targetId);
            const isAlreadyOpen = targetPanel && targetPanel.classList.contains('active');

            closeAllPanels(); 

            if (!isAlreadyOpen && targetPanel) {
                targetPanel.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
                const icon = trigger.querySelector('.fa-chevron-down');
                if(icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('header')) {
            closeAllPanels();
        }
    });

    megaPanels.forEach(panel => {
        panel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });


    // --- 2. LÓGICA DE ABAS INTERNAS (TABS) ---
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => { 
            const parentPanel = trigger.closest('.mega-panel');
            if (!parentPanel) return;

            const panelTriggers = parentPanel.querySelectorAll('.menu-tab-trigger');
            const panelContents = parentPanel.querySelectorAll('.tab-content');

            panelTriggers.forEach(t => {
                t.classList.remove('active');
                const icon = t.querySelector('.fa-chevron-right');
                if(icon) icon.style.opacity = '0';
            });
            
            panelContents.forEach(c => c.classList.remove('active'));

            trigger.classList.add('active');
            const icon = trigger.querySelector('.fa-chevron-right');
            if(icon) icon.style.opacity = '1';

            const targetContentId = trigger.dataset.target;
            const targetContent = document.getElementById(targetContentId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });


    // --- 3. LÓGICA DO MENU MOBILE (APENAS UM SIMULACRO DA LÓGICA, O HTML ESTÁ OMITIDO) ---
    // Esta seção é apenas para garantir que a lógica JS não quebre se os elementos do menu mobile existirem.
    const mobileBtn = document.getElementById('mobile-menu-trigger');
    const closeMobileBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
    const accordionTriggers = document.querySelectorAll('.mobile-accordion-trigger');

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

    if (mobileBtn) mobileBtn.addEventListener('click', openMobileMenu);
    if (closeMobileBtn) closeMobileBtn.addEventListener('click', closeMobileMenu);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

    // Acordeões principais (menus)
    accordionTriggers.forEach(acc => {
        acc.addEventListener('click', () => {
            const submenu = acc.nextElementSibling;
            const icon = acc.querySelector('.fa-chevron-down');
            
            if (submenu && submenu.classList.contains('open')) {
                // Fecha o menu e todos os sub-acordeões internos
                submenu.classList.remove('open');
                if(icon) icon.style.transform = 'rotate(0deg)';
                submenu.querySelectorAll('.mobile-sub-accordion.open').forEach(sub => {
                    sub.classList.remove('open');
                    const subIcon = sub.previousElementSibling.querySelector('.fa-chevron-down');
                    if(subIcon) subIcon.style.transform = 'rotate(0deg)';
                });
            } else if (submenu) {
                // Fecha outros menus principais
                document.querySelectorAll('.mobile-submenu.open').forEach(el => {
                    if(el !== submenu) {
                        el.classList.remove('open');
                        const prevIcon = el.previousElementSibling.querySelector('.fa-chevron-down');
                        if(prevIcon) prevIcon.style.transform = 'rotate(0deg)';
                        // Fecha sub-acordeões do menu fechado
                        el.querySelectorAll('.mobile-sub-accordion.open').forEach(sub => {
                            sub.classList.remove('open');
                            const subIcon = sub.previousElementSibling.querySelector('.fa-chevron-down');
                            if(subIcon) subIcon.style.transform = 'rotate(0deg)';
                        });
                    }
                });
                
                submenu.classList.add('open');
                if(icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Sub-acordeões internos
    const subTriggers = document.querySelectorAll('.mobile-sub-trigger');
    subTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const subAccordion = trigger.nextElementSibling;
            const icon = trigger.querySelector('.fa-chevron-down');
            const parentSubmenu = trigger.closest('.mobile-submenu');

            if (subAccordion && subAccordion.classList.contains('open')) {
                subAccordion.classList.remove('open');
                if(icon) icon.style.transform = 'rotate(0deg)';
            } else if (subAccordion) {
                // Fecha outros sub-acordeões no mesmo menu
                if (parentSubmenu) {
                    parentSubmenu.querySelectorAll('.mobile-sub-accordion.open').forEach(el => {
                        if(el !== subAccordion) {
                            el.classList.remove('open');
                            const prevIcon = el.previousElementSibling.querySelector('.fa-chevron-down');
                            if(prevIcon) prevIcon.style.transform = 'rotate(0deg)';
                        }
                    });
                }
                
                subAccordion.classList.add('open');
                if(icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

});