// ============================================
// SISTEMA DE UTILITÁRIOS GLOBAIS
// ============================================

const SystemUtils = {
    // Carregar módulo HTML
    async loadModule(containerId, url) {
        const container = document.getElementById(containerId);
        if (!container) return false;
        
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            
            container.innerHTML = await res.text();
            container.style.opacity = "1";
            
            // Disparar evento para scripts que dependem do conteúdo
            const event = new CustomEvent('moduleLoaded', { 
                detail: { id: containerId, url } 
            });
            container.dispatchEvent(event);
            
            return true;
        } catch(e) { 
            console.warn(`Módulo ${containerId} não carregado:`, e);
            return false;
        }
    },

    // Sanitizar HTML para prevenir XSS
    sanitizeHTML: function(html) {
        if (!html) return '';
        
        // Método básico (implementação segura)
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, 'data-removed=')
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    },

    // Sistema de notificações
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast-msg ${
            type === 'success' ? 'border-green-500' : 
            type === 'error' ? 'border-red-500' : 
            'border-nurse-secondary'
        } ${type === 'warning' ? 'warning' : ''}`;
        
        toast.innerHTML = `
            <i class="fa-solid ${
                type === 'success' ? 'fa-check-circle text-green-500' : 
                type === 'error' ? 'fa-exclamation-circle text-red-500' : 
                type === 'warning' ? 'fa-exclamation-triangle text-yellow-500' : 
                'fa-circle-info text-nurse-secondary'
            }"></i>
            <span>${this.sanitizeHTML(message)}</span>
        `;
        
        container.appendChild(toast);
        
        // Remover após 4 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    },

    // Gerenciamento de modais
    showModal(title, content, icon = 'fa-info-circle') {
        const modal = document.getElementById('generic-modal');
        if (!modal) return;
        
        document.getElementById('modal-icon').className = `fa-solid ${icon} text-2xl`;
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-content').innerHTML = this.sanitizeHTML(content);
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        const modal = document.getElementById('generic-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    // Copiar texto para clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copiado para a área de transferência!', 'success');
            return true;
        } catch (error) {
            console.error('Erro ao copiar:', error);
            this.showNotification('Erro ao copiar', 'error');
            return false;
        }
    },

    // Compartilhamento em redes sociais
    shareOnSocial(platform, url = window.location.href, title = document.title) {
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        const encodedText = encodeURIComponent("Confira esta calculadora profissional de enfermagem!");
        
        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
        };
        
        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400,noopener,noreferrer');
            return true;
        }
        return false;
    },

    // Validação de data
    validateDate(input) {
        const selectedDate = new Date(input.value);
        const today = new Date();
        
        if (selectedDate > today) {
            this.showNotification('Data de nascimento não pode ser no futuro', 'error');
            input.value = today.toISOString().split('T')[0];
            return false;
        }
        return true;
    },

    // Formatação de números
    formatNumber(num, decimals = 2) {
        if (isNaN(num)) return '0,00';
        return parseFloat(num).toFixed(decimals).replace('.', ',');
    },

    // Carregar CSS dinamicamente
    loadCSS(url) {
        return new Promise((resolve, reject) => {
            // Verificar se já está carregado
            if (document.querySelector(`link[href="${url}"]`)) {
                resolve();
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    },

    // Carregar JS dinamicamente
    loadJS(url) {
        return new Promise((resolve, reject) => {
            // Verificar se já está carregado
            if (document.querySelector(`script[src="${url}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
};

// Exportar para uso global
window.SystemUtils = SystemUtils;