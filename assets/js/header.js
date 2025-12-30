/**
 * CALCULADORAS DE ENFERMAGEM - CORE HEADER ENGINE
 * Versão: 2.7 - Integração com Utils.js e ThemeConfig
 *
 * IMPORTANTE: Este script deve rodar APÓS o Template Engine injetar o header
 */
class HeaderEngine {
  constructor() {
    this.activePanelId = null;
    this.initialized = false;
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    // URLs centralizadas das imagens do mega menu
    this.megaMenuImages = {
      sobrenos: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/mega-menu-sobre-nos.webp',
      ferramentas: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/mega-menu-ferramentas.webp',
      biblioteca: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/mega-menu-biblioteca.webp',
      carreiras: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/mega-menu-carreiras.webp',
      fale: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/mega-menu-fale-conosco.webp'
    };
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
    console.log(`[HeaderEngine] Dispositivo: ${this.isTouchDevice ? 'Touch' : 'Mouse/Trackpad'}`);

    // 1. GERENCIAMENTO DOS MEGA PANELS
    this.initMegaPanels();
    // 2. MENU MOBILE
    this.initMobileMenu();
    // 3. ACORDEÕES MOBILE
    this.initMobileAccordions();
    // 4. INICIALIZAÇÃO DAS IMAGENS DO MEGA MENU
    this.initMegaMenuImages();
    // 5. INICIALIZAÇÃO DO TEMA (se ThemeConfig disponível)
    this.initThemeIntegration();

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

    // ✅ CORREÇÃO: Fechar todos os painéis ao inicializar para garantir estado fechado
    closeAllPanels();
    console.log('[HeaderEngine] Todos os mega-panels fechados na inicialização');

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
   * Inicializa Acordeões Mobile com suporte a touch
   */
  initMobileAccordions() {
    const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');

    accordionBtns.forEach(btn => {
      // Em dispositivos touch, usar apenas click para evitar comportamento indesejado de hover
      const eventType = this.isTouchDevice ? 'click' : 'click';
      btn.addEventListener(eventType, () => {
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
   * Atualiza imagem do mega menu dinamicamente
   * @param {string} panelId - ID do painel (ex: 'panel-sobrenos')
   * @param {string} imageKey - Chave da imagem (ex: 'sobrenos')
   */
  updateMegaMenuImage(panelId, imageKey) {
    const panel = document.getElementById(panelId);
    if (!panel || !this.megaMenuImages[imageKey]) {
      console.warn(`[HeaderEngine] Painel ou imagem não encontrados: ${panelId}, ${imageKey}`);
      return;
    }
    const imgElement = panel.querySelector('.frame-image-container img');
    if (imgElement) {
      imgElement.src = this.megaMenuImages[imageKey];
      console.log(`[HeaderEngine] Imagem atualizada para: ${imageKey}`);
    }
  }

  /**
   * Retorna URL da imagem do mega menu
   * @param {string} imageKey - Chave da imagem
   * @returns {string} URL da imagem
   */
  getMegaMenuImageUrl(imageKey) {
    return this.megaMenuImages[imageKey] || null;
  }

  /**
   * Inicializa e verifica as imagens do mega menu
   */
  initMegaMenuImages() {
    console.log('[HeaderEngine] Imagens do mega menu disponíveis:', Object.keys(this.megaMenuImages));

    // Usar debounce se disponível no Utils
    const preloadImages = window.Utils && typeof window.Utils.debounce === 'function'
      ? window.Utils.debounce((key) => {
        const img = new Image();
        img.onerror = () => {
          console.warn(`[HeaderEngine] Imagem não encontrada: ${key} - ${this.megaMenuImages[key]}`);
        };
        img.onload = () => {
          console.log(`[HeaderEngine] Imagem carregada com sucesso: ${key}`);
        };
        img.src = this.megaMenuImages[key];
      }, 100)
      : (key) => {
        const img = new Image();
        img.onerror = () => {
          console.warn(`[HeaderEngine] Imagem não encontrada: ${key} - ${this.megaMenuImages[key]}`);
        };
        img.onload = () => {
          console.log(`[HeaderEngine] Imagem carregada com sucesso: ${key}`);
        };
        img.src = this.megaMenuImages[key];
      };

    // Verificar se as imagens existem e fazer fallback se necessário
    Object.keys(this.megaMenuImages).forEach(key => {
      preloadImages(key);
    });
  }

  /**
   * Integração com ThemeConfig
   */
  initThemeIntegration() {
    // Se ThemeConfig não existir, usar fallback simples
    if (!window.ThemeConfig) {
      window.toggleTheme = this.createSimpleThemeToggle();
      return;
    }

    // Usar ThemeConfig para toggle de tema
    window.toggleTheme = function() {
      window.ThemeConfig.toggle();
    };
  }

  /**
   * Cria função simples de toggle de tema (fallback)
   * @returns {Function}
   */
  createSimpleThemeToggle() {
    return function() {
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

// Cria instância global (deprecated by initHeaderState function below, but kept here for context)
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
// (Functions like changeFontSize, performSearch, clearSearch are omitted as they are not directly related to menu toggle or header initialization in general)

// Inicialização de estado (persistência) and Global Instance/Initialization
(function initHeaderState() {
  // (Theme and font size persistence code omitted as not directly related to menu toggle or header initialization in general)

  // ============================================
  // INSTANCIAÇÃO E INICIALIZAÇÃO GLOBAL
  // ============================================

  // Criar instância global da classe HeaderEngine
  const headerEngine = new HeaderEngine();

  // Expor globalmente para acesso externo
  window.headerEngine = headerEngine;
  console.log('[HeaderEngine] Instância criada e exposta globalmente como window.headerEngine');

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (!headerEngine.initialized) {
        console.log('[HeaderEngine] DOM pronto - iniciando HeaderEngine');
        headerEngine.init();
      }
    });
  } else {
    // DOM já está pronto
    if (!headerEngine.initialized) {
      console.log('[HeaderEngine] DOM já pronto - iniciando HeaderEngine imediatamente');
      headerEngine.init();
    }
  }

  // Também inicializar quando o Template Engine indicar que os componentes estão prontos
  // Isso garante que o header.html foi injetado corretamente
  window.addEventListener('TemplateEngine:Ready', function() {
    if (!headerEngine.initialized) {
      console.log('[HeaderEngine] TemplateEngine:Ready - iniciando HeaderEngine');
      headerEngine.init();
    } else {
      console.log('[HeaderEngine] Já foi inicializado anteriormente');
    }
  });

  // Fallback: inicializar após um tempo se nenhum evento foi disparado
  setTimeout(function() {
    if (!headerEngine.initialized) {
      console.warn('[HeaderEngine] Timeout - inicializando HeaderEngine como fallback');
      headerEngine.init();
    }
  }, 3000); // 3 segundos de timeout
})();
