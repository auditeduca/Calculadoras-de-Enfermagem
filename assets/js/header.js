/**
 * CALCULADORAS DE ENFERMAGEM - CORE HEADER ENGINE
 * Versão: 2.4 - Corrigida com Mega-Menus, Menu Mobile e Acessibilidade Completa
 * Correções Implementadas:
 * - Seletor específico para mega-menus (nav-trigger[data-panel])
 * - Menu mobile com z-index correto
 * - Feedback visual completo
 * - Acessibilidade WCAG 2.1
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GERENCIAMENTO DOS MEGA PANELS (DESKTOP) ---
    // CORRIGIDO: Usar seletor específico para elementos com data-panel
    const navTriggers = document.querySelectorAll('.nav-trigger[data-panel]');
    const megaPanels = document.querySelectorAll('.mega-panel');
    let activePanelId = null;

    // Função para fechar todos os painéis abertos
    function closeAllPanels() {
        megaPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        navTriggers.forEach(t => {
            t.setAttribute('aria-expanded', 'false');
            t.classList.remove('active-nav');
        });
        activePanelId = null;
    }

    // Event listeners para mega-menus
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
                    trigger.setAttribute('aria-expanded', 'true');
                    trigger.classList.add('active-nav');
                    activePanelId = panelId;
                }
            }
            e.stopPropagation();
        });

        // Adicionar feedback visual ao hover
        trigger.addEventListener('mouseenter', () => {
            if (activePanelId === null) {
                trigger.style.color = '#1A3E74';
            }
        });

        trigger.addEventListener('mouseleave', () => {
            if (activePanelId === null) {
                trigger.style.color = '';
            }
        });
    });

    // Fechar ao clicar fora dos painéis
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mega-panel') && !e.target.closest('.nav-trigger[data-panel]')) {
            closeAllPanels();
        }
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllPanels();
    });

    // --- 2. LÓGICA DE TABS DENTRO DOS MEGA PANELS ---
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    
    tabTriggers.forEach(trigger => {
        const activateTab = () => {
            const parentPanel = trigger.closest('.mega-panel');
            if (!parentPanel) return;

            const targetId = trigger.getAttribute('data-target');

            // Resetar todos os triggers e conteúdos deste painel específico
            parentPanel.querySelectorAll('.menu-tab-trigger').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                const icon = t.querySelector('i');
                if (icon) icon.classList.add('opacity-0');
            });

            parentPanel.querySelectorAll('.tab-content').forEach(c => {
                c.classList.remove('active');
            });

            // Ativar a tab e o conteúdo correspondente
            trigger.classList.add('active');
            trigger.setAttribute('aria-selected', 'true');
            const icon = trigger.querySelector('i');
            if (icon) icon.classList.remove('opacity-0');

            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        };

        trigger.addEventListener('mouseenter', activateTab);
        trigger.addEventListener('click', activateTab);
        trigger.addEventListener('focus', activateTab);
    });

    // --- 3. MENU MOBILE E ACORDEÕES ---
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');

    function toggleMobileMenu(isOpen) {
        if (!mobileMenu || !mobileDrawer || !mobileBackdrop) return;

        if (isOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.setAttribute('aria-hidden', 'false');
            
            // Atualizar aria-expanded do botão
            if (mobileMenuTrigger) {
                mobileMenuTrigger.setAttribute('aria-expanded', 'true');
            }
            
            // Delay para a transição CSS funcionar
            setTimeout(() => {
                mobileBackdrop.classList.remove('opacity-0');
                mobileBackdrop.classList.add('opacity-100');
                mobileDrawer.classList.remove('-translate-x-full');
                mobileDrawer.classList.add('translate-x-0');
            }, 10);
            document.body.style.overflow = 'hidden';
        } else {
            mobileBackdrop.classList.remove('opacity-100');
            mobileBackdrop.classList.add('opacity-0');
            mobileDrawer.classList.remove('translate-x-0');
            mobileDrawer.classList.add('-translate-x-full');
            
            // Atualizar aria-expanded do botão
            if (mobileMenuTrigger) {
                mobileMenuTrigger.setAttribute('aria-expanded', 'false');
            }
            
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
                mobileMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }, 300);
        }
    }

    if (mobileMenuTrigger) mobileMenuTrigger.addEventListener('click', () => toggleMobileMenu(true));
    if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', () => toggleMobileMenu(false));
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', () => toggleMobileMenu(false));

    // Acordeões do Menu Mobile
    const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');
    accordionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            // Fechar outros acordeões ao abrir um novo
            accordionBtns.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    otherBtn.classList.remove('active');
                    const otherContent = otherBtn.nextElementSibling;
                    if (otherContent) otherContent.style.maxHeight = '0px';
                    const otherIcon = otherBtn.querySelector('i');
                    if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                }
            });

            btn.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
            
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
// Definidas no window para compatibilidade com atributos inline (onclick/oninput)

window.toggleTheme = function() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const icon = document.querySelector('#theme-toggle i');
    const btn = document.getElementById('theme-toggle');
    
    if (isDark) {
        if (icon) icon.className = 'fas fa-sun';
        if (btn) btn.setAttribute('aria-label', 'Alternar para modo claro');
    } else {
        if (icon) icon.className = 'fas fa-moon';
        if (btn) btn.setAttribute('aria-label', 'Alternar para modo escuro');
    }
};

window.changeFontSize = function(action) {
    const root = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(root).fontSize) || 16;
    let newSize = action === 'increase' ? currentSize + 1 : currentSize - 1;
    
    // Limites saudáveis para acessibilidade
    if (newSize >= 12 && newSize <= 24) {
        root.style.fontSize = newSize + 'px';
    }
};

window.performSearch = function(query) {
    const resultsContainer = document.getElementById('active-search-results');
    const defaultMsg = document.getElementById('default-search-msg');
    
    if (!resultsContainer || !defaultMsg) return;

    if (query.trim().length < 2) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        defaultMsg.classList.remove('hidden');
        return;
    }

    resultsContainer.classList.remove('hidden');
    defaultMsg.classList.add('hidden');

    // Base de dados de busca
    const database = [
        { title: 'Cálculo de Heparina', url: 'heparina.html', cat: 'Calculadora' },
        { title: 'Escala de Glasgow', url: 'glasgow.html', cat: 'Escala' },
        { title: 'Calendário Vacinal Adulto', url: 'calendariovacinaladultos.html', cat: 'Vacina' },
        { title: 'Cálculo de Gotejamento', url: 'gotejamento.html', cat: 'Calculadora' },
        { title: 'Diagnósticos NANDA', url: 'diagnosticosnanda.html', cat: 'Biblioteca' },
        { title: 'Cálculo de Insulina', url: 'insulina.html', cat: 'Calculadora' },
        { title: 'Escala de Braden', url: 'braden.html', cat: 'Escala' },
        { title: 'IMC - Índice de Massa Corporal', url: 'imc.html', cat: 'Calculadora' },
        { title: 'Escala de Apgar', url: 'apgar.html', cat: 'Escala' },
        { title: 'Balanço Hídrico', url: 'balancohidrico.html', cat: 'Calculadora' }
    ];

    const results = database.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.cat.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length > 0) {
        resultsContainer.innerHTML = results.map(item => `
            <li>
                <a href="${item.url}" class="group flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-all border-b border-gray-50">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-file-medical text-blue-600"></i>
                        <span class="text-gray-700 font-medium group-hover:text-blue-700">${item.title}</span>
                    </div>
                    <span class="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">${item.cat}</span>
                </a>
            </li>
        `).join('');
    } else {
        resultsContainer.innerHTML = `
            <li class="p-8 text-center">
                <i class="fas fa-search text-gray-200 text-4xl mb-3 block"></i>
                <p class="text-gray-500">Nenhum resultado para "${query}"</p>
            </li>
        `;
    }
};

window.clearSearch = function() {
    const input = document.getElementById('panel-busca-input');
    if (input) {
        input.value = '';
        input.focus();
        window.performSearch('');
    }
};

// --- Inicialização de Estado (Persistência) ---
(function initHeader() {
    // Aplicar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
})();
