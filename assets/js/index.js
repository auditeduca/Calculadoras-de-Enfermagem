/**
 * ============================================
 * INDEX.JS - Calculadoras de Enfermagem
 * Unificado a partir de:
 * - global-main.js
 * - global-main-index.js
 * - main-index-loader.js
 * 
 * Funcionalidades:
 * - Scroll suave
 * - Links canônicos multilíngues
 * - Dados das ferramentas clínicas
 * - Renderização de cards
 * - Sistema de busca e filtros
 * - Controle de visualização
 * ============================================
 */

(function() {
  'use strict';

  // ============================================
  // DADOS DAS FERRAMENTAS CLÍNICAS
  // ============================================
  const toolsData = [
    // Calculadoras
    { id: "balanco-hidrico", name: "Balanço Hídrico", category: "Controle Hídrico", type: "calculator", description: "Controle preciso de líquidos e fluidos corporais.", filename: "balancohidrico.html", icon: "fas fa-tint", color: "blue" },
    { id: "gasometria", name: "Cálculo de Gasometria", category: "Exames", type: "calculator", description: "Interpretação de gasometria arterial e distúrbios ácido-básicos.", filename: "gasometria.html", icon: "fas fa-vial", color: "blue" },
    { id: "gotejamento", name: "Cálculo de Gotejamento", category: "Medicamentos", type: "calculator", description: "Velocidade de infusão de soluções parenterais.", filename: "gotejamento.html", icon: "fas fa-hand-holding-water", color: "blue" },
    { id: "aspiracao-heparina", name: "Cálculo de Heparina", category: "Medicamentos", type: "calculator", description: "Cálculo seguro de doses de heparina.", filename: "heparina.html", icon: "fas fa-syringe", color: "blue" },
    { id: "imc", name: "Índice de Massa Corporal (IMC)", category: "Nutrição", type: "calculator", description: "Avaliação nutricional e classificação de peso.", filename: "imc.html", icon: "fas fa-weight", color: "blue" },
    { id: "aspiracao-insulina", name: "Cálculo de Insulina", category: "Medicamentos", type: "calculator", description: "Cálculo de doses e unidades de insulina.", filename: "insulina.html", icon: "fas fa-syringe", color: "blue" },
    { id: "medicamentos", name: "Cálculo de Medicamentos", category: "Medicamentos", type: "calculator", description: "Regra de três para doses e diluições.", filename: "medicamentos.html", icon: "fas fa-pills", color: "blue" },
    { id: "dimensionamento", name: "Dimensionamento de Equipe", category: "Gestão", type: "calculator", description: "Organização de recursos humanos segundo COFEN.", filename: "dimensionamento.html", icon: "fas fa-users-cog", color: "blue" },
    { id: "idade-gestacional", name: "Idade Gestacional e DPP", category: "Obstetrícia", type: "calculator", description: "Cálculo de DUM, DPP e idade gestacional.", filename: "gestacional.html", icon: "fas fa-baby", color: "blue" },
    
    // Escalas Clínicas
    { id: "aldrete-e-kroulik", name: "Escala de Aldrete e Kroulik", category: "Sedação", type: "scale", description: "Avaliação do paciente em recuperação pós-anestésica.", filename: "aldrete.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "apache-ii", name: "Escala de APACHE II", category: "UTI", type: "scale", description: "Avaliação de gravidade em pacientes críticos.", filename: "apache.html", icon: "fa-solid fa-receipt", color: "blue" },
    { id: "apgar", name: "Escala de Apgar", category: "Neonatalogia", type: "scale", description: "Avaliação imediata do recém-nascido.", filename: "apgar.html", icon: "fas fa-baby-carriage", color: "blue" },
    { id: "asa", name: "Risco Perioperatório - ASA", category: "Anestesia", type: "scale", description: "Classificação do estado físico pré-operatório.", filename: "asa.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "ballard", name: "Escala de Ballard", category: "Neonatalogia", type: "scale", description: "Maturidade neuromuscular do recém-nascido.", filename: "ballard.html", icon: "fas fa-baby-carriage", color: "blue" },
    { id: "barthel", name: "Escala de Barthel", category: "Funcional", type: "scale", description: "Nível de independência funcional do paciente.", filename: "barthel.html", icon: "fas fa-walking", color: "blue" },
    { id: "bps", name: "Escala de Behavioural (BPS)", category: "Dor", type: "scale", description: "Avaliação de dor em pacientes sedados/ventilados.", filename: "bps.html", icon: "fa-solid fa-mask-face", color: "blue" },
    { id: "berg", name: "Escala de BERG (BBS)", category: "Fisioterapia", type: "scale", description: "Equilíbrio estático e dinâmico.", filename: "berg.html", icon: "fa-solid fa-person", color: "blue" },
    { id: "bishop", name: "Índice de Bishop", category: "Obstetrícia", type: "scale", description: "Maturidade cervical para parto.", filename: "bishop.html", icon: "fa-solid fa-user-doctor", color: "blue" },
    { id: "braden", name: "Escala de Braden", category: "Pele", type: "scale", description: "Risco de desenvolvimento de lesão por pressão.", filename: "braden.html", icon: "fas fa-bed", color: "blue" },
    { id: "cam-icu", name: "Escala CAM-ICU", category: "UTI", type: "scale", description: "Avaliação de delirium em unidade intensiva.", filename: "cam.html", icon: "fas fa-hospital-alt", color: "blue" },
    { id: "capurro", name: "Método de Capurro", category: "Neonatalogia", type: "scale", description: "Estimativa da idade gestacional ao nascer.", filename: "capurro.html", icon: "fas fa-baby-carriage", color: "blue" },
    { id: "cincinnati", name: "Escala de Cincinnati", category: "AVC", type: "scale", description: "Triagem rápida para suspeita de AVC.", filename: "cincinnati.html", icon: "fas fa-hospital-user", color: "blue" },
    { id: "cornell", name: "Escala de Cornell", category: "Psiquiatria", type: "scale", description: "Depressão em pacientes com demência.", filename: "cornell.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "cries", name: "Escala de CRIES", category: "Dor", type: "scale", description: "Avaliação de dor neonatal.", filename: "cries.html", icon: "fa-solid fa-child", color: "blue" },
    { id: "curb-65", name: "Escala de CURB-65", category: "Pneumologia", type: "scale", description: "Gravidade em pneumonia adquirida na comunidade.", filename: "curb-65.html", icon: "fa-solid fa-lungs-virus", color: "blue" },
    { id: "downton", name: "Escala de Downton", category: "Segurança", type: "scale", description: "Risco de queda em pacientes idosos.", filename: "downton.html", icon: "fa-solid fa-shower", color: "blue" },
    { id: "elpo", name: "Escala de ELPO", category: "Pele", type: "scale", description: "Risco de lesão cirúrgica.", filename: "elpo.html", icon: "fas fa-child", color: "blue" },
    { id: "fast", name: "Escala de FAST", category: "AVC", type: "scale", description: "Protocolo de avaliação rápida de AVC.", filename: "fast.html", icon: "fa-solid fa-person-walking-with-cane", color: "blue" },
    { id: "flacc", name: "Escala de FLACC", category: "Dor", type: "scale", description: "Dor em crianças não verbais.", filename: "flacc.html", icon: "fas fa-hospital-alt", color: "blue" },
    { id: "four", name: "Escala de FOUR", category: "Neurologia", type: "scale", description: "Coma e resposta neurológica detalhada.", filename: "four.html", icon: "fa-solid fa-user-nurse", color: "blue" },
    { id: "fugulin-scp", name: "Escala de Fugulin (SCP)", category: "Gestão", type: "scale", description: "Grau de dependência dos cuidados de enfermagem.", filename: "fugulin.html", icon: "fas fa-hospital-alt", color: "blue" },
    { id: "gds", name: "Escala de GDS", category: "Geriatria", type: "scale", description: "Rastreio de depressão geriátrica.", filename: "gds.html", icon: "fas fa-child", color: "blue" },
    { id: "glasgow", name: "Escala de Coma de Glasgow", category: "Neurologia", type: "scale", description: "Avaliação do nível de consciência.", filename: "glasgow.html", icon: "fa-solid fa-eye", color: "blue" },
    { id: "gosnell", name: "Escala de Gosnell", category: "Pele", type: "scale", description: "Risco de úlcera por pressão.", filename: "gosnell.html", icon: "fa-solid fa-weight-scale", color: "blue" },
    { id: "hamilton", name: "Escala de Hamilton", category: "Psiquiatria", type: "scale", description: "Avaliação da gravidade de ansiedade.", filename: "hamilton.html", icon: "fas fa-file-medical-alt", color: "blue" },
    { id: "humpty-dumpty", name: "Escala de Humpty-Dumpty", category: "Segurança", type: "scale", description: "Risco de quedas em pediatria.", filename: "humpty.html", icon: "fas fa-file-medical-alt", color: "blue" },
    { id: "johns", name: "Escala de Johns Hopkins", category: "Segurança", type: "scale", description: "Risco de queda intra-hospitalar.", filename: "johns.html", icon: "fa-solid fa-person-walking-with-cane", color: "blue" },
    { id: "jouvet", name: "Escala de Jouvet", category: "Neurologia", type: "scale", description: "Avaliação da profundidade do coma.", filename: "jouvet.html", icon: "fas fa-bed", color: "blue" },
    { id: "katz", name: "Escala de Katz", category: "Funcional", type: "scale", description: "Atividades da vida diária (AVD).", filename: "katz.html", icon: "fa-solid fa-bath", color: "blue" },
    { id: "lachs", name: "Escala de Lachs", category: "Geriatria", type: "scale", description: "Avaliação funcional do idoso.", filename: "lachs.html", icon: "fa-solid fa-person-walking-with-cane", color: "blue" },
    { id: "lanss", name: "Escala de LANSS", category: "Dor", type: "scale", description: "Avaliação de dor neuropática.", filename: "lanss.html", icon: "fas fa-user-nurse", color: "blue" },
    { id: "lawton", name: "Escala de Lawton", category: "Funcional", type: "scale", description: "Atividades instrumentais da vida diária.", filename: "lawton.html", icon: "fa-solid fa-mug-saucer", color: "blue" },
    { id: "manchester", name: "Escala de Manchester", category: "Triagem", type: "scale", description: "Priorização de atendimento em urgência.", filename: "manchester.html", icon: "fas fa-clinic-medical", color: "blue" },
    { id: "meem", name: "Escala de MEEM", category: "Cognitivo", type: "scale", description: "Mini Exame do Estado Mental.", filename: "meem.html", icon: "fas fa-wheelchair", color: "blue" },
    { id: "meows", name: "Escala de MEOWS", category: "Obstetrícia", type: "scale", description: "Alerta obstétrico precoce.", filename: "meows.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "morse", name: "Escala de Morse", category: "Segurança", type: "scale", description: "Risco de queda de pacientes adultos.", filename: "morse.html", icon: "fas fa-walking", color: "blue" },
    { id: "news", name: "Escala de NEWS", category: "Alerta Clínico", type: "scale", description: "National Early Warning Score.", filename: "news.html", icon: "fas fa-chart-line", color: "blue" },
    { id: "nihss", name: "Escala NIHSS", category: "AVC", type: "scale", description: "Gravidade do déficit neurológico no AVC.", filename: "nihss.html", icon: "fas fa-brain", color: "blue" },
    { id: "nips", name: "Escala de NIPS", category: "Dor", type: "scale", description: "Dor no recém-nascido (Neonatal Infant Pain Scale).", filename: "nips.html", icon: "fa-solid fa-eye-dropper", color: "blue" },
    { id: "norton", name: "Escala de Norton", category: "Pele", type: "scale", description: "Risco de desenvolvimento de LPP.", filename: "norton.html", icon: "fas fa-file-medical-alt", color: "blue" },
    { id: "numerica-dor", name: "Escala Numérica de Dor", category: "Dor", type: "scale", description: "Intensidade da dor referida.", filename: "escalanumerica.html", icon: "fas fa-hospital-alt", color: "blue" },
    { id: "ofras", name: "Escala de OFRAS", category: "Segurança", type: "scale", description: "Risco de quedas em obstetrícia.", filename: "ofras.html", icon: "fa-solid fa-square-plus", color: "blue" },
    { id: "painad", name: "Escala de PAINAD", category: "Dor", type: "scale", description: "Dor em pacientes com demência.", filename: "painad.html", icon: "fa-solid fa-hand-holding-medical", color: "blue" },
    { id: "pelod", name: "Escala de PELOD", category: "Pediatria", type: "scale", description: "Disfunção orgânica pediátrica.", filename: "pelod.html", icon: "fa-solid fa-comment-medical", color: "blue" },
    { id: "perroca-scp", name: "Classificação Perroca (SCP)", category: "Gestão", type: "scale", description: "Complexidade do cuidado assistencial.", filename: "perroca.html", icon: "fas fa-hospital-alt", color: "blue" },
    { id: "pews", name: "Escala de PEWS", category: "Alerta Clínico", type: "scale", description: "Alerta precoce pediátrico.", filename: "pews.html", icon: "fas fa-notes-medical", color: "blue" },
    { id: "prism", name: "Escala PRISM", category: "Pediatria", type: "scale", description: "Risco de mortalidade em UTIP.", filename: "prism.html", icon: "fas fa-lungs", color: "blue" },
    { id: "qsofa", name: "Escala qSOFA", category: "Alerta Clínico", type: "scale", description: "Triagem rápida para sepse.", filename: "qsofa.html", icon: "fas fa-lungs", color: "blue" },
    { id: "ramsay", name: "Escala de Ramsay", category: "Sedação", type: "scale", description: "Nível de sedação do paciente.", filename: "ramsay.html", icon: "fas fa-sleep", color: "blue" },
    { id: "richmond", name: "Escala de RASS", category: "Sedação", type: "scale", description: "Richmond Agitation-Sedation Scale.", filename: "richmond.html", icon: "fas fa-user-md", color: "blue" },
    { id: "saps-iii", name: "Escala de SAPS III", category: "UTI", type: "scale", description: "Simplified Acute Physiology Score.", filename: "saps.html", icon: "fas fa-hospital-alt", color: "blue" },
    
    // Calendários Vacinais
    { id: "vacinal-2024", name: "Calendário Vacinal 2024", category: "Imunização", type: "other", description: "Calendário nacional completo atualizado para 2024.", filename: "vacinas.html", icon: "fas fa-calendar-check", color: "blue" },
    { id: "gestante", name: "Calendário da Gestante", category: "Obstetrícia", type: "other", description: "Vacinas recomendadas durante a gestação.", filename: "gestante.html", icon: "fas fa-baby", color: "blue" }
  ];

  // ============================================
  // CONFIGURAÇÕES DO APLICATIVO
  // ============================================
  const appConfig = {
    searchTerm: "",
    filterCategory: "all",
    sortOrder: "az",
    scrollOffset: 100,
    scrollThreshold: 300,
    debounceDelay: 300,
    throttleDelay: 200
  };

  // ============================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================
  
  /**
   * Função debounce para otimizar eventos de input
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Função throttle para otimizar eventos de scroll
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Renderiza um card de ferramenta
   */
  function renderCard(tool, config, type) {
    const basePath = type === 'calculator' ? 'calculadoras/' : 
                     type === 'scale' ? 'escalas/' : 'outros/';
    const url = basePath + tool.filename;
    
    return `
      <article class="tool-card" data-id="${tool.id}" data-type="${tool.type}" data-category="${tool.category}">
        <div class="tool-icon">
          <i class="${tool.icon}"></i>
        </div>
        <div class="tool-content">
          <h3 class="tool-title">${tool.name}</h3>
          <p class="tool-description">${tool.description}</p>
          <span class="tool-category">${tool.category}</span>
        </div>
        <a href="${url}" class="tool-link" aria-label="Acessar ${tool.name}">
          <span class="sr-only">Acessar</span>
          <i class="fas fa-arrow-right"></i>
        </a>
      </article>
    `;
  }

  /**
   * Inicializa scroll suave para links de ancoragem
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - appConfig.scrollOffset;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /**
   * Configura links canônicos para SEO multilíngue
   */
  function initCanonicalLinks() {
    const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href;
    if (!canonicalUrl) return;

    const translations = [
      { lang: "pt-br", href: canonicalUrl },
      { lang: "en", href: canonicalUrl.replace(/\/$/, '') + '/en/' },
      { lang: "es", href: canonicalUrl.replace(/\/$/, '') + '/es/' },
      { lang: "x-default", href: canonicalUrl }
    ];

    translations.forEach(trans => {
      if (!document.querySelector(`link[hreflang="${trans.lang}"]`)) {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = trans.lang;
        link.href = trans.href;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Renderiza ferramentas filtradas por tipo
   */
  function renderTools(type, toolType) {
    const gridElement = document.getElementById(type + '-grid');
    if (!gridElement) return;

    let filteredTools = toolsData.filter(tool => tool.type === toolType);

    // Aplicar filtro de categoria
    if (appConfig.filterCategory !== 'all') {
      filteredTools = filteredTools.filter(tool => tool.category === appConfig.filterCategory);
    }

    // Aplicar busca
    if (appConfig.searchTerm) {
      const searchLower = appConfig.searchTerm.toLowerCase();
      filteredTools = filteredTools.filter(tool => 
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower) ||
        tool.category.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar
    filteredTools.sort((a, b) => {
      if (appConfig.sortOrder === 'az') {
        return a.name.localeCompare(b.name);
      } else if (appConfig.sortOrder === 'za') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    // Renderizar
    if (filteredTools.length > 0) {
      gridElement.innerHTML = filteredTools.map(tool => renderCard(tool, appConfig, type)).join('');
    } else {
      gridElement.innerHTML = `
        <div class="no-results">
          <p>Nenhuma ferramenta encontrada</p>
          <p class="no-results-hint">Tente buscar por outros termos ou categorias.</p>
        </div>
      `;
    }
  }

  /**
   * Renderiza todas as ferramentas
   */
  function renderAllTools() {
    renderTools('calculadoras', 'calculator');
    renderTools('escalas', 'scale');
    renderTools('vacinas', 'other');
  }

  /**
   * Inicializa controles de busca e filtros
   */
  function initSearchControls() {
    // Busca calculadoras
    const calcSearch = document.getElementById('calc-search');
    if (calcSearch) {
      calcSearch.addEventListener('input', debounce(function(e) {
        appConfig.searchTerm = e.target.value;
        renderTools('calculadoras', 'calculator');
      }, appConfig.debounceDelay));
    }

    // Busca escalas
    const scaleSearch = document.getElementById('scale-search');
    if (scaleSearch) {
      scaleSearch.addEventListener('input', debounce(function(e) {
        appConfig.searchTerm = e.target.value;
        renderTools('escalas', 'scale');
      }, appConfig.debounceDelay));
    }

    // Botão voltar ao topo
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
      window.addEventListener('scroll', throttle(function() {
        if (window.scrollY > appConfig.scrollThreshold) {
          backToTopBtn.style.display = 'flex';
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
          setTimeout(function() {
            if (window.scrollY <= appConfig.scrollThreshold) {
              backToTopBtn.style.display = 'none';
            }
          }, 300);
        }
      }, appConfig.throttleDelay));

      backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /**
   * Callback para quando o DOM estiver pronto
   */
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  /**
   * Inicializa todos os componentes
   */
  function init() {
    initSmoothScroll();
    initCanonicalLinks();
    initSearchControls();
    renderAllTools();
  }

  // Expor funções globalmente
  window.renderAllTools = renderAllTools;
  window.renderTools = renderTools;

  // Inicialização quando os módulos estiverem carregados
  document.addEventListener('ModulesLoaded', function() {
    setTimeout(init, 100);
  });

  // Inicialização quando o DOM estiver pronto
  onReady(function() {
    setTimeout(function() {
      if (document.getElementById('calculadoras-grid') && 
          document.getElementById('escalas-grid') && 
          document.getElementById('vacinas-grid')) {
        init();
      }
    }, 500);
  });

})();
