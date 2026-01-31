/**
 * CALCULATOR-ENGINE.JS - Motor de Cálculos
 * Executa operações matemáticas e validações de cálculos clínicos
 * * @author Calculadoras de Enfermagem
 * @version 2.0.1 (Fixed EventBus & Init)
 */

class CalculatorEngine {
  constructor(options = {}) {
    this.calculators = {};
    this.history = [];
    
    // CORREÇÃO CRÍTICA DO EVENTBUS
    // Verifica se foi passado nas opções, ou usa o global window.EventBus
    if (options.eventBus) {
        this.eventBus = options.eventBus;
    } else if (window.EventBus) {
        // Se window.EventBus for uma função (Classe), instancia. Se for objeto, usa direto.
        this.eventBus = typeof window.EventBus === 'function' 
            ? new window.EventBus() 
            : window.EventBus;
    } else {
        this.eventBus = null;
    }

    this.notificationManager = options.notificationManager || window.NOTIFICATION_MANAGER;
    this.accessibilityManager = options.accessibilityManager || window.ACCESSIBILITY_MANAGER;
  }

  /**
   * Registrar uma calculadora
   */
  registerCalculator(id, calculator) {
    this.calculators[id] = calculator;
    // Log removido para limpar console, ou descomente para debug
    // console.log(`✅ Calculadora '${id}' registrada`);
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
      if(this.notificationManager) this.notificationManager.error(error);
      return { success: false, error };
    }

    try {
      // Validar entradas
      const validation = this.validateInputs(calculator.schema, inputs);
      if (!validation.valid) {
        if(this.notificationManager) this.notificationManager.error(`Erro de validação: ${validation.errors.join(', ')}`);
        return { success: false, errors: validation.errors };
      }

      // Executar cálculo
      const result = await calculator.calculate(inputs);
      
      // Adicionar metadados
      const fullResult = {
        ...result,
        calculatorId,
        timestamp: new Date(),
        inputs
      };

      this.addToHistory(fullResult);
      
      if (this.eventBus && typeof this.eventBus.emit === 'function') {
        this.eventBus.emit('calculation:success', fullResult);
      }
      
      return { success: true, result: fullResult };

    } catch (error) {
      console.error(`Erro ao executar calculadora ${calculatorId}:`, error);
      if(this.notificationManager) this.notificationManager.error('Erro interno no cálculo');
      return { success: false, error: error.message };
    }
  }

  validateInputs(schema, inputs) {
    const errors = [];
    if(!schema) return { valid: true }; // Se não houver schema, assume válido

    schema.forEach(field => {
      const value = inputs[field.name];
      
      if (field.required && (value === undefined || value === '' || value === null)) {
        errors.push(`${field.label} é obrigatório`);
      }

      if (value !== undefined && value !== '' && field.type === 'number') {
        const num = parseFloat(value);
        if (field.min !== undefined && num < field.min) {
          errors.push(`${field.label} deve ser no mínimo ${field.min}`);
        }
        if (field.max !== undefined && num > field.max) {
          errors.push(`${field.label} deve ser no máximo ${field.max}`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }

  addToHistory(result) {
    this.history.unshift(result);
    if (this.history.length > 50) this.history.pop();
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }
}

// Exportar para o global para que NursingCalculators possa instanciar
window.CalculatorEngine = CalculatorEngine;