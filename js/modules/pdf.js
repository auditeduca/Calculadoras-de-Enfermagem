/**
 * MÓDULO DE GERAÇÃO DE PDF
 */

window.PDF_MODULE = {
    
    /**
     * Inicializar módulo
     */
    init() {
        // Verificar se jsPDF está disponível
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF não encontrado');
            return false;
        }
        
        console.log('📄 Módulo PDF inicializado');
        return true;
    },
    
    /**
     * Gerar PDF do resultado
     */
    async generate(result, calculator, formData = {}) {
        if (!window.jspdf) {
            throw new Error('Biblioteca PDF não disponível');
        }
        
        try {
            // Criar novo documento
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Adicionar conteúdo básico
            doc.setFontSize(20);
            doc.text(calculator.name, 20, 20);
            
            doc.setFontSize(12);
            doc.text(`Resultado: ${result.resultado} ${result.unidade || ''}`, 20, 40);
            
            // Adicionar detalhes
            let y = 60;
            Object.entries(result).forEach(([key, value]) => {
                if (key !== 'resultado' && key !== 'unidade') {
                    doc.text(`${key}: ${value}`, 20, y);
                    y += 10;
                }
            });
            
            // Salvar PDF
            const filename = `calculadora-${calculator.id}-${Date.now()}.pdf`;
            doc.save(filename);
            
            return filename;
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    }
};

// Inicializar automaticamente quando jsPDF estiver disponível
if (typeof window.jspdf !== 'undefined') {
    window.PDF_MODULE.init();
}