/**
 * PRELOAD.JS
 * Sistema de Carregamento/Loading Screen
 * Versão: 3.0 - Atualizado para Sistema Modular
 */

(function() {
    'use strict';

    const LoadingScreen = {
        config: {
            minDisplayTime: 800,
            maxDisplayTime: 2500,
            transitionDuration: 400,
            elements: {
                screen: 'preload-container',
                mainContent: 'main-container'
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

            // Timeout de segurança
            this.state.timeoutId = setTimeout(() => {
                this.hide();
            }, this.config.maxDisplayTime);

            // Schedule hide uma vez
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
            screen.classList.add('preload-hidden');

            // Dispara evento de conteúdo carregado
            window.dispatchEvent(new CustomEvent('content:loaded'));
        },

        // Método para forçar ocultação imediata
        forceHide: function() {
            if (this.state.isHidden) return;
            this.state.isHidden = true;

            const screen = document.getElementById(this.config.elements.screen);
            if (screen) {
                screen.classList.add('preload-hidden');
            }
        }
    };

    // Expõe globalmente
    window.LoadingScreen = LoadingScreen;

    // Inicialização automática não é necessária - o ComponentLoader gerencia isso

})();
