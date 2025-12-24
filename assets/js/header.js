/**
 * CALCULADORAS DE ENFERMAGEM - CORE HEADER ENGINE
 * Versão: 2.1 - Estável
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GERENCIAMENTO DOS MEGA PANELS (DESKTOP) ---
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const megaPanels = document.querySelectorAll('.mega-panel');
    let activePanelId = null;

    function closeAllPanels() {
        megaPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
        });
        navTriggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
        activePanelId = null;
    }

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const panelId = trigger.getAttribute('data-panel');
            if (!panelId) return;

            const targetPanel = document.getElementById(panelId);

            if (activePanelId === panelId) {
                closeAllPanels();
            } else {
                closeAllPanels();
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.style.display = 'block';
                    trigger.setAttribute('aria-expanded', 'true');
                    activePanelId = panelId;
                }
            }
            e.stopPropagation();
        });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mega-panel') && !e.target.closest('.nav-trigger')) {
            closeAllPanels();
        }
    });

    // --- 2. LÓGICA DE TABS DENTRO DOS MEGA PANELS ---
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    tabTriggers.forEach(trigger => {
        const handleTabActivation = () => {
            const parentPanel = trigger.closest('.mega-panel');
            const targetId = trigger.getAttribute('data-target');

            // Reset triggers no mesmo painel
            parentPanel.querySelectorAll('.menu-tab-trigger').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            // Reset conteúdos no mesmo painel
            parentPanel.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Ativar atual
            trigger.classList.add('active');
            trigger.setAttribute('aria-selected', 'true');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');
        };

        trigger.addEventListener('mouseenter', handleTabActivation);
        trigger.addEventListener('click', handleTabActivation);
    });

    // --- 3. MENU MOBILE E ACORDEÕES ---
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const closeMobileMenu = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');

    function toggleMobileMenu(isOpen) {
        if (isOpen) {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                mobileBackdrop.classList.replace('opacity-0', 'opacity-100');
                mobileDrawer.classList.replace('-translate-x-full', 'translate-x-0');
            }, 10);
            document.body.style.overflow = 'hidden';
        } else {
            mobileBackdrop.classList.replace('opacity-100', 'opacity-0');
            mobileDrawer.classList.replace('translate-x-0', '-translate-x-full');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        }
    }

    if (mobileMenuTrigger) mobileMenuTrigger.addEventListener('click', () => toggleMobileMenu(true));
    if (closeMobileMenu) closeMobileMenu.addEventListener('click', () => toggleMobileMenu(false));
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', () => toggleMobileMenu(false));

    // Acordeão Mobile
    const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');
    accordionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !isExpanded);
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('i');
            
            if (!isExpanded) {
                content.style.maxHeight = content.scrollHeight + 'px';
                if (icon) icon.style.transform = 'rotate(180deg)';
            } else {
                content.style.maxHeight = '0px';
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        });
    });
});

// --- 4. FUNÇÕES GLOBAIS (ACESSABILIDADE E BUSCA) ---
// Anexadas ao window para funcionar com atributos onclick do HTML

window.toggleTheme = function() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Atualiza ícone se necessário
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
};

window.changeFontSize = function(action) {
    const root = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(root).fontSize);
    let newSize = action === 'increase' ? currentSize + 1 : currentSize - 1;
    
    // Limites de segurança
    if (newSize >= 12 && newSize <= 22) {
        root.style.fontSize = newSize + 'px';
    }
};

window.performSearch = function(query) {
    const resultsContainer = document.getElementById('active-search-results');
    const defaultMsg = document.getElementById('default-search-msg');
    
    if (query.length < 2) {
        resultsContainer.classList.add('hidden');
        defaultMsg.classList.remove('hidden');
        return;
    }

    resultsContainer.classList.remove('hidden');
    defaultMsg.classList.add('hidden');

    // Simulação de busca (Substitua pela sua lógica de API ou Index)
    const mockData = [
        { title: 'Cálculo de Heparina', url: 'heparina.html' },
        { title: 'Escala de Glasgow', url: 'glasgow.html' },
        { title: 'Calendário Vacinal', url: 'calendariovacinaladultos.html' }
    ];

    const filtered = mockData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    resultsContainer.innerHTML = filtered.length > 0 
        ? filtered.map(item => `
            <li>
                <a href="${item.url}" class="block p-3 hover:bg-blue-50 rounded border-b border-gray-100 transition">
                    <i class="fas fa-file-medical text-blue-600 mr-2"></i> ${item.title}
                </a>
            </li>
        `).join('')
        : `<li class="p-4 text-center text-gray-400">Nenhum resultado encontrado para "${query}"</li>`;
};

window.clearSearch = function() {
    const input = document.getElementById('panel-busca-input');
    if (input) {
        input.value = '';
        window.performSearch('');
    }
};

// --- Inicialização de Preferências ---
(function init() {
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }
})();