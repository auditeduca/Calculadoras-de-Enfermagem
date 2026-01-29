const VOICE = {
    settings: { rate: 1.1, pitch: 1 },

    speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'pt-BR';
        msg.rate = this.settings.rate;
        window.speechSynthesis.speak(msg);
    }
};