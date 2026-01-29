/**
 * Nursing Calculators - JavaScript Logic
 * Lógica de cálculo para todas as calculadoras de enfermagem
 */

const NursingCalculators = {
  /**
   * Heparina - Calcula dosagem e diluição
   * @param {number} concentracao - Concentração da ampola em UI
   * @param {number} volume - Volume da ampola em ml
   * @param {number} prescricao - Prescrição médica em UI
   * @returns {object} Resultado do cálculo
   */
  heparina: function(concentracao, volume, prescricao) {
    if (!concentracao || !volume || !prescricao) {
      return { error: "Todos os campos são obrigatórios" };
    }

    const volumeAspirar = (prescricao / concentracao) * volume;
    
    return {
      volumeAspirar: parseFloat(volumeAspirar.toFixed(2)),
      unidade: "ml",
      prescricao: prescricao,
      concentracao: concentracao,
      volume: volume,
      referencia: "1 UI = 0.01 UI da seringa de 1 ml"
    };
  },

  /**
   * Insulina - Calcula dosagem em UI para seringa de insulina
   * @param {number} prescricao - Prescrição em UI
   * @param {string} tipoSeringa - Tipo de seringa (100 ou 300)
   * @returns {object} Resultado do cálculo
   */
  insulina: function(prescricao, tipoSeringa = "100") {
    if (!prescricao) {
      return { error: "Prescrição é obrigatória" };
    }

    let volumeMl;
    
    if (tipoSeringa === "100") {
      // Seringa de 1mL com 100 UI
      volumeMl = prescricao / 100;
    } else if (tipoSeringa === "300") {
      // Seringa de 3mL com 300 UI
      volumeMl = prescricao / 100;
    } else {
      return { error: "Tipo de seringa inválido" };
    }

    return {
      prescricao: prescricao,
      volumeMl: parseFloat(volumeMl.toFixed(2)),
      unidade: "ml",
      tipoSeringa: tipoSeringa,
      warning: "INSULINA É UMA MEDICAÇÃO DE ALTA VIGILÂNCIA (MAV) - DUPLA CHECAGEM OBRIGATÓRIA"
    };
  },

  /**
   * Balanço Hídrico - Calcula balanço entre ingestão e eliminação
   * @param {object} ingestao - Objeto com volumes ingeridos
   * @param {object} eliminacao - Objeto com volumes eliminados
   * @returns {object} Resultado do balanço
   */
  balancohidrico: function(ingestao, eliminacao) {
    const totalIngestao = (ingestao.oral || 0) + 
                         (ingestao.sonda || 0) + 
                         (ingestao.parenteral || 0) + 
                         (ingestao.outros || 0);

    const totalEliminacao = (eliminacao.urina || 0) + 
                           (eliminacao.vomito || 0) + 
                           (eliminacao.drenos || 0) + 
                           (eliminacao.outros || 0);

    const balanco = totalIngestao - totalEliminacao;

    let interpretacao;
    if (balanco > 0) {
      interpretacao = "Retenção de líquidos";
    } else if (balanco < 0) {
      interpretacao = "Perda de líquidos";
    } else {
      interpretacao = "Balanço equilibrado";
    }

    return {
      totalIngestao: totalIngestao,
      totalEliminacao: totalEliminacao,
      balanco: balanco,
      unidade: "ml",
      interpretacao: interpretacao,
      detalhes: {
        ingestao: ingestao,
        eliminacao: eliminacao
      }
    };
  },

  /**
   * Dimensionamento de Pessoal - Calcula necessidade de pessoal de enfermagem
   * @param {object} params - Parâmetros de entrada
   * @returns {object} Resultado do dimensionamento
   */
  dimensionamento: function(params) {
    const {
      cargaHoraria = 40,
      tipoUnidade = "internacao",
      numCM = 0,
      numCI = 0,
      numCAD = 0,
      numCSI = 0,
      numCUI = 0
    } = params;

    // HPPD (Horas de Enfermagem por Paciente por 24h)
    const hppd = {
      CM: 3.8,
      CI: 5.6,
      CAD: 9.4,
      CSI: 10,
      CUI: 17.9
    };

    // Distribuição percentual mínima
    const distribuicao = {
      "CM_CI": { enfermeiros: 0.33, tecnicos: 0.67 },
      "CAD": { enfermeiros: 0.36, tecnicos: 0.64 },
      "CSI": { enfermeiros: 0.42, tecnicos: 0.58 },
      "CUI": { enfermeiros: 0.52, tecnicos: 0.48 }
    };

    // Calcula total de horas por dia
    const totalHorasDia = (numCM * hppd.CM) + 
                         (numCI * hppd.CI) + 
                         (numCAD * hppd.CAD) + 
                         (numCSI * hppd.CSI) + 
                         (numCUI * hppd.CUI);

    // IST (Índice de Segurança Técnica) = 15%
    const ist = 0.15;
    const totalComIST = totalHorasDia * (1 + ist);

    // Dias úteis por mês (aproximadamente 22)
    const diasUteisMes = 22;
    const horasSemanais = cargaHoraria;
    const horasMesPorProfissional = (horasSemanais / 5) * diasUteisMes;

    const totalProfissionais = Math.ceil(totalComIST * diasUteisMes / horasMesPorProfissional);

    // Determina distribuição baseado na maior carga
    let distribuicaoUsada = distribuicao["CM_CI"];
    if (numCAD > 0 && (numCAD * hppd.CAD) > totalHorasDia * 0.5) {
      distribuicaoUsada = distribuicao["CAD"];
    }
    if (numCSI > 0 && (numCSI * hppd.CSI) > totalHorasDia * 0.5) {
      distribuicaoUsada = distribuicao["CSI"];
    }
    if (numCUI > 0) {
      distribuicaoUsada = distribuicao["CUI"];
    }

    const numEnfermeiros = Math.ceil(totalProfissionais * distribuicaoUsada.enfermeiros);
    const numTecnicos = Math.ceil(totalProfissionais * distribuicaoUsada.tecnicos);

    return {
      totalHorasDia: parseFloat(totalHorasDia.toFixed(2)),
      totalComIST: parseFloat(totalComIST.toFixed(2)),
      ist: ist * 100,
      totalProfissionais: totalProfissionais,
      enfermeiros: numEnfermeiros,
      tecnicos: numTecnicos,
      distribuicao: distribuicaoUsada,
      cargaHoraria: cargaHoraria,
      tipoUnidade: tipoUnidade,
      pacientes: {
        cuidadoMinimo: numCM,
        cuidadoIntermediario: numCI,
        cuidadoAltaDependencia: numCAD,
        cuidadoSemiIntensivo: numCSI,
        cuidadoIntensivo: numCUI
      }
    };
  },

  /**
   * Gasometria - Interpreta valores de gasometria arterial
   * @param {object} valores - Objeto com valores de gasometria
   * @returns {object} Interpretação dos resultados
   */
  gasometria: function(valores) {
    const {
      ph = null,
      paco2 = null,
      po2 = null,
      hco3 = null,
      be = null,
      sato2 = null,
      lactato = null
    } = valores;

    const resultado = {
      valores: valores,
      interpretacao: {}
    };

    // Passo A: Avaliar pH
    if (ph !== null) {
      if (ph < 7.35) {
        resultado.interpretacao.ph = "Acidose";
      } else if (ph > 7.45) {
        resultado.interpretacao.ph = "Alcalose";
      } else {
        resultado.interpretacao.ph = "Normal";
      }
    }

    // Passo B: Distúrbio Primário
    if (ph !== null && paco2 !== null && hco3 !== null) {
      if (ph < 7.35) {
        // Acidose
        if (paco2 > 45) {
          resultado.interpretacao.disturbio = "Acidose Respiratória";
        } else if (hco3 < 22) {
          resultado.interpretacao.disturbio = "Acidose Metabólica";
        }
      } else if (ph > 7.45) {
        // Alcalose
        if (paco2 < 35) {
          resultado.interpretacao.disturbio = "Alcalose Respiratória";
        } else if (hco3 > 26) {
          resultado.interpretacao.disturbio = "Alcalose Metabólica";
        }
      }
    }

    // Passo D: Oxigenação
    if (po2 !== null) {
      if (po2 < 80) {
        resultado.interpretacao.oxigenacao = "Hipoxemia";
      } else {
        resultado.interpretacao.oxigenacao = "Normal";
      }
    }

    // Passo F: Lactato
    if (lactato !== null) {
      if (lactato > 2.0) {
        resultado.interpretacao.lactato = "Elevado - Sugestivo de hipóxia tecidual/sepse";
      } else {
        resultado.interpretacao.lactato = "Normal";
      }
    }

    return resultado;
  },

  /**
   * Gotejamento - Calcula velocidade de infusão em gotas/min
   * @param {object} params - Parâmetros de entrada
   * @returns {object} Resultado do cálculo
   */
  gotejamento: function(params) {
    const {
      volume = 0,
      tempo = 0,
      unidadeTempo = "horas",
      equipo = "macrogotas"
    } = params;

    if (!volume || !tempo) {
      return { error: "Volume e tempo são obrigatórios" };
    }

    let gotasMin, microgotas;

    if (unidadeTempo === "horas") {
      // Fórmula para tempo em horas
      gotasMin = volume / (tempo * 3);
      microgotas = volume / tempo;
    } else if (unidadeTempo === "minutos") {
      // Fórmula para tempo em minutos
      gotasMin = (volume * 20) / tempo;
      microgotas = (volume * 60) / tempo;
    } else {
      return { error: "Unidade de tempo inválida" };
    }

    const resultado = {
      volume: volume,
      tempo: tempo,
      unidadeTempo: unidadeTempo,
      equipo: equipo
    };

    if (equipo === "macrogotas") {
      resultado.resultado = parseFloat(gotasMin.toFixed(2));
      resultado.unidade = "gotas/min";
    } else if (equipo === "microgotas") {
      resultado.resultado = parseFloat(microgotas.toFixed(2));
      resultado.unidade = "microgotas/min";
    }

    return resultado;
  },

  /**
   * Idade Gestacional - Calcula idade gestacional e DPP
   * @param {string} dum - Data da última menstruação (formato: YYYY-MM-DD)
   * @returns {object} Resultado do cálculo
   */
  gestacional: function(dum) {
    if (!dum) {
      return { error: "Data da última menstruação é obrigatória" };
    }

    const dataDUM = new Date(dum);
    const dataAtual = new Date();

    // Calcula diferença em dias
    const diffTime = Math.abs(dataAtual - dataDUM);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calcula semanas e dias
    const semanas = Math.floor(diffDays / 7);
    const dias = diffDays % 7;

    // Calcula DPP (280 dias = 40 semanas)
    const dpp = new Date(dataDUM);
    dpp.setDate(dpp.getDate() + 280);

    // Calcula dias restantes para DPP
    const diasRestantes = Math.ceil((dpp - dataAtual) / (1000 * 60 * 60 * 24));

    return {
      dum: dum,
      idadeGestacional: {
        semanas: semanas,
        dias: dias,
        total: `${semanas} semanas e ${dias} dias`
      },
      dpp: dpp.toISOString().split('T')[0],
      diasRestantes: diasRestantes,
      dataAtual: dataAtual.toISOString().split('T')[0]
    };
  },

  /**
   * IMC - Calcula Índice de Massa Corporal
   * @param {number} peso - Peso em kg
   * @param {number} altura - Altura em metros
   * @returns {object} Resultado do cálculo com classificação
   */
  imc: function(peso, altura) {
    if (!peso || !altura) {
      return { error: "Peso e altura são obrigatórios" };
    }

    if (peso <= 0 || altura <= 0) {
      return { error: "Peso e altura devem ser maiores que zero" };
    }

    const imc = peso / (altura * altura);

    let classificacao;
    if (imc < 18.5) {
      classificacao = "Abaixo do peso";
    } else if (imc < 25) {
      classificacao = "Peso normal";
    } else if (imc < 30) {
      classificacao = "Sobrepeso";
    } else if (imc < 35) {
      classificacao = "Obesidade Grau I";
    } else if (imc < 40) {
      classificacao = "Obesidade Grau II";
    } else {
      classificacao = "Obesidade Grau III";
    }

    return {
      peso: peso,
      altura: altura,
      imc: parseFloat(imc.toFixed(2)),
      unidade: "kg/m²",
      classificacao: classificacao
    };
  },

  /**
   * Medicamentos - Calcula dosagem usando regra de três
   * @param {number} prescricao - Prescrição em mg
   * @param {number} concentracao - Concentração disponível em mg
   * @param {number} volumeTotal - Volume total do frasco em ml
   * @returns {object} Resultado do cálculo
   */
  medicamentos: function(prescricao, concentracao, volumeTotal) {
    if (!prescricao || !concentracao || !volumeTotal) {
      return { error: "Todos os campos são obrigatórios" };
    }

    if (concentracao <= 0 || volumeTotal <= 0) {
      return { error: "Concentração e volume devem ser maiores que zero" };
    }

    const volumeAspirar = (prescricao / concentracao) * volumeTotal;

    return {
      prescricao: prescricao,
      concentracao: concentracao,
      volumeTotal: volumeTotal,
      volumeAspirar: parseFloat(volumeAspirar.toFixed(2)),
      unidade: "ml",
      formula: `(${prescricao} / ${concentracao}) × ${volumeTotal} = ${parseFloat(volumeAspirar.toFixed(2))} ml`
    };
  }
};

// Exportar para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NursingCalculators;
}
