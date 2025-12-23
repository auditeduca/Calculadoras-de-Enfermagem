/**
 * HEADER-SCRIPTS.JS - Lógica de Interação e Menu (Mega-Menu)
 * Foco: Resiliência na inicialização, performance e compatibilidade.
 * Versão: 2.1 (Corrigida com sincronização do TemplateEngine)
 * 
 * CORREÇÃO: Melhorada sincronização com TemplateEngine para evitar race condition
 */

// --- 1. CONTROLADOR DO HEADER ---
const HeaderController = {
    isInitialized: false,
    retryCount: 0,
    maxRetries: 60, // Limite de tentativas para evitar loop infinito (aprox. 1s)

    /**
     * Inicializa o controlador com verificações de estabilidade do DOM.
     */
    init: function() {
        if (this.isInitialized) return;

        // Verifica se o container do header já possui conteúdo injetado
        const headerContainer = document.getElementById('header-container');

        // Se não houver container ou ele estiver vazio, tenta novamente
        if (!headerContainer || headerContainer.children.length === 0) {
            this.retryCount++;
            
            if (this.retryCount > this.maxRetries) {
                console.warn('⚠️ [Header Controller] Falha ao encontrar #header-container preenchido após várias tentativas. Abortando init.');
                return;
            }

            // Tenta novamente no próximo frame de animação
            requestAnimationFrame(() => this.init());
            return;
        }

        try {
            this.applySavedPreferences();
            this.bindEvents();
            this.isInitialized = true;
            console.log('✅ [Menu Debug] Sistema de Header estabilizado e inicializado.');
        } catch (error) {
            console.error('❌ [Header Controller] Erro crítico durante inicialização:', error);
        }
    },

    /**
     * Aplica as preferências de tema e fonte salvas no localStorage
     */
    applySavedPreferences: function() {
        try {
            // Tema
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
                this.updateThemeUI(true);
            } else {
                this.updateThemeUI(false);
            }

            // Tamanho da Fonte
            const savedFontSize = localStorage.getItem('fontSizeScale');
            if (savedFontSize) {
                document.documentElement.style.fontSize = savedFontSize + '%';
            }
        } catch (e) {
            console.warn('Erro ao ler preferências do LocalStorage:', e);
        }
    },

    /**
     * Atualiza os ícones e textos do botão de tema
     */
    updateThemeUI: function(isDark) {
        const themeBtn = document.querySelector('#theme-toggle');
        if (!themeBtn) return;

        const icon = themeBtn.querySelector('i');
        const span = themeBtn.querySelector('span');
        
        if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        if (span) span.innerText = isDark ? 'Modo Claro' : 'Modo Escuro';
    },

    /**
     * Fecha todos os painéis do Mega-Menu de forma robusta.
     */
    closeAllPanels: function() {
        const panels = document.querySelectorAll('.mega-panel');
        const triggers = document.querySelectorAll('.nav-trigger');
        
        panels.forEach(p => {
            p.classList.add('hidden');
            p.classList.remove('active');
            p.style.display = 'none'; // Fallback forçado
        });

        triggers.forEach(t => {
            t.setAttribute('aria-expanded', 'false');
            const icon = t.querySelector('.fa-chevron-down');
            if (icon) icon.style.transform = 'rotate(0deg)';
        });
    },

    bindEvents: function() {
        // --- DELEGAÇÃO DE EVENTOS GLOBAL ---
        document.addEventListener('click', (e) => {
            // 1. Mega Menu Triggers
            const trigger = e.target.closest('.nav-trigger');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = trigger.getAttribute('data-panel');
                const targetPanel = document.getElementById(targetId);
                
                if (!targetPanel) {
                    console.error('❌ [Menu Debug] Painel alvo não encontrado:', targetId);
                    return;
                }

                const isOpen = targetPanel.classList.contains('active') && targetPanel.style.display !== 'none';
                
                // Fecha outros antes de abrir o atual
                this.closeAllPanels();

                if (!isOpen) {
                    targetPanel.classList.remove('hidden');
                    targetPanel.classList.add('active');
                    targetPanel.style.setProperty('display', 'block', 'important');
                    
                    trigger.setAttribute('aria-expanded', 'true');
                    const icon = trigger.querySelector('.fa-chevron-down');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                    
                    // Integração segura com Utils.js
                    if (window.Utils && typeof window.Utils.animate?.fadeIn === 'function') {
                        window.Utils.animate.fadeIn(targetPanel, 200);
                    }
                }
                return;
            }

            // 2. Botões de Acessibilidade (Fonte e Tema) via Delegação
            const fontIncrease = e.target.closest('[aria-label="Aumentar fonte"]');
            const fontDecrease = e.target.closest('[aria-label="Diminuir fonte"]');
            const themeToggle = e.target.closest('#theme-toggle');

            if (fontIncrease) {
                window.changeFontSize('increase');
                return;
            }
            if (fontDecrease) {
                window.changeFontSize('decrease');
                return;
            }
            if (themeToggle) {
                window.toggleTheme();
                return;
            }

            // 3. Fechar ao clicar fora
            // Verifica se o clique NÃO foi no menu nem no header
            if (!e.target.closest('.mega-panel') && !e.target.closest('header')) {
                this.closeAllPanels();
            }

            // 4. Controlo Mobile
            const mobileBtn = e.target.closest('#mobile-menu-trigger');
            const closeBtn = e.target.closest('#close-mobile-menu');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileDrawer = document.getElementById('mobile-menu-drawer');

            if (mobileBtn) {
                if(mobileMenu) mobileMenu.classList.remove('hidden');
                setTimeout(() => mobileDrawer?.classList.add('open'), 10);
                document.body.style.overflow = 'hidden'; // Previne scroll no fundo
            }

            if (closeBtn || e.target.matches('#mobile-menu-backdrop')) {
                mobileDrawer?.classList.remove('open');
                setTimeout(() => {
                    if(mobileMenu) mobileMenu.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 300);
            }

            // 5. Accordion Mobile
            const accordionTrigger = e.target.closest('.mobile-accordion-trigger');
            if (accordionTrigger) {
                const sub = accordionTrigger.nextElementSibling;
                if (sub) {
                    sub.classList.toggle('open');
                    // Animação suave de altura
                    sub.style.maxHeight = sub.classList.contains('open') ? sub.scrollHeight + "px" : "0px";
                }
            }
        });

        // --- COMPORTAMENTO DE ABAS INTERNAS ---
        document.addEventListener('mouseover', (e) => {
            const tabTrigger = e.target.closest('.menu-tab-trigger');
            if (tabTrigger) {
                const parent = tabTrigger.closest('.mega-panel');
                if (!parent) return;

                const targetId = tabTrigger.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);

                // Reset das abas irmãs
                parent.querySelectorAll('.menu-tab-trigger').forEach(t => {
                    t.classList.remove('active', 'bg-gray-100', 'dark:bg-gray-800');
                });
                parent.querySelectorAll('.tab-content').forEach(c => {
                    c.classList.add('hidden');
                    c.style.display = 'none';
                });

                // Ativa a aba atual
                tabTrigger.classList.add('active', 'bg-gray-100', 'dark:bg-gray-800');
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    targetContent.style.display = 'block';
                }
            }
        });
    }
};

