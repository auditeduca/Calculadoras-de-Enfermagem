/**
 * ACCESSIBILITY.JS
 * Sistema Centralizado de Acessibilidade e Temas
 * Versão: 3.0 - Refatorado com Theme Manager Integrado
 * 
 * Funcionalidades:
 * - Painel de acessibilidade
 * - Theme Manager (claro/escuro)
 * - VLibras integração
 * - Recursos de leitura e navegação
 * 
 * Integração:
 * - Carregado após ComponentsLoaded
 * - Gerencia estado global de acessibilidade
 */

const AccessControl = {
    // ═══════════════════════════════════════════
    // CONFIGURAÇÕES DE ESTADO
    // ═══════════════════════════════════════════
    state: {
        fontSize: 0,
        fontFamily: 0,
        letterSpacing: 0,
        readingMask: 0,
        isTTSActive: false,
        contrast: 0,
        theme: 'system' // 'light', 'dark', 'system'
    },

    // Elementos cacheados do DOM
    elements: {},

    // ═══════════════════════════════════════════
    // THEME MANAGER
    // ═══════════════════════════════════════════
    ThemeManager: {
        keys: {
            theme: 'nursing_calc_theme',
            systemPreference: 'nursing_calc_system_theme'
        },

        // Detectar preferência do sistema
        detectSystemTheme() {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            return 'light';
        },

        // Obter tema atual
        getTheme() {
            const savedTheme = localStorage.getItem(this.keys.theme);
            if (savedTheme) {
                return savedTheme;
            }
            
            // Se não houver preferência salva, usar preferência do sistema
            const systemTheme = this.detectSystemTheme();
            localStorage.setItem(this.keys.systemTheme, systemTheme);
            return 'system';
        },

        // Aplicar tema ao body
        applyTheme(theme) {
            const body = document.body;
            const isDark = theme === 'dark' || 
                (theme === 'system' && this.detectSystemTheme() === 'dark');
            
            if (isDark) {
                body.classList.add('dark-theme');
            } else {
                body.classList.remove('dark-theme');
            }
            
            // Salvar preferência
            localStorage.setItem(this.keys.theme, theme);
            this.state.theme = theme;
        },

        // Alternar entre temas
        toggleTheme() {
            const currentTheme = this.getTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            
            // Dispatch evento para outros módulos
            window.dispatchEvent(new CustomEvent('Theme:Changed', { 
                detail: { theme: newTheme } 
            }));
            
            return newTheme;
        },

        // Inicializar tema na carga da página
        init() {
            const theme = this.getTheme();
            this.applyTheme(theme);
            
            // Listener para mudanças na preferência do sistema
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    const savedTheme = localStorage.getItem(this.keys.theme);
                    if (savedTheme === 'system') {
                        this.applyTheme('system');
                    }
                });
            }
        },

        // Resetar para preferência do sistema
        resetToSystem() {
            localStorage.removeItem(this.keys.theme);
            this.applyTheme('system');
        }
    },

    // ═══════════════════════════════════════════
    // INICIALIZAÇÃO
    // ═══════════════════════════════════════════

    init() {
        // Inicializar Theme Manager primeiro
        this.ThemeManager.init();
        
        // Cachear elementos
        this.ensureElements();

        if (!this.elements.panel) {
            return;
        }

        // Configurar inicialização diferida (Lucide, VLibras)
        this.setupDeferredInit();
        
        // Observadores de mutação
        this.setupObservers();
        
        // Eventos globais (teclado, clique fora)
        this.setupGlobalEvents();
        
        // Carregar configurações salvas
        this.loadSavedState();
    },

    // ═══════════════════════════════════════════
    // ELEMENTOS DO DOM
    // ═══════════════════════════════════════════

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
            openBtn: document.getElementById('accessibility-btn'),
            themeToggleBtn: document.getElementById('theme-toggle-btn'),
            themeIcon: document.getElementById('theme-icon')
        };
        
        return !!this.elements.panel;
    },

    // ═══════════════════════════════════════════
    // INICIALIZAÇÃO DIFERIDA
    // ═══════════════════════════════════════════

    setupDeferredInit() {
        // Inicializar Lucide quando disponível
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

        // Inicializar VLibras
        const checkVLibras = setInterval(() => {
            if (window.VLibras && window.VLibras.Widget) {
                clearInterval(checkVLibras);
                new window.VLibras.Widget('https://vlibras.gov.br/app');
            }
        }, 200);
        
        // Parar verificação após 10 segundos
        setTimeout(() => clearInterval(checkVLibras), 10000);
    },

    // ═══════════════════════════════════════════
    // PERSISTÊNCIA DE ESTADO
    // ═══════════════════════════════════════════

    loadSavedState() {
        const savedState = localStorage.getItem('accessControlState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                
                // Restaurar configurações de fonte
                if (parsed.fontSize && parsed.fontSize !== 0) {
                    document.documentElement.style.setProperty('--font-scale', parsed.fontSize);
                }
                
                // Restaurar configurações de contraste
                if (parsed.contrast && parsed.contrast !== 0) {
                    // Aplicado via classe no body
                }
                
                // Restaurar tema (já feito pelo ThemeManager)
                const theme = this.ThemeManager.getTheme();
                this.updateThemeIcon(theme);
                
            } catch (e) {
                // Erro ao carregar estado, usa padrões
            }
        }
    },

    saveState() {
        const stateToSave = {
            fontSize: this.state.fontSize > 0 ? ['', '1.2', '1.5', '2.0'][this.state.fontSize] : 0,
            contrast: this.state.contrast > 0 ? ['', 'contrast-dark', 'contrast-inverted'][this.state.contrast] : 0,
            theme: this.state.theme
        };
        localStorage.setItem('accessControlState', JSON.stringify(stateToSave));
    },

    // ═══════════════════════════════════════════
    // OBSERVADORES E EVENTOS
    // ═══════════════════════════════════════════

    setupObservers() {
        // Observer para fechar menu ao abrir modais/menus
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === "class") {
                    const classList = document.body.classList;
                    if (classList.contains("modal-open") || 
                        classList.contains("mobile-menu-open") || 
                        classList.contains("overflow-hidden")) {
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

        // Clique Fora
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

    // ═══════════════════════════════════════════
    // CONTROLES DO PAINEL
    // ═══════════════════════════════════════════

    isPanelClosed() {
        if (!this.ensureElements() || !this.elements.panel) {
            return true;
        }
        return this.elements.panel.classList.contains('accessibility-panel-hidden');
    },

    togglePanel() {
        if (!this.ensureElements()) {
            return;
        }
        
        if (this.isPanelClosed()) {
            this.openPanel();
        } else {
            this.closePanel();
        }
    },

    openPanel() {
        if (!this.ensureElements() || !this.elements.panel) return;
        
        this.elements.panel.classList.remove('accessibility-panel-hidden');
        if (this.elements.sideWidgets) {
            this.elements.sideWidgets.classList.add('side-widgets-hidden');
        }
        
        this.hideFloatingButtons();
        
        setTimeout(() => {
            if (this.elements.closeBtn) {
                this.elements.closeBtn.focus();
            }
        }, 100);
    },

    closePanel() {
        if (!this.ensureElements() || !this.elements.panel) return;
        if(this.isPanelClosed()) return;
        
        this.elements.panel.classList.add('accessibility-panel-hidden');
        if (this.elements.sideWidgets) {
            this.elements.sideWidgets.classList.remove('side-widgets-hidden');
        }
        
        this.showFloatingButtons();
        
        if (this.elements.openBtn) {
            this.elements.openBtn.focus();
        }
    },

    toggleMaximize() {
        if (!this.ensureElements() || !this.elements.panel) return;
        this.elements.panel.classList.toggle('panel-expanded');
    },

    // ═══════════════════════════════════════════
    // CONTROLES DE TEMAS
    // ═══════════════════════════════════════════

    toggleTheme() {
        const newTheme = this.ThemeManager.toggleTheme();
        this.updateThemeIcon(newTheme);
        this.saveState();
    },

    updateThemeIcon(theme) {
        if (!this.ensureElements()) return;
        
        const icon = this.elements.themeIcon;
        if (icon) {
            const isDark = theme === 'dark' || 
                (theme === 'system' && this.ThemeManager.detectSystemTheme() === 'dark');
            
            if (isDark) {
                icon.className = 'fas fa-sun';
                icon.setAttribute('aria-label', 'Alternar para modo claro');
            } else {
                icon.className = 'fas fa-moon';
                icon.setAttribute('aria-label', 'Alternar para modo escuro');
            }
        }
    },

    hideFloatingButtons() {
        const cookieFab = document.getElementById('cookie-fab');
        const backToTop = document.getElementById('backToTop');
        
        if (cookieFab) cookieFab.style.display = 'none';
        if (backToTop) backToTop.style.display = 'none';
    },
    
    showFloatingButtons() {
        const cookieFab = document.getElementById('cookie-fab');
        const backToTop = document.getElementById('backToTop');
        
        if (cookieFab) cookieFab.style.display = 'flex';
        if (backToTop) backToTop.style.display = 'flex';
    },

    // ═══════════════════════════════════════════
    // VLIBS
    // ═══════════════════════════════════════════

    toggleLibrasWidget() {
        const vlibrasBtn = document.querySelector('[vw-access-button]');
        if(vlibrasBtn) {
            vlibrasBtn.click();
        }
    },

    // ═══════════════════════════════════════════
    // RECURSOS DE ACESSIBILIDADE
    // ═══════════════════════════════════════════

    toggleSimple(className, cardElement) {
        if (!this.ensureElements()) return;
        
        this.elements.body.classList.toggle(className);
        if (cardElement) {
            cardElement.classList.toggle('active');
            this.updateDots(cardElement);
        }
    },

    cycleFeature(key, values, cardElement) {
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

    // ═══════════════════════════════════════════
    // RESETAR TUDO
    // ═══════════════════════════════════════════

    resetAll() {
        this.ensureElements();
        
        // Resetar estado
        Object.keys(this.state).forEach(k => this.state[k] = 0);
        
        // Resetar variáveis CSS
        document.documentElement.style.setProperty('--font-scale', '1');
        document.documentElement.style.setProperty('--letter-spacing', 'normal');
        
        // Resetar tema para preferência do sistema
        this.ThemeManager.resetToSystem();
        this.updateThemeIcon(this.ThemeManager.getTheme());
        
        // Remover classes do body
        if (this.elements.body) {
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
        
        // Dispatch evento
        window.dispatchEvent(new CustomEvent('Accessibility:Reset'));
        
        // Feedback visual
        const btn = document.querySelector('button[onclick="resetAllFeatures()"]');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Restaurado!';
            
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

    // ═══════════════════════════════════════════
    // UTILIDADES DE UI
    // ═══════════════════════════════════════════

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

// ═══════════════════════════════════════════
// EXPOSIÇÃO GLOBAL PARA ONCLICK
// ═══════════════════════════════════════════

window.toggleAccessibilityPanel = () => AccessControl.togglePanel();
window.toggleMaximizePanel = () => AccessControl.toggleMaximize();
window.toggleLibras = () => {
    // Chamar a função principal do header.js
    if (typeof toggleLibras === 'function') {
        toggleLibras();
    }
};
window.toggleSimpleFeature = (cls, el) => AccessControl.toggleSimple(cls, el);
window.cycleFeature = (key, vals, el) => AccessControl.cycleFeature(key, vals, el);
window.toggleTTS = (el) => AccessControl.toggleTTS(el);
window.toggleThemeMode = () => AccessControl.toggleTheme();
window.resetAllFeatures = () => AccessControl.resetAll();

// ═══════════════════════════════════════════
// INICIALIZAÇÃO AUTOMÁTICA
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um tick para garantir que outros scripts carregaram
    setTimeout(() => {
        AccessControl.init();
    }, 50);
});
