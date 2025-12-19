/**
 * Global Main JS - Calculadoras de Enfermagem
 * Gerencia comportamentos comuns de páginas de conteúdo (Missão, Políticas, etc.)
 */

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initTemplateLogging();
});

/**
 * Scroll Suave para âncoras internas (#)
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Calcula offset para não ficar colado no topo (devido ao header fixo)
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Log de carregamento modular
 */
function initTemplateLogging() {
    window.addEventListener('templateEngineReady', function() {
        console.log('%c [Calculadoras de Enfermagem] ', 'background: #1A3E74; color: #fff; font-weight: bold;', 'Ambiente modular carregado com sucesso.');
    });
}

/**
 * Gerenciamento de Hreflangs (SEO)
 */
(function handleSEO() {
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    if (!canonical) return;

    const languages = [
        { lang: "pt-br", href: canonical },
        { lang: "en", href: canonical.replace('.com.br/', '.com.br/en/') },
        { lang: "es", href: canonical.replace('.com.br/', '.com.br/es/') },
        { lang: "x-default", href: canonical }
    ];

    languages.forEach(item => {
        // Evita duplicatas se já existirem no HTML estático
        if (!document.querySelector(`link[hreflang="${item.lang}"]`)) {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = item.lang;
            link.href = item.href;
            document.head.appendChild(link);
        }
    });
})();