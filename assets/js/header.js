        document.addEventListener('DOMContentLoaded', () => {
            
            // --- 1. MEGA MENU DESKTOP ---
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
                if (!e.target.closest('header')) closeAllPanels();
            });

            // --- 2. TABS INTERNAS ---
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

                    const targetContent = document.getElementById(trigger.dataset.target);
                    if (targetContent) targetContent.classList.add('active');
                });
            });

            // --- 3. MENU MOBILE ---
            const mobileBtn = document.getElementById('mobile-menu-trigger');
            const closeMobileBtn = document.getElementById('close-mobile-menu');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileDrawer = document.getElementById('mobile-menu-drawer');
            const mobileBackdrop = document.getElementById('mobile-menu-backdrop');

            function openMobileMenu() {
                mobileMenu.classList.remove('hidden');
                setTimeout(() => {
                    mobileBackdrop.classList.replace('opacity-0', 'opacity-100');
                    mobileDrawer.classList.add('open');
                }, 10);
                document.body.style.overflow = 'hidden';
            }

            function closeMobileMenuFunc() {
                mobileBackdrop.classList.replace('opacity-100', 'opacity-0');
                mobileDrawer.classList.remove('open');
                setTimeout(() => mobileMenu.classList.add('hidden'), 300);
                document.body.style.overflow = '';
            }

            if(mobileBtn) mobileBtn.addEventListener('click', openMobileMenu);
            if(closeMobileBtn) closeMobileBtn.addEventListener('click', closeMobileMenuFunc);
            if(mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenuFunc);

            // Accordion Mobile
            document.querySelectorAll('.mobile-accordion-trigger').forEach(btn => {
                btn.addEventListener('click', () => {
                    const sub = btn.nextElementSibling;
                    const icon = btn.querySelector('.fa-chevron-down');
                    sub.classList.toggle('open');
                    if(icon) icon.style.transform = sub.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
                });
            });
        });

        // --- 4. TEMA E ACESSIBILIDADE ---
        function toggleTheme() {
            const body = document.body;
            const icon = document.querySelector('#theme-toggle i');
            const span = document.querySelector('#theme-toggle span');
            
            body.classList.toggle('dark-theme');
            document.documentElement.classList.toggle('dark');

            if (body.classList.contains('dark-theme')) {
                icon.className = 'fas fa-sun';
                span.innerText = 'Modo Claro';
            } else {
                icon.className = 'fas fa-moon';
                span.innerText = 'Modo Escuro';
            }
        }

        let currentScale = 100;
        function changeFontSize(action) {
            if (action === 'increase' && currentScale < 130) currentScale += 5;
            if (action === 'decrease' && currentScale > 85) currentScale -= 5;
            document.documentElement.style.setProperty('--font-scale', currentScale + '%');
        }