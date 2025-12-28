/**
 * Main Index Loader v1.0
 * Carrega o conteúdo principal da página index.html
 */

class MainIndexLoader {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    console.log('[MainIndexLoader] Inicializando...');
    
    // Aguarda Template Engine estar pronto
    await this.waitForTemplateEngine();
    
    // Aguarda Header estar carregado
    await this.waitForHeader();
    
    // Carrega o conteúdo principal
    await this.loadMainContent();
    
    this.initialized = true;
    console.log('[MainIndexLoader] Concluído');
  }

  waitForTemplateEngine() {
    return new Promise((resolve) => {
      if (window.templateEngine && window.templateEngine.initialized) {
        resolve();
      } else {
        window.addEventListener('TemplateEngine:Ready', resolve);
        // Timeout de segurança
        setTimeout(resolve, 5000);
      }
    });
  }

  waitForHeader() {
    return new Promise((resolve) => {
      const checkHeader = () => {
        const headerContainer = document.getElementById('header-container');
        if (headerContainer && headerContainer.innerHTML.trim().length > 100) {
          console.log('[MainIndexLoader] Header detectado');
          resolve();
        } else {
          setTimeout(checkHeader, 100);
        }
      };
      
      checkHeader();
      
      // Timeout após 10 segundos
      setTimeout(() => {
        console.warn('[MainIndexLoader] Timeout aguardando header');
        resolve();
      }, 10000);
    });
  }

  async loadMainContent() {
    const mainContainer = document.getElementById('main-container');
    if (!mainContainer) {
      console.error('[MainIndexLoader] Container principal não encontrado');
      return;
    }

    try {
      // URL do conteúdo principal
      const contentUrl = 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/pages/main-index.html';
      
      console.log('[MainIndexLoader] Carregando conteúdo principal...');
      const response = await fetch(contentUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      mainContainer.innerHTML = html;
      console.log('[MainIndexLoader] Conteúdo principal carregado');
      
      // Dispara evento de conteúdo carregado
      window.dispatchEvent(new CustomEvent('MainContent:Loaded'));
      
      // Inicializa componentes específicos do conteúdo
      this.initContentComponents();
      
    } catch (error) {
      console.error('[MainIndexLoader] Erro ao carregar conteúdo:', error);
      this.showFallbackContent(mainContainer);
    }
  }

  initContentComponents() {
    // Inicializa carrossel se existir
    this.initCarousel();
    
    // Inicializa tabs se existirem
    this.initTabs();
    
    // Inicializa tooltips
    this.initTooltips();
  }

  initCarousel() {
    const carousels = document.querySelectorAll('.carousel');
    if (carousels.length > 0) {
      console.log('[MainIndexLoader] Inicializando carrosséis:', carousels.length);
      // Adicione aqui a lógica do carrossel
    }
  }

  initTabs() {
    const tabGroups = document.querySelectorAll('.tab-group');
    if (tabGroups.length > 0) {
      console.log('[MainIndexLoader] Inicializando tabs:', tabGroups.length);
      // Adicione aqui a lógica de tabs
    }
  }

  initTooltips() {
    // Inicialização básica de tooltips
    document.addEventListener('mouseover', (e) => {
      if (e.target.hasAttribute('data-tooltip')) {
        const tooltip = e.target.getAttribute('data-tooltip');
        // Implemente tooltips conforme necessário
      }
    });
  }

  showFallbackContent(container) {
    container.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center p-4">
        <div class="max-w-4xl w-full">
          <!-- Hero Section -->
          <section class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-bold text-primary mb-4">
              Calculadoras de Enfermagem
            </h1>
            <p class="text-xl text-gray-600 mb-8">
              Ferramentas e Conteúdo Técnico para Profissionais de Saúde
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <a href="medicamentos.html" class="btn btn-primary">
                <i class="fas fa-calculator mr-2"></i>Calculadoras
              </a>
              <a href="calendariovacinaladultos.html" class="btn btn-outline">
                <i class="fas fa-syringe mr-2"></i>Vacinas
              </a>
              <a href="aldrete.html" class="btn btn-outline">
                <i class="fas fa-clipboard-list mr-2"></i>Escalas
              </a>
            </div>
          </section>

          <!-- Destaques -->
          <section class="mb-12">
            <h2 class="text-2xl font-bold text-primary mb-6">Ferramentas em Destaque</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${this.generateToolCards()}
            </div>
          </section>

          <!-- Aviso -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p class="text-yellow-800">
              <i class="fas fa-info-circle mr-2"></i>
              Alguns recursos podem estar temporariamente indisponíveis. Estamos trabalhando para normalizar o serviço.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  generateToolCards() {
    const tools = [
      { name: 'Cálculo de Heparina', desc: 'Cálculo preciso de dose e infusão', icon: 'fa-syringe', link: 'heparina.html' },
      { name: 'Escala de Glasgow', desc: 'Avaliação do nível de consciência', icon: 'fa-brain', link: 'glasgow.html' },
      { name: 'Calendário Vacinal', desc: 'Esquemas vacinais por faixa etária', icon: 'fa-syringe', link: 'calendariovacinaladultos.html' },
      { name: 'Cálculo de Gotejamento', desc: 'Controle de infusão venosa', icon: 'fa-tint', link: 'gotejamento.html' },
      { name: 'Diagnósticos NANDA', desc: 'Biblioteca de diagnósticos', icon: 'fa-stethoscope', link: 'diagnosticosnanda.html' },
      { name: 'IMC', desc: 'Índice de Massa Corporal', icon: 'fa-weight-scale', link: 'imc.html' }
    ];

    return tools.map(tool => `
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-start mb-4">
          <i class="fas ${tool.icon} text-primary text-2xl mr-3"></i>
          <div>
            <h3 class="font-bold text-lg text-gray-800">${tool.name}</h3>
            <p class="text-gray-600 text-sm">${tool.desc}</p>
          </div>
        </div>
        <a href="${tool.link}" class="btn btn-primary w-full">
          Acessar <i class="fas fa-arrow-right ml-2"></i>
        </a>
      </div>
    `).join('');
  }
}

// Inicializa quando a página estiver pronta
document.addEventListener('DOMContentLoaded', () => {
  const loader = new MainIndexLoader();
  loader.init();
});

// Expõe globalmente se necessário
window.MainIndexLoader = MainIndexLoader;