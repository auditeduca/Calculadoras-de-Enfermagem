/**
 * CONSOLE-CLEANER.JS - Limpeza e Otimização do Console
 */
class ConsoleCleaner {
    constructor() {
        this.originalConsole = { ...console };
        this.init();
    }

    init() {
        this.overrideConsole();
        this.setupFilters();
        this.applyDOMCorrections();
        this.originalConsole.log('🧹 Console Cleaner: Ativo e filtrando ruídos.');
    }

    overrideConsole() {
        const filter = (args, type) => {
            const msg = args.join(' ');
            const patterns = [
                /Failed to load resource/, /404/, /CORS/, /Template Engine/, 
                /Script loaded/, /DOMContentLoaded/, /mega-menu/
            ];
            if (patterns.some(p => p.test(msg))) return;
            this.originalConsole[type](...args);
        };

        console.log = (...args) => filter(args, 'log');
        console.warn = (...args) => filter(args, 'warn');
        console.error = (...args) => filter(args, 'error');
    }

    setupFilters() {
        window.addEventListener('error', (e) => {
            if (e.message.includes('404') || e.message.includes('modals.js')) e.preventDefault();
        });
    }

    applyDOMCorrections() {
        // Fix para imagens 404 do Mega Menu
        document.querySelectorAll('img').forEach(img => {
            img.onerror = () => {
                if (img.src.includes('mega-menu')) {
                    const title = img.alt || 'Menu';
                    img.src = `https://placehold.co/300x200/1A3E74/white?text=${encodeURIComponent(title)}`;
                }
            };
        });
    }
}

new ConsoleCleaner();