/**
 * PDF-GENERATOR.JS - Gerador de Relatórios em PDF
 * Cria PDFs de auditoria e resultados de cálculos
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class PDFGenerator {
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/';
    this.notificationManager = options.notificationManager || window.NOTIFICATION_MANAGER;
    this.checkLibraries();
  }

  /**
   * Verificar se bibliotecas estão carregadas
   */
  checkLibraries() {
    this.hasJsPDF = typeof jspdf !== 'undefined';
    this.hasHtml2Canvas = typeof html2canvas !== 'undefined';
    
    if (!this.hasJsPDF || !this.hasHtml2Canvas) {
      console.warn('⚠️ Bibliotecas PDF não carregadas. Carregando...');
      this.loadLibraries();
    }
  }

  /**
   * Carregar bibliotecas PDF
   */
  loadLibraries() {
    if (!this.hasJsPDF) {
      const jsPDFScript = document.createElement('script');
      jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      jsPDFScript.onload = () => {
        this.hasJsPDF = true;
      };
      document.head.appendChild(jsPDFScript);
    }

    if (!this.hasHtml2Canvas) {
      const html2CanvasScript = document.createElement('script');
      html2CanvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      html2CanvasScript.onload = () => {
        this.hasHtml2Canvas = true;
      };
      document.head.appendChild(html2CanvasScript);
    }
  }

  /**
   * Gerar PDF de auditoria
   */
  async generateAuditPDF(calculatorData, patientData = {}) {
    if (!this.hasJsPDF || !this.hasHtml2Canvas) {
      this.notificationManager.error('Bibliotecas PDF não disponíveis');
      return;
    }

    try {
      const loading = this.notificationManager.loading('Gerando PDF...');

      // Criar template
      const template = this.createAuditTemplate(calculatorData, patientData);
      
      // Capturar como imagem
      const canvas = await html2canvas(template, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Gerar PDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Salvar
      const filename = `Auditoria_${calculatorData.calculatorId}_${Date.now()}.pdf`;
      pdf.save(filename);

      loading.close();
      this.notificationManager.success('PDF gerado com sucesso!');
      
      return filename;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.notificationManager.error('Erro ao gerar PDF');
      return null;
    }
  }

  /**
   * Criar template de auditoria
   */
  createAuditTemplate(calculatorData, patientData) {
    const template = document.createElement('div');
    template.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 794px;
      background: white;
      padding: 40px;
      color: #0f172a;
      font-family: 'Inter', sans-serif;
    `;

    const today = new Date().toLocaleString('pt-BR');
    const patientName = patientData.name || 'Não informado';
    const patientBirthdate = patientData.birthdate || 'Não informado';

    template.innerHTML = `
      <div style="border-bottom: 3px solid #1A3E74; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="width: 50px; height: 50px; background: #1A3E74; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
          <i class="fa-solid fa-calculator"></i>
        </div>
        <div style="text-align: right;">
          <h1 style="font-size: 18px; color: #1A3E74; margin: 0; font-weight: 900; text-transform: uppercase;">Relatório de Auditoria</h1>
          <p style="font-size: 9px; color: #64748b; margin: 0;">SISTEMA PROFISSIONAL DE ENFERMAGEM</p>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>PACIENTE:</strong> ${patientName.toUpperCase()}</p>
          <p style="margin: 0; font-size: 12px;"><strong>DATA DE NASCIMENTO:</strong> ${patientBirthdate}</p>
        </div>

        <h2 style="font-size: 14px; color: #1A3E74; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">
          DADOS DO CÁLCULO AUDITADO
        </h2>

        <table style="width: 100%; font-size: 11px; margin-bottom: 20px;">
          ${Object.entries(calculatorData).map(([key, value]) => `
            <tr>
              <td style="padding: 4px 0;">${this.formatLabel(key)}:</td>
              <td style="text-align: right; font-weight: bold;">${value}</td>
            </tr>
          `).join('')}
        </table>

        <div style="background: #1A3E74; color: white; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <p style="margin:0; font-size: 11px; text-transform: uppercase; opacity: 0.8;">RESULTADO FINAL</p>
          <p style="margin:10px 0 0 0; font-size: 36px; font-weight: 900;">
            ${calculatorData.result || '---'}
          </p>
        </div>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 10px; color: #64748b;">
            <strong>Checklist aplicado:</strong> 9 Certos da Medicação e Metas Internacionais de Segurança
          </p>
          <p style="margin: 5px 0 0 0; font-size: 9px; color: #94a3b8;">
            Documento gerado por Calculadoras de Enfermagem Profissional
          </p>
        </div>
      </div>

      <p style="font-size: 9px; color: #64748b; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        Relatório gerado em: ${today}
      </p>
    `;

    document.body.appendChild(template);
    return template;
  }

  /**
   * Formatar label de campo
   */
  formatLabel(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Exportar como CSV
   */
  exportAsCSV(data, filename = 'dados.csv') {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Exportar como JSON
   */
  exportAsJSON(data, filename = 'dados.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Imprimir elemento
   */
  print(elementId, title = 'Impressão') {
    const element = document.getElementById(elementId);
    if (!element) {
      this.notificationManager.error('Elemento não encontrado');
      return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}

// Instância global
window.PDF_GENERATOR = new PDFGenerator({
  notificationManager: window.NOTIFICATION_MANAGER
});

// Exportar
window.PDFGenerator = PDFGenerator;
