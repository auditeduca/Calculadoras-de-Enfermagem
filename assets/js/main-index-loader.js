/**
 * MAIN-INDEX-LOADER.JS
 * Carregamento do Conteúdo Principal com CSS-in-JS
 * Versão: 2.0 - CSS-in-JS Nativo
 * 
 * Carrega o conteúdo de assets/pages/main-index.html
 * com estilos inline gerados dinamicamente
 */

(function() {
    'use strict';

    // =========================================
    // CSS-IN-JS: Definição de Estilos do Componente
    // =========================================
    
    const MainIndexStyles = {
        // Hero Section
        heroSection: `
            position: relative;
            background: linear-gradient(135deg, #1A3E74 0%, #0f2444 100%);
            color: #ffffff;
            padding: 4rem 2rem;
        `,
        
        heroTitle: `
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
        `,
        
        heroText: `
            font-size: 1.125rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 1.5rem;
            line-height: 1.7;
        `,
        
        // Stats Section
        statsSection: `
            background-color: #ffffff;
            padding: 2rem 1rem;
            border-bottom: 1px solid #e2e8f0;
        `,
        
        statItem: `
            text-align: center;
        `,
        
        statValue: `
            font-size: 2.25rem;
            font-weight: 700;
            color: #1A3E74;
            margin-bottom: 0.5rem;
            line-height: 1.2;
        `,
        
        statLabel: `
            color: #64748b;
            font-size: 0.875rem;
        `,
        
        // Section Decorative
        sectionDecorative: `
            position: relative;
            padding-top: 4rem;
            padding-bottom: 4rem;
        `,
        
        // Section Header
        sectionHeader: `
            text-align: center;
            margin-bottom: 3rem;
        `,
        
        sectionTitle: `
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 2rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1rem;
        `,
        
        decorativeLine: `
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, #1A3E74, #00bcd4);
            margin: 0 auto;
            border-radius: 2px;
        `,
        
        // Tools Grid
        toolsGrid: `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        `,
        
        // Buttons
        btnPrimary: `
            display: inline-flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            background-color: #ffffff;
            color: #1A3E74;
            font-weight: 600;
            border-radius: 0.5rem;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
        `,
        
        btnSecondary: `
            display: inline-flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            background-color: transparent;
            color: #ffffff;
            font-weight: 600;
            border: 2px solid #ffffff;
            border-radius: 0.5rem;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
        `,
        
        // Card (para ferramentas)
        toolCard: `
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            text-decoration: none;
            color: inherit;
            display: block;
        `,
        
        toolCardHover: `
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        `,
        
        toolIcon: `
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #1A3E74, #2563eb);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 1.25rem;
            margin-bottom: 1rem;
        `,
        
        toolName: `
            font-size: 1.125rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.5rem;
        `,
        
        toolCategory: `
            font-size: 0.75rem;
            color: #1A3E74;
            background: rgba(26, 62, 116, 0.1);
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            display: inline-block;
            margin-bottom: 0.5rem;
        `,
        
        toolDescription: `
            font-size: 0.875rem;
            color: #64748b;
            line-height: 1.5;
        `,
        
        // Container
        mainContainer: `
            max-width: 1200px;
            margin: 0 auto;
            padding: 0;
        `,
        
        // Responsive
        responsive: `
            @media (max-width: 768px) {
                .hero-title {
                    font-size: 1.75rem !important;
                }
                .section-title {
                    font-size: 1.5rem !important;
                }
                .stat-value {
                    font-size: 1.75rem !important;
                }
                .tools-grid {
                    grid-template-columns: 1fr !important;
                    gap: 1rem !important;
                }
                .hero-section {
                    padding: 3rem 1rem !important;
                }
            }
        `
    };

    // =========================================
    // Função Helper: Injeta CSS no Documento
    // =========================================

    function injectStyles(styles, id) {
        // Verifica se já existe
        const existing = document.getElementById(id);
        if (existing) return;

        const styleElement = document.createElement('style');
        styleElement.id = id;
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
        console.log(`[CSS-in-JS] Estilos injetados: ${id}`);
    }

    // =========================================
    // Função Helper: Aplica estilos inline via JavaScript
    // =========================================

    function applyInlineStyles(element) {
        if (!element) return;
        
        // Aplica estilos ao container principal
        const container = element.querySelector('.main-content') || element;
        if (container) {
            container.style.cssText = MainIndexStyles.mainContainer;
        }

        // Hero Section
        const heroSection = element.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.cssText = MainIndexStyles.heroSection;
            
            const title = heroSection.querySelector('h1');
            if (title) title.style.cssText = MainIndexStyles.heroTitle;
            
            const text = heroSection.querySelector('p');
            if (text) text.style.cssText = MainIndexStyles.heroText;
            
            const buttons = heroSection.querySelectorAll('.btn');
            if (buttons[0]) buttons[0].style.cssText = MainIndexStyles.btnPrimary;
            if (buttons[1]) buttons[1].style.cssText = MainIndexStyles.btnSecondary;
        }

        // Stats Section
        const statsSection = element.querySelector('.stats-section');
        if (statsSection) {
            statsSection.style.cssText = MainIndexStyles.statsSection;
            
            const statItems = statsSection.querySelectorAll('.stat-item');
            statItems.forEach(item => {
                item.style.cssText = MainIndexStyles.statItem;
                const value = item.querySelector('div:first-child');
                if (value) value.style.cssText = MainIndexStyles.statValue;
                const label = item.querySelector('.text-gray-600');
                if (label) label.style.cssText = MainIndexStyles.statLabel;
            });
        }

        // Section Decorative (calculadoras, escalas, vacunas)
        const sections = element.querySelectorAll('.section-decorative');
        sections.forEach(section => {
            section.style.cssText = MainIndexStyles.sectionDecorative;
            
            const header = section.querySelector('.section-header');
            if (header) {
                header.style.cssText = MainIndexStyles.sectionHeader;
                
                const title = header.querySelector('.section-title');
                if (title) title.style.cssText = MainIndexStyles.sectionTitle;
                
                const line = header.querySelector('.decorative-line');
                if (line) line.style.cssText = MainIndexStyles.decorativeLine;
            }
            
            const grid = section.querySelector('.tools-grid');
            if (grid) grid.style.cssText = MainIndexStyles.toolsGrid;
        });
    }

    // =========================================
    // Função Helper: Renderiza cards de ferramentas com estilos inline
    // =========================================

    function renderToolCard(tool, options, section) {
        const categoryClass = options.filterCategory !== 'all' ? '' : 
            `<span class="tool-category" style="${MainIndexStyles.toolCategory}">${tool.category}</span>`;
        
        return `
            <a href="${tool.filename}" class="tool-card" style="${MainIndexStyles.toolCard}" 
               onmouseover="this.style.cssText='${MainIndexStyles.toolCard} ${MainIndexStyles.toolCardHover}'"
               onmouseout="this.style.cssText='${MainIndexStyles.toolCard}'">
                <div class="tool-icon" style="${MainIndexStyles.toolIcon}">
                    <i class="${tool.icon}"></i>
                </div>
                <h3 class="tool-name" style="${MainIndexStyles.toolName}">${tool.name}</h3>
                ${categoryClass}
                <p class="tool-description" style="${MainIndexStyles.toolDescription}">${tool.description}</p>
            </a>
        `;
    }

    // =========================================
    // MainIndexLoader
    // =========================================

    const MainIndexLoader = {
        loaded: false,
        stylesInjected: false,

        /**
         * Injeta os estilos CSS no documento
         */
        injectStyles: function() {
            if (this.stylesInjected) return;

            // Combina todos os estilos
            const allStyles = Object.values(MainIndexStyles).join('\n');
            injectStyles(allStyles, 'main-index-styles');
            
            this.stylesInjected = true;
        },

        /**
         * Carrega o conteúdo principal
         */
        load: async function() {
            if (this.loaded) return;
            
            const container = document.getElementById('main-container');
            if (!container) {
                console.warn('[MainIndexLoader] Container #main-container não encontrado');
                return;
            }

            try {
                // Determina o caminho correto baseado na localização
                const basePath = window.location.pathname.includes('/Calculadoras-de-Enfermagem/') 
                    ? '/Calculadoras-de-Enfermagem/' 
                    : '';
                
                // Injeta estilos CSS-in-JS PRIMEIRO
                this.injectStyles();
                
                const response = await fetch(`${basePath}assets/pages/main-index.html`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const html = await response.text();
                
                // Injeta HTML
                container.innerHTML = html;
                
                // Aplica estilos inline como fallback/backup
                applyInlineStyles(container);
                
                this.loaded = true;
                
                console.log('[MainIndexLoader] Conteúdo principal carregado com CSS-in-JS');
                
                // Dispara evento de conteúdo carregado
                window.dispatchEvent(new CustomEvent('MainIndex:Ready'));
                
            } catch (error) {
                console.warn('[MainIndexLoader] Falha ao carregar:', error.message);
                // Fallback: conteúdo já está inline no HTML
            }
        }
    };

    // Expõe globalmente
    window.MainIndexLoader = MainIndexLoader;
    
    // Expõe estilos para uso externo
    window.MainIndexStyles = MainIndexStyles;
    window.renderToolCard = renderToolCard;

    // =========================================
    // INICIALIZAÇÃO
    // =========================================

    function initMainLoader() {
        MainIndexLoader.load();
    }

    // Inicializa após Template Engine
    document.addEventListener('TemplateEngine:Ready', function() {
        setTimeout(initMainLoader, 50);
    });

    // Fallback: inicializa após DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initMainLoader, 100);
        });
    } else {
        setTimeout(initMainLoader, 100);
    }

    // Listener para quando o conteúdo principal for carregado
    window.addEventListener('MainIndex:Ready', function() {
        // Dispara eventos de página pronta
        setTimeout(function() {
            window.dispatchEvent(new Event('Page:Ready'));
            
            // Inicializa renderização de ferramentas se disponível
            if (typeof window.renderAllTools === 'function') {
                window.renderAllTools();
            }
        }, 50);
    });

})();
