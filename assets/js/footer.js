/**
 * FOOTER.JS
 * Funcionalidades do Rodapé e Cookies
 * Calculadoras de Enfermagem
 */

(function () {
  "use strict";
  
  // Configurações e Referências DOM
  const elements = {
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
  
  const STORAGE_KEY = "ce_cookie_consent_v8_2025";
  let previousFocus = null;
  let modalStack = [];
  let focusableElements = [];
  
  // Inicialização
  function initialize() {
    elements.banner = document.getElementById("cookie-banner");
    elements.overlay = document.getElementById("cookie-overlay");
    elements.modal = document.getElementById("cookie-modal-content");
    elements.backToTop = document.getElementById("backToTop");
    elements.cookieFab = document.getElementById("cookie-fab");
    elements.yearSpan = document.getElementById("current-year");
    elements.toast = document.getElementById("toast-notification");
    elements.toastMessage = document.getElementById("toast-message");
    
    // Reseta estados iniciais (acessibilidade)
    if (elements.modal && !elements.modal.classList.contains("hidden")) {
      elements.modal.classList.add("hidden");
      elements.modal.setAttribute("aria-hidden", "true");
    }
    
    if (elements.overlay && !elements.overlay.classList.contains("hidden")) {
      elements.overlay.classList.add("hidden");
      elements.overlay.setAttribute("aria-hidden", "true");
    }
    
    if (elements.cookieFab) {
      elements.cookieFab.classList.add("hidden");
    }
    
    // Mapeia Sub-modais de detalhes
    document.querySelectorAll(".cookie-detail-modal").forEach(function(modal) {
      if (modal.id) {
        elements.detailModals[modal.id] = modal;
        if (!modal.classList.contains("hidden")) {
          modal.classList.add("hidden");
          modal.setAttribute("aria-hidden", "true");
        }
      }
    });
    
    // Mapeia botões de acordeão
    document.querySelectorAll(".cookie-expand-btn").forEach(function(btn) {
      const target = btn.getAttribute("data-accordion-target");
      if (target) {
        elements.accordionBtns[target] = btn;
      }
    });
    
    if (elements.yearSpan) {
      elements.yearSpan.textContent = new Date().getFullYear();
    }
    
    checkExistingConsent();
    setupBackToTop();
    adjustUIBasedOnBanner();
    setupEventListeners();
  }
  
  // Exibe Toast (Notificação)
  function showToast(message) {
    if (!elements.toast || !elements.toastMessage) return;
    
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove("hidden");
    elements.toast.offsetWidth;
    elements.toast.classList.add("visible");
    
    setTimeout(function() {
      elements.toast.classList.remove("visible");
      setTimeout(function() {
        elements.toast.classList.add("hidden");
      }, 300);
    }, 3000);
  }
  
  // Verifica LocalStorage
  function checkExistingConsent() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const consent = JSON.parse(stored);
        if (isValidConsent(consent)) {
          applyConsent(consent);
          hideBanner();
        } else {
          showBanner();
        }
      } catch {
        showBanner();
      }
    } else {
      showBanner();
    }
  }
  
  // Valida Objeto de Consentimento
  function isValidConsent(consent) {
    const requiredKeys = ["consented", "timestamp", "necessary", "analytics", "marketing", "version"];
    const hasKeys = requiredKeys.every(key => Object.prototype.hasOwnProperty.call(consent, key));
    
    if (!hasKeys) return false;
    
    if (typeof consent.consented !== "boolean" ||
        typeof consent.necessary !== "boolean" ||
        typeof consent.analytics !== "boolean" ||
        typeof consent.marketing !== "boolean") {
      return false;
    }
    
    if (isNaN(Date.parse(consent.timestamp))) return false;
    
    return true;
  }
  
  // Mostra Banner
  function showBanner() {
    if (elements.banner) {
      elements.banner.classList.add("visible");
      elements.banner.style.display = "flex";
    }
    adjustLayoutForBanner(true);
    if (elements.cookieFab) elements.cookieFab.classList.add("hidden");
  }
  
  // Esconde Banner / Estado "Aceito"
  function hideBanner() {
    if (elements.banner) {
      elements.banner.classList.remove("visible");
      setTimeout(function() {
        elements.banner.style.display = "none";
        adjustLayoutForBanner(false);
      }, 300);
    }
    if (elements.cookieFab) elements.cookieFab.classList.remove("hidden");
  }
  
  // Ajusta posições (BackToTop, FAB)
  function adjustLayoutForBanner(bannerVisible) {
    if (elements.backToTop) {
      elements.backToTop.style.bottom = bannerVisible ? "130px" : "30px";
    }
    if (elements.cookieFab && !elements.cookieFab.classList.contains("hidden")) {
      elements.cookieFab.style.bottom = bannerVisible ? "180px" : "80px";
    }
    if (elements.toast) {
      elements.toast.style.bottom = bannerVisible ? "200px" : "7rem";
    }
  }
  
  // Abre Modal de Preferências
  function openPreferencesModal() {
    previousFocus = document.activeElement;
    
    if (elements.modal) {
      if (modalStack.indexOf(elements.modal) === -1) {
        modalStack.push(elements.modal);
      }
      elements.modal.classList.remove("hidden");
      elements.modal.setAttribute("aria-hidden", "false");
    }
    
    if (elements.overlay) {
      elements.overlay.classList.remove("hidden");
      elements.overlay.setAttribute("aria-hidden", "false");
    }
    
    if (elements.modal) {
      collapseAllAccordions();
      findFocusableElements(elements.modal);
      
      const firstFocusable = elements.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) setTimeout(() => firstFocusable.focus(), 100);
    }
    
    trapFocus(elements.modal);
  }
  
  // Fecha o Modal do Topo da Pilha
  function closeTopModal() {
    if (modalStack.length > 0) {
      const modal = modalStack.pop();
      if (modal) {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        if (modal === elements.modal) hideBanner();
      }
    }
    updateOverlayVisibility();
  }
  
  // Abre Modal de Detalhes (Submodal)
  function openDetailModal(modalId) {
    const modal = elements.detailModals[modalId];
    if (!modal) return;
    
    if (elements.modal && !elements.modal.classList.contains("hidden") && modalStack.indexOf(elements.modal) === -1) {
      modalStack.push(elements.modal);
    }
    
    if (elements.overlay) {
      elements.overlay.classList.remove("hidden");
      elements.overlay.setAttribute("aria-hidden", "false");
    }
    
    modalStack.push(modal);
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    
    findFocusableElements(modal);
    
    const closeBtn = modal.querySelector(".cookie-modal-close");
    if (closeBtn) setTimeout(() => closeBtn.focus(), 100);
    
    trapFocus(modal);
  }
  
  // Fecha Modal de Detalhes Específico (Voltar)
  function closeDetailModal(modalId) {
    const modal = elements.detailModals[modalId];
    if (modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      
      const index = modalStack.indexOf(modal);
      if (index > -1) {
        modalStack.splice(index, 1);
      }
      
      if (modalStack.length > 0) {
        const previousModal = modalStack[modalStack.length - 1];
        if (previousModal) {
          previousModal.classList.remove("hidden");
          previousModal.setAttribute("aria-hidden", "false");
          if (previousFocus) setTimeout(() => previousFocus.focus(), 100);
        }
      }
      
      updateOverlayVisibility();
    }
  }
  
  // Gerencia Visibilidade do Overlay
  function updateOverlayVisibility() {
    if (modalStack.length === 0) {
      if (elements.overlay) {
        elements.overlay.classList.add("hidden");
        elements.overlay.setAttribute("aria-hidden", "true");
      }
      if (previousFocus) previousFocus.focus();
    } else {
      if (elements.overlay) {
        elements.overlay.classList.remove("hidden");
        elements.overlay.setAttribute("aria-hidden", "false");
      }
    }
  }
  
  // Identifica Elementos Focáveis
  function findFocusableElements(modal) {
    if (modal) {
      focusableElements = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(function(element) {
        return element.offsetParent !== null && !element.disabled;
      });
    }
  }
  
  // Focus Trap (Prende navegação via Tab dentro do modal)
  function trapFocus(modal) {
    if (modal) {
      modal.addEventListener("keydown", function(event) {
        if (event.key !== "Tab") return;
        
        findFocusableElements(modal);
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      });
    }
  }
  
  // Toggle Acordeão (Expandir/Retrair)
  function toggleAccordion(targetId) {
    const content = document.getElementById(targetId);
    const btn = elements.accordionBtns[targetId];
    
    if (!content) return;
    
    if (content.classList.contains("expanded")) {
      content.classList.remove("expanded");
      if (btn) {
        btn.classList.remove("expanded");
        btn.setAttribute("aria-expanded", "false");
      }
    } else {
      closeAllAccordions();
      content.classList.add("expanded");
      if (btn) {
        btn.classList.add("expanded");
        btn.setAttribute("aria-expanded", "true");
      }
      
      setTimeout(function() {
        const paragraph = content.querySelector("p");
        if (paragraph) paragraph.focus();
      }, 300);
    }
  }
  
  // Fecha todos os acordeões
  function closeAllAccordions() {
    document.querySelectorAll(".cookie-category-description").forEach(function(content) {
      content.classList.remove("expanded");
    });
    document.querySelectorAll(".cookie-expand-btn").forEach(function(btn) {
      btn.classList.remove("expanded");
      btn.setAttribute("aria-expanded", "false");
    });
  }
  
  function collapseAllAccordions() {
    closeAllAccordions();
  }
  
  // Salva Preferências
  function savePreferences(consentType) {
    if (typeof consentType !== "boolean" && consentType !== "partial") return;
    
    const necessaryCheck = document.getElementById("check-necessary");
    const analyticsCheck = document.getElementById("check-analytics");
    const marketingCheck = document.getElementById("check-marketing");
    
    const consent = {
      consented: consentType === true || consentType === "partial",
      timestamp: new Date().toISOString(),
      necessary: necessaryCheck ? necessaryCheck.checked : true,
      analytics: analyticsCheck ? analyticsCheck.checked : (consentType === true),
      marketing: marketingCheck ? marketingCheck.checked : (consentType === true),
      version: "8.0"
    };
    
    if (isValidConsent(consent)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        applyConsent(consent);
        window.dispatchEvent(new CustomEvent("consentUpdated", {
          detail: consent
        }));
        showToast(consentType === true ? "Cookies aceitos com sucesso!" : "Preferências salvas!");
      } catch (err) {
        console.error(err);
      }
      
      hideBanner();
      
      while(modalStack.length > 0) { modalStack.pop(); }
      updateOverlayVisibility();
      
      if(elements.modal) {
        elements.modal.classList.add("hidden");
        elements.modal.setAttribute("aria-hidden","true");
      }
    }
  }
  
  // Integração (GTAG / DataLayer)
  function applyConsent(consent) {
    if (typeof window.applyConsentSettings == "function") {
      window.applyConsentSettings(consent);
    }
    
    if (typeof gtag !== "undefined") {
      gtag("consent", "update", {
        analytics_storage: consent.analytics ? "granted" : "denied",
        ad_storage: consent.marketing ? "granted" : "denied",
        ad_user_data: consent.marketing ? "granted" : "denied",
        ad_personalization: consent.marketing ? "granted" : "denied"
      });
    }
    
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "consent_update",
        consent_analytics: consent.analytics ? "granted" : "denied",
        consent_marketing: consent.marketing ? "granted" : "denied",
        consent_necessary: "granted"
      });
      window.dataLayer.push({
        event: "privacy_consent",
        consent_analytics: consent.analytics,
        consent_marketing: consent.marketing,
        consent_necessary: true
      });
    }
  }
  
  // Scroll Handler
  function setupBackToTop() {
    if (!elements.backToTop) return;
    
    const handleScroll = function() {
      window.scrollY > 300 ?
        (elements.backToTop.classList.add("visible"), elements.backToTop.classList.remove("hidden")) :
        (elements.backToTop.classList.remove("visible"), elements.backToTop.classList.add("hidden"));
    };
    
    window.addEventListener("scroll", function() {
      clearTimeout(elements.scrollTimeout);
      elements.scrollTimeout = setTimeout(handleScroll, 100);
    });
    
    handleScroll();
    
    elements.backToTop.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
  
  function adjustUIBasedOnBanner() {
    const bannerVisible = elements.banner && elements.banner.classList.contains("visible");
    adjustLayoutForBanner(bannerVisible);
  }
  
  // Event Listeners
  function setupEventListeners() {
    const acceptBtn = document.getElementById("cookie-accept");
    const settingsBtn = document.getElementById("cookie-settings");
    const fabBtn = document.getElementById("cookie-fab");
    const modalCloseBtn = document.getElementById("cookie-modal-close");
    const saveBtn = document.getElementById("cookie-save-preferences");
    const acceptAllBtn = document.getElementById("cookie-accept-all");
    
    if (acceptBtn) {
      acceptBtn.addEventListener("click", function() {
        const analyticsCheck = document.getElementById("check-analytics");
        const marketingCheck = document.getElementById("check-marketing");
        if (analyticsCheck) analyticsCheck.checked = true;
        if (marketingCheck) marketingCheck.checked = true;
        savePreferences(true);
      });
    }
    
    if (settingsBtn) {
      settingsBtn.addEventListener("click", function() {
        openPreferencesModal();
      });
    }
    
    if (fabBtn) {
      fabBtn.addEventListener("click", openPreferencesModal);
    }
    
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", function() {
        closeTopModal();
      });
    }
    
    if (saveBtn) {
      saveBtn.addEventListener("click", function() {
        savePreferences("partial");
      });
    }
    
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener("click", function() {
        const analyticsCheck = document.getElementById("check-analytics");
        const marketingCheck = document.getElementById("check-marketing");
        if (analyticsCheck) analyticsCheck.checked = true;
        if (marketingCheck) marketingCheck.checked = true;
        savePreferences(true);
      });
    }
    
    // DELEGAÇÃO DE EVENTOS PARA ACORDEÃO
    document.addEventListener("click", function(event) {
      const btn = event.target.closest(".cookie-expand-btn");
      if (btn) {
        event.stopPropagation();
        const target = btn.getAttribute("data-accordion-target");
        if (target) toggleAccordion(target);
        return;
      }
      
      const header = event.target.closest(".cookie-category-header");
      if (header) {
        const desc = header.nextElementSibling;
        if (desc && desc.classList.contains("cookie-category-description")) {
          const targetId = desc.id;
          if (targetId) toggleAccordion(targetId);
        }
      }
    });
    
    // Acessibilidade (Enter/Space nos headers)
    document.addEventListener("keydown", function(event) {
      if (event.target.closest(".cookie-category-header") && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const desc = event.target.closest(".cookie-category-header").nextElementSibling;
        if (desc && desc.classList.contains("cookie-category-description")) {
          const targetId = desc.id;
          if (targetId) toggleAccordion(targetId);
        }
      }
    });
    
    // Botões de Informação (Submodais)
    document.querySelectorAll(".cookie-info-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        const modalTarget = this.getAttribute("data-modal-target");
        if (modalTarget) {
          previousFocus = this;
          openDetailModal(modalTarget);
        }
      });
    });
    
    // Fechar Submodais (botão X interno)
    document.querySelectorAll(".cookie-detail-modal .cookie-modal-close").forEach(function(btn) {
      btn.addEventListener("click", function() {
        const modal = this.closest(".cookie-detail-modal");
        if (modal && modal.id) closeDetailModal(modal.id);
      });
    });
    
    // Botão Voltar nos Submodais
    document.querySelectorAll(".cookie-detail-back").forEach(function(btn) {
      btn.addEventListener("click", function() {
        const closeTarget = this.getAttribute("data-close");
        if (closeTarget) closeDetailModal(closeTarget);
      });
    });
    
    // Click no Overlay (Fechar Modal)
    if (elements.overlay) {
      elements.overlay.addEventListener("click", function(event) {
        if (event.target === elements.overlay) {
          if (modalStack.length > 0) {
            const topModal = modalStack[modalStack.length - 1];
            if (topModal) {
              if (topModal === elements.modal) {
                closeTopModal();
              } else {
                topModal.classList.add("hidden");
                topModal.setAttribute("aria-hidden", "true");
                modalStack.pop();
              }
            }
          }
          updateOverlayVisibility();
        }
      });
    }
    
    // Tecla ESC
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && modalStack.length > 0) {
        const topModal = modalStack[modalStack.length - 1];
        if (topModal) {
          topModal.classList.add("hidden");
          topModal.setAttribute("aria-hidden", "true");
          modalStack.pop();
        }
        updateOverlayVisibility();
        
        if (modalStack.length === 0) hideBanner();
      }
    });
    
    // Checkbox switches
    document.querySelectorAll('.cookie-switch input[type="checkbox"]').forEach(function(checkbox) {
      checkbox.addEventListener("change", function() {
        const slider = this.nextElementSibling;
        if (slider) {
          slider.style.backgroundColor = this.checked ? "#2563eb" : "#e5e7eb";
        }
      });
    });
  }
  
  // Inicialização segura
  function initializeSafe() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function() {
        setTimeout(initialize, 50);
      });
    } else {
      setTimeout(initialize, 50);
    }
  }
  
  initializeSafe();
  
  window.addEventListener("TemplateEngine:Ready", function() {
    setTimeout(initialize, 100);
  });
})();
