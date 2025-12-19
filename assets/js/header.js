document.addEventListener('DOMContentLoaded', () => {
    
    // --- MEGA MENU DESKTOP ---
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

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('header')) closeAllPanels();
    });

    // --- ABAS INTERNAS (HOVER) ---
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
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // --- MENU MOBILE ---
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

    if (mobileBtn) mobileBtn.addEventListener('click', openMobileMenu);
    if (closeMobileBtn) closeMobileBtn.addEventListener('click', closeMobileMenu);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

    // Acordeões Mobile
    document.querySelectorAll('.mobile-accordion-trigger').forEach(acc => {
        acc.addEventListener('click', () => {
            const submenu = acc.nextElementSibling;
            const icon = acc.querySelector('.fa-chevron-down');
            
            if (submenu && submenu.classList.contains('open')) {
                submenu.classList.remove('open');
                if(icon) icon.style.transform = 'rotate(0deg)';
            } else if (submenu) {
                submenu.classList.add('open');
                if(icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Sub-acordeões Mobile
    document.querySelectorAll('.mobile-sub-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const subAccordion = trigger.nextElementSibling;
            const icon = trigger.querySelector('.fa-chevron-down');
            if (subAccordion) {
                subAccordion.classList.toggle('open');
                if(icon) icon.style.transform = subAccordion.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    });
});