/**
 * ═══════════════════════════════════════════════════════════════════
 * CALCULATOR SYSTEM v4.3
 * Sistema de gerenciamento de calculadoras de enfermagem
 * * ATUALIZAÇÕES v4.3.1:
 * - Fix URL: shared-content.json (Github Pages)
 * - Fallback automático para shared-content.json (Local -> Remoto)
 * - Tratamento robusto de erros de fetch (JSON/404)
 * - Inicialização resiliente
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
      // 1. Carrega conteúdo compartilhado (Com fallback)
      await this.loadSharedContent();
      
      // 2. Carrega configuração da calculadora
      const response = await fetch(configPath);
      if (!response.ok) throw new Error(`Erro HTTP ao carregar config: ${response.status}`);
      
      const config = await response.json();
      
      // 3. Cria engine
      // Verifica se CalculatorEngine existe (pode não ter carregado se houve erro de script)
      if (typeof CalculatorEngine === 'undefined') {
          throw new Error('CalculatorEngine não está definido. Verifique o arquivo calculator-engine.js');
      }
      
      this.engine = new CalculatorEngine(config);
      
      // 4. Renderiza interface
      this.engine.render();
      
      // 5. Integrações opcionais
      if (config.acessibilidade?.vlibras) {
        await this.loadVLibras();
      }
      
      await this.loadFABButtons();
      
      // 6. Event Listeners
      this.initEventListeners();
      
      console.log('✓ Calculator System v4.3 inicializado');
      
    } catch (error) {
      console.error('Erro ao inicializar Calculator System:', error);
      // Feedback visual simples em caso de erro crítico
      const container = document.getElementById('calculator-container');
      if(container) {
          container.innerHTML = `<div class="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
            <strong>Erro de Inicialização:</strong> ${error.message}
          </div>`;
      }
    }
  },

  /**
   * Carrega conteúdo compartilhado (Modais, Glossário, etc)
   * Tenta localmente, se falhar, tenta no repositório oficial
   */
  async loadSharedContent() {
    const paths = [
        'shared-content.json', // Tentativa 1: Local (desenvolvimento)
        'https://auditeduca.github.io/Calculadoras-de-Enfermagem/shared-content.json' // Tentativa 2: Produção (URL Absoluta)
    ];

    for (const path of paths) {
        try {
            const response = await fetch(path);
            
            // Verifica status HTTP e Tipo de Conteúdo
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                // Silenciosamente tenta o próximo se for 404
                continue; 
            }
            
            if (contentType && contentType.indexOf("application/json") === -1) {
                // Se retornou HTML (ex: página 404 padrão), ignora
                console.warn(`Ignorando resposta não-JSON de ${path}`);
                continue;
            }

            this.sharedContent = await response.json();
            console.log(`✓ Conteúdo compartilhado carregado de: ${path}`);
            return; // Sucesso, para o loop

        } catch (e) {
            // Erros de rede ou parse, tenta o próximo
            if (path === paths[paths.length - 1]) {
                console.warn('Aviso: Conteúdo compartilhado não disponível (Local e Remoto falharam).');
            }
        }
    }
  },

  /**
   * Carrega VLibras Widget
   */
  async loadVLibras() {
    if (document.getElementById('vlibras-widget')) return;
    
    const div = document.createElement('div');
    div.id = 'vlibras-widget';
    div.innerHTML = `
      <div vw class="enabled">
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
          <div class="vw-plugin-top-wrapper"></div>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.onload = () => {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
      console.log('✓ VLibras carregado');
    };
    document.body.appendChild(script);
  },

  /**
   * Carrega Floating Action Buttons (FAB)
   */
  async loadFABButtons() {
    const fabContainer = document.getElementById('fab-container');
    if (!fabContainer) return;

    // Define botões padrão se não houver configuração externa
    const buttons = [
      { 
        icon: 'fa-share-nodes', 
        action: 'share', 
        label: 'Compartilhar',
        color: 'bg-blue-600' 
      },
      { 
        icon: 'fa-circle-question', 
        action: 'tour', 
        label: 'Tutorial',
        color: 'bg-emerald-600'
      }
    ];

    fabContainer.innerHTML = `
      <div class="fab-group relative group">
        <div class="absolute bottom-16 right-0 flex flex-col gap-3 opacity-0 translate-y-4 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300">
          ${buttons.map(btn => `
            <button onclick="CALCULATOR_SYSTEM.handleFabAction('${btn.action}')" 
                    class="w-10 h-10 rounded-full ${btn.color} text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center relative"
                    title="${btn.label}">
              <i class="fa-solid ${btn.icon}"></i>
              <span class="absolute right-12 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                ${btn.label}
              </span>
            </button>
          `).join('')}
        </div>
        <button class="w-14 h-14 rounded-full bg-nurse-primary text-white shadow-xl hover:bg-nurse-secondary transition-colors flex items-center justify-center z-10">
          <i class="fa-solid fa-plus text-xl group-hover:rotate-45 transition-transform duration-300"></i>
        </button>
      </div>
    `;
    console.log('✓ FAB buttons carregados');
  },

  /**
   * Manipula ações dos botões FAB
   */
  handleFabAction(action) {
    switch(action) {
      case 'share':
        this.sharePage();
        break;
      case 'tour':
        this.startTour();
        break;
    }
  },

  /**
   * Compartilha a página atual
   */
  async sharePage() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: 'Confira esta calculadora de enfermagem:',
          url: window.location.href
        });
      } catch (err) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      this.copyToClipboard(window.location.href);
      if(window.showToast) window.showToast('Link copiado para a área de transferência!', 'success');
    }
  },

  /**
   * Inicia o tour guiado
   */
  startTour() {
    if (typeof Shepherd === 'undefined') {
        // Carrega Shepherd.js sob demanda
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/shepherd.js@10.0.1/dist/js/shepherd.min.js';
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/shepherd.js@10.0.1/dist/css/shepherd.css';
        
        document.head.appendChild(link);
        document.body.appendChild(script);
        
        script.onload = () => this.initTour();
    } else {
        this.initTour();
    }
  },

  initTour() {
    if (!this.tour) {
        this.tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: 'shepherd-theme-custom',
                scrollTo: true,
                cancelIcon: { enabled: true }
            }
        });
        
        // Define passos do tour
        this.tour.addSteps([
            {
                id: 'intro',
                text: 'Bem-vindo! Vamos fazer um tour rápido pela calculadora.',
                attachTo: { element: 'header', on: 'bottom' },
                buttons: [{ text: 'Próximo', action: this.tour.next }]
            },
            {
                id: 'input',
                text: 'Aqui você insere os dados do paciente ou prescrição.',
                attachTo: { element: '#pane-calc', on: 'right' },
                buttons: [{ text: 'Voltar', action: this.tour.back }, { text: 'Próximo', action: this.tour.next }]
            },
            {
                id: 'actions',
                text: 'Use estes botões para calcular ou limpar o formulário.',
                attachTo: { element: '.btn-primary-action', on: 'top' },
                buttons: [{ text: 'Entendi', action: this.tour.complete }]
            }
        ]);
    }
    
    this.tour.start();
  },

  /**
   * Inicializa event listeners globais
   */
  initEventListeners() {
    // Escuta eventos de cálculo para analytics ou logs
    document.addEventListener('calculator:calculated', (e) => {
      console.log('Cálculo realizado:', e.detail);
    });
  },

  // Proxies para métodos do engine (para manter compatibilidade com onclicks antigos)
  calculate: (params) => CALCULATOR_SYSTEM.engine?.calculate(params),
  reset: () => CALCULATOR_SYSTEM.engine?.reset(),
  generatePDF: () => {
    if(window.print) window.print();
    else alert('Função de impressão não disponível');
  },
  copyResult: () => {
    const res = document.getElementById('res-total')?.innerText;
    if(res) {
        navigator.clipboard.writeText(res);
        if(window.showToast) window.showToast('Resultado copiado!', 'success');
    }
  },
  
  // Navegação de abas
  switchTab: (tabId) => {
    // Remove active de todos
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
    
    // Ativa selecionado
    const btn = document.getElementById(`btn-tab-${tabId}`);
    const pane = document.getElementById(`pane-${tabId}`);
    
    if(btn && pane) {
        btn.classList.add('active');
        pane.classList.remove('hidden');
        pane.classList.add('animate-fade-in');
    }
  },

  // Ações do menu lateral
  openNandaSearch: () => {
     window.location.href = 'busca-e-conteudo.html?type=nanda';
  },
  
  openProtocolos: () => {
     window.location.href = 'busca-e-conteudo.html?type=protocolos';
  },
  
  openGlossario: () => {
     window.location.href = 'busca-e-conteudo.html?type=glossario';
  },

  openModalShared: (modalId) => {
      // Verifica se o modal existe no sharedContent carregado
      const modalData = CALCULATOR_SYSTEM.sharedContent?.modais?.[modalId];
      if (modalData) {
          // Lógica para abrir modal (requer implementação de UI de modal genérico)
          alert(modalData.titulo + '\n\n' + modalData.conteudo);
      } else {
          console.warn(`Modal ${modalId} não encontrado`);
      }
  }
};

// Expõe globalmente
window.CALCULATOR_SYSTEM = CALCULATOR_SYSTEM;