/**
 * Script de Controle do Header, Mega Menu, Mobile e Acessibilidade
 * Versão Otimizada com Debugging e Reforço de Visibilidade
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MEGA MENU DESKTOP ---
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const megaPanels = document.querySelectorAll('.mega-panel');

    function closeAllPanels() {
        megaPanels.forEach(panel => {
            panel.classList.remove('active');
            // Removemos 'block' e voltamos para 'hidden' para compatibilidade com Tailwind
            panel.classList.add('hidden');
            panel.style.display = ''; // Limpa o estilo inline
        });
        navTriggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
            const icon = trigger.querySelector('.fa-chevron-down');
            if (icon) icon.style.transform = 'rotate(0deg)';
        });
    }

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 

            const targetId = trigger.getAttribute('data-panel');
            const targetPanel = document.getElementById(targetId);
            
            console.log('Trigger clicado:', targetId); // Debug: Verifica se o clique funciona

            if (!targetPanel) {
                console.error('Erro: Painel com ID "' + targetId + '" não encontrado.');
                return;
            }

            const isAlreadyOpen = targetPanel.classList.contains('active');

            closeAllPanels(); 

            if (!isAlreadyOpen) {
                console.log('A abrir painel:', targetId);
                targetPanel.classList.remove('hidden');
                targetPanel.classList.add('active');
                
                // Força a visibilidade caso o CSS .active não tenha display: block
                targetPanel.style.display = 'block'; 
                
                trigger.setAttribute('aria-expanded', 'true');
                const icon = trigger.querySelector('.fa-chevron-down');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Fecha o menu ao clicar em qualquer lugar fora do header
    document.addEventListener('click', (e) => {
        const header = document.querySelector('header');
        if (header && !header.contains(e.target)) {
            closeAllPanels();
        }
    });

    // --- 2. TABS INTERNAS (DENTRO DO MEGA MENU) ---
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => { 
            const parentPanel = trigger.closest('.mega-panel');
            if (!parentPanel) return;

            // Reset de abas
            parentPanel.querySelectorAll('.menu-tab-trigger').forEach(t => {
                t.classList.remove('active', 'bg-gray-100', 'dark:bg-gray-800');
                const icon = t.querySelector('.fa-chevron-right');
                if (icon) icon.style.opacity = '0';
            });
            
            parentPanel.querySelectorAll('.tab-content').forEach(c => {
                c.classList.add('hidden');
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Ativa a aba atual
            trigger.classList.add('active', 'bg-gray-100', 'dark:bg-gray-800');
            const icon = trigger.querySelector('.fa-chevron-right');
            if (icon) icon.style.opacity = '1';

            const targetId = trigger.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
            }
        });
    });

    // --- 3. MENU MOBILE ---
    const mobileBtn = document.getElementById('mobile-menu-trigger');
    const closeMobileBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');

    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            if (mobileBackdrop) {
                mobileBackdrop.classList.remove('opacity-0');
                mobileBackdrop.classList.add('opacity-100');
            }
            if (mobileDrawer) mobileDrawer.classList.add('open');
        }, 10);
    }

    function closeMobileMenuFunc() {
        if (!mobileMenu) return;
        if (mobileBackdrop) {
            mobileBackdrop.classList.remove('opacity-100');
            mobileBackdrop.classList.add('opacity-0');
        }
        if (mobileDrawer) mobileDrawer.classList.remove('open');
        
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    if (mobileBtn) mobileBtn.addEventListener('click', openMobileMenu);
    if (closeMobileBtn) closeMobileBtn.addEventListener('click', closeMobileMenuFunc);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenuFunc);

    // Accordion Mobile
    document.querySelectorAll('.mobile-accordion-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const sub = btn.nextElementSibling;
            if (!sub) return;
            
            const icon = btn.querySelector('.fa-chevron-down');
            sub.classList.toggle('open');
            
            if (sub.classList.contains('open')) {
                sub.style.maxHeight = sub.scrollHeight + "px"; // Suporte para transição suave
                if (icon) icon.style.transform = 'rotate(180deg)';
            } else {
                sub.style.maxHeight = "0px";
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        });
    });
});

/**
 * Funções de Acessibilidade e Tema
 */
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        const span = themeBtn.querySelector('span');
        if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        if (span) span.innerText = isDark ? 'Modo Claro' : 'Modo Escuro';
    }
}

let currentScale = 100;
function changeFontSize(action) {
    if (action === 'increase' && currentScale < 130) currentScale += 5;
    if (action === 'decrease' && currentScale > 85) currentScale -= 5;
    if (action === 'reset') currentScale = 100;
    
    document.documentElement.style.fontSize = currentScale + '%';
}

// Auto-init tema
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}