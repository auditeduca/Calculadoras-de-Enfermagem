/**
 * CALCULATOR SYSTEM - Sistema Principal
 * Gerencia navegação, modais, notificações e funções auxiliares.
 * Versão: 4.1 (Modular & Anti-Conflito)
 */

const CALCULATOR_SYSTEM = {
  engine: null,

  /**
   * Inicializa o sistema com um motor baseado em JSON
   */
  async init(configUrl) {
    this.engine = new CalculatorEngine(configUrl);
    await this.engine.init();
  },

  /**
   * Navegação entre abas (Calculadora, Sobre, Ajuda, etc.)
   */
  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
    
    const targetBtn = document.getElementById('btn-tab-' + tabId);
    const targetPane = document.getElementById('pane-' + tabId);
    
    if (targetBtn) targetBtn.classList.add('active');
    if (targetPane) targetPane.classList.remove('hidden');
  },

  /**
   * Dispara o cálculo no motor atual
   */
  calculate() {
    if (this.engine) {
      this.engine.calculate();
    }
  },

  /**
   * Reseta o formulário no motor atual
   */
  reset() {
    if (this.engine) {
      this.engine.reset();
    }
  },

  /**
   * Exibe modal genérico baseado na configuração JSON
   */
  showModal(modalId) {
    const modalConfig = this.engine?.getModalConfig(modalId);
    if (!modalConfig) {
      console.warn(`Modal ${modalId} não encontrado na configuração`);
      return;
    }
    
    this.openModal(modalConfig.titulo, modalConfig.icone, modalConfig.conteudo);
  },

  /**
   * Abre a estrutura física do modal com conteúdo dinâmico
   */
  openModal(titulo, icone, conteudo) {
    const modal = document.getElementById('reference-modal');
    if (!modal) return;
    
    const titleEl = document.getElementById('modal-title');
    const iconEl = document.getElementById('modal-icon');
    const contentEl = document.getElementById('modal-content');

    if (titleEl) titleEl.textContent = titulo;
    if (iconEl) iconEl.className = `fa-solid ${icone} text-2xl`;
    if (contentEl) contentEl.innerHTML = conteudo;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Previne scroll
  },

  /**
   * Fecha o modal ativo
   */
  closeModal() {
    const modal = document.getElementById('reference-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  /**
   * Atalhos de retrocompatibilidade para Sidebars
   */
  showTutorial() { this.showModal('tutorial'); },
  showNANDAModal() { this.showModal('nanda'); },
  showMedicationChecklist() { this.showModal('nove_certos'); },
  showSafetyGoals() { this.showModal('metas_seguranca'); },

  /**
   * Sistema de Compartilhamento Social
   */
  share(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    const urls = {
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
      this.notify(`Compartilhando no ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`);
    }
  },

  copyLink() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => this.notify('Link copiado para área de transferência!'))
      .catch(() => this.notify('Erro ao copiar link', 'warning'));
  },

  copyResult() {
    const resultText = document.getElementById('res-total')?.innerText;
    const resultUnit = document.getElementById('res-unit')?.innerText;
    
    if (!resultText) {
      this.notify('Realize um cálculo primeiro!', 'warning');
      return;
    }
    
    const fullText = `${resultText} ${resultUnit}`;
    navigator.clipboard.writeText(fullText)
      .then(() => this.notify('Resultado copiado!'))
      .catch(() => this.notify('Erro ao copiar resultado', 'warning'));
  },

  /**
   * Geração de PDF (Requer jsPDF)
   */
  async generatePDF() {
    if (!this.engine || !this.engine.resultData) {
      this.notify('Realize um cálculo primeiro!', 'warning');
      return;
    }
    
    this.notify('Gerando PDF...', 'info');
    
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const data = this.engine.resultData;
      const config = this.engine.config;
      
      doc.setFontSize(18);
      doc.setTextColor(26, 62, 116);
      doc.text(config.header.titulo, 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
      doc.line(20, 35, 190, 35);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Resultado do Cálculo', 20, 45);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 188, 212);
      // Lógica genérica de exibição no PDF baseada no resultado
      const valorFormatado = typeof data === 'object' ? JSON.stringify(data) : data;
      doc.text(`Valor: ${valorFormatado}`, 20, 60);
      
      doc.setFontSize(8);
      doc.text('https://auditeduca.github.io/Calculadoras-de-Enfermagem/', 20, 285);
      
      doc.save(`resultado-${new Date().getTime()}.pdf`);
      this.notify('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro PDF:', error);
      this.notify('Erro ao gerar PDF. Verifique as bibliotecas.', 'warning');
    }
  },

  notify(msg, type = 'info') {
    showToast(msg, type);
  }
};

