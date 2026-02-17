class MainController {
    constructor() {
        this.components = [];
        this.initialized = false;
        this.initAttempts = 0;
        this.config = {
            enableAnalytics: false,
            enableServiceWorker: false,
            enablePWA: false,
            baseUrl: window.location.origin
        };
        
        console.log('🚀 MainController: Iniciando sistema modular...');
        this.initialize();
    }

    async initialize() {
        try {

            await this.waitForDOM();
            

            this.setupApplication();
            
            // Carregar Template Engine
            await this.loadTemplateEngine();
            
            // Aguardar componentes carregarem
            await this.waitForComponents();
            
            // Inicializar componentes estáticos
            await this.initializeComponents();
            
            // Inicializar sistemas auxiliares
            this.initializeAuxiliarySystems();
            
            this.initialized = true;
            console.log('✅ MainController: Sistema modular operacional');
            
        } catch (error) {
            console.error('❌ MainController: Erro na inicialização:', error);
            this.handleInitializationError(error);
        }
    }

    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    async loadTemplateEngine() {
        try {
            console.log('📦 Aguardando Template Engine...');
            
            // Aguardar Template Engine carregar
            await this.waitFor(() => window.TemplateEngine, 5000);
            
            console.log('✅ Template Engine carregado e inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao aguardar Template Engine:', error);
            throw error;
        }
    }

    async waitForComponents() {
        console.log('⏳ Aguardando componentes carregarem...');
        
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.warn('⚠️ Timeout aguardando componentes');
                resolve();
            }, 10000);
            
            const checkComponents = () => {
                if (window.__COMPONENTS_LOADED__) {
                    clearTimeout(timeout);
                    console.log('✅ Componentes carregados');
                    resolve();
                } else {
                    setTimeout(checkComponents, 100);
                }
            };
            
            // Verificar imediatamente
            checkComponents();
            
            // Escutar evento
            document.addEventListener('componentsLoaded', () => {
                clearTimeout(timeout);
                console.log('✅ Evento componentsLoaded recebido');
                resolve();
            });
        });
    }

    initializeAuxiliarySystems() {
        console.log('🔧 Inicializando sistemas auxiliares...');
        
        try {
            // Inicializar sistema de scroll to top
            this.initializeScrollToTop();
            
            // Inicializar sistema de modal global
            this.initializeModalSystem();
            
            // Inicializar sistema de acessibilidade
            this.initializeAccessibility();
            
            // Inicializar funcionalidades específicas da página
            this.initializePageSpecificFeatures();
            
            console.log('✅ Sistemas auxiliares inicializados');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistemas auxiliares:', error);
        }
    }

    initializeScrollToTop() {
        const checkBtn = setInterval(() => {
            const btn = document.getElementById('backToTop');
            if (btn) {
                clearInterval(checkBtn);
                
                window.addEventListener('scroll', Utils.throttle(() => {
                    if (window.scrollY > 300) {
                        btn.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
                    } else {
                        btn.classList.add('hidden', 'opacity-0', 'pointer-events-none');
                    }
                }, 100));

                btn.addEventListener('click', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        }, 500);

        setTimeout(() => clearInterval(checkBtn), 5000);
    }

    initializeModalSystem() {
        // Event listeners para modais
        document.body.addEventListener('click', (e) => {
            const trigger = e.target.closest('.modal-trigger');
            if (trigger) {
                e.preventDefault();
                const targetId = trigger.getAttribute('data-modal-target') || trigger.getAttribute('href')?.substring(1);
                if (targetId) {
                    this.openModal(targetId);
                }
            }

            if (e.target.classList.contains('modal-backdrop') || e.target.closest('.modal-close-btn')) {
                const modal = e.target.closest('.modal-overlay');
                if (modal) {
                    this.closeModal(modal.id);
                }
            }
        });
    }

    initializeAccessibility() {
        // Trap focus para modais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Fechar todos os modais abertos
                const openModals = document.querySelectorAll('.modal:not(.hidden)');
                openModals.forEach(modal => this.closeModal(modal.id));
            }
        });

        // Announce page load to screen readers
        if (window.Utils && typeof Utils.accessibility.announce === 'function') {
            Utils.accessibility.announce('Página carregada com sucesso', 'polite');
        }
    }

    initializePageSpecificFeatures() {
        // Inicializar funcionalidades específicas baseadas na página atual
        const path = window.location.pathname;
        
        if (path.includes('calculadoras') || path.includes('calculators')) {
            this.initializeCalculators();
        }
        
        if (path.includes('sobre') || path.includes('about')) {
            this.initializeAboutPage();
        }
        
        // Funcionalidades gerais
        this.initializeSearchFunctionality();
        this.initializeFormValidation();
        this.initializeAnimations();
    }

    initializeCalculators() {
        console.log('🧮 Inicializando calculadoras...');
        
        // Lazy load de calculadoras se necessário
        const calculatorSections = document.querySelectorAll('.calculator-section');
        
        calculatorSections.forEach(section => {
            const calculator = section.querySelector('.calculator');
            if (calculator) {
                this.setupCalculator(calculator);
            }
        });
    }

    setupCalculator(calculator) {
        // Configurar calculadora específica
        const inputs = calculator.querySelectorAll('input, select');
        const calculateBtn = calculator.querySelector('.calculate-btn');
        const resultContainer = calculator.querySelector('.result');
        
        if (calculateBtn && resultContainer) {
            calculateBtn.addEventListener('click', () => {
                this.performCalculation(calculator, inputs, resultContainer);
            });
        }
    }

    performCalculation(calculator, inputs, resultContainer) {
        // Lógica de cálculo genérica
        const values = {};
        inputs.forEach(input => {
            if (input.type === 'number' || input.type === 'text') {
                values[input.name] = parseFloat(input.value) || 0;
            }
        });
        
        // Aqui seria implementada a lógica específica de cada calculadora
        console.log('Calculando com valores:', values);
    }

    initializeAboutPage() {
        console.log('ℹ️ Inicializando página sobre...');
        
        // Funcionalidades específicas da página sobre
        const timeline = document.querySelector('.timeline');
        if (timeline) {
            this.initializeTimeline(timeline);
        }
    }

    initializeTimeline(timeline) {
        // Animar elementos da timeline conforme entram na viewport
        const timelineItems = timeline.querySelectorAll('.timeline-item');
        
        if (window.IntersectionObserver) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in');
                    }
                });
            }, { threshold: 0.1 });
            
            timelineItems.forEach(item => observer.observe(item));
        }
    }

    initializeSearchFunctionality() {
        console.log('🔍 Inicializando funcionalidade de busca...');
        
        const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="buscar"], input[placeholder*="Buscar"]');
        
        searchInputs.forEach(input => {
            const debouncedSearch = Utils.debounce((query) => {
                this.performSearch(query, input);
            }, 300);
            
            input.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        });
    }

    performSearch(query, inputElement) {
        if (query.length < 2) return;
        
        console.log('Buscando por:', query);
        
        // Aqui seria implementada a lógica de busca
        // Por exemplo, busca em calculadoras, artigos, etc.
    }

    initializeFormValidation() {
        console.log('📝 Inicializando validação de formulários...');
        
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
            
            // Validação em tempo real
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let message = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'Este campo é obrigatório';
        } else if (type === 'email' && value && !Utils.isValidEmail(value)) {
            isValid = false;
            message = 'Email inválido';
        } else if (type === 'number' && value && isNaN(parseFloat(value))) {
            isValid = false;
            message = 'Digite um número válido';
        }
        
        this.showFieldValidation(field, isValid, message);
        return isValid;
    }

    showFieldValidation(field, isValid, message) {
        // Remover mensagens anteriores
        const existingMessage = field.parentNode.querySelector('.field-error');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Adicionar classe de validação
        field.classList.remove('is-valid', 'is-invalid');
        field.classList.add(isValid ? 'is-valid' : 'is-invalid');
        
        // Adicionar mensagem de erro se necessário
        if (!isValid && message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error text-red-500 text-sm mt-1';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }
    }

    initializeAnimations() {
        console.log('✨ Inicializando animações...');
        
        // Lazy load de imagens
        if (window.Utils && typeof Utils.performance.lazyLoadImages === 'function') {
            Utils.performance.lazyLoadImages();
        }
        
        // Animar elementos conforme entram na viewport
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        if (window.IntersectionObserver) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            animatedElements.forEach(element => observer.observe(element));
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('hidden');
        
        // Focus no primeiro elemento focável
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    waitFor(condition, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const check = () => {
                if (condition()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Condition not met within ${timeout}ms`));
                } else {
                    setTimeout(check, 100);
                }
            };
            
            check();
        });
    }

    handleInitializationError(error) {
        console.log('🔧 Aplicando fallback de emergência...');
        
        try {
            // Tentar correções manuais
            this.applyManualCorrections();
            
            console.log('✅ Fallback aplicado');
            
        } catch (fallbackError) {
            console.error('❌ Erro no fallback:', fallbackError);
        }
    }

    applyManualCorrections() {
        // Corrigir URLs de imagens problemáticos
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && img.src.includes('agent-storage.minimax.io') && img.src.includes('mega-menu-')) {
                const filename = img.src.split('/').pop();
                img.src = `assets/images/${filename}`;
                console.log(`🔧 Imagem corrigida: ${filename}`);
            }
        });
        
        // Corrigir CSS e JS problemáticos
        const resources = document.querySelectorAll('link[href*="agent-storage.minimax.io"], script[src*="agent-storage.minimax.io"]');
        resources.forEach(element => {
            const url = element.href || element.src;
            const filename = url.split('/').pop();
            
            if (filename.includes('.css')) {
                if (element.href) element.href = `assets/css/${filename}`;
            } else if (filename.includes('.js')) {
                if (element.src) element.src = `assets/js/${filename}`;
            }
            
            console.log(`🔧 Recurso corrigido: ${filename}`);
        });
    }

    setupApplication() {
        // Configurar variáveis globais
        window.AppConfig = this.config;
        
        // Configurar error handling global
        this.setupErrorHandling();
        
        // Configurar accessibility enhancements
        this.setupAccessibilityEnhancements();
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }

    setupAccessibilityEnhancements() {
        // Adicionar support para preferências de movimento reduzido
        if (window.matchMedia && document.body) {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.body.classList.add('reduce-motion');
            }
            
            // Adicionar support para alto contraste
            if (window.matchMedia('(prefers-contrast: high)').matches) {
                document.body.classList.add('high-contrast');
            }
            
            // Monitorar mudanças nas preferências do usuário
            window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
                if (document.body) {
                    document.body.classList.toggle('reduce-motion', e.matches);
                }
            });
        }
    }

    async initializeComponents() {
        const componentPromises = [];
        
        // Inicializar Header
        if (window.HeaderManager) {
            componentPromises.push(
                this.initializeComponent('header', () => {
                    if (window.headerManager) {
                        window.headerManager.init();
                    }
                    return window.headerManager;
                })
            );
        }
        
        // Inicializar Footer
        if (window.FooterManager) {
            componentPromises.push(
                this.initializeComponent('footer', () => {
                    if (window.footerManager) {
                        window.footerManager.init();
                    }
                    return window.footerManager;
                })
            );
        }
        
        // Aguardar todos os componentes serem inicializados
        const components = await Promise.all(componentPromises);
        
        // Armazenar referências dos componentes
        components.forEach((component, index) => {
            const names = ['header', 'footer'];
            if (component) {
                this.components[names[index]] = component;
            }
        });
    }

    async initializeComponent(name, initializer) {
        try {
            console.log(`🔧 MainController: Inicializando componente: ${name}`);
            
            const component = await initializer();
            console.log(`✅ MainController: Componente ${name} inicializado:`, component);
            return component;
        } catch (error) {
            console.error(`❌ MainController: Erro ao inicializar componente ${name}:`, error);
            return null;
        }
    }
}

// Inicialização automática
const mainController = new MainController();

// Disponibilizar globalmente
window.MainController = MainController;
window.mainController = mainController;

console.log('✅ Main Controller carregado - Sistema Modular Operacional');