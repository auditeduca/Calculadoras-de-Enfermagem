/**
 * CONSOLE-CLEANER.JS - Versão com suporte a hierarquia
 */
class ConsoleCleaner {
    constructor() {
        this.originalConsole = { ...console };
        this.init();
    }

    init() {
        this.overrideMethods();
        this.setupFilters();
        // A aplicação de correções de DOM deve esperar o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyDOMCorrections());
        } else {
            this.applyDOMCorrections();
        }
    }

    overrideMethods() {
        const filter = (args, type) => {
            const msg = args.join(' ');
            if (this.shouldFilter(msg)) return;
            this.originalConsole[type](`[Cleaner] ${msg}`);
        };

        console.log = (...args) => filter(args, 'log');
        console.warn = (...args) => filter(args, 'warn');
        console.error = (...args) => filter(args, 'error');
    }

    shouldFilter(m) {
        return [/TemplateEngine/, /DOMContentLoaded/, /Script loaded/].some(p => p.test(m));
    }

    setupFilters() {
        window.addEventListener('error', e => { if (this.shouldFilter(e.message)) e.preventDefault(); });
    }

    applyDOMCorrections() {
        // Correção de imagens com caminhos inteligentes
        const images = document.querySelectorAll('img[src*="assets/"]');
        images.forEach(img => {
            img.addEventListener('error', () => {
                // Se a imagem falhar, tentamos garantir que ela aponte para o root correto
                // ou usamos um placeholder seguro
                img.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=";
            }, { once: true });
        });
    }
}

window.consoleCleaner = new ConsoleCleaner();