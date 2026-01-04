/**
 * CALCULADORAS DE ENFERMAGEM - MODAL SYSTEM
 * Versão: 2.0 - Sistema Modular de Modais
 * 
 * Funcionalidades:
 * - Abertura e fechamento de modais
 * - Toast notifications
 * - Confirmações
 * - Loading states
 * - Acessibilidade WCAG 2.1
 */

(function() {
  'use strict';

  const ModalSystem = {
    // Armazena callbacks de confirmação
    confirmCallbacks: {},

    /**
     * Inicializa o sistema de modais
     */
    init: function() {
      this.initModals();
      this.initToast();
      this.initCloseOnEscape();
      this.initOverlayClick();
      
      console.log('[ModalSystem] Sistema inicializado');
    },

    /**
     * Inicializa event listeners dos modais
     */
    initModals: function() {
      const self = this;

      // Botões de abertura de modais
      document.querySelectorAll('[data-modal]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const modalId = this.getAttribute('data-modal');
          self.open(modalId);
        });
      });

      // Botões de fechamento
      document.querySelectorAll('[data-close]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const modalId = this.getAttribute('data-close');
          self.close(modalId);
        });
      });

      // Close buttons genéricos
      document.querySelectorAll('.modal-close').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const modal = this.closest('.modal');
          if (modal) {
            self.close(modal.id);
          }
        });
      });
    },

    /**
     * Abre um modal pelo ID
     */
    open: function(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) {
        console.warn('[ModalSystem] Modal não encontrado:', modalId);
        return;
      }

      const overlay = modal.querySelector('.modal-overlay');
      const body = document.body;

      // Salva elemento com foco
      modal._lastFocusedElement = document.activeElement;

      // Remove hidden e aria-hidden
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');

      if (overlay) {
        overlay.classList.remove('hidden');
      }

      // Previne scroll do body
      body.style.overflow = 'hidden';

      // Foco no modal
      setTimeout(function() {
        const focusable = modal.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) {
          focusable.focus();
        } else {
          modal.focus();
        }
      }, 100);

      // Dispara evento
      modal.dispatchEvent(new CustomEvent('modal:open', { detail: { id: modalId } }));
    },

    /**
     * Fecha um modal pelo ID
     */
    close: function(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;

      const overlay = modal.querySelector('.modal-overlay');
      const body = document.body;

      // Adiciona hidden e aria-hidden
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');

      if (overlay) {
        overlay.classList.add('hidden');
      }

      // Restaura scroll
      body.style.overflow = '';

      // Restaura foco
      if (modal._lastFocusedElement) {
        modal._lastFocusedElement.focus();
      }

      // Dispara evento
      modal.dispatchEvent(new CustomEvent('modal:close', { detail: { id: modalId } }));
    },

    /**
     * Fecha todos os modais abertos
     */
    closeAll: function() {
      document.querySelectorAll('.modal:not(.hidden)').forEach(function(modal) {
        this.close(modal.id);
      }.bind(this));
    },

    /**
     * Inicializa sistema de toast notifications
     */
    initToast: function() {
      window.showToast = function(message, type, duration) {
        type = type || 'info';
        duration = duration || 5000;

        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        
        const icons = {
          success: 'fa-check-circle',
          error: 'fa-exclamation-circle',
          warning: 'fa-exclamation-triangle',
          info: 'fa-info-circle'
        };

        toast.innerHTML = 
          '<i class="fas ' + (icons[type] || icons.info) + '"></i>' +
          '<span class="toast-message">' + this.escapeHtml(message) + '</span>' +
          '<button class="toast-close" onclick="ModalSystem.hideToast(this)">' +
            '<i class="fas fa-times"></i>' +
          '</button>';

        container.appendChild(toast);

        // Animação de entrada
        setTimeout(function() {
          toast.classList.add('show');
        }, 10);

        // Auto-remover
        if (duration > 0) {
          setTimeout(function() {
            this.hideToast(toast);
          }.bind(this), duration);
        }
      }.bind(this);

      window.hideToast = function(element) {
        const toast = element.closest('.toast');
        if (toast) {
          toast.classList.remove('show');
          toast.classList.add('hide');
          setTimeout(function() {
            toast.remove();
          }, 300);
        }
      };
    },

    /**
     * Mostra confirmação personalizada
     */
    confirm: function(message, title, onConfirm, onCancel) {
      title = title || 'Confirmar';
      
      const modal = document.getElementById('confirm-modal');
      if (!modal) return;

      const titleEl = document.getElementById('confirm-title');
      const messageEl = document.getElementById('confirm-message');
      const okBtn = document.getElementById('confirm-ok');
      const cancelBtn = document.getElementById('confirm-cancel');

      if (titleEl) titleEl.innerHTML = '<i class="fas fa-question-circle"></i> ' + title;
      if (messageEl) messageEl.textContent = message;

      // Remove listeners anteriores
      const newOkBtn = okBtn.cloneNode(true);
      const newCancelBtn = cancelBtn.cloneNode(true);
      okBtn.parentNode.replaceChild(newOkBtn, okBtn);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

      // Adiciona novos listeners
      newOkBtn.addEventListener('click', function() {
        this.close('confirm-modal');
        if (onConfirm) onConfirm();
      }.bind(this));

      newCancelBtn.addEventListener('click', function() {
        this.close('confirm-modal');
        if (onCancel) onCancel();
      }.bind(this));

      this.open('confirm-modal');
    },

    /**
     * Mostra mensagem de erro
     */
    showError: function(message, title) {
      title = title || 'Ops! Algo deu errado';
      
      const modal = document.getElementById('error-modal');
      if (!modal) {
        // Fallback: mostrar como toast
        window.showToast(message, 'error');
        return;
      }

      const titleEl = document.getElementById('error-title');
      const messageEl = document.getElementById('error-message');

      if (titleEl) titleEl.textContent = title;
      if (messageEl) messageEl.textContent = message;

      this.open('error-modal');
    },

    /**
     * Mostra modal de informações de ferramenta
     */
    showToolInfo: function(tool) {
      const modal = document.getElementById('tool-info-modal');
      if (!modal) return;

      const titleEl = document.getElementById('modal-tool-title');
      const contentEl = document.getElementById('modal-tool-content');
      const linkEl = document.getElementById('modal-tool-link');

      if (titleEl) {
        titleEl.innerHTML = '<i class="fas fa-info-circle"></i> ' + tool.name;
      }

      if (contentEl) {
        contentEl.innerHTML = 
          '<div class="tool-info">' +
            '<p class="tool-category"><strong>Categoria:</strong> ' + this.escapeHtml(tool.category) + '</p>' +
            '<p class="tool-description">' + this.escapeHtml(tool.description) + '</p>' +
            (tool.instructions ? '<div class="tool-instructions"><strong>Instruções:</strong><p>' + this.escapeHtml(tool.instructions) + '</p></div>' : '') +
          '</div>';
      }

      if (linkEl) {
        linkEl.href = tool.filename;
      }

      this.open('tool-info-modal');
    },

    /**
     * Mostra modal de loading
     */
    showLoading: function(message) {
      message = message || 'Carregando...';
      
      const modal = document.getElementById('loading-modal');
      if (!modal) return;

      const messageEl = modal.querySelector('.modal-body p');
      if (messageEl) messageEl.textContent = message;

      this.open('loading-modal');
    },

    /**
     * Esconde modal de loading
     */
    hideLoading: function() {
      this.close('loading-modal');
    },

    /**
     * Inicializa fechamento com ESC
     */
    initCloseOnEscape: function() {
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          this.closeAll();
        }
      }.bind(this));
    },

    /**
     * Inicializa clique no overlay para fechar
     */
    initOverlayClick: function() {
      document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function() {
          const modal = this.closest('.modal');
          if (modal) {
            this.close(modal.id);
          }
        }.bind(this));
      }.bind(this));
    },

    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml: function(str) {
      if (typeof str !== 'string') return str;
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  };

  // Expõe globalmente
  window.ModalSystem = ModalSystem;
  window.modalSystem = ModalSystem;

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        ModalSystem.init();
      }, 50);
    });
  } else {
    setTimeout(function() {
      ModalSystem.init();
    }, 50);
  }

  // Também ouvir o evento do Template Engine
  window.addEventListener('TemplateEngine:Ready', function() {
    setTimeout(function() {
      ModalSystem.init();
    }, 100);
  });

})();