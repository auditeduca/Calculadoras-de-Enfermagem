/**
 * CALCULADORAS DE ENFERMAGEM - CORE HEADER ENGINE
 * Versão: 2.5 - Sincronizado com Template Engine
 * 
 * IMPORTANTE: Este script deve rodar APÓS o Template Engine injetar o header
 */

class HeaderEngine {
  constructor() {
    this.activePanelId = null;
    this.initialized = false;
  }

  /**
   * Inicializa o Header Engine
   */
  init() {
    if (this.initialized) {
      console.warn('[HeaderEngine] Já inicializado');
      return;
    }

    console.log('[HeaderEngine] Inicializando...');
    
    // 1. GERENCIAMENTO DOS MEGA PANELS
    this.initMegaPanels();
    
    // 2. MENU MOBILE
    this.initMobileMenu();
    
    // 3. ACORDEÕES MOBILE
    this.initMobileAccordions();
    
    this.initialized = true;
    console.log('[HeaderEngine] Inicializado com sucesso');
    
    // Dispara evento de inicialização completa
    window.dispatchEvent(new CustomEvent('HeaderEngine:Ready'));
  }

  /**
   * Inicializa Mega Panels
   */
  initMegaPanels() {
    const navTriggers = document.querySelectorAll('.nav-trigger[data-panel]');
    const megaPanels = document.querySelectorAll('.mega-panel');

    console.log(`[HeaderEngine] Encontrados ${navTriggers.length} nav-triggers e ${megaPanels.length} mega-panels`);

    // Função para fechar todos os painéis
    const closeAllPanels = () => {
      megaPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
      });
      
      navTriggers.forEach(trigger => {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.classList.remove('active-nav');
      });
      
      this.activePanelId = null;
    };

    // Event listeners para mega-menus
    navTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const panelId = trigger.getAttribute('data-panel');
        if (!panelId) return;

        const targetPanel = document.getElementById(panelId);
        if (!targetPanel) {
          console.warn(`[HeaderEngine] Painel não encontrado: ${panelId}`);
          return;
        }

        if (this.activePanelId === panelId) {
          // Se clicar no mesmo, fecha
          closeAllPanels();
        } else {
          // Fecha todos e abre o selecionado
          closeAllPanels();
          targetPanel.classList.add('active');
          targetPanel.setAttribute('aria-hidden', 'false');
          trigger.setAttribute('aria-expanded', 'true');
          trigger.classList.add('active-nav');
          this.activePanelId = panelId;
        }
      });

      // Feedback visual ao hover
      trigger.addEventListener('mouseenter', () => {
        if (this.activePanelId === null) {
          trigger.classList.add('text-[#1A3E74]');
        }
      });

      trigger.addEventListener('mouseleave', () => {
        if (this.activePanelId === null) {
          trigger.classList.remove('text-[#1A3E74]');
        }
      });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      const isMegaPanel = e.target.closest('.mega-panel');
      const isNavTrigger = e.target.closest('.nav-trigger[data-panel]');
      
      if (!isMegaPanel && !isNavTrigger) {
        closeAllPanels();
      }
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeAllPanels();
      }
    });

    // Lógica de Tabs dentro dos Mega Panels
    this.initMegaPanelTabs();
  }

  /**
   * Inicializa tabs dentro dos mega panels
   */
  initMegaPanelTabs() {
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    
    tabTriggers.forEach(trigger => {
      const activateTab = (e) => {
        e.preventDefault();
        
        const parentPanel = trigger.closest('.mega-panel');
        if (!parentPanel) return;

        const targetId = trigger.getAttribute('data-target');
        if (!targetId) return;

        // Resetar todos os triggers e conteúdos deste painel
        parentPanel.querySelectorAll('.menu-tab-trigger').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
          const icon = t.querySelector('i');
          if (icon) icon.classList.add('opacity-0');
        });

        parentPanel.querySelectorAll('.tab-content').forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-hidden', 'true');
        });

        // Ativar a tab selecionada
        trigger.classList.add('active');
        trigger.setAttribute('aria-selected', 'true');
        const icon = trigger.querySelector('i');
        if (icon) icon.classList.remove('opacity-0');

        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
          targetContent.setAttribute('aria-hidden', 'false');
        }
      };

      trigger.addEventListener('click', activateTab);
      trigger.addEventListener('mouseenter', activateTab);
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateTab(e);
        }
      });
    });
  }

  /**
   * Inicializa Menu Mobile
   */
  initMobileMenu() {
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');

    if (!mobileMenu || !mobileDrawer || !mobileBackdrop) {
      console.warn('[HeaderEngine] Elementos do menu mobile não encontrados');
      return;
    }

    const toggleMobileMenu = (isOpen) => {
      if (isOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.setAttribute('aria-hidden', 'false');
        
        if (mobileMenuTrigger) {
          mobileMenuTrigger.setAttribute('aria-expanded', 'true');
        }
        
        // Delay para transição CSS
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
        
        if (mobileMenuTrigger) {
          mobileMenuTrigger.setAttribute('aria-expanded', 'false');
        }
        
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
          mobileMenu.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }, 300);
      }
    };

    if (mobileMenuTrigger) {
      mobileMenuTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMobileMenu(true);
      });
    }

    if (closeMobileMenuBtn) {
      closeMobileMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMobileMenu(false);
      });
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMobileMenu(false);
      });
    }

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        toggleMobileMenu(false);
      }
    });
  }

  /**
   * Inicializa Acordeões Mobile
   */
  initMobileAccordions() {
    const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');
    
    accordionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        
        // Fechar outros acordeões (comportamento de accordion)
        if (!isExpanded) {
          accordionBtns.forEach(otherBtn => {
            if (otherBtn !== btn) {
              otherBtn.setAttribute('aria-expanded', 'false');
              otherBtn.classList.remove('active');
              const otherContent = otherBtn.nextElementSibling;
              if (otherContent) {
                otherContent.style.maxHeight = '0px';
              }
              const otherIcon = otherBtn.querySelector('i');
              if (otherIcon) {
                otherIcon.style.transform = 'rotate(0deg)';
              }
            }
          });
        }

        // Alternar estado atual
        btn.setAttribute('aria-expanded', !isExpanded);
        btn.classList.toggle('active', !isExpanded);
        
        const content = btn.nextElementSibling;
        const icon = btn.querySelector('i');
        
        if (!isExpanded) {
          // Abrir
          if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
          }
          if (icon) {
            icon.style.transform = 'rotate(180deg)';
          }
        } else {
          // Fechar
          if (content) {
            content.style.maxHeight = '0px';
          }
          if (icon) {
            icon.style.transform = 'rotate(0deg)';
          }
        }
      });
    });
  }

  /**
   * Fecha todos os painéis abertos (método público)
   */
  closeAllPanels() {
    const megaPanels = document.querySelectorAll('.mega-panel');
    const navTriggers = document.querySelectorAll('.nav-trigger[data-panel]');
    
    megaPanels.forEach(panel => {
      panel.classList.remove('active');
      panel.setAttribute('aria-hidden', 'true');
    });
    
    navTriggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.classList.remove('active-nav');
    });
    
    this.activePanelId = null;
  }
}

