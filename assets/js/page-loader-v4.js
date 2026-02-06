// ============================================
// SISTEMA DE CARREGAMENTO DE PÁGINAS DINÂMICAS
// ============================================

// Inicializar objeto global se não existir
if (typeof window.PageLoader === 'undefined') {
  window.PageLoader = {};
}

const PageLoader = window.PageLoader;

// Configuração das páginas disponíveis
PageLoader.pages = {
  'index': {
    title: 'Calculadoras de Enfermagem Profissional',
    description: 'Plataforma profissional de calculadoras clínicas para enfermagem',
    breadcrumb: ['Início'],
    content: 'assets/pages/home-v4.html'
  },
  'insulina': {
    title: 'Cálculo de Insulina | Calculadoras de Enfermagem Profissional',
    description: 'Calculadora profissional para aspiração de insulina em seringas de 100UI e 300UI.',
    breadcrumb: ['Início', 'Ferramentas', 'Calculadoras Clínicas', 'Calculadora de Aspiração de Insulina'],
    calculator: 'calculator-insulina-v4'
  },
  'heparina': {
    title: 'Cálculo de Heparina | Calculadoras de Enfermagem',
    description: 'Calculadora para dosagem e infusão de heparina',
    breadcrumb: ['Início', 'Ferramentas', 'Calculadoras Clínicas', 'Calculadora de Heparina'],
    calculator: 'calculator-heparina-v4'
  },
  'gotejamento': {
    title: 'Cálculo de Gotejamento | Calculadoras de Enfermagem',
    description: 'Calculadora para gotejamento de soluções intravenosas',
    breadcrumb: ['Início', 'Ferramentas', 'Calculadoras Clínicas', 'Cálculo de Gotejamento'],
    calculator: 'calculator-gotejamento-v4'
  }
};

// Detectar página atual
PageLoader.getCurrentPage = function() {
  const path = window.location.pathname;
  const filename = path.split('/').pop().replace('.html', '') || 'index';
  return this.pages[filename] || this.pages['index'];
};

// Carregar página atual
PageLoader.loadCurrentPage = async function() {
  const page = this.getCurrentPage();
  
  console.log(`📄 Carregando página: ${page.title}`);
  
  // Atualizar metadata da página
  this.updatePageMetadata(page);
  
  // Atualizar breadcrumb
  this.updateBreadcrumb(page.breadcrumb);
  
  // Carregar conteúdo específico
  if (page.calculator) {
    await this.loadCalculatorPage(page.calculator);
  } else if (page.content) {
    await this.loadContentPage(page.content);
  } else {
    await this.loadHomePage();
  }
  
  // Carregar seção do autor
  await this.loadAuthorSection();
};

// Atualizar metadata da página
PageLoader.updatePageMetadata = function(page) {
  document.title = page.title;
  
  // Atualizar meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = page.description;
  } else {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = page.description;
    document.head.appendChild(metaDescription);
  }
  
  // Atualizar Open Graph
  this.updateOpenGraph(page);
};

// Atualizar Open Graph
PageLoader.updateOpenGraph = function(page) {
  const properties = {
    'og:title': page.title,
    'og:description': page.description,
    'og:url': window.location.href
  };
  
  Object.entries(properties).forEach(([property, content]) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (meta) {
      meta.content = content;
    }
  });
};

// Atualizar breadcrumb
PageLoader.updateBreadcrumb = function(items) {
  const breadcrumbContainer = document.getElementById('breadcrumb');
  if (!breadcrumbContainer || !items || items.length === 0) return;
  
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    // Versão mobile (últimos 2 itens)
    const lastTwo = items.slice(-2);
    breadcrumbContainer.innerHTML = `
      <div class="flex md:hidden items-center gap-2 text-sm text-slate-600 dark:text-cyan-300">
        ${lastTwo.map((item, index) => `
          ${index > 0 ? '<i class="fa-solid fa-chevron-right text-[10px]"></i>' : ''}
          <span class="${index === lastTwo.length - 1 ? 'text-nurse-primary dark:text-cyan-400 font-bold' : ''}">
            ${item}
          </span>
        `).join('')}
      </div>
    `;
  } else {
    // Versão desktop (todos os itens)
    breadcrumbContainer.innerHTML = `
      <div class="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-cyan-300">
        ${items.map((item, index) => `
          ${index > 0 ? '<i class="fa-solid fa-chevron-right text-[10px]"></i>' : ''}
          ${index < items.length - 1 ? 
            `<a href="${this.getBreadcrumbLink(index, items)}" class="hover:underline text-nurse-accent">${item}</a>` :
            `<span class="text-nurse-primary dark:text-cyan-400 font-bold">${item}</span>`
          }
        `).join('')}
      </div>
    `;
  }
};

