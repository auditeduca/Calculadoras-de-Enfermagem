/**
 * MÓDULO DE NOTIFICAÇÕES
 */

window.NOTIFICATION_MODULE = {
    
    // Configuração
    config: {
        duration: 4000,
        maxNotifications: 5
    },
    
    // Estado
    state: {
        container: null,
        notifications: []
    },
    
    /**
     * Inicializar módulo
     */
    init() {
        // Criar container se não existir
        this.createContainer();
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
            container.className = 'fixed top-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none';
            
            document.body.appendChild(container);
        }
        
        this.state.container = container;
    },
    
    /**
     * Mostrar notificação
     */
    show(message, type = 'info') {
        // Limitar número de notificações
        this.cleanup();
        
        // Criar notificação
        const notification = this.createNotification(message, type);
        
        // Adicionar ao container
        this.state.container.appendChild(notification);
        this.state.notifications.push({
            element: notification,
            timeout: null
        });
        
        // Configurar auto-remover
        const timeout = setTimeout(() => {
            this.remove(notification);
        }, this.config.duration);
        
        // Armazenar timeout
        const notifIndex = this.state.notifications.findIndex(n => n.element === notification);
        if (notifIndex !== -1) {
            this.state.notifications[notifIndex].timeout = timeout;
        }
        
        return notification;
    },
    
    /**
     * Criar elemento de notificação
     */
    createNotification(message, type) {
        const typeConfig = {
            success: { icon: 'circle-check', color: 'bg-green-500' },
            error: { icon: 'exclamation-triangle', color: 'bg-red-500' },
            warning: { icon: 'exclamation-circle', color: 'bg-yellow-500' },
            info: { icon: 'circle-info', color: 'bg-blue-500' }
        }[type] || { icon: 'circle-info', color: 'bg-blue-500' };
        
        const notification = document.createElement('div');
        notification.className = `toast-msg ${typeConfig.color}`;
        
        notification.innerHTML = `
            <i class="fa-solid fa-${typeConfig.icon} text-white"></i>
            <span>${message}</span>
        `;
        
        return notification;
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
        }, 300);
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
    success(message) {
        return this.show(message, 'success');
    },
    
    /**
     * Mostrar notificação de erro
     */
    error(message) {
        return this.show(message, 'error');
    },
    
    /**
     * Mostrar notificação de aviso
     */
    warning(message) {
        return this.show(message, 'warning');
    }
};

// Inicializar automaticamente
document.addEventListener('DOMContentLoaded', () => {
    window.NOTIFICATION_MODULE.init();
});