/**
 * NURSING_ENGINE.JS - Motor de Enfermagem
 * Implementa lógica específica de cálculos de enfermagem com validações clínicas
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class NursingEngine {
  constructor(options = {}) {
    this.calculatorEngine = options.calculatorEngine || window.CALCULATOR_ENGINE;
    this.notificationManager = options.notificationManager || window.NOTIFICATION_MANAGER;
    this.accessibilityManager = options.accessibilityManager || window.ACCESSIBILITY_MANAGER;
    this.initializeCalculators();
  }

  /**
   * Inicializar calculadoras de enfermagem
   */
  initializeCalculators() {
    this.registerInsulinCalculator();
    this.registerHeparinCalculator();
    this.registerMedicationCalculator();
    this.registerDripRateCalculator();
    this.registerBMICalculator();
    this.registerVitalSignsCalculators();
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
        const { prescricao, concentracao } = inputs;
        
        if (prescricao <= 0 || concentracao <= 0) {
          throw new Error('Valores devem ser maiores que zero');
        }

        const volume = prescricao / concentracao;
        
        // Validações clínicas
        if (volume > 100) {
          this.notificationManager.warning('Volume muito elevado. Verificar prescrição.');
        }

        return {
          value: volume.toFixed(2),
          unit: 'mL',
          formula: `${prescricao} UI ÷ ${concentracao} UI/mL = ${volume.toFixed(2)} mL`,
          clinical_notes: `
            - Seringa de 100 UI: máximo 1 mL
            - Seringa de 300 UI: máximo 3 mL
            - Sempre usar seringa apropriada
            - Verificar validade do frasco
          `
        };
      }
    };

    this.calculatorEngine.registerCalculator('insulina', calculator);
  }

  /**
   * Registrar calculadora de heparina
   */
  registerHeparinCalculator() {
    const calculator = {
      id: 'heparina',
      name: 'Cálculo de Heparina',
      schema: [
        { name: 'prescricao', label: 'Prescrição (UI)', type: 'number', required: true, min: 1000, max: 50000 },
        { name: 'concentracao', label: 'Concentração (UI/mL)', type: 'number', required: true, min: 1000, max: 50000 }
      ],
      calculate: async (inputs) => {
        const { prescricao, concentracao } = inputs;
        
        if (prescricao <= 0 || concentracao <= 0) {
          throw new Error('Valores devem ser maiores que zero');
        }

        const volume = prescricao / concentracao;

        return {
          value: volume.toFixed(2),
          unit: 'mL',
          formula: `${prescricao} UI ÷ ${concentracao} UI/mL = ${volume.toFixed(2)} mL`,
          clinical_notes: `
            - Monitorar TTPa regularmente
            - Antídoto: Sulfato de Protamina
            - Risco de sangramento
            - Verificar sinais de trombose
          `
        };
      }
    };

    this.calculatorEngine.registerCalculator('heparina', calculator);
  }

  /**
   * Registrar calculadora de medicamentos
   */
  registerMedicationCalculator() {
    const calculator = {
      id: 'medicamentos',
      name: 'Diluição de Medicamentos',
      schema: [
        { name: 'dose', label: 'Dose Prescrita', type: 'number', required: true, min: 0.1 },
        { name: 'concentracao', label: 'Concentração Disponível', type: 'number', required: true, min: 0.1 },
        { name: 'volume', label: 'Volume Disponível (mL)', type: 'number', required: true, min: 0.1 }
      ],
      calculate: async (inputs) => {
        const { dose, concentracao, volume } = inputs;
        
        if (dose <= 0 || concentracao <= 0 || volume <= 0) {
          throw new Error('Todos os valores devem ser maiores que zero');
        }

        const volumeToAdminister = (dose * volume) / concentracao;

        if (volumeToAdminister > volume) {
          this.notificationManager.warning('Volume a administrar maior que o disponível. Verificar prescrição.');
        }

        return {
          value: volumeToAdminister.toFixed(2),
          unit: 'mL',
          formula: `(${dose} × ${volume}) ÷ ${concentracao} = ${volumeToAdminister.toFixed(2)} mL`,
          clinical_notes: `
            - Verificar compatibilidade de diluentes
            - Respeitar tempo de estabilidade
            - Usar técnica asséptica
            - Descartar após o tempo recomendado
          `
        };
      }
    };

    this.calculatorEngine.registerCalculator('medicamentos', calculator);
  }

  /**
   * Registrar calculadora de gotejamento
   */
  registerDripRateCalculator() {
    const calculator = {
      id: 'gotejamento',
      name: 'Cálculo de Gotejamento',
      schema: [
        { name: 'volume', label: 'Volume (mL)', type: 'number', required: true, min: 10, max: 5000 },
        { name: 'tempo', label: 'Tempo (minutos)', type: 'number', required: true, min: 1, max: 1440 },
        { name: 'fator', label: 'Fator de Gotejamento', type: 'number', required: true, min: 10, max: 60 }
      ],
      calculate: async (inputs) => {
        const { volume, tempo, fator } = inputs;
        
        if (volume <= 0 || tempo <= 0 || fator <= 0) {
          throw new Error('Todos os valores devem ser maiores que zero');
        }

        const gotejamento = Math.round((volume * fator) / tempo);

        return {
          value: gotejamento,
          unit: 'gotas/min',
          formula: `(${volume} mL × ${fator} gotas/mL) ÷ ${tempo} min = ${gotejamento} gotas/min`,
          clinical_notes: `
            - Verificar regularmente o gotejamento
            - Macrogotas: 10, 15, 20 gotas/mL
            - Microgotas: 60 gotas/mL
            - Ajustar conforme necessário
            - Monitorar sinais de infiltração
          `
        };
      }
    };

    this.calculatorEngine.registerCalculator('gotejamento', calculator);
  }

  /**
   * Registrar calculadora de IMC
   */
  registerBMICalculator() {
    const calculator = {
      id: 'imc',
      name: 'Índice de Massa Corporal',
      schema: [
        { name: 'peso', label: 'Peso (kg)', type: 'number', required: true, min: 1, max: 500 },
        { name: 'altura', label: 'Altura (m)', type: 'number', required: true, min: 0.5, max: 2.5 }
      ],
      calculate: async (inputs) => {
        const { peso, altura } = inputs;
        
        if (peso <= 0 || altura <= 0) {
          throw new Error('Valores devem ser maiores que zero');
        }

        const imc = peso / (altura * altura);
        let classification = '';
        let color = '';

        if (imc < 18.5) {
          classification = 'Abaixo do peso';
          color = 'blue';
        } else if (imc < 25) {
          classification = 'Peso normal';
          color = 'green';
        } else if (imc < 30) {
          classification = 'Sobrepeso';
          color = 'yellow';
        } else if (imc < 35) {
          classification = 'Obesidade Grau I';
          color = 'orange';
        } else if (imc < 40) {
          classification = 'Obesidade Grau II';
          color = 'red';
        } else {
          classification = 'Obesidade Grau III';
          color = 'darkred';
        }

        return {
          value: imc.toFixed(2),
          unit: 'kg/m²',
          classification,
          color,
          formula: `${peso} kg ÷ (${altura} × ${altura}) = ${imc.toFixed(2)} kg/m²`,
          clinical_notes: `
            - Classificação: ${classification}
            - Considerar fatores genéticos e musculares
            - Avaliar junto com outras medidas antropométricas
            - Orientar sobre hábitos saudáveis
          `
        };
      }
    };

    this.calculatorEngine.registerCalculator('imc', calculator);
  }

  /**
   * Registrar calculadoras de sinais vitais
   */
  registerVitalSignsCalculators() {
    // Frequência Cardíaca
    const heartRateCalculator = {
      id: 'frequencia-cardiaca',
      name: 'Frequência Cardíaca',
      schema: [
        { name: 'pulsos', label: 'Número de Pulsações', type: 'number', required: true, min: 1, max: 300 },
        { name: 'tempo', label: 'Tempo (minutos)', type: 'number', required: true, min: 1, max: 10 }
      ],
      calculate: async (inputs) => {
        const { pulsos, tempo } = inputs;
        const rate = pulsos / tempo;
        let classification = '';

        if (rate < 60) classification = 'Bradicardia';
        else if (rate <= 100) classification = 'Normal';
        else classification = 'Taquicardia';

        return {
          value: Math.round(rate),
          unit: 'bpm',
          classification,
          formula: `${pulsos} pulsações ÷ ${tempo} min = ${Math.round(rate)} bpm`,
          clinical_notes: `
            - Classificação: ${classification}
            - Normal em repouso: 60-100 bpm
            - Considerar idade e condição clínica
            - Avaliar ritmo e amplitude
          `
        };
      }
    };

    this.calculatorEngine.registerCalculator('frequencia-cardiaca', heartRateCalculator);

    // Frequência Respiratória
    const respiratoryRateCalculator = {
      id: 'frequencia-respiratoria',
      name: 'Frequência Respiratória',
      schema: [
        { name: 'respiracoes', label: 'Número de Respirações', type: 'number', required: true, min: 1, max: 100 },
        { name: 'tempo', label: 'Tempo (minutos)', type: 'number', required: true, min: 1, max: 10 }
      ],
      calculate: async (inputs) => {
        const { respiracoes, tempo } = inputs;
        const rate = respiracoes / tempo;
        let classification = '';

        if (rate < 12) classification = 'Bradipneia';
        else if (rate <= 20) classification = 'Normal';
        else if (rate <= 30) classification = 'Taquipneia';
        else classification = 'Taquipneia severa';

        return {
          value: Math.round(rate),
          unit: 'irpm',
          classification,
          formula: `${respiracoes} respirações ÷ ${tempo} min = ${Math.round(rate)} irpm`,
          clinical_notes: `
            - Classificação: ${classification}
            - Normal em repouso: 12-20 irpm
            - Avaliar profundidade e ritmo
            - Considerar esforço e fadiga
          `
        };
      }
    };

    this.calculatorEngine.registerCalculator('frequencia-respiratoria', respiratoryRateCalculator);
  }

  /**
   * Obter calculadora de enfermagem
   */
  getCalculator(id) {
    return this.calculatorEngine.getCalculator(id);
  }

  /**
   * Executar cálculo de enfermagem
   */
  async executeNursingCalculation(calculatorId, inputs) {
    return this.calculatorEngine.execute(calculatorId, inputs);
  }

  /**
   * Validar entrada clínica
   */
  validateClinicalInput(calculatorId, inputs) {
    const calculator = this.getCalculator(calculatorId);
    if (!calculator) return { valid: false, errors: ['Calculadora não encontrada'] };

    return this.calculatorEngine.validateInputs(calculator.schema, inputs);
  }

  /**
   * Gerar relatório de auditoria
   */
  generateAuditReport(calculatorId, inputs, result) {
    const calculator = this.getCalculator(calculatorId);
    if (!calculator) return null;

    return {
      timestamp: new Date().toISOString(),
      calculator: calculator.name,
      inputs,
      result,
      clinicalNotes: result.clinical_notes || '',
      formula: result.formula || '',
      auditedBy: 'Sistema de Calculadoras de Enfermagem',
      version: '2.0.0'
    };
  }

  /**
   * Buscar diagnósticos NANDA relacionados
   */
  getNANDADiagnoses(calculatorId) {
    const nandaDiagnoses = {
      'insulina': [
        { code: '00179', title: 'Glicemia instável', status: 'Risco' },
        { code: '00126', title: 'Conhecimento deficiente', status: 'Real' },
        { code: '00146', title: 'Ansiedade', status: 'Real' }
      ],
      'heparina': [
        { code: '00206', title: 'Sangramento', status: 'Risco' },
        { code: '00126', title: 'Conhecimento deficiente', status: 'Real' },
        { code: '00214', title: 'Risco de lesão', status: 'Risco' }
      ],
      'medicamentos': [
        { code: '00126', title: 'Conhecimento deficiente', status: 'Real' },
        { code: '00099', title: 'Ingestão nutricional ineficaz', status: 'Real' }
      ],
      'gotejamento': [
        { code: '00025', title: 'Desequilíbrio de líquidos', status: 'Risco' },
        { code: '00027', title: 'Deficiência de volume de líquidos', status: 'Real' }
      ]
    };

    return nandaDiagnoses[calculatorId] || [];
  }

  /**
   * Obter intervenções NIC relacionadas
   */
  getNICInterventions(calculatorId) {
    const nicInterventions = {
      'insulina': [
        { code: '2316', title: 'Administração de medicamentos: injeção' },
        { code: '5602', title: 'Ensino: processo de doença' },
        { code: '5614', title: 'Ensino: medicamento prescrito' }
      ],
      'heparina': [
        { code: '2316', title: 'Administração de medicamentos: injeção' },
        { code: '4238', title: 'Monitoração de coagulação' },
        { code: '2300', title: 'Administração de medicamentos' }
      ],
      'medicamentos': [
        { code: '2300', title: 'Administração de medicamentos' },
        { code: '5614', title: 'Ensino: medicamento prescrito' }
      ],
      'gotejamento': [
        { code: '4200', title: 'Administração de fluidos' },
        { code: '4238', title: 'Monitoração de coagulação' }
      ]
    };

    return nicInterventions[calculatorId] || [];
  }

  /**
   * Obter resultados NOC esperados
   */
  getNOCOutcomes(calculatorId) {
    const nocOutcomes = {
      'insulina': [
        { code: '1814', title: 'Conhecimento: medicamentos' },
        { code: '2300', title: 'Controle de glicemia' },
        { code: '1605', title: 'Controle de risco: diabetes' }
      ],
      'heparina': [
        { code: '1814', title: 'Conhecimento: medicamentos' },
        { code: '1908', title: 'Conhecimento: prevenção de trombose' }
      ],
      'medicamentos': [
        { code: '1814', title: 'Conhecimento: medicamentos' }
      ],
      'gotejamento': [
        { code: '0601', title: 'Equilíbrio de líquidos' },
        { code: '1602', title: 'Hidratação' }
      ]
    };

    return nocOutcomes[calculatorId] || [];
  }
}

// Instância global
window.NURSING_ENGINE = new NursingEngine({
  calculatorEngine: window.CALCULATOR_ENGINE,
  notificationManager: window.NOTIFICATION_MANAGER,
  accessibilityManager: window.ACCESSIBILITY_MANAGER
});

// Exportar
window.NursingEngine = NursingEngine;
