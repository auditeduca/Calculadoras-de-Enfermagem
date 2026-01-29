/**
 * UTILS MODULE - Ferramentas de Suporte e Auditoria
 */
const UTILS = {

    /**
     * Validação Genérica com Feedback Visual (Shake) e Voz
     */
    validateFields(containerId) {
        const fields = document.querySelectorAll(`#${containerId} .input-field`);
        let isValid = true;
        let firstError = null;

        fields.forEach(field => {
            if (field.hasAttribute('required') && !field.value) {
                field.classList.add('animate-shake', 'border-red-500', 'bg-red-50');
                isValid = false;
                if (!firstError) firstError = field;
                
                // Remove a animação após 400ms para permitir repetição
                setTimeout(() => field.classList.remove('animate-shake'), 400);
            } else {
                field.classList.remove('border-red-500', 'bg-red-50');
            }
        });

        if (!isValid) {
            VOICE.speak("Erro de validação. Por favor, preencha os campos destacados em vermelho.");
            if (firstError) firstError.focus();
        }

        return isValid;
    },

    /**
     * Limpeza Modular do Sistema
     */
    resetSystem() {
        VOICE.speak("A limpar todos os campos e registos de auditoria.");
        if (confirm("Deseja realmente limpar todos os dados do paciente e cálculos?")) {
            location.reload();
        }
    },

    /**
     * Formatação Profissional para Cópia (Prontuário/Auditoria)
     */
    copyResult(data, config) {
        if (!data) return;

        const patientName = document.getElementById('patient_name')?.value || "Não Identificado";
        const timestamp = new Date().toLocaleString('pt-BR');
        
        const text = [
            `--- REGISTRO DE AUDITORIA CLÍNICA ---`,
            `Calculadora: ${config.name}`,
            `Paciente: ${patientName}`,
            `Data/Hora: ${timestamp}`,
            `-------------------------------------`,
            `RESULTADO: ${data.res} ${data.unit || 'ml'}`,
            `Lógica: ${config.formula.calculation}`,
            `-------------------------------------`,
            `Auditado via: calculadorasdeenfermagem.com.br`
        ].join('\n');

        navigator.clipboard.writeText(text).then(() => {
            VOICE.speak("Registo de auditoria copiado para a área de transferência.");
            CORE.notify("Copiado com sucesso!");
        });
    },

    /**
     * Busca Inteligente de Diagnóstico NANDA
     */
    searchNANDA(calcId, resultValue) {
        VOICE.speak("A procurar diagnósticos de enfermagem relacionados no NANDA.");
        const query = encodeURIComponent(`diagnóstico enfermagem NANDA ${calcId} ${resultValue}`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    },

    /**
     * Engine de Geração de PDF Auditado
     */
    async generatePDF(elementId, fileName) {
        VOICE.speak("A preparar o relatório PDF. Por favor, aguarde.");
        
        const element = document.getElementById(elementId);
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}_Audit.pdf`);
        
        VOICE.speak("PDF gerado e transferido com sucesso.");
    }
};