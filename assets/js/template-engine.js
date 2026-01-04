/**
 * TEMPLATE-ENGINE.JS
 * Sistema de Carregamento de Componentes Modulares
 * Calculadoras de Enfermagem
 */

(function() {
    'use strict';

    const TemplateEngine = {
        loaded: {},
        loadedCount: 0,
        totalComponents: 5,
        
        // Mapeamento de containers para arquivos
        components: {
            'preload-container': 'assets/components/preload.html',
            'header-container': 'assets/components/header.html',
            'footer-container': 'assets/components/footer.html',
            'accessibility-container': 'assets/components/accessibility.html',
            'main-container': 'assets/pages/main-index.html'
        },
        
        /**
         * Carrega um componente HTML e injeta no container
         */
        loadComponent: async function(containerId, componentPath) {
            if (this.loaded[containerId]) return;
            
            const container = document.getElementById(containerId);
            if (!container) {
                console.warn(`[TemplateEngine] Container #${containerId} não encontrado`);
                this.checkAllLoaded();
                return;
            }
            
            try {
                // Determina o caminho base dinamicamente
                let basePath = '';
                const pathname = window.location.pathname;
                
                // Remove trailing slash para obter o diretório
                let cleanPath = pathname.endsWith('/') 
                    ? pathname.slice(0, -1) 
                    : pathname;
                
                const filename = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);
                
                // Se há um nome de arquivo, obtém o diretório
                if (filename && filename.length > 0 && filename.includes('.')) {
                    basePath = cleanPath.substring(0, cleanPath.lastIndexOf('/') + 1);
                } else if (cleanPath.includes('/')) {
                    // É um diretório, adiciona trailing slash
                    basePath = cleanPath + '/';
                }
                
                const response = await fetch(`${basePath}${componentPath}`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const html = await response.text();
                container.innerHTML = html;
                this.loaded[containerId] = true;
                this.loadedCount++;
                console.log(`[TemplateEngine] Componente ${containerId} carregado (${this.loadedCount}/${this.totalComponents})`);
                
                this.checkAllLoaded();
            } catch (error) {
                console.warn(`[TemplateEngine] Falha ao carregar ${containerId}:`, error.message);
                this.checkAllLoaded();
            }
        },
        
        /**
         * Carrega todos os componentes
         */
        loadAll: async function() {
            console.log('[TemplateEngine] Iniciando carregamento de componentes...');
            
            const promises = Object.entries(this.components).map(([containerId, path]) => {
                return this.loadComponent(containerId, path);
            });
            
            await Promise.all(promises);
        },
        
        /**
         * Verifica se todos os componentes foram carregados
         */
        checkAllLoaded: function() {
            if (this.loadedCount >= this.totalComponents) {
                console.log('[TemplateEngine] Todos os componentes carregados');
                window.dispatchEvent(new CustomEvent('ModulesLoaded'));
                window.dispatchEvent(new CustomEvent('TemplateEngine:Ready'));
            }
        },
        
        /**
         * Verifica se está usando protocolo local (file://)
         */
        isLocalFile: function() {
            return window.location.protocol === 'file:';
        }
    };
    
    // Expõe globalmente
    window.TemplateEngine = TemplateEngine;
    
    // =========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // =========================================
    
    function init() {
        // Verifica se está usando protocolo file://
        if (TemplateEngine.isLocalFile()) {
            console.log('[TemplateEngine] Modo local detectado - use um servidor local para carregar componentes');
            return;
        }
        
        TemplateEngine.loadAll();
    }
    
    // Inicializa após DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
