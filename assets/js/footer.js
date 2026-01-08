/**
 * Footer Behavior Script
 * 
 * Este script assume que o HTML do rodapé já foi injetado pelo index.html.
 * A sua função é exclusivamente aplicar interatividades e gerir o estado
 * dos elementos do rodapé, tratando falhas de segurança de forma graciosa.
 */

(function() {
    "use strict";

    // ==========================================
    // CONFIGURAÇÕES E CONSTANTES
    // ==========================================
    const CONFIG = {
        cookieName: "ce_cookie_consent_v8_2025",
        expirationDays: 365,
        selectors: {
            banner: "cookie-banner",
            overlay: "cookie-overlay",
            modal: "cookie-modal-content",
            backToTop: "backToTop",
            cookieFab: "cookie-fab",
            yearSpan: "current-year",
            toast: "toast-notification",
            toastMessage: "toast-message"
        }
    };

    // Estado da aplicação
    const state = {
        elements: {},
        modalStack: [],
        lastFocusedElement: null,
        isBannerVisible: false,
        initialized: false
    };

    // ==========================================
    // FUNÇÕES UTILITÁRIAS
    // ==========================================

    /**
     * Recupera o valor de um cookie pelo nome
     */
    function getCookie(name) {
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        } catch (e) {
            console.warn("[Footer] Acesso a cookies bloqueado:", e);
            return null;
        }
    }

    /**
     * Define um cookie com data de expiração
     */
    function setCookie(name, value, days) {
        try {
            const d = new Date();
            d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${d.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
        } catch (e) {
            console.warn("[Footer] Não foi possível definir cookie:", e);
        }
    }

    /**
     * Exibe uma notificação toast temporária
     */
    function showToast(message) {
        const toast = document.getElementById(CONFIG.selectors.toast);
        const toastMessage = document.getElementById(CONFIG.selectors.toastMessage);
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.add("visible");

        setTimeout(() => {
            toast.classList.remove("visible");
        }, 3000);
    }

    // ==========================================
    // GERENCIAMENTO DE UI
    // ==========================================

    /**
     * Controla a visibilidade do banner de cookies
     */
    function toggleBanner(show) {
        const banner = document.getElementById(CONFIG.selectors.banner);
        if (!banner) return;

        state.isBannerVisible = show;

        if (show) {
            banner.classList.add("visible");
            banner.classList.remove("hidden");
            banner.setAttribute("aria-hidden", "false");
            document.body.classList.add("cookie-banner-open");
        } else {
            banner.classList.remove("visible");
            banner.classList.add("hidden");
            banner.setAttribute("aria-hidden", "true");
            document.body.classList.remove("cookie-banner-open");
        }
    }

    /**
     * Abre o modal de preferências de cookies
     */
    function openModal() {
        const modal = document.getElementById(CONFIG.selectors.modal);
        const overlay = document.getElementById(CONFIG.selectors.overlay);

        if (!modal || !overlay) return;

        state.lastFocusedElement = document.activeElement;
        state.modalStack.push(modal);

        overlay.classList.remove("hidden");
        overlay.classList.add("visible");
        modal.classList.remove("hidden");
        modal.classList.add("visible");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        const banner = document.getElementById(CONFIG.selectors.banner);
        if (banner && banner.classList.contains("visible")) {
            banner.classList.remove("visible");
            banner.classList.add("hidden");
        }
    }

    /**
     * Abre um submodal de detalhes
     */
    function openDetailModal(modalId) {
        const detailModal = document.getElementById(modalId);
        const overlay = document.getElementById(CONFIG.selectors.overlay);

        if (!detailModal || !overlay) return;

        state.lastFocusedElement = document.activeElement;
        state.modalStack.push(detailModal);

        overlay.classList.remove("hidden");
        overlay.classList.add("visible");
        detailModal.classList.remove("hidden");
        detailModal.classList.add("visible");
        detailModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    /**
     * Fecha um submodal específico
     */
    function closeDetailModal(modalId) {
        const detailModal = document.getElementById(modalId);
        if (!detailModal) return;

        const index = state.modalStack.indexOf(detailModal);
        if (index > -1) {
            state.modalStack.splice(index, 1);
        }

        detailModal.classList.remove("visible");
        detailModal.classList.add("hidden");
        detailModal.setAttribute("aria-hidden", "true");

        if (state.modalStack.length === 0) {
            const overlay = document.getElementById(CONFIG.selectors.overlay);
            overlay.classList.remove("visible");
            overlay.classList.add("hidden");
            document.body.style.overflow = "";

            const mainModal = document.getElementById(CONFIG.selectors.modal);
            if (mainModal) {
                mainModal.classList.add("visible");
                mainModal.setAttribute("aria-hidden", "false");
                state.modalStack.push(mainModal);
            }

            if (state.lastFocusedElement) {
                state.lastFocusedElement.focus();
            }
        }
    }

    /**
     * Fecha o modal do topo da pilha
     */
    function closeModal() {
        const overlay = document.getElementById(CONFIG.selectors.overlay);
        const banner = document.getElementById(CONFIG.selectors.banner);

        const currentModal = state.modalStack.pop();
        if (currentModal) {
            currentModal.classList.remove("visible");
            currentModal.classList.add("hidden");
            currentModal.setAttribute("aria-hidden", "true");
        }

        if (state.modalStack.length === 0) {
            overlay.classList.remove("visible");
            overlay.classList.add("hidden");
            document.body.style.overflow = "";

            const hasConsent = getCookie(CONFIG.cookieName);
            if (!hasConsent && state.isBannerVisible && banner) {
                banner.classList.add("visible");
                banner.classList.remove("hidden");
            }

            if (state.lastFocusedElement) {
                state.lastFocusedElement.focus();
            }
        }
    }

    // ==========================================
    // LÓGICA DE CONSENTIMENTO
    // ==========================================

    /**
     * Salva as preferências de consentimento do usuário
     */
    function saveConsent(type) {
        let preferences = {};

        if (type === 'all') {
            preferences = { necessary: true, analytics: true, marketing: true };
        } else if (type === 'reject') {
            preferences = { necessary: true, analytics: false, marketing: false };
        } else {
            preferences = {
                necessary: true,
                analytics: document.getElementById('check-analytics')?.checked || false,
                marketing: document.getElementById('check-marketing')?.checked || false
            };
        }

        // Salva em cookie com tratamento de erros
        setCookie(CONFIG.cookieName, JSON.stringify(preferences), CONFIG.expirationDays);

        // Salva em localStorage com tratamento de erros
        try {
            localStorage.setItem(CONFIG.cookieName, JSON.stringify(preferences));
        } catch (e) {
            console.warn("[Footer] Acesso ao localStorage bloqueado:", e);
        }

        showToast("Preferências salvas com sucesso!");

        state.isBannerVisible = false;

        while (state.modalStack.length > 0) {
            const m = state.modalStack.pop();
            if (m) {
                m.classList.remove("visible");
                m.classList.add("hidden");
                m.setAttribute("aria-hidden", "true");
            }
        }

        const overlay = document.getElementById(CONFIG.selectors.overlay);
        overlay.classList.remove("visible");
        overlay.classList.add("hidden");
        document.body.style.overflow = "";

        toggleBanner(false);

        window.dispatchEvent(new CustomEvent("CookieConsentUpdated", { detail: preferences }));
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    /**
     * Configura todos os event listeners usando event delegation
     */
    function setupEventListeners() {
        // Event delegation no document para cliques
        document.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;

            const btnId = target.id;

            // Botão ACEITAR
            if (btnId === 'cookie-accept') {
                saveConsent('all');
                e.preventDefault();
                return;
            }

            // Botão PERSONALIZAR
            if (btnId === 'cookie-settings') {
                openModal();
                e.preventDefault();
                return;
            }

            // Botão SALVAR PREFERÊNCIAS
            if (btnId === 'cookie-save-preferences') {
                saveConsent('custom');
                e.preventDefault();
                return;
            }

            // Botão FECHAR MODAL
            if (btnId === 'cookie-modal-close') {
                closeModal();
                e.preventDefault();
                return;
            }

            // Botão CONCORDAR COM TUDO
            if (btnId === 'cookie-accept-all') {
                saveConsent('all');
                e.preventDefault();
                return;
            }

            // Botão FAB de cookies
            if (btnId === 'cookie-fab') {
                openModal();
                e.preventDefault();
                return;
            }

            // Botão Voltar ao Topo
            if (btnId === 'backToTop') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                e.preventDefault();
                return;
            }

            // Botões de info (abrem submodais)
            const infoBtn = e.target.closest('.cookie-info-btn');
            if (infoBtn) {
                const modalTarget = infoBtn.getAttribute('data-modal-target');
                if (modalTarget) {
                    state.lastFocusedElement = infoBtn;
                    openDetailModal(modalTarget);
                    e.preventDefault();
                }
                return;
            }

            // Botões de fechar nos submodais
            const closeBtn = e.target.closest('.cookie-detail-modal .cookie-modal-close');
            if (closeBtn) {
                const modal = closeBtn.closest('.cookie-detail-modal');
                if (modal && modal.id) {
                    closeDetailModal(modal.id);
                    e.preventDefault();
                }
                return;
            }

            // Botões Voltar nos submodais
            const backBtn = e.target.closest('.cookie-detail-back');
            if (backBtn) {
                const modalTarget = backBtn.getAttribute('data-close');
                if (modalTarget) {
                    closeDetailModal(modalTarget);
                    e.preventDefault();
                }
                return;
            }
        });

        // Clique no Overlay fecha o modal
        const overlay = document.getElementById(CONFIG.selectors.overlay);
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    closeModal();
                }
            });
        }

        // Accordion de categorias no modal
        document.querySelectorAll('.cookie-category-header').forEach(function(header) {
            header.addEventListener('click', function() {
                const group = this.parentElement;
                group.classList.toggle('active');
                const expanded = group.classList.contains('active');
                this.setAttribute('aria-expanded', expanded);
            });

            header.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Efeito visual nos switches de checkbox
        document.querySelectorAll('.cookie-switch input[type="checkbox"]').forEach(function(chk) {
            chk.addEventListener('change', function() {
                const slider = this.nextElementSibling;
                if (slider) {
                    slider.style.backgroundColor = this.checked ? "#2563eb" : "#e5e7eb";
                }
            });
        });

        // Scroll listener para mostrar/ocultar back to top
        window.addEventListener('scroll', function() {
            const backToTop = document.getElementById(CONFIG.selectors.backToTop);
            if (!backToTop) return;

            if (backToTop.classList.contains('visible')) {
                if (window.scrollY > 300) {
                    backToTop.classList.add('active');
                } else {
                    backToTop.classList.remove('active');
                }
            }
        });

        // Tecla ESC fecha o modal mais recente
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && state.modalStack.length > 0) {
                const topModal = state.modalStack[state.modalStack.length - 1];

                if (topModal.classList.contains('cookie-detail-modal')) {
                    const modalId = topModal.id;
                    if (modalId) {
                        closeDetailModal(modalId);
                        return;
                    }
                }

                closeModal();
            }
        });
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    /**
     * Atualiza o ano no copyright do footer
     */
    function updateYear() {
        const yearSpan = document.getElementById(CONFIG.selectors.yearSpan);
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    /**
     * Inicializa o footer
     */
    function initFooter() {
        if (state.initialized) return;

        // Verificação de segurança: sai silenciosamente se os elementos ainda não existirem
        const footerContent = document.querySelector('.footer-content') || 
                             document.getElementById(CONFIG.selectors.modal);
        if (!footerContent) return;

        state.initialized = true;
        updateYear();
        setupEventListeners();

        // Verifica se o usuário já tem consentimento salvo
        const consent = getCookie(CONFIG.cookieName);

        if (!consent) {
            // Usuário ainda não consentiu: mostra banner
            setTimeout(function() {
                toggleBanner(true);
            }, 300);
        } else {
            // Usuário já consentiu: mostra botão FAB para reconfigurar
            const cookieFab = document.getElementById(CONFIG.selectors.cookieFab);
            if (cookieFab) {
                cookieFab.style.display = '';
            }
        }
    }

    // ==========================================
    // EXECUÇÃO
    // ==========================================

    /**
     * Inicialização imediata
     * O HTML já existe no DOM quando este script é executado
     */
    function startInitialization() {
        // Pequeno atraso para garantir que todos os elementos estão disponíveis
        setTimeout(function() {
            initFooter();
        }, 50);
    }

    // Executa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startInitialization);
    } else {
        startInitialization();
    }

})();