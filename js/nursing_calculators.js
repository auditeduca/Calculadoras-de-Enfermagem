/**
 * FUNÇÕES DE CÁLCULO DE ENFERMAGEM
 * Biblioteca de funções matemáticas específicas
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
     * Cálculo de Penicilina Cristalina
     */
    penicilina(dose_prescrita, diluicao, volume_seringa) {
        const dose = parseFloat(dose_prescrita) || 0;
        const dil = parseFloat(diluicao) || 0;
        const volume = parseFloat(volume_seringa) || 0;
        
        // Penicilina: 5.000.000 UI diluída em 8mL = 500.000 UI/mL
        const concentracao = 500000; // UI/mL após diluição padrão
        const resultado = (dose * volume) / concentracao;
        
        return {
            resultado: parseFloat(resultado.toFixed(4)),
            unidade: 'mL',
            dose_prescrita: dose,
            concentracao: `${concentracao.toLocaleString()} UI/mL`,
            volume_seringa: volume,
            formula: 'V = (Dose × Volume) ÷ 500.000',
            warning: 'Usar diluição padrão: 5.000.000 UI em 8mL de AD'
        };
    },
    
    /**
     * Cálculo de Gotejamento (macrogotas)
     */
    gotejamento_macrogotas(volume_total, tempo_minutos) {
        const volume = parseFloat(volume_total) || 0;
        const tempo = parseFloat(tempo_minutos) || 0;
        
        const resultado = (volume * 20) / tempo; // 20 gotas = 1mL
        
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
        
        const resultado = (volume * 60) / tempo; // 60 microgotas = 1mL
        
        return {
            resultado: parseFloat(resultado.toFixed(1)),
            unidade: 'microgotas/min',
            volume_total: volume,
            tempo_minutos: tempo,
            formula: 'Microgotas/min = (Volume × 60) ÷ Tempo'
        };
    },
    
    /**
     * Transformação de Soro
     */
    transformacao_soro(concentracao_atual, volume_atual, concentracao_desejada) {
        const conc_atual = parseFloat(concentracao_atual) || 0;
        const vol_atual = parseFloat(volume_atual) || 0;
        const conc_desejada = parseFloat(concentracao_desejada) || 0;
        
        // Fórmula: V1 × C1 = V2 × C2
        const volume_retirar = (vol_atual * (conc_atual - conc_desejada)) / conc_desejada;
        
        return {
            resultado: parseFloat(volume_retirar.toFixed(1)),
            unidade: 'mL',
            concentracao_atual: `${conc_atual}%`,
            volume_atual: `${vol_atual} mL`,
            concentracao_desejada: `${conc_desejada}%`,
            formula: 'V retirar = [V atual × (C atual - C desejada)] ÷ C desejada'
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
    },
    
    /**
     * Superfície Corporal (Mosteller)
     */
    superficie_corporal(peso, altura) {
        const pesoKg = parseFloat(peso) || 0;
        const alturaCm = parseFloat(altura) || 0;
        
        // Fórmula de Mosteller: √[(peso × altura) / 3600]
        const resultado = Math.sqrt((pesoKg * alturaCm) / 3600);
        
        return {
            resultado: parseFloat(resultado.toFixed(2)),
            unidade: 'm²',
            peso: `${pesoKg} kg`,
            altura: `${alturaCm} cm`,
            formula: 'SC = √[(Peso × Altura) ÷ 3600]'
        };
    },
    
    /**
     * Dosagem Pediátrica (Clark)
     */
    dosagem_pediatrica(peso, dose_adulto) {
        const pesoKg = parseFloat(peso) || 0;
        const doseAdulto = parseFloat(dose_adulto) || 0;
        
        // Fórmula de Clark: (Peso / 70) × Dose Adulto
        const resultado = (pesoKg / 70) * doseAdulto;
        
        return {
            resultado: parseFloat(resultado.toFixed(2)),
            unidade: 'mg ou mL',
            peso: `${pesoKg} kg`,
            dose_adulto: doseAdulto,
            formula: 'Dose Pediátrica = (Peso ÷ 70) × Dose Adulto'
        };
    },
    
    /**
     * Escala de Glasgow
     */
    escala_glasgow(ocular, verbal, motora) {
        const o = parseInt(ocular) || 1;
        const v = parseInt(verbal) || 1;
        const m = parseInt(motora) || 1;
        
        const total = o + v + m;
        let interpretacao = '';
        
        if (total <= 8) interpretacao = 'GRAVE - Intubação orotraqueal indicada';
        else if (total <= 12) interpretacao = 'MODERADO';
        else interpretacao = 'LEVE';
        
        return {
            resultado: total,
            unidade: 'pontos',
            ocular: `${o}/4`,
            verbal: `${v}/5`,
            motora: `${m}/6`,
            interpretacao: interpretacao,
            formula: 'GCS = Ocular + Verbal + Motora'
        };
    },
    
    /**
     * Escala de Braden
     */
    escala_braden(percepcao, umidade, atividade, mobilidade, nutricao, atrito) {
        const percep = parseInt(percepcao) || 1;
        const umid = parseInt(umidade) || 1;
        const ativ = parseInt(atividade) || 1;
        const mob = parseInt(mobilidade) || 1;
        const nut = parseInt(nutricao) || 1;
        const atrit = parseInt(atrito) || 1;
        
        const total = percep + umid + ativ + mob + nut + atrit;
        let risco = '';
        
        if (total <= 12) risco = 'ALTO RISCO';
        else if (total <= 14) risco = 'MODERADO RISCO';
        else if (total <= 18) risco = 'BAIXO RISCO';
        else risco = 'SEM RISCO';
        
        return {
            resultado: total,
            unidade: 'pontos',
            percepcao_sensorial: percep,
            umidade: umid,
            atividade: ativ,
            mobilidade: mob,
            nutricao: nut,
            friccao_cisalhamento: atrit,
            risco: risco,
            formula: 'Braden = Soma dos 6 subescores'
        };
    }
};

// Alias para funções comuns
NursingCalculators.calcularInsulina = NursingCalculators.insulina;
NursingCalculators.calcularHeparina = NursingCalculators.heparina;
NursingCalculators.calcularIMC = NursingCalculators.imc;