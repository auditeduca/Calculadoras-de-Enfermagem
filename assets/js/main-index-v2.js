/**
 * main-index-v2.js - Main Application Logic (Module Version)
 * Sistema Modular de Carregamento e Renderização
 * Calculadoras de Enfermagem
 * 
 * Este módulo pode ser:
 * 1. Carregado diretamente (modo autônomo)
 * 2. Injetado como componente no teste5.html
 * 
 * Integração com EventBus para comunicação entre módulos
 */
(function() {
    'use strict';
    
    // ============================================
    // DETECÇÃO DE MODO DE EXECUÇÃO
    // ============================================
    const ModuleContext = {
        isIntegrated: false,
        isStandalone: false,
        containerId: 'main-v2-content',
        heroContainerId: 'hero-container',
        toolsContainerId: 'tools-section',
        
        detect() {
            // Verificar se existe container pai (indica modo integrado)
            const container = document.getElementById(this.containerId);
            const mainContent = document.querySelector('main[role="main"]');
            
            // Verificar se está em contexto de página completa
            const hasHeader = document.querySelector('header, .header, #header');
            const hasBodyHeader = document.body.querySelector(':scope > header, :scope > .header');
            
            this.isIntegrated = !!(
                (container && container.closest('#app, .app, main, body')) ||
                (mainContent && mainContent !== document.body) ||
                hasHeader || hasBodyHeader
            );
            
            this.isStandalone = !this.isIntegrated;
            
            console.log(`[Main] Modo detectado: ${this.isIntegrated ? 'Integrado' : 'Autônomo'}`);
            return this;
        },
        
        getContainer() {
            return document.getElementById(this.containerId);
        },
        
        getHeroContainer() {
            return document.getElementById(this.heroContainerId) || 
                   document.querySelector('#hero-container, .hero-container');
        },
        
        getToolsContainer() {
            return document.getElementById(this.toolsContainerId) ||
                   document.querySelector('#tools-section, .tools-section');
        }
    };
    
    // ============================================
    // EVENTBUS INTEGRATION
    // ============================================
    const MainModule = {
        state: null,
        initialized: false,
        eventBusReady: false
    };
    
    function setupMainEventBusIntegration() {
        if (!window.EventBus) {
            window.addEventListener('eventbus:ready', function onEventBusReady() {
                window.removeEventListener('eventbus:ready', onEventBusReady);
                registerMainEventBusListeners();
                MainModule.eventBusReady = true;
                console.log('[Main] EventBus integration activated');
            });
        } else {
            registerMainEventBusListeners();
            MainModule.eventBusReady = true;
        }
    }
    
    function registerMainEventBusListeners() {
        if (!window.EventBus) return;
        
        // Escutar eventos de theme
        window.EventBus.on('theme:changed', function(data) {
            console.log('[Main] Tema alterado detectado via EventBus:', data.theme);
            updateMainForTheme(data.isDark);
        }, { module: 'main' });
        
        // Escutar eventos de fonte
        window.EventBus.on('font:changed', function(data) {
            console.log('[Main] Fonte alterada detectada via EventBus:', data.size);
            updateMainForFontSize(data.size);
        }, { module: 'main' });
        
        // Escutar eventos de acessibilidade
        window.EventBus.on('accessibility:settings:changed', function(data) {
            console.log('[Main] Configurações de acessibilidade alteradas via EventBus');
            updateMainForAccessibility(data.settings || data);
        }, { module: 'main' });
        
        // Escutar sincronização de configurações
        window.EventBus.on('accessibility:state:sync', function(data) {
            console.log('[Main] Estado de acessibilidade sincronizado via EventBus');
            if (data.settings) {
                updateMainForAccessibility(data.settings);
            }
        }, { module: 'main' });
    }
    
    function emitMainEvent(eventName, data) {
        const eventData = {
            ...data,
            source: 'main',
            timestamp: Date.now()
        };
        
        // Emitir via EventBus
        if (window.EventBus && MainModule.eventBusReady) {
            window.EventBus.emit('main:' + eventName, eventData);
        }
        
        // Manter compatibilidade com CustomEvents
        window.dispatchEvent(new CustomEvent('main:' + eventName, {
            detail: eventData
        }));
    }
    
    function updateMainForTheme(isDark) {
        const mainContent = ModuleContext.getContainer();
        if (mainContent) {
            mainContent.setAttribute('data-theme', isDark ? 'dark' : 'light');
        }
    }
    
    function updateMainForFontSize(size) {
        const mainContent = ModuleContext.getContainer();
        if (mainContent) {
            mainContent.setAttribute('data-font-size', size);
        }
    }
    
    function updateMainForAccessibility(settings) {
        const mainContent = ModuleContext.getContainer();
        if (!mainContent || !settings) return;
        
        // Aplicar configurações de acessibilidade
        if (settings.highlightLinks) {
            mainContent.classList.add('accessibility-links-highlighted');
        } else {
            mainContent.classList.remove('accessibility-links-highlighted');
        }
        
        if (settings.highlightHeaders) {
            mainContent.classList.add('accessibility-headers-highlighted');
        } else {
            mainContent.classList.remove('accessibility-headers-highlighted');
        }
        
        if (settings.readingMode) {
            mainContent.classList.add('accessibility-reading-mode');
        } else {
            mainContent.classList.remove('accessibility-reading-mode');
        }
        
        if (settings.fontSize !== undefined) {
            const multiplier = [0.875, 1, 1.125, 1.25, 1.5][settings.fontSize] || 1;
            mainContent.style.setProperty('--content-font-size', multiplier);
        }
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    const Utils = (function() {
        'use strict';
        
        function renderCard(tool, sectionState, type) {
            const icons = {
                calculator: 'fa-calculator',
                scale: 'fa-clipboard-list',
                other: 'fa-calendar-check'
            };
            
            const actionIcons = {
                calculator: 'fa-calculator',
                scale: 'fa-clipboard-list',
                other: 'fa-calendar-check'
            };
            
            const actionTexts = {
                calculator: 'Calcular',
                scale: 'Classificar',
                other: 'Consultar'
            };
            
            const tags = {
                calculator: 'calculadora',
                scale: 'escala',
                other: 'informação'
            };
            
            const iconClass = tool.icon ? `fas ${tool.icon}` : `fas fa-${icons[type] || 'calculator'}`;
            const actionIcon = actionIcons[type] || 'fa-calculator';
            const actionText = actionTexts[type] || 'Acessar';
            const tagText = tags[type] || 'informação';
            
            return `
                <a href="${tool.filename}" class="calculator-card ${type}" data-id="${tool.id}" data-category="${tool.category}" role="listitem">
                    <div class="calculator-icon" style="background-color: var(--${tool.color || 'blue'}-light, #e3f2fd); color: var(--${tool.color || 'blue'}-primary, #1976d2);">
                        <i class="${iconClass}" aria-hidden="true"></i>
                    </div>
                    <div class="calculator-content">
                        <h3 class="calculator-title">${escapeHtml(tool.name)}</h3>
                        <span class="calculator-tag">${tagText}</span>
                        <p class="calculator-description">${escapeHtml(tool.description)}</p>
                    </div>
                    <div class="calculator-meta">
                        <span class="calculator-action">
                            <i class="fas ${actionIcon}" aria-hidden="true"></i>
                            ${actionText}
                        </span>
                    </div>
                </a>
            `;
        }
        
        function getActionButton(type) {
            const buttons = {
                calculator: { icon: 'fa-calculator', text: 'Calcular' },
                scale: { icon: 'fa-clipboard-list', text: 'Classificar' },
                other: { icon: 'fa-calendar-check', text: 'Consultar' }
            };
            const btn = buttons[type] || buttons.other;
            return `<button class="action-btn"><i class="fas ${btn.icon}"></i> ${btn.text}</button>`;
        }
        
        function isHighlighted(tool, sectionState) {
            if (sectionState.filterCategory === 'all') return true;
            return tool.category === sectionState.filterCategory;
        }
        
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        function throttle(func, limit) {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func(...args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
        
        function onReady(callback) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
        }
        
        function createElement(tag, attributes, children) {
            const element = document.createElement(tag);
            if (attributes) {
                Object.keys(attributes).forEach(key => {
                    if (key.startsWith('on') && typeof attributes[key] === 'function') {
                        element.addEventListener(key.slice(2).toLowerCase(), attributes[key]);
                    } else if (key === 'className') {
                        element.className = attributes[key];
                    } else {
                        element.setAttribute(key, attributes[key]);
                    }
                });
            }
            if (children) {
                if (Array.isArray(children)) {
                    children.forEach(child => {
                        if (typeof child === 'string') {
                            element.appendChild(document.createTextNode(child));
                        } else if (child instanceof Node) {
                            element.appendChild(child);
                        }
                    });
                } else if (typeof children === 'string') {
                    element.innerHTML = children;
                }
            }
            return element;
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        
        function getUrlParam(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        }
        
        function scrollTo(target, offset = 100) {
            const element = typeof target === 'string'
                ? document.querySelector(target)
                : target;
            if (element) {
                const top = element.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
        
        async function copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.error('Failed to copy:', err);
                return false;
            }
        }
        
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
        
        function generateId() {
            return 'id-' + Math.random().toString(36).substr(2, 9);
        }
        
        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }
        
        function deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }
        
        const Storage = {
            get(key, defaultValue = null) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch (e) {
                    console.warn('Storage get error:', e);
                    return defaultValue;
                }
            },
            set(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    console.warn('Storage set error:', e);
                    return false;
                }
            },
            remove(key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    console.warn('Storage remove error:', e);
                    return false;
                }
            }
        };
        
        return {
            renderCard,
            getActionButton,
            isHighlighted,
            debounce,
            throttle,
            onReady,
            createElement,
            escapeHtml,
            formatDate,
            getUrlParam,
            scrollTo,
            copyToClipboard,
            isElementInViewport,
            generateId,
            clamp,
            deepClone,
            Storage
        };
    })();
    
    // ============================================
    // Tool Data (Carregado via template inline no HTML)
    // ============================================
    function getToolsData() {
        // Primeiro, tentar encontrar o template no documento atual
        let template = document.getElementById('tools-data-template');
        
        // Se não encontrar, tentar nos containers pais (quando injetado via fetch)
        if (!template) {
            const container = ModuleContext.getContainer();
            if (container) {
                template = container.querySelector('#tools-data-template');
            }
        }
        
        // Se ainda não encontrar, tentar encontrar em qualquer lugar do DOM
        if (!template) {
            template = document.querySelector('#tools-data-template');
        }
        
        if (template) {
            try {
                // O conteúdo do script type="text/template" é texto, não HTML executável
                return JSON.parse(template.textContent.trim());
            } catch (e) {
                console.error('[Main] Erro ao parsear dados de ferramentas:', e);
                return [];
            }
        }
        
        console.warn('[Main] Template tools-data-template não encontrado');
        return [];
    }
    
    const toolsData = [];
    
    // ============================================
    // Global State
    // ============================================
    let state = {
        searchTerm: '',
        filterCategory: 'all',
        sortOrder: 'asc',
        showIcons: true,
        viewMode: 'medio',
        loaded: false
    };
    
    // ============================================
    // Hero Slides Configuration
    // ============================================
    const heroSlides = [
        {
            id: 'welcome',
            title: 'Calculadoras de Enfermagem',
            subtitle: 'Conhecer e dominar escalas clínicas é fundamental para o enfermeiro: auxilia na tomada de decisões, otimiza a assistência e fortalece a prática profissional.',
            buttonText: null,
            buttonUrl: '#calculadoras',
            imageIcon: 'fa-calculator',
            gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
            bgImage: 'assets/images/hero-section/hero-section-welcome.webp'
        },
        {
            id: 'diagnosticos',
            title: 'Plano de Enfermagem',
            subtitle: 'Diagnósticos NANDA, NIC e NOC com intervenções personalizadas para cada caso clínico.',
            buttonText: 'Acessar Diagnósticos',
            buttonUrl: 'pages/diagnosticosnanda.html',
            imageIcon: 'fa-clipboard-list',
            gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
            bgImage: 'assets/images/hero-section/hero-section-nanda-tools.webp'
        },
        {
            id: 'simulado',
            title: 'Simulado de Enfermagem',
            subtitle: 'Teste seus conhecimentos com questões comentadas de concursos e provas de residência.',
            buttonText: 'Acessar Simulado',
            buttonUrl: 'pages/simulado-de-enfermagem2.html',
            imageIcon: 'fa-graduation-cap',
            gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
            bgImage: 'assets/images/hero-section/hero-section-simulator-tools.webp'
        },
        {
            id: 'biblioteca',
            title: 'Biblioteca de Enfermagem',
            subtitle: 'Downloads de materiais, apostilas, protocolos e diretrizes clínicas atualizadas.',
            buttonText: 'Acessar Biblioteca',
            buttonUrl: 'pages/downloads.html',
            imageIcon: 'fa-book-open',
            gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
            bgImage: 'assets/images/hero-section/hero-section-library-tools.webp'
        },
        {
            id: 'notificacao',
            title: 'Notificação Compulsória',
            subtitle: 'Sistema de registro e acompanhamento de doenças e agravos de notificação obrigatória.',
            buttonText: 'Acessar Lista de Notificações',
            buttonUrl: 'pages/notificacao-compulsoria.html',
            imageIcon: 'fa-bell',
            gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.5) 100%)',
            bgImage: 'assets/images/hero-section/hero-section-notification-tools.webp'
        }
    ];
    
    let currentSlide = 0;
    let slideInterval;
    
    // ============================================
    // Template Generators
    // ============================================
    function generateHeroHTML() {
        const dotsHTML = heroSlides.map((slide, index) =>
            `<button class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-label="Ir para slide ${index + 1}"></button>`
        ).join('');
        
        const slidesHTML = heroSlides.map((slide, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}" data-slide="${index}" style="background-image: ${slide.gradient}, url('${slide.bgImage}')">
                <div class="hero-slide">
                    <div class="hero-content">
                        <div class="hero-icon">
                            <i class="fas ${slide.imageIcon}" aria-hidden="true"></i>
                        </div>
                        <h2 class="hero-title">${slide.title}</h2>
                        <p class="hero-subtitle">${slide.subtitle}</p>
                        ${slide.buttonText ? `<a href="${slide.buttonUrl}" class="hero-btn">${slide.buttonText}</a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="hero-carousel" role="region" aria-label="Destaques">
                <div class="carousel-inner">
                    ${slidesHTML}
                </div>
                <div class="carousel-indicators" aria-label="Navegação do carrossel">
                    ${dotsHTML}
                </div>
                <button class="carousel-control prev" aria-label="Slide anterior">
                    <i class="fas fa-chevron-left" aria-hidden="true"></i>
                </button>
                <button class="carousel-control next" aria-label="Próximo slide">
                    <i class="fas fa-chevron-right" aria-hidden="true"></i>
                </button>
            </div>
        `;
    }
    
    function generateVisualizarHTML() {
        const viewModes = [
            { value: 'extra-grande', label: 'Extra Grande', icon: 'fa-th-large' },
            { value: 'grande', label: 'Grande', icon: 'fa-th' },
            { value: 'medio', label: 'Médio', icon: 'fa-square' },
            { value: 'pequeno', label: 'Pequeno', icon: 'fa-minus-square' },
            { value: 'lista', label: 'Lista', icon: 'fa-list' },
            { value: 'detalhes', label: 'Detalhes', icon: 'fa-info-circle' },
            { value: 'blocos', label: 'Blocos', icon: 'fa-border-all' },
            { value: 'compacto', label: 'Compacto', icon: 'fa-compress-arrows-alt' }
        ];
        
        const sortOptions = [
            { value: 'asc', label: 'A-Z (Crescente)', icon: 'fa-sort-alpha-down' },
            { value: 'desc', label: 'Z-A (Decrescente)', icon: 'fa-sort-alpha-up' }
        ];
        
        const viewLabels = {
            'extra-grande': 'Extra Grande',
            'grande': 'Grande',
            'medio': 'Médio',
            'pequeno': 'Pequeno',
            'lista': 'Lista',
            'detalhes': 'Detalhes',
            'blocos': 'Blocos',
            'compacto': 'Compacto'
        };
        
        const viewIcons = {
            'extra-grande': 'fa-th-large',
            'grande': 'fa-th',
            'medio': 'fa-square',
            'pequeno': 'fa-minus-square',
            'lista': 'fa-list',
            'detalhes': 'fa-info-circle',
            'blocos': 'fa-border-all',
            'compacto': 'fa-compress-arrows-alt'
        };
        
        const currentViewLabel = viewLabels[state.viewMode] || 'Médio';
        const currentViewIcon = viewIcons[state.viewMode] || 'fa-square';
        const currentSortLabel = state.sortOrder === 'asc' ? 'A-Z (Crescente)' : 'Z-A (Decrescente)';
        const currentSortIcon = state.sortOrder === 'asc' ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up';
        
        return `
            <div class="visualizar-section" role="region" aria-label="Controles de visualização">
                <div class="visualizar-row">
                    <div class="visualizar-group">
                        <span class="visualizar-label">Exibição:</span>
                        <div class="view-dropdown dropdown">
                            <button class="view-btn dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Exibição">
                                <i class="fas ${currentViewIcon}" aria-hidden="true"></i>
                                <span class="view-current">${currentViewLabel} <i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="dropdown-menu" role="menu">
                                ${viewModes.map(m => `
                                    <button class="dropdown-item ${state.viewMode === m.value ? 'active' : ''}" data-value="${m.value}" role="menuitem">
                                        <i class="fas ${m.icon}" aria-hidden="true"></i>
                                        ${m.label}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="visualizar-group">
                        <span class="visualizar-label">Ordenar:</span>
                        <div class="sort-dropdown dropdown">
                            <button class="sort-btn dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Ordenar">
                                <i class="fas ${currentSortIcon}" aria-hidden="true"></i>
                                <span class="sort-current">${currentSortLabel} <i class="fas fa-chevron-down"></i></span>
                            </button>
                            <div class="dropdown-menu" role="menu">
                                ${sortOptions.map(o => `
                                    <button class="dropdown-item ${state.sortOrder === o.value ? 'active' : ''}" data-value="${o.value}" role="menuitem">
                                        <i class="fas ${o.icon}" aria-hidden="true"></i>
                                        ${o.label}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="visualizar-group">
                        <span class="visualizar-label">Ícones:</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="icon-toggle" ${state.showIcons ? 'checked' : ''} aria-label="Mostrar ícones">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    function generateSectionHTML(id, title, tools, type, icon) {
        if (tools.length === 0) return '';
        
        return `
            <section id="${id}" class="section" aria-labelledby="${id}-title">
                <header class="section-header">
                    <h2 id="${id}-title" class="section-title">
                        <i class="fas ${icon}" aria-hidden="true"></i>
                        ${title}
                    </h2>
                </header>
                <div class="tools-grid view-${state.viewMode} ${state.showIcons ? '' : 'hide-icons'}" role="list" aria-label="${title}">
                    ${tools.map(t => Utils.renderCard(t, state, type)).join('')}
                </div>
            </section>
        `;
    }
    
    // ============================================
    // Render Functions
    // ============================================
    function renderAllTools() {
        const toolsContainer = ModuleContext.getToolsContainer();
        if (!toolsContainer) {
            console.warn('[Main] Container de ferramentas não encontrado');
            // Tentar renderizar no container principal
            const mainContainer = ModuleContext.getContainer();
            if (mainContainer) {
                mainContainer.innerHTML = '<p class="error-message">Erro ao carregar conteúdo</p>';
            }
            return;
        }
        
        // Carregar dados das ferramentas
        const loadedTools = getToolsData();
        if (loadedTools.length > 0) {
            toolsData.length = 0;
            loadedTools.forEach(t => toolsData.push(t));
        }
        
        console.log('[Main] Renderizando ferramentas...');
        console.log('[Main] toolsData length:', toolsData.length);
        
        const sortTools = (tools) => {
            const sorted = [...tools].sort((a, b) => a.name.localeCompare(b.name));
            if (state.sortOrder === 'desc') {
                return sorted.reverse();
            }
            return sorted;
        };
        
        const calculators = sortTools(toolsData.filter(t => t.type === 'calculator'));
        const scales = sortTools(toolsData.filter(t => t.type === 'scale'));
        const vaccines = sortTools(toolsData.filter(t => t.type === 'other'));
        
        console.log('[Main] calculators:', calculators.length);
        console.log('[Main] scales:', scales.length);
        console.log('[Main] vaccines:', vaccines.length);
        
        // Renderizar seções
        const visualizarHTML = generateVisualizarHTML();
        const sectionCalculadoras = generateSectionHTML('calculadoras', 'Calculadoras Clínicas', calculators, 'calculator', 'fa-calculator');
        const sectionEscalas = generateSectionHTML('escalas', 'Escalas Clínicas', scales, 'scale', 'fa-clipboard-list');
        const sectionVacinas = generateSectionHTML('vacinas', 'Calendário Vacinal', vaccines, 'other', 'fa-calendar-check');
        
        // Montar conteúdo
        const contentHTML = visualizarHTML + sectionCalculadoras + sectionEscalas + sectionVacinas;
        
        // Inserir no container
        toolsContainer.innerHTML = contentHTML;
        
        console.log('[Main] Ferramentas renderizadas com sucesso');
        
        state.loaded = true;
        initializeEventListeners();
        
        // Emitir eventos de prontidão
        emitMainEvent('ready', { loaded: true, toolsCount: toolsData.length });
        
        window.dispatchEvent(new CustomEvent('Page:Ready', {
            detail: { loaded: true, toolsCount: toolsData.length, module: 'main-index' }
        }));
    }
    
    function renderHero() {
        const heroContainer = ModuleContext.getHeroContainer();
        if (!heroContainer) {
            console.warn('[Main] Container de hero não encontrado');
            return;
        }
        
        const heroHTML = generateHeroHTML();
        heroContainer.innerHTML = heroHTML;
        
        console.log('[Main] Hero renderizado com sucesso');
    }
    
    // ============================================
    // Event Handlers
    // ============================================
    function goToSlide(index) {
        const items = document.querySelectorAll('.carousel-item');
        const indicators = document.querySelectorAll('.indicator');
        
        if (items.length === 0 || indicators.length === 0) return;
        
        items[currentSlide].classList.remove('active');
        items[currentSlide].classList.add('prev');
        items[currentSlide].setAttribute('aria-hidden', 'true');
        indicators[currentSlide].classList.remove('active');
        
        currentSlide = (index + heroSlides.length) % heroSlides.length;
        
        items.forEach((item, i) => {
            item.classList.remove('active', 'next', 'prev');
            if (i === currentSlide) {
                item.classList.add('active');
                item.setAttribute('aria-hidden', 'false');
            } else if (i < currentSlide) {
                item.classList.add('prev');
            } else {
                item.classList.add('next');
            }
        });
        
        indicators[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    function startSlideInterval() {
        stopSlideInterval();
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    function stopSlideInterval() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }
    
    function updateViewMode() {
        const viewBtn = document.querySelector('.view-btn');
        const viewCurrent = viewBtn?.querySelector('.view-current');
        
        const viewLabels = {
            'extra-grande': 'Extra Grande',
            'grande': 'Grande',
            'medio': 'Médio',
            'pequeno': 'Pequeno',
            'lista': 'Lista',
            'detalhes': 'Detalhes',
            'blocos': 'Blocos',
            'compacto': 'Compacto'
        };
        
        const viewIcons = {
            'extra-grande': 'fa-th-large',
            'grande': 'fa-th',
            'medio': 'fa-square',
            'pequeno': 'fa-minus-square',
            'lista': 'fa-list',
            'detalhes': 'fa-info-circle',
            'blocos': 'fa-border-all',
            'compacto': 'fa-compress-arrows-alt'
        };
        
        if (viewCurrent) {
            viewCurrent.innerHTML = `${viewLabels[state.viewMode] || 'Médio'} <i class="fas fa-chevron-down"></i>`;
        }
        
        document.querySelectorAll('.tools-grid').forEach(grid => {
            grid.className = `tools-grid view-${state.viewMode}`;
            if (!state.showIcons) {
                grid.classList.add('hide-icons');
            }
        });
    }
    
    function initializeEventListeners() {
        // View mode dropdown
        const viewBtn = document.querySelector('.view-btn');
        const viewMenu = document.querySelector('.view-dropdown .dropdown-menu');
        const sortMenu = document.querySelector('.sort-dropdown .dropdown-menu');
        
        if (viewBtn && viewMenu) {
            viewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                viewMenu.classList.toggle('show');
                sortMenu?.classList.remove('show');
            });
            
            viewMenu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const value = this.dataset.value;
                    if (value && value !== state.viewMode) {
                        state.viewMode = value;
                        saveState();
                        updateViewMode();
                    }
                    viewMenu.classList.remove('show');
                });
            });
        }
        
        // Sort dropdown
        const sortBtn = document.querySelector('.sort-btn');
        
        if (sortBtn && sortMenu) {
            sortBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                sortMenu.classList.toggle('show');
                viewMenu?.classList.remove('show');
            });
            
            sortMenu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const value = this.dataset.value;
                    if (value && value !== state.sortOrder) {
                        state.sortOrder = value;
                        saveState();
                        renderAllTools();
                    }
                    sortMenu.classList.remove('show');
                });
            });
        }
        
        // Icon toggle
        const iconToggle = document.getElementById('icon-toggle');
        if (iconToggle) {
            iconToggle.addEventListener('change', function() {
                state.showIcons = this.checked;
                saveState();
                document.querySelectorAll('.tools-grid').forEach(grid => {
                    grid.classList.toggle('hide-icons', !state.showIcons);
                });
            });
        }
        
        // Close dropdowns on outside click
        document.addEventListener('click', function() {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        });
        
        // Carousel controls
        const carousel = document.querySelector('.hero-carousel');
        if (carousel) {
            document.querySelectorAll('.indicator').forEach(dot => {
                dot.addEventListener('click', function() {
                    const slideIndex = parseInt(this.dataset.slide);
                    goToSlide(slideIndex);
                    startSlideInterval();
                });
            });
            
            const prevBtn = document.querySelector('.carousel-control.prev');
            const nextBtn = document.querySelector('.carousel-control.next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', function() {
                    prevSlide();
                    startSlideInterval();
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', function() {
                    nextSlide();
                    startSlideInterval();
                });
            }
            
            carousel.addEventListener('mouseenter', stopSlideInterval);
            carousel.addEventListener('mouseleave', startSlideInterval);
            
            document.addEventListener('keydown', function(e) {
                if (carousel.getBoundingClientRect().top <= window.scrollY &&
                    carousel.getBoundingClientRect().bottom >= window.scrollY) {
                    if (e.key === 'ArrowLeft') {
                        prevSlide();
                        startSlideInterval();
                    } else if (e.key === 'ArrowRight') {
                        nextSlide();
                        startSlideInterval();
                    }
                }
            });
            
            startSlideInterval();
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offset = 100;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    }
    
    // ============================================
    // SEO Meta Tags
    // ============================================
    (function initSEO() {
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (!existingCanonical) return;
        
        const currentUrl = existingCanonical.href;
        const head = document.querySelector('head');
        if (!head) return;
        
        const languages = [
            { lang: 'pt-br', href: currentUrl },
            { lang: 'en', href: currentUrl },
            { lang: 'es', href: currentUrl }
        ];
        
        languages.forEach(({ lang, href }) => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang;
            link.href = href;
            head.appendChild(link);
        });
    })();
    
    // ============================================
    // State Management
    // ============================================
    function saveState() {
        try {
            localStorage.setItem('toolsViewState', JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save state:', e);
        }
    }
    
    function loadState() {
        try {
            const saved = localStorage.getItem('toolsViewState');
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
            }
        } catch (e) {
            console.warn('Failed to load state:', e);
        }
    }
    
    // ============================================
    // Initialization State
    // ============================================
    let initializationState = {
        checkCount: 0,
        maxChecks: 100, // Máximo de 100 verificações (10 segundos)
        pollingInterval: null,
        isChecking: false
    };
    
    function stopPolling() {
        if (initializationState.pollingInterval) {
            clearInterval(initializationState.pollingInterval);
            initializationState.pollingInterval = null;
        }
        initializationState.isChecking = false;
    }
    
    // ============================================
    // Initialization
    // ============================================
    function init() {
        // Evitar inicialização dupla
        if (MainModule.initialized) {
            console.log('[Main] Módulo já inicializado, ignorando init()');
            return true;
        }
        
        console.log('[Main] Inicializando módulo main-index...');
        
        // Detectar contexto de execução
        ModuleContext.detect();
        
        // Carregar estado salvo
        loadState();
        
        // Configurar integração EventBus
        setupMainEventBusIntegration();
        
        // Renderizar componentes
        renderHero();
        renderAllTools();
        
        MainModule.initialized = true;
        console.log('[Main] Módulo inicializado com sucesso');
        
        return true;
    }
    
    function initMain() {
        // Verificar se já está inicializando
        if (MainModule.initialized) {
            console.log('[Main] Módulo já inicializado, não inicializando novamente');
            return;
        }
        
        // Verificar se já está verificando para evitar múltiplas instâncias
        if (initializationState.isChecking) {
            console.log('[Main] Verificação já em andamento, ignorando nova chamada');
            return;
        }
        
        console.log('[Main] Iniciando verificação de dados...');
        initializationState.isChecking = true;
        initializationState.checkCount = 0;
        
        // Função de verificação com limite de tentativas
        const checkData = () => {
            initializationState.checkCount++;
            
            // Verificar limite máximo de tentativas
            if (initializationState.checkCount >= initializationState.maxChecks) {
                console.error('[Main] Limite de tentativas atingido. Container ou dados não encontrados.');
                stopPolling();
                return;
            }
            
            const toolsData = getToolsData();
            const container = ModuleContext.getContainer();
            const toolsContainer = ModuleContext.getToolsContainer();
            
            if (toolsData.length > 0 && container && toolsContainer) {
                // Dados disponíveis e containers encontrados, inicializar
                stopPolling();
                init();
            } else if (!container || !toolsContainer) {
                // Container ainda não disponível, continuar verificando
                console.log(`[Main] Container não encontrado (tentativa ${initializationState.checkCount}/${initializationState.maxChecks})...`);
            } else {
                // Container disponível mas sem dados, continuar verificando
                console.log(`[Main] Dados não encontrados (tentativa ${initializationState.checkCount}/${initializationState.maxChecks})...`);
            }
        };
        
        // Usar setInterval para polling controlado
        initializationState.pollingInterval = setInterval(checkData, 100);
        
        // Verificação inicial imediata
        checkData();
    }
    
    // Cleanup na saída da página
    window.addEventListener('beforeunload', stopPolling);
    
    // Escutar evento de container pronto (emitido pelo teste5.html)
    window.addEventListener('module:main-v2-content:ready', function() {
        console.log('[Main] Container main-v2-content está pronto');
        initMain();
    });
    
    // Expor API pública
    window.MainInit = initMain;
    
    window.MainModuleAPI = {
        render: renderAllTools,
        renderHero: renderHero,
        setViewMode: function(mode) {
            state.viewMode = mode;
            saveState();
            renderAllTools();
        },
        setSortOrder: function(order) {
            state.sortOrder = order;
            saveState();
            renderAllTools();
        },
        toggleIcons: function(show) {
            state.showIcons = show;
            saveState();
            renderAllTools();
        },
        getState: function() {
            return { ...state };
        },
        getContext: function() {
            return { ...ModuleContext };
        }
    };
    
    // ============================================
    // Auto-inicialização quando DOM pronto
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[Main] DOM pronto');
        });
    }
    
    // Expor objeto global para coordenação
    window.MainApp = {
        isReady: () => MainModule.initialized,
        getState: () => window.MainModuleAPI.getState(),
        refresh: () => renderAllTools()
    };
    
})();
