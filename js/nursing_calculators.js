/**
 * FUNÇÕES DE CÁLCULO DE ENFERMAGEM
 */

window.NursingCalculators = {
    
    /**
     * Cálculo de Insulina (função principal)
     */
    insulina(dose_prescrita, concentracao_frasco, volume_seringa) {
        const dose = parseFloat(dose_prescrita) || 0;
        const concentracao = parseFloat(concentracao_frasco) || 0;
        const volume = parseFloat(volume_seringa) || 0;
        
        if (dose <= 0 || concentracao <= 0 || volume <= 0) {
            return { error: 'Todos os valores devem ser positivos' };
        }
        
        const resultado = (dose * volume) / concentracao;
        
        return {
            resultado: parseFloat(resultado.toFixed(4)),
            unidade: 'mL',
            dose_prescrita: `${dose} UI`,
            concentracao_frasco: `${concentracao} UI/mL`,
            volume_seringa: `${volume} mL`,
            formula: 'V = (Dose × Volume) ÷ Concentração',
            calculation: `(${dose} × ${volume}) ÷ ${concentracao} = ${resultado.toFixed(4)}`,
            warning: dose > 100 ? 'ALERTA MAV: Dose superior a 100 UI' : null
        };
    },
    
    /**
     * Cálculo de Heparina
     */
    heparina(dose_prescrita, concentracao_frasco, volume_seringa) {
        const dose = parseFloat(dose_prescrita) || 0;
        const concentracao = parseFloat(concentracao_frasco) || 0;
        const volume = parseFloat(volume_seringa) || 0;
        
        const resultado = (dose * volume) / concentracao;
        
        return {
            resultado: parseFloat(resultado.toFixed(4)),
            unidade: 'mL',
            dose_prescrita: dose,
            concentracao_frasco: concentracao,
            volume_seringa: volume,
            formula: 'V = (Dose × Volume) ÷ Concentração'
        };
    },
    
    /**
     * Cálculo de Gotejamento (macrogotas)
     */
    gotejamento_macrogotas(volume_total, tempo_minutos) {
        const volume = parseFloat(volume_total) || 0;
        const tempo = parseFloat(tempo_minutos) || 0;
        
        const resultado = (volume * 20) / tempo;
        
        return {
            resultado: parseFloat(resultado.toFixed(1)),
            unidade: 'gotas/min',
            volume_total: volume,
            tempo_minutos: tempo,
            formula: 'Gotas/min = (Volume × 20) ÷ Tempo'
        };
    },
    
    /**
     * Cálculo de Gotejamento (microgotas)
     */
    gotejamento_microgotas(volume_total, tempo_minutos) {
        const volume = parseFloat(volume_total) || 0;
        const tempo = parseFloat(tempo_minutos) || 0;
        
        const resultado = (volume * 60) / tempo;
        
        return {
            resultado: parseFloat(resultado.toFixed(1)),
            unidade: 'microgotas/min',
            volume_total: volume,
            tempo_minutos: tempo,
            formula: 'Microgotas/min = (Volume × 60) ÷ Tempo'
        };
    },
    
    /**
     * Cálculo de IMC
     */
    imc(peso, altura) {
        const pesoKg = parseFloat(peso) || 0;
        const alturaM = parseFloat(altura) || 0;
        
        const resultado = pesoKg / (alturaM * alturaM);
        let classificacao = '';
        
        if (resultado < 18.5) classificacao = 'Baixo peso';
        else if (resultado < 25) classificacao = 'Peso normal';
        else if (resultado < 30) classificacao = 'Sobrepeso';
        else if (resultado < 35) classificacao = 'Obesidade Grau I';
        else if (resultado < 40) classificacao = 'Obesidade Grau II';
        else classificacao = 'Obesidade Grau III';
        
        return {
            resultado: parseFloat(resultado.toFixed(1)),
            unidade: 'kg/m²',
            peso: pesoKg,
            altura: alturaM,
            classificacao: classificacao,
            formula: 'IMC = Peso ÷ Altura²'
        };
    }
};

// Alias para funções comuns
NursingCalculators.calcularInsulina = NursingCalculators.insulina;
NursingCalculators.calcularHeparina = NursingCalculators.heparina;
NursingCalculators.calcularIMC = NursingCalculators.imc;