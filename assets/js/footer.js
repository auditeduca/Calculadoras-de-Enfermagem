(function () {
    "use strict";

    // ==========================================
    // CONFIGURAÇÕES E ESTADO
    // ==========================================
    const CONFIG = {
        // Nome do cookie de consentimento (versão 8, ano 2025)
        cookieName: "ce_cookie_consent_v8_2025",
        // Tempo de expiração do cookie em dias
        expirationDays: 365,
        // Seletores dos elementos principais do DOM
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

    // Estado global da aplicação
    const state = {
        elements: {},
        modalStack: [],      // Pilha de modais abertos (para gerenciar navegação)
        lastFocusedElement: null,
        isBannerVisible: false
    };

    // ==========================================
    // FUNÇÕES UTILITÁRIAS
    // ==========================================
    
    /**
     * Recupera o valor de um cookie pelo nome
     * @param {string} name - Nome do cookie
     * @returns {string|null} Valor do cookie ou null se não encontrado
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    /**
     * Define um cookie com data de expiração
     * @param {string} name - Nome do cookie
     * @param {string} value - Valor a ser armazenado
     * @param {number} days - Dias até a expiração
     */
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${d.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }

    /**
     * Exibe uma notificação toast temporária
     * @param {string} message - Mensagem a ser exibida
     */
    function showToast(message) {
        const { toast, toastMessage } = state.elements;
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.add("visible");

        // Remove a classe 'visible' após 3 segundos
        setTimeout(() => {
            toast.classList.remove("visible");
        }, 3000);
    }

    // ==========================================
    // GERENCIAMENTO DE UI (BANNER & MODAIS)
    // ==========================================

    /**
     * Controla a visibilidade do banner de cookies
     * @param {boolean} show - True para mostrar, false para esconder
     */
    function toggleBanner(show) {
        const { banner } = state.elements;
        if (!banner) return;

        state.isBannerVisible = show;

        if (show) {
            banner.classList.add("visible");
            banner.setAttribute("aria-hidden", "false");
            // Adiciona classe ao body para o CSS ajustar o posicionamento do botão "Voltar ao topo"
            document.body.classList.add("cookie-banner-open");
        } else {
            banner.classList.remove("visible");
            banner.setAttribute("aria-hidden", "true");
            document.body.classList.remove("cookie-banner-open");
        }
    }

    /**
     * Abre um modal e gerencia a pilha de modais
     * @param {string} [modalId] - ID do modal a abrir (opcional, usa padrão se não informado)
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId) || state.elements.modal;
        const { overlay } = state.elements;

        if (modal && overlay) {
            // Salva o elemento que tinha foco antes de abrir o modal
            state.lastFocusedElement = document.activeElement;
            
            // Adiciona o modal à pilha de navegação
            state.modalStack.push(modal);

            // Exibe o overlay e o modal
            overlay.classList.remove("hidden");
            overlay.classList.add("visible");
            modal.classList.remove("hidden");
            modal.classList.add("visible");
            modal.setAttribute("aria-hidden", "false");
            
            // Trava o scroll da página enquanto o modal está aberto
            document.body.style.overflow = "hidden";

            // Se o banner de consentimento estava visível, esconde temporariamente
            // Mas NÃO altera o estado global de consentimento do usuário
            if (state.isBannerVisible) {
                state.elements.banner.classList.remove("visible");
            }
        }
    }

    /**
     * Abre um submodal de detalhes (Google Tag Manager, Analytics, AdSense)
     * @param {string} modalId - ID do submodal a abrir
     */
    function openDetailModal(modalId) {
        const detailModal = document.getElementById(modalId);
        const { overlay } = state.elements;

        if (!detailModal || !overlay) return;

        // Salva foco atual
        state.lastFocusedElement = document.activeElement;

        // Adiciona à pilha de modais
        state.modalStack.push(detailModal);

        // Mostra overlay e submodal
        overlay.classList.remove("hidden");
        overlay.classList.add("visible");
        detailModal.classList.remove("hidden");
        detailModal.classList.add("visible");
        detailModal.setAttribute("aria-hidden", "false");

        // Trava scroll
        document.body.style.overflow = "hidden";
    }

    /**
     * Fecha um submodal específico (usado pelo botão Voltar)
     * @param {string} modalId - ID do submodal a fechar
     */
    function closeDetailModal(modalId) {
        const detailModal = document.getElementById(modalId);
        if (!detailModal) return;

        // Remove da pilha
        const index = state.modalStack.indexOf(detailModal);
        if (index > -1) {
            state.modalStack.splice(index, 1);
        }

        // Esconde o submodal
        detailModal.classList.remove("visible");
        detailModal.classList.add("hidden");
        detailModal.setAttribute("aria-hidden", "true");

        // Se não há mais modais na pilha, restaura estado
        if (state.modalStack.length === 0) {
            const { overlay } = state.elements;
            overlay.classList.remove("visible");
            overlay.classList.add("hidden");
            document.body.style.overflow = "";

            // Mantém o modal principal visível
            const mainModal = state.elements.modal;
            if (mainModal) {
                mainModal.classList.add("visible");
                mainModal.setAttribute("aria-hidden", "false");
                state.modalStack.push(mainModal);
            }

            // Restaura foco
            if (state.lastFocusedElement) {
                state.lastFocusedElement.focus();
            }
        }
    }

    /**
     * Fecha o modal do topo da pilha e gerencia a reexibição do banner
     * Lógica corrigida para garantir conformidade com LGPD
     */
    function closeModal() {
        const { overlay, banner } = state.elements;
        
        // Remove o último modal da pilha
        const currentModal = state.modalStack.pop();

        if (currentModal) {
            currentModal.classList.remove("visible");
            currentModal.classList.add("hidden");
            currentModal.setAttribute("aria-hidden", "true");
        }

        // Se não há mais modais abertos na pilha
        if (state.modalStack.length === 0) {
            // Esconde o overlay e restaura o scroll
            overlay.classList.remove("visible");
            overlay.classList.add("hidden");
            document.body.style.overflow = "";

            // CORREÇÃO LGPD: Se o usuário fechou o modal SEM dar consentimento
            // (ex: clicou no 'X' ou no overlay fora do modal), e o banner deveria 
            // estar visível (consentimento pendente), REEXIBE o banner principal.
            const hasConsent = getCookie(CONFIG.cookieName);
            if (!hasConsent && state.isBannerVisible) {
                banner.classList.add("visible");
            }

            // Restaura o foco para o elemento que estava em foco antes
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
     * @param {string} type - Tipo de consentimento: 'all', 'reject' ou 'custom'
     */
    function saveConsent(type) {
        let preferences = {};

        // Define as preferências baseadas no tipo de ação do usuário
        if (type === 'all') {
            // Aceita todos os cookies
            preferences = { necessary: true, analytics: true, marketing: true };
        } else if (type === 'reject') {
            // Rejeita todos exceto os necessários
            preferences = { necessary: true, analytics: false, marketing: false };
        } else {
            // Personalizado: lê o estado atual dos checkboxes
            preferences = {
                necessary: true,
                analytics: document.getElementById('check-analytics')?.checked || false,
                marketing: document.getElementById('check-marketing')?.checked || false
            };
        }

        // Salva as preferências em um cookie (conformidade LGPD/GDPR)
        setCookie(CONFIG.cookieName, JSON.stringify(preferences), CONFIG.expirationDays);

        // Exibe feedback visual para o usuário
        showToast("Preferências salvas com sucesso!");

        // Atualiza o estado: o banner não deve mais aparecer
        state.isBannerVisible = false;
        
        // Limpa toda a pilha de modais
        while(state.modalStack.length > 0) {
            const m = state.modalStack.pop();
            m.classList.remove("visible");
            m.classList.add("hidden");
            m.setAttribute("aria-hidden", "true");
        }
        
        // Fecha overlay e restaura scroll
        state.elements.overlay.classList.remove("visible");
        state.elements.overlay.classList.add("hidden");
        document.body.style.overflow = "";
        toggleBanner(false);

        // Dispara evento personalizado para ferramentas de analytics (GTM, GA4, etc.)
        window.dispatchEvent(new CustomEvent("CookieConsentUpdated", { detail: preferences }));
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    /**
     * Inicializa e cachea as referências dos elementos DOM
     */
    function initElements() {
        state.elements = {
            banner: document.getElementById(CONFIG.selectors.banner),
            overlay: document.getElementById(CONFIG.selectors.overlay),
            modal: document.getElementById(CONFIG.selectors.modal),
            backToTop: document.getElementById(CONFIG.selectors.backToTop),
            cookieFab: document.getElementById(CONFIG.selectors.cookieFab),
            yearSpan: document.getElementById(CONFIG.selectors.yearSpan),
            toast: document.getElementById(CONFIG.selectors.toast),
            toastMessage: document.getElementById(CONFIG.selectors.toastMessage)
        };
    }

    /**
     * Configura todos os event listeners dos elementos interativos
     */
    function initListeners() {
        // Botões do Banner Principal (usando IDs reais do HTML)
        document.getElementById("cookie-accept")?.addEventListener("click", () => saveConsent('all'));
        document.getElementById("cookie-settings")?.addEventListener("click", () => openModal());

        // Botões do Modal de Preferências
        document.getElementById("cookie-save-preferences")?.addEventListener("click", () => saveConsent('custom'));
        document.getElementById("cookie-modal-close")?.addEventListener("click", closeModal);
        document.getElementById("cookie-accept-all")?.addEventListener("click", () => saveConsent('all'));
        
        // Clique no Overlay fecha o modal (mas não aceita cookies automaticamente)
        state.elements.overlay?.addEventListener("click", (e) => {
            if (e.target === state.elements.overlay) closeModal();
        });

        // FAB (Botão flutuante para reabrir preferências)
        state.elements.cookieFab?.addEventListener("click", () => openModal());

        // Accordion/Expansão de categorias no modal
        document.querySelectorAll(".cookie-category-header").forEach(header => {
            header.addEventListener("click", function() {
                const group = this.parentElement;
                group.classList.toggle("active");
                
                // Atualiza atributo aria-expanded para acessibilidade
                const expanded = group.classList.contains("active");
                this.setAttribute("aria-expanded", expanded);
            });

            // Suporte a teclado (Enter/Space para expandir)
            header.addEventListener("keydown", function(e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Efeito visual nos switches de checkbox
        document.querySelectorAll('.cookie-switch input[type="checkbox"]').forEach(chk => {
            chk.addEventListener("change", function() {
                const slider = this.nextElementSibling;
                if (slider) {
                    slider.style.backgroundColor = this.checked ? "#2563eb" : "#e5e7eb";
                }
            });
        });

        // Botões de informação (abrem submodais de detalhes)
        document.querySelectorAll(".cookie-info-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const modalTarget = this.getAttribute("data-modal-target");
                if (modalTarget) {
                    state.lastFocusedElement = this;
                    openDetailModal(modalTarget);
                }
            });
        });

        // Botões de fechar nos submodais (X)
        document.querySelectorAll(".cookie-detail-modal .cookie-modal-close").forEach(btn => {
            btn.addEventListener("click", function() {
                const modal = this.closest(".cookie-detail-modal");
                if (modal && modal.id) {
                    closeDetailModal(modal.id);
                }
            });
        });

        // Botões Voltar nos submodais
        document.querySelectorAll(".cookie-detail-back").forEach(btn => {
            btn.addEventListener("click", function() {
                const modalTarget = this.getAttribute("data-close");
                if (modalTarget) {
                    closeDetailModal(modalTarget);
                }
            });
        });

        // Scroll Back to Top - visibilidade baseada na posição de scroll
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                state.elements.backToTop?.classList.add("visible");
            } else {
                state.elements.backToTop?.classList.remove("visible");
            }
        });

        // Botão Voltar ao Topo - comportamento de scroll suave
        state.elements.backToTop?.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        // Tecla ESC fecha o modal mais recente
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && state.modalStack.length > 0) {
                const topModal = state.modalStack[state.modalStack.length - 1];
                
                // Verifica se é um submodal
                if (topModal.classList.contains("cookie-detail-modal")) {
                    const modalId = topModal.id;
                    if (modalId) {
                        closeDetailModal(modalId);
                        return;
                    }
                }
                
                // Caso contrário, fecha o modal principal
                closeModal();
            }
        });
    }

    /**
     * Função principal de inicialização
     */
    function run() {
        initElements();
        
        // Atualiza o ano no copyright do footer
        if (state.elements.yearSpan) {
            state.elements.yearSpan.textContent = new Date().getFullYear();
        }

        initListeners();

        // Verifica se o usuário já tem consentimento salvo
        const consent = getCookie(CONFIG.cookieName);
        
        if (!consent) {
            // Usuário ainda não consentiu: mostra banner após pequeno delay
            setTimeout(() => toggleBanner(true), 500);
        } else {
            // Usuário já consentiu anteriormente: mostra botão FAB para reconfigurar
            if (state.elements.cookieFab) {
                state.elements.cookieFab.classList.remove("hidden");
            }
        }
    }

    // Inicialização segura: espera o DOM estar pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }

})();
