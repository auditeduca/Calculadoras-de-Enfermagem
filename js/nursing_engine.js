/**
 * MOTOR DE CÁLCULOS DE ENFERMAGEM
 * Executa cálculos baseados em funções específicas
 */

window.NURSING_ENGINE = {
    
    // Cache de cálculos
    cache: new Map(),
    
    // Histórico de cálculos
    history: [],
    
    /**
     * Executar cálculo
     */
    async calculate(calculatorId, formData) {
        if (!calculatorId || !formData) {
            throw new Error('Parâmetros inválidos para cálculo');
        }
        
        // Verificar cache
        const cacheKey = this.generateCacheKey(calculatorId, formData);
        if (this.cache.has(cacheKey)) {
            console.log('📦 Retornando resultado do cache');
            return this.cache.get(cacheKey);
        }
        
        try {
            // Executar cálculo específico
            const result = await this.executeSpecificCalculation(calculatorId, formData);
            
            // Adicionar metadata
            result._metadata = {
                calculatorId,
                timestamp: new Date().toISOString(),
                formData: { ...formData }
            };
            
            // Armazenar no cache
            this.cache.set(cacheKey, result);
            
            // Adicionar ao histórico
            this.addToHistory(result);
            
            return result;
            
        } catch (error) {
            console.error(`Erro no cálculo ${calculatorId}:`, error);
            throw new Error(`Falha no cálculo: ${error.message}`);
        }
    },
    
    /**
     * Executar cálculo específico baseado no ID
     */
    async executeSpecificCalculation(calculatorId, formData) {
        // Verificar se há função específica no módulo de calculadoras
        if (window.NursingCalculators && typeof window.NursingCalculators[calculatorId] === 'function') {
            return window.NursingCalculators[calculatorId](...Object.values(formData));
        }
        
        // Casos específicos baseados no ID
        switch (calculatorId) {
            case 'insulina':
                return this.calcularInsulina(formData);
                
            case 'heparina':
                return this.calcularHeparina(formData);
                
            case 'penicilina':
                return this.calcularPenicilina(formData);
                
            case 'gotejamento':
                return this.calcularGotejamento(formData);
                
            case 'transformacao-soro':
                return this.calcularTransformacaoSoro(formData);
                
            case 'diluicao-medicamento':
                return this.calcularDiluicaoMedicamento(formData);
                
            case 'microgotas-minuto':
                return this.calcularMicrogotasMinuto(formData);
                
            case 'dosagem-pediatrica':
                return this.calcularDosagemPediatrica(formData);
                
            case 'superficie-corporal':
                return this.calcularSuperficieCorporal(formData);
                
            case 'glasgow':
                return this.calcularEscalaGlasgow(formData);
                
            case 'braden':
                return this.calcularEscalaBraden(formData);
                
            case 'waterlow':
                return this.calcularEscalaWaterlow(formData);
                
            case 'apgar':
                return this.calcularEscalaApgar(formData);
                
            case 'peso-ideal':
                return this.calcularPesoIdeal(formData);
                
            case 'imc':
                return this.calcularIMC(formData);
                
            default:
                throw new Error(`Calculadora "${calculatorId}" não implementada`);
        }
    },
    
    /**
     * Cálculo de Insulina
     */
    calcularInsulina(formData) {
        const { dose_prescrita, concentracao_frasco, volume_seringa } = formData;
        
        if (!dose_prescrita || !concentracao_frasco || !volume_seringa) {
            throw new Error('Preencha todos os campos obrigatórios');
        }
        
        const dose = parseFloat(dose_prescrita);
        const concentracao = parseFloat(concentracao_frasco);
        const volume = parseFloat(volume_seringa);
        
        if (dose <= 0 || concentracao <= 0 || volume <= 0) {
            throw new Error('Valores devem ser positivos');
        }
        
        const resultado = (dose * volume) / concentracao;
        
        // Validação de segurança
        if (resultado > volume) {
            throw new Error('Volume calculado excede capacidade da seringa! Verifique os valores.');
        }
        
        // Alerta para dose elevada
        let warning = null;
        if (dose > 100) {
            warning = 'ALERTA: Dose superior a 100 UI. Verificar dupla checagem obrigatória.';
        }
        
        return {
            resultado: parseFloat(resultado.toFixed(2)),
            unidade: 'mL',
            dose_prescrita: `${dose} UI`,
            concentracao_frasco: `${concentracao} UI/mL`,
            volume_seringa: `${volume} mL`,
            formula: 'V = (Dose Prescrita × Volume Seringa) ÷ Concentração Frasco',
            calculation: `V = (${dose} × ${volume}) ÷ ${concentracao} = ${resultado.toFixed(2)} mL`,
            warning: warning,
            interpretation: this.interpretarInsulina(resultado, dose)
        };
    },
    
    /**
     * Cálculo de Heparina
     */
    calcularHeparina(formData) {
        const { dose_prescrita, concentracao_frasco, volume_seringa } = formData;
        
        const dose = parseFloat(dose_prescrita) || 0;
        const concentracao = parseFloat(concentracao_frasco) || 0;
        const volume = parseFloat(volume_seringa) || 0;
        
        if (dose <= 0 || concentracao <= 0 || volume <= 0) {
            throw new Error('Valores devem ser positivos');
        }
        
        const resultado = (dose * volume) / concentracao;
        
        return {
            resultado: parseFloat(resultado.toFixed(2)),
            unidade: 'mL',
            dose_prescrita: `${dose} UI`,
            concentracao_frasco: `${concentracao} UI/mL`,
            volume_seringa: `${volume} mL`,
            formula: 'V = (Dose Prescrita × Volume Seringa) ÷ Concentração Frasco',
            calculation: `V = (${dose} × ${volume}) ÷ ${concentracao} = ${resultado.toFixed(2)} mL`
        };
    },
    
    /**
     * Cálculo de Gotejamento
     */
    calcularGotejamento(formData) {
        const { volume_total, tempo_minutos, tipo_gotejamento } = formData;
        
        const volume = parseFloat(volume_total) || 0;
        const tempo = parseFloat(tempo_minutos) || 0;
        
        if (volume <= 0 || tempo <= 0) {
            throw new Error('Valores devem ser positivos');
        }
        
        let resultado, formula, unidade;
        
        if (tipo_gotejamento === 'macrogotas') {
            resultado = (volume * 20) / tempo;
            formula = 'Gotas/min = (Volume × 20) ÷ Tempo (minutos)';
            unidade = 'gotas/min';
        } else {
            resultado = (volume * 60) / tempo;
            formula = 'Microgotas/min = (Volume × 60) ÷ Tempo (minutos)';
            unidade = 'microgotas/min';
        }
        
        return {
            resultado: parseFloat(resultado.toFixed(1)),
            unidade: unidade,
            volume_total: `${volume} mL`,
            tempo_minutos: `${tempo} min`,
            tipo_gotejamento: tipo_gotejamento === 'macrogotas' ? 'Macrogotas' : 'Microgotas',
            formula: formula,
            calculation: tipo_gotejamento === 'macrogotas' 
                ? `(${volume} × 20) ÷ ${tempo} = ${resultado.toFixed(1)} gotas/min`
                : `(${volume} × 60) ÷ ${tempo} = ${resultado.toFixed(1)} microgotas/min`
        };
    },
    
    /**
     * Cálculo de IMC
     */
    calcularIMC(formData) {
        const { peso, altura } = formData;
        
        const pesoKg = parseFloat(peso) || 0;
        const alturaM = parseFloat(altura) || 0;
        
        if (pesoKg <= 0 || alturaM <= 0) {
            throw new Error('Valores devem ser positivos');
        }
        
        const imc = pesoKg / (alturaM * alturaM);
        const classificacao = this.classificarIMC(imc);
        
        return {
            resultado: parseFloat(imc.toFixed(1)),
            unidade: 'kg/m²',
            peso: `${pesoKg} kg`,
            altura: `${alturaM} m`,
            classificacao: classificacao.nivel,
            interpretacao: classificacao.descricao,
            formula: 'IMC = Peso (kg) ÷ Altura² (m)',
            calculation: `IMC = ${pesoKg} ÷ (${alturaM}²) = ${imc.toFixed(1)} kg/m²`
        };
    },
    
    /**
     * Classificar IMC
     */
    classificarIMC(imc) {
        if (imc < 18.5) {
            return { nivel: 'Baixo peso', descricao: 'Abaixo do peso ideal' };
        } else if (imc < 25) {
            return { nivel: 'Peso normal', descricao: 'Peso dentro da normalidade' };
        } else if (imc < 30) {
            return { nivel: 'Sobrepeso', descricao: 'Acima do peso ideal' };
        } else if (imc < 35) {
            return { nivel: 'Obesidade Grau I', descricao: 'Obesidade leve' };
        } else if (imc < 40) {
            return { nivel: 'Obesidade Grau II', descricao: 'Obesidade moderada' };
        } else {
            return { nivel: 'Obesidade Grau III', descricao: 'Obesidade grave' };
        }
    },
    
    /**
     * Interpretar resultado de insulina
     */
    interpretarInsulina(volume, dose) {
        if (volume < 0.1) {
            return 'Volume muito baixo. Verificar cálculo e considerar seringa de insulina específica (100 UI/mL).';
        } else if (volume > 1) {
            return 'Volume elevado. Confirmar concentração do frasco e dose prescrita.';
        } else {
            return 'Volume dentro da faixa esperada para seringas de 1mL.';
        }
    },
    
    /**
     * Gerar chave de cache
     */
    generateCacheKey(calculatorId, formData) {
        const sortedData = Object.keys(formData)
            .sort()
            .map(key => `${key}:${formData[key]}`)
            .join('|');
        
        return `${calculatorId}|${sortedData}`;
    },
    
    /**
     * Adicionar ao histórico
     */
    addToHistory(result) {
        this.history.push({
            ...result,
            timestamp: new Date().toISOString()
        });
        
        // Manter apenas últimos 50 cálculos
        if (this.history.length > 50) {
            this.history.shift();
        }
    },
    
    /**
     * Limpar cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache de cálculos limpo');
    },
    
    /**
     * Limpar histórico
     */
    clearHistory() {
        this.history = [];
        console.log('🗑️ Histórico de cálculos limpo');
    },
    
    /**
     * Obter histórico
     */
    getHistory(limit = 10) {
        return this.history.slice(-limit).reverse();
    },
    
    /**
     * Validar dados do formulário
     */
    validateFormData(formData, requiredFields = []) {
        const errors = [];
        
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                errors.push(`Campo "${field}" é obrigatório`);
            }
        });
        
        // Validar valores numéricos positivos
        Object.entries(formData).forEach(([key, value]) => {
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue < 0) {
                errors.push(`Campo "${key}" não pode ser negativo`);
            }
        });
        
        return errors;
    }
};