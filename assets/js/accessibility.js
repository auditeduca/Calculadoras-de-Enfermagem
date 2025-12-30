/**
 * Módulo de Acessibilidade Calculadoras de Enfermagem
 * Gerencia o painel, widgets, VLibras e overrides de CSS.
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

    init() {
        // Cachear elementos
        this.elements = {
            body: document.body,
            panel: document.getElementById('accessibility-panel'),
            sideWidgets: document.getElementById('side-widgets'),
            closeBtn: document.getElementById('close-panel-btn'),
            openBtn: document.getElementById('accessibility-btn')
        };

        if (!this.elements.panel) {
            console.warn('Painel de Acessibilidade não encontrado no DOM. Verifique a ordem de carregamento.');
            return;
        }

        // Inicializar VLibras se carregado
        if (window.VLibras && window.VLibras.Widget) {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
        }

        this.setupObservers();
        this.setupGlobalEvents();
        
        // Inicializar ícones Lucide
        if(window.lucide) window.lucide.createIcons();
    },

    setupObservers() {
        // Observer para fechar menu ao abrir modais/menus (conflitos)
        // Isso cobre o ModalsSystem.js que define overflow: hidden no body
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Checa classes (ex: modal-open)
                if (mutation.attributeName === "class") {
                    const classList = document.body.classList;
                    if (classList.contains("modal-open") || classList.contains("mobile-menu-open")) {
                        this.closePanel();
                    }
                }
                // Checa estilo inline (overflow: hidden usado pelo modals.js)
                if (mutation.attributeName === "style") {
                    if (document.body.style.overflow === "hidden") {
                         this.closePanel();
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
            if (!this.isPanelClosed() && 
                !this.elements.panel.contains(e.target) && 
                !this.elements.sideWidgets.contains(e.target)) {
                this.closePanel();
            }
        });
    },

    // --- Controles de UI ---

    isPanelClosed() {
        return this.elements.panel.classList.contains('accessibility-panel-hidden');
    },

    togglePanel() {
        if (this.isPanelClosed()) {
            this.openPanel();
        } else {
            this.closePanel();
        }
    },

    openPanel() {
        this.elements.panel.classList.remove('accessibility-panel-hidden');
        this.elements.sideWidgets.classList.add('side-widgets-hidden');
        // Delay para foco acessível
        setTimeout(() => this.elements.closeBtn?.focus(), 100);
    },

    closePanel() {
        if(this.isPanelClosed()) return;
        
        this.elements.panel.classList.add('accessibility-panel-hidden');
        this.elements.sideWidgets.classList.remove('side-widgets-hidden');
        this.elements.openBtn?.focus();
    },

    toggleMaximize() {
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
        this.elements.body.classList.toggle(className);
        cardElement.classList.toggle('active');
        this.updateDots(cardElement);
    },

    cycleFeature(key, values, cardElement) {
        this.state[key] = (this.state[key] + 1) % (values.length + 1);
        const currentIndex = this.state[key] - 1;
        const activeValue = values[currentIndex];
        const badge = cardElement.querySelector('.level-badge');

        if (key === 'fontFamily') this.elements.body.classList.remove('font-atkinson', 'font-newsreader', 'font-dyslexic');
        if (key === 'contrast') this.elements.body.classList.remove('contrast-dark', 'contrast-inverted');

        if (currentIndex === -1) {
            cardElement.classList.remove('active');
            if(badge) badge.style.display = 'none';
            this.resetDots(cardElement);
            
            if (key === 'fontSize') document.documentElement.style.setProperty('--font-scale', '1');
            if (key === 'letterSpacing') document.documentElement.style.setProperty('--letter-spacing', 'normal');
            if (key === 'readingMask') this.toggleReadingMask(false);
        } else {
            cardElement.classList.add('active');
            this.updateDots(cardElement, this.state[key]);
            
            let txt = activeValue;
            if(key === 'fontSize') txt = (parseFloat(activeValue) * 100) + '%';
            if(key === 'fontFamily') txt = {'atkinson': 'Legível', 'newsreader': 'Notícia', 'dyslexic': 'Dislexia'}[activeValue];
            if(key === 'contrast') txt = {'contrast-dark': 'Escuro', 'contrast-inverted': 'Invertido'}[activeValue];
            
            if(badge) { badge.textContent = txt; badge.style.display = 'block'; }

            if (key === 'fontSize') document.documentElement.style.setProperty('--font-scale', activeValue);
            if (key === 'letterSpacing') document.documentElement.style.setProperty('--letter-spacing', activeValue);
            if (key === 'fontFamily') this.elements.body.classList.add('font-' + activeValue);
            if (key === 'readingMask') this.toggleReadingMask(true, activeValue);
            if (key === 'contrast') this.elements.body.classList.add(activeValue);
        }
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
        this.state.isTTSActive = !this.state.isTTSActive;
        cardElement.classList.toggle('active');
        this.updateDots(cardElement, this.state.isTTSActive ? 1 : 0);
        
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
        Object.keys(this.state).forEach(k => this.state[k] = 0);
        document.documentElement.style.setProperty('--font-scale', '1');
        document.documentElement.style.setProperty('--letter-spacing', 'normal');
        
        this.elements.body.classList.remove('contrast-dark', 'contrast-inverted', 'highlight-links', 'bold-text', 'stop-anim', 'font-atkinson', 'font-newsreader', 'font-dyslexic');
        
        this.elements.body.style.cursor = "default";
        this.toggleReadingMask(false);
        window.speechSynthesis.cancel();
        
        const cards = document.querySelectorAll('.accessibility-card');
        cards.forEach(c => {
            c.classList.remove('active');
            this.resetDots(c);
            const badge = c.querySelector('.level-badge');
            if(badge) badge.style.display = 'none';
        });
    },

    updateDots(card, count = 1) {
        const dots = card.querySelectorAll('.dot');
        dots.forEach((d, i) => {
            if (i < count) d.classList.add('active');
            else d.classList.remove('active');
        });
    },
    resetDots(card) {
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