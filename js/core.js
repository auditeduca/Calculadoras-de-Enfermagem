// Exemplo de como o CORE usa o UTILS
const CORE = {
    // ...
    calculate() {
        // Usa o UTILS para validar antes de calcular
        if (!UTILS.validateFields('dynamic-fields')) return;

        // Lógica de cálculo...
        VOICE.speak("Cálculo efetuado.");
    },

    reset() {
        UTILS.resetSystem();
    },

    copyResult() {
        UTILS.copyResult(this.state.data, this.state.config);
    },

    generatePDF() {
        UTILS.generatePDF('results-wrapper', 'Relatorio_Enfermagem');
    }
};