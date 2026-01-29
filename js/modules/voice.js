/**
 * VOICE.js - Feedback Auditivo e Acessibilidade
 * Garante que feedbacks visuais sejam lidos.
 */
const VOICE = {
    settings: { rate: 1.1, pitch: 1 },

    speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'pt-PT';
        msg.rate = this.settings.rate;
        window.speechSynthesis.speak(msg);
    }
};