/**
 * VOICE.js - Feedback Auditivo
 */
const VOICE = {
    speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'pt-BR';
        msg.rate = 1.1;
        window.speechSynthesis.speak(msg);
    }
};