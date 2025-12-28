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