/**
 * MODULE-LOADER.JS
 * Sistema de Carregamento de Módulos HTML
 * Calculadoras de Enfermagem
 * 
 * ATENÇÃO: Este arquivo carrega módulos para páginas internas.
 * A página index.html usa carregamento modular próprio.
 */

(function() {
  'use strict';

  const ModuleLoader = {
    // Cache de módulos carregados
    modulesCache: {},
    
    // Módulos a serem carregados (apenas os que existem)
    modules: [
      'main-content',
      'footer'
    ],
    
    // Estado do carregamento
    loaded: false,
    loading: false,
    
    /**
     * Inicializa o carregamento de módulos
     */
    init: function() {
      console.log('[ModuleLoader] Inicializando...');
      this.loadAllModules();
    },
    
    /**
     * Carrega um módulo individual
     */
    loadModule: async function(moduleName) {
      // Verifica se já está em cache
      if (this.modulesCache[moduleName]) {
        return this.modulesCache[moduleName];
      }
      
      // Define o caminho do módulo com URLs completas do GitHub Pages
      let modulePath;
      
      if (moduleName === 'footer') {
        // Footer fica em assets/components/
        modulePath = 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/components/footer.html';
      } else {
        // main-content fica em assets/pages/
        modulePath = `https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/pages/${moduleName}.html`;
      }
      
      try {
        const response = await fetch(modulePath);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        this.modulesCache[moduleName] = html;
        console.log(`[ModuleLoader] Módulo '${moduleName}' carregado com sucesso`);
        
        return html;
      } catch (error) {
        console.warn(`[ModuleLoader] Erro ao carregar módulo '${moduleName}':`, error.message);
        return null;
      }
    },
    
    /**
     * Carrega todos os módulos em paralelo
     */
    loadAllModules: async function() {
      if (this.loaded || this.loading) {
        return;
      }
      
      this.loading = true;
      console.log('[ModuleLoader] Carregando todos os módulos...');
      
      try {
        // Carrega todos os módulos em paralelo
        const modulePromises = this.modules.map(module => this.loadModule(module));
        const results = await Promise.all(modulePromises);
        
        // Verifica se todos os módulos foram carregados
        const allLoaded = results.every(result => result !== null);
        
        if (allLoaded) {
          this.renderModules();
          this.loaded = true;
          console.log('[ModuleLoader] Todos os módulos carregados e renderizados');
          
          // Dispara evento de módulos carregados
          window.dispatchEvent(new CustomEvent('modulesLoaded', {
            detail: { modules: this.modules }
          }));
        } else {
          console.warn('[ModuleLoader] Alguns módulos não foram carregados');
          // Tenta renderizar mesmo assim com os módulos disponíveis
          this.renderModules();
          this.loaded = true;
          window.dispatchEvent(new CustomEvent('modulesLoaded', {
            detail: { modules: this.modules.filter((_, i) => results[i] !== null) }
          }));
        }
      } catch (error) {
        console.error('[ModuleLoader] Erro crítico ao carregar módulos:', error);
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Renderiza os módulos no container principal
     */
    renderModules: function() {
      const container = document.getElementById('main-container');
      
      if (!container) {
        console.warn('[ModuleLoader] Container #main-container não encontrado');
        return;
      }
      
      // Monta o HTML final
      const html = this.modules
        .map(moduleName => this.modulesCache[moduleName])
        .filter(html => html !== null)
        .join('\n');
      
      container.innerHTML = html;
      console.log('[ModuleLoader] Módulos renderizados no container');
    },
    
    /**
     * Recarrega um módulo específico
     */
    reloadModule: async function(moduleName) {
      delete this.modulesCache[moduleName];
      await this.loadModule(moduleName);
      
      if (this.loaded) {
        this.renderModules();
      }
    },
    
    /**
     * Obtém o HTML de um módulo específico
     */
    getModule: function(moduleName) {
      return this.modulesCache[moduleName] || null;
    }
  };

  // Expõe globalmente
  window.ModuleLoader = ModuleLoader;

  // =========================================
  // INICIALIZAÇÃO
  // =========================================

  function initLoader() {
    ModuleLoader.init();
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Pequeno delay para garantir que outros scripts estejam prontos
      setTimeout(initLoader, 50);
    });
  } else {
    setTimeout(initLoader, 50);
  }

})();
