/**
 * MÓDULO DE NOTIFICAÇÕES
 * Sistema de toast notifications
 */

window.NOTIFICATION_MODULE = {
    
    // Configuração
    config: {
        position: 'top-right',
        duration: 4000,
        maxNotifications: 5,
        animation: 'slide-in',
        types: {
            success: { icon: 'circle-check', color: 'bg-green-500' },
            error: { icon: 'exclamation-triangle', color: 'bg-red-500' },
            warning: { icon: 'exclamation-circle', color: 'bg-yellow-500' },
            info: { icon: 'circle-info', color: 'bg-blue-500' }
        }
    },
    
    // Estado
    state: {
        container: null,
        notifications: [],
        isInitialized: false
    },
    
    /**
     * Inicializar módulo
     */
    init() {
        // Criar container se não existir
        this.createContainer();
        
        // Configurar estilos
        this.setupStyles();
        
        this.state.isInitialized = true;
        console.log('🔔 Módulo de notificações inicializado');
    },
    
    /**
     * Criar container de notificações
     */
    createContainer() {
        let container = document.getElementById('notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = `fixed z-[10000] flex flex-col gap-3 pointer-events-none ${this.getPositionClasses()}`;
            
            document.body.appendChild(container);
        }
        
        this.state.container = container;
    },
    
    /**
     * Obter classes CSS para posição
     */
    getPositionClasses() {
        switch (this.config.position) {
            case 'top-left':
                return 'top-6 left-6';
            case 'top-center':
                return 'top-6 left-1/2 transform -translate-x-1/2';
            case 'top-right':
                return 'top-6 right-6';
            case 'bottom-left':
                return 'bottom-6 left-6';
            case 'bottom-center':
                return 'bottom-6 left-1/2 transform -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-6 right-6';
            default:
                return 'top-6 right-6';
        }
    },
    
    /**
     * Configurar estilos CSS
     */
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-toast {
                pointer-events: auto;
                animation-duration: 0.4s;
                animation-fill-mode: forwards;
                min-width: 320px;
                max-width: 400px;
            }
            
            .notification-slide-in {
                animation-name: notificationSlideIn;
            }
            
            .notification-fade-in {
                animation-name: notificationFadeIn;
            }
            
            .notification-slide-up {
                animation-name: notificationSlideUp;
            }
            
            @keyframes notificationSlideIn {
                from {
                    transform: translateX(120%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes notificationFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes notificationSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes notificationProgress {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }
        `;
        
        document.head.appendChild(style);
    },
    
    /**
     * Mostrar notificação
     */
    show(message, type = 'info', options = {}) {
        if (!this.state.isInitialized) {
            this.init();
        }
        
        // Limitar número de notificações
        this.cleanup();
        
        // Criar notificação
        const notification = this.createNotification(message, type, options);
        
        // Adicionar ao container
        this.state.container.appendChild(notification);
        this.state.notifications.push({
            element: notification,
            timeout: null
        });
        
        // Configurar auto-remover
        const duration = options.duration || this.config.duration;
        if (duration > 0) {
            const timeout = setTimeout(() => {
                this.remove(notification);
            }, duration);
            
            // Armazenar timeout para possível cancelamento
            const notifIndex = this.state.notifications.findIndex(n => n.element === notification);
            if (notifIndex !== -1) {
                this.state.notifications[notifIndex].timeout = timeout;
            }
        }
        
        // Disparar evento
        this.dispatchEvent('shown', { message, type, element: notification });
        
        return notification;
    },
    
    /**
     * Criar elemento de notificação
     */
    createNotification(message, type, options) {
        const typeConfig = this.config.types[type] || this.config.types.info;
        const animationClass = `notification-${this.config.animation}`;
        
        const notification = document.createElement('div');
        notification.className = `notification-toast ${animationClass} bg-slate-900 text-white rounded-2xl shadow-2xl flex overflow-hidden border-l-4 ${typeConfig.color}`;
        
        // Ícone
        const iconHTML = `
            <div class="flex items-center justify-center w-16 ${typeConfig.color}">
                <i class="fa-solid fa-${typeConfig.icon} text-white text-xl"></i>
            </div>
        `;
        
        // Conteúdo
        const contentHTML = `
            <div class="flex-grow p-4">
                <div class="font-bold text-sm mb-1">${this.getTypeTitle(type)}</div>
                <div class="text-sm opacity-90">${message}</div>
            </div>
        `;
        
        // Botão de fechar
        const closeHTML = `
            <button onclick="NOTIFICATION_MODULE.remove(this.parentNode)" 
                    class="self-start p-3 text-white/70 hover:text-white transition-colors">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        
        notification.innerHTML = iconHTML + contentHTML + closeHTML;
        
        // Barra de progresso se for temporária
        if (options.duration !== 0) {
            const duration = options.duration || this.config.duration;
            const progressBar = document.createElement('div');
            progressBar.className = 'h-1 bg-white/30 absolute bottom-0 left-0 right-0';
            progressBar.style.animation = `notificationProgress ${duration}ms linear forwards`;
            notification.appendChild(progressBar);
        }
        
        // Adicionar classes customizadas
        if (options.className) {
            notification.classList.add(...options.className.split(' '));
        }
        
        return notification;
    },
    
    /**
     * Obter título do tipo
     */
    getTypeTitle(type) {
        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Aviso',
            info: 'Informação'
        };
        
        return titles[type] || 'Notificação';
    },
    
    /**
     * Remover notificação
     */
    remove(notificationElement) {
        if (!notificationElement || !notificationElement.parentNode) return;
        
        // Encontrar no array de notificações
        const notifIndex = this.state.notifications.findIndex(n => n.element === notificationElement);
        if (notifIndex !== -1) {
            // Limpar timeout se existir
            if (this.state.notifications[notifIndex].timeout) {
                clearTimeout(this.state.notifications[notifIndex].timeout);
            }
            
            // Remover do array
            this.state.notifications.splice(notifIndex, 1);
        }
        
        // Animação de saída
        notificationElement.style.opacity = '0';
        notificationElement.style.transform = 'translateX(50px)';
        
        // Remover após animação
        setTimeout(() => {
            if (notificationElement.parentNode === this.state.container) {
                this.state.container.removeChild(notificationElement);
            }
            
            // Disparar evento
            this.dispatchEvent('removed', { element: notificationElement });
        }, 300);
    },
    
    /**
     * Remover todas as notificações
     */
    clearAll() {
        this.state.notifications.forEach(notif => {
            if (notif.timeout) {
                clearTimeout(notif.timeout);
            }
            
            if (notif.element.parentNode === this.state.container) {
                this.state.container.removeChild(notif.element);
            }
        });
        
        this.state.notifications = [];
        this.dispatchEvent('cleared');
    },
    
    /**
     * Limpar notificações antigas
     */
    cleanup() {
        // Remover notificações além do limite
        if (this.state.notifications.length >= this.config.maxNotifications) {
            const toRemove = this.state.notifications.slice(0, this.state.notifications.length - this.config.maxNotifications + 1);
            
            toRemove.forEach(notif => {
                this.remove(notif.element);
            });
        }
    },
    
    /**
     * Mostrar notificação de sucesso
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    },
    
    /**
     * Mostrar notificação de erro
     */
    error(message, options = {}) {
        return this.show(message, 'error', options);
    },
    
    /**
     * Mostrar notificação de aviso
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    },
    
    /**
     * Mostrar notificação de informação
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    },
    
    /**
     * Alterar configurações
     */
    setSettings(settings) {
        Object.assign(this.config, settings);
        
        // Atualizar container se a posição mudou
        if (settings.position && this.state.container) {
            this.state.container.className = `fixed z-[10000] flex flex-col gap-3 pointer-events-none ${this.getPositionClasses()}`;
        }
    },
    
    /**
     * Disparar evento personalizado
     */
    dispatchEvent(name, detail = {}) {
        const event = new CustomEvent(`notification:${name}`, { detail });
        window.dispatchEvent(event);
    }
};

// Inicializar automaticamente
document.addEventListener('DOMContentLoaded', () => {
    if (!window.NOTIFICATION_MODULE.state.isInitialized) {
        window.NOTIFICATION_MODULE.init();
    }
});