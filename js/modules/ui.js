/**
 * UI.JS - Gerenciador de Interface do Usuário
 * Controla componentes, abas, campos e interações visuais
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class UIManager {
  constructor(options = {}) {
    this.darkMode = options.darkMode || false;
    this.fontSize = options.fontSize || 'medium';
    this.animations = options.animations !== false;
    this.initDarkModeListener();
  }

  /**
   * Inicializar listener de modo escuro
   */
  initDarkModeListener() {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        this.setDarkMode(e.matches);
      });
    }
  }

  /**
   * Alternar modo escuro
   */
  setDarkMode(enabled) {
    this.darkMode = enabled;
    const html = document.documentElement;
    
    if (enabled) {
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
    }
  }

  /**
   * Gerenciar abas
   */
  switchTab(tabName, options = {}) {
    const {
      container = document.body,
      panelPrefix = 'pane-',
      buttonPrefix = 'btn-tab-',
      activeClass = 'active'
    } = options;

    // Ocultar todos os painéis
    const panels = container.querySelectorAll('[data-tab-pane]');
    panels.forEach(panel => {
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
    });

    // Remover classe ativa de todos os botões
    const buttons = container.querySelectorAll('[data-tab-btn]');
    buttons.forEach(btn => {
      btn.classList.remove(activeClass);
      btn.setAttribute('aria-selected', 'false');
    });

    // Mostrar painel ativo
    const activePanel = document.getElementById(`${panelPrefix}${tabName}`);
    if (activePanel) {
      activePanel.classList.remove('hidden');
      activePanel.setAttribute('aria-hidden', 'false');
    }

    // Marcar botão ativo
    const activeButton = document.getElementById(`${buttonPrefix}${tabName}`);
    if (activeButton) {
      activeButton.classList.add(activeClass);
      activeButton.setAttribute('aria-selected', 'true');
      activeButton.focus();
    }
  }

  /**
   * Validar campo de entrada
   */
  validateField(fieldId, rules = {}) {
    const field = document.getElementById(fieldId);
    if (!field) return { valid: false, error: 'Campo não encontrado' };

    const value = field.value.trim();
    const errors = [];

    // Validações
    if (rules.required && !value) {
      errors.push('Este campo é obrigatório');
    }

    if (rules.min && value && value.length < rules.min) {
      errors.push(`Mínimo de ${rules.min} caracteres`);
    }

    if (rules.max && value && value.length > rules.max) {
      errors.push(`Máximo de ${rules.max} caracteres`);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || 'Formato inválido');
    }

    if (rules.numeric && value && isNaN(value)) {
      errors.push('Deve ser um número');
    }

    if (rules.min && rules.numeric && value && Number(value) < rules.min) {
      errors.push(`Valor mínimo: ${rules.min}`);
    }

    if (rules.max && rules.numeric && value && Number(value) > rules.max) {
      errors.push(`Valor máximo: ${rules.max}`);
    }

    const valid = errors.length === 0;

    // Atualizar visual do campo
    this.setFieldState(fieldId, valid, errors);

    return { valid, errors, value };
  }

  /**
   * Definir estado do campo
   */
  setFieldState(fieldId, valid, errors = []) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const container = field.closest('.form-group') || field.parentElement;
    
    if (valid) {
      field.classList.remove('border-red-500');
      field.classList.add('border-green-500');
      container.classList.remove('has-error');
    } else {
      field.classList.remove('border-green-500');
      field.classList.add('border-red-500');
      container.classList.add('has-error');
    }

    // Mostrar mensagens de erro
    let errorContainer = container.querySelector('.field-errors');
    if (!errorContainer && errors.length > 0) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'field-errors text-red-600 text-xs mt-2 space-y-1';
      container.appendChild(errorContainer);
    }

    if (errorContainer) {
      errorContainer.innerHTML = errors.map(err => `<p>• ${err}</p>`).join('');
    }
  }

  /**
   * Animar elemento
   */
  animate(element, animation, duration = 300) {
    if (!this.animations) return Promise.resolve();

    return new Promise((resolve) => {
      element.style.animation = `${animation} ${duration}ms ease-out`;
      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, duration);
    });
  }

  /**
   * Mostrar/ocultar elemento com animação
   */
  toggleVisibility(elementId, show = null) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const isHidden = element.classList.contains('hidden');
    const shouldShow = show !== null ? show : isHidden;

    if (shouldShow) {
      element.classList.remove('hidden');
      if (this.animations) {
        element.classList.add('animate-fade-in');
      }
    } else {
      element.classList.add('hidden');
    }
  }

  /**
   * Desabilitar/habilitar botão
   */
  setButtonState(buttonId, disabled, text = null) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.disabled = disabled;
    
    if (text) {
      button.textContent = text;
    }

    if (disabled) {
      button.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      button.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  /**
   * Preencher campos de um formulário
   */
  fillForm(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;

    Object.entries(data).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = value;
        } else {
          field.value = value;
        }
      }
    });
  }

  /**
   * Obter dados de um formulário
   */
  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * Limpar formulário
   */
  clearForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.reset();
    form.querySelectorAll('.field-errors').forEach(el => el.remove());
    form.querySelectorAll('.input-field').forEach(el => {
      el.classList.remove('border-red-500', 'border-green-500');
    });
  }

  /**
   * Criar elemento com classe
   */
  createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  /**
   * Adicionar classe com transição
   */
  addClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) element.classList.add(className);
  }

  /**
   * Remover classe com transição
   */
  removeClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) element.classList.remove(className);
  }

  /**
   * Alternar classe
   */
  toggleClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) element.classList.toggle(className);
  }

  /**
   * Definir atributo ARIA
   */
  setAriaLabel(elementId, label) {
    const element = document.getElementById(elementId);
    if (element) element.setAttribute('aria-label', label);
  }

  /**
   * Definir atributo ARIA-DESCRIBEDBY
   */
  setAriaDescribedBy(elementId, descId) {
    const element = document.getElementById(elementId);
    if (element) element.setAttribute('aria-describedby', descId);
  }

  /**
   * Focar elemento
   */
  focus(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Copiar para clipboard com feedback
   */
  async copyToClipboard(text, feedbackId = null) {
    try {
      await navigator.clipboard.writeText(text);
      
      if (feedbackId) {
        const element = document.getElementById(feedbackId);
        if (element) {
          element.textContent = 'Copiado!';
          setTimeout(() => {
            element.textContent = 'Copiar';
          }, 2000);
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao copiar:', error);
      return false;
    }
  }

  /**
   * Mostrar loading em elemento
   */
  showLoading(elementId, message = 'Carregando...') {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <i class="fa-solid fa-spinner animate-spin"></i>
        <span>${message}</span>
      </div>
    `;
  }

  /**
   * Ocultar loading
   */
  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.innerHTML = '';
  }
}

// Instância global
window.UI_MANAGER = new UIManager();

// Exportar
window.UIManager = UIManager;
