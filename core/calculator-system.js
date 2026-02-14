/**
 * CALCULATOR SYSTEM - Sistema Principal
 * Gerencia navegação, modais e funções auxiliares
 */

const CALCULATOR_SYSTEM = {
  engine: null,

  /**
   * Inicializa o sistema
   */
  async init(configUrl) {
    this.engine = new CalculatorEngine(configUrl);
    await this.engine.init();
  },

  /**
   * Navegação entre abas
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
   * Executa cálculo
   */
  calculate() {
    if (this.engine) {
      this.engine.calculate();
    }
  },

  /**
   * Reseta formulário
   */
  reset() {
    if (this.engine) {
      this.engine.reset();
    }
  },

  /**
   * Exibe modal genérico baseado em configuração
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
   * Exibe modal com conteúdo compartilhado (fallback para showModal caso não implementado)
   */
  showModalShared(sharedId) {
    console.warn(`Modal compartilhado "${sharedId}" não implementado. Usando fallback.`);
    // Fallback: exibe um modal simples informativo
    this.openModal(
      'Conteúdo Compartilhado',
      'fa-share-alt',
      `<p>O conteúdo compartilhado "${sharedId}" não está disponível no momento.</p>`
    );
  },

  /**
   * Tour guiado (fallback simples)
   */
  tourGuiado(param) {
    console.warn(`Tour guiado para "${param}" não implementado.`);
    this.openModal(
      'Tour Guiado',
      'fa-compass',
      `<p>Funcionalidade de tour guiado em desenvolvimento.</p><p>Parâmetro: ${param}</p>`
    );
  },

  /**
   * Abre modal com conteúdo customizado
   */
  openModal(titulo, icone, conteudo) {
    const modal = document.getElementById('reference-modal');
    if (!modal) return;
    
    document.getElementById('modal-title').textContent = titulo;
    document.getElementById('modal-icon').className = `fa-solid ${icone} text-2xl`;
    document.getElementById('modal-content').innerHTML = conteudo;
    
    modal.classList.remove('hidden');
    
    // Previne scroll do body
    document.body.style.overflow = 'hidden';
  },

  /**
   * Fecha modal
   */
  closeModal() {
    const modal = document.getElementById('reference-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  /**
   * Atalhos para modais específicos (retrocompatibilidade)
   */
  showTutorial() {
    this.showModal('tutorial');
  },

  showNANDAModal() {
    this.showModal('nanda');
  },

  showMedicationChecklist() {
    this.showModal('nove_certos');
  },

  showSafetyGoals() {
    this.showModal('metas_seguranca');
  },

  /**
   * Compartilhamento
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
      showToast(`Compartilhando no ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`);
    }
  },

  /**
   * Copia link da página
   */
  copyLink() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Link copiado para área de transferência!'))
      .catch(() => showToast('Erro ao copiar link', 'warning'));
  },

  /**
   * Copia resultado do cálculo
   */
  copyResult() {
    const resultText = document.getElementById('res-total')?.innerText;
    const resultUnit = document.getElementById('res-unit')?.innerText;
    
    if (!resultText) {
      showToast('Realize um cálculo primeiro!', 'warning');
      return;
    }
    
    const fullText = `${resultText} ${resultUnit}`;
    navigator.clipboard.writeText(fullText)
      .then(() => showToast('Resultado copiado!'))
      .catch(() => showToast('Erro ao copiar resultado', 'warning'));
  },

  /**
   * Gera PDF do resultado
   */
  async generatePDF() {
    if (!this.engine || !this.engine.getResultData()) {
      showToast('Realize um cálculo primeiro!', 'warning');
      return;
    }
    
    showToast('Gerando PDF...', 'info');
    
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      const data = this.engine.getResultData();
      const config = this.engine.config;
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(26, 62, 116);
      doc.text(config.header.titulo, 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
      
      // Linha divisória
      doc.setDrawColor(26, 62, 116);
      doc.line(20, 35, 190, 35);
      
      // Dados do Cálculo
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Dados do Cálculo', 20, 45);
      
      doc.setFontSize(11);
      // Escreve os dados específicos (depende do tipo de cálculo)
      if (data.prescricao !== undefined) {
        doc.text(`Prescrição Médica: ${data.prescricao} UI`, 20, 55);
        doc.text(`Concentração: ${data.concentracao} UI/mL`, 20, 62);
      } else if (data.peso !== undefined) {
        doc.text(`Peso: ${data.peso} kg`, 20, 55);
        doc.text(`Altura: ${data.altura} m`, 20, 62);
      }
      
      // Resultado
      doc.setFontSize(14);
      doc.setTextColor(26, 62, 116);
      doc.text('Resultado', 20, 75);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 188, 212);
      if (data.volumeMl !== undefined) {
        doc.text(`Volume a Aspirar: ${data.volumeMl.toFixed(3)} mL`, 20, 85);
      } else if (data.imc !== undefined) {
        doc.text(`IMC: ${data.imc.toFixed(1)} kg/m²`, 20, 85);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Classificação: ${data.classificacao}`, 20, 95);
      }
      
      // Fórmula
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Fórmula Utilizada:', 20, 110);
      doc.setFontSize(10);
      doc.text(config.calculo.formula, 20, 117);
      
      // Cálculo detalhado
      doc.text('Cálculo:', 20, 127);
      if (data.prescricao !== undefined) {
        doc.text(`${data.prescricao} ÷ ${data.concentracao} = ${data.volumeMl.toFixed(4)} mL`, 20, 134);
      } else if (data.peso !== undefined) {
        doc.text(`${data.peso} ÷ (${data.altura})² = ${data.imc.toFixed(2)} kg/m²`, 20, 134);
      }
      
      // Aviso de segurança
      doc.setFontSize(9);
      doc.setTextColor(150, 0, 0);
      doc.text('ATENÇÃO: Sempre verifique os 9 certos da medicação antes de administrar.', 20, 150);
      doc.text('Este documento é apenas uma ferramenta auxiliar e não substitui o julgamento clínico.', 20, 157);
      
      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Calculadoras de Enfermagem Profissional', 20, 280);
      doc.text('https://auditeduca.github.io/Calculadoras-de-Enfermagem/', 20, 285);
      
      // Salva o PDF
      doc.save(`calculo-${new Date().getTime()}.pdf`);
      showToast('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast('Erro ao gerar PDF. Verifique se a biblioteca está carregada.', 'warning');
    }
  },

  /**
   * Função de notificação (compatibilidade com sidebars)
   */
  notify(msg, type = 'info') {
    showToast(msg, type);
  }
};

/**
 * TOAST SYSTEM - Sistema de Notificações
 */
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  
  const icons = {
    success: 'fa-check-circle',
    warning: 'fa-triangle-exclamation',
    error: 'fa-circle-xmark',
    info: 'fa-info-circle'
  };
  
  const colors = {
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
    info: 'border-nurse-secondary'
  };
  
  toast.className = `toast-msg ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-xl"></i>
    <span>${msg}</span>
  `;
  
  // Container de toasts (cria se não existir)
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-20 right-4 z-[10002] flex flex-col gap-3';
    document.body.appendChild(container);
  }
  
  container.appendChild(toast);
  
  // Remove após 3 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * MODULE LOADER - Carregador de Módulos
 */
async function loadModule(id, url) {
  const container = document.getElementById(id);
  if (!container) {
    console.warn(`Container ${id} não encontrado`);
    return;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    
    const html = await response.text();
    container.innerHTML = html;
    
    // Re-executa scripts inline
    container.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => 
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
    
  } catch (error) {
    console.warn(`Módulo ${id} não carregado:`, error);
  }
}

/**
 * KEYBOARD SHORTCUTS
 */
document.addEventListener('keydown', (e) => {
  // ESC fecha modal
  if (e.key === 'Escape') {
    CALCULATOR_SYSTEM.closeModal();
  }
  
  // Ctrl+Enter calcula
  if (e.ctrlKey && e.key === 'Enter') {
    CALCULATOR_SYSTEM.calculate();
  }
});

// NOTA: Removida a auto-inicialização com DOMContentLoaded para evitar conflitos
// A página agora controla a inicialização manualmente.