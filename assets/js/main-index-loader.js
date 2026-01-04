/**
 * MAIN-INDEX-LOADER.JS
 * Carregamento do Conteúdo Principal
 * Calculadoras de Enfermagem
 */

(function() {
  'use strict';
  
  const MainIndexLoader = {
    loaded: false,
    
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
        
        const response = await fetch(`${basePath}assets/pages/main-index.html`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        container.innerHTML = html;
        this.loaded = true;
        console.log('[MainIndexLoader] Conteúdo principal carregado');
        
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
