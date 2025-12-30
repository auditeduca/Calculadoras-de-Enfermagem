/**
 * Módulo de Acessibilidade Calculadoras de Enfermagem
 * Gerencia o painel, widgets, VLibras e overrides de CSS.
 * 
 * Integração com o sistema modular:
 * - Carregado após ComponentsLoaded
 * - Gerencia estado global de acessibilidade
 * - Coordena com HeaderEngine e ModalSystem
 */

const AccessControl = {
    state: {
        fontSize: 0, 
        fontFamily: 0, 
        letterSpacing: 0,
        readingMask: 0, 
        isTTSActive: false, 
        contrast: 0
    },

    elements: {},

    // Método para verificar e recarregar elementos se necessário
    ensureElements() {
        // Se os elementos já estão cacheados e válidos, retorna true
        if (this.elements.panel && this.elements.sideWidgets) {
            return true;
        }
        
        // Tentar recarregar do DOM
        this.elements = {
            body: document.body,
            panel: document.getElementById('accessibility-panel'),
            sideWidgets: document.getElementById('side-widgets'),
            closeBtn: document.getElementById('close-panel-btn'),
            openBtn: document.getElementById('accessibility-btn')
        };
        
        return !!this.elements.panel;
    },

    init() {
        // Cachear elementos
        this.ensureElements();

        if (!this.elements.panel) {
            console.warn('Painel de Acessibilidade não encontrado no DOM.');
            return;
        }

        // Aguardar carregamento do Lucide e VLibras
        this.setupDeferredInit();
        this.setupObservers();
        this.setupGlobalEvents();
        
        // Aplicar configurações salvas do localStorage
        this.loadSavedState();
    },

    setupDeferredInit() {
        // Inicializar Lucide quando disponível (tenta 3 vezes com intervalo)
        let lucideAttempts = 0;
        const tryInitLucide = () => {
            lucideAttempts++;
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            } else if (lucideAttempts < 10) {
                setTimeout(tryInitLucide, 100);
            }
        };
        tryInitLucide();

        // Inicializar VLibras quando disponível
        const checkVLibras = setInterval(() => {
            if (window.VLibras && window.VLibras.Widget) {
                clearInterval(checkVLibras);
                new window.VLibras.Widget('https://vlibras.gov.br/app');
            }
        }, 200);
        
        // Parar verificação após 10 segundos
        setTimeout(() => clearInterval(checkVLibras), 10000);
    },

    loadSavedState() {
        // Carregar preferências salvas do localStorage
        const savedState = localStorage.getItem('accessControlState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                // Restaurar configurações de fonte e contraste se existirem
                if (parsed.fontSize && parsed.fontSize !== 0) {
                    document.documentElement.style.setProperty('--font-scale', parsed.fontSize);
                }
                if (parsed.contrast && parsed.contrast !== 0) {
                    // Reaplicar contraste via classe no body
                }
            } catch (e) {
                console.warn('Erro ao carregar estado de acessibilidade:', e);
            }
        }
    },

    saveState() {
        // Salvar estado atual no localStorage
        const stateToSave = {
            fontSize: this.state.fontSize > 0 ? ['', '1.2', '1.5', '2.0'][this.state.fontSize] : 0,
            contrast: this.state.contrast > 0 ? ['', 'contrast-dark', 'contrast-inverted'][this.state.contrast] : 0
        };
        localStorage.setItem('accessControlState', JSON.stringify(stateToSave));
    },

    setupObservers() {
        // Observer para fechar menu ao abrir modais/menus (conflitos)
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Checa classes (ex: modal-open)
                if (mutation.attributeName === "class") {
                    const classList = document.body.classList;
                    if (classList.contains("modal-open") || 
                        classList.contains("mobile-menu-open") || 
                        classList.contains("overflow-hidden")) {
                        // Se painel estiver aberto, fecha
                        if (!this.isPanelClosed()) {
                            this.closePanel();
                        }
                    }
                }
            });
        });
        observer.observe(document.body, { attributes: true });
    },

    setupGlobalEvents() {
        // Teclado (ESC)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closePanel();
        });

        // Clique Fora - com verificação defensiva
        document.addEventListener('click', (e) => {
            if (!this.ensureElements()) return;
            
            if (!this.isPanelClosed() && 
                this.elements.panel && 
                this.elements.panel.contains(e.target) === false && 
                this.elements.sideWidgets && 
                this.elements.sideWidgets.contains(e.target) === false) {
                this.closePanel();
            }
        });
    },

    // --- Controles de UI ---

    isPanelClosed() {
        // Verificação defensiva
        if (!this.ensureElements() || !this.elements.panel) {
            return true; // Assume fechado se não encontrar elemento
        }
        // Usa a classe accessibility-panel-hidden que é adicionada/removida para controle de visibilidade
        return this.elements.panel.classList.contains('accessibility-panel-hidden');
    },

    togglePanel() {
        // Verificação defensiva - tentar inicializar se necessário
        if (!this.ensureElements()) {
            console.warn('Painel de acessibilidade não carregado ainda.');
            return;
        }
        
        if (this.isPanelClosed()) {
            this.openPanel();
        } else {
            this.closePanel();
        }
    },

    openPanel() {
        // Verificação defensiva
        if (!this.ensureElements() || !this.elements.panel) return;
        
        this.elements.panel.classList.remove('accessibility-panel-hidden');
        if (this.elements.sideWidgets) {
            this.elements.sideWidgets.classList.add('side-widgets-hidden');
        }
        
        // Ocultar botões flutuantes do footer quando painel de acessibilidade estiver aberto
        this.hideFloatingButtons();
        
        // Delay para foco acessível
        setTimeout(() => {
            if (this.elements.closeBtn) {
                this.elements.closeBtn.focus();
            }
        }, 100);
    },

    closePanel() {
        // Verificação defensiva
        if (!this.ensureElements() || !this.elements.panel) return;
        if(this.isPanelClosed()) return;
        
        this.elements.panel.classList.add('accessibility-panel-hidden');
        if (this.elements.sideWidgets) {
            this.elements.sideWidgets.classList.remove('side-widgets-hidden');
        }
        
        // Mostrar botões flutuantes do footer novamente
        this.showFloatingButtons();
        
        if (this.elements.openBtn) {
            this.elements.openBtn.focus();
        }
    },

    hideFloatingButtons() {
        // Ocultar botões flutuantes do footer (cookie FAB e back-to-top)
        const cookieFab = document.getElementById('cookie-fab');
        const backToTop = document.getElementById('backToTop');
        
        if (cookieFab) {
            cookieFab.style.display = 'none';
        }
        if (backToTop) {
            backToTop.style.display = 'none';
        }
    },
    
    showFloatingButtons() {
        // Mostrar botões flutuantes do footer novamente
        const cookieFab = document.getElementById('cookie-fab');
        const backToTop = document.getElementById('backToTop');
        
        if (cookieFab) {
            cookieFab.style.display = 'flex';
        }
        if (backToTop) {
            backToTop.style.display = 'flex';
        }
    },

    toggleMaximize() {
        // Verificação defensiva
        if (!this.ensureElements() || !this.elements.panel) return;
        this.elements.panel.classList.toggle('panel-expanded');
    },

    toggleLibrasWidget() {
        const vlibrasBtn = document.querySelector('[vw-access-button]');
        if(vlibrasBtn) {
            vlibrasBtn.click();
        }
    },

    // --- Funcionalidades (Features) ---

    toggleSimple(className, cardElement) {
        // Verificação defensiva
        if (!this.ensureElements()) return;
        
        this.elements.body.classList.toggle(className);
        if (cardElement) {
            cardElement.classList.toggle('active');
            this.updateDots(cardElement);
        }
    },

    cycleFeature(key, values, cardElement) {
        // Verificação defensiva
        if (!this.ensureElements()) return;
        
        this.state[key] = (this.state[key] + 1) % (values.length + 1);
        const currentIndex = this.state[key] - 1;
        const activeValue = values[currentIndex];
        const badge = cardElement ? cardElement.querySelector('.level-badge') : null;

        // Remover classes anteriores
        if (key === 'fontFamily') this.elements.body.classList.remove('font-atkinson', 'font-newsreader', 'font-dyslexic');
        if (key === 'contrast') this.elements.body.classList.remove('contrast-dark', 'contrast-inverted');

        if (currentIndex === -1) {
            // Desativar feature
            if (cardElement) cardElement.classList.remove('active');
            if(badge) badge.style.display = 'none';
            if (cardElement) this.resetDots(cardElement);
            
            if (key === 'fontSize') document.documentElement.style.setProperty('--font-scale', '1');
            if (key === 'letterSpacing') document.documentElement.style.setProperty('--letter-spacing', 'normal');
            if (key === 'readingMask') this.toggleReadingMask(false);
        } else {
            // Ativar feature
            if (cardElement) cardElement.classList.add('active');
            this.updateDots(cardElement, this.state[key]);
            
            // Formatar texto do badge
            let txt = activeValue;
            if(key === 'fontSize') txt = (parseFloat(activeValue) * 100) + '%';
            if(key === 'fontFamily') txt = {'atkinson': 'Legível', 'newsreader': 'Notícia', 'dyslexic': 'Dislexia'}[activeValue];
            if(key === 'contrast') txt = {'contrast-dark': 'Escuro', 'contrast-inverted': 'Invertido'}[activeValue];
            
            if(badge) { badge.textContent = txt; badge.style.display = 'block'; }

            // Aplicar configurações
            if (key === 'fontSize') document.documentElement.style.setProperty('--font-scale', activeValue);
            if (key === 'letterSpacing') document.documentElement.style.setProperty('--letter-spacing', activeValue);
            if (key === 'fontFamily') this.elements.body.classList.add('font-' + activeValue);
            if (key === 'readingMask') this.toggleReadingMask(true, activeValue);
            if (key === 'contrast') this.elements.body.classList.add(activeValue);
        }
        
        // Salvar estado
        this.saveState();
    },

    toggleReadingMask(active, size) {
        const top = document.getElementById('reading-mask-top');
        const bottom = document.getElementById('reading-mask-bottom');
        if(!top || !bottom) return;

        top.style.display = active ? 'block' : 'none';
        bottom.style.display = active ? 'block' : 'none';

        if (active) {
            const gap = size === 'sm' ? 60 : (size === 'md' ? 120 : 200);
            window.onmousemove = (e) => {
                const y = e.clientY;
                top.style.height = (y - gap/2) + 'px';
                bottom.style.top = (y + gap/2) + 'px';
                bottom.style.bottom = '0';
            };
        } else {
            window.onmousemove = null;
        }
    },

    toggleTTS(cardElement) {
        // Verificação defensiva
        if (!this.ensureElements()) return;
        
        this.state.isTTSActive = !this.state.isTTSActive;
        if (cardElement) {
            cardElement.classList.toggle('active');
            this.updateDots(cardElement, this.state.isTTSActive ? 1 : 0);
        }
        
        if (this.state.isTTSActive) {
            this.elements.body.style.cursor = "help";
            document.onmouseup = () => {
                const text = window.getSelection().toString();
                if(text) {
                    window.speechSynthesis.cancel();
                    const utt = new SpeechSynthesisUtterance(text);
                    utt.lang = 'pt-BR';
                    window.speechSynthesis.speak(utt);
                }
            };
        } else {
            this.elements.body.style.cursor = "default";
            document.onmouseup = null;
            window.speechSynthesis.cancel();
        }
    },

    resetAll() {
        // Verificação defensiva
        this.ensureElements();
        
        Object.keys(this.state).forEach(k => this.state[k] = 0);
        document.documentElement.style.setProperty('--font-scale', '1');
        document.documentElement.style.setProperty('--letter-spacing', 'normal');
        
        if (this.elements.body) {
            // Remove todas as classes de recursos de acessibilidade
            this.elements.body.classList.remove(
                'contrast-dark', 
                'contrast-inverted', 
                'highlight-links', 
                'highlight-headers',
                'bold-text', 
                'stop-anim', 
                'font-atkinson', 
                'font-newsreader', 
                'font-dyslexic',
                'hide-images',
                'structure'
            );
            this.elements.body.style.cursor = "default";
        }
        
        this.toggleReadingMask(false);
        window.speechSynthesis.cancel();
        
        // Resetar cards visualmente
        const cards = document.querySelectorAll('.accessibility-card');
        cards.forEach(c => {
            c.classList.remove('active');
            this.resetDots(c);
            const badge = c.querySelector('.level-badge');
            if(badge) badge.style.display = 'none';
        });
        
        // Limpar localStorage
        localStorage.removeItem('accessControlState');
        
        // Dispatch evento para outros módulos
        window.dispatchEvent(new CustomEvent('Accessibility:Reset'));
        
        // Feedback visual de restauração
        const btn = document.querySelector('button[onclick="resetAllFeatures()"]');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Restaurado!';
            
            // Recarregar ícones Lucide se necessário
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                if (window.lucide && typeof window.lucide.createIcons === 'function') {
                    window.lucide.createIcons();
                }
            }, 1500);
        }
    },

    updateDots(card, count = 1) {
        if (!card) return;
        const dots = card.querySelectorAll('.dot');
        dots.forEach((d, i) => {
            if (i < count) d.classList.add('active');
            else d.classList.remove('active');
        });
    },
    resetDots(card) {
        if (!card) return;
        card.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
    }
};

// Exposição Global para onclick
window.toggleAccessibilityPanel = () => AccessControl.togglePanel();
window.toggleMaximizePanel = () => AccessControl.toggleMaximize();
window.toggleLibras = () => AccessControl.toggleLibrasWidget();
window.toggleSimpleFeature = (cls, el) => AccessControl.toggleSimple(cls, el);
window.cycleFeature = (key, vals, el) => AccessControl.cycleFeature(key, vals, el);
window.toggleTTS = (el) => AccessControl.toggleTTS(el);
window.resetAllFeatures = () => AccessControl.resetAll();