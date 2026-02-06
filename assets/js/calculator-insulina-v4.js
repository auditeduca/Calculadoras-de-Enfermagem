// Módulo ES6 para lógica específica da calculadora de insulina
const CalculatorLogic = {
  'calculator-insulina-v4': {
    init(config) {
      console.log('🧮 Inicializando lógica da calculadora de insulina');
      
      // Configurar objeto global
      window.CALCULATOR_SYSTEM = {
        ...window.CALCULATOR_SYSTEM,
        config: config,
        
        calculate: function() {
          // Implementação específica
          const prescricao = parseFloat(document.getElementById('prescricao_medica').value);
          const concentracao = parseFloat(document.getElementById('concentracao_insulina').value);
          
          if (isNaN(prescricao) || isNaN(concentracao)) {
            this.notify('Preencha todos os campos obrigatórios', 'error');
            return;
          }
          
          const volume = prescricao / concentracao;
          
          // Mostrar resultados
          this.showResults({
            volume: volume.toFixed(2),
            unidade: 'mL',
            prescricao: prescricao,
            concentracao: concentracao
          });
        },
        
        showResults: function(data) {
          // Implementação para mostrar resultados
          console.log('Resultados:', data);
        },
        
        notify: function(message, type) {
          // Sistema de notificação
          console[type === 'error' ? 'error' : 'log'](message);
        }
      };
      
      console.log('✅ Lógica da calculadora inicializada');
    }
  }
};

// Exportar para uso global
window.CalculatorLogic = CalculatorLogic;
export default CalculatorLogic;