/**
 * TOAST SYSTEM - Notificações Visuais
 */
function showToast(msg, type = 'info') {
  const icons = { success: 'fa-check-circle', warning: 'fa-triangle-exclamation', error: 'fa-circle-xmark', info: 'fa-info-circle' };
  const colors = { success: 'border-green-500', warning: 'border-yellow-500', error: 'border-red-500', info: 'border-nurse-secondary' };
  
  const toast = document.createElement('div');
  toast.className = `toast-msg ${colors[type] || colors.info}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info} text-xl"></i><span>${msg}</span>`;
  
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-20 right-4 z-[10002] flex flex-col gap-3';
    document.body.appendChild(container);
  }
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * MODULE LOADER - Carregador assíncrono de HTML
 */
async function loadModule(id, url) {
  const container = document.getElementById(id);
  if (!container) return;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    const html = await response.text();
    container.innerHTML = html;
    
    // Executa scripts internos do módulo carregado
    container.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  } catch (error) {
    console.warn(`Módulo [${id}] não carregado:`, error);
  }
}

/**
 * ATALHOS DE TECLADO
 */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') CALCULATOR_SYSTEM.closeModal();
  if (e.ctrlKey && e.key === 'Enter') CALCULATOR_SYSTEM.calculate();
});

/**
 * INICIALIZAÇÃO AUTOMÁTICA (ORQUESTRAÇÃO)
 */
document.addEventListener('DOMContentLoaded', async () => {
  // TRAVA DE SEGURANÇA: Se a página tiver 'custom-init', este script para aqui.
  if (document.body.classList.contains('custom-init')) {
    console.log('⚠️ Sistema: Inicialização automática suspensa (Página Customizada).');
    return;
  }

  console.log('🚀 Iniciando sistema automático...');
  const baseUrl = 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/';
  
  try {
    // 1. Motor padrão (Insulina)
    await CALCULATOR_SYSTEM.init('insulina-config.json');
    
    // 2. Componentes Globais
    await loadModule('header-container', `${baseUrl}assets/components/header-v4.html`);
    await loadModule('footer-container', `${baseUrl}assets/components/footer-v4.html`);
    await loadModule('accessibility-container', `${baseUrl}assets/components/accessibility-v4.html`);
    
    // 3. Componentes Estruturais
    await loadModule('author-container', `components/author-section.html`);
    await loadModule('modal-container', `components/modal-generic.html`);
    
    // 4. VLibras
    if (CALCULATOR_SYSTEM.engine?.config?.acessibilidade?.vlibras) {
      await loadModule('libras-container', `components/widget-libras.html`);
    }

    // 5. Sidebars
    if (CALCULATOR_SYSTEM.engine?.config?.sidebars) {
      for (const sidebar of CALCULATOR_SYSTEM.engine.config.sidebars) {
        const id = sidebar.startsWith('sidebar-') ? sidebar : `sidebar-${sidebar.replace('sidebar-', '')}`;
        await loadModule(id, `sidebars/${sidebar}.html`);
      }
    }
    
    console.log('✓ Sistema carregado.');
  } catch (error) {
    console.error('Erro na carga automática:', error);
  }
});