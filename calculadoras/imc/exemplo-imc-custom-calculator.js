/**
 * IMC CALCULATOR ENGINE
 * Calculadora customizada para Índice de Massa Corporal
 */

class IMCCalculatorEngine extends CalculatorEngine {
  /**
   * Sobrescreve o método calculate() para lógica específica de IMC
   */
  calculate() {
    // 1. Ler valores dos campos
    const peso = parseFloat(document.getElementById('peso_kg').value);
    const altura = parseFloat(document.getElementById('altura_m').value);
    
    // 2. Validação básica
    if (!peso || !altura) {
      window.showToast("Preencha todos os campos!", "warning");
      return;
    }
    
    // Validação adicional
    if (peso <= 0 || altura <= 0) {
      window.showToast("Valores devem ser maiores que zero!", "warning");
      return;
    }
    
    // 3. Cálculo: IMC = peso / altura²
    const imc = peso / (altura * altura);
    
    // 4. Determinar classificação
    let classificacao = '';
    let corClassificacao = '';
    
    if (imc < 18.5) {
      classificacao = 'Baixo Peso';
      corClassificacao = 'text-blue-600';
    } else if (imc < 25) {
      classificacao = 'Peso Normal';
      corClassificacao = 'text-green-600';
    } else if (imc < 30) {
      classificacao = 'Sobrepeso';
      corClassificacao = 'text-yellow-600';
    } else if (imc < 35) {
      classificacao = 'Obesidade Grau I';
      corClassificacao = 'text-orange-600';
    } else if (imc < 40) {
      classificacao = 'Obesidade Grau II';
      corClassificacao = 'text-red-600';
    } else {
      classificacao = 'Obesidade Grau III';
      corClassificacao = 'text-red-800';
    }
    
    // 5. Renderizar resultado
    document.getElementById('res-total').innerText = 
      imc.toLocaleString('pt-BR', { 
        minimumFractionDigits: 1, 
        maximumFractionDigits: 1 
      });
    
    document.getElementById('res-unit').innerHTML = `
      kg/m² 
      <span class="block text-sm mt-2 ${corClassificacao} font-bold">
        ${classificacao}
      </span>
    `;
    
    // 6. Mostrar container de resultados
    document.getElementById('results-wrapper').classList.remove('hidden');
    
    // 7. Renderizar auditoria customizada
    this.renderCustomAudit(peso, altura, imc, classificacao);
    
    // 8. Verificar alertas configurados no JSON
    this.checkAlerts(imc);
    
    // 9. Salvar dados para exportação
    this.resultData = { peso, altura, imc, classificacao };
    
    // 10. Feedback ao usuário
    window.showToast("IMC calculado com sucesso!", "success");
  }
  
  /**
   * Renderiza auditoria customizada para IMC
   */
  renderCustomAudit(peso, altura, imc, classificacao) {
    const auditList = document.getElementById('audit-list');
    if (!auditList) return;
    
    // Tabela de referência OMS
    const tabelaOMS = `
      <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl mt-4">
        <h5 class="font-bold mb-3 text-sm">Classificação OMS</h5>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between">
            <span>Baixo Peso:</span>
            <span class="font-mono">< 18,5</span>
          </div>
          <div class="flex justify-between">
            <span>Peso Normal:</span>
            <span class="font-mono">18,5 - 24,9</span>
          </div>
          <div class="flex justify-between">
            <span>Sobrepeso:</span>
            <span class="font-mono">25,0 - 29,9</span>
          </div>
          <div class="flex justify-between">
            <span>Obesidade I:</span>
            <span class="font-mono">30,0 - 34,9</span>
          </div>
          <div class="flex justify-between">
            <span>Obesidade II:</span>
            <span class="font-mono">35,0 - 39,9</span>
          </div>
          <div class="flex justify-between">
            <span>Obesidade III:</span>
            <span class="font-mono">≥ 40,0</span>
          </div>
        </div>
      </div>
    `;
    
    auditList.innerHTML = `
      <li class="bg-green-50 dark:bg-green-900/20 p-3 rounded text-sm">
        <i class="fa-solid fa-check text-green-600 mr-2"></i>
        <strong>Fórmula:</strong> IMC = Peso (kg) / Altura² (m²)
      </li>
      <li class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">
        <i class="fa-solid fa-calculator text-slate-500 mr-2"></i>
        <strong>Cálculo:</strong> ${peso} kg ÷ (${altura} m)² = ${imc.toFixed(2)} kg/m²
      </li>
      <li class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm">
        <i class="fa-solid fa-info-circle text-blue-600 mr-2"></i>
        <strong>Classificação OMS:</strong> ${classificacao}
      </li>
      <li class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm">
        <i class="fa-solid fa-exclamation-triangle text-yellow-600 mr-2"></i>
        <strong>Importante:</strong> O IMC não considera composição corporal (massa muscular vs gordura)
      </li>
      <li class="p-3 rounded text-sm">
        ${tabelaOMS}
      </li>
    `;
  }
  
