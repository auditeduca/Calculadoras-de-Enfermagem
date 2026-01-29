/**
 * UTIL.js - Auditoria e Validação
 */
const UTIL = {
    validateFields(containerId) {
        const fields = document.querySelectorAll(`#${containerId} input[required]`);
        let isValid = true;

        fields.forEach(f => {
            if (!f.value) {
                f.classList.add('animate-shake', 'border-red-500', 'bg-red-50');
                isValid = false;
                setTimeout(() => f.classList.remove('animate-shake'), 400);
            } else {
                f.classList.remove('border-red-500', 'bg-red-50');
            }
        });

        if (!isValid) VOICE.speak("Atenção: Existem campos obrigatórios vazios.");
        return isValid;
    },

    resetSystem() {
        VOICE.speak("Limpando formulário.");
        location.reload();
    },

    copyToClipboard() {
        const res = document.getElementById('res-total').innerText;
        const text = `REGISTRO DE AUDITORIA\nResultado: ${res}\nAuditado em: ${new Date().toLocaleString()}`;
        navigator.clipboard.writeText(text);
        CORE.notify("Copiado para a área de transferência!");
        VOICE.speak("Registro copiado.");
    }
};