/**
 * UTILS.JS - Biblioteca de utilitários globais
 * Contém funções auxiliares para manipulação de DOM, cálculos, animações e armazenamento.
 */

const Utils = {
    // --- FUNÇÕES DE CONTROLE DE FLUXO ---
    
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // --- CÁLCULOS E FORMATAÇÃO ---

    formatNumber: function(number, decimals = 2) {
        return parseFloat(number).toFixed(decimals);
    },

    calculateBMI: function(weight, height) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return {
            value: this.formatNumber(bmi, 1),
            classification: this.getBMIClassification(bmi)
        };
    },

    getBMIClassification: function(bmi) {
        if (bmi < 18.5) return { text: 'Abaixo do peso', color: '#3B82F6' };
        if (bmi < 25) return { text: 'Peso normal', color: '#10B981' };
        if (bmi < 30) return { text: 'Sobrepeso', color: '#F59E0B' };
        if (bmi < 35) return { text: 'Obesidade grau I', color: '#EF4444' };
        if (bmi < 40) return { text: 'Obesidade grau II', color: '#DC2626' };
        return { text: 'Obesidade grau III', color: '#7F1D1D' };
    },

    calculateBSA: function(weight, height) {
        const bsa = Math.sqrt((height * weight) / 3600);
        return this.formatNumber(bsa, 2);
    },

    calculateDripRate: function(volume, time, dripFactor) {
        const timeInMinutes = time * 60;
        const dripRate = (volume * dripFactor) / timeInMinutes;
        return Math.round(dripRate);
    },

    calculateDosage: function(totalDose, weight, dosePerKg) {
        const calculatedDose = weight * dosePerKg;
        const finalDose = Math.min(calculatedDose, totalDose);
        return this.formatNumber(finalDose, 2);
    },

    // --- VALIDAÇÃO E SEGURANÇA ---

    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    sanitizeHTML: function(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * [NOVO] Injeta conteúdo HTML em um elemento alvo.
     * Corrige o erro: "Utils.injectComponent is not a function"
     * @param {string} targetId - O ID do elemento onde o conteúdo será inserido.
     * @param {string} content - O conteúdo HTML a ser inserido.
     */
    injectComponent: function(targetId, content) {
        const element = document.getElementById(targetId);
        if (element) {
            element.innerHTML = content;
            return true;
        } else {
            console.warn(`[Utils] injectComponent falhou: Elemento #${targetId} não encontrado.`);
            return false;
        }
    },

    // --- ARMAZENAMENTO (LOCALSTORAGE) ---

    storage: {
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Error saving to localStorage:', e);
                return false;
            }
        },

        get: function(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Error reading from localStorage:', e);
                return defaultValue;
            }
        },

        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Error removing from localStorage:', e);
                return false;
            }
        },

        clear: function() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Error clearing localStorage:', e);
                return false;
            }
        }
    },

    // --- COOKIES ---

    cookies: {
        set: function(name, value, days = 30) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        },

        get: function(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },

        delete: function(name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
    },

    // --- ANIMAÇÕES ---

    animate: {
        fadeIn: function(element, duration = 300) {
            if (!element) return;
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        },

        fadeOut: function(element, duration = 300) {
            if (!element) return;
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '0';
            });
        },

        slideDown: function(element, duration = 300) {
            if (!element) return;
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease-in-out`;
            
            const height = element.scrollHeight;
            element.style.height = height + 'px';
            
            setTimeout(() => {
                element.style.height = '';
                element.style.overflow = '';
            }, duration);
        },

        slideUp: function(element, duration = 300) {
            if (!element) return;
            const height = element.scrollHeight;
            element.style.height = height + 'px';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.height = '0';
            });
            
            setTimeout(() => {
                element.style.height = '';
                element.style.overflow = '';
            }, duration);
        },

        scaleIn: function(element, duration = 300) {
            if (!element) return;
            element.style.transform = 'scale(0.8)';
            element.style.opacity = '0';
            element.style.transition = `all ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
            });
        },

        scaleOut: function(element, duration = 300) {
            if (!element) return;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
            element.style.transition = `all ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.transform = 'scale(0.8)';
                element.style.opacity = '0';
            });
        },

        slideInRight: function(element, duration = 300) {
            if (!element) return;
            element.style.transform = 'translateX(100%)';
            element.style.opacity = '0';
            element.style.transition = `all ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.transform = 'translateX(0)';
                element.style.opacity = '1';
            });
        },

        slideOutRight: function(element, duration = 300) {
            if (!element) return;
            element.style.transform = 'translateX(0)';
            element.style.opacity = '1';
            element.style.transition = `all ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.transform = 'translateX(100%)';
                element.style.opacity = '0';
            });
        }
    },

    // --- URL E NAVEGAÇÃO ---

    url: {
        getParameter: function(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        },

        setParameter: function(name, value) {
            const url = new URL(window.location);
            url.searchParams.set(name, value);
            window.history.pushState({}, '', url);
        },

        removeParameter: function(name) {
            const url = new URL(window.location);
            url.searchParams.delete(name);
            window.history.pushState({}, '', url);
        }
    },

    // --- DATAS ---

    date: {
        format: function(date, format = 'DD/MM/YYYY') {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            
            return format
                .replace('DD', day)
                .replace('MM', month)
                .replace('YYYY', year);
        },

        addDays: function(date, days) {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        },

        formatTime: function(date, format = 'HH:mm') {
            const d = new Date(date);
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            
            return format
                .replace('HH', hours)
                .replace('mm', minutes);
        },

        formatDateTime: function(date, format = 'DD/MM/YYYY HH:mm') {
            return `${this.format(date, format.split(' ')[0])} ${this.formatTime(date, format.split(' ')[1])}`;
        }
    },

    // --- ARRAYS ---

    array: {
        unique: function(array) {
            return [...new Set(array)];
        },

        chunk: function(array, size) {
            const chunks = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        },

        shuffle: function(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        groupBy: function(array, key) {
            return array.reduce((groups, item) => {
                const group = item[key];
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
            }, {});
        },

        sortBy: function(array, key, direction = 'asc') {
            return [...array].sort((a, b) => {
                const aVal = a[key];
                const bVal = b[key];
                
                if (direction === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
        }
    },

    // --- DOM HELPER ---

    dom: {
        createElement: function(tag, className = '', innerHTML = '') {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (innerHTML) element.innerHTML = innerHTML;
            return element;
        },

        removeClass: function(element, className) {
            if(element) element.classList.remove(className);
        },

        addClass: function(element, className) {
            if(element) element.classList.add(className);
        },

        toggleClass: function(element, className) {
            if(element) element.classList.toggle(className);
        },

        hasClass: function(element, className) {
            return element && element.classList.contains(className);
        },

        safeCreate: function(tag, textContent = '', className = '') {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (textContent) element.textContent = Utils.sanitizeHTML(textContent);
            return element;
        },

        byId: function(id) {
            const element = document.getElementById(id);
            if (!element) {
                // Silenciado para não poluir log, use apenas em debug se necessário
                // console.warn(`Element with ID '${id}' not found`);
            }
            return element;
        },

        all: function(selector, parent = document) {
            return Array.from(parent.querySelectorAll(selector));
        },

        exists: function(element) {
            return element && element.nodeType === Node.ELEMENT_NODE;
        },

        scrollTo: function(element, offset = 0) {
            if (element && element.scrollIntoView) {
                const elementPosition = element.offsetTop - offset;
                window.scrollTo({
                    top: elementPosition,
                    behavior: 'smooth'
                });
            }
        },

        focusFirst: function(container) {
            if(!container) return;
            const focusableElements = container.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        },

        trapFocus: function(container) {
            if(!container) return;
            const focusableElements = container.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            container.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });
        }
    },

    // --- MATEMÁTICA E CONVERSÕES ---

    math: {
        clamp: function(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },

        roundToDecimal: function(number, decimals = 2) {
            return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
        },

        convertUnits: {
            kgToLbs: function(kg) { return kg * 2.20462; },
            lbsToKg: function(lbs) { return lbs / 2.20462; },
            cmToInches: function(cm) { return cm / 2.54; },
            inchesToCm: function(inches) { return inches * 2.54; },
            mlToOunces: function(ml) { return ml / 29.5735; },
            ouncesToMl: function(ounces) { return ounces * 29.5735; },
            celsiusToFahrenheit: function(celsius) { return (celsius * 9/5) + 32; },
            fahrenheitToCelsius: function(fahrenheit) { return (fahrenheit - 32) * 5/9; }
        },

        calculatePercentage: function(value, total) {
            if (total === 0) return 0;
            return Math.round((value / total) * 100);
        },

        generateRandomId: function(length = 8) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
    },

    // --- ACESSIBILIDADE ---

    accessibility: {
        announce: function(message, priority = 'polite') {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', priority);
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                if (document.body.contains(announcement)) {
                    document.body.removeChild(announcement);
                }
            }, 1000);
        },

        // Redundância de trapFocus para compatibilidade
        trapFocus: function(container) {
            return Utils.dom.trapFocus(container);
        },

        handleKeyboardNav: function(e, callback) {
            const keyHandlers = {
                'Enter': () => callback('enter'),
                ' ': () => callback('space'),
                'ArrowUp': () => callback('up'),
                'ArrowDown': () => callback('down'),
                'ArrowLeft': () => callback('left'),
                'ArrowRight': () => callback('right'),
                'Escape': () => callback('escape')
            };

            if (keyHandlers[e.key]) {
                e.preventDefault();
                keyHandlers[e.key]();
            }
        },

        prefersReducedMotion: function() {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        },

        prefersHighContrast: function() {
            return window.matchMedia('(prefers-contrast: high)').matches;
        }
    },

    // --- PERFORMANCE ---

    performance: {
        measure: function(fn, label = 'Function') {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`${label} took ${end - start} milliseconds`);
            return result;
        },

        lazyLoadImages: function() {
            const images = document.querySelectorAll('img[data-src]');
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    });
                });
                images.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback para navegadores antigos
                images.forEach(img => {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                });
            }
        },

        debouncedResize: function(callback, delay = 250) {
            let resizeTimeout;
            return function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(callback, delay);
            };
        }
    },

    // --- ERROS ---

    error: {
        handle: function(error, context = 'Unknown') {
            console.error(`Error in ${context}:`, error);
            
            if (window.gtag) {
                window.gtag('event', 'exception', {
                    description: error.message,
                    fatal: false,
                    custom_map: { context: context }
                });
            }
        },

        showUserMessage: function(message, type = 'error') {
            const existing = document.querySelectorAll('.user-feedback');
            existing.forEach(el => el.remove());

            const feedback = document.createElement('div');
            feedback.className = `user-feedback ${type}`;
            feedback.innerHTML = `
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>
                ${Utils.sanitizeHTML(message)}
            `;
            
            document.body.appendChild(feedback);
            
            setTimeout(() => {
                if(document.body.contains(feedback)) feedback.remove();
            }, 5000);
        }
    },

    // --- MODAIS ---

    modal: {
        isOpen: function(modal) {
            return modal && (modal.classList.contains('show') || modal.classList.contains('open'));
        },

        getOpenModals: function() {
            return document.querySelectorAll('.modal.show, .accessibility-menu.open');
        },

        closeAll: function() {
            const openModals = this.getOpenModals();
            openModals.forEach(modal => this.close(modal, null)); // Fecha sem animação para ser rápido
        },

        open: function(modal, animation = 'fadeIn') {
            if (!modal) return;
            
            if (modal.id === 'accessibility-menu') {
                modal.classList.add('open');
                modal.setAttribute('aria-hidden', 'false');
            } else {
                modal.classList.add('show');
                modal.setAttribute('aria-hidden', 'false');
                if (animation && Utils.animate[animation]) {
                    Utils.animate[animation](modal);
                }
            }
        },

        close: function(modal, animation = 'fadeOut') {
            if (!modal) return;

            if (modal.id === 'accessibility-menu') {
                modal.classList.remove('open');
                modal.setAttribute('aria-hidden', 'true');
            } else {
                if (animation && Utils.animate[animation]) {
                    Utils.animate[animation](modal);
                    setTimeout(() => {
                        modal.classList.remove('show');
                        modal.setAttribute('aria-hidden', 'true');
                    }, 300);
                } else {
                    modal.classList.remove('show');
                    modal.setAttribute('aria-hidden', 'true');
                }
            }
        }
    }
};

// Exportação universal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
window.Utils = Utils;