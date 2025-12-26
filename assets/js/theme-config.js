/**
 * THEME-CONFIG.JS
 * Configuração Global do Tailwind CSS (Runtime)
 * ----------------------------------------------------------------------
 * IMPORTANTE: Este arquivo DEVE ser carregado no <head>, ANTES do script
 * do Tailwind CDN (https://cdn.tailwindcss.com).
 * * Ele garante que as classes utilitárias (ex: text-nurse-primary) usem
 * a mesma paleta de cores definida no seu global.css.
 */

window.tailwind = {
    config: {
        // Habilita dark mode via classe 'dark' no body/html
        darkMode: 'class', 
        theme: {
            extend: {
                // 1. Fontes
                fontFamily: {
                    nunito: ['"Nunito Sans"', 'sans-serif'], // Títulos
                    inter: ['Inter', 'sans-serif'],           // Corpo
                },
                
                // 2. Cores da Marca (Sincronizadas com global.css)
                colors: {
                    'nurse-primary': '#1A3E74',       // Azul Institucional
                    'nurse-primary-light': '#2E5A9C', // Azul Claro
                    'nurse-secondary': '#00bcd4',     // Ciano (Destaque)
                    'nurse-accent': '#D4AF37',        // Dourado
                    
                    // Cores de Fundo Específicas
                    'nurse-bgDark': '#0F172A',        // Slate 900 (Fundo Dark Mode)
                    'nurse-bgLight': '#f8fafc',       // Slate 50 (Fundo Light Mode)
                },
                
                // 3. Configurações de Container
                container: {
                    center: true,
                    padding: '1rem',
                },
                
                // 4. Extensões de Z-Index (Alinhado com global.css)
                zIndex: {
                    '60': '60',
                    '70': '70',
                    'header': '500',
                    'overlay': '900',
                    'modal': '1000',
                }
            }
        }
    }
};