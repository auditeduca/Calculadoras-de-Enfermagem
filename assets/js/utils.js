/**
 * UTILS.JS - Biblioteca de utilitários e cálculos
 */

const Utils = {
    // Cálculos de Enfermagem
    calculateBMI: (w, h) => {
        const bmi = w / ((h / 100) ** 2);
        const getStatus = (v) => {
            if (v < 18.5) return { text: 'Abaixo do peso', color: '#3B82F6' };
            if (v < 25) return { text: 'Peso normal', color: '#10B981' };
            if (v < 30) return { text: 'Sobrepeso', color: '#F59E0B' };
            return { text: 'Obesidade', color: '#EF4444' };
        };
        return { value: bmi.toFixed(1), classification: getStatus(bmi) };
    },

    calculateDripRate: (vol, time, factor) => Math.round((vol * factor) / (time * 60)),

    // DOM Helpers
    animate: {
        fadeIn: (el, dur = 300) => {
            el.style.opacity = '0';
            el.style.display = 'block';
            el.style.transition = `opacity ${dur}ms ease`;
            requestAnimationFrame(() => el.style.opacity = '1');
        },
        fadeOut: (el, dur = 300) => {
            el.style.opacity = '1';
            el.style.transition = `opacity ${dur}ms ease`;
            requestAnimationFrame(() => el.style.opacity = '0');
            setTimeout(() => el.style.display = 'none', dur);
        }
    },

    // Acessibilidade
    accessibility: {
        trapFocus: (container) => {
            const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (!focusable.length) return;
            container.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;
                if (e.shiftKey && document.activeElement === focusable[0]) {
                    e.preventDefault(); focusable[focusable.length - 1].focus();
                } else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
                    e.preventDefault(); focusable[0].focus();
                }
            });
        }
    }
};

window.Utils = Utils;