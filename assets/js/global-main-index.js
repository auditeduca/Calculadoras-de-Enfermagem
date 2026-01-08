/**
 * GLOBAL-MAIN-INDEX.JS
 * Funcionalidades do Indice Principal
 * Calculadoras de Enfermagem
 * @version Com suporte a view modes globais, sorting e toggle de icones
 */

(function() {
  'use strict';
  
  const toolsData = [
    {id: "balanco-hidrico", name: "Balanco Hidrico", category: "Controle Hidrico", type: "calculator", description: "Controle preciso de liquidos e fluidos corporais.", filename: "balancohidrico.html", icon: "fas fa-tint", color: "blue"},
    {id: "gasometria", name: "Calculo de Gasometria", category: "Exames", type: "calculator", description: "Interpretacao de gasometria arterial e disturbios acido-basicos.", filename: "gasometria.html", icon: "fas fa-vial", color: "blue"},
    {id: "gotejamento", name: "Calculo de Gotejamento", category: "Medicamentos", type: "calculator", description: "Velocidade de infusao de solucoes parenterais.", filename: "gotejamento.html", icon: "fas fa-hand-holding-water", color: "blue"},
    {id: "aspiracao-heparina", name: "Calculo de Heparina", category: "Medicamentos", type: "calculator", description: "Calculo seguro de doses de heparina.", filename: "heparina.html", icon: "fas fa-syringe", color: "blue"},
    {id: "imc", name: "Indice de Massa Corporal (IMC)", category: "Nutricao", type: "calculator", description: "Avaliacao nutricional e classificacao de peso.", filename: "imc.html", icon: "fas fa-weight", color: "blue"},
    {id: "aspiracao-insulina", name: "Calculo de Insulina", category: "Medicamentos", type: "calculator", description: "Calculo de doses e unidades de insulina.", filename: "insulina.html", icon: "fas fa-syringe", color: "blue"},
    {id: "medicamentos", name: "Calculo de Medicamentos", category: "Medicamentos", type: "calculator", description: "Regra de tres para doses e diluicoes.", filename: "medicamentos.html", icon: "fas fa-pills", color: "blue"},
    {id: "dimensionamento", name: "Dimensionamento de Equipe", category: "Gestao", type: "calculator", description: "Organizacao de recursos humanos segundo COFEN.", filename: "dimensionamento.html", icon: "fas fa-users-cog", color: "blue"},
    {id: "idade-gestacional", name: "Idade Gestacional e DPP", category: "Obstetricia", type: "calculator", description: "Calculo de DUM, DPP e idade gestacional.", filename: "gestacional.html", icon: "fas fa-baby", color: "blue"},
    {id: "aldrete-e-kroulik", name: "Escala de Aldrete e Kroulik", category: "Sedacao", type: "scale", description: "Avaliacao do paciente em recuperacao pos-anestesica.", filename: "aldrete.html", icon: "fas fa-notes-medical", color: "blue"},
    {id: "apache-ii", name: "Escala de APACHE II", category: "UTI", type: "scale", description: "Avaliacao de gravidade em pacientes criticos.", filename: "apache.html", icon: "fa-solid fa-receipt", color: "blue"},
    {id: "apgar", name: "Escala de Apgar", category: "Neonatalogia", type: "scale", description: "Avaliacao imediata do recem-nascido.", filename: "apgar.html", icon: "fas fa-baby-carriage", color: "blue"},
    {id: "asa", name: "Risco Perioperatorio - ASA", category: "Anestesia", type: "scale", description: "Classificacao do estado fisico pre-operatorio.", filename: "asa.html", icon: "fas fa-notes-medical", color: "blue"},
    {id: "ballard", name: "Escala de Ballard", category: "Neonatalogia", type: "scale", description: "Maturidade neuromuscular do recem-nascido.", filename: "ballard.html", icon: "fas fa-baby-carriage", color: "blue"},
    {id: "barthel", name: "Escala de Barthel", category: "Funcional", type: "scale", description: "Nivel de independencia funcional do paciente.", filename: "barthel.html", icon: "fas fa-walking", color: "blue"},
    {id: "bps", name: "Escala de Behavioural (BPS)", category: "Dor", type: "scale", description: "Avaliacao de dor em pacientes sedados/ventilados.", filename: "bps.html", icon: "fa-solid fa-mask-face", color: "blue"},
    {id: "berg", name: "Escala de BERG (BBS)", category: "Fisioterapia", type: "scale", description: "Equilibrio estatico e dinamico.", filename: "berg.html", icon: "fa-solid fa-person", color: "blue"},
    {id: "bishop", name: "Indice de Bishop", category: "Obstetricia", type: "scale", description: "Maturidade cervical para parto.", filename: "bishop.html", icon: "fa-solid fa-user-doctor", color: "blue"},
    {id: "braden", name: "Escala de Braden", category: "Pele", type: "scale", description: "Risco de desenvolvimento de lesao por pressao.", filename: "braden.html", icon: "fas fa-bed", color: "blue"},
    {id: "cam-icu", name: "Escala CAM-ICU", category: "UTI", type: "scale", description: "Avaliacao de delirium em unidade intensiva.", filename: "cam.html", icon: "fas fa-hospital-alt", color: "blue"},
    {id: "capurro", name: "Metodo de Capurro", category: "Neonatalogia", type: "scale", description: "Estimativa da idade gestacional ao nascer.", filename: "capurro.html", icon: "fas fa-baby-carriage", color: "blue"},
    {id: "cincinnati", name: "Escala de Cincinnati", category: "AVC", type: "scale", description: "Triagem rapida para suspeita de AVC.", filename: "cincinnati.html", icon: "fas fa-hospital-user", color: "blue"},
    {id: "cornell", name: "Escala de Cornell", category: "Psiquiatria", type: "scale", description: "Depressao em pacientes com demencia.", filename: "cornell.html", icon: "fas fa-notes-medical", color: "blue"},
    {id: "cries", name: "Escala de CRIES", category: "Dor", type: "scale", description: "Avaliacao de dor neonatal.", filename: "cries.html", icon: "fa-solid fa-child", color: "blue"},
    {id: "curb-65", name: "Escala de CURB-65", category: "Pneumologia", type: "scale", description: "Gravidade em pneumonia adquirida na comunidade.", filename: "curb-65.html", icon: "fa-solid fa-lungs-virus", color: "blue"},
    {id: "downton", name: "Escala de Downton", category: "Seguranca", type: "scale", description: "Risco de queda em pacientes idosos.", filename: "downton.html", icon: "fa-solid fa-shower", color: "blue"},
    {id: "elpo", name: "Escala de ELPO", category: "Pele", type: "scale", description: "Risco de lesao cirurgica.", filename: "elpo.html", icon: "fas fa-child", color: "blue"},
    {id: "fast", name: "Escala de FAST", category: "AVC", type: "scale", description: "Protocolo de avaliacao rapida de AVC.", filename: "fast.html", icon: "fa-solid fa-person-walking-with-cane", color: "blue"},
    {id: "flacc", name: "Escala de FLACC", category: "Dor", type: "scale", description: "Dor em criancas nao verbais.", filename: "flacc.html", icon: "fas fa-hospital-alt", color: "blue"},
    {id: "four", name: "Escala de FOUR", category: "Neurologia", type: "scale", description: "Coma e resposta neurologica detalhada.", filename: "four.html", icon: "fa-solid fa-user-nurse", color: "blue"},
    {id: "fugulin-scp", name: "Escala de Fugulin (SCP)", category: "Gestao", type: "scale", description: "Grau de dependencia dos cuidados de enfermagem.", filename: "fugulin.html", icon: "fas fa-hospital-alt", color: "blue"},
    {id: "gds", name: "Escala de GDS", category: "Geriatria", type: "scale", description: "Rastreio de depressao geriatrica.", filename: "gds.html", icon: "fas fa-child", color: "blue"},
    {id: "glasgow", name: "Escala de Coma de Glasgow", category: "Neurologia", type: "scale", description: "Avaliacao do nivel de consciencia.", filename: "glasgow.html", icon: "fa-solid fa-eye", color: "blue"},
    {id: "gosnell", name: "Escala de Gosnell", category: "Pele", type: "scale", description: "Risco de ulceracao por pressao.", filename: "gosnell.html", icon: "fa-solid fa-weight-scale", color: "blue"},
    {id: "hamilton", name: "Escala de Hamilton", category: "Psiquiatria", type: "scale", description: "Avaliacao da gravidade de ansiedade.", filename: "hamilton.html", icon: "fas fa-file-medical-alt", color: "blue"},
    {id: "humpty-dumpty", name: "Escala de Humpty-Dumpty", category: "Seguranca", type: "scale", description: "Risco de quedas em pediatria.", filename: "humpty.html", icon: "fas fa-file-medical-alt", color: "blue"},
    {id: "johns", name: "Escala de Johns Hopkins", category: "Seguranca", type: "scale", description: "Risco de queda intra-hospitalar.", filename: "johns.html", icon: "fa-solid fa-person-walking-with-cane", color: "blue"},
    {id: "jouvet", name: "Escala de Jouvet", category: "Neurologia", type: "scale", description: "Avaliacao da profundidade do coma.", filename: "jouvet.html", icon: "fas fa-bed", color: "blue"},
    {id: "katz", name: "Escala de Katz", category: "Funcional", type: "scale", description: "Atividades da vida diaria (AVD).", filename: "katz.html", icon: "fa-solid fa-bath", color: "blue"},
    {id: "lachs", name: "Escala de Lachs", category: "Geriatria", type: "scale", description: "Avaliacao funcional do idoso.", filename: "lachs.html", icon: "fa-solid fa-person-walking-with-cane", color: "blue"},
    {id: "lanss", name: "Escala de LANSS", category: "Dor", type: "scale", description: "Avaliacao de dor neuropatica.", filename: "lanss.html", icon: "fas fa-user-nurse", color: "blue"},
    {id: "lawton", name: "Escala de Lawton", category: "Funcional", type: "scale", description: "Atividades instrumentais da vida diaria.", filename: "lawton.html", icon: "fa-solid fa-mug-saucer", color: "blue"},
    {id: "manchester", name: "Escala de Manchester", category: "Triagem", type: "scale", description: "Priorizacao de atendimento em urgencia.", filename: "manchester.html", icon: "fas fa-clinic-medical", color: "blue"},
    {id: "meem", name: "Escala de MEEM", category: "Cognitivo", type: "scale", description: "Mini Exame do Estado Mental.", filename: "meem.html", icon: "fas fa-wheelchair", color: "blue"},
    {id: "meows", name: "Escala de MEOWS", category: "Obstetricia", type: "scale", description: "Alerta obstetrico precoce.", filename: "meows.html", icon: "fas fa-notes-medical", color: "blue"},
    {id: "morse", name: "Escala de Morse", category: "Seguranca", type: "scale", description: "Risco de queda de pacientes adultos.", filename: "morse.html", icon: "fas fa-walking", color: "blue"},
    {id: "news", name: "Escala de NEWS", category: "Alerta Clinico", type: "scale", description: "National Early Warning Score.", filename: "news.html", icon: "fas fa-chart-line", color: "blue"},
    {id: "nihss", name: "Escala NIHSS", category: "AVC", type: "scale", description: "Gravidade do deficit neurologico no AVC.", filename: "nihss.html", icon: "fas fa-brain", color: "blue"},
    {id: "nips", name: "Escala de NIPS", category: "Dor", type: "scale", description: "Dor no recem-nascido (Neonatal Infant Pain Scale).", filename: "nips.html", icon: "fa-solid fa-eye-dropper", color: "blue"},
    {id: "norton", name: "Escala de Norton", category: "Pele", type: "scale", description: "Risco de desenvolvimento de LPP.", filename: "norton.html", icon: "fas fa-file-medical-alt", color: "blue"},
    {id: "numerica-dor", name: "Escala Numerica de Dor", category: "Dor", type: "scale", description: "Intensidade da dor referida.", filename: "escalanumerica.html", icon: "fas fa-hospital-alt", color: "blue"},
    {id: "ofras", name: "Escala de OFRAS", category: "Seguranca", type: "scale", description: "Risco de quedas em obstetricia.", filename: "ofras.html", icon: "fa-solid fa-square-plus", color: "blue"},
    {id: "painad", name: "Escala de PAINAD", category: "Dor", type: "scale", description: "Dor em pacientes com demencia.", filename: "painad.html", icon: "fa-solid fa-hand-holding-medical", color: "blue"},
    {id: "pelod", name: "Escala de PELOD", category: "Pediatria", type: "scale", description: "Disfuncao organica pediatrica.", filename: "pelod.html", icon: "fa-solid fa-comment-medical", color: "blue"},
    {id: "perroca-scp", name: "Classificacao Perroca (SCP)", category: "Gestao", type: "scale", description: "Complexidade do cuidado assistencial.", filename: "perroca.html", icon: "fas fa-hospital-alt", color: "blue"},
    {id: "pews", name: "Escala de PEWS", category: "Alerta Clinico", type: "scale", description: "Alerta precoce pediatrico.", filename: "pews.html", icon: "fas fa-notes-medical", color: "blue"},
    {id: "prism", name: "Escala PRISM", category: "Pediatria", type: "scale", description: "Risco de mortalidade em UTIP.", filename: "prism.html", icon: "fas fa-lungs", color: "blue"},
    {id: "qsofa", name: "Escala qSOFA", category: "Alerta Clinico", type: "scale", description: "Triagem rapida para sepse.", filename: "qsofa.html", icon: "fas fa-lungs", color: "blue"},
    {id: "ramsay", name: "Escala de Ramsay", category: "Sedacao", type: "scale", description: "Nivel de sedacao do paciente.", filename: "ramsay.html", icon: "fas fa-sleep", color: "blue"},
    {id: "richmond", name: "Escala de RASS", category: "Sedacao", type: "scale", description: "Richmond Agitation-Sedation Scale.", filename: "richmond.html", icon: "fas fa-user-md", color: "blue"},
    {id: "saps-iii", name: "Escala de SAPS III", category: "UTI", type: "scale", description: "Simplified Acute Physiology Score.", filename: "saps.html", icon: "fas fa-hospital-alt", color: "blue"},
    {id: "vacinal-2024", name: "Calendario Vacinal 2024", category: "Imunizacao", type: "other", description: "Calendario nacional completo atualizado para 2024.", filename: "vacinas.html", icon: "fas fa-calendar-check", color: "blue"},
    {id: "gestante", name: "Calendario da Gestante", category: "Obstetricia", type: "other", description: "Vacinas recomendadas durante a gestacao.", filename: "gestante.html", icon: "fas fa-baby", color: "blue"}
  ];
  
  // Estado global da aplicacao
  let state = {
    searchTerm: "",
    filterCategory: "all",
    sortOrder: "az",
    showIcons: true,
    viewMode: "xl"
  };
  
  /**
   * Salva o estado no localStorage
   */
  function saveState() {
    try {
      localStorage.setItem('toolsViewState', JSON.stringify(state));
    } catch (e) {
      console.warn('[GlobalMainIndex] Nao foi possivel salvar o estado:', e);
    }
  }
  
  /**
   * Carrega o estado do localStorage
   */
  function loadState() {
    try {
      const saved = localStorage.getItem('toolsViewState');
      if (saved) {
        const parsed = JSON.parse(saved);
        state = Object.assign(state, parsed);
      }
    } catch (e) {
      console.warn('[GlobalMainIndex] Nao foi possivel carregar o estado:', e);
    }
  }
  
  /**
   * Renderiza todos os cards de ferramentas
   */
  function renderAllTools() {
    renderTools("calculadoras", "calculator");
    renderTools("escalas", "scale");
    renderTools("vacinas", "other");
  }
  
  /**
   * Renderiza os cards de uma secao especifica
   */
  function renderTools(containerId, type) {
    const container = document.getElementById(containerId + "-grid");
    
    if (!container) {
      console.warn('[GlobalMainIndex] Container ' + containerId + '-grid nao encontrado');
      return;
    }
    
    try {
      // Aplica classes de visualizacao
      container.className = 'calculators-grid view-' + state.viewMode;
      if (!state.showIcons) {
        container.classList.add('hide-icons');
      }
      
      // Filtra as ferramentas
      let filteredTools = toolsData.filter(function(tool) {
        return tool.type === type;
      });
      
      // Aplica ordenacao
      filteredTools.sort(function(a, b) {
        if (state.sortOrder === "az") {
          return a.name.localeCompare(b.name);
        } else if (state.sortOrder === "za") {
          return b.name.localeCompare(a.name);
        }
        return 0;
      });
      
      // Renderiza os cards
      if (filteredTools.length > 0) {
        if (typeof Utils !== "undefined" && typeof Utils.renderCard === "function") {
          container.innerHTML = filteredTools.map(function(tool) {
            return Utils.renderCard(tool, state, type);
          }).join("");
        } else {
          // Fallback
          container.innerHTML = filteredTools.map(function(tool) {
            return renderCardSimple(tool, type);
          }).join("");
        }
      } else {
        container.innerHTML = '<div class="no-results"><p>Nenhuma ferramenta encontrada</p></div>';
      }
    } catch (error) {
      console.error('[GlobalMainIndex] Erro ao renderizar ' + containerId + ':', error);
    }
  }
  
  /**
   * Renderiza card de forma simples (fallback)
   */
  function renderCardSimple(tool, type) {
    var icons = {
      calculator: "fas fa-calculator",
      scale: "fas fa-clipboard-list",
      other: "fas fa-calendar-check"
    };
    
    var texts = {
      calculator: "Calcular",
      scale: "Classificar",
      other: "Consultar"
    };
    
    var iconClass = icons[type] || "fas fa-arrow-right";
    var text = texts[type] || "Acessar";
    
    return '<a href="pages/' + tool.filename + '" class="tool-card" data-category="' + tool.category.toLowerCase().replace(/\s+/g, '-') + '">' +
      '<div class="tool-icon"><i class="' + tool.icon + '"></i></div>' +
      '<div class="tool-info">' +
        '<h3 class="tool-name">' + tool.name + '</h3>' +
        '<p class="tool-description">' + tool.description + '</p>' +
        '<span class="tool-action-btn"><i class="' + iconClass + '"></i> ' + text + '</span>' +
      '</div>' +
    '</a>';
  }
  
  /**
   * Inicializa os controles globais usando event delegation
   */
  function initGlobalControls() {
    console.log('[GlobalMainIndex] Inicializando controles globais...');
    
    // Verifica se os elementos existem
    var viewDropdown = document.querySelector('.view-dropdown');
    var sortDropdown = document.querySelector('.sort-dropdown');
    var iconToggle = document.getElementById('global-show-icons');
    
    console.log('[GlobalMainIndex] Elementos encontrados:', {
      viewDropdown: !!viewDropdown,
      sortDropdown: !!sortDropdown,
      iconToggle: !!iconToggle
    });
    
    // Estado global da secao
    var sectionState = {
      viewMode: state.viewMode || 'xl',
      sortOrder: state.sortOrder || 'az',
      showIcons: state.showIcons !== false
    };
    
    // Event delegation para dropdown de visualizacao
    document.addEventListener('click', function(e) {
      var viewBtn = e.target.closest('#view-dropdown-btn');
      var viewItem = e.target.closest('.view-dropdown-item');
      var sortBtn = e.target.closest('#sort-dropdown-btn');
      var sortItem = e.target.closest('.sort-dropdown-item');
      
      // Log de debug para cliques
      if (viewBtn || viewItem || sortBtn || sortItem) {
        console.log('[GlobalMainIndex] Clique detectado:', {
          viewBtn: !!viewBtn,
          viewItem: !!viewItem,
          sortBtn: !!sortBtn,
          sortItem: !!sortItem
        });
      }
      
      // Clique no botao de visualizacao
      if (viewBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        var dropdown = viewBtn.closest('.view-dropdown');
        var isOpen = dropdown.classList.contains('open');
        
        // Fecha todos os dropdowns
        document.querySelectorAll('.view-dropdown.open, .sort-dropdown.open').forEach(function(dd) {
          dd.classList.remove('open');
        });
        
        // Abre o dropdown se nao estiver aberto
        if (!isOpen) {
          dropdown.classList.add('open');
          console.log('[GlobalMainIndex] Dropdown de visualizacao aberto');
        }
        
        return;
      }
      
      // Clique em item da visualizacao
      if (viewItem) {
        e.preventDefault();
        e.stopPropagation();
        
        var dropdown = viewItem.closest('.view-dropdown');
        var btn = dropdown.querySelector('#view-dropdown-btn');
        var currentIcon = btn.querySelector('.fa-th-large, .fa-th, .fa-square, .fa-minus-square, .fa-list, .fa-info-circle, .fa-border-all, .fa-compress-arrows-alt');
        var currentLabel = btn.querySelector('.view-current-label');
        var newView = viewItem.dataset.view;
        
        // Atualiza estado visual
        dropdown.querySelectorAll('.view-dropdown-item').forEach(function(item) {
          item.classList.remove('active');
        });
        viewItem.classList.add('active');
        
        // Atualiza botao
        if (currentIcon) {
          currentIcon.className = viewItem.querySelector('i').className;
        }
        if (currentLabel) {
          currentLabel.textContent = viewItem.querySelector('span').textContent;
        }
        
        // Atualiza estado e renderiza
        state.viewMode = newView;
        saveState();
        renderAllTools();
        
        // Fecha dropdown
        dropdown.classList.remove('open');
        console.log('[GlobalMainIndex] Visualizacao alterada para:', newView);
        
        return;
      }
      
      // Clique no botao de ordenacao
      if (sortBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        var dropdown = sortBtn.closest('.sort-dropdown');
        var isOpen = dropdown.classList.contains('open');
        
        // Fecha todos os dropdowns
        document.querySelectorAll('.view-dropdown.open, .sort-dropdown.open').forEach(function(dd) {
          dd.classList.remove('open');
        });
        
        // Abre o dropdown se nao estiver aberto
        if (!isOpen) {
          dropdown.classList.add('open');
          console.log('[GlobalMainIndex] Dropdown de ordenacao aberto');
        }
        
        return;
      }
      
      // Clique em item de ordenacao
      if (sortItem) {
        e.preventDefault();
        e.stopPropagation();
        
        var dropdown = sortItem.closest('.sort-dropdown');
        var btn = dropdown.querySelector('#sort-dropdown-btn');
        var currentIcon = btn.querySelector('.fa-sort-alpha-down, .fa-sort-alpha-up');
        var currentLabel = btn.querySelector('.sort-current-label');
        var newSort = sortItem.dataset.sort;
        
        // Atualiza estado visual
        dropdown.querySelectorAll('.sort-dropdown-item').forEach(function(item) {
          item.classList.remove('active');
        });
        sortItem.classList.add('active');
        
        // Atualiza botao
        if (currentIcon) {
          currentIcon.className = sortItem.querySelector('i').className;
        }
        if (currentLabel) {
          currentLabel.textContent = sortItem.querySelector('span').textContent;
        }
        
        // Atualiza estado e renderiza
        state.sortOrder = newSort;
        saveState();
        renderAllTools();
        
        // Fecha dropdown
        dropdown.classList.remove('open');
        console.log('[GlobalMainIndex] Ordenacao alterada para:', newSort);
        
        return;
      }
      
      // Clique fora dos dropdowns - fecha todos
      if (!e.target.closest('.view-dropdown') && !e.target.closest('.sort-dropdown')) {
        document.querySelectorAll('.view-dropdown.open, .sort-dropdown.open').forEach(function(dd) {
          dd.classList.remove('open');
        });
      }
    });
    
    // Event delegation para toggle de icones
    document.addEventListener('change', function(e) {
      if (e.target && e.target.id === 'global-show-icons') {
        state.showIcons = e.target.checked;
        renderAllTools();
        saveState();
        console.log('[GlobalMainIndex] Toggle de icones alterado para:', state.showIcons);
      }
    });
    
    console.log('[GlobalMainIndex] Controles globais inicializados com sucesso');
  }
  
  /**
   * Inicializa o botao voltar ao topo
   */
  function initBackToTop() {
    const backToTopBtn = document.getElementById("back-to-top-btn");
    if (backToTopBtn) {
      window.addEventListener("scroll", Utils.throttle(function() {
        if (window.scrollY > 300) {
          backToTopBtn.style.display = "flex";
          backToTopBtn.classList.add("visible");
        } else {
          backToTopBtn.classList.remove("visible");
          setTimeout(function() {
            if (window.scrollY <= 300) {
              backToTopBtn.style.display = "none";
            }
          }, 300);
        }
      }, 200));
      
      backToTopBtn.addEventListener("click", function() {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }
  }
  
  /**
   * Inicializacao principal
   */
  function initGlobalMainIndex() {
    console.log('[GlobalMainIndex] Inicializando...');
    
    // Carrega estado salvo
    loadState();
    
    // Verifica se Utils esta disponivel
    if (typeof Utils !== "undefined") {
      // Inicializa controles globais
      initGlobalControls();
      
      // Inicializa botao voltar ao topo
      initBackToTop();
      
      // Renderiza todas as ferramentas
      renderAllTools();
      
      console.log('[GlobalMainIndex] Inicializacao concluida com sucesso');
    } else {
      console.warn('[GlobalMainIndex] Utils nao disponivel, aguardando...');
      
      // Tenta novamente apos um curto intervalo
      setTimeout(function() {
        if (typeof Utils !== "undefined") {
          initGlobalControls();
          initBackToTop();
          renderAllTools();
          console.log('[GlobalMainIndex] Inicializacao tardia concluida');
        } else {
          console.error('[GlobalMainIndex] Utils ainda nao disponivel');
        }
      }, 100);
    }
  }

  // Ouve o evento modulesLoaded do ModuleLoader
  document.addEventListener('modulesLoaded', function(e) {
    console.log('[GlobalMainIndex] Evento modulesLoaded recebido', e.detail);
    
    // Pequeno delay para garantir que o DOM esta pronto
    setTimeout(function() {
      initGlobalMainIndex();
    }, 50);
  });

  // Funcao de backup para inicializacao
  function waitForModules() {
    var container = document.querySelector('#main-container');
    var controlsPanel = document.querySelector('.global-controls-panel');
    
    if (container && container.innerHTML.trim() !== '' && controlsPanel) {
      // Modulos ja foram carregados
      setTimeout(function() {
        initGlobalMainIndex();
      }, 50);
    } else if (document.readyState === 'complete') {
      // Pagina carregou mas modulos nao estao presentes
      // Tenta inicializar mesmo assim
      setTimeout(function() {
        initGlobalMainIndex();
      }, 200);
    } else {
      // Aguarda carregamento da pagina
      window.addEventListener('load', function() {
        setTimeout(function() {
          initGlobalMainIndex();
        }, 200);
      });
    }
  }

  // Inicia verificacao
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForModules);
  } else {
    setTimeout(waitForModules, 10);
  }
  
  // Expõe funcoes globais para debug
  window.renderAllTools = renderAllTools;
  window.renderTools = renderTools;
  window.setGlobalView = function(viewMode) {
    state.viewMode = viewMode;
    saveState();
    renderAllTools();
  };
  
  window.setGlobalSort = function(sortOrder) {
    state.sortOrder = sortOrder;
    saveState();
    renderAllTools();
  };
  
  window.toggleGlobalIcons = function(showIcons) {
    state.showIcons = showIcons;
    saveState();
    renderAllTools();
  };
  
  window.debugRender = function() {
    console.log('=== DEBUG RENDER ===');
    console.log('Utils existe:', typeof Utils !== "undefined");
    console.log('toolsData.length:', toolsData.length);
    console.log('calculadoras-grid existe:', !!document.getElementById('calculadoras-grid'));
    console.log('viewDropdown existe:', !!document.querySelector('.view-dropdown'));
    console.log('sortDropdown existe:', !!document.querySelector('.sort-dropdown'));
    console.log('state:', state);
    renderAllTools();
  };

})();