// --- 2. ORQUESTRAÇÃO DE INICIALIZAÇÃO COM SINCRONIZAÇÃO ---

/**
 * Tenta inicializar o HeaderController
 * Aguarda o TemplateEngine estar pronto antes de inicializar
 */
function attemptInitialization() {
    // Usa setTimeout para garantir que a Call Stack esteja limpa
    setTimeout(() => HeaderController.init(), 0);
}

/**
 * SINCRONIZAÇÃO MELHORADA:
 * Aguarda o evento 'templateEngineReady' do TemplateEngine
 * Isso garante que o HTML do header foi injetado antes de tentar inicializar
 */
window.addEventListener('templateEngineReady', () => {
    console.log('[Header Controller] TemplateEngine pronto, inicializando...');
    // Pequeno delay para garantir que o DOM foi completamente atualizado
    setTimeout(() => attemptInitialization(), 100);
});

/**
 * FALLBACK: Se o TemplateEngine não existir ou não disparar o evento,
 * tenta inicializar no evento 'load' padrão
 */
if (document.readyState === 'complete') {
    // Página já carregou, mas verifica se TemplateEngine foi inicializado
    if (!window.TemplateEngine) {
        console.warn('[Header Controller] TemplateEngine não encontrado, usando fallback...');
        attemptInitialization();
    }
} else {
    window.addEventListener('load', () => {
        // Se TemplateEngine não foi inicializado, tenta mesmo assim
        if (!window.TemplateEngine) {
            console.warn('[Header Controller] TemplateEngine não encontrado no load, usando fallback...');
            attemptInitialization();
        }
    });
}

/**
 * FUNÇÕES GLOBAIS (ACESSIBILIDADE E TEMA)
 * Expostas no window para acesso via HTML inline se necessário
 */
window.toggleTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch(e) {}
    HeaderController.updateThemeUI(isDark);
};

window.changeFontSize = function(action) {
    let current = parseInt(document.documentElement.style.fontSize) || 100;
    
    if (action === 'increase' && current < 130) current += 5;
    if (action === 'decrease' && current > 85) current -= 5;
    if (action === 'reset') current = 100;
    
    const newValue = current + '%';
    document.documentElement.style.fontSize = newValue;
    try {
        localStorage.setItem('fontSizeScale', current);
    } catch(e) {}
};
