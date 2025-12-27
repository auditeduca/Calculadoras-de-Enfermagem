/**
 * UTILS.JS - Biblioteca de utilitários globais
 * AUDITORIA 2025: Restaurado com funcionalidades originais + Segurança XSS + RenderCard Centralizado
 * Versão Unificada: 26/12/2025
 */

const Utils = {
    // ==========================================
    // 1. SEGURANÇA E SANITIZAÇÃO (NOVO & LEGADO)
    // ==========================================
    
    /**
     * [NOVO] Escapa caracteres perigosos para evitar XSS em inserções HTML.
     */
    escapeHTML: function(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    },

    /**
     * [NOVO] Injeta texto puro (textContent) de forma segura.
     */
    safeInjectText: function(elementId, text) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = text;
    },

    /**
     * [LEGADO] Remove tags HTML, retornando apenas o texto.
     * Útil para limpar input de usuário antes de processar.
     */
    sanitizeHTML: function(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * [LEGADO] Injeta conteúdo HTML em um elemento alvo.
     * ATENÇÃO: Use com cuidado. Para textos simples, prefira safeInjectText.
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

    // ==========================================
    // 2. RENDERIZAÇÃO CENTRALIZADA (NOVO)
    // ==========================================

    renderCard: function(tool, viewMode = 'grid') {
        const bgClass = tool.color === 'emerald' ? 'from-emerald-50 to-teal-50 hover:border-emerald-200' : 'from-blue-50 to-indigo-50 hover:border-blue-200';
        
        // Sanitização automática dos dados antes de renderizar HTML
        const safeName = this.escapeHTML(tool.name);
        const safeDesc = this.escapeHTML(tool.description);
        const safeCat = this.escapeHTML(tool.category);
        const safeLink = this.escapeHTML(tool.filename);
        const safeIcon = this.escapeHTML(tool.icon);

        if (viewMode === 'list') {
            return `
                <div class="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group hover:border-blue-300">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <i class="${safeIcon} text-xl"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900">${safeName}</h3>
                            <p class="text-sm text-gray-600">${safeCat}</p>
                            <p class="text-sm text-gray-500 mt-1">${safeDesc}</p>
                        </div>
                        <a href="${safeLink}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            Acessar
                        </a>
                    </div>
                </div>`;
        }
        
        return `
            <div class="bg-gradient-to-br ${bgClass} border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div class="text-4xl mb-4 text-gray-700 group-hover:scale-110 transition-transform">
                    <i class="${safeIcon}"></i>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">${safeName}</h3>
                <p class="text-sm text-gray-600 mb-3">${safeCat}</p>
                <p class="text-xs text-gray-600 mb-4 line-clamp-2 h-10">${safeDesc}</p>
                <a href="${safeLink}" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors w-full text-center font-medium">
                    Acessar Ferramenta
                </a>
            </div>`;
    },

    // ==========================================
    // 3. CONTROLE DE FLUXO
    // ==========================================
    
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

    // ==========================================
    // 4. CÁLCULOS E FÓRMULAS
    // ==========================================

    formatNumber: function(number, decimals = 2) {
        if (isNaN(number)) return "0.00";
        return parseFloat(number).toFixed(decimals);
    },

    calculateBMI: function(weight, height) {
        if (!weight || !height) return null;
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return {
            value: this.formatNumber(bmi, 1),
            classification: this.getBMIClassification(bmi)
        };
    },

    getBMIClassification: function(bmi) {
        // Lógica híbrida: mantendo cores do original e strings simples do novo para compatibilidade
        if (bmi < 18.5) return { text: 'Abaixo do peso', simple: 'Abaixo do peso', color: '#3B82F6' };
        if (bmi < 25) return { text: 'Peso normal', simple: 'Peso normal', color: '#10B981' };
        if (bmi < 30) return { text: 'Sobrepeso', simple: 'Sobrepeso', color: '#F59E0B' };
        if (bmi < 35) return { text: 'Obesidade grau I', simple: 'Obesidade', color: '#EF4444' };
        if (bmi < 40) return { text: 'Obesidade grau II', simple: 'Obesidade', color: '#DC2626' };
        return { text: 'Obesidade grau III', simple: 'Obesidade', color: '#7F1D1D' };
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

    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // ==========================================
    // 5. ARMAZENAMENTO (LOCALSTORAGE & COOKIES)
    // ==========================================

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

    // ==========================================
    // 6. ANIMAÇÕES (SISTEMA COMPLETO)
    // ==========================================

    animate: {
        fadeIn: function(element, duration = 300) {
            if (!element) return;
            element.style.display = 'block'; // Garante visibilidade
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            requestAnimationFrame(() => { element.style.opacity = '1'; });
        },

        fadeOut: function(element, duration = 300) {
            if (!element) return;
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            requestAnimationFrame(() => { element.style.opacity = '0'; });
            setTimeout(() => { element.style.display = 'none'; }, duration);
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
            requestAnimationFrame(() => { element.style.height = '0'; });
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

    // ==========================================
    // 7. URL, DATAS E ARRAYS (HELPERS)
    // ==========================================

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

    date: {
        format: function(date, format = 'DD/MM/YYYY') {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return format.replace('DD', day).replace('MM', month).replace('YYYY', year);
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
            return format.replace('HH', hours).replace('mm', minutes);
        },
        formatDateTime: function(date, format = 'DD/MM/YYYY HH:mm') {
            return `${this.format(date, format.split(' ')[0])} ${this.formatTime(date, format.split(' ')[1])}`;
        }
    },

    array: {
        unique: function(array) { return [...new Set(array)]; },
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
                if (direction === 'desc') return bVal > aVal ? 1 : -1;
                return aVal > bVal ? 1 : -1;
            });
        }
    },

    // ==========================================
    // 8. DOM E ACESSIBILIDADE
    // ==========================================

    dom: {
        byId: function(id) { return document.getElementById(id); },
        all: function(selector, parent = document) { return Array.from(parent.querySelectorAll(selector)); },
        exists: function(element) { return element && element.nodeType === Node.ELEMENT_NODE; },
        
        addClass: function(element, className) { if(element) element.classList.add(className); },
        removeClass: function(element, className) { if(element) element.classList.remove(className); },
        toggleClass: function(element, className) { if(element) element.classList.toggle(className); },
        hasClass: function(element, className) { return element && element.classList.contains(className); },

        createElement: function(tag, className = '', innerHTML = '') {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (innerHTML) element.innerHTML = innerHTML;
            return element;
        },
        safeCreate: function(tag, textContent = '', className = '') {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (textContent) element.textContent = Utils.sanitizeHTML(textContent);
            return element;
        },
        scrollTo: function(element, offset = 0) {
            if (element && element.scrollIntoView) {
                const elementPosition = element.offsetTop - offset;
                window.scrollTo({ top: elementPosition, behavior: 'smooth' });
            }
        },
        focusFirst: function(container) {
            if(!container) return;
            const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) focusableElements[0].focus();
        },
        trapFocus: function(container) {
            if(!container) return;
            const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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

    accessibility: {
        announce: function(message, priority = 'polite') {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', priority);
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            setTimeout(() => { if (document.body.contains(announcement)) document.body.removeChild(announcement); }, 1000);
        },
        trapFocus: function(container) { return Utils.dom.trapFocus(container); },
        prefersReducedMotion: function() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    },

    // ==========================================
    // 9. MODAIS (SISTEMA HÍBRIDO)
    // ==========================================

    /**
     * [NOVO] Atalho simplificado para abrir/fechar modais.
     * Usa internamente o sistema robusto de `Utils.modal`.
     */
    toggleModal: function(modalId, action = 'toggle') {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Verifica se está visível (suporta 'show' ou 'open' para compatibilidade)
        const isVisible = Utils.modal.isOpen(modal);

        if (action === 'open' || (action === 'toggle' && !isVisible)) {
            Utils.modal.open(modal);
        } else {
            Utils.modal.close(modal);
        }
    },

    /**
     * [LEGADO] Sistema completo de controle de modais
     */
    modal: {
        isOpen: function(modal) {
            return modal && (modal.classList.contains('show') || modal.classList.contains('open'));
        },
        getOpenModals: function() {
            return document.querySelectorAll('.modal.show, .accessibility-menu.open');
        },
        closeAll: function() {
            const openModals = this.getOpenModals();
            openModals.forEach(modal => this.close(modal, null));
        },
        open: function(modal, animation = 'fadeIn') {
            if (!modal) return;
            const activeClass = (modal.id === 'accessibility-menu') ? 'open' : 'show';
            
            modal.classList.add(activeClass);
            modal.setAttribute('aria-hidden', 'false');
            
            if (animation && Utils.animate[animation]) {
                Utils.animate[animation](modal);
            }
        },
        close: function(modal, animation = 'fadeOut') {
            if (!modal) return;
            const activeClass = (modal.id === 'accessibility-menu') ? 'open' : 'show';

            if (animation && Utils.animate[animation]) {
                Utils.animate[animation](modal);
                setTimeout(() => {
                    modal.classList.remove(activeClass);
                    modal.setAttribute('aria-hidden', 'true');
                }, 300);
            } else {
                modal.classList.remove(activeClass);
                modal.setAttribute('aria-hidden', 'true');
            }
        }
    },

    // ==========================================
    // 10. MATH E PERFORMANCE (LEGADO)
    // ==========================================

    math: {
        clamp: function(value, min, max) { return Math.min(Math.max(value, min), max); },
        roundToDecimal: function(number, decimals = 2) {
            return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
        },
        convertUnits: {
            kgToLbs: function(kg) { return kg * 2.20462; },
            lbsToKg: function(lbs) { return lbs / 2.20462; },
            cmToInches: function(cm) { return cm / 2.54; },
            inchesToCm: function(inches) { return inches * 2.54; },
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
            for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
            return result;
        }
    },

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

    error: {
        handle: function(error, context = 'Unknown') {
            console.error(`Error in ${context}:`, error);
        },
        showUserMessage: function(message, type = 'error') {
            const existing = document.querySelectorAll('.user-feedback');
            existing.forEach(el => el.remove());
            const feedback = document.createElement('div');
            feedback.className = `user-feedback ${type}`;
            feedback.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i> ${Utils.escapeHTML(message)}`;
            document.body.appendChild(feedback);
            setTimeout(() => { if(document.body.contains(feedback)) feedback.remove(); }, 5000);
        }
    }
};

// Exportação universal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
window.Utils = Utils;