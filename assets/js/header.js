/**
 * CALCULADORAS DE ENFERMAGEM - CORE HEADER ENGINE v2.6
 * Sincronizado com Template Engine e Fix de Renderização
 */

class HeaderEngine {
  constructor() {
    this.activePanelId = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    // 1. Limpeza total antes de ligar os eventos
    this._cleanupInitialState();
    
    // 2. Setup de Componentes
    this.initMegaPanels();
    this.initMobileMenu();
    this.initMobileAccordions();
    
    this.initialized = true;
    window.dispatchEvent(new CustomEvent('HeaderEngine:Ready'));
  }

  _cleanupInitialState() {
    console.log('[HeaderEngine] Limpando estados residuais...');
    const panels = document.querySelectorAll('.mega-panel');
    panels.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-hidden', 'true');
    });
    
    const triggers = document.querySelectorAll('.nav-trigger');
    triggers.forEach(t => {
        t.classList.remove('active-nav');
        t.setAttribute('aria-expanded', 'false');
    });
  }

  initMegaPanels() {
    const navTriggers = document.querySelectorAll('.nav-trigger[data-panel]');
    
    navTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const panelId = trigger.getAttribute('data-panel');
        this.togglePanel(panelId, trigger);
      });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mega-panel') && !e.target.closest('.nav-trigger')) {
        this.closeAllPanels();
      }
    });

    // Inicializa abas internas (Tabs)
    this.initMegaPanelTabs();
  }

  togglePanel(panelId, trigger) {
    const targetPanel = document.getElementById(panelId);
    if (!targetPanel) return;

    if (this.activePanelId === panelId) {
      this.closeAllPanels();
    } else {
      this.closeAllPanels();
      targetPanel.classList.add('active');
      targetPanel.setAttribute('aria-hidden', 'false');
      trigger.classList.add('active-nav');
      this.activePanelId = panelId;
    }
  }

  initMegaPanelTabs() {
    const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
    
    tabTriggers.forEach(trigger => {
      const activate = () => {
        const panel = trigger.closest('.mega-panel');
        const targetId = trigger.getAttribute('data-target');
        
        // Reset abas no painel pai
        panel.querySelectorAll('.menu-tab-trigger').forEach(t => t.classList.remove('active'));
        panel.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Ativar selecionada
        trigger.classList.add('active');
        const content = document.getElementById(targetId);
        if (content) content.classList.add('active');
      };

      trigger.addEventListener('mouseenter', activate);
      trigger.addEventListener('click', activate);
    });
  }

  initMobileMenu() {
    const btn = document.getElementById('mobile-menu-trigger');
    const menu = document.getElementById('mobile-menu');
    const drawer = document.getElementById('mobile-menu-drawer');
    const closeBtn = document.getElementById('close-mobile-menu');

    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      menu.classList.remove('hidden');
      setTimeout(() => drawer.classList.remove('-translate-x-full'), 10);
    });

    closeBtn.addEventListener('click', () => {
      drawer.classList.add('-translate-x-full');
      setTimeout(() => menu.classList.add('hidden'), 300);
    });
  }

  initMobileAccordions() {
    const accBtns = document.querySelectorAll('.mobile-accordion-btn');
    accBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const content = btn.nextElementSibling;
        const isOpen = btn.classList.toggle('active');
        content.style.maxHeight = isOpen ? content.scrollHeight + "px" : "0px";
      });
    });
  }

  closeAllPanels() {
    this._cleanupInitialState();
    this.activePanelId = null;
  }
}

// Inicia automaticamente
window.headerEngine = new HeaderEngine();
document.addEventListener('DOMContentLoaded', () => window.headerEngine.init());
window.addEventListener('TemplateEngine:header:Ready', () => window.headerEngine.init());