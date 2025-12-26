/**
 * CALCULADORAS DE ENFERMAGEM - CORE HEADER ENGINE
 * Versão: 2.4 - Acessibilidade Aprimorada (Keyboard Nav + ARIA)
 * Autoria: Refatorado para conformidade WCAG
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- UTILS: Helper para elementos focáveis ---
    function getFocusableElements(element) {
        return element.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
    }

    // --- 1. GERENCIAMENTO DOS MEGA PANELS (DESKTOP) ---
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const megaPanels = document.querySelectorAll('.mega-panel');
    let activePanelId = null;
    let lastFocusedElement = null; // Para retornar o foco ao fechar

    // Função para fechar todos os painéis abertos
    function closeAllPanels() {
        megaPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
        });
        navTriggers.forEach(t => {
            t.setAttribute('aria-expanded', 'false');
            t.classList.remove('active-nav');
        });
        activePanelId = null;
    }

    navTriggers.forEach(trigger => {
        // Vincula trigger ao painel via ARIA
        const panelId = trigger.getAttribute('data-panel');
        if (panelId) {
            trigger.setAttribute('aria-controls', panelId);
            trigger.setAttribute('aria-haspopup', 'true');
        }

        const togglePanel = (e) => {
            if (!panelId) return;
            // Previne comportamento padrão se for link vazio
            if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
                if(trigger.tagName === 'A') e.preventDefault();
            }

            const targetPanel = document.getElementById(panelId);

            if (activePanelId === panelId) {
                closeAllPanels();
                // Retorna foco se foi acionado por teclado
                if (e.type !== 'mouseenter') trigger.focus();
            } else {
                closeAllPanels(); // Fecha outros
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.setAttribute('aria-hidden', 'false');
                    trigger.setAttribute('aria-expanded', 'true');
                    trigger.classList.add('active-nav');
                    activePanelId = panelId;

                    // Acessibilidade: Mover foco para dentro do painel
                    // Especial para busca: focar no input
                    if (panelId.includes('busca')) {
                        const input = targetPanel.querySelector('input');
                        if (input) setTimeout(() => input.focus(), 100);
                    }
                }
            }
            e.stopPropagation();
        };

        trigger.addEventListener('click', togglePanel);
        
        // Suporte para teclado (Enter e Espaço)
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                togglePanel(e);
            }
        });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mega-panel') && !e.target.closest('.nav-trigger')) {
            closeAllPanels();
        }
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const wasOpen = activePanelId !== null;
            closeAllPanels();
            // Retorna o foco para o trigger se algo foi fechado
            if (wasOpen && document.activeElement.closest('.mega-panel')) {
                 const trigger = document.querySelector(`.nav-trigger[data-panel="${activePanelId}"]`);
                 if (trigger) trigger.focus();
            }
        }
    });

    // --- 2. LÓGICA DE TABS DENTRO DOS MEGA PANELS ---
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    
    // Configuração ARIA inicial para Tabs
    tabTriggers.forEach(trigger => {
        trigger.setAttribute('role', 'tab');
        const targetId = trigger.getAttribute('data-target');
        if (targetId) trigger.setAttribute('aria-controls', targetId);
    });

    // Função separada para ativação para reuso
    const activateTab = (trigger) => {
        const parentPanel = trigger.closest('.mega-panel');
        if (!parentPanel) return;

        const targetId = trigger.getAttribute('data-target');

        // Resetar triggers do painel atual
        parentPanel.querySelectorAll('.menu-tab-trigger').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1'); // Remove da ordem natural do tab
            const icon = t.querySelector('i');
            if (icon) icon.classList.add('opacity-0');
        });

        // Resetar conteúdos
        parentPanel.querySelectorAll('.tab-content').forEach(c => {
            c.classList.remove('active');
            c.setAttribute('hidden', ''); // Atributo hidden HTML5
            c.setAttribute('role', 'tabpanel');
        });

        // Ativar trigger
        trigger.classList.add('active');
        trigger.setAttribute('aria-selected', 'true');
        trigger.setAttribute('tabindex', '0'); // Torna focável
        const icon = trigger.querySelector('i');
        if (icon) icon.classList.remove('opacity-0');

        // Ativar conteúdo
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.removeAttribute('hidden');
        }
    };

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => activateTab(trigger));
        trigger.addEventListener('click', () => activateTab(trigger));
        trigger.addEventListener('focus', () => activateTab(trigger));

        // Navegação por Setas (Pattern de Acessibilidade para Tabs)
        trigger.addEventListener('keydown', (e) => {
            const parentPanel = trigger.closest('.mega-panel');
            const tabs = Array.from(parentPanel.querySelectorAll('.menu-tab-trigger'));
            const index = tabs.indexOf(trigger);
            let nextTab = null;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextTab = tabs[index + 1] || tabs[0]; // Loop para o início
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextTab = tabs[index - 1] || tabs[tabs.length - 1]; // Loop para o final
            }

            if (nextTab) {
                nextTab.focus(); // O evento focus já dispara activateTab
            }
        });
    });

    // --- 3. MENU MOBILE E ACORDEÕES ---
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
    
    // Elementos focáveis para Focus Trap
    let mobileFocusables = []; 

    function toggleMobileMenu(isOpen) {
        if (!mobileMenu || !mobileDrawer || !mobileBackdrop) return;

        if (isOpen) {
            lastFocusedElement = document.activeElement; // Salva quem abriu
            mobileMenu.classList.remove('hidden');
            mobileMenu.setAttribute('aria-hidden', 'false');
            
            // Gerenciar ARIA do botão trigger
            if(mobileMenuTrigger) mobileMenuTrigger.setAttribute('aria-expanded', 'true');

            setTimeout(() => {
                mobileBackdrop.classList.remove('opacity-0');
                mobileBackdrop.classList.add('opacity-100');
                mobileDrawer.classList.remove('-translate-x-full');
                mobileDrawer.classList.add('translate-x-0');
                
                // Focus Trap: Mover foco para o botão de fechar
                if (closeMobileMenuBtn) closeMobileMenuBtn.focus();
                
                // Capturar elementos focáveis atuais
                mobileFocusables = getFocusableElements(mobileDrawer);
            }, 10);
            document.body.style.overflow = 'hidden';

            // Adicionar listener para Focus Trap
            document.addEventListener('keydown', trapFocusMobile);

        } else {
            if(mobileMenuTrigger) mobileMenuTrigger.setAttribute('aria-expanded', 'false');
            
            mobileBackdrop.classList.remove('opacity-100');
            mobileBackdrop.classList.add('opacity-0');
            mobileDrawer.classList.remove('translate-x-0');
            mobileDrawer.classList.add('-translate-x-full');
            
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
                mobileMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                
                // Retornar foco
                if (lastFocusedElement) lastFocusedElement.focus();
            }, 300);

            // Remover listener
            document.removeEventListener('keydown', trapFocusMobile);
        }
    }

    // Função de Focus Trap
    function trapFocusMobile(e) {
        if (e.key !== 'Tab') return;

        const first = mobileFocusables[0];
        const last = mobileFocusables[mobileFocusables.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === first) {
                last.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === last) {
                first.focus();
                e.preventDefault();
            }
        }
    }

    if (mobileMenuTrigger) {
        mobileMenuTrigger.addEventListener('click', () => toggleMobileMenu(true));
        // Suporte tecla
        mobileMenuTrigger.addEventListener('keydown', (e) => {
            if(e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu(true);
            }
        });
    }

    if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', () => toggleMobileMenu(false));
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', () => toggleMobileMenu(false));

    // ESC fecha mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
            toggleMobileMenu(false);
        }
    });

    // Acordeões do Menu Mobile
    const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');
    accordionBtns.forEach(btn => {
        // Garantir atributos iniciais
        if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');

        const toggleAccordion = () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            // Opcional: Fechar outros
            accordionBtns.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    const otherContent = otherBtn.nextElementSibling;
                    if (otherContent) {
                        otherContent.style.maxHeight = '0px';
                        otherContent.setAttribute('hidden', '');
                    }
                    const otherIcon = otherBtn.querySelector('i');
                    if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                }
            });

            btn.setAttribute('aria-expanded', !isExpanded);
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('i');
            
            if (!isExpanded) {
                content.removeAttribute('hidden');
                content.style.maxHeight = content.scrollHeight + 'px';
                if (icon) icon.style.transform = 'rotate(180deg)';
            } else {
                content.setAttribute('hidden', '');
                content.style.maxHeight = '0px';
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        };

        btn.addEventListener('click', toggleAccordion);
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAccordion();
            }
        });
    });
});

// --- 4. FUNÇÕES GLOBAIS (ACESSABILIDADE E BUSCA) ---

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
    
    if (newSize >= 12 && newSize <= 24) {
        root.style.fontSize = newSize + 'px';
    }
};

window.performSearch = function(query) {
    const resultsContainer = document.getElementById('active-search-results');
    const defaultMsg = document.getElementById('default-search-msg');
    
    // Live Region para screen readers
    let liveRegion = document.getElementById('search-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'search-live-region';
        liveRegion.className = 'sr-only'; // Classe comum para screen-reader-only
        liveRegion.setAttribute('aria-live', 'polite');
        document.body.appendChild(liveRegion);
    }

    if (!resultsContainer || !defaultMsg) return;

    if (query.trim().length < 2) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        defaultMsg.classList.remove('hidden');
        liveRegion.textContent = ''; // Limpa aviso
        return;
    }

    resultsContainer.classList.remove('hidden');
    defaultMsg.classList.add('hidden');

    const database = [
        { title: 'Cálculo de Heparina', url: 'heparina.html', cat: 'Calculadora' },
        { title: 'Escala de Glasgow', url: 'glasgow.html', cat: 'Escala' },
        { title: 'Calendário Vacinal Adulto', url: 'calendariovacinaladultos.html', cat: 'Vacina' },
        { title: 'Cálculo de Gotejamento', url: 'gotejamento.html', cat: 'Calculadora' },
        { title: 'Diagnósticos NANDA', url: 'diagnosticosnanda.html', cat: 'Biblioteca' },
        { title: 'Cálculo de Insulina', url: 'insulina.html', cat: 'Calculadora' }
    ];

    const results = database.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length > 0) {
        resultsContainer.innerHTML = results.map(item => `
            <li>
                <a href="${item.url}" class="group flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-all border-b border-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-file-medical text-blue-600"></i>
                        <span class="text-gray-700 font-medium group-hover:text-blue-700">${item.title}</span>
                    </div>
                    <span class="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">${item.cat}</span>
                </a>
            </li>
        `).join('');
        liveRegion.textContent = `${results.length} resultados encontrados.`;
    } else {
        resultsContainer.innerHTML = `
            <li class="p-8 text-center">
                <i class="fas fa-search text-gray-200 text-4xl mb-3 block"></i>
                <p class="text-gray-500">Nenhum resultado para "${query}"</p>
            </li>
        `;
        liveRegion.textContent = `Nenhum resultado para ${query}.`;
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
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('#theme-toggle i');
        const btn = document.getElementById('theme-toggle');
        if (icon) icon.className = 'fas fa-sun';
        if (btn) btn.setAttribute('aria-label', 'Alternar para modo claro');
    }
})();