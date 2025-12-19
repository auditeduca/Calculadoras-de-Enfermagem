/**
 * Template Engine Dinâmico para Calculadoras de Enfermagem
 * Gerencia a injeção de Header, Footer, Modais e Assets (CSS/JS)
 * Suporta estruturas de pastas profundas.
 */

class TemplateEngine {
    constructor() {
        // Define a raiz do projeto. 
        // Se estiver no GitHub Pages, pode ser necessário ajustar para o nome do repositório
        this.rootPath = window.location.origin + '/Calculadoras-de-Enfermagem/';
        
        // Se estiver rodando localmente (localhost), ajusta a raiz
        if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
            this.rootPath = '/';
        }

        this.componentsPath = `${this.rootPath}assets/components/`;
        this.cssPath = `${this.rootPath}assets/css/`;
        this.jsPath = `${this.rootPath}assets/js/`;

        this.init();
    }

    async init() {
        console.log("Template Engine: Iniciando carregamento de componentes...");
        
        try {
            // 1. Carregar CSS Global primeiro para evitar FOUC (Flash of Unstyled Content)
            this.loadStyle('global.css');

            // 2. Carregar Componentes HTML
            await Promise.all([
                this.injectComponent('header-placeholder', 'header.html', 'header'),
                this.injectComponent('footer-placeholder', 'footer.html', 'footer'),
                this.injectComponent('modals-placeholder', 'modals-main.html', 'modals')
            ]);

            // 3. Carregar Utilitários e Limpador de Console
            this.loadScript('utils.js');
            this.loadScript('console-cleaner.js');

            console.log("Template Engine: Todos os componentes foram carregados com sucesso.");
            
            // Disparar evento customizado quando tudo estiver pronto
            window.dispatchEvent(new Event('templateReady'));

        } catch (error) {
            console.error("Template Engine: Erro ao carregar componentes:", error);
        }
    }

    /**
     * Injeta o conteúdo HTML de um componente em um placeholder
     * e carrega automaticamente seus respectivos CSS e JS.
     */
    async injectComponent(placeholderId, fileName, assetName) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            console.warn(`Template Engine: Placeholder #${placeholderId} não encontrado.`);
            return;
        }

        const response = await fetch(`${this.componentsPath}${fileName}`);
        if (!response.ok) throw new Error(`Não foi possível carregar ${fileName}`);
        
        const html = await response.text();
        placeholder.innerHTML = html;

        // Carrega CSS e JS associados ao componente se o assetName for fornecido
        if (assetName) {
            this.loadStyle(`${assetName}.css`);
            this.loadScript(`${assetName}.js`);
        }
    }

    /**
     * Adiciona uma tag <link> de CSS ao <head>
     */
    loadStyle(fileName) {
        const id = `css-${fileName.replace('.', '-')}`;
        if (document.getElementById(id)) return;

        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `${this.cssPath}${fileName}`;
        document.head.appendChild(link);
    }

    /**
     * Adiciona uma tag <script> ao <body>
     */
    loadScript(fileName) {
        const id = `js-${fileName.replace('.', '-')}`;
        if (document.getElementById(id)) return;

        const script = document.createElement('script');
        script.id = id;
        script.src = `${this.jsPath}${fileName}`;
        script.defer = true;
        document.body.appendChild(script);
    }
}

// Inicializa o engine assim que o DOM básico estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.AppTemplate = new TemplateEngine();
});