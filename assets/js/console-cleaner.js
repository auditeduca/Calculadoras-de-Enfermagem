/**
 * CONSOLE-CLEANER.JS - Limpeza, Otimização e Recuperação de Falhas
 * * Funcionalidades:
 * 1. Filtra logs indesejados (ruído) do console.
 * 2. Tenta recarregar scripts que falharam (Retry Logic).
 * 3. Corrige imagens quebradas automaticamente.
 * 4. Modo Debug via URL parameter (?debug=true).
 */
class ConsoleCleaner {
    constructor() {
        // Configurações centralizadas
        this.config = {
            debug: new URLSearchParams(window.location.search).has('debug'),
            maxRetries: 3,
            retryDelay: 1500, // ms
            placeholders: {
                megaMenu: 'https://placehold.co/300x200/1A3E74/white?text=Menu'
            },
            // Padrões de mensagens para silenciar
            silencePatterns: [
                /Failed to load resource/,
                /404/,
                /CORS/,
                /Template Engine/,
                /Script loaded/,
                /DOMContentLoaded/,
                /mega-menu/,
                /modals\.js/
            ]
        };

        // Estado interno
        this.originalConsole = { ...console };
        this.retryMap = new Map(); // Rastreia tentativas de retry por URL
        
        this.init();
    }

    init() {
        this.overrideConsole();
        this.setupGlobalHandlers();
        
        const statusMsg = this.config.debug 
            ? '🔧 Console Cleaner: Modo DEBUG ativo (logs silenciados estão visíveis).' 
            : '🧹 Console Cleaner: Ativo e filtrando ruídos.';
            
        this.originalConsole.log(`%c${statusMsg}`, 'color: #00ff88; font-weight: bold; background: #222; padding: 4px;');
    }

    /**
     * Intercepta métodos nativos do console para filtrar mensagens
     */
    overrideConsole() {
        const filter = (args, type) => {
            const msg = args.map(String).join(' ');
            
            // Verifica se a mensagem corresponde a algum padrão de silenciamento
            const shouldSilence = this.config.silencePatterns.some(p => p.test(msg));

            if (shouldSilence) {
                // Se estiver em modo debug, mostra o que seria ocultado de forma colapsada
                if (this.config.debug) {
                    this.originalConsole.groupCollapsed(`%c[SILENCED] ${type}: ${msg.substring(0, 50)}...`, 'color: #888; font-style: italic;');
                    this.originalConsole[type](...args);
                    this.originalConsole.groupEnd();
                }
                return; // Impede o log normal
            }

            // Passa o log original se não for filtrado
            this.originalConsole[type](...args);
        };

        // Sobrescreve os métodos principais
        console.log = (...args) => filter(args, 'log');
        console.warn = (...args) => filter(args, 'warn');
        console.error = (...args) => filter(args, 'error');
    }

    /**
     * Configura listeners globais para erros de rede e execução
     * Usa 'capture: true' para pegar erros de carregamento (img, script) que não borbulham
     */
    setupGlobalHandlers() {
        window.addEventListener('error', (event) => {
            const target = event.target;

            // 1. Lógica de Retry para Scripts
            if (target && target.tagName === 'SCRIPT' && target.src) {
                this.handleScriptRetry(target, event);
                return;
            }

            // 2. Correção de Imagens (Fallback)
            if (target && target.tagName === 'IMG') {
                this.handleImageFallback(target);
                return;
            }

            // 3. Filtragem de erros globais de execução (window error)
            if (event.message) {
                const shouldSilence = this.config.silencePatterns.some(p => p.test(event.message));
                if (shouldSilence && !this.config.debug) {
                    event.preventDefault(); // Impede que o erro apareça no console
                }
            }
        }, true); // Importante: true para capturar erros de carregamento (resource loading)
    }

    /**
     * Gerencia a lógica de re-tentativa para scripts que falharam
     */
    handleScriptRetry(scriptElement, event) {
        const url = scriptElement.src;
        const currentRetries = this.retryMap.get(url) || 0;

        // Se excedeu o limite, deixa o erro aparecer (ou loga falha final)
        if (currentRetries >= this.config.maxRetries) {
            this.originalConsole.error(`❌ Falha crítica: Impossível carregar script após ${this.config.maxRetries} tentativas: ${url}`);
            return;
        }

        // Previne o erro no console durante a tentativa
        if (!this.config.debug) {
            event.preventDefault();
        }

        const nextRetry = currentRetries + 1;
        this.retryMap.set(url, nextRetry);
        
        const delay = this.config.retryDelay * nextRetry; // Backoff linear (ou exponencial se preferir)

        this.originalConsole.warn(`🔄 Retry (${nextRetry}/${this.config.maxRetries}) para script: ${url} em ${delay}ms`);

        setTimeout(() => {
            this.injectScript(url, scriptElement);
        }, delay);
    }

    /**
     * Injeta um novo script para substituir o falho
     */
    injectScript(url, oldScript) {
        // Remove o script antigo para limpar o DOM
        if (oldScript.parentNode) {
            oldScript.parentNode.removeChild(oldScript);
        }

        const newScript = document.createElement('script');
        
        // Adiciona timestamp para evitar cache do navegador em retries
        const separator = url.includes('?') ? '&' : '?';
        newScript.src = `${url}${separator}retry=${Date.now()}`;
        
        newScript.async = oldScript.async;
        newScript.defer = oldScript.defer;
        
        // Copia atributos data- se necessário
        Array.from(oldScript.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
                newScript.setAttribute(attr.name, attr.value);
            }
        });

        document.body.appendChild(newScript);
    }

    /**
     * Aplica fallbacks visuais para imagens quebradas
     */
    handleImageFallback(img) {
        // Verifica se é uma imagem do Mega Menu (regra específica)
        if (img.src.includes('mega-menu') || img.closest('.mega-menu')) {
            // Evita loop infinito se a imagem de placeholder também falhar
            if (img.src === this.config.placeholders.megaMenu) return;

            const title = img.alt || 'Menu Item';
            // Usa encodeURIComponent para garantir que o texto na URL seja válido
            img.src = this.config.placeholders.megaMenu.replace('Menu', encodeURIComponent(title));
            
            // Opcional: Adiciona classe para estilização visual de erro
            img.classList.add('img-fallback-active');
        }
    }
}

// Inicializa
new ConsoleCleaner();