  /**
   * Sobrescreve geração de PDF para incluir classificação
   */
  async generatePDF() {
    if (!this.resultData) {
      window.showToast('Realize um cálculo primeiro!', 'warning');
      return;
    }
    
    window.showToast('Gerando PDF...', 'info');
    
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      const { peso, altura, imc, classificacao } = this.resultData;
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(26, 62, 116);
      doc.text('Cálculo de IMC', 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
      
      // Linha divisória
      doc.setDrawColor(26, 62, 116);
      doc.line(20, 35, 190, 35);
      
      // Dados
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Dados Antropométricos', 20, 45);
      
      doc.setFontSize(11);
      doc.text(`Peso: ${peso} kg`, 20, 55);
      doc.text(`Altura: ${altura} m`, 20, 62);
      
      // Resultado
      doc.setFontSize(14);
      doc.setTextColor(26, 62, 116);
      doc.text('Resultado', 20, 75);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 188, 212);
      doc.text(`IMC: ${imc.toFixed(1)} kg/m²`, 20, 85);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Classificação: ${classificacao}`, 20, 95);
      
      // Fórmula
      doc.setFontSize(12);
      doc.text('Fórmula Utilizada:', 20, 110);
      doc.setFontSize(10);
      doc.text('IMC = Peso (kg) / Altura² (m²)', 20, 117);
      
      // Tabela OMS
      doc.setFontSize(12);
      doc.text('Classificação OMS:', 20, 130);
      
      doc.setFontSize(9);
      doc.text('Baixo Peso: < 18,5 kg/m²', 20, 140);
      doc.text('Peso Normal: 18,5 - 24,9 kg/m²', 20, 147);
      doc.text('Sobrepeso: 25,0 - 29,9 kg/m²', 20, 154);
      doc.text('Obesidade Grau I: 30,0 - 34,9 kg/m²', 20, 161);
      doc.text('Obesidade Grau II: 35,0 - 39,9 kg/m²', 20, 168);
      doc.text('Obesidade Grau III: ≥ 40,0 kg/m²', 20, 175);
      
      // Aviso
      doc.setFontSize(9);
      doc.setTextColor(150, 0, 0);
      doc.text('IMPORTANTE: O IMC não considera composição corporal.', 20, 190);
      doc.text('Avaliação nutricional completa requer outros parâmetros.', 20, 197);
      
      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Calculadoras de Enfermagem Profissional', 20, 280);
      doc.text('https://auditeduca.github.io/Calculadoras-de-Enfermagem/', 20, 285);
      
      // Salvar
      doc.save(`calculo-imc-${new Date().getTime()}.pdf`);
      window.showToast('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      window.showToast('Erro ao gerar PDF', 'warning');
    }
  }
}

console.log('✓ IMC Calculator Engine carregado');