// Gerar links para breadcrumb
PageLoader.getBreadcrumbLink = function(index, items) {
  const baseUrls = {
    'Início': 'index.html',
    'Ferramentas': '#',
    'Calculadoras Clínicas': '#'
  };
  
  const item = items[index];
  return baseUrls[item] || '#';
};

// Carregar página com calculadora
PageLoader.loadCalculatorPage = async function(calculatorId) {
  try {
    console.log(`🧮 Carregando calculadora: ${calculatorId}`);
    
    // Carregar sistema de calculadora
    if (typeof window.CalculatorSystem === 'undefined') {
      await SystemUtils.loadJS('assets/js/calculator-system-v4.js');
    }
    
    // Inicializar calculadora específica
    if (window.CalculatorSystem) {
      const calculatorSystem = new CalculatorSystem(calculatorId);
      await calculatorSystem.load();
    } else {
      throw new Error('Sistema de calculadoras não disponível');
    }
    
  } catch (error) {
    console.error('Erro ao carregar calculadora:', error);
    SystemUtils.showNotification('Erro ao carregar a calculadora', 'error');
    
    // Fallback
    this.loadDefaultHomePage();
  }
};

// Carregar página de conteúdo
PageLoader.loadContentPage = async function(contentUrl) {
  try {
    console.log(`📄 Carregando conteúdo: ${contentUrl}`);
    
    const response = await fetch(contentUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const content = await response.text();
    document.getElementById('dynamic-content').innerHTML = content;
    
  } catch (error) {
    console.error('Erro ao carregar conteúdo:', error);
    
    // Fallback
    document.getElementById('dynamic-content').innerHTML = `
      <div class="text-center py-20">
        <i class="fa-solid fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
        <h2 class="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Conteúdo não disponível
        </h2>
        <p class="text-slate-600 dark:text-slate-400">
          A página solicitada não pôde ser carregada.
        </p>
        <div class="mt-6">
          <a href="index.html" class="bg-nurse-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-nurse-secondary transition">
            Voltar para Início
          </a>
        </div>
      </div>
    `;
  }
};

// Carregar página inicial
PageLoader.loadHomePage = async function() {
  try {
    console.log('🏠 Carregando página inicial...');
    
    const response = await fetch('assets/pages/home-v4.html');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    document.getElementById('dynamic-content').innerHTML = content;
    
    // Inicializar animações após carregamento
    this.initHomePageAnimations();
    
  } catch (error) {
    console.error('Erro ao carregar página inicial:', error);
    this.loadDefaultHomePage();
  }
};

// Página inicial padrão (fallback)
PageLoader.loadDefaultHomePage = function() {
  console.log('🔄 Carregando página inicial padrão...');
  
  document.getElementById('dynamic-content').innerHTML = `
    <div class="text-center py-20 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-5xl font-black text-nurse-primary dark:text-cyan-400 mb-6">
          Calculadoras de Enfermagem
        </h1>
        <p class="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
          Plataforma profissional para cálculos clínicos precisos e seguros
        </p>
        
        <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <a href="insulina.html" class="card-base p-8 hover:shadow-xl transition-shadow text-center">
            <div class="w-16 h-16 bg-nurse-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i class="fa-solid fa-syringe text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-nurse-primary dark:text-cyan-400 mb-2">Insulina</h3>
            <p class="text-slate-600 dark:text-slate-400">Cálculo de aspiração em seringas U100 e U300</p>
          </a>
          
          <a href="heparina.html" class="card-base p-8 hover:shadow-xl transition-shadow text-center">
            <div class="w-16 h-16 bg-nurse-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i class="fa-solid fa-droplet text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-nurse-primary dark:text-cyan-400 mb-2">Heparina</h3>
            <p class="text-slate-600 dark:text-slate-400">Dosagem e infusão de anticoagulantes</p>
          </a>
          
          <a href="gotejamento.html" class="card-base p-8 hover:shadow-xl transition-shadow text-center">
            <div class="w-16 h-16 bg-nurse-secondary text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i class="fa-solid fa-faucet-drip text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-nurse-primary dark:text-cyan-400 mb-2">Gotejamento</h3>
            <p class="text-slate-600 dark:text-slate-400">Cálculo de infusão intravenosa</p>
          </a>
        </div>
        
        <div class="mt-16 card-base p-8 max-w-3xl mx-auto">
          <h2 class="text-2xl font-bold text-nurse-primary dark:text-cyan-400 mb-4">Sobre a Plataforma</h2>
          <p class="text-slate-600 dark:text-slate-400 mb-4">
            Esta plataforma oferece calculadoras clínicas precisas para profissionais de enfermagem, 
            com foco na segurança do paciente e auditoria de cálculos.
          </p>
          <p class="text-slate-600 dark:text-slate-400">
            Todas as ferramentas incluem checklists de segurança, referências atualizadas e 
            recursos para documentação clínica.
          </p>
        </div>
      </div>
    </div>
  `;
};

// Carregar seção do autor
PageLoader.loadAuthorSection = async function() {
  try {
    console.log('👤 Carregando seção do autor...');
    
    const response = await fetch('assets/components/author-section-v4.html');
    if (response.ok) {
      const content = await response.text();
      document.getElementById('author-section').innerHTML = content;
    } else {
      this.loadDefaultAuthorSection();
    }
  } catch (error) {
    console.warn('Erro ao carregar seção do autor:', error);
    this.loadDefaultAuthorSection();
  }
};

// Seção do autor padrão (fallback)
PageLoader.loadDefaultAuthorSection = function() {
  document.getElementById('author-section').innerHTML = `
    <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center border border-slate-200 dark:border-slate-700 shadow-sm mb-12 transition-all hover:shadow-xl">
      <div class="relative flex-shrink-0">
        <div class="w-32 md:w-40 shadow-2xl border-4 border-white dark:border-slate-700 rounded-3xl overflow-hidden bg-slate-100">
          <img src="assets/images/author-info.webp" 
               alt="Autor Calculadoras de Enfermagem" 
               class="w-full h-auto block object-cover"
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFBM0U3NCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DRUY8L3RleHQ+PC9zdmc+'"/>
        </div>
        <div class="absolute -bottom-2 -right-2 bg-nurse-secondary text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-lg">
          <i class="fa-solid fa-check text-[10px]"></i>
        </div>
      </div>
      <div class="text-center md:text-left">
        <h3 class="text-2xl font-black mb-3 text-nurse-primary dark:text-cyan-400 font-nunito">
          Calculadoras de Enfermagem Profissional
        </h3>
        <p class="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-2xl font-inter italic">
          "Transformando a complexidade técnica em segurança para o paciente através da precisão dos dados e protocolos clínicos rigorosos."
        </p>
        
        <div class="flex flex-wrap gap-2 mt-6 items-center justify-center md:justify-start">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center">
            <i class="fa-solid fa-tags mr-2"></i> Tópicos:
          </span>
          <span class="flex flex-wrap gap-2" id="tags-container">
            <span class="tag-pill-footer">#insulina</span>
            <span class="tag-pill-footer">#farmacologia</span>
            <span class="tag-pill-footer">#segurança-do-paciente</span>
            <span class="tag-pill-footer">#auditoria</span>
            <span class="tag-pill-footer">#enfermagem</span>
            <span class="tag-pill-footer">#cálculo-clínico</span>
          </span>
        </div>
      </div>
    </div>
  `;
};

// Inicializar animações da página inicial
PageLoader.initHomePageAnimations = function() {
  // Adicionar efeitos de hover interativos
  const cards = document.querySelectorAll('.card-base');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('shadow-xl', 'scale-[1.02]');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('shadow-xl', 'scale-[1.02]');
    });
  });
};

// Exportar para uso global
window.PageLoader = PageLoader;