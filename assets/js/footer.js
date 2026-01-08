/**
 * Footer Behavior Script - Atualizado
 * 
 * Este script assume que o HTML do rodapé já foi injetado pelo index.html.
 * Funcionalidades:
 * - Banner de cookies com 2 colunas (texto + botões)
 * - FAB de cookies oculto quando banner está ativo
 * - Botão voltar ao topo posicionado acima do banner quando ativo
 * - Modais estilizados com identidade visual
 * - Correção do botão de informações para abrir submodais
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
            modalContainer: "cookie-modal",
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
        toast.classList.remove("hidden");

        setTimeout(() => {
            toast.classList.remove("visible");
            toast.classList.add("hidden");
        }, 3000);
    }

    // ==========================================
    // GERENCIAMENTO DE UI
    // ==========================================

    /**
     * Controla a visibilidade do banner de cookies
     * Oculta o FAB quando o banner está ativo
     */
    function toggleBanner(show) {
        const banner = document.getElementById(CONFIG.selectors.banner);
        const fab = document.getElementById(CONFIG.selectors.cookieFab);
        if (!banner) return;

        state.isBannerVisible = show;

        if (show) {
            // Mostrar banner
            banner.classList.remove("hidden");
            banner.classList.add("visible");
            banner.setAttribute("aria-hidden", "false");
            document.body.classList.add("cookie-banner-open");
            
            // Ocultar FAB quando banner está ativo
            if (fab) {
                fab.classList.add("hidden");
                fab.classList.remove("visible");
                fab.style.display = 'none';
            }
        } else {
            // Ocultar banner
            banner.classList.remove("visible");
            banner.classList.add("hidden");
            banner.setAttribute("aria-hidden", "true");
            document.body.classList.remove("cookie-banner-open");
            
            // Mostrar FAB quando banner está oculto (se houver consentimento)
            const consent = getCookie(CONFIG.cookieName);
            if (consent && fab) {
                fab.classList.remove("hidden");
                fab.classList.add("visible");
                fab.style.display = 'flex';
            }
        }
    }

    /**
     * Abre o modal de preferências de cookies
     */
    function openModal() {
        // Tentar múltiplos seletores para compatibilidade
        const modal = document.getElementById(CONFIG.selectors.modal) ||
                      document.getElementById(CONFIG.selectors.modalContainer);
        const overlay = document.getElementById(CONFIG.selectors.overlay);

        if (!modal || !overlay) {
            console.warn('[Footer] Modal ou overlay não encontrado');
            console.log('[Footer] Modal ID:', CONFIG.selectors.modal);
            console.log('[Footer] Modal Container ID:', CONFIG.selectors.modalContainer);
            console.log('[Footer] Overlay ID:', CONFIG.selectors.overlay);
            return;
        }

        state.lastFocusedElement = document.activeElement;
        state.modalStack.push(modal);

        overlay.classList.remove("hidden");
        overlay.classList.add("visible");
        modal.classList.remove("hidden");
        modal.classList.add("visible");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        // Ocultar banner quando abrir modal
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
        if (!modalId) {
            console.warn('[Footer] ID do modal de detalhes não fornecido');
            return;
        }
        
        const detailModal = document.getElementById(modalId);
        const overlay = document.getElementById(CONFIG.selectors.overlay);

        if (!detailModal || !overlay) {
            console.warn('[Footer] Modal de detalhes não encontrado:', modalId);
            return;
        }

        state.lastFocusedElement = document.activeElement;
        state.modalStack.push(detailModal);

        overlay.classList.remove("hidden");
        overlay.classList.add("visible");
        detailModal.classList.remove("hidden");
        detailModal.classList.add("visible");
        detailModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        
        console.log('[Footer] Submodal aberto:', modalId);
    }

    /**
     * Fecha um submodal específico
     */
    function closeDetailModal(modalId) {
        if (!modalId) return;
        
        const detailModal = document.getElementById(modalId);
        if (!detailModal) return;

        const index = state.modalStack.indexOf(detailModal);
        if (index > -1) {
            state.modalStack.splice(index, 1);
        }

        detailModal.classList.remove("visible");
        detailModal.classList.add("hidden");
        detailModal.setAttribute("aria-hidden", "true");

        // Se não houver mais modais na pilha, fechar overlay e voltar ao modal principal
        if (state.modalStack.length === 0) {
            const overlay = document.getElementById(CONFIG.selectors.overlay);
            overlay.classList.remove("visible");
            overlay.classList.add("hidden");
            document.body.style.overflow = "";

            // Encontrar e mostrar o modal principal
            const mainModal = document.getElementById(CONFIG.selectors.modal) ||
                             document.getElementById(CONFIG.selectors.modalContainer);
            if (mainModal) {
                mainModal.classList.add("visible");
                mainModal.classList.remove("hidden");
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

        // Se não houver mais modais, fechar overlay
        if (state.modalStack.length === 0) {
            if (overlay) {
                overlay.classList.remove("visible");
                overlay.classList.add("hidden");
            }
            document.body.style.overflow = "";

            // Se não houver consentimento, mostrar banner novamente
            const hasConsent = getCookie(CONFIG.cookieName);
            if (!hasConsent && state.isBannerVisible && banner) {
                banner.classList.remove("hidden");
                banner.classList.add("visible");
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

        // Fechar todos os modais
        while (state.modalStack.length > 0) {
            const m = state.modalStack.pop();
            if (m) {
                m.classList.remove("visible");
                m.classList.add("hidden");
                m.setAttribute("aria-hidden", "true");
            }
        }

        const overlay = document.getElementById(CONFIG.selectors.overlay);
        if (overlay) {
            overlay.classList.remove("visible");
            overlay.classList.add("hidden");
        }
        document.body.style.overflow = "";

        toggleBanner(false);

        // Mostrar FAB após consentimento
        const fab = document.getElementById(CONFIG.selectors.cookieFab);
        if (fab) {
            fab.classList.remove("hidden");
            fab.classList.add("visible");
            fab.style.display = 'flex';
        }

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
            const target = e.target;
            const button = target.closest('button');
            if (!button) return;

            const btnId = button.id;

            // Botão ACEITAR TODOS (do banner)
            if (btnId === 'cookie-accept') {
                saveConsent('all');
                e.preventDefault();
                return;
            }

            // Botão PERSONALIZAR (do banner)
            if (btnId === 'cookie-settings') {
                openModal();
                e.preventDefault();
                return;
            }

            // Botão SALVAR PREFERÊNCIAS (do modal)
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

            // Botão CONCORDAR COM TUDO (do modal)
            if (btnId === 'cookie-accept-all') {
                saveConsent('all');
                e.preventDefault();
                return;
            }

            // Botão REJEITAR (do modal)
            if (btnId === 'cookie-reject') {
                saveConsent('reject');
                e.preventDefault();
                return;
            }

            // Botão FAB de cookies - ABRE MODAL DE PREFERÊNCIAS
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

            // CORREÇÃO: Botões de info (abrem submodais) - Seletor correto
            const infoBtn = target.closest('.cookie-info-btn');
            if (infoBtn) {
                const modalTarget = infoBtn.getAttribute('data-modal-target');
                console.log('[Footer] Botão de info clicado, target:', modalTarget);
                if (modalTarget) {
                    state.lastFocusedElement = infoBtn;
                    openDetailModal(modalTarget);
                    e.preventDefault();
                }
                return;
            }

            // Botões de fechar nos submodais
            const closeBtn = target.closest('.cookie-detail-modal .cookie-modal-close');
            if (closeBtn) {
                const modal = closeBtn.closest('.cookie-detail-modal');
                if (modal && modal.id) {
                    closeDetailModal(modal.id);
                    e.preventDefault();
                }
                return;
            }

            // Botões Voltar nos submodais
            const backBtn = target.closest('.cookie-detail-back');
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

        // Accordion de categorias no modal - CORREÇÃO DO ARRAY
        const categoryHeaders = document.querySelectorAll('.cookie-category-header');
        console.log('[Footer] Categorias encontradas:', categoryHeaders.length);
        
        categoryHeaders.forEach(function(header, index) {
            header.addEventListener('click', function() {
                const group = this.parentElement;
                if (!group) return;
                
                group.classList.toggle('active');
                const expanded = group.classList.contains('active');
                this.setAttribute('aria-expanded', expanded);
                
                // Toggle da descrição
                const description = group.querySelector('.cookie-category-description');
                if (description) {
                    if (expanded) {
                        description.classList.add('expanded');
                    } else {
                        description.classList.remove('expanded');
                    }
                }
                
                console.log('[Footer] Categoria', index, 'expandida:', expanded);
            });

            header.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Efeito visual nos switches de checkbox
        const checkboxes = document.querySelectorAll('.cookie-switch input[type="checkbox"]');
        checkboxes.forEach(function(chk) {
            chk.addEventListener('change', function() {
                const slider = this.nextElementSibling;
                if (slider) {
                    slider.style.backgroundColor = this.checked ? "#1A3E74" : "#ccc";
                }
            });
        });

        // Scroll listener para mostrar/ocultar back to top
        window.addEventListener('scroll', function() {
            const backToTop = document.getElementById(CONFIG.selectors.backToTop);
            if (!backToTop) return;

            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
                backToTop.classList.remove('hidden');
            } else {
                backToTop.classList.remove('visible');
                backToTop.classList.add('hidden');
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
     * Diagnóstico: Verifica se elementos e CSS estão carregados
     */
    function diagnoseFooter() {
        console.log('[Footer] === DIAGNÓSTICO ===');
        
        // Verificar elementos principais
        const elements = [
            { id: 'cookie-banner', name: 'Banner de Cookies' },
            { id: 'cookie-overlay', name: 'Overlay' },
            { id: 'cookie-modal-content', name: 'Modal de Preferências (ID)' },
            { id: 'cookie-modal', name: 'Modal de Preferências (Classe)' },
            { id: 'cookie-fab', name: 'FAB de Cookies' },
            { id: 'backToTop', name: 'Botão Voltar ao Topo' },
            { id: 'footer', name: 'Footer Principal' }
        ];
        
        let foundCount = 0;
        elements.forEach(function(item) {
            const el = document.getElementById(item.id);
            const status = el ? '✓ ENCONTRADO' : '✗ NÃO ENCONTRADO';
            console.log(`[Footer] ${item.name}: ${status}`);
            if (el) foundCount++;
        });
        
        // Verificar categorias de cookies
        const categories = document.querySelectorAll('.cookie-category');
        console.log(`[Footer] Categorias de cookies: ${categories.length}`);
        
        // Verificar botões de informação
        const infoButtons = document.querySelectorAll('.cookie-info-btn');
        console.log(`[Footer] Botões de informação: ${infoButtons.length}`);
        
        infoButtons.forEach(function(btn, index) {
            const target = btn.getAttribute('data-modal-target');
            console.log(`[Footer]   Info ${index}: target = "${target}"`);
        });
        
        console.log(`[Footer] Elementos encontrados: ${foundCount}/${elements.length}`);
        console.log('[Footer] === FIM DIAGNÓSTICO ===');
    }

    /**
     * Inicializa o footer
     */
    function initFooter() {
        if (state.initialized) return;

        console.log('[Footer] Iniciando...');
        
        // Verificação de segurança
        const footerContent = document.querySelector('.footer-content') || 
                             document.querySelector('.footer-brand-section');
        if (!footerContent) {
            console.warn('[Footer] Elementos do footer não encontrados');
            return;
        }

        console.log('[Footer] Elementos encontrados');

        // Verificar consentimento
        let consent = null;
        try { 
            consent = getCookie(CONFIG.cookieName); 
            console.log('[Footer] Consentimento:', consent ? 'Sim' : 'Não');
        } catch(e) {
            console.warn('[Footer] Erro ao ler cookie:', e);
        }

        state.initialized = true;
        updateYear();
        setupEventListeners();

        // Executar diagnóstico após 1 segundo
        setTimeout(diagnoseFooter, 1000);

        if (!consent) {
            console.log('[Footer] Sem consentimento - mostrando banner');
            setTimeout(function() {
                toggleBanner(true);
            }, 500);
        } else {
            console.log('[Footer] Com consentimento - mostrando FAB');
            const fab = document.getElementById(CONFIG.selectors.cookieFab);
            if (fab) {
                fab.classList.remove('hidden');
                fab.classList.add('visible');
                fab.style.display = 'flex';
            }
        }
    }

    // ==========================================
    // EXECUÇÃO
    // ==========================================

    // Inicializa via evento de módulo ou imediato
    window.addEventListener('Module:footer-container:Ready', initFooter);
    
    // Fallback: inicializa se o conteúdo já existir
    if (document.querySelector('.footer-content') || 
        document.querySelector('.footer-brand-section') ||
        document.getElementById('footer')) {
        initFooter();
    }

})();
