/**
 * CALCULATOR-ENGINE.JS - Motor de Cálculos
 * Executa operações matemáticas e validações de cálculos clínicos
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class CalculatorEngine {
  constructor(options = {}) {
    this.calculators = {};
    this.history = [];
    this.eventBus = options.eventBus || window.EventBus ? new window.EventBus() : null;
    this.notificationManager = options.notificationManager || window.NOTIFICATION_MANAGER;
    this.accessibilityManager = options.accessibilityManager || window.ACCESSIBILITY_MANAGER;
  }

  /**
   * Registrar uma calculadora
   */
  registerCalculator(id, calculator) {
    this.calculators[id] = calculator;
    console.log(`✅ Calculadora '${id}' registrada`);
  }

  /**
   * Obter calculadora registrada
   */
  getCalculator(id) {
    return this.calculators[id];
  }

  /**
   * Executar cálculo
   */
  async execute(calculatorId, inputs = {}) {
    const calculator = this.getCalculator(calculatorId);
    
    if (!calculator) {
      const error = `Calculadora '${calculatorId}' não encontrada`;
      this.notificationManager.error(error);
      return { success: false, error };
    }

    try {
      // Validar entradas
      const validation = this.validateInputs(calculator.schema, inputs);
      if (!validation.valid) {
        this.notificationManager.error(`Erro de validação: ${validation.errors.join(', ')}`);
        return { success: false, errors: validation.errors };
      }

      // Executar cálculo
      const result = await calculator.calculate(inputs);

      // Salvar no histórico
      this.addToHistory({
        calculatorId,
        inputs,
        result,
        timestamp: new Date().toISOString()
      });

      // Anunciar resultado
      if (this.accessibilityManager) {
        this.accessibilityManager.announceCalculationResult(result.value, result.unit);
      }

      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('calculation:completed', { calculatorId, result });
      }

      return { success: true, result };
    } catch (error) {
      console.error('Erro ao executar cálculo:', error);
      this.notificationManager.error('Erro ao executar cálculo');
      return { success: false, error: error.message };
    }
  }

  /**
   * Validar entradas
   */
  validateInputs(schema, inputs) {
    const errors = [];

    if (!schema) {
      return { valid: true };
    }

    for (const field of schema) {
      const value = inputs[field.name];

      // Validar obrigatoriedade
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field.label} é obrigatório`);
        continue;
      }

      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Validar tipo
      if (field.type === 'number') {
        if (isNaN(value)) {
          errors.push(`${field.label} deve ser um número`);
        } else if (field.min !== undefined && Number(value) < field.min) {
          errors.push(`${field.label} deve ser maior ou igual a ${field.min}`);
        } else if (field.max !== undefined && Number(value) > field.max) {
          errors.push(`${field.label} deve ser menor ou igual a ${field.max}`);
        }
      }

      // Validar padrão
      if (field.pattern && !field.pattern.test(value)) {
        errors.push(`${field.label} tem formato inválido`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Adicionar ao histórico
   */
  addToHistory(entry) {
    this.history.push(entry);
    
    // Manter apenas últimas 100 entradas
    if (this.history.length > 100) {
      this.history.shift();
    }

    // Salvar no localStorage
    const stored = JSON.parse(localStorage.getItem('calculator_history') || '[]');
    stored.push(entry);
    localStorage.setItem('calculator_history', JSON.stringify(stored.slice(-100)));
  }

  /**
   * Obter histórico
   */
  getHistory(calculatorId = null) {
    if (calculatorId) {
      return this.history.filter(h => h.calculatorId === calculatorId);
    }
    return this.history;
  }

  /**
   * Limpar histórico
   */
  clearHistory() {
    this.history = [];
    localStorage.removeItem('calculator_history');
  }

  /**
   * Calcular insulina (exemplo)
   */
  calculateInsulin(prescricao, concentracao) {
    if (!prescricao || !concentracao) {
      throw new Error('Prescrição e concentração são obrigatórias');
    }

    const volume = prescricao / concentracao;
    return {
      value: volume.toFixed(2),
      unit: 'mL',
      formula: `${prescricao} UI ÷ ${concentracao} UI/mL = ${volume.toFixed(2)} mL`
    };
  }

  /**
   * Calcular heparina
   */
  calculateHeparin(prescricao, concentracao) {
    if (!prescricao || !concentracao) {
      throw new Error('Prescrição e concentração são obrigatórias');
    }

    const volume = prescricao / concentracao;
    return {
      value: volume.toFixed(2),
      unit: 'mL',
      formula: `${prescricao} UI ÷ ${concentracao} UI/mL = ${volume.toFixed(2)} mL`
    };
  }

  /**
   * Calcular medicamento
   */
  calculateMedication(dose, concentration, volume = 1) {
    if (!dose || !concentration) {
      throw new Error('Dose e concentração são obrigatórias');
    }

    const result = (dose * volume) / concentration;
    return {
      value: result.toFixed(2),
      unit: 'mL',
      formula: `(${dose} × ${volume}) ÷ ${concentration} = ${result.toFixed(2)} mL`
    };
  }

  /**
   * Calcular gotejamento
   */
  calculateDripRate(volume, time, dropFactor = 20) {
    if (!volume || !time) {
      throw new Error('Volume e tempo são obrigatórios');
    }

    const rate = (volume * dropFactor) / time;
    return {
      value: Math.round(rate),
      unit: 'gotas/min',
      formula: `(${volume} mL × ${dropFactor} gotas/mL) ÷ ${time} min = ${Math.round(rate)} gotas/min`
    };
  }

  /**
   * Calcular IMC
   */
  calculateBMI(weight, height) {
    if (!weight || !height) {
      throw new Error('Peso e altura são obrigatórios');
    }

    const bmi = weight / (height * height);
    let classification = '';

    if (bmi < 18.5) classification = 'Abaixo do peso';
    else if (bmi < 25) classification = 'Peso normal';
    else if (bmi < 30) classification = 'Sobrepeso';
    else if (bmi < 35) classification = 'Obesidade Grau I';
    else if (bmi < 40) classification = 'Obesidade Grau II';
    else classification = 'Obesidade Grau III';

    return {
      value: bmi.toFixed(2),
      unit: 'kg/m²',
      classification,
      formula: `${weight} kg ÷ (${height} × ${height}) = ${bmi.toFixed(2)} kg/m²`
    };
  }

  /**
   * Calcular frequência cardíaca
   */
  calculateHeartRate(pulses, time = 1) {
    if (!pulses) {
      throw new Error('Número de pulsações é obrigatório');
    }

    const rate = pulses / time;
    let classification = '';

    if (rate < 60) classification = 'Bradicardia';
    else if (rate <= 100) classification = 'Normal';
    else classification = 'Taquicardia';

    return {
      value: Math.round(rate),
      unit: 'bpm',
      classification,
      formula: `${pulses} pulsações ÷ ${time} min = ${Math.round(rate)} bpm`
    };
  }

  /**
   * Calcular frequência respiratória
   */
  calculateRespiratoryRate(respirations, time = 1) {
    if (!respirations) {
      throw new Error('Número de respirações é obrigatório');
    }

    const rate = respirations / time;
    let classification = '';

    if (rate < 12) classification = 'Bradipneia';
    else if (rate <= 20) classification = 'Normal';
    else if (rate <= 30) classification = 'Taquipneia';
    else classification = 'Taquipneia severa';

    return {
      value: Math.round(rate),
      unit: 'irpm',
      classification,
      formula: `${respirations} respirações ÷ ${time} min = ${Math.round(rate)} irpm`
    };
  }

  /**
   * Calcular pressão arterial média
   */
  calculateMeanArterialPressure(systolic, diastolic) {
    if (!systolic || !diastolic) {
      throw new Error('Pressão sistólica e diastólica são obrigatórias');
    }

    const map = (systolic + (2 * diastolic)) / 3;
    let classification = '';

    if (map < 60) classification = 'Hipotensão';
    else if (map < 70) classification = 'Baixa';
    else if (map <= 100) classification = 'Normal';
    else classification = 'Elevada';

    return {
      value: map.toFixed(2),
      unit: 'mmHg',
      classification,
      formula: `(${systolic} + (2 × ${diastolic})) ÷ 3 = ${map.toFixed(2)} mmHg`
    };
  }

  /**
   * Calcular taxa de filtração glomerular
   */
  calculateGFR(creatinine, age, weight, gender = 'M') {
    if (!creatinine || !age || !weight) {
      throw new Error('Creatinina, idade e peso são obrigatórios');
    }

    // Fórmula de Cockcroft-Gault
    let gfr = ((140 - age) * weight) / (72 * creatinine);
    if (gender === 'F') {
      gfr = gfr * 0.85;
    }

    let classification = '';
    if (gfr >= 90) classification = 'Normal ou elevado';
    else if (gfr >= 60) classification = 'Levemente diminuído';
    else if (gfr >= 45) classification = 'Diminuição leve a moderada';
    else if (gfr >= 30) classification = 'Diminuição moderada a severa';
    else if (gfr >= 15) classification = 'Severa';
    else classification = 'Falha renal';

    return {
      value: gfr.toFixed(2),
      unit: 'mL/min/1.73m²',
      classification,
      formula: `((140 - ${age}) × ${weight}) ÷ (72 × ${creatinine}) = ${gfr.toFixed(2)} mL/min/1.73m²`
    };
  }
}

// Instância global
window.CALCULATOR_ENGINE = new CalculatorEngine({
  eventBus: window.EventBus ? new window.EventBus() : null,
  notificationManager: window.NOTIFICATION_MANAGER,
  accessibilityManager: window.ACCESSIBILITY_MANAGER
});

// Exportar
window.CalculatorEngine = CalculatorEngine;
