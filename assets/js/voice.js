/**
 * VOICE.JS - Sistema de Síntese de Voz e Acessibilidade
 * Gerencia leitura de texto, feedback auditivo e acessibilidade
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class VoiceManager {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.rate = options.rate || 0.9;
    this.pitch = options.pitch || 1;
    this.volume = options.volume || 0.7;
    this.language = options.language || 'pt-BR';
    this.currentUtterance = null;
    this.isSupported = 'speechSynthesis' in window;
    
    if (!this.isSupported) {
      console.warn('⚠️ Speech Synthesis não suportado neste navegador');
    }
  }

  /**
   * Falar texto
   */
  speak(text, options = {}) {
    if (!this.isSupported || !this.enabled) return;

    const {
      rate = this.rate,
      pitch = this.pitch,
      volume = this.volume,
      language = this.language,
      onEnd = null,
      onError = null
    } = options;

    // Cancelar fala anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = language;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    if (onError) {
      utterance.onerror = onError;
    }

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Pausar fala
   */
  pause() {
    if (this.isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * Retomar fala
   */
  resume() {
    if (this.isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * Parar fala
   */
  stop() {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Verificar se está falando
   */
  isSpeaking() {
    return this.isSupported && window.speechSynthesis.speaking;
  }

  /**
   * Habilitar/desabilitar voz
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Ler elemento HTML
   */
  readElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      this.speak(element.textContent);
    }
  }

  /**
   * Ler resultado de cálculo
   */
  readCalculationResult(result) {
    const text = `O resultado é ${result}`;
    this.speak(text);
  }

  /**
   * Ler notificação
   */
  readNotification(message, type = 'info') {
    const prefixes = {
      success: 'Sucesso! ',
      error: 'Erro! ',
      warning: 'Atenção! ',
      info: 'Informação: '
    };

    const fullMessage = (prefixes[type] || '') + message;
    this.speak(fullMessage);
  }

  /**
   * Ler instruções
   */
  readInstructions(text) {
    this.speak(text);
  }

  /**
   * Obter vozes disponíveis
   */
  getAvailableVoices() {
    if (!this.isSupported) return [];
    return window.speechSynthesis.getVoices();
  }

  /**
   * Definir voz
   */
  setVoice(voiceIndex) {
    const voices = this.getAvailableVoices();
    if (voices.length > voiceIndex) {
      if (this.currentUtterance) {
        this.currentUtterance.voice = voices[voiceIndex];
      }
    }
  }

  /**
   * Listar vozes em português
   */
  getPortugueseVoices() {
    const voices = this.getAvailableVoices();
    return voices.filter(voice => voice.lang.startsWith('pt'));
  }
}

/**
 * Accessibility Manager - Gerenciador de Acessibilidade
 */
class AccessibilityManager {
  constructor(options = {}) {
    this.voiceManager = options.voiceManager || new VoiceManager();
    this.announcer = this.createAnnouncer();
    this.focusTrap = null;
  }

  /**
   * Criar elemento anunciador para leitores de tela
   */
  createAnnouncer() {
    let announcer = document.getElementById('aria-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'aria-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }

    return announcer;
  }

  /**
   * Anunciar mensagem para leitores de tela
   */
  announce(message, priority = 'polite') {
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // Limpar após 1 segundo
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 1000);
  }

  /**
   * Anunciar resultado de cálculo
   */
  announceCalculationResult(result, unit = '') {
    const message = `Resultado: ${result} ${unit}`;
    this.announce(message, 'assertive');
    
    if (this.voiceManager.enabled) {
      this.voiceManager.readCalculationResult(`${result} ${unit}`);
    }
  }

  /**
   * Anunciar erro
   */
  announceError(message) {
    this.announce(`Erro: ${message}`, 'assertive');
    
    if (this.voiceManager.enabled) {
      this.voiceManager.readNotification(message, 'error');
    }
  }

  /**
   * Anunciar sucesso
   */
  announceSuccess(message) {
    this.announce(`Sucesso: ${message}`, 'polite');
    
    if (this.voiceManager.enabled) {
      this.voiceManager.readNotification(message, 'success');
    }
  }

  /**
   * Anunciar aviso
   */
  announceWarning(message) {
    this.announce(`Aviso: ${message}`, 'assertive');
    
    if (this.voiceManager.enabled) {
      this.voiceManager.readNotification(message, 'warning');
    }
  }

  /**
   * Definir labels ARIA
   */
  setAriaLabel(elementId, label) {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-label', label);
    }
  }

  /**
   * Definir descrição ARIA
   */
  setAriaDescription(elementId, description) {
    const element = document.getElementById(elementId);
    if (element) {
      const descId = `${elementId}-desc`;
      let descElement = document.getElementById(descId);
      
      if (!descElement) {
        descElement = document.createElement('span');
        descElement.id = descId;
        descElement.className = 'sr-only';
        element.parentNode.insertBefore(descElement, element.nextSibling);
      }
      
      descElement.textContent = description;
      element.setAttribute('aria-describedby', descId);
    }
  }

  /**
   * Criar trap de foco para modal
   */
  createFocusTrap(modalElement) {
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modalElement.addEventListener('keydown', (e) => {
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

    firstElement.focus();
  }

  /**
   * Aumentar tamanho da fonte
   */
  increaseFontSize() {
    const root = document.documentElement;
    const currentSize = parseInt(window.getComputedStyle(root).fontSize);
    root.style.fontSize = (currentSize + 2) + 'px';
  }

  /**
   * Diminuir tamanho da fonte
   */
  decreaseFontSize() {
    const root = document.documentElement;
    const currentSize = parseInt(window.getComputedStyle(root).fontSize);
    if (currentSize > 12) {
      root.style.fontSize = (currentSize - 2) + 'px';
    }
  }

  /**
   * Resetar tamanho da fonte
   */
  resetFontSize() {
    document.documentElement.style.fontSize = '16px';
  }

  /**
   * Ativar modo alto contraste
   */
  setHighContrast(enabled) {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }

  /**
   * Ativar modo de redução de movimento
   */
  setReduceMotion(enabled) {
    if (enabled) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }

  /**
   * Verificar preferências de acessibilidade do sistema
   */
  checkSystemPreferences() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;

    if (prefersReducedMotion) {
      this.setReduceMotion(true);
    }

    if (prefersHighContrast) {
      this.setHighContrast(true);
    }
  }

  /**
   * Ativar navegação por teclado
   */
  enableKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Alt + H: Home
      if (e.altKey && e.key === 'h') {
        window.location.href = '/';
      }

      // Alt + S: Skip to main content
      if (e.altKey && e.key === 's') {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView();
        }
      }

      // Alt + C: Calculadora
      if (e.altKey && e.key === 'c') {
        const calculator = document.querySelector('[data-calculator]');
        if (calculator) {
          calculator.focus();
          calculator.scrollIntoView();
        }
      }
    });
  }

  /**
   * Criar link de pulo
   */
  createSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Pular para conteúdo principal';
    skipLink.className = 'sr-only focus:not-sr-only fixed top-0 left-0 z-50 bg-nurse-primary text-white p-2';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}

// Instâncias globais
window.VOICE_MANAGER = new VoiceManager();
window.ACCESSIBILITY_MANAGER = new AccessibilityManager({
  voiceManager: window.VOICE_MANAGER
});

// Exportar
window.VoiceManager = VoiceManager;
window.AccessibilityManager = AccessibilityManager;
