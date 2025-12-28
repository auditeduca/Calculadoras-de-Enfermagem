/**
 * CALCULADORAS DE ENFERMAGEM - HEADER ENGINE
 * Versão: 3.0 - Corrigida para Sistema Modular
 * 
 * Funcionalidades:
 * - Mega-menus com tabs internos
 * - Menu mobile com acordeões
 * - Sistema de busca integrado
 * - Controles de acessibilidade (tema, fonte)
 * - Acessibilidade WCAG 2.1
 */

(function() {
  'use strict';

  /**
   * Inicializa o header quando o DOM estiver pronto
   */
  function initHeader() {
    initMegaPanels();
    initMobileMenu();
    initAccessibility();
    initSearch();
    initTheme();
  }

  /**
   * Gerencia os Mega Panels (menus dropdown)
   */
  function initMegaPanels() {
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
    navTriggers.forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        const panelId = this.getAttribute('data-panel');
        if (!panelId) return;

        const targetPanel = document.getElementById(panelId);

        if (activePanelId === panelId) {
          closeAllPanels();
        } else {
          closeAllPanels();
          if (targetPanel) {
            targetPanel.classList.add('active');
            this.setAttribute('aria-expanded', 'true');
            this.classList.add('active-nav');
            activePanelId = panelId;
          }
        }
        e.stopPropagation();
      });

      // Feedback visual ao hover
      trigger.addEventListener('mouseenter', function() {
        if (activePanelId === null) {
          this.style.color = '#1A3E74';
        }
      });

      trigger.addEventListener('mouseleave', function() {
        if (activePanelId === null) {
          this.style.color = '';
        }
      });
    });

    // Fechar ao clicar fora dos painéis
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.mega-panel') && !e.target.closest('.nav-trigger[data-panel]')) {
        closeAllPanels();
      }
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeAllPanels();
    });

    // Lógica de tabs dentro dos mega panels
    initPanelTabs();
  }

  /**
   * Gerencia as tabs dentro dos mega panels
   */
  function initPanelTabs() {
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    
    tabTriggers.forEach(trigger => {
      const activateTab = function() {
        const parentPanel = this.closest('.mega-panel');
        if (!parentPanel) return;

        const targetId = this.getAttribute('data-target');

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
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        const icon = this.querySelector('i');
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
  }

  /**
   * Gerencia o menu mobile
   */
  function initMobileMenu() {
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');

    if (!mobileMenuTrigger || !mobileMenu) return;

    function toggleMobileMenu(isOpen) {
      if (!mobileMenu || !mobileDrawer || !mobileBackdrop) return;

      if (isOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.setAttribute('aria-hidden', 'false');
        
        if (mobileMenuTrigger) {
          mobileMenuTrigger.setAttribute('aria-expanded', 'true');
        }
        
        setTimeout(function() {
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
        
        setTimeout(function() {
          mobileMenu.classList.add('hidden');
          mobileMenu.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }, 300);
      }
    }

    if (mobileMenuTrigger) {
      mobileMenuTrigger.addEventListener('click', function() {
        toggleMobileMenu(true);
      });
    }

    if (closeMobileMenuBtn) {
      closeMobileMenuBtn.addEventListener('click', function() {
        toggleMobileMenu(false);
      });
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', function() {
        toggleMobileMenu(false);
      });
    }

    // Acordeões do Menu Mobile
    const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');
    accordionBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';

        // Fechar outros acordeões ao abrir um novo
        accordionBtns.forEach(function(otherBtn) {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherBtn.classList.remove('active');
            const otherContent = otherBtn.nextElementSibling;
            if (otherContent) otherContent.style.maxHeight = '0px';
            const otherIcon = otherBtn.querySelector('i');
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
          }
        });

        this.setAttribute('aria-expanded', !isExpanded);
        if (!isExpanded) {
          this.classList.add('active');
        } else {
          this.classList.remove('active');
        }

        const content = this.nextElementSibling;
        const icon = this.querySelector('i');

        if (!isExpanded) {
          content.style.maxHeight = content.scrollHeight + 'px';
          if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
          content.style.maxHeight = '0px';
          if (icon) icon.style.transform = 'rotate(0deg)';
        }
      });
    });
  }

  /**
   * Inicializa controles de acessibilidade
   */
  function initAccessibility() {
    // Tamanho da fonte
    window.changeFontSize = function(action) {
      const root = document.documentElement;
      const currentSize = parseFloat(getComputedStyle(root).fontSize) || 16;
      let newSize = action === 'increase' ? currentSize + 1 : currentSize - 1;

      // Limites saudáveis para acessibilidade
      if (newSize >= 12 && newSize <= 24) {
        root.style.fontSize = newSize + 'px';
        localStorage.setItem('fontSize', newSize);
      }
    };

    // Restaurar tamanho da fonte salvo
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      document.documentElement.style.fontSize = savedFontSize + 'px';
    }
  }

  /**
   * Inicializa sistema de tema (claro/escuro)
   */
  function initTheme() {
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

    // Aplicar tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-theme');
      const icon = document.querySelector('#theme-toggle i');
      if (icon) icon.className = 'fas fa-sun';
    }
  }

  /**
   * Inicializa sistema de busca
   */
  function initSearch() {
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

      // Banco de dados de busca
      const database = [
        { title: 'Cálculo de Heparina', url: 'heparina.html', cat: 'Calculadora' },
        { title: 'Escala de Glasgow', url: 'glasgow.html', cat: 'Escala' },
        { title: 'Calendário Vacinal Adulto', url: 'calendariovacinaladultos.html', cat: 'Vacina' },
        { title: 'Cálculo de Gotejamento', url: 'gotejamento.html', cat: 'Calculadora' },
        { title: 'Diagnósticos NANDA', url: 'diagnosticos-nanda.html', cat: 'Biblioteca' },
        { title: 'Cálculo de Insulina', url: 'insulina.html', cat: 'Calculadora' },
        { title: 'Escala de Braden', url: 'braden.html', cat: 'Escala' },
        { title: 'IMC - Índice de Massa Corporal', url: 'imc.html', cat: 'Calculadora' },
        { title: 'Escala de Apgar', url: 'apgar.html', cat: 'Escala' },
        { title: 'Balanço Hídrico', url: 'balancohidrico.html', cat: 'Calculadora' },
        { title: 'Escala de APACHE II', url: 'apache.html', cat: 'UTI' },
        { title: 'Escala de Aldrete', url: 'aldrete.html', cat: 'Recuperação' }
      ];

      const results = database.filter(function(item) {
        return item.title.toLowerCase().includes(query.toLowerCase()) ||
               item.cat.toLowerCase().includes(query.toLowerCase());
      });

      if (results.length > 0) {
        resultsContainer.innerHTML = results.map(function(item) {
          return '<li>' +
            '<a href="' + item.url + '" class="group flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-all border-b border-gray-50">' +
              '<div class="flex items-center gap-3">' +
                '<i class="fas fa-file-medical text-blue-600"></i>' +
                '<span class="text-gray-700 font-medium group-hover:text-blue-700">' + item.title + '</span>' +
              '</div>' +
              '<span class="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">' + item.cat + '</span>' +
            '</a>' +
          '</li>';
        }).join('');
      } else {
        resultsContainer.innerHTML = '<li class="p-8 text-center">' +
          '<i class="fas fa-search text-gray-200 text-4xl mb-3 block"></i>' +
          '<p class="text-gray-500">Nenhum resultado para "' + query + '"</p>' +
        '</li>';
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
  }

  /**
   * Espera o Template Engine estar pronto antes de inicializar
   */
  function waitForDOM() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initHeader, 50);
      });
    } else {
      setTimeout(initHeader, 50);
    }
  }

  // Inicializar quando o DOM estiver pronto
  waitForDOM();

  // Também ouvir o evento do Template Engine
  window.addEventListener('TemplateEngine:Ready', function() {
    setTimeout(initHeader, 100);
  });

})();
