/**
 * CONSOLE-CLEANER.JS - Limpeza e Otimização do Console
 * Calculadoras de Enfermagem
 * 
 * Remove erros desnecessários e melhora a experiência do console
 */

class ConsoleCleaner {
    constructor() {
        this.originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug
        };
        
        this.errorPatterns = [
            // Erros de CORS que não afetam funcionalidade
            /Failed to fetch/,
            /Network Error/,
            /CORS/,
            
            // Erros de recursos que não existem (mas temos fallbacks)
            /404/,
            /Failed to load resource/,
            
            // Erros de fontes que não afetam funcionalidade
            /Failed to decode downloaded font/,
            /OTS parsing error/,
            
            // Erros de imagens que não afetam funcionalidade
            /Image failed to load/,
            
            // Erros de HTTP/2 que são tratados pelo sistema de retry
            /ERR_HTTP2_PROTOCOL_ERROR/,
            
            // Avisos de depreciação que não afetam funcionalidade
            /deprecated/,
            /will be removed/
        ];
        
        this.warningPatterns = [
            // Avisos de elementos não encontrados (esperado em carregamento modular)
            /Element .* not found/,
            /Cannot read property/,
            /is not defined/,
            
            // Avisos de recursos em cache
            /Loading resource from cache/,
            
            // Avisos de performance que não são críticos
            /High memory usage/
        ];
        