// Cria instância global
window.headerEngine = new HeaderEngine();

// Sistema de inicialização sincronizado
function initializeHeaderEngine() {
  // Aguarda o Template Engine injetar o header
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForHeaderElements();
    });
  } else {
    waitForHeaderElements();
  }
}

function waitForHeaderElements() {
  const checkInterval = setInterval(() => {
    const navTriggers = document.querySelectorAll('.nav-trigger[data-panel]');
    const megaPanels = document.querySelectorAll('.mega-panel');
    
    if (navTriggers.length > 0 && megaPanels.length > 0) {
      clearInterval(checkInterval);
      console.log('[HeaderEngine] Elementos do header detectados, inicializando...');
      window.headerEngine.init();
    }
  }, 100);

  // Timeout após 10 segundos
  setTimeout(() => {
    clearInterval(checkInterval);
    const navTriggers = document.querySelectorAll('.nav-trigger[data-panel]');
    if (navTriggers.length > 0) {
      console.log('[HeaderEngine] Inicializando com timeout...');
      window.headerEngine.init();
    } else {
      console.warn('[HeaderEngine] Timeout: Elementos do header não encontrados');
    }
  }, 10000);
}

// Inicializa quando Template Engine estiver pronto
if (window.templateEngine) {
  window.addEventListener('TemplateEngine:Ready', () => {
    setTimeout(initializeHeaderEngine, 100);
  });
} else {
  // Fallback: inicializa diretamente
  initializeHeaderEngine();
}

// --- FUNÇÕES GLOBAIS (para compatibilidade com HTML) ---

window.toggleTheme = function() {
  if (window.ThemeConfig && typeof window.ThemeConfig.toggle === 'function') {
    window.ThemeConfig.toggle();
  } else {
    // Fallback simples
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
  }
};

window.changeFontSize = function(action) {
  const root = document.documentElement;
  const currentSize = parseFloat(getComputedStyle(root).fontSize) || 16;
  let newSize = action === 'increase' ? currentSize + 1 : currentSize - 1;
  
  // Limites para acessibilidade
  if (newSize >= 12 && newSize <= 24) {
    root.style.fontSize = newSize + 'px';
    localStorage.setItem('fontSize', newSize);
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

// Inicialização de estado (persistência)
(function initHeaderState() {
  // Aplicar tema guardado
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = 'fas fa-sun';
  }
  
  // Aplicar tamanho de fonte guardado
  const savedFontSize = localStorage.getItem('fontSize');
  if (savedFontSize) {
    document.documentElement.style.fontSize = savedFontSize + 'px';
  }
})();