/**
 * SISTEMA GESTOR DE FOOTER & PRIVACIDADE (V4.2 - 2025)
 * ----------------------------------------------------
 * Auditoria Realizada:
 * 1. [FIX] Implementação nativa de Debounce/Throttle (remove dependência de Utils externo).
 * 2. [SEC] Validação de Schema rigorosa antes de salvar no LocalStorage.
 * 3. [UX] Restauração de Event Dispatching para GTM/Analytics.
 * 4. [A11Y] Mantida acessibilidade (Focus Trap e ARIA) e Accordions.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. UTILITÁRIOS NATIVOS (Performance & Independência) ---
    // Implementados aqui para garantir que o script funcione sem dependências externas.
    const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // --- 1. CONFIGURAÇÃO E UI ---
    const ui = {
        banner: document.getElementById('cookie-banner'),
        overlay: document.getElementById('cookie-overlay'),
        modal: document.getElementById('cookie-modal-content'),
        backToTop: document.getElementById('backToTop'),
        cookieFab: document.getElementById('cookie-fab'),
        yearSpan: document.getElementById('current-year'),
        statsCheck: document.getElementById('check-stats'),
        adsCheck: document.getElementById('check-adsense')
    };

    const CONSENT_KEY = 'ce_cookie_consent_v4_2025';
    let lastFocusedElement;

    // --- 2. GERENCIAMENTO DE POSIÇÃO (FABs) ---
    // Otimizado com Debounce para não sobrecarregar o browser no resize
    const updateFabsPosition = debounce(() => {
        if (!ui.banner) return;
        
        // Verifica se o banner ocupa espaço visual real
        const isVisible = ui.banner.classList.contains('visible') && ui.banner.style.display !== 'none';
        const bannerHeight = isVisible ? ui.banner.offsetHeight : 0;
        
        // Cálculo do offset: Altura do banner + espaçamento padrão (20px)
        const bottomOffset = bannerHeight > 0 ? bannerHeight + 20 : 20;

        requestAnimationFrame(() => {
            if (ui.backToTop) ui.backToTop.style.bottom = `${bottomOffset}px`;
            if (ui.cookieFab) ui.cookieFab.style.bottom = `${bottomOffset}px`;
        });
    }, 100);

    const updateBackToTopVisibility = throttle(() => {
        if (!ui.backToTop) return;
        const shouldShow = window.scrollY > 300;
        
        // Usa toggle para código mais limpo
        ui.backToTop.classList.toggle('visible', shouldShow);
        ui.backToTop.classList.toggle('hidden', !shouldShow); // Compatibilidade com CSS utilitário se houver
    }, 200);

    // --- 3. LÓGICA DE CONSENTIMENTO E SEGURANÇA ---
    
    /**
     * Valida se o objeto de preferências segue estritamente o schema esperado.
     * Previne que dados corrompidos ou maliciosos entrem no localStorage.
     */
    const validateConsentSchema = (prefs) => {
        const requiredKeys = ['consented', 'timestamp', 'marketing', 'adsense', 'version'];
        
        // 1. Verifica chaves obrigatórias
        const hasAllKeys = requiredKeys.every(key => Object.prototype.hasOwnProperty.call(prefs, key));
        if (!hasAllKeys) return false;

        // 2. Verifica tipos de dados críticos
        if (typeof prefs.consented !== 'boolean') return false;
        if (typeof prefs.marketing !== 'boolean') return false;
        if (typeof prefs.adsense !== 'boolean') return false;
        
        // 3. Verifica integridade básica da data
        if (isNaN(Date.parse(prefs.timestamp))) return false;

        return true;
    };

    const saveConsent = (accepted) => {
        // Sanitização de entrada (Input Validation)
        if (typeof accepted !== 'boolean' && accepted !== 'partial') {
            console.error('[Security] Tentativa de salvar consentimento com tipo inválido:', typeof accepted);
            return;
        }

        const isConsented = accepted === true || accepted === 'partial';

        // Cria o objeto de preferências
        const preferences = {
            consented: isConsented,
            timestamp: new Date().toISOString(),
            marketing: ui.statsCheck ? ui.statsCheck.checked : false,
            adsense: ui.adsCheck ? ui.adsCheck.checked : false,
            version: '4.2' // Atualizado versionamento
        };

        // Validação de Schema antes de persistir
        if (!validateConsentSchema(preferences)) {
            console.error('[Security] Falha na validação do schema de preferências. Operação abortada.');
            return;
        }

        try {
            // Persistência
            localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));

            // Ação 1: Função direta (Legado/Compatibilidade)
            if (typeof window.applyConsentSettings === 'function') {
                window.applyConsentSettings(preferences);
            }

            // Ação 2: Event Dispatch (Restaurado do original - Ideal para GTM/Listeners externos)
            window.dispatchEvent(new CustomEvent('consentUpdated', { detail: preferences }));
            
            console.info('[Consent] Preferências salvas e eventos disparados.');

        } catch (e) {
            console.error('[Consent] Erro crítico ao salvar preferências:', e);
        }
        
        hideBanner();
    };

    const hideBanner = () => {
        if (ui.banner) {
            ui.banner.classList.remove('visible');
            // Timeout garante que a animação CSS termine antes de reposicionar os FABs
            setTimeout(updateFabsPosition, 350);
        }
    };

    const showBanner = () => {
        if (ui.banner) {
            ui.banner.classList.add('visible');
            // Força recálculo imediato
            requestAnimationFrame(updateFabsPosition);
        }
    };

    // --- 4. GESTÃO DE MODAL (ACESSIBILIDADE) ---
    const openModal = () => {
        lastFocusedElement = document.activeElement; // Salva o foco anterior
        
        if (ui.modal) {
            ui.modal.classList.add('show');
            ui.modal.setAttribute('aria-hidden', 'false');
            
            if(ui.overlay) {
                ui.overlay.classList.add('visible');
                ui.overlay.classList.remove('hidden');
            }
            
            // Focus Trap simples: foca no primeiro elemento interativo
            const focusable = ui.modal.querySelector('button, [href], input, select, textarea');
            if (focusable) setTimeout(() => focusable.focus(), 100);
        }
        document.body.style.overflow = 'hidden'; // Previne scroll no fundo
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        if (ui.modal) {
            ui.modal.classList.remove('show');
            ui.modal.setAttribute('aria-hidden', 'true');
            
            if(ui.overlay) {
                ui.overlay.classList.remove('visible');
                ui.overlay.classList.add('hidden'); // Garante hidden para leitores de tela
            }
        }
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        
        if (lastFocusedElement) lastFocusedElement.focus(); // Restaura foco
    };

    // --- 5. INTERAÇÕES E LISTENERS ---

    // Accordions (Mantido integralmente conforme pedido)
    document.querySelectorAll('.cookie-desc-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                const isHidden = target.classList.contains('hidden');
                target.classList.toggle('hidden');
                
                const icon = btn.querySelector('i.fa-chevron-down');
                if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                btn.setAttribute('aria-expanded', !isHidden);
            }
        });
    });

    // Botões de Ação
    document.getElementById('btn-accept-all')?.addEventListener('click', () => saveConsent(true));
    
    document.getElementById('btn-reject-all')?.addEventListener('click', () => {
        if(ui.statsCheck) ui.statsCheck.checked = false;
        if(ui.adsCheck) ui.adsCheck.checked = false;
        saveConsent(false);
    });

    document.getElementById('btn-save-prefs')?.addEventListener('click', () => {
        saveConsent('partial');
        closeModal();
    });

    // Gatilhos de Modal
    document.getElementById('btn-manage-cookies')?.addEventListener('click', openModal);
    ui.cookieFab?.addEventListener('click', openModal);
    document.querySelector('.cookie-close')?.addEventListener('click', closeModal);
    
    // Fechar ao clicar no overlay
    ui.overlay?.addEventListener('click', (e) => {
        if (e.target === ui.overlay) closeModal();
    });

    // Voltar ao Topo
    ui.backToTop?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Acessibilidade (Teclado)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Listeners Globais com Debounce/Throttle
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
    window.addEventListener('resize', updateFabsPosition, { passive: true });

    // --- 6. INICIALIZAÇÃO ---
    if (ui.yearSpan) ui.yearSpan.textContent = new Date().getFullYear();

    const checkInit = () => {
        const saved = localStorage.getItem(CONSENT_KEY);
        
        if (!saved) {
            setTimeout(showBanner, 1000);
        } else {
            try {
                const prefs = JSON.parse(saved);
                
                // Validação de integridade ao carregar
                if (!validateConsentSchema(prefs)) {
                    throw new Error('Schema inválido no armazenamento local');
                }

                // Restaura estado dos checkboxes
                if(ui.statsCheck) ui.statsCheck.checked = prefs.marketing;
                if(ui.adsCheck) ui.adsCheck.checked = prefs.adsense;
                
                // Aplica configurações
                if (window.applyConsentSettings) window.applyConsentSettings(prefs);
                
                // Dispara evento para listeners que dependem do carregamento inicial
                window.dispatchEvent(new CustomEvent('consentLoaded', { detail: prefs }));
                
            } catch(e) {
                console.warn('[Consent] Dados corrompidos detectados. Resetando.', e);
                localStorage.removeItem(CONSENT_KEY);
                showBanner();
            }
        }
        
        // Ajuste inicial de posição
        updateFabsPosition();
        updateBackToTopVisibility();
    };

    checkInit();
});