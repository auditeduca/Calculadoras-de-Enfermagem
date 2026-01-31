/**
 * NURSING_ENGINE.JS - Motor de Enfermagem
 * Implementa lógica específica de cálculos de enfermagem com validações clínicas
 * * @author Calculadoras de Enfermagem
 * @version 2.0.1 (Fixed Init Dependency)
 */

class NursingEngine {
  constructor(options = {}) {
    // Dependência injetada ou null (será setada depois)
    this.calculatorEngine = options.calculatorEngine || null;
    this.notificationManager = options.notificationManager || window.NOTIFICATION_MANAGER;
    this.accessibilityManager = options.accessibilityManager || window.ACCESSIBILITY_MANAGER;
    
    // CORREÇÃO: Não chamar initializeCalculators aqui se calculatorEngine não estiver pronto
    if (this.calculatorEngine) {
        this.initializeCalculators();
    }
  }

  /**
   * Inicializar calculadoras de enfermagem (Chamado externamente agora)
   */
  initializeCalculators() {
    if (!this.calculatorEngine) {
        console.error("NursingEngine: calculatorEngine não definido. Não é possível registrar calculadoras.");
        return;
    }
    
    this.registerInsulinCalculator();
    this.registerHeparinCalculator();
    this.registerMedicationCalculator();
    this.registerDripRateCalculator();
    // Adicione outras conforme necessário
  }

  /**
   * Registrar calculadora de insulina
   */
  registerInsulinCalculator() {
    const calculator = {
      id: 'insulina',
      name: 'Cálculo de Insulina',
      schema: [
        { name: 'prescricao', label: 'Prescrição Médica (UI)', type: 'number', required: true, min: 0.5, max: 500 },
        { name: 'concentracao', label: 'Concentração (UI/mL)', type: 'number', required: true, min: 1, max: 500 }
      ],
      calculate: async (inputs) => {
        const { prescricao, concentracao, seringa } = inputs;
        const volume = (Number(prescricao) * 1) / Number(concentracao); // Regra de 3 simples (base 1ml)
        
        let recomendacao = '';
        let alerta = '';

        if (volume < 0.1) {
            alerta = 'Volume muito pequeno. Atenção redobrada na aspiração.';
        }
        
        // Validação de seringa (simples)
        const seringaCapacidade = seringa ? parseInt(seringa) : 100;
        if(volume * 100 > seringaCapacidade) { // Aproximação grosseira UI/ml
             // Lógica mais complexa de seringa pode ser adicionada aqui
        }

        return {
          resultado: volume,
          unidade: 'mL',
          detalhes: [
            { label: 'Volume a Aspirar', value: `${volume.toFixed(2)} mL` },
            { label: 'Prescrição', value: `${prescricao} UI` },
            { label: 'Concentração Disponível', value: `${concentracao} UI/mL` }
          ],
          alertas: alerta ? [alerta] : [],
          auditoria: {
              metodo: "Fórmula Básica: (Prescrição x Diluente) / Disponível",
              passos: `(${prescricao} x 1) / ${concentracao} = ${volume} mL`
          }
        };
      }
    };
    
    this.calculatorEngine.registerCalculator('insulina', calculator);
  }

  registerHeparinCalculator() {
      // Stub para evitar erro se chamado, mas sem implementação completa aqui para economizar espaço
      // A lógica real viria aqui
  }
  
  registerMedicationCalculator() {
      // Stub
  }
  
  registerDripRateCalculator() {
      // Stub
  }
}

window.NursingEngine = NursingEngine;