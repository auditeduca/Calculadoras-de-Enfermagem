/**
 * NOTIFICATIONS.JS - Sistema de Notificações
 * Gerencia alertas visuais e feedbacks de voz
 * * @author Calculadoras de Enfermagem
 * @version 2.0.2 (High Contrast & Positioning)
 */

class NotificationManager {
  constructor(options = {}) {
    this.container = null;
    this.createContainer();
  }

  createContainer() {
    // Garante que não duplica
    if(document.getElementById('notification-container')) {
        this.container = document.getElementById('notification-container');
        return;
    }
    
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    // Posição ajustada: top-24 para não ficar em cima do header sticky
    this.container.className = 'fixed top-24 right-4 md:right-8 z-[99999] flex flex-col gap-3 pointer-events-none w-full max-w-sm';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info') {
    if(!this.container) this.createContainer();

    const notif = document.createElement('div');
    // Cores de alto contraste e sombra forte
    const colors = {
        success: 'bg-emerald-600 text-white border-l-4 border-emerald-300',
        error: 'bg-red-600 text-white border-l-4 border-red-300',
        info: 'bg-blue-600 text-white border-l-4 border-blue-300'
    };
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    notif.className = `${colors[type]} p-4 rounded-lg shadow-2xl transform transition-all duration-300 translate-x-full opacity-0 flex items-center gap-3 pointer-events-auto cursor-pointer`;
    notif.innerHTML = `
        <i class="fa-solid ${icons[type]} text-xl"></i>
        <p class="font-bold text-sm shadow-black">${message}</p>
    `;

    this.container.appendChild(notif);

    // Animação de entrada
    requestAnimationFrame(() => {
        notif.classList.remove('translate-x-full', 'opacity-0');
    });

    // Som de feedback
    this.playSound(type);

    // Auto-remoção
    setTimeout(() => {
        notif.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notif.remove(), 300);
    }, 4000);
    
    // Clique para fechar
    notif.onclick = () => notif.remove();
  }

  success(msg) { this.show(msg, 'success'); }
  error(msg) { this.show(msg, 'error'); }
  info(msg) { this.show(msg, 'info'); }

  playSound(type) {
     // Implementação opcional de som beep
  }

  speak(text) {
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'pt-BR';
          window.speechSynthesis.speak(utterance);
      }
  }
}

window.NOTIFICATION_MANAGER = new NotificationManager();