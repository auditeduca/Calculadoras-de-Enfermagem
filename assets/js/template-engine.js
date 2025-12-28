/**
 * HEADER.JS - Engine do Header
 * Inicializado APÓS o Template Engine carregar o header
 */

// Função principal de inicialização do Header
function initHeader() {
  console.log('[Header] Inicializando...');
  
  // Verifica se os elementos existem
  const navTriggers = document.querySelectorAll('.nav-trigger[data-panel]');
  const megaPanels = document.querySelectorAll('.mega-panel');
  
  if (navTriggers.length === 0 || megaPanels.length === 0) {
    console.warn('[Header] Elementos não encontrados. Aguardando...');
    setTimeout(initHeader, 100);
    return;
  }
  
  console.log(`[Header] Encontrados ${navTriggers.length} nav-triggers e ${megaPanels.length} mega-panels`);
  
  // 1. INICIALIZAR MEGA PANELS
  initMegaPanels(navTriggers, megaPanels);
  
  // 2. INICIALIZAR MENU MOBILE
  initMobileMenu();
  
  // 3. INICIALIZAR ACORDEÕES MOBILE
  initMobileAccordions();
  
  console.log('[Header] Inicializado com sucesso');
  
  // Dispara evento
  window.dispatchEvent(new CustomEvent('Header:Ready'));
}

// Função para inicializar Mega Panels
function initMegaPanels(navTriggers, megaPanels) {
  let activePanelId = null;
  
  // Fecha todos os painéis
  function closeAllPanels() {
    megaPanels.forEach(panel => {
      panel.classList.remove('active');
      panel.setAttribute('aria-hidden', 'true');
    });
    
    navTriggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.classList.remove('active-nav');
    });
    
    activePanelId = null;
  }
  
  // Configura cada nav-trigger
  navTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const panelId = trigger.getAttribute('data-panel');
      if (!panelId) return;
      
      const targetPanel = document.getElementById(panelId);
      if (!targetPanel) return;
      
      if (activePanelId === panelId) {
        // Clicou no mesmo, fecha
        closeAllPanels();
      } else {
        // Fecha todos e abre o novo
        closeAllPanels();
        targetPanel.classList.add('active');
        targetPanel.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
        trigger.classList.add('active-nav');
        activePanelId = panelId;
      }
    });
    
    // Feedback visual
    trigger.addEventListener('mouseenter', () => {
      if (activePanelId === null) {
        trigger.classList.add('text-[#1A3E74]');
      }
    });
    
    trigger.addEventListener('mouseleave', () => {
      if (activePanelId === null) {
        trigger.classList.remove('text-[#1A3E74]');
      }
    });
  });
  
  // Fecha ao clicar fora
  document.addEventListener('click', (e) => {
    const isMegaPanel = e.target.closest('.mega-panel');
    const isNavTrigger = e.target.closest('.nav-trigger[data-panel]');
    
    if (!isMegaPanel && !isNavTrigger) {
      closeAllPanels();
    }
  });
  
  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPanels();
    }
  });
  
  // Inicializa tabs internas
  initMegaPanelTabs();
}

// Função para inicializar tabs dentro dos Mega Panels
function initMegaPanelTabs() {
  const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
  
  tabTriggers.forEach(trigger => {
    const activateTab = (e) => {
      e.preventDefault();
      
      const parentPanel = trigger.closest('.mega-panel');
      if (!parentPanel) return;
      
      const targetId = trigger.getAttribute('data-target');
      if (!targetId) return;
      
      // Reseta todos os tabs deste painel
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
      
      // Ativa o tab selecionado
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
  });
}

// Função para inicializar Menu Mobile
function initMobileMenu() {
  const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
  const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileDrawer = document.getElementById('mobile-menu-drawer');
  const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
  
  if (!mobileMenu || !mobileDrawer || !mobileBackdrop) {
    console.warn('[Header] Elementos do menu mobile não encontrados');
    return;
  }
  
  function toggleMobileMenu(isOpen) {
    if (isOpen) {
      mobileMenu.classList.remove('hidden');
      mobileMenu.setAttribute('aria-hidden', 'false');
      
      if (mobileMenuTrigger) {
        mobileMenuTrigger.setAttribute('aria-expanded', 'true');
      }
      
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
  }
  
  if (mobileMenuTrigger) {
    mobileMenuTrigger.addEventListener('click', () => toggleMobileMenu(true));
  }
  
  if (closeMobileMenuBtn) {
    closeMobileMenuBtn.addEventListener('click', () => toggleMobileMenu(false));
  }
  
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', () => toggleMobileMenu(false));
  }
  
  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      toggleMobileMenu(false);
    }
  });
}

// Função para inicializar Acordeões Mobile
function initMobileAccordions() {
  const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');
  
  accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      // Fecha outros acordeões
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
      
      // Alterna estado atual
      btn.setAttribute('aria-expanded', !isExpanded);
      btn.classList.toggle('active', !isExpanded);
      
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('i');
      
      if (!isExpanded) {
        // Abre
        if (content) {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
        if (icon) {
          icon.style.transform = 'rotate(180deg)';
        }
      } else {
        // Fecha
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

// SISTEMA DE INICIALIZAÇÃO SINCRONIZADA

// Opção 1: Se Template Engine estiver disponível
if (window.templateEngine) {
  // Espera Template Engine carregar o header
  window.addEventListener('TemplateEngine:Ready', () => {
    // Pequeno delay para garantir que o HTML foi injetado
    setTimeout(initHeader, 200);
  });
} 
// Opção 2: Verificação periódica
else {
  // Tenta inicializar periodicamente
  let attempts = 0;
  const maxAttempts = 20; // 2 segundos
  
  function tryInitHeader() {
    const navTriggers = document.querySelectorAll('.nav-trigger[data-panel]');
    
    if (navTriggers.length > 0) {
      initHeader();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(tryInitHeader, 100);
    } else {
      console.warn('[Header] Timeout: Elementos não encontrados após múltiplas tentativas');
    }
  }
  
  // Inicia a verificação
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(tryInitHeader, 500);
    });
  } else {
    setTimeout(tryInitHeader, 500);
  }
}

// FUNÇÕES GLOBAIS (para compatibilidade com HTML onclick)
// Estas funções podem ser chamadas diretamente do HTML

window.toggleTheme = function() {
  // Tenta usar ThemeConfig se disponível
  if (window.ThemeConfig && typeof window.ThemeConfig.toggle === 'function') {
    window.ThemeConfig.toggle();
  } else {
    // Fallback básico
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
  
  // Limites de acessibilidade
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
  
  // Base de dados de exemplo
  const database = [
    { title: 'Cálculo de Heparina', url: 'heparina.html', cat: 'Calculadora' },
    { title: 'Escala de Glasgow', url: 'glasgow.html', cat: 'Escala' },
    { title: 'Calendário Vacinal Adulto', url: 'calendariovacinaladultos.html', cat: 'Vacina' },
    { title: 'Cálculo de Gotejamento', url: 'gotejamento.html', cat: 'Calculadora' },
    { title: 'Diagnósticos NANDA', url: 'diagnosticosnanda.html', cat: 'Biblioteca' }
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

// Inicialização de estado persistente
(function initPersistentState() {
  // Aplica tema salvo
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = 'fas fa-sun';
  }
  
  // Aplica tamanho de fonte salvo
  const savedFontSize = localStorage.getItem('fontSize');
  if (savedFontSize) {
    document.documentElement.style.fontSize = savedFontSize + 'px';
  }
})();