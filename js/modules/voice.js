/**
 * MÓDULO DE SÍNTESE DE VOZ
 * Feedback auditivo para acessibilidade
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
    
    // Estado
    state: {
        speechSynthesis: null,
        isSpeaking: false,
        isPaused: false,
        currentUtterance: null
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
        
        this.state.speechSynthesis = window.speechSynthesis;
        
        // Carregar configurações salvas
        this.loadSettings();
        
        // Configurar eventos
        this.setupEvents();
        
        console.log('🗣️ Módulo de voz inicializado');
        return true;
    },
    
    /**
     * Carregar configurações salvas
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('voice-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                Object.assign(this.config, settings);
            }
        } catch (error) {
            console.warn('Erro ao carregar configurações de voz:', error);
        }
    },
    
    /**
     * Salvar configurações
     */
    saveSettings() {
        try {
            localStorage.setItem('voice-settings', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Erro ao salvar configurações de voz:', error);
        }
    },
    
    /**
     * Configurar eventos
     */
    setupEvents() {
        // Pausar fala quando página for ocultada
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.isSpeaking) {
                this.pause();
            }
        });
        
        // Parar fala ao sair da página
        window.addEventListener('beforeunload', () => {
            this.stop();
        });
    },
    
    /**
     * Falar texto
     */
    speak(text, options = {}) {
        if (!this.config.enabled || !text) return;
        
        // Parar fala atual se estiver falando
        if (this.state.isSpeaking) {
            this.stop();
        }
        
        // Criar utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurar utterance
        utterance.lang = options.lang || this.config.language;
        utterance.rate = options.rate || this.config.rate;
        utterance.pitch = options.pitch || this.config.pitch;
        utterance.volume = options.volume || this.config.volume;
        
        // Eventos
        utterance.onstart = () => {
            this.state.isSpeaking = true;
            this.state.isPaused = false;
            this.state.currentUtterance = utterance;
            
            // Disparar evento personalizado
            this.dispatchEvent('speechstart', { text });
        };
        
        utterance.onend = () => {
            this.state.isSpeaking = false;
            this.state.currentUtterance = null;
            this.dispatchEvent('speechend', { text });
        };
        
        utterance.onerror = (event) => {
            console.error('Erro na síntese de voz:', event);
            this.state.isSpeaking = false;
            this.state.currentUtterance = null;
            this.dispatchEvent('speecherror', { error: event.error, text });
        };
        
        // Iniciar fala
        this.state.speechSynthesis.speak(utterance);
    },
    
    /**
     * Falar resultado do cálculo
     */
    speakResult(result, calculator) {
        if (!result || !calculator) return;
        
        const text = this.buildResultSpeech(result, calculator);
        this.speak(text, { rate: 0.9 }); // Falar mais devagar para resultados
    },
    
    /**
     * Construir texto para fala do resultado
     */
    buildResultSpeech(result, calculator) {
        const mainResult = result.resultado ? 
            `${result.resultado} ${result.unidade || ''}` : 
            'resultado não disponível';
        
        let speech = `Resultado do cálculo ${calculator.name}: ${mainResult}. `;
        
        // Adicionar interpretação se disponível
        if (result.interpretation) {
            speech += `Interpretação: ${result.interpretation}. `;
        }
        
        // Adicionar avisos importantes
        if (result.warning) {
            speech += `Atenção: ${result.warning}. `;
        }
        
        return speech;
    },
    
    /**
     * Falar instruções
     */
    speakInstructions(instructions) {
        if (!instructions || !Array.isArray(instructions)) return;
        
        const text = `Instruções: ${instructions.join('. ')}`;
        this.speak(text);
    },
    
    /**
     * Falar feedback de ação
     */
    speakAction(action, data = {}) {
        const feedback = this.getActionFeedback(action, data);
        if (feedback) {
            this.speak(feedback);
        }
    },
    
    /**
     * Obter feedback para ações específicas
     */
    getActionFeedback(action, data) {
        switch (action) {
            case 'calculate':
                return 'Cálculo executado com sucesso';
                
            case 'reset':
                return 'Formulário limpo';
                
            case 'copy':
                return 'Resultado copiado para a área de transferência';
                
            case 'pdf':
                return 'PDF gerado com sucesso';
                
            case 'error':
                return `Erro: ${data.message || 'Ocorreu um erro'}`;
                
            case 'validation':
                return 'Por favor, preencha todos os campos obrigatórios';
                
            default:
                return null;
        }
    },
    
    /**
     * Pausar fala
     */
    pause() {
        if (this.state.isSpeaking && !this.state.isPaused) {
            this.state.speechSynthesis.pause();
            this.state.isPaused = true;
            this.dispatchEvent('speechpause');
        }
    },
    
    /**
     * Retomar fala
     */
    resume() {
        if (this.state.isSpeaking && this.state.isPaused) {
            this.state.speechSynthesis.resume();
            this.state.isPaused = false;
            this.dispatchEvent('speechresume');
        }
    },
    
    /**
     * Parar fala
     */
    stop() {
        if (this.state.isSpeaking || this.state.isPaused) {
            this.state.speechSynthesis.cancel();
            this.state.isSpeaking = false;
            this.state.isPaused = false;
            this.state.currentUtterance = null;
            this.dispatchEvent('speechstop');
        }
    },
    
    /**
     * Verificar se está falando
     */
    isSpeaking() {
        return this.state.isSpeaking;
    },
    
    /**
     * Verificar se está pausado
     */
    isPaused() {
        return this.state.isPaused;
    },
    
    /**
     * Alternar estado (ligado/desligado)
     */
    toggle() {
        this.config.enabled = !this.config.enabled;
        this.saveSettings();
        
        // Parar fala se foi desativado
        if (!this.config.enabled && this.state.isSpeaking) {
            this.stop();
        }
        
        this.dispatchEvent('toggle', { enabled: this.config.enabled });
        return this.config.enabled;
    },
    
    /**
     * Alterar configurações
     */
    setSettings(settings) {
        Object.assign(this.config, settings);
        this.saveSettings();
        this.dispatchEvent('settingschange', this.config);
    },
    
    /**
     * Obter configurações
     */
    getSettings() {
        return { ...this.config };
    },
    
    /**
     * Listar vozes disponíveis
     */
    getVoices() {
        if (!this.state.speechSynthesis) return [];
        
        return this.state.speechSynthesis.getVoices().filter(voice => 
            voice.lang.startsWith('pt')
        );
    },
    
    /**
     * Definir voz
     */
    setVoice(voiceName) {
        const voices = this.getVoices();
        const voice = voices.find(v => v.name === voiceName);
        
        if (voice) {
            this.config.voice = voiceName;
            this.saveSettings();
            return true;
        }
        
        return false;
    },
    
    /**
     * Alterar velocidade
     */
    setRate(rate) {
        if (rate >= 0.1 && rate <= 10) {
            this.config.rate = rate;
            this.saveSettings();
            return true;
        }
        return false;
    },
    
    /**
     * Alterar tom
     */
    setPitch(pitch) {
        if (pitch >= 0 && pitch <= 2) {
            this.config.pitch = pitch;
            this.saveSettings();
            return true;
        }
        return false;
    },
    
    /**
     * Alterar volume
     */
    setVolume(volume) {
        if (volume >= 0 && volume <= 1) {
            this.config.volume = volume;
            this.saveSettings();
            return true;
        }
        return false;
    },
    
    /**
     * Disparar evento personalizado
     */
    dispatchEvent(name, detail = {}) {
        const event = new CustomEvent(`voice:${name}`, { detail });
        window.dispatchEvent(event);
    },
    
    /**
     * Adicionar listener para eventos
     */
    on(event, callback) {
        window.addEventListener(`voice:${event}`, callback);
    },
    
    /**
     * Remover listener
     */
    off(event, callback) {
        window.removeEventListener(`voice:${event}`, callback);
    }
};

// Inicializar automaticamente quando carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.VOICE_MODULE.init());
} else {
    window.VOICE_MODULE.init();
}