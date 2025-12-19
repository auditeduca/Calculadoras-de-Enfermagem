/**
 * Script de Controle do Header, Mega Menu, Mobile e Acessibilidade
 * Garante o funcionamento de menus interativos, troca de temas e escalas de fonte.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MEGA MENU DESKTOP ---
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const megaPanels = document.querySelectorAll('.mega-panel');

    function closeAllPanels() {
        megaPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.classList.add('hidden'); // Garante que saia do fluxo se necessário
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
            
            if (!targetPanel) return;

            const isAlreadyOpen = targetPanel.classList.contains('active');

            // Fecha outros antes de abrir o atual
            closeAllPanels(); 

            if (!isAlreadyOpen) {
                targetPanel.classList.remove('hidden');
                targetPanel.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
                const icon = trigger.querySelector('.fa-chevron-down');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Fecha o menu ao clicar fora do header
    document.addEventListener('click', (e) => {
        const header = document.querySelector('header');
        if (header && !header.contains(e.target)) {
            closeAllPanels();
        }
    });

    // --- 2. TABS INTERNAS (MEGA MENU) ---
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    
    tabTriggers.forEach(trigger => {
        // Mudança para 'mouseenter' conforme solicitado para comportamento de abas
        trigger.addEventListener('mouseenter', () => { 
            const parentPanel = trigger.closest('.mega-panel');
            if (!parentPanel) return;

            // Remove estado ativo de todas as abas deste painel
            parentPanel.querySelectorAll('.menu-tab-trigger').forEach(t => {
                t.classList.remove('active', 'bg-gray-100', 'dark:bg-gray-800');
                const icon = t.querySelector('.fa-chevron-right');
                if (icon) icon.style.opacity = '0';
            });
            
            // Esconde todos os conteúdos de abas
            parentPanel.querySelectorAll('.tab-content').forEach(c => {
                c.classList.add('hidden');
                c.classList.remove('active');
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
        // Pequeno delay para permitir que o navegador processe a remoção do 'hidden' antes da transição
        setTimeout(() => {
            if (mobileBackdrop) {
                mobileBackdrop.classList.remove('opacity-0');
                mobileBackdrop.classList.add('opacity-100');
            }
            if (mobileDrawer) mobileDrawer.classList.add('open');
        }, 10);
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenuFunc() {
        if (!mobileMenu) return;
        if (mobileBackdrop) {
            mobileBackdrop.classList.remove('opacity-100');
            mobileBackdrop.classList.add('opacity-0');
        }
        if (mobileDrawer) mobileDrawer.classList.remove('open');
        
        // Aguarda a transição terminar para esconder o container
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
        document.body.style.overflow = '';
    }

    if (mobileBtn) mobileBtn.addEventListener('click', openMobileMenu);
    if (closeMobileBtn) closeMobileBtn.addEventListener('click', closeMobileMenuFunc);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenuFunc);

    // Accordion Mobile (Submenus)
    document.querySelectorAll('.mobile-accordion-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const sub = btn.nextElementSibling;
            if (!sub) return;
            
            const icon = btn.querySelector('.fa-chevron-down');
            const isOpen = sub.classList.contains('open');

            // Opcional: fechar outros accordions abertos
            // document.querySelectorAll('.mobile-submenu.open').forEach(s => s.classList.remove('open'));

            if (isOpen) {
                sub.classList.remove('open');
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                sub.classList.add('open');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });
});

// --- 4. TEMA E ACESSIBILIDADE (Globais) ---
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    const icon = themeBtn.querySelector('i');
    const span = themeBtn.querySelector('span');
    
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');

    if (isDark) {
        if (icon) icon.className = 'fas fa-sun';
        if (span) span.innerText = 'Modo Claro';
        localStorage.setItem('theme', 'dark');
    } else {
        if (icon) icon.className = 'fas fa-moon';
        if (span) span.innerText = 'Modo Escuro';
        localStorage.setItem('theme', 'light');
    }
}

let currentScale = 100;
function changeFontSize(action) {
    if (action === 'increase' && currentScale < 130) currentScale += 5;
    if (action === 'decrease' && currentScale > 85) currentScale -= 5;
    if (action === 'reset') currentScale = 100;
    
    document.documentElement.style.setProperty('--font-scale', currentScale + '%');
    // Aplica no estilo inline do root para garantir prioridade
    document.documentElement.style.fontSize = currentScale + '%';
}

// Inicialização de tema persistente (Opcional)
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}