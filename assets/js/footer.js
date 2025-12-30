/**
 * SISTEMA GESTOR DE FOOTER & PRIVACIDADE (V8.0 - Completo)
 * ----------------------------------------------------
 * Funcionalidades:
 * - Gerenciamento de consentimento de cookies (LGPD)
 * - Botão voltar ao topo
 * - Atualização automática do ano
 * - Modal de configurações de privacidade com accordion
 * - Sub-modais de detalhes para cada serviço
 * - Navegação completa por teclado
 * - Backdrop para modais
 * - Integração com GTM, Analytics e AdSense
 * 
 * Características:
 * - Sistema de pilha de modais
 * - Foco gerenciado para acessibilidade
 * - Suporte a ESC para fechar
 * - Clique fora para fechar
 * - Animações suaves
 * - Accordion expand/recolher para todas as categorias
 */

(function() {
  'use strict';

  // --- CONFIGURAÇÃO E UI ---
  const ui = {
    banner: null,
    overlay: null,
    modal: null,
    backToTop: null,
    cookieFab: null,
    yearSpan: null,
    toast: null,
    toastMessage: null,
    scrollTimeout: null,
    detailModals: {},
    accordionBtns: {}
  };

  const CONSENT_KEY = 'ce_cookie_consent_v8_2025';
  let lastFocusedElement = null;
  let modalStack = [];
  let focusableElements = [];

  // --- INICIALIZAÇÃO ---
  function initFooter() {
    // Captura elementos do DOM
    ui.banner = document.getElementById('cookie-banner');
    ui.overlay = document.getElementById('cookie-overlay');
    ui.modal = document.getElementById('cookie-modal-content');
    ui.backToTop = document.getElementById('backToTop');
    ui.cookieFab = document.getElementById('cookie-fab');
    ui.yearSpan = document.getElementById('current-year');
    ui.toast = document.getElementById('toast-notification');
    ui.toastMessage = document.getElementById('toast-message');

    // Garantir que elementos estejam escondidos inicialmente
    if (ui.modal && !ui.modal.classList.contains('hidden')) {
      ui.modal.classList.add('hidden');
      ui.modal.setAttribute('aria-hidden', 'true');
    }
    if (ui.overlay && !ui.overlay.classList.contains('hidden')) {
      ui.overlay.classList.add('hidden');
      ui.overlay.setAttribute('aria-hidden', 'true');
    }
    
    // Esconder o FAB inicialmente - só mostra após aceitar cookies
    if (ui.cookieFab) {
      ui.cookieFab.classList.add('hidden');
    }

    // Capturar todos os modais de detalhes
    const detailModalElements = document.querySelectorAll('.cookie-detail-modal');
    detailModalElements.forEach(function(modal) {
      if (modal.id) {
        ui.detailModals[modal.id] = modal;
        if (!modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          modal.setAttribute('aria-hidden', 'true');
        }
      }
    });

    // Capturar botões de accordion
    const accordionBtns = document.querySelectorAll('.cookie-expand-btn');
    accordionBtns.forEach(function(btn) {
      const targetId = btn.getAttribute('data-accordion-target');
      if (targetId) {
        ui.accordionBtns[targetId] = btn;
      }
    });

    // Atualizar ano automaticamente
    if (ui.yearSpan) {
      ui.yearSpan.textContent = new Date().getFullYear();
    }

    // Inicializar sistema de cookies
    initCookieConsent();

    // Inicializar botão voltar ao topo
    initBackToTop();

    // Inicializar posição dos botões flutuantes
    initFloatingButtonsPosition();

    // Event listeners para elementos do footer
    attachEventListeners();
  }

  // --- TOAST NOTIFICATION ---
  function showToast(message) {
    if (!ui.toast || !ui.toastMessage) return;
    
    ui.toastMessage.textContent = message;
    ui.toast.classList.remove('hidden');
    
    // Trigger reflow for animation
    void ui.toast.offsetWidth;
    
    ui.toast.classList.add('visible');
    
    // Hide after 3 seconds
    setTimeout(function() {
      ui.toast.classList.remove('visible');
      setTimeout(function() {
        ui.toast.classList.add('hidden');
      }, 300);
    }, 3000);
  }

  // --- GERENCIAMENTO DE CONSENTIMENTO DE COOKIES ---
  function initCookieConsent() {
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    
    if (savedConsent) {
      try {
        const consentData = JSON.parse(savedConsent);
        
        if (validateConsentSchema(consentData)) {
          applyConsent(consentData);
          hideBanner();
        } else {
          showBanner();
        }
      } catch (e) {
        showBanner();
      }
    } else {
      showBanner();
    }
  }

  function validateConsentSchema(prefs) {
    const requiredKeys = ['consented', 'timestamp', 'necessary', 'analytics', 'marketing', 'version'];
    const hasAllKeys = requiredKeys.every(function(key) {
      return Object.prototype.hasOwnProperty.call(prefs, key);
    });
    if (!hasAllKeys) return false;

    if (typeof prefs.consented !== 'boolean') return false;
    if (typeof prefs.necessary !== 'boolean') return false;
    if (typeof prefs.analytics !== 'boolean') return false;
    if (typeof prefs.marketing !== 'boolean') return false;
    if (isNaN(Date.parse(prefs.timestamp))) return false;

    return true;
  }

  function showBanner() {
    if (ui.banner) {
      ui.banner.classList.add('visible');
      ui.banner.style.display = 'flex';
    }
    // Ajustar posição dos botões flutuantes quando banner está visível
    adjustFloatingButtonsPosition(true);
    // Ocultar FAB quando banner está ativo
    if (ui.cookieFab) {
      ui.cookieFab.classList.add('hidden');
    }
  }

  function hideBanner() {
    if (ui.banner) {
      ui.banner.classList.remove('visible');
      setTimeout(function() {
        ui.banner.style.display = 'none';
        // Restaurar posição dos botões quando banner é ocultado
        adjustFloatingButtonsPosition(false);
      }, 300);
    }
    // Mostrar FAB quando banner está oculto
    if (ui.cookieFab) {
      ui.cookieFab.classList.remove('hidden');
    }
  }

  // --- AJUSTE DE POSICIONAMENTO DOS BOTÕES FLUTUANTES ---
  function adjustFloatingButtonsPosition(bannerVisible) {
    // Botões devem estar posicionados na área dos links do footer
    // Banner de cookies tem aproximadamente 80px de altura
    const bannerOffset = 100; // Diferença para posicionar acima do banner
    
    // Back-to-top: 30px (base), 130px (com banner ativo - acima do banner)
    const baseBackToTop = 30;
    // Cookie FAB: 80px (base), 180px (com banner ativo - abaixo do back-to-top)
    const baseCookieFab = 80;
    
    if (ui.backToTop) {
      ui.backToTop.style.bottom = bannerVisible 
        ? (baseBackToTop + bannerOffset) + 'px' 
        : baseBackToTop + 'px';
    }
    
    if (ui.cookieFab && !ui.cookieFab.classList.contains('hidden')) {
      ui.cookieFab.style.bottom = bannerVisible 
        ? (baseCookieFab + bannerOffset) + 'px' 
        : baseCookieFab + 'px';
    }
    
    if (ui.toast) {
      ui.toast.style.bottom = bannerVisible 
        ? '200px' 
        : '7rem';
    }
  }

  // --- MODAIS ANINHADOS ---
  function showModal() {
    lastFocusedElement = document.activeElement;
    if (ui.modal && !ui.modal.classList.contains('hidden')) {
      modalStack.push(ui.modal);
    }
    
    if (ui.overlay) {
      ui.overlay.classList.remove('hidden');
      ui.overlay.setAttribute('aria-hidden', 'false');
    }
    
    if (ui.modal) {
      ui.modal.classList.remove('hidden');
      ui.modal.setAttribute('aria-hidden', 'false');
      initAccordionState();
      updateFocusableElements(ui.modal);
      
      const firstFocusable = ui.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        setTimeout(function() {
          firstFocusable.focus();
        }, 100);
      }
    }

    trapFocus(ui.modal);
  }

  function hideModal() {
    if (modalStack.length > 0) {
      const topModal = modalStack.pop();
      if (topModal) {
        topModal.classList.add('hidden');
        topModal.setAttribute('aria-hidden', 'true');
        if (topModal === ui.modal) {
          hideBanner();
        }
      }
    }
    updateOverlayVisibility();
  }

  function showDetailModal(detailModalId) {
    const detailModal = ui.detailModals[detailModalId];
    if (!detailModal) return;

    if (ui.modal && !ui.modal.classList.contains('hidden')) {
      modalStack.push(ui.modal);
    }
    
    if (ui.overlay) {
      ui.overlay.classList.remove('hidden');
      ui.overlay.setAttribute('aria-hidden', 'false');
    }
    
    detailModal.classList.remove('hidden');
    detailModal.setAttribute('aria-hidden', 'false');
    
    updateFocusableElements(detailModal);
    
    const closeBtn = detailModal.querySelector('.cookie-modal-close');
    if (closeBtn) {
      setTimeout(function() {
        closeBtn.focus();
      }, 100);
    }

    trapFocus(detailModal);
  }

  function hideDetailModal(detailModalId) {
    const detailModal = ui.detailModals[detailModalId];
    if (!detailModal) return;

    detailModal.classList.add('hidden');
    detailModal.setAttribute('aria-hidden', 'true');

    if (modalStack.length > 0) {
      const mainModal = modalStack.pop();
      if (mainModal) {
        mainModal.classList.remove('hidden');
        mainModal.setAttribute('aria-hidden', 'false');
        if (lastFocusedElement) {
          setTimeout(function() {
            lastFocusedElement.focus();
          }, 100);
        }
      }
    }

    updateOverlayVisibility();
  }

  function updateOverlayVisibility() {
    if (modalStack.length === 0) {
      if (ui.overlay) {
        ui.overlay.classList.add('hidden');
        ui.overlay.setAttribute('aria-hidden', 'true');
      }
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    } else {
      if (ui.overlay) {
        ui.overlay.classList.remove('hidden');
        ui.overlay.setAttribute('aria-hidden', 'false');
      }
    }
  }

  // --- ACESSIBILIDADE: GERENCIAMENTO DE FOCO ---
  function updateFocusableElements(container) {
    if (!container) return;
    
    focusableElements = Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function(el) {
      return el.offsetParent !== null && !el.disabled;
    });
  }

  function trapFocus(element) {
    if (!element) return;
    
    element.addEventListener('keydown', function handleTab(e) {
      if (e.key !== 'Tab') return;

      // Atualizar elementos focáveis
      updateFocusableElements(element);
      
      if (focusableElements.length === 0) return;
      
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  }

  // --- ACCORDION ---
  function toggleAccordion(targetId) {
    const description = document.getElementById(targetId);
    const btn = ui.accordionBtns[targetId];
    
    if (!description) return;
    
    const isExpanded = description.classList.contains('expanded');
    
    if (isExpanded) {
      description.classList.remove('expanded');
      if (btn) {
        btn.classList.remove('expanded');
        btn.setAttribute('aria-expanded', 'false');
      }
    } else {
      closeAllAccordions();
      description.classList.add('expanded');
      if (btn) {
        btn.classList.add('expanded');
        btn.setAttribute('aria-expanded', 'true');
      }
      
      setTimeout(function() {
        const firstP = description.querySelector('p');
        if (firstP) {
          firstP.focus();
        }
      }, 300);
    }
  }

  function closeAllAccordions() {
    document.querySelectorAll('.cookie-category-description').forEach(function(desc) {
      desc.classList.remove('expanded');
    });
    document.querySelectorAll('.cookie-expand-btn').forEach(function(button) {
      button.classList.remove('expanded');
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function initAccordionState() {
    closeAllAccordions();
  }

  // --- INICIALIZAÇÃO DA POSIÇÃO DOS BOTÕES FLUTUANTES ---

  // --- SALVAR CONSENTIMENTO ---
  function saveConsent(accepted) {
    if (typeof accepted !== 'boolean' && accepted !== 'partial') return;

    const necessaryCheck = document.getElementById('check-necessary');
    const analyticsCheck = document.getElementById('check-analytics');
    const marketingCheck = document.getElementById('check-marketing');

    const isConsented = accepted === true || accepted === 'partial';
    
    const preferences = {
      consented: isConsented,
      timestamp: new Date().toISOString(),
      necessary: necessaryCheck ? necessaryCheck.checked : true,
      analytics: analyticsCheck ? analyticsCheck.checked : (accepted === true),
      marketing: marketingCheck ? marketingCheck.checked : (accepted === true),
      version: '8.0'
    };

    if (!validateConsentSchema(preferences)) return;

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
      applyConsent(preferences);
      
      window.dispatchEvent(new CustomEvent('consentUpdated', { detail: preferences }));
      
      showToast(accepted === true ? 'Cookies aceitos com sucesso!' : 'Preferências salvas!');
    } catch (e) {}

    hideBanner();
    hideModal();
  }

  function applyConsent(preferences) {
    if (typeof window.applyConsentSettings === 'function') {
      window.applyConsentSettings(preferences);
    }

    // Google Consent Mode v2
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
        'ad_storage': preferences.marketing ? 'granted' : 'denied',
        'ad_user_data': preferences.marketing ? 'granted' : 'denied',
        'ad_personalization': preferences.marketing ? 'granted' : 'denied'
      });
    }
    
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'consent_update',
        consent_analytics: preferences.analytics ? 'granted' : 'denied',
        consent_marketing: preferences.marketing ? 'granted' : 'denied',
        consent_necessary: 'granted'
      });
      window.dataLayer.push({
        event: 'privacy_consent',
        consent_analytics: preferences.analytics,
        consent_marketing: preferences.marketing,
        consent_necessary: true
      });
    }
  }

  // --- BOTÃO VOLTAR AO TOPO ---
  function initBackToTop() {
    if (!ui.backToTop) return;

    const updateVisibility = function() {
      const shouldShow = window.scrollY > 300;
      if (shouldShow) {
        ui.backToTop.classList.add('visible');
        ui.backToTop.classList.remove('hidden');
      } else {
        ui.backToTop.classList.remove('visible');
        ui.backToTop.classList.add('hidden');
      }
    };

    window.addEventListener('scroll', function() {
      clearTimeout(ui.scrollTimeout);
      ui.scrollTimeout = setTimeout(updateVisibility, 100);
    });
    
    updateVisibility();

    ui.backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- INICIALIZAÇÃO DA POSIÇÃO DOS BOTÕES FLUTUANTES ---
  function initFloatingButtonsPosition() {
    const bannerVisible = ui.banner && ui.banner.classList.contains('visible');
    adjustFloatingButtonsPosition(bannerVisible);
  }

  // --- EVENT LISTENERS ---
  function attachEventListeners() {
    // Botões do banner de cookies
    const acceptBtn = document.getElementById('cookie-accept');
    const settingsBtn = document.getElementById('cookie-settings');
    const cookieFab = document.getElementById('cookie-fab');
    const modalClose = document.getElementById('cookie-modal-close');
    const savePrefs = document.getElementById('cookie-save-preferences');
    const acceptAllBtn = document.getElementById('cookie-accept-all');

    // Banner buttons
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function() {
        // Aceitar todos os cookies
        const analyticsCheck = document.getElementById('check-analytics');
        const marketingCheck = document.getElementById('check-marketing');
        if (analyticsCheck) analyticsCheck.checked = true;
        if (marketingCheck) marketingCheck.checked = true;
        saveConsent(true);
      });
    }

    if (settingsBtn) {
      settingsBtn.addEventListener('click', function() {
        showModal();
      });
    }

    if (cookieFab) {
      cookieFab.addEventListener('click', showModal);
    }

    // Modal close button
    if (modalClose) {
      modalClose.addEventListener('click', function() {
        hideModal();
      });
    }

    // Save preferences
    if (savePrefs) {
      savePrefs.addEventListener('click', function() {
        saveConsent('partial');
      });
    }

    // Accept all in modal
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', function() {
        // Marcar todos como ativos
        const analyticsCheck = document.getElementById('check-analytics');
        const marketingCheck = document.getElementById('check-marketing');
        if (analyticsCheck) analyticsCheck.checked = true;
        if (marketingCheck) marketingCheck.checked = true;
        saveConsent(true);
      });
    }

    // Delegação de eventos para botões de accordion
    document.addEventListener('click', function(e) {
      // Botão de expandir/recolher
      if (e.target.closest('.cookie-expand-btn')) {
        const btn = e.target.closest('.cookie-expand-btn');
        e.stopPropagation();
        const targetId = btn.getAttribute('data-accordion-target');
        if (targetId) {
          toggleAccordion(targetId);
        }
        return;
      }
      
      // Clique no cabeçalho da categoria
      if (e.target.closest('.cookie-category-header')) {
        const header = e.target.closest('.cookie-category-header');
        const description = header.nextElementSibling;
        if (description && description.classList.contains('cookie-category-description')) {
          const targetId = description.id;
          if (targetId) {
            toggleAccordion(targetId);
          }
        }
      }
    });

    // Suporte a teclado para cabeçalhos (Enter e Espaço)
    document.addEventListener('keydown', function(e) {
      if (e.target.closest('.cookie-category-header') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const header = e.target.closest('.cookie-category-header');
        const description = header.nextElementSibling;
        if (description && description.classList.contains('cookie-category-description')) {
          const targetId = description.id;
          if (targetId) {
            toggleAccordion(targetId);
          }
        }
      }
    });

    // Botões de informação para abrir modais de detalhes
    const infoBtns = document.querySelectorAll('.cookie-info-btn');
    infoBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const targetModalId = this.getAttribute('data-modal-target');
        if (targetModalId) {
          lastFocusedElement = this;
          showDetailModal(targetModalId);
        }
      });
    });

    // Botões de fechar modais de detalhes
    const detailCloseBtns = document.querySelectorAll('.cookie-detail-modal .cookie-modal-close');
    detailCloseBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const modal = this.closest('.cookie-detail-modal');
        if (modal && modal.id) {
          hideDetailModal(modal.id);
        }
      });
    });

    // Botões "Voltar" nos modais de detalhes
    const backBtns = document.querySelectorAll('.cookie-detail-back');
    backBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const modalId = this.getAttribute('data-close');
        if (modalId) {
          hideDetailModal(modalId);
        }
      });
    });

    // Fechar modal ao clicar no overlay (fecha apenas o modal superior)
    if (ui.overlay) {
      ui.overlay.addEventListener('click', function(e) {
        // Verificar se o clique foi diretamente no overlay (não em um modal)
        if (e.target === ui.overlay) {
          if (modalStack.length > 0) {
            const topModal = modalStack[modalStack.length - 1];
            if (topModal) {
              // Fechar modal principal completamente
              if (topModal === ui.modal) {
                hideModal();
                // Também fechar o banner
                hideBanner();
              } else {
                // É um modal de detalhe
                topModal.classList.add('hidden');
                topModal.setAttribute('aria-hidden', 'true');
                modalStack.pop();
              }
            }
          }
          updateOverlayVisibility();
        }
      });
    }

    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (modalStack.length > 0) {
          const topModal = modalStack[modalStack.length - 1];
          if (topModal) {
            topModal.classList.add('hidden');
            topModal.setAttribute('aria-hidden', 'true');
            modalStack.pop();
          }
          updateOverlayVisibility();
          
          // Se não há mais modais, fechar o banner
          if (modalStack.length === 0) {
            hideBanner();
          }
        }
      }
    });

    // Impedir que cliques dentro do modal fechem o overlay
    document.querySelectorAll('.cookie-modal, .cookie-detail-modal').forEach(function(modal) {
      modal.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    });

    // Botões de fechar modais genéricos com data-close
    document.querySelectorAll('[data-close]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const modalId = this.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('hidden');
          modal.setAttribute('aria-hidden', 'true');
          
          // Remover da pilha de modais se existir
          const index = modalStack.indexOf(modal);
          if (index > -1) {
            modalStack.splice(index, 1);
          }
          
          updateOverlayVisibility();
          
          // Se não há mais modais, fechar o banner
          if (modalStack.length === 0) {
            hideBanner();
          }
        }
      });
    });

    // Checkboxes - atualizar estado visual
    const switches = document.querySelectorAll('.cookie-switch input[type="checkbox"]');
    switches.forEach(function(input) {
      input.addEventListener('change', function() {
        // Atualizar visual do slider
        const slider = this.nextElementSibling;
        if (slider) {
          slider.style.backgroundColor = this.checked ? '#2563eb' : '#e5e7eb';
        }
      });
    });
  }

  // --- INICIALIZAÇÃO ---
  function waitForDOM() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initFooter, 50);
      });
    } else {
      setTimeout(initFooter, 50);
    }
  }

  // Inicializar quando o DOM estiver pronto
  waitForDOM();

  // Também ouvir o evento do Template Engine
  window.addEventListener('TemplateEngine:Ready', function() {
    setTimeout(initFooter, 100);
  });

})();
