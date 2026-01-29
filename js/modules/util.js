/**
 * UTIL.js - Ferramentas de Apoio, PDF, Cópia e Validação
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
        if (!isValid) VOICE.speak("Atenção: Campos obrigatórios em falta.");
        return isValid;
    },

    resetSystem() {
        VOICE.speak("A repor o formulário.");
        location.reload();
    },

    async generatePDF(elementId, configId) {
        VOICE.speak("A gerar o relatório de auditoria clínica.");
        const element = document.getElementById(elementId);
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 595, 842);
        pdf.save(`Relatorio_Audit_${configId}.pdf`);
        VOICE.speak("PDF gerado com sucesso.");
    },

    copyResult(result, configName) {
        const patient = document.getElementById('patient_name').value || 'Não Identificado';
        const text = `--- REGISTO DE AUDITORIA ---\nCalculadora: ${configName}\nPaciente: ${patient}\nResultado: ${result} ml\nAuditado via: auditeduca.github.io`;
        navigator.clipboard.writeText(text);
        CORE.notify("Registo copiado!");
        VOICE.speak("Copiado com sucesso.");
    },

    searchNANDA(name, result) {
        const query = encodeURIComponent(`diagnóstico enfermagem NANDA ${name} ${result} ml`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
        VOICE.speak("A procurar diagnósticos no NANDA.");
    }
};