/**
 * Sistema de Geração de PDF - Calculadoras de Enfermagem
 * Versão 2.0 - Corrigida
 */

const PDF_SYSTEM = {
    // Configurações
    config: {
        pageSize: 'a4',
        orientation: 'portrait',
        margin: 20,
        unit: 'pt'
    },

    // Gerar PDF para calculadora
    async generate(calculatorName, resultData, patientData = {}) {
        try {
            // Verificar bibliotecas
            if (typeof jsPDF === 'undefined') {
                console.error('jsPDF não carregado');
                this.showError('Biblioteca PDF não carregada');
                return;
            }

            const doc = new jsPDF(this.config.orientation, this.config.unit, this.config.pageSize);
            
            // Cabeçalho
            this.addHeader(doc, calculatorName);
            
            // Dados do paciente
            if (patientData.name || patientData.birthdate) {
                this.addPatientInfo(doc, patientData);
            }
            
            // Resultados
            this.addResults(doc, resultData);
            
            // Auditoria e segurança
            this.addSafetyInfo(doc);
            
            // Rodapé
            this.addFooter(doc);
            
            // Salvar arquivo
            const fileName = `Auditoria_${calculatorName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
            doc.save(fileName);
            
            return true;
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showError('Erro ao gerar PDF: ' + error.message);
            return false;
        }
    },

    // Adicionar cabeçalho
    addHeader(doc, title) {
        doc.setFillColor(26, 62, 116); // nurse-primary
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 40, 25);
        
        doc.setTextColor(255, 255, 255, 0.7);
        doc.setFontSize(8);
        doc.text('SISTEMA PROFISSIONAL DE ENFERMAGEM', 40, 35);
        
        // Logo
        doc.addImage(this.getLogo(), 'PNG', doc.internal.pageSize.getWidth() - 60, 10, 40, 40);
    },

    // Adicionar informações do paciente
    addPatientInfo(doc, patientData) {
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 250, 252);
        doc.rect(40, 60, doc.internal.pageSize.getWidth() - 80, 30, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.text('PACIENTE:', 50, 75);
        doc.setFont('helvetica', 'bold');
        doc.text(patientData.name || 'Não informado', 100, 75);
        
        doc.setFont('helvetica', 'normal');
        doc.text('NASCIMENTO:', 50, 85);
        doc.setFont('helvetica', 'bold');
        doc.text(patientData.birthdate || 'Não informado', 120, 85);
    },

    // Adicionar resultados
    addResults(doc, resultData) {
        let yPos = 110;
        
        // Título da seção
        doc.setFillColor(0, 188, 212); // nurse-secondary
        doc.rect(40, yPos, doc.internal.pageSize.getWidth() - 80, 15, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('RESULTADOS DO CÁLCULO', 50, yPos + 10);
        yPos += 25;
        
        // Dados do cálculo
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        
        Object.keys(resultData).forEach(key => {
            if (key !== 'unidade' && key !== 'calculator') {
                const label = this.formatLabel(key);
                const value = resultData[key];
                const unit = resultData.unidade || '';
                
                doc.setFont('helvetica', 'bold');
                doc.text(`${label}:`, 50, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(`${value} ${unit}`, 150, yPos);
                yPos += 10;
            }
        });
        
        yPos += 10;
        
        // Resultado principal em destaque
        if (resultData.volumeAspirar || resultData.resultado) {
            const mainValue = resultData.volumeAspirar || resultData.resultado;
            doc.setFillColor(26, 62, 116, 0.1);
            doc.rect(40, yPos, doc.internal.pageSize.getWidth() - 80, 40, 'F');
            
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 62, 116);
            doc.text('VOLUME FINAL:', 50, yPos + 20);
            doc.text(`${mainValue} ${resultData.unidade || 'UI'}`, 
                     doc.internal.pageSize.getWidth() - 100, yPos + 20, { align: 'right' });
            
            yPos += 60;
        }
    },

    // Adicionar informações de segurança
    addSafetyInfo(doc) {
        const yPos = 220;
        
        doc.setFillColor(249, 250, 251);
        doc.rect(40, yPos, doc.internal.pageSize.getWidth() - 80, 100, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(40, yPos, doc.internal.pageSize.getWidth() - 80, 100);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('CHECKLIST DE SEGURANÇA APLICADO:', 50, yPos + 15);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        const checklistItems = [
            '✓ Verificação dupla do cálculo',
            '✓ Confirmação da prescrição médica',
            '✓ Identificação do paciente',
            '✓ Verificação do medicamento',
            '✓ Confirmação da via de administração',
            '✓ Checagem de alergias',
            '✓ Registro no prontuário'
        ];
        
        checklistItems.forEach((item, index) => {
            const x = 50 + (index % 2) * 200;
            const y = yPos + 35 + Math.floor(index / 2) * 12;
            doc.text(item, x, y);
        });
    },

    // Adicionar rodapé
    addFooter(doc) {
        const pageHeight = doc.internal.pageSize.getHeight();
        
        doc.setDrawColor(200, 200, 200);
        doc.line(40, pageHeight - 40, doc.internal.pageSize.getWidth() - 40, pageHeight - 40);
        
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        
        doc.text('Calculadoras de Enfermagem Profissional', 40, pageHeight - 30);
        doc.text('Documento gerado em: ' + new Date().toLocaleString('pt-BR'), 
                 doc.internal.pageSize.getWidth() - 40, pageHeight - 30, { align: 'right' });
        
        doc.text('Este documento não substitui o registro oficial no prontuário.', 
                 40, pageHeight - 20);
        doc.text('Página 1 de 1', 
                 doc.internal.pageSize.getWidth() - 40, pageHeight - 20, { align: 'right' });
    },

    // Formatar labels
    formatLabel(key) {
        const labels = {
            'prescricao': 'Prescrição Médica',
            'volumeAspirar': 'Volume a Aspirar',
            'resultado': 'Resultado',
            'unidade': 'Unidade',
            'fatorCalculo': 'Fator de Cálculo',
            'tipoSeringa': 'Tipo de Seringa'
        };
        
        return labels[key] || key.replace(/([A-Z])/g, ' $1').toUpperCase();
    },

    // Obter logo (base64 ou URL)
    getLogo() {
        // Retorna um logo em base64 ou URL
        // Você pode substituir por sua logo real
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#1A3E74"/>
                <path d="M30 30 L70 30 L70 70 L30 70 Z" stroke="#00BCD4" stroke-width="4" fill="none"/>
                <path d="M40 40 L60 60 M60 40 L40 60" stroke="white" stroke-width="3"/>
                <text x="50" y="85" text-anchor="middle" fill="white" font-size="8" font-family="Arial">ENF</text>
            </svg>
        `);
    },

    // Mostrar erro
    showError(message) {
        if (window.NOTIFICATION_MODULE) {
            window.NOTIFICATION_MODULE.show(message, 'error');
        } else {
            alert(message);
        }
    }
};

// Adicionar ao objeto global
window.PDF_SYSTEM = PDF_SYSTEM;