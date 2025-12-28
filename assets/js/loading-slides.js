/**
 * Sistema de Carregamento e Interface
 * Versão melhorada com animações CSS, verificações de segurança e encapsulamento
 */

// ============================================
// SISTEMA DE CARREGAMENTO (LOADING SCREEN)
// ============================================

const LoadingScreen = {
    // Configurações
    config: {
        minDisplayTime: 1800,    // Tempo mínimo de exibição (ms)
        maxDisplayTime: 5000,    // Tempo máximo de exibição (ms) - fallback de segurança
        animationDuration: 400   // Duração da animação de saída (ms)
    },

    /**
     * Inicializa o sistema de carregamento
     */
    init: function() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.startTime = Date.now();

        if (!this.loadingScreen) {
            console.warn('[LoadingScreen] Elemento #loading-screen não encontrado');
            return;
        }

        // Verifica preferência de movimento reduzido
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Configura timeout de segurança (para conexões lentas)
        this.safetyTimeout = setTimeout(() => {
            this.hide();
        }, this.config.maxDisplayTime);

        // Escuta evento load
        window.addEventListener('load', () => {
            this.onLoadComplete();
        });

        // Fallback: se load não dispara em tempo razoável
        setTimeout(() => {
            if (this.loadingScreen && !this.loadingScreen.classList.contains('hidden')) {
                this.onLoadComplete();
            }
        }, this.config.maxDisplayTime);

        console.log('[LoadingScreen] Sistema inicializado');
    },

    /**
     * Callback executado quando load dispara
     */
    onLoadComplete: function() {
        const elapsed = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.config.minDisplayTime - elapsed);

        setTimeout(() => {
            this.hide();
        }, remainingTime);
    },

    /**
     * Oculta a tela de carregamento com animação
     */
    hide: function() {
        if (!this.loadingScreen) return;

        // Adiciona classe de animação de saída
        this.loadingScreen.classList.add('loading-exit');

        // Calcula duração da animação
        const duration = this.prefersReducedMotion ? 0 : this.config.animationDuration;

        // Remove elemento após animação terminar
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
            this.loadingScreen.style.display = 'none';
            
            // Dispara evento customizado
            window.dispatchEvent(new CustomEvent('loading:complete'));
            
            console.log('[LoadingScreen] Tela de carregamento ocultada');
        }, duration);

        // Limpa timeout de segurança
        if (this.safetyTimeout) {
            clearTimeout(this.safetyTimeout);
        }
    },

    /**
     * Método estático para compatibilidade com código existente
     */
    hideStatic: function() {
        const element = document.getElementById('loading-screen');
        if (element) {
            element.classList.add('hidden');
        }
    }
};

// Inicializa automaticamente quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        LoadingScreen.init();
    });
} else {
    LoadingScreen.init();
}


// ============================================
// SISTEMA DE SLIDES (CAROUSEL)
// ============================================

const SlideManager = {
    // Estado atual
    state: {
        currentSlide: 0,
        totalSlides: 0,
        isAnimating: false
    },

    // Elementos cacheados
    elements: {
        slides: null,
        dots: null,
        numDisplay: null,
        prevBtn: null,
        nextBtn: null,
        container: null
    },

    // Configurações
    config: {
        autoPlay: false,
        autoPlayInterval: 5000,
        transitionDuration: 300,
        wrapAround: true
    },

    /**
     * Inicializa o gerenciador de slides
     */
    init: function(options) {
        // Mescla configurações
        this.config = { ...this.config, ...options };

        // Cacheia elementos DOM
        this.cacheElements();

        // Verifica se elementos existem
        if (!this.validateElements()) {
            console.error('[SlideManager] Elementos obrigatórios não encontrados');
            return false;
        }

        // Configura estado inicial
        this.state.totalSlides = this.elements.slides.length;

        // Configura eventos
        this.bindEvents();

        // Inicializa UI
        this.updateUI();

        // Inicia autoPlay se configurado
        if (this.config.autoPlay) {
            this.startAutoPlay();
        }

        console.log('[SlideManager] Sistema inicializado com', this.state.totalSlides, 'slides');
        return true;
    },

    /**
     * Cache elementos DOM para performance
     */
    cacheElements: function() {
        this.elements = {
            slides: document.querySelectorAll('.slide'),
            dots: document.querySelectorAll('.progress-dot'),
            numDisplay: document.getElementById('slide-number-display') || 
                        document.querySelector('.slide-number-display'),
            prevBtn: document.querySelector('.slide-prev') || 
                     document.querySelector('[data-slide="prev"]'),
            nextBtn: document.querySelector('.slide-next') || 
                     document.querySelector('[data-slide="next"]'),
            container: document.querySelector('.slides-container')
        };
    },

    /**
     * Valida se elementos obrigatórios existem
     */
    validateElements: function() {
        return this.elements.slides && this.elements.slides.length > 0;
    },

    /**
     * Configura event listeners
     */
    bindEvents: function() {
        const self = this;

        // Botões de navegação
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => {
                self.prev();
            });
        }

        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => {
                self.next();
            });
        }

        // Dots de navegação
        this.elements.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                self.goTo(index);
            });
        });

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                self.prev();
            } else if (e.key === 'ArrowRight') {
                self.next();
            }
        });

        // Touch/Swipe
        if (this.elements.container) {
            this.initSwipe();
        }

        // Transição de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else if (this.config.autoPlay) {
                this.startAutoPlay();
            }
        });
    },

    /**
     * Inicializa gestos de swipe para dispositivos touch
     */
    initSwipe: function() {
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50;

        this.elements.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.elements.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const distance = touchEndX - touchStartX;

            if (Math.abs(distance) > minSwipeDistance) {
                if (distance > 0) {
                    this.prev();
                } else {
                    this.next();
                }
            }
        }, { passive: true });
    },

    /**
     * Atualiza a interface com base no slide atual
     */
    updateUI: function() {
        const { currentSlide, totalSlides, isAnimating } = this.state;

        // Evita múltiplas animações simultâneas
        if (isAnimating) return;

        // Verifica elementos antes de manipular
        if (this.elements.slides) {
            this.elements.slides.forEach((slide, index) => {
                if (slide) {
                    slide.classList.toggle('active', index === currentSlide);
                }
            });
        }

        // Atualiza dots
        if (this.elements.dots) {
            this.elements.dots.forEach((dot, index) => {
                if (dot) {
                    dot.classList.toggle('active', index === currentSlide);
                }
            });
        }

        // Atualiza número do slide
        if (this.elements.numDisplay) {
            const slideNumber = (currentSlide + 1).toString().padStart(2, '0');
            this.elements.numDisplay.textContent = slideNumber;
        }

        // Atualiza estado de botões
        this.updateButtonStates();
    },

    /**
     * Atualiza estado dos botões de navegação
     */
    updateButtonStates: function() {
        const { currentSlide, totalSlides } = this.state;

        if (!this.config.wrapAround) {
            if (this.elements.prevBtn) {
                this.elements.prevBtn.disabled = currentSlide === 0;
            }
            if (this.elements.nextBtn) {
                this.elements.nextBtn.disabled = currentSlide === totalSlides - 1;
            }
        }
    },

    /**
     * Vai para um slide específico
     */
    goTo: function(index) {
        const { currentSlide, totalSlides, isAnimating } = this.state;

        // Validações
        if (isAnimating || index < 0 || index >= totalSlides) return;
        if (index === currentSlide) return;

        // Define flag de animação
        this.state.isAnimating = true;

        // Atualiza índice
        this.state.currentSlide = index;

        // Atualiza UI
        this.updateUI();

        // Reseta flag após transição
        setTimeout(() => {
            this.state.isAnimating = false;
            this.dispatchChangeEvent();
        }, this.config.transitionDuration);
    },

    /**
     * Vai para o próximo slide
     */
    next: function() {
        const { currentSlide, totalSlides } = this.state;
        let nextIndex = currentSlide + 1;

        if (nextIndex >= totalSlides) {
            if (this.config.wrapAround) {
                nextIndex = 0;
            } else {
                return;
            }
        }

        this.goTo(nextIndex);
    },

    /**
     * Vai para o slide anterior
     */
    prev: function() {
        const { currentSlide } = this.state;
        let prevIndex = currentSlide - 1;

        if (prevIndex < 0) {
            if (this.config.wrapAround) {
                prevIndex = this.state.totalSlides - 1;
            } else {
                return;
            }
        }

        this.goTo(prevIndex);
    },

    /**
     * Inicia reprodução automática
     */
    startAutoPlay: function() {
        if (this.autoPlayInterval) return;

        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, this.config.autoPlayInterval);

        console.log('[SlideManager] AutoPlay iniciado');
    },

    /**
     * Para reprodução automática
     */
    stopAutoPlay: function() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    },

    /**
     * Dispara evento de mudança de slide
     */
    dispatchChangeEvent: function() {
        window.dispatchEvent(new CustomEvent('slide:change', {
            detail: {
                currentSlide: this.state.currentSlide,
                totalSlides: this.state.totalSlides
            }
        }));
    },

    /**
     * Método de compatibilidade com código existente
     */
    updateUIStatic: function() {
        const slides = document.querySelectorAll('.slide');
        const currentSlide = parseInt(window.currentSlide || 0);
        const slideNumDisplay = document.getElementById('slide-number-display');

        slides.forEach((s, i) => {
            if (s) s.classList.toggle('active', i === currentSlide);
        });

        document.querySelectorAll('.progress-dot').forEach((d, i) => {
            d.classList.toggle('active', i === currentSlide);
        });

        if (slideNumDisplay) {
            slideNumDisplay.innerText = (currentSlide + 1).toString().padStart(2, '0');
        }
    }
};


// ============================================
// CSS PARA ANIMAÇÕES (adicione ao seu CSS)
// ============================================

/*
.loading-screen {
    position: fixed;
    inset: 0;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.4s ease, visibility 0.4s ease;
}

.loading-screen.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

.loading-screen.loading-exit {
    opacity: 0;
    transform: scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
    .loading-screen {
        transition: none;
    }
}
*/


// ============================================
// INICIALIZAÇÃO
// ============================================

// Função global de inicialização
function initializeApp() {
    // Inicializa SlideManager
    SlideManager.init({
        autoPlay: true,
        autoPlayInterval: 5000,
        wrapAround: true
    });
}

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