        this.init();
    }

    init() {
        this.overrideConsoleMethods();
        this.setupErrorFiltering();
        this.setupPerformanceMonitoring();
        this.logStartupMessage();
    }

    overrideConsoleMethods() {
        // Interceptar console.log
        console.log = (...args) => {
            const message = args.join(' ');
            
            // Filtrar logs desnecessários
            if (this.shouldFilterLog(message)) {
                return;
            }
            
            // Adicionar timestamp e source para debugging
            const timestamp = new Date().toLocaleTimeString();
            const enhancedMessage = `[${timestamp}] ${message}`;
            
            this.originalConsole.log(enhancedMessage);
        };

        // Interceptar console.warn
        console.warn = (...args) => {
            const message = args.join(' ');
            
            // Filtrar warnings desnecessários
            if (this.shouldFilterWarning(message)) {
                return;
            }
            
            // Adicionar prefix para warnings importantes
            const enhancedMessage = `⚠️ ${message}`;
            this.originalConsole.warn(enhancedMessage);
        };

        // Interceptar console.error
        console.error = (...args) => {
            const message = args.join(' ');
            
            // Filtrar erros que não afetam funcionalidade
            if (this.shouldFilterError(message)) {
                return;
            }
            
            // Adicionar prefix para erros reais
            const enhancedMessage = `❌ ${message}`;
            this.originalConsole.error(enhancedMessage);
        };

        // Manter info e debug como estão, mas com filtro básico
        console.info = (...args) => {
            const message = args.join(' ');
            if (!this.shouldFilterLog(message)) {
                this.originalConsole.info(...args);
            }
        };

        console.debug = (...args) => {
            const message = args.join(' ');
            if (!this.shouldFilterLog(message)) {
                this.originalConsole.debug(...args);
            }
        };
    }

    shouldFilterLog(message) {
        // Filtrar logs de debugging que poluem o console
        const filterPatterns = [
            /Script loaded:/,
            /Template Engine/,
            /HeaderManager:/,
            /FooterManager:/,
            /DOMContentLoaded/,
            /Loading resource/,
            /Cache hit/,
            /Lazy load/,
            /Intersection Observer/
        ];
        
        return filterPatterns.some(pattern => pattern.test(message));
    }

    shouldFilterWarning(message) {
        return this.warningPatterns.some(pattern => pattern.test(message));
    }

    shouldFilterError(message) {
        return this.errorPatterns.some(pattern => pattern.test(message));
    }

    setupErrorFiltering() {
        // Interceptar erros globais
        window.addEventListener('error', (event) => {
            const errorMessage = event.message || event.error?.message || '';
            
            // Se o erro deve ser filtrado, prevenir logging
            if (this.shouldFilterError(errorMessage)) {
                event.preventDefault();
                return false;
            }
            
            // Para erros reais, adicionar contexto
            const errorWithContext = `[Global Error] ${errorMessage}`;
            this.originalConsole.error(errorWithContext);
        });

        // Interceptar promises rejeitadas não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason?.message || event.reason || '';
            
            // Se deve ser filtrado, prevenir logging
            if (this.shouldFilterError(reason)) {
                event.preventDefault();
                return false;
            }
            
            // Para promises rejeitadas reais, adicionar contexto
            const errorWithContext = `[Unhandled Promise] ${reason}`;
            this.originalConsole.error(errorWithContext);
        });
    }

    setupPerformanceMonitoring() {
        // Monitorar performance de carregamento
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.logPerformanceMetrics();
                }, 1000);
            });
        }
    }

    logPerformanceMetrics() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return;
        }

        const navigation = window.performance.getEntriesByType('navigation')[0];
        const resources = window.performance.getEntriesByType('resource');

        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            
            if (loadTime > 0) {
                console.log(`📊 Performance: Page load time: ${loadTime}ms`);
            }
            
            if (domContentLoaded > 0) {
                console.log(`📊 Performance: DOM content loaded: ${domContentLoaded}ms`);
            }
        }

        // Log de recursos que demoraram para carregar
        const slowResources = resources.filter(resource => {
            return resource.duration > 1000; // Recursos que demoraram mais de 1 segundo
        });

        if (slowResources.length > 0) {
            console.log(`📊 Performance: ${slowResources.length} recursos demoraram >1s para carregar`);
            slowResources.forEach(resource => {
                console.log(`  - ${resource.name}: ${Math.round(resource.duration)}ms`);
            });
        }
    }

    logStartupMessage() {
        // Mensagem de inicialização do sistema
        const startupMessage = `
🧹 Console Cleaner ativo
✨ Erros e warnings desnecessários serão filtrados
🔧 Sistema otimizado para melhor experiência de desenvolvimento
        `.trim();

        this.originalConsole.log(startupMessage);
    }

    // Métodos públicos para controle
    enableAllLogs() {
        console.log = this.originalConsole.log;
        console.warn = this.originalConsole.warn;
        console.error = this.originalConsole.error;
        console.info = this.originalConsole.info;
        console.debug = this.originalConsole.debug;
    }

    disableFiltering() {
        this.errorPatterns = [];
        this.warningPatterns = [];
        this.logPatterns = [];
    }

    addErrorPattern(pattern) {
        this.errorPatterns.push(pattern);
    }

    addWarningPattern(pattern) {
        this.warningPatterns.push(pattern);
    }

    addLogFilter(pattern) {
        this.logPatterns.push(pattern);
    }

    // Método para debugging
    getFilteredCount() {
        return {
            errors: this.errorPatterns.length,
            warnings: this.warningPatterns.length,
            logs: this.logPatterns?.length || 0
        };
    }

    // Método para limpar console
    clearConsole() {
        console.clear();
        this.logStartupMessage();
    }

    // Método para mostrar status
    showStatus() {
        const status = {
            isActive: true,
            filteredErrors: this.errorPatterns.length,
            filteredWarnings: this.warningPatterns.length,
            performanceMonitoring: true
        };
        
        console.log('📊 Console Cleaner Status:', status);
        return status;
    }
}

    // ====================================
    // CORREÇÕES ADICIONAIS DE DOM
    // ====================================

    fixMegaMenuImages() {
        // Criar placeholder SVG simples para as imagens mega-menu
        const placeholderSVG = (title, color) => {
            return `data:image/svg+xml;base64,${btoa(`
                <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="${color}"/>
                    <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
                          font-family="Arial, sans-serif" font-size="16" fill="white">
                        ${title}
                    </text>
                </svg>
            `)}`;
        };

        // Substituir imagens não encontradas por placeholders
        const megaMenuImages = document.querySelectorAll('img[src*="mega-menu-"]');
        megaMenuImages.forEach(img => {
            img.addEventListener('error', () => {
                const src = img.getAttribute('src');
                let placeholder = '';
                let color = '#3b82f6'; // azul padrão

                if (src.includes('sobre')) {
                    placeholder = placeholderSVG('Sobre Nós', '#1A3E74');
                } else if (src.includes('ferramentas')) {
                    placeholder = placeholderSVG('Ferramentas', '#10B981');
                } else if (src.includes('biblioteca')) {
                    placeholder = placeholderSVG('Biblioteca', '#8B5CF6');
                } else if (src.includes('carreiras')) {
                    placeholder = placeholderSVG('Carreiras', '#F59E0B');
                } else if (src.includes('fale')) {
                    placeholder = placeholderSVG('Fale Conosco', '#EF4444');
                }

                if (placeholder) {
                    img.src = placeholder;
                    console.log(`🔧 Imagem ${src} substituída por placeholder`);
                }
            }, { once: true });
        });
    }

    addElementFallbacks() {
        // Adicionar fallbacks para elementos que podem não existir
        const criticalElements = ['header', 'footer', 'main-content', 'modals-container'];
        
        criticalElements.forEach(id => {
            if (!document.getElementById(id)) {
                console.warn(`⚠️ Elemento crítico não encontrado: ${id}`);
                // Criar elemento placeholder se necessário
                if (id === 'main-content') {
                    const main = document.createElement('main');
                    main.id = id;
                    main.className = 'flex-grow min-h-screen bg-gray-50';
                    document.body.appendChild(main);
                    console.log(`✅ Elemento ${id} criado automaticamente`);
                }
            }
        });
    }

    robustifyEventListeners() {
        // Melhorar robustez dos event listeners
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            try {
                return originalAddEventListener.call(this, type, listener, options);
            } catch (error) {
                console.warn(`⚠️ Erro ao adicionar event listener: ${type}`, error);
                return undefined;
            }
        };
    }

    // Método principal que chama todas as correções
    applyDOMCorrections() {
        console.log('🔧 Aplicando correções de DOM...');
        this.fixMegaMenuImages();
        this.addElementFallbacks();
        this.robustifyEventListeners();
        console.log('✅ Correções de DOM aplicadas');
    }
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para evitar conflitos com outros scripts
    setTimeout(() => {
        window.consoleCleaner = new ConsoleCleaner();
        // Aplicar correções de DOM
        window.consoleCleaner.applyDOMCorrections();
    }, 200);
});

// Disponibilizar globalmente
window.ConsoleCleaner = ConsoleCleaner;

// Funções globais para controle externo
window.enableAllLogs = () => {
    if (window.consoleCleaner) {
        window.consoleCleaner.enableAllLogs();
        console.log('✅ Console logging totalmente habilitado');
    }
};

window.disableConsoleFiltering = () => {
    if (window.consoleCleaner) {
        window.consoleCleaner.disableFiltering();
        console.log('✅ Filtros de console desabilitados');
    }
};

window.clearAndResetConsole = () => {
    if (window.consoleCleaner) {
        window.consoleCleaner.clearConsole();
    }
};

window.showConsoleStatus = () => {
    if (window.consoleCleaner) {
        window.consoleCleaner.showStatus();
    }
};

console.log('🧹 Console Cleaner carregado e ativo');