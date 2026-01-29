/**
 * MÓDULO DE SÍNTESE DE VOZ
 */

window.VOICE_MODULE = {
    
    // Configuração
    config: {
        enabled: true,
        language: 'pt-BR',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
    },
    
    /**
     * Inicializar módulo
     */
    init() {
        // Verificar suporte a Web Speech API
        if (!('speechSynthesis' in window)) {
            console.warn('Web Speech API não suportada neste navegador');
            this.config.enabled = false;
            return false;
        }
        
        console.log('🗣️ Módulo de voz inicializado');
        return true;
    },
    
    /**
     * Falar texto
     */
    speak(text, options = {}) {
        if (!this.config.enabled || !text) return;
        
        // Parar fala atual se estiver falando
        window.speechSynthesis.cancel();
        
        // Criar utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurar utterance
        utterance.lang = options.lang || this.config.language;
        utterance.rate = options.rate || this.config.rate;
        utterance.pitch = options.pitch || this.config.pitch;
        utterance.volume = options.volume || this.config.volume;
        
        // Iniciar fala
        window.speechSynthesis.speak(utterance);
    },
    
    /**
     * Falar resultado do cálculo
     */
    speakResult(result, calculator) {
        if (!result || !calculator) return;
        
        const text = `Resultado do cálculo: ${result.resultado} ${result.unidade || ''}`;
        this.speak(text, { rate: 0.9 });
    }
};

// Inicializar automaticamente
document.addEventListener('DOMContentLoaded', () => {
    window.VOICE_MODULE.init();
});