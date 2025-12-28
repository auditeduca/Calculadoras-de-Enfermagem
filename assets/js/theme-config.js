(function() {
    'use strict';
    const ThemeConfig = {
        STORAGE_KEY: 'theme_preference',
        DARK_CLASS: 'dark-theme',

        init: function() {
            const saved = localStorage.getItem(this.STORAGE_KEY) || 
                         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            this.applyTheme(saved);
        },

        applyTheme: function(theme) {
            const isDark = theme === 'dark';
            document.body.classList.toggle(this.DARK_CLASS, isDark);
            localStorage.setItem(this.STORAGE_KEY, theme);
            this.updateUI(isDark);
        },

        updateUI: function(isDark) {
            const icon = document.getElementById('theme-icon');
            const text = document.getElementById('theme-text');
            if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            if (text) text.innerText = isDark ? 'Modo Claro' : 'Modo Escuro';
        },

        toggle: function() {
            const current = localStorage.getItem(this.STORAGE_KEY) === 'dark' ? 'light' : 'dark';
            this.applyTheme(current);
        }
    };

    window.toggleTheme = () => ThemeConfig.toggle();
    ThemeConfig.init();
})();