/**
 * CALCULATOR-ENGINE.JS - Motor de Cálculos
 * Executa operações matemáticas e validações de cálculos clínicos
 * @author Calculadoras de Enfermagem
 * @version 2.1.0 (Correções EventBus + Performance)
 */

class CalculatorEngine {
  constructor(options = {}) {
    this.calculators = new Map();
    this.history = [];
    this.maxHistorySize = 50;
    
    // Sistema de Eventos com Fallback Robusto
    this.eventBus = this.initEventBus(options);
    
    this.notificationManager = options.notificationManager || window.NOTIFICATION_MANAGER;
    this.accessibilityManager = options.accessibilityManager || window.ACCESSIBILITY_MANAGER;
    
    console.log('✅ CalculatorEngine inicializado');
  }

  /**
   * Inicializar EventBus com fallback em 3 níveis
   */
  initEventBus(options) {
    // 1. EventBus fornecido nas opções
    if (options.eventBus && typeof options.eventBus.emit === 'function') {
      return options.eventBus;
    }
    
    // 2. EventBus global existente
    if (window.EventBus) {
      if (typeof window.EventBus === 'function') {
        // Se for uma classe, instanciar
        return new window.EventBus();
      } else if (typeof window.EventBus.emit === 'function') {
        // Se já for uma instância, usar
        return window.EventBus;
      }
    }
    
    // 3. Fallback interno
    console.warn('⚠️ Usando EventBus interno (fallback)');
    return this.createInternalEventBus();
  }

  /**
   * Criar EventBus interno
   */
  createInternalEventBus() {
    const events = new Map();
    
    return {
      on: (eventName, callback) => {
        if (!events.has(eventName)) {
          events.set(eventName, []);
        }
        events.get(eventName).push(callback);
        
        // Retornar função para remover listener
        return () => {
          const listeners = events.get(eventName);
          if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          }
        };
      },
      
      once: (eventName, callback) => {
        const wrapper = (...args) => {
          callback(...args);
          this.off(eventName, wrapper);
        };
        this.on(eventName, wrapper);
      },
      
      off: (eventName, callback) => {
        const listeners = events.get(eventName);
        if (listeners) {
          const index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      },
      
      emit: (eventName, data = null) => {
        const listeners = events.get(eventName);
        if (listeners) {
          // Executar em uma microtask para evitar bloqueio
          setTimeout(() => {
            listeners.forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error(`Erro no listener de ${eventName}:`, error);
              }
            });
          }, 0);
        }
      },
      
      clear: () => {
        events.clear();
      }
    };
  }

  /**
   * Registrar uma calculadora
   */
  registerCalculator(id, calculator) {
    if (!id || typeof id !== 'string') {
      throw new Error('ID da calculadora inválido');
    }
    
    if (!calculator || typeof calculator.calculate !== 'function') {
      throw new Error('Calculadora inválida: deve ter método calculate');
    }
    
    this.calculators.set(id, {
      ...calculator,
      id,
      registeredAt: new Date()
    });
    
    console.log(`✅ Calculadora '${id}' registrada`);
    
    // Emitir evento de registro
    if (this.eventBus) {
      this.eventBus.emit('calculator:registered', { id, calculator });
    }
    
    return true;
  }

  /**
   * Obter calculadora registrada
   */
  getCalculator(id) {
    return this.calculators.get(id);
  }

  /**
   * Verificar se calculadora existe
   */
  hasCalculator(id) {
    return this.calculators.has(id);
  }

  /**
   * Listar todas as calculadoras
   */
  listCalculators() {
    return Array.from(this.calculators.keys());
  }

  /**
   * Executar cálculo de forma segura
   */
  async execute(calculatorId, inputs = {}) {
    const startTime = performance.now();
    
    // Verificar se calculadora existe
    const calculator = this.getCalculator(calculatorId);
    if (!calculator) {
      const error = `Calculadora '${calculatorId}' não encontrada`;
      this.handleError(error);
      return this.createErrorResponse(error, 'CALCULATOR_NOT_FOUND');
    }

    try {
      // Validar entradas
      const validation = this.validateInputs(calculator.schema, inputs);
      if (!validation.valid) {
        const errorMsg = `Erro de validação: ${validation.errors.join(', ')}`;
        this.handleError(errorMsg);
        return this.createErrorResponse(validation.errors, 'VALIDATION_ERROR');
      }

      // Executar cálculo com timeout
      const result = await this.executeWithTimeout(
        () => calculator.calculate(inputs),
        10000 // Timeout de 10 segundos
      );
      
      // Adicionar metadados
      const executionTime = performance.now() - startTime;
      const fullResult = {
        ...result,
        calculatorId,
        timestamp: new Date(),
        inputs,
        executionTime,
        metadata: {
          version: calculator.version || '1.0.0',
          schemaVersion: calculator.schemaVersion || '1.0'
        }
      };

      // Adicionar ao histórico
      this.addToHistory(fullResult);
      
      // Emitir evento de sucesso
      if (this.eventBus) {
        this.eventBus.emit('calculation:success', fullResult);
      }
      
      // Feedback de acessibilidade
      if (this.accessibilityManager && result.resultado) {
        this.accessibilityManager.announceCalculationResult(
          result.resultado, 
          result.unidade || ''
        );
      }
      
      return {
        success: true,
        result: fullResult,
        executionTime
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      console.error(`❌ Erro ao executar calculadora ${calculatorId}:`, error);
      
      this.handleError(error.message || 'Erro interno no cálculo');
      
      return {
        success: false,
        error: error.message,
        errorType: this.getErrorType(error),
        executionTime
      };
    }
  }

  /**
   * Executar com timeout
   */
  async executeWithTimeout(promise, timeoutMs) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Timeout após ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise(), timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Validar inputs contra schema
   */
  validateInputs(schema, inputs) {
    const errors = [];
    
    // Se não houver schema, assume válido
    if (!schema || !Array.isArray(schema)) {
      return { valid: true, errors: [] };
    }

    schema.forEach(field => {
      const value = inputs[field.name];
      
      // Verificar campo obrigatório
      if (field.required && (value === undefined || value === '' || value === null)) {
        errors.push(`${field.label || field.name} é obrigatório`);
        return;
      }

      // Se campo não está presente, pular outras validações
      if (value === undefined || value === '') {
        return;
      }

      // Validação de tipo
      switch (field.type) {
        case 'number':
          this.validateNumberField(field, value, errors);
          break;
          
        case 'string':
          this.validateStringField(field, value, errors);
          break;
          
        case 'select':
          this.validateSelectField(field, value, errors);
          break;
          
        case 'date':
          this.validateDateField(field, value, errors);
          break;
      }
    });

    return { 
      valid: errors.length === 0, 
      errors 
    };
  }

  /**
   * Validar campo numérico
   */
  validateNumberField(field, value, errors) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      errors.push(`${field.label} deve ser um número válido`);
      return;
    }
    
    // Validar limites
    if (field.min !== undefined && num < field.min) {
      errors.push(`${field.label} deve ser no mínimo ${field.min}`);
    }
    
    if (field.max !== undefined && num > field.max) {
      errors.push(`${field.label} deve ser no máximo ${field.max}`);
    }
    
    // Validar passo
    if (field.step !== undefined) {
      const remainder = (num - (field.min || 0)) % field.step;
      if (Math.abs(remainder) > 0.0001) {
        errors.push(`${field.label} deve ser múltiplo de ${field.step}`);
      }
    }
    
    // Validar decimais
    if (field.decimals !== undefined) {
      const decimalPart = value.toString().split('.')[1];
      if (decimalPart && decimalPart.length > field.decimals) {
        errors.push(`${field.label} deve ter no máximo ${field.decimals} casas decimais`);
      }
    }
  }

  /**
   * Validar campo de texto
   */
  validateStringField(field, value, errors) {
    const str = String(value);
    
    if (field.minLength && str.length < field.minLength) {
      errors.push(`${field.label} deve ter no mínimo ${field.minLength} caracteres`);
    }
    
    if (field.maxLength && str.length > field.maxLength) {
      errors.push(`${field.label} deve ter no máximo ${field.maxLength} caracteres`);
    }
    
    if (field.pattern && !new RegExp(field.pattern).test(str)) {
      const message = field.patternMessage || `${field.label} tem formato inválido`;
      errors.push(message);
    }
  }

  /**
   * Validar campo select
   */
  validateSelectField(field, value, errors) {
    if (!field.options) return;
    
    const validValues = field.options.map(opt => opt.value);
    if (!validValues.includes(value)) {
      errors.push(`${field.label} deve ser uma das opções válidas`);
    }
  }

  /**
   * Validar campo data
   */
  validateDateField(field, value, errors) {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      errors.push(`${field.label} deve ser uma data válida`);
      return;
    }
    
    if (field.minDate) {
      const minDate = new Date(field.minDate);
      if (date < minDate) {
        errors.push(`${field.label} deve ser após ${minDate.toLocaleDateString()}`);
      }
    }
    
    if (field.maxDate) {
      const maxDate = new Date(field.maxDate);
      if (date > maxDate) {
        errors.push(`${field.label} deve ser antes ${maxDate.toLocaleDateString()}`);
      }
    }
  }

  /**
   * Adicionar ao histórico com limite
   */
  addToHistory(result) {
    // Adicionar no início do array
    this.history.unshift(result);
    
    // Manter apenas os últimos itens
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
    
    // Emitir evento de histórico atualizado
    if (this.eventBus) {
      this.eventBus.emit('history:updated', this.history);
    }
  }

  /**
   * Obter histórico
   */
  getHistory(limit = 10) {
    return this.history.slice(0, limit);
  }

  /**
   * Limpar histórico
   */
  clearHistory() {
    const count = this.history.length;
    this.history = [];
    
    // Emitir evento de limpeza
    if (this.eventBus) {
      this.eventBus.emit('history:cleared', { count });
    }
    
    return count;
  }

  /**
   * Exportar histórico
   */
  exportHistory(format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.history, null, 2);
        
      case 'csv':
        return this.convertHistoryToCSV();
        
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  }

  /**
   * Converter histórico para CSV
   */
  convertHistoryToCSV() {
    if (this.history.length === 0) return '';
    
    // Obter cabeçalhos
    const headers = ['Data', 'Calculadora', 'Resultado', 'Unidade'];
    
    // Converter dados
    const rows = this.history.map(item => [
      item.timestamp.toISOString(),
      item.calculatorId,
      item.resultado || '',
      item.unidade || ''
    ]);
    
    // Combinar em CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }

  /**
   * Tratar erro
   */
  handleError(errorMessage) {
    // Notificação visual
    if (this.notificationManager) {
      this.notificationManager.error(errorMessage);
    }
    
    // Log no console
    console.error('❌ CalculatorEngine Error:', errorMessage);
    
    // Emitir evento de erro
    if (this.eventBus) {
      this.eventBus.emit('calculation:error', { 
        message: errorMessage,
        timestamp: new Date()
      });
    }
  }

  /**
   * Criar resposta de erro padronizada
   */
  createErrorResponse(errors, errorType = 'UNKNOWN_ERROR') {
    return {
      success: false,
      error: Array.isArray(errors) ? errors.join(', ') : errors,
      errorType,
      timestamp: new Date()
    };
  }

  /**
   * Obter tipo de erro
   */
  getErrorType(error) {
    if (error.message.includes('Timeout')) return 'TIMEOUT_ERROR';
    if (error.message.includes('valid')) return 'VALIDATION_ERROR';
    if (error.message.includes('not found')) return 'NOT_FOUND_ERROR';
    return 'RUNTIME_ERROR';
  }
}

// Exportar para global
if (typeof window !== 'undefined') {
  window.CalculatorEngine = CalculatorEngine;
}

export default CalculatorEngine;