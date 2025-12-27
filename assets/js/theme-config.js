/**
 * THEME-CONFIG.JS
 * Configuração Global do Tailwind CSS (Runtime)
 * ----------------------------------------------------------------------
 * Carregado antes do Tailwind CDN para aplicar cores da marca.
 */

window.tailwind = {
    config: {
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