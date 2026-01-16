/**
 * Módulo de Acessibilidade
 * Gerencia o painel lateral e integração com VLibras
 */

window.AccessibilityModule = (function() {
    'use strict';

    let isInitialized = false;

    function init() {
        if (isInitialized) return;
        
        const checkExist = setInterval(function() {
            const accessibilityToggle = document.getElementById('accessibility-toggle');
            if (accessibilityToggle) {
                clearInterval(checkExist);
                setupEvents(accessibilityToggle);
                setupVLibrasFix();
                isInitialized = true;
            }
        }, 100);

        // Timeout de segurança
        setTimeout(() => clearInterval(checkExist), 5000);
    }

    function setupEvents(toggle) {
        const panel = document.getElementById('accessibility-panel');
        const closeBtn = document.getElementById('accessibility-close');
        const librasBtn = document.getElementById('libras-toggle-top');
        let isOpen = false;

        if (panel) panel.classList.add('accessibility-panel-hidden');

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isOpen = !isOpen;
            panel.classList.toggle('accessibility-panel-hidden', !isOpen);
            toggle.classList.toggle('active', isOpen);
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.classList.add('accessibility-panel-hidden');
                toggle.classList.remove('active');
                isOpen = false;
            });
        }

        if (librasBtn) {
            librasBtn.addEventListener('click', () => {
                const vwButton = document.querySelector('div[vw] .vw-access-button');
                if (vwButton) {
                    vwButton.click();
                } else if (window.VLibras) {
                    new window.VLibras.Widget('https://vlibras.gov.br/app');
                }
            });
        }

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (isOpen && panel && !panel.contains(e.target) && !toggle.contains(e.target)) {
                panel.classList.add('accessibility-panel-hidden');
                toggle.classList.remove('active');
                isOpen = false;
            }
        });

        // Configurar opções de acessibilidade
        setupAccessibilityOptions();
    }

    // Força posição do VLibras via JavaScript
    function fixVLibrasPosition() {
        const vwContainer = document.querySelector('div[vw]');
        const vwButton = document.querySelector('div[vw] .vw-access-button');
        
        if (vwContainer) {
            vwContainer.style.setProperty('position', 'fixed', 'important');
            vwContainer.style.setProperty('right', '0', 'important');
            vwContainer.style.setProperty('top', '310px', 'important');
            vwContainer.style.setProperty('left', 'auto', 'important');
            vwContainer.style.setProperty('bottom', 'auto', 'important');
            vwContainer.style.setProperty('width', '48px', 'important');
            vwContainer.style.setProperty('height', '48px', 'important');
            vwContainer.style.setProperty('z-index', '100005', 'important');
        }
        
        if (vwButton) {
            vwButton.style.setProperty('position', 'relative', 'important');
            vwButton.style.setProperty('right', '0', 'important');
            vwButton.style.setProperty('top', '0', 'important');
            vwButton.style.setProperty('left', 'auto', 'important');
            vwButton.style.setProperty('bottom', 'auto', 'important');
            vwButton.style.setProperty('width', '48px', 'important');
            vwButton.style.setProperty('height', '48px', 'important');
            vwButton.style.setProperty('margin', '0', 'important');
            vwButton.style.setProperty('padding', '0', 'important');
            vwButton.style.setProperty('background-color', '#00897b', 'important');
            vwButton.style.setProperty('border-radius', '12px 0 0 12px', 'important');
            vwButton.style.setProperty('box-shadow', '-3px 0 12px rgba(0,0,0,0.2)', 'important');
        }
    }

    function setupVLibrasFix() {
        // Executa imediatamente
        fixVLibrasPosition();
        
        // Repete periodicamente para garantir posicionamento
        setInterval(fixVLibrasPosition, 500);
        
        // Observa mudanças no DOM
        const observer = new MutationObserver(fixVLibrasPosition);
        const vwContainer = document.querySelector('div[vw]');
        if (vwContainer) {
            observer.observe(vwContainer, { 
                attributes: true, 
                attributeFilter: ['style', 'class'],
                subtree: true 
            });
        }
    }

    function setupAccessibilityOptions() {
        // Alto Contraste
        const contrastToggle = document.getElementById('contrast-toggle');
        if (contrastToggle) {
            contrastToggle.addEventListener('change', function() {
                document.body.classList.toggle('high-contrast', this.checked);
                localStorage.setItem('highContrast', this.checked);
            });
            // Restaurar estado
            if (localStorage.getItem('highContrast') === 'true') {
                contrastToggle.checked = true;
                document.body.classList.add('high-contrast');
            }
        }

        // Tamanho da Fonte
        const fontIncrease = document.getElementById('font-increase');
        const fontDecrease = document.getElementById('font-decrease');
        const fontReset = document.getElementById('font-reset');
        let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 100;
        
        document.documentElement.style.fontSize = currentFontSize + '%';

        if (fontIncrease) {
            fontIncrease.addEventListener('click', () => {
                if (currentFontSize < 150) {
                    currentFontSize += 10;
                    document.documentElement.style.fontSize = currentFontSize + '%';
                    localStorage.setItem('fontSize', currentFontSize);
                }
            });
        }

        if (fontDecrease) {
            fontDecrease.addEventListener('click', () => {
                if (currentFontSize > 80) {
                    currentFontSize -= 10;
                    document.documentElement.style.fontSize = currentFontSize + '%';
                    localStorage.setItem('fontSize', currentFontSize);
                }
            });
        }

        if (fontReset) {
            fontReset.addEventListener('click', () => {
                currentFontSize = 100;
                document.documentElement.style.fontSize = '100%';
                localStorage.setItem('fontSize', 100);
            });
        }

        // Modo Escuro
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', function() {
                document.body.classList.toggle('dark-mode', this.checked);
                document.body.classList.toggle('light-mode', !this.checked);
                localStorage.setItem('darkMode', this.checked);
            });
            // Restaurar estado
            if (localStorage.getItem('darkMode') === 'true') {
                darkModeToggle.checked = true;
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
            }
        }
    }

    return { init };
})();

// Inicializa quando o EventBus avisar que o componente está pronto
if (window.EventBus) {
    window.EventBus.on('module:accessibility-v2-container:ready', () => {
        window.AccessibilityModule.init();
    });
}

// Fallback: inicializa após DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.AccessibilityModule) {
            window.AccessibilityModule.init();
        }
    }, 1000);
});
