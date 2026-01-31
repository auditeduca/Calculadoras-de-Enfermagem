/**
 * NOTIFICATIONS.JS - Sistema de Notificações e Toasts
 * Gerencia exibição de mensagens, alertas e feedbacks visuais
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class NotificationManager {
  constructor(options = {}) {
    this.container = options.container || this.createContainer();
    this.notifications = [];
    this.defaultDuration = options.duration || 4000;
    this.maxNotifications = options.maxNotifications || 5;
    this.voiceEnabled = options.voiceEnabled !== false;
  }

  /**
   * Criar container de notificações se não existir
   */
  createContainer() {
    let container = document.getElementById('notification-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'fixed top-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none';
      document.body.appendChild(container);
    }
    
    return container;
  }

  /**
   * Mostrar notificação
   */
  show(message, type = 'info', duration = null) {
    const notification = this.createNotification(message, type);
    
    // Limitar número de notificações
    if (this.notifications.length >= this.maxNotifications) {
      const oldest = this.notifications.shift();
      oldest.element.remove();
    }

    this.container.appendChild(notification.element);
    this.notifications.push(notification);

    // Ler notificação em voz alta se habilitado
    if (this.voiceEnabled) {
      this.speakNotification(message, type);
    }

    // Auto-remover após duração
    const timeout = duration || this.defaultDuration;
    setTimeout(() => this.remove(notification), timeout);

    return notification;
  }

  /**
   * Criar elemento de notificação
   */
  createNotification(message, type) {
    const element = document.createElement('div');
    element.className = `toast-msg ${type} animate-slide-in`;
    
    const iconMap = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info'
    };

    const icon = iconMap[type] || iconMap.info;
    
    element.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    return {
      element,
      type,
      message,
      createdAt: new Date()
    };
  }

  /**
   * Remover notificação
   */
  remove(notification) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }

    notification.element.style.opacity = '0';
    notification.element.style.transform = 'translateX(50px)';
    
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
    }, 300);
  }

  /**
   * Notificação de sucesso
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  /**
   * Notificação de erro
   */
  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  /**
   * Notificação de aviso
   */
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  /**
   * Notificação de informação
   */
  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  /**
   * Notificação de carregamento
   */
  loading(message) {
    const element = document.createElement('div');
    element.className = 'toast-msg info animate-slide-in';
    element.innerHTML = `
      <i class="fa-solid fa-spinner animate-spin"></i>
      <span>${message}</span>
    `;

    this.container.appendChild(element);

    return {
      element,
      close: () => {
        element.style.opacity = '0';
        element.style.transform = 'translateX(50px)';
        setTimeout(() => element.remove(), 300);
      }
    };
  }

  /**
   * Ler notificação em voz alta
   */
  speakNotification(message, type) {
    if (!('speechSynthesis' in window)) return;

    // Prefixo baseado no tipo
    const prefixes = {
      success: 'Sucesso! ',
      error: 'Erro! ',
      warning: 'Atenção! ',
      info: 'Informação: '
    };

    const fullMessage = (prefixes[type] || '') + message;
    const utterance = new SpeechSynthesisUtterance(fullMessage);
    
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.7;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Limpar todas as notificações
   */
  clearAll() {
    this.notifications.forEach(notification => {
      notification.element.remove();
    });
    this.notifications = [];
  }

  /**
   * Habilitar/desabilitar voz
   */
  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled;
  }
}

/**
 * Modal Manager - Gerenciador de modais
 */
class ModalManager {
  constructor(options = {}) {
    this.modals = {};
    this.activeModal = null;
    this.baseURL = options.baseURL || '';
  }

  /**
   * Registrar um modal
   */
  register(id, config) {
    this.modals[id] = {
      id,
      title: config.title || 'Modal',
      icon: config.icon || 'fa-info-circle',
      content: config.content || '',
      actions: config.actions || [],
      ...config
    };
  }

  /**
   * Mostrar modal
   */
  show(id) {
    const modalConfig = this.modals[id];
    if (!modalConfig) {
      console.warn(`Modal ${id} não registrado`);
      return;
    }

    let modal = document.getElementById('reference-modal');
    
    if (!modal) {
      modal = this.createModalElement();
      document.body.appendChild(modal);
    }

    // Atualizar conteúdo
    const iconEl = modal.querySelector('#modal-icon');
    const titleEl = modal.querySelector('#modal-title');
    const contentEl = modal.querySelector('#modal-content');

    if (iconEl) iconEl.className = `fa-solid ${modalConfig.icon} text-2xl`;
    if (titleEl) titleEl.textContent = modalConfig.title;
    if (contentEl) contentEl.innerHTML = modalConfig.content;

    // Mostrar modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    this.activeModal = id;

    // Ler título em voz alta
    this.announceModal(modalConfig.title);
  }

  /**
   * Fechar modal
   */
  close() {
    const modal = document.getElementById('reference-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
    this.activeModal = null;
  }

  /**
   * Criar elemento de modal
   */
  createModalElement() {
    const modal = document.createElement('div');
    modal.id = 'reference-modal';
    modal.className = 'fixed inset-0 z-[10001] hidden modal-overlay';
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="window.NOTIFICATION_MANAGER?.close()"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div class="modal-content bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
          <div class="modal-header bg-nurse-primary dark:bg-slate-900 text-white p-6 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <i id="modal-icon" class="fa-solid text-2xl"></i>
              <h3 id="modal-title" class="text-xl font-bold font-nunito"></h3>
            </div>
            <button onclick="window.NOTIFICATION_MANAGER?.close()" class="text-white hover:text-nurse-secondary text-xl">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <div id="modal-content" class="modal-body p-6 overflow-y-auto flex-grow text-sm"></div>
          <div class="modal-footer bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-700">
            <button onclick="window.NOTIFICATION_MANAGER?.close()" class="w-full btn btn-primary">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    return modal;
  }

  /**
   * Anunciar modal para leitores de tela
   */
  announceModal(title) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Modal aberto: ${title}`;
    document.body.appendChild(announcement);

    setTimeout(() => announcement.remove(), 1000);
  }

  /**
   * Limpar modais
   */
  clear() {
    this.modals = {};
    this.close();
  }
}

// Instâncias globais
window.NOTIFICATION_MANAGER = new NotificationManager();
window.MODAL_MANAGER = new ModalManager();

// Exportar para uso
window.NotificationManager = NotificationManager;
window.ModalManager = ModalManager;
