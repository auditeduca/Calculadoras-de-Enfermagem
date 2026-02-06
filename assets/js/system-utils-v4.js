// ============================================
// SISTEMA DE UTILITÁRIOS GLOBAIS
// ============================================

// Inicializar objeto global se não existir
if (typeof window.SystemUtils === 'undefined') {
  window.SystemUtils = {};
}

const SystemUtils = window.SystemUtils;

// Carregar módulo HTML
SystemUtils.loadModule = async function(containerId, url) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} não encontrado`);
    return false;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    container.innerHTML = html;
    container.style.opacity = "1";
    
    // Disparar evento para scripts que dependem do conteúdo
    const event = new CustomEvent('moduleLoaded', { 
      detail: { id: containerId, url } 
    });
    container.dispatchEvent(event);
    
    console.log(`✅ Módulo carregado: ${url}`);
    return true;
  } catch(error) { 
    console.warn(`❌ Erro ao carregar módulo ${containerId}:`, error);
    
    // Fallback para módulos essenciais
    if (containerId === 'header-container') {
      container.innerHTML = `
        <header class="bg-white dark:bg-gray-900 shadow">
          <div class="max-w-7xl mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
              <a href="index.html" class="text-2xl font-bold text-nurse-primary dark:text-cyan-400">
                Calculadoras de Enfermagem
              </a>
              <nav class="hidden md:flex gap-6">
                <a href="index.html" class="font-medium hover:text-nurse-primary">Início</a>
                <a href="insulina.html" class="font-medium hover:text-nurse-primary">Insulina</a>
                <a href="heparina.html" class="font-medium hover:text-nurse-primary">Heparina</a>
                <a href="gotejamento.html" class="font-medium hover:text-nurse-primary">Gotejamento</a>
              </nav>
            </div>
          </div>
        </header>
      `;
    }
    
    if (containerId === 'footer-container') {
      container.innerHTML = `
        <footer class="bg-gray-900 text-white py-8">
          <div class="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2026 Calculadoras de Enfermagem. Todos os direitos reservados.</p>
          </div>
        </footer>
      `;
    }
    
    return false;
  }
};

// Sanitizar HTML para prevenir XSS
SystemUtils.sanitizeHTML = function(html) {
  if (!html) return '';
  
  // Método básico (implementação segura)
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, 'data-removed=')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Sistema de notificações
SystemUtils.showNotification = function(message, type = 'info') {
  const container = document.getElementById('notification-container');
  if (!container) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    return;
  }
  
  const toast = document.createElement('div');
  toast.className = `toast-msg ${
    type === 'success' ? 'border-green-500' : 
    type === 'error' ? 'border-red-500' : 
    'border-nurse-secondary'
  } ${type === 'warning' ? 'warning' : ''}`;
  
  toast.innerHTML = `
    <i class="fa-solid ${
      type === 'success' ? 'fa-check-circle text-green-500' : 
      type === 'error' ? 'fa-exclamation-circle text-red-500' : 
      type === 'warning' ? 'fa-exclamation-triangle text-yellow-500' : 
      'fa-circle-info text-nurse-secondary'
    }"></i>
    <span>${this.sanitizeHTML(message)}</span>
  `;
  
  container.appendChild(toast);
  
  // Remover após 4 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 500);
  }, 4000);
  
  return toast;
};

// Gerenciamento de modais
SystemUtils.showModal = function(title, content, icon = 'fa-info-circle') {
  const modal = document.getElementById('generic-modal');
  if (!modal) {
    console.error('Modal não encontrado');
    return;
  }
  
  const modalIcon = document.getElementById('modal-icon');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  
  if (modalIcon) modalIcon.className = `fa-solid ${icon} text-2xl`;
  if (modalTitle) modalTitle.textContent = title;
  if (modalContent) modalContent.innerHTML = this.sanitizeHTML(content);
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

SystemUtils.closeModal = function() {
  const modal = document.getElementById('generic-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

// Copiar texto para clipboard
SystemUtils.copyToClipboard = async function(text) {
  try {
    await navigator.clipboard.writeText(text);
    this.showNotification('Copiado para a área de transferência!', 'success');
    return true;
  } catch (error) {
    console.error('Erro ao copiar:', error);
    
    // Fallback para navegadores mais antigos
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showNotification('Copiado para a área de transferência!', 'success');
      return true;
    } catch (fallbackError) {
      this.showNotification('Erro ao copiar para a área de transferência', 'error');
      return false;
    }
  }
};

// Compartilhamento em redes sociais
SystemUtils.shareOnSocial = function(platform, url = window.location.href, title = document.title) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent("Confira esta calculadora profissional de enfermagem!");
  
  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
  };
  
  if (urls[platform]) {
    window.open(urls[platform], '_blank', 'width=600,height=400,noopener,noreferrer');
    return true;
  }
  return false;
};

// Validação de data
SystemUtils.validateDate = function(input) {
  if (!input || !input.value) return true;
  
  const selectedDate = new Date(input.value);
  const today = new Date();
  
  if (selectedDate > today) {
    this.showNotification('Data de nascimento não pode ser no futuro', 'error');
    input.value = today.toISOString().split('T')[0];
    return false;
  }
  return true;
};

// Formatação de números
SystemUtils.formatNumber = function(num, decimals = 2) {
  if (isNaN(num)) return '0,00';
  return parseFloat(num).toFixed(decimals).replace('.', ',');
};

// Carregar CSS dinamicamente
SystemUtils.loadCSS = function(url) {
  return new Promise((resolve, reject) => {
    // Verificar se já está carregado
    if (document.querySelector(`link[href="${url}"]`)) {
      resolve();
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

// Carregar JS dinamicamente
SystemUtils.loadJS = function(url) {
  return new Promise((resolve, reject) => {
    // Verificar se já está carregado
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// Função para inicializar data de nascimento padrão
SystemUtils.setupDefaultBirthdate = function() {
  const birthdateInput = document.getElementById('patient_birthdate');
  if (birthdateInput && !birthdateInput.value) {
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    birthdateInput.value = thirtyYearsAgo.toISOString().split('T')[0];
  }
};

// Exportar para uso global
window.SystemUtils = SystemUtils;