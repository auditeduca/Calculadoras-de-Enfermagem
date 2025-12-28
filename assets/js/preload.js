/**
 * PRELOAD.JS
 * Sistema de Carregamento/Loading Screen
 * Versão: 2.4 - Corrige looping
 */

(function() {
    'use strict';

    const LoadingScreen = {
        config: {
            minDisplayTime: 500,
            maxDisplayTime: 2000,
            transitionDuration: 300,
            elements: {
                screen: 'preload-modal',
                mainContent: 'main-content'
            }
        },

        state: {
            startTime: 0,
            timeoutId: null,
            isHidden: false,
            isInitialized: false,
            hasScheduledHide: false
        },

        init: function() {
            // Proteção contra múltiplas inicializações
            if (this.state.isInitialized) {
                return true;
            }
            
            const screen = document.getElementById(this.config.elements.screen);
            if (!screen) {
                return false;
            }

            this.state.isInitialized = true;
            this.state.startTime = Date.now();
            this.state.isHidden = false;

            // Timeout de segurança - una vez só
            this.state.timeoutId = setTimeout(() => {
                this.hide();
            }, this.config.maxDisplayTime);

            // Schedule hide una vez
            this.scheduleHideOnce();

            return true;
        },

        scheduleHideOnce: function() {
            if (this.state.hasScheduledHide) return;
            this.state.hasScheduledHide = true;

            const elapsed = Date.now() - this.state.startTime;
            const remaining = Math.max(0, this.config.minDisplayTime - elapsed);

            setTimeout(() => {
                this.hide();
            }, remaining);
        },

        hide: function() {
            // Proteção contra múltiplas chamadas
            if (this.state.isHidden) {
                return;
            }
            
            const screen = document.getElementById(this.config.elements.screen);
            if (!screen) return;

            this.state.isHidden = true;

            // Limpa timeout de segurança
            if (this.state.timeoutId) {
                clearTimeout(this.state.timeoutId);
                this.state.timeoutId = null;
            }

            // Adiciona classe de saída
            screen.classList.add('loading-exit');

            // Esconde após transição
            setTimeout(() => {
                screen.style.display = 'none';
                
                // Mostra conteúdo principal
                const mainContent = document.getElementById(this.config.elements.mainContent);
                if (mainContent) {
                    mainContent.style.visibility = 'visible';
                }

                // Restaura scroll
                document.body.style.overflow = 'auto';
            }, this.config.transitionDuration);
        }
    };

    // Expõe globalmente
    window.LoadingScreen = LoadingScreen;

    // Inicialização
    function initPreload() {
        LoadingScreen.init();
    }

    // Inicializa no DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreload);
    } else {
        initPreload();
    }

})();
