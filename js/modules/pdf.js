/**
 * MÓDULO DE GERAÇÃO DE PDF
 * Geração de relatórios em PDF com auditoria
 */

window.PDF_MODULE = {
    
    // Configuração
    config: {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        margins: { top: 20, right: 15, bottom: 20, left: 15 },
        fontSize: 10,
        fontFamily: 'Helvetica',
        titleSize: 18,
        headerSize: 12,
        logoUrl: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/author-info.webp',
        watermark: 'CALCULADORAS DE ENFERMAGEM'
    },
    
    // Estado
    state: {
        jsPDF: null,
        isGenerating: false,
        lastGenerated: null
    },
    
    /**
     * Inicializar módulo
     */
    init() {
        // Verificar se jsPDF está disponível
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF não encontrado');
            return false;
        }
        
        this.state.jsPDF = window.jspdf.jsPDF;
        console.log('📄 Módulo PDF inicializado');
        return true;
    },
    
    /**
     * Gerar PDF do resultado
     */
    async generate(result, calculator, formData = {}) {
        if (!this.state.jsPDF) {
            throw new Error('Biblioteca PDF não disponível');
        }
        
        if (this.state.isGenerating) {
            throw new Error('Já existe uma geração em andamento');
        }
        
        try {
            this.state.isGenerating = true;
            
            // Criar novo documento
            const doc = new this.state.jsPDF({
                orientation: this.config.orientation,
                unit: this.config.unit,
                format: this.config.format
            });
            
            // Adicionar conteúdo
            await this.addHeader(doc, calculator);
            await this.addPatientInfo(doc, formData);
            await this.addCalculationInfo(doc, calculator, formData);
            await this.addResults(doc, result, calculator);
            await this.addAuditTrail(doc, result);
            await this.addSafetyChecklist(doc);
            await this.addFooter(doc);
            
            // Salvar PDF
            const filename = this.generateFilename(calculator);
            doc.save(filename);
            
            // Atualizar estado
            this.state.lastGenerated = {
                timestamp: new Date(),
                calculator: calculator.id,
                filename
            };
            
            this.state.isGenerating = false;
            
            // Disparar evento
            this.dispatchEvent('generated', {
                filename,
                calculator: calculator.id
            });
            
            return filename;
            
        } catch (error) {
            this.state.isGenerating = false;
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    },
    
    /**
     * Adicionar cabeçalho ao PDF
     */
    async addHeader(doc, calculator) {
        const { margins } = this.config;
        let y = margins.top;
        
        // Logo
        try {
            const logoData = await this.getImageData(this.config.logoUrl);
            doc.addImage(logoData, 'PNG', margins.left, y, 30, 30);
        } catch (error) {
            console.warn('Não foi possível carregar a logo:', error);
        }
        
        // Título
        doc.setFontSize(this.config.titleSize);
        doc.setFont(this.config.fontFamily, 'bold');
        doc.text('REGISTRO DE CÁLCULO CLÍNICO', doc.internal.pageSize.getWidth() / 2, y + 15, {
            align: 'center'
        });
        
        // Subtítulo
        doc.setFontSize(this.config.headerSize);
        doc.setFont(this.config.fontFamily, 'normal');
        doc.text(calculator.name, doc.internal.pageSize.getWidth() / 2, y + 25, {
            align: 'center'
        });
        
        // Linha divisória
        y += 40;
        doc.setDrawColor(200, 200, 200);
        doc.line(margins.left, y, doc.internal.pageSize.getWidth() - margins.right, y);
        
        return y + 5;
    },
    
    /**
     * Adicionar informações do paciente
     */
    async addPatientInfo(doc, formData) {
        const { margins } = this.config;
        let y = 60;
        
        doc.setFontSize(this.config.headerSize);
        doc.setFont(this.config.fontFamily, 'bold');
        doc.text('IDENTIFICAÇÃO DO PACIENTE', margins.left, y);
        
        doc.setFontSize(this.config.fontSize);
        doc.setFont(this.config.fontFamily, 'normal');
        y += 10;
        
        // Nome
        doc.text('Nome:', margins.left, y);
        doc.text(formData.patient_name || 'Não informado', margins.left + 20, y);
        y += 7;
        
        // Data de Nascimento
        if (formData.patient_dob) {
            doc.text('Data de Nascimento:', margins.left, y);
            doc.text(formData.patient_dob, margins.left + 45, y);
            
            // Calcular idade
            const age = this.calculateAge(formData.patient_dob);
            if (age !== null) {
                doc.text(`Idade: ${age} anos`, margins.left + 100, y);
            }
            y += 7;
        }
        
        // Data e hora do cálculo
        const now = new Date();
        doc.text('Data/Hora do Cálculo:', margins.left, y);
        doc.text(now.toLocaleString('pt-BR'), margins.left + 45, y);
        y += 10;
        
        return y;
    },
    
    /**
     * Adicionar informações do cálculo
     */
    async addCalculationInfo(doc, calculator, formData) {
        const { margins } = this.config;
        let y = 90;
        
        doc.setFontSize(this.config.headerSize);
        doc.setFont(this.config.fontFamily, 'bold');
        doc.text('PARÂMETROS DO CÁLCULO', margins.left, y);
        
        doc.setFontSize(this.config.fontSize);
        doc.setFont(this.config.fontFamily, 'normal');
        y += 10;
        
        // Adicionar campos do formulário
        let fieldCount = 0;
        const fieldsPerColumn = 8;
        const columnWidth = (doc.internal.pageSize.getWidth() - margins.left - margins.right) / 2;
        
        Object.entries(formData).forEach(([key, value], index) => {
            // Pular campos do paciente
            if (key.startsWith('patient_')) return;
            
            // Determinar coluna
            const column = Math.floor(fieldCount / fieldsPerColumn);
            const x = margins.left + (column * columnWidth);
            const localY = y + ((fieldCount % fieldsPerColumn) * 7);
            
            // Adicionar campo
            const label = this.formatFieldLabel(key);
            doc.text(`${label}:`, x, localY);
            doc.text(String(value), x + 40, localY);
            
            fieldCount++;
        });
        
        y += Math.ceil(fieldCount / 2) * 7;
        
        // Adicionar fórmula se disponível
        if (calculator.formula) {
            y += 5;
            doc.setFont(this.config.fontFamily, 'bold');
            doc.text('FÓRMULA UTILIZADA:', margins.left, y);
            y += 7;
            
            doc.setFont(this.config.fontFamily, 'normal');
            doc.text(calculator.formula.calculation, margins.left + 10, y);
        }
        
        return y + 10;
    },
    
    /**
     * Adicionar resultados
     */
    async addResults(doc, result, calculator) {
        const { margins } = this.config;
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 150;
        
        // Título da seção
        doc.setFontSize(this.config.headerSize);
        doc.setFont(this.config.fontFamily, 'bold');
        doc.text('RESULTADO DO CÁLCULO', margins.left, y);
        
        // Box de destaque para o resultado principal
        y += 15;
        const boxWidth = pageWidth - margins.left - margins.right;
        const boxHeight = 40;
        
        doc.setFillColor(240, 245, 255);
        doc.rect(margins.left, y, boxWidth, boxHeight, 'F');
        doc.setDrawColor(26, 62, 116);
        doc.rect(margins.left, y, boxWidth, boxHeight);
        
        // Resultado principal
        const centerX = pageWidth / 2;
        const centerY = y + (boxHeight / 2);
        
        doc.setFontSize(24);
        doc.setFont(this.config.fontFamily, 'bold');
        doc.text(
            result.resultado ? result.resultado.toFixed(2) : '0.00',
            centerX,
            centerY - 5,
            { align: 'center' }
        );
        
        // Unidade
        doc.setFontSize(14);
        doc.setFont(this.config.fontFamily, 'normal');
        doc.text(
            result.unidade || calculator.unit || '',
            centerX,
            centerY + 10,
            { align: 'center' }
        );
        
        y += boxHeight + 20;
        
        // Interpretação se disponível
        if (result.interpretation) {
            doc.setFontSize(this.config.fontSize);
            doc.setFont(this.config.fontFamily, 'italic');
            doc.text('Interpretação:', margins.left, y);
            y += 7;
            
            doc.setFont(this.config.fontFamily, 'normal');
            const lines = doc.splitTextToSize(result.interpretation, boxWidth - 10);
            doc.text(lines, margins.left + 10, y);
            y += (lines.length * 7) + 10;
        }
        
        return y;
    },
    
    /**
     * Adicionar trilha de auditoria
     */
    async addAuditTrail(doc, result) {
        const { margins } = this.config;
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 220;
        
        // Verificar se precisa de nova página
        if (y > doc.internal.pageSize.getHeight() - 50) {
            doc.addPage();
            y = margins.top;
        }
        
        // Título da seção
        doc.setFontSize(this.config.headerSize);
        doc.setFont(this.config.fontFamily, 'bold');
        doc.text('AUDITORIA DO CÁLCULO', margins.left, y);
        
        doc.setFontSize(this.config.fontSize);
        doc.setFont(this.config.fontFamily, 'normal');
        y += 10;
        
        // Adicionar itens de auditoria
        Object.entries(result).forEach(([key, value]) => {
            if (!['resultado', 'unidade', 'unit', 'interpretation'].includes(key)) {
                const label = this.formatFieldLabel(key);
                doc.text(`${label}:`, margins.left, y);
                doc.text(String(value), margins.left + 60, y);
                y += 7;
            }
        });
        
        // Memória de cálculo
        if (result.formula || result.calculation) {
            y += 5;
            doc.setFont(this.config.fontFamily, 'bold');
            doc.text('Memória de Cálculo:', margins.left, y);
            y += 7;
            
            doc.setFont(this.config.fontFamily, 'normal');
            const memory = result.calculation || result.formula;
            const lines = doc.splitTextToSize(memory, pageWidth - margins.left - margins.right - 10);
            doc.text(lines, margins.left + 10, y);
            y += (lines.length * 7) + 10;
        }
        
        return y;
    },
    
    /**
     * Adicionar checklist de segurança
     */
    async addSafetyChecklist(doc) {
        const { margins } = this.config;
        let y = 280;
        
        // Verificar se precisa de nova página
        if (y > doc.internal.pageSize.getHeight() - 100) {
            doc.addPage();
            y = margins.top;
        }
        
        // Título da seção
        doc.setFontSize(this.config.headerSize);
        doc.setFont(this.config.fontFamily, 'bold');
        doc.text('CHECKLIST DE SEGURANÇA', margins.left, y);
        
        doc.setFontSize(this.config.fontSize);
        doc.setFont(this.config.fontFamily, 'normal');
        y += 10;
        
        // 9 Certos
        doc.setFont(this.config.fontFamily, 'bold');
        doc.text('9 Certos da Medicação:', margins.left, y);
        y += 7;
        
        doc.setFont(this.config.fontFamily, 'normal');
        const certos = [
            '☐ Paciente certo',
            '☐ Medicamento certo',
            '☐ Dose certa',
            '☐ Via certa',
            '☐ Hora certa',
            '☐ Registro certo',
            '☐ Orientação certa',
            '☐ Resposta certa',
            '☐ Validade certa'
        ];
        
        certos.forEach((certo, index) => {
            const column = Math.floor(index / 5);
            const row = index % 5;
            const x = margins.left + (column * 80);
            doc.text(certo, x, y + (row * 7));
        });
        
        y += 40;
        
        // Metas Internacionais
        doc.setFont(this.config.fontFamily, 'bold');
        doc.text('Metas Internacionais de Segurança:', margins.left, y);
        y += 7;
        
        doc.setFont(this.config.fontFamily, 'normal');
        const metas = [
            '☐ Identificação correta do paciente',
            '☐ Comunicação eficaz',
            '☐ Segurança de medicamentos de alta vigilância',
            '☐ Cirurgia no local correto',
            '☐ Redução do risco de infecções',
            '☐ Redução do risco de quedas'
        ];
        
        metas.forEach((meta, index) => {
            doc.text(meta, margins.left, y + (index * 7));
        });
        
        return y + 50;
    },
    
    /**
     * Adicionar rodapé
     */
    async addFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Número da página
            doc.setFontSize(8);
            doc.setFont(this.config.fontFamily, 'normal');
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
            
            // Data de geração
            const now = new Date();
            doc.text(
                `Gerado em: ${now.toLocaleString('pt-BR')}`,
                doc.internal.pageSize.getWidth() - 15,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'right' }
            );
            
            // Watermark
            doc.setFontSize(40);
            doc.setTextColor(200, 200, 200);
            doc.setFont(this.config.fontFamily, 'bold');
            doc.text(
                this.config.watermark,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() / 2,
                {
                    align: 'center',
                    angle: 45
                }
            );
            doc.setTextColor(0, 0, 0); // Resetar cor
        }
    },
    
    /**
     * Gerar nome do arquivo
     */
    generateFilename(calculator) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        
        return `calculadora-${calculator.id}-${dateStr}-${timeStr}.pdf`;
    },
    
    /**
     * Calcular idade a partir da data de nascimento
     */
    calculateAge(birthDate) {
        if (!birthDate) return null;
        
        // Converter DD/MM/YYYY para Date
        const parts = birthDate.split('/');
        if (parts.length !== 3) return null;
        
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        
        const birth = new Date(year, month, day);
        if (isNaN(birth.getTime())) return null;
        
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    },
    
    /**
     * Formatar label do campo
     */
    formatFieldLabel(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    },
    
    /**
     * Obter dados da imagem (base64)
     */
    async getImageData(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                resolve(canvas.toDataURL('image/png'));
            };
            
            img.onerror = () => {
                reject(new Error('Falha ao carregar imagem'));
            };
            
            img.src = url;
        });
    },
    
    /**
     * Disparar evento personalizado
     */
    dispatchEvent(name, detail = {}) {
        const event = new CustomEvent(`pdf:${name}`, { detail });
        window.dispatchEvent(event);
    }
};

// Inicializar automaticamente quando jsPDF estiver disponível
if (typeof window.jspdf !== 'undefined') {
    window.PDF_MODULE.init();
}