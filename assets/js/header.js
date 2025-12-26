/**
 * CALCULADORAS DE ENFERMAGEM - CORE HEADER ENGINE (DEFINITIVO)
 * Versão: 3.0 - Híbrida
 * Combina a arquitetura modular limpa com as funcionalidades ricas (Search, ARIA, Mobile Trap) da versão legado.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- UTILS: Helper para acessibilidade (Focus Trap) ---
    function getFocusableElements(element) {
        return element.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
    }

    // =========================================================================
    // 1. GERENCIAMENTO DOS MEGA PANELS (DESKTOP)
    // =========================================================================
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const megaPanels = document.querySelectorAll('.mega-panel');
    let activePanelId = null;
    let lastFocusedElement = null; // Para retornar o foco ao fechar

    // Função para fechar todos os painéis e limpar estados ARIA
    function closeAllPanels() {
        megaPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
        });
        navTriggers.forEach(t => {
            t.classList.remove('active-nav');
            t.setAttribute('aria-expanded', 'false');
            
            // Restaura opacidade do ícone (visual)
            const icon = t.querySelector('i');
            if(icon) icon.classList.add('opacity-70');
        });
        activePanelId = null;
    }

    navTriggers.forEach(trigger => {
        // Configuração inicial ARIA
        const panelId = trigger.getAttribute('data-panel');
        if (panelId) {
            trigger.setAttribute('aria-controls', panelId);
            trigger.setAttribute('aria-haspopup', 'true');
            trigger.setAttribute('aria-expanded', 'false');
        }

        const togglePanel = (e) => {
            e.stopPropagation();

            // Previne scroll ou comportamento padrão se for link
            if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
                if(trigger.tagName === 'A') e.preventDefault();
            }

            const targetPanel = document.getElementById(panelId);
            if (!targetPanel) return;

            if (activePanelId === panelId) {
                // Se já está aberto, fecha
                closeAllPanels();
                // Retorna foco se foi via teclado
                if (e.type !== 'mouseenter' && e.type !== 'click') trigger.focus();
            } else {
                // Abre o novo painel
                closeAllPanels(); // Fecha outros
                
                targetPanel.classList.add('active');
                targetPanel.setAttribute('aria-hidden', 'false');
                
                trigger.classList.add('active-nav');
                trigger.setAttribute('aria-expanded', 'true');
                
                // Visual: Ícone mais forte
                const icon = trigger.querySelector('i');
                if(icon) icon.classList.remove('opacity-70');

                activePanelId = panelId;

                // Lógica Especial: Se for painel de busca, foca no input
                if (panelId.includes('busca') || panelId.includes('search')) {
                    const input = targetPanel.querySelector('input');
                    if (input) setTimeout(() => input.focus(), 100);
                }
            }
        };

        trigger.addEventListener('click', togglePanel);
        
        // Acessibilidade: Teclado
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                togglePanel(e);
            }
        });
    });

    // Fechar ao clicar fora (Click Outside)
    document.addEventListener('click', (e) => {
        if (activePanelId) {
            const isClickInsidePanel = e.target.closest('.mega-panel');
            const isClickOnTrigger = e.target.closest('.nav-trigger');

            if (!isClickInsidePanel && !isClickOnTrigger) {
                closeAllPanels();
            }
        }
    });

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllPanels();
            // Tenta retornar o foco para o trigger original se possível
            if (document.activeElement.closest('.mega-panel')) {
                 // Lógica simplificada de retorno de foco
                 const firstTrigger = document.querySelector('.nav-trigger');
                 if(firstTrigger) firstTrigger.focus(); 
            }
        }
    });

    // =========================================================================
    // 2. LÓGICA DE TABS DENTRO DOS MEGA PANELS (Calculadoras, Escalas...)
    // =========================================================================
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');

    // Inicialização ARIA para Tabs
    tabTriggers.forEach(trigger => {
        trigger.setAttribute('role', 'tab');
        trigger.setAttribute('aria-selected', 'false');
        const targetId = trigger.getAttribute('data-target');
        if (targetId) trigger.setAttribute('aria-controls', targetId);
    });

    const activateTab = (trigger) => {
        const parentPanel = trigger.closest('.mega-panel') || document.body; // Fallback
        const targetId = trigger.getAttribute('data-target');

        // 1. Resetar abas irmãs
        const siblingTriggers = parentPanel.querySelectorAll('.menu-tab-trigger');
        siblingTriggers.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1'); 
        });

        // 2. Resetar conteúdos
        const siblingContents = parentPanel.querySelectorAll('.tab-content');
        siblingContents.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('hidden', '');
        });

        // 3. Ativar trigger atual
        trigger.classList.add('active');
        trigger.setAttribute('aria-selected', 'true');
        trigger.setAttribute('tabindex', '0');

        // 4. Ativar conteúdo alvo
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.removeAttribute('hidden');
        }
    };

    tabTriggers.forEach(trigger => {
        // Ativação por Hover (Desktop UX)
        trigger.addEventListener('mouseenter', () => activateTab(trigger));
        
        // Ativação por Foco/Click (Acessibilidade)
        trigger.addEventListener('focus', () => activateTab(trigger));
        trigger.addEventListener('click', () => activateTab(trigger));

        // Navegação por Setas (Keyboard Navigation - WCAG)
        trigger.addEventListener('keydown', (e) => {
            const parentPanel = trigger.closest('.mega-panel') || trigger.parentElement;
            // Pega apenas as tabs visíveis neste grupo
            const tabs = Array.from(parentPanel.querySelectorAll('.menu-tab-trigger'));
            const index = tabs.indexOf(trigger);
            let nextTab = null;

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                nextTab = tabs[index + 1] || tabs[0]; // Loop para o início
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                nextTab = tabs[index - 1] || tabs[tabs.length - 1]; // Loop para o final
            }

            if (nextTab) {
                nextTab.focus(); // O evento 'focus' já dispara o activateTab
            }
        });
    });

    // =========================================================================
    // 3. MENU MOBILE E ACORDEÕES (Restaurado do Legado)
    // =========================================================================
    const mobileMenuTrigger = document.querySelector('.lg\\:hidden.text-2xl'); // Seletor baseado nas classes Tailwind do botão
    // Se o HTML tiver IDs específicos, melhor usar getElementById. 
    // Assumindo IDs padrão para garantir compatibilidade:
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileBtn = document.getElementById('close-mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
    
    let mobileFocusables = [];

    function toggleMobileMenu(isOpen) {
        if (!mobileMenu) return; // Segurança caso o HTML mobile não exista

        if (isOpen) {
            lastFocusedElement = document.activeElement;
            mobileMenu.classList.remove('hidden');
            mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Bloqueia scroll do fundo

            // Animação de entrada (se houver elementos de drawer)
            if (mobileDrawer && mobileBackdrop) {
                setTimeout(() => {
                    mobileBackdrop.classList.remove('opacity-0');
                    mobileBackdrop.classList.add('opacity-100');
                    mobileDrawer.classList.remove('-translate-x-full');
                    mobileDrawer.classList.add('translate-x-0');
                    
                    // Focus Trap
                    mobileFocusables = getFocusableElements(mobileDrawer);
                    if (closeMobileBtn) closeMobileBtn.focus();
                }, 10);
            }

            document.addEventListener('keydown', trapFocusMobile);

        } else {
            // Fechar
            if (mobileDrawer && mobileBackdrop) {
                mobileBackdrop.classList.remove('opacity-100');
                mobileBackdrop.classList.add('opacity-0');
                mobileDrawer.classList.remove('translate-x-0');
                mobileDrawer.classList.add('-translate-x-full');
            }

            setTimeout(() => {
                mobileMenu.classList.add('hidden');
                mobileMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                if (lastFocusedElement) lastFocusedElement.focus();
            }, 300);

            document.removeEventListener('keydown', trapFocusMobile);
        }
    }

    // Função de Trap Focus para Mobile
    function trapFocusMobile(e) {
        if (e.key !== 'Tab') return;
        if (mobileFocusables.length === 0) return;

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

    // Event Listeners Mobile
    if (mobileMenuTrigger) {
        mobileMenuTrigger.addEventListener('click', () => toggleMobileMenu(true));
    }
    if (closeMobileBtn) {
        closeMobileBtn.addEventListener('click', () => toggleMobileMenu(false));
    }
    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', () => toggleMobileMenu(false));
    }

    // Acordeões Mobile (Submenus)
    const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');
    accordionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            // Fecha outros (Opcional - UX choice)
            accordionBtns.forEach(other => {
                if(other !== btn) {
                    other.setAttribute('aria-expanded', 'false');
                    other.classList.remove('active');
                    const content = other.nextElementSibling;
                    if(content) {
                        content.style.maxHeight = '0px';
                        content.setAttribute('hidden', '');
                    }
                }
            });

            // Toggle atual
            btn.setAttribute('aria-expanded', !isExpanded);
            const content = btn.nextElementSibling;
            
            if (!isExpanded) {
                btn.classList.add('active');
                content.removeAttribute('hidden');
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                btn.classList.remove('active');
                content.setAttribute('hidden', '');
                content.style.maxHeight = '0px';
            }
        });
    });
});

// =========================================================================
// 4. FUNÇÕES GLOBAIS (ESCOPO WINDOW)
// Necessárias para botões onclick="..." e Search Engine
// =========================================================================

// --- Theme Toggle ---
window.toggleTheme = function() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    
    // Suporte a Tailwind 'dark' class se estiver sendo usada
    body.classList.toggle('dark'); 

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Atualiza ícone se existir
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
};

// --- Font Resize ---
window.changeFontSize = function(action) {
    const root = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(root).fontSize) || 16;
    let newSize = action === 'increase' ? currentSize + 1 : currentSize - 1;
    
    if (newSize >= 12 && newSize <= 24) {
        root.style.fontSize = newSize + 'px';
    }
};

// --- Search Engine (Simulado) ---
window.performSearch = function(query) {
    const resultsContainer = document.getElementById('active-search-results');
    const defaultMsg = document.getElementById('default-search-msg');
    const liveRegion = document.getElementById('search-live-region'); // Para leitores de tela

    if (!resultsContainer) return;

    // Limpar se query for curta
    if (!query || query.trim().length < 2) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        if(defaultMsg) defaultMsg.classList.remove('hidden');
        if(liveRegion) liveRegion.textContent = '';
        return;
    }

    if(defaultMsg) defaultMsg.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    // Banco de Dados Simulado
    const database = [
        { title: 'Cálculo de Heparina', url: '#', cat: 'Calculadora' },
        { title: 'Escala de Glasgow', url: '#', cat: 'Escala' },
        { title: 'Calendário Vacinal Adulto', url: '#', cat: 'Vacina' },
        { title: 'Cálculo de Gotejamento', url: '#', cat: 'Calculadora' },
        { title: 'Diagnósticos NANDA', url: '#', cat: 'Biblioteca' },
        { title: 'Cálculo de Insulina', url: '#', cat: 'Calculadora' },
        { title: 'Drogas Vasoativas', url: '#', cat: 'Guia' }
    ];

    const results = database.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length > 0) {
        resultsContainer.innerHTML = results.map(item => `
            <li>
                <a href="${item.url}" class="group flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-all border-b border-gray-50 focus:bg-blue-50 focus:outline-none">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-file-medical text-blue-600"></i>
                        <span class="text-gray-700 font-medium group-hover:text-blue-700">${item.title}</span>
                    </div>
                    <span class="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">${item.cat}</span>
                </a>
            </li>
        `).join('');
        if(liveRegion) liveRegion.textContent = `${results.length} resultados encontrados.`;
    } else {
        resultsContainer.innerHTML = `
            <li class="p-8 text-center">
                <i class="fas fa-search text-gray-200 text-4xl mb-3 block"></i>
                <p class="text-gray-500">Nenhum resultado para "${query}"</p>
            </li>
        `;
        if(liveRegion) liveRegion.textContent = `Nenhum resultado para ${query}.`;
    }
};

window.clearSearch = function() {
    const input = document.getElementById('panel-busca-input'); // Certifique-se que o ID input existe no HTML
    if (input) {
        input.value = '';
        input.focus();
        window.performSearch('');
    }
};

// --- Inicialização de Estado (Persistência) ---
(function initHeader() {
    // 1. Aplicar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
        document.body.classList.add('dark');
        
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = 'fas fa-sun';
    }

    // 2. Criar Live Region para Busca (Acessibilidade) se não existir
    if (!document.getElementById('search-live-region')) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'search-live-region';
        liveRegion.className = 'sr-only'; // Classe comum para screen-reader-only
        liveRegion.setAttribute('aria-live', 'polite');
        document.body.appendChild(liveRegion);
    }
})();