/**
 * ═══════════════════════════════════════════════════════════════════
 * CALCULATOR SYSTEM v4.2
 * Sistema de gerenciamento de calculadoras de enfermagem
 * 
 * NOVIDADES v4.2:
 * - showModalShared(): Modais com conteúdo compartilhado
 * - tourGuiado(): Tour interativo com Shepherd.js
 * - searchNANDA(): Busca de diagnósticos de enfermagem
 * - Carregamento de shared-content.json
 * - Suporte a FAB buttons
 * ═══════════════════════════════════════════════════════════════════
 */

const CALCULATOR_SYSTEM = {
  engine: null,
  sharedContent: null,
  tour: null,
  
  /**
   * Inicializa o sistema
   */
  async init(configPath) {
    try {
      // Carrega conteúdo compartilhado
      await this.loadSharedContent();
      
      // Carrega configuração da calculadora
      const response = await fetch(configPath);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const config = await response.json();
      
      // Cria engine
      this.engine = new CalculatorEngine(config);
      
      // Renderiza interface
      this.engine.render();
      
      // Carrega VLibras se habilitado
      if (config.acessibilidade?.vlibras) {
        await this.loadVLibras();
      }
      
      // Carrega FAB buttons
      await this.loadFABButtons();
      
      // Inicializa event listeners
      this.initEventListeners();
      
      console.log('✓ Calculator System v4.2 inicializado');
      
      return this.engine;
    } catch (error) {
      console.error('Erro ao inicializar Calculator System:', error);
      throw error;
    }
  },
  
  /**
   * ═══════════════════════════════════════════════════════════════
   * CARREGAMENTO DE RECURSOS
   * ═══════════════════════════════════════════════════════════════
   */
  
  /**
   * Carrega conteúdo compartilhado (Metas, 9 Acertos, etc)
   */
  async loadSharedContent() {
    try {
      const response = await fetch('shared-content.json');
      if (response.ok) {
        this.sharedContent = await response.json();
        console.log('✓ Conteúdo compartilhado carregado');
      }
    } catch (error) {
      console.warn('Conteúdo compartilhado não disponível:', error);
    }
  },
  
  /**
   * Carrega VLibras
   */
  async loadVLibras() {
    try {
      const container = document.getElementById('libras-container');
      if (!container) return;
      
      const response = await fetch('components/widget-libras.html');
      if (response.ok) {
        container.innerHTML = await response.text();
        console.log('✓ VLibras carregado');
      }
    } catch (error) {
      console.warn('Erro ao carregar VLibras:', error);
    }
  },
  
  /**
   * Carrega FAB buttons
   */
  async loadFABButtons() {
    try {
      const container = document.getElementById('fab-container');
      if (!container) return;
      
      const response = await fetch('components/fab-buttons.html');
      if (response.ok) {
        container.innerHTML = await response.text();
        console.log('✓ FAB buttons carregados');
      }
    } catch (error) {
      console.warn('Erro ao carregar FAB buttons:', error);
    }
  },
  
  /**
   * Carrega Shepherd.js para tour guiado
   */
  async loadShepherd() {
    return new Promise((resolve, reject) => {
      if (typeof Shepherd !== 'undefined') {
        resolve();
        return;
      }
      
      // Carrega CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/shepherd.js@11/dist/css/shepherd.css';
      document.head.appendChild(link);
      
      // Carrega JS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/shepherd.js@11/dist/js/shepherd.min.js';
      script.onload = () => {
        console.log('✓ Shepherd.js carregado');
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
  
  /**
   * ═══════════════════════════════════════════════════════════════
   * AÇÕES DE ABAS E MODAIS
   * ═══════════════════════════════════════════════════════════════
   */
  
  /**
   * Alterna entre abas
   */
  switchTab(tabId) {
    // Remove classe ativa de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-nurse-primary', 'text-white');
      btn.classList.add('text-slate-600', 'dark:text-slate-400');
    });
    
    // Esconde todos os painéis
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.add('hidden');
    });
    
    // Ativa o botão e painel selecionados
    const selectedBtn = document.getElementById(`btn-tab-${tabId}`);
    const selectedPane = document.getElementById(`pane-${tabId}`);
    
    if (selectedBtn) {
      selectedBtn.classList.add('active', 'bg-nurse-primary', 'text-white');
      selectedBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
    }
    
    if (selectedPane) {
      selectedPane.classList.remove('hidden');
    }
  },
  
  /**
   * Mostra modal genérico
   */
  showModal(modalId) {
    const modal = document.getElementById('reference-modal');
    if (!modal || !this.engine?.config?.modais?.[modalId]) return;
    
    const modalData = this.engine.config.modais[modalId];
    
    // Atualiza conteúdo
    const iconEl = modal.querySelector('#modal-icon');
    const titleEl = modal.querySelector('#modal-title');
    const contentEl = modal.querySelector('#modal-content');
    
    if (iconEl) iconEl.className = `fa-solid ${modalData.icone} text-nurse-secondary`;
    if (titleEl) titleEl.textContent = modalData.titulo;
    if (contentEl) contentEl.innerHTML = modalData.conteudo;
    
    // Mostra modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Foca no modal (acessibilidade)
    const closeBtn = modal.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.focus();
  },
  
  /**
   * Mostra modal com conteúdo compartilhado ⭐ NOVO v4.2
   */
  showModalShared(sharedId) {
    const modal = document.getElementById('reference-modal');
    if (!modal || !this.sharedContent) return;
    
    const sharedData = this.sharedContent.shared_content[sharedId];
    if (!sharedData) {
      console.error(`Conteúdo compartilhado '${sharedId}' não encontrado`);
      return;
    }
    
    // Atualiza conteúdo
    const iconEl = modal.querySelector('#modal-icon');
    const titleEl = modal.querySelector('#modal-title');
    const contentEl = modal.querySelector('#modal-content');
    
    if (iconEl) iconEl.className = `fa-solid ${sharedData.icone} text-nurse-secondary`;
    if (titleEl) titleEl.textContent = sharedData.titulo;
    if (contentEl) contentEl.innerHTML = sharedData.html;
    
    // Mostra modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Foca no modal
    const closeBtn = modal.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.focus();
  },
  
  /**
   * Fecha modal
   */
  closeModal() {
    const modal = document.getElementById('reference-modal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },
  
  /**
   * ═══════════════════════════════════════════════════════════════
   * TOUR GUIADO ⭐ NOVO v4.2
   * ═══════════════════════════════════════════════════════════════
   */
  
  /**
   * Inicia tour guiado interativo
   */
  async tourGuiado(parametro) {
    if (!this.engine?.config?.conteudo?.[parametro]) return;
    
    // Carrega Shepherd.js se necessário
    await this.loadShepherd();
    
    const config = this.engine.config.conteudo[parametro];
    
    // Cria tour
    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' }
      }
    });
    
    // Adiciona steps
    config.passos.forEach((passo, index) => {
      const isLast = index === config.passos.length - 1;
      
      this.tour.addStep({
        id: `step-${index}`,
        title: `<i class="fa-solid ${passo.icone} mr-2"></i>${passo.titulo}`,
        text: passo.descricao,
        attachTo: {
          element: passo.elemento || 'body',
          on: 'bottom'
        },
        buttons: [
          {
            text: index === 0 ? 'Cancelar' : 'Anterior',
            action: index === 0 ? this.tour.cancel : this.tour.back,
            classes: 'shepherd-button-secondary'
          },
          {
            text: isLast ? 'Concluir' : 'Próximo',
            action: this.tour.next,
            classes: 'shepherd-button-primary'
          }
        ]
      });
    });
    
    // Inicia tour
    this.tour.start();
  },
  
  /**
   * ═══════════════════════════════════════════════════════════════
   * BUSCA DE DIAGNÓSTICOS ⭐ NOVO v4.2
   * ═══════════════════════════════════════════════════════════════
   */
  
  /**
   * Busca diagnósticos de enfermagem (NANDA, NIC, NOC)
   */
  searchNANDA(termo) {
    if (!termo) termo = this.engine?.config?.metadata?.titulo || '';
    
    const query = encodeURIComponent(`${termo} NANDA NIC NOC diagnóstico de enfermagem`);
    
    // Abre busca no Google em nova aba
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  },
  
  /**
   * ═══════════════════════════════════════════════════════════════
   * UTILITÁRIOS
   * ═══════════════════════════════════════════════════════════════
   */
  
  /**
   * Copia resultado para clipboard
   */
  async copyResult() {
    const resultEl = document.getElementById('res-total');
    const unitEl = document.getElementById('res-unit');
    
    if (!resultEl) return;
    
    const value = resultEl.textContent;
    const unit = unitEl?.textContent || '';
    const text = `${value} ${unit}`;
    
    try {
      await navigator.clipboard.writeText(text);
      
      // Feedback visual
      const btn = event?.target?.closest('button');
      if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
        btn.classList.add('bg-green-600');
        
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.classList.remove('bg-green-600');
        }, 2000);
      }
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  },
  
  /**
   * Inicializa event listeners globais
   */
  initEventListeners() {
    // Modal - fechar ao clicar fora
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('reference-modal');
      if (e.target === modal) {
        this.closeModal();
      }
    });
    
    // Modal - fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        if (this.tour?.isActive()) {
          this.tour.cancel();
        }
      }
    });
    
    // Botão fechar modal
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });
  }
};

/**
 * ═══════════════════════════════════════════════════════════════
 * CSS CUSTOMIZADO PARA SHEPHERD.JS
 * ═══════════════════════════════════════════════════════════════
 */
const shepherdStyles = `
<style>
.shepherd-theme-custom {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  max-width: 400px;
}

.shepherd-theme-custom .shepherd-header {
  background: linear-gradient(135deg, #1A3E74 0%, #2E5A9C 100%);
  color: white;
  padding: 1rem;
  border-radius: 1rem 1rem 0 0;
  font-weight: 700;
  font-size: 1.125rem;
}

.shepherd-theme-custom .shepherd-text {
  padding: 1.5rem;
  color: #475569;
  line-height: 1.6;
}

.shepherd-theme-custom .shepherd-footer {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.shepherd-button-primary {
  background: #1A3E74;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.shepherd-button-primary:hover {
  background: #00bcd4;
}

.shepherd-button-secondary {
  background: #e2e8f0;
  color: #475569;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.shepherd-button-secondary:hover {
  background: #cbd5e1;
}

.shepherd-modal-overlay-container {
  background: rgba(0,0,0,0.5);
}

.shepherd-element {
  z-index: 10000;
}
</style>
`;

// Injeta estilos no head quando o script carrega
if (document.head) {
  document.head.insertAdjacentHTML('beforeend', shepherdStyles);
}

// Torna disponível globalmente
window.CALCULATOR_SYSTEM = CALCULATOR_SYSTEM;

console.log('✓ Calculator System v4.2 carregado');
