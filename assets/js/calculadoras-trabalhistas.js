/**
 * Lógica Central das Calculadoras Trabalhistas - Enfermagem
 * Vigência: 2025 (Salário Mínimo R$ 1.518,00)
 */

const CONSTANTES = {
    SALARIO_MINIMO: 1518.00,
    TETO_INSS: 8157.41,
    IRRF_DEDUCAO_SIMPLIFICADA: 564.80,
    IRRF_DEDUCAO_DEPENDENTE: 189.59
};

const Utils = {
    formatMoeda: (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    parseMoeda: (valor) => parseFloat(valor) || 0,
    
    calcularINSS: (bruto) => {
        // Tabela Progressiva 2025 (Estimada)
        let inss = 0;
        const faixas = [1518.00, 2793.88, 4190.83, 8157.41];
        const aliquotas = [0.075, 0.09, 0.12, 0.14];
        const deducoes = [0, 22.77, 106.59, 190.40]; // Acumulado das faixas anteriores

        if (bruto <= faixas[0]) inss = bruto * aliquotas[0];
        else if (bruto <= faixas[1]) inss = (faixa1 * 0.075) + ((bruto - faixas[0]) * 0.09); // Simplificado: usar lógica de faixas progressiva correta é complexo, usaremos a efetiva.
        
        // Cálculo Progressivo Exato
        let tetoFaixa1 = 1518.00;
        let tetoFaixa2 = 2793.88;
        let tetoFaixa3 = 4190.83;
        let tetoFaixa4 = 8157.41;

        let desc1 = 0, desc2 = 0, desc3 = 0, desc4 = 0;

        if (bruto > 0) desc1 = Math.min(bruto, tetoFaixa1) * 0.075;
        if (bruto > tetoFaixa1) desc2 = (Math.min(bruto, tetoFaixa2) - tetoFaixa1) * 0.09;
        if (bruto > tetoFaixa2) desc3 = (Math.min(bruto, tetoFaixa3) - tetoFaixa2) * 0.12;
        if (bruto > tetoFaixa3) desc4 = (Math.min(bruto, tetoFaixa4) - tetoFaixa3) * 0.14;

        inss = desc1 + desc2 + desc3 + desc4;
        return inss;
    },

    calcularIRRF: (base) => {
        if (base <= 2259.20) return 0;
        if (base <= 2826.65) return (base * 0.075) - 169.44;
        if (base <= 3751.05) return (base * 0.15) - 381.44;
        if (base <= 4664.68) return (base * 0.225) - 662.77;
        return (base * 0.275) - 896.00;
    }
};

const Calculadoras = {
    // 1. Adicional Noturno
    adicionalNoturno: () => {
        const salario = Utils.parseMoeda(document.getElementById('salario').value);
        const jornada = parseInt(document.getElementById('jornada').value);
        const horasRelogio = Utils.parseMoeda(document.getElementById('horas-noturnas').value);

        if (!salario || !horasRelogio) return;

        const valorHoraNormal = salario / jornada;
        const fatorReducao = 60 / 52.5; // 1.1428
        const horasPagas = horasRelogio * fatorReducao;
        const totalAdicional = (valorHoraNormal * 0.20) * horasPagas;

        document.getElementById('result-content').innerHTML = `
            <div class="result-item"><span>Hora Normal:</span> <strong>${Utils.formatMoeda(valorHoraNormal)}</strong></div>
            <div class="result-item"><span>Horas Noturnas (com redução):</span> <strong>${horasPagas.toFixed(2)}h</strong></div>
            <div class="result-total"><span>Total Adicional:</span> <strong>${Utils.formatMoeda(totalAdicional)}</strong></div>
            <p class="text-xs text-gray-500 mt-2">*Inclui redução da hora noturna (52m30s) e adicional de 20%.</p>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    },

    // 2. Hora Extra
    horaExtra: () => {
        const salario = Utils.parseMoeda(document.getElementById('salario').value);
        const jornada = parseInt(document.getElementById('jornada').value);
        const he50 = Utils.parseMoeda(document.getElementById('he50').value);
        const he100 = Utils.parseMoeda(document.getElementById('he100').value);

        if (!salario) return;

        const valorHora = salario / jornada;
        const total50 = valorHora * 1.5 * he50;
        const total100 = valorHora * 2.0 * he100;
        const dsr = (total50 + total100) * 0.1666; // Média 1/6

        document.getElementById('result-content').innerHTML = `
            <div class="result-item"><span>HE 50%:</span> <strong>${Utils.formatMoeda(total50)}</strong></div>
            <div class="result-item"><span>HE 100%:</span> <strong>${Utils.formatMoeda(total100)}</strong></div>
            <div class="result-item"><span>Reflexo DSR (Est.):</span> <strong>${Utils.formatMoeda(dsr)}</strong></div>
            <div class="result-total"><span>Total a Receber:</span> <strong>${Utils.formatMoeda(total50 + total100 + dsr)}</strong></div>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    },

    // 3. Salário Líquido
    salarioLiquido: () => {
        const bruto = Utils.parseMoeda(document.getElementById('salario').value);
        const dependentes = parseInt(document.getElementById('dependentes').value) || 0;
        const outrosDescontos = Utils.parseMoeda(document.getElementById('descontos').value);

        if (!bruto) return;

        const inss = Utils.calcularINSS(bruto);
        
        // IRRF: Comparar Simplificado vs Legal
        const baseLegal = bruto - inss - (dependentes * CONSTANTES.IRRF_DEDUCAO_DEPENDENTE);
        const baseSimplificada = bruto - CONSTANTES.IRRF_DEDUCAO_SIMPLIFICADA;
        const baseFinal = Math.min(Math.max(baseLegal, 0), Math.max(baseSimplificada, 0));
        
        const irrf = Math.max(0, Utils.calcularIRRF(baseFinal));
        const liquido = bruto - inss - irrf - outrosDescontos;

        document.getElementById('result-content').innerHTML = `
            <div class="result-item"><span>Bruto:</span> <strong>${Utils.formatMoeda(bruto)}</strong></div>
            <div class="result-item text-red-600"><span>INSS (2025):</span> <strong>- ${Utils.formatMoeda(inss)}</strong></div>
            <div class="result-item text-red-600"><span>IRRF:</span> <strong>- ${Utils.formatMoeda(irrf)}</strong></div>
            <div class="result-item text-red-600"><span>Outros:</span> <strong>- ${Utils.formatMoeda(outrosDescontos)}</strong></div>
            <hr class="my-2 border-gray-200">
            <div class="result-total"><span>Salário Líquido:</span> <strong>${Utils.formatMoeda(liquido)}</strong></div>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    },

    // 4. Salário Hora (Novo)
    salarioHora: () => {
        const salarioBase = Utils.parseMoeda(document.getElementById('salario').value);
        const jornada = parseInt(document.getElementById('jornada').value);
        const tipoInsalubridade = document.getElementById('insalubridade').value; // '0', '20', '40', 'fixo'
        let valorInsalubridade = 0;

        if (tipoInsalubridade === '20') valorInsalubridade = CONSTANTES.SALARIO_MINIMO * 0.20;
        else if (tipoInsalubridade === '40') valorInsalubridade = CONSTANTES.SALARIO_MINIMO * 0.40;
        else if (tipoInsalubridade === 'fixo') valorInsalubridade = Utils.parseMoeda(document.getElementById('insalubridade-valor').value);

        const remuneracaoTotal = salarioBase + valorInsalubridade;
        const valorHora = remuneracaoTotal / jornada;

        document.getElementById('result-content').innerHTML = `
            <div class="result-item"><span>Remuneração Total:</span> <strong>${Utils.formatMoeda(remuneracaoTotal)}</strong></div>
            <div class="result-item"><span>Insalubridade:</span> <strong>${Utils.formatMoeda(valorInsalubridade)}</strong></div>
            <div class="result-total bg-teal-50 p-3 rounded"><span>Valor da Hora:</span> <strong>${Utils.formatMoeda(valorHora)}</strong></div>
            <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div class="bg-gray-50 p-2 rounded">Plantão 12h: <strong>${Utils.formatMoeda(valorHora * 12)}</strong></div>
                <div class="bg-gray-50 p-2 rounded">Plantão 24h: <strong>${Utils.formatMoeda(valorHora * 24)}</strong></div>
            </div>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    },

    // 5. CLT vs PJ (Novo)
    cltPj: () => {
        // CLT
        const salarioCLT = Utils.parseMoeda(document.getElementById('salario-clt').value);
        const beneficiosCLT = Utils.parseMoeda(document.getElementById('beneficios-clt').value); // VR, VT
        
        // PJ
        const faturamentoPJ = Utils.parseMoeda(document.getElementById('faturamento-pj').value);
        const aliquotaPJ = Utils.parseMoeda(document.getElementById('imposto-pj').value) / 100; // Ex: 6% ou 15.5%
        const custosPJ = Utils.parseMoeda(document.getElementById('custos-pj').value); // Contador, GPS

        // Cálculo CLT (Líquido Estimado + Benefícios + FGTS/Férias/13º diluídos)
        const inssCLT = Utils.calcularINSS(salarioCLT);
        const irrfCLT = Utils.calcularIRRF(salarioCLT - inssCLT - CONSTANTES.IRRF_DEDUCAO_SIMPLIFICADA);
        const liquidoCLT = salarioCLT - inssCLT - irrfCLT;
        
        // Vantagens CLT (Diluídas mensalmente para comparação)
        const fgts = salarioCLT * 0.08;
        const ferias = (salarioCLT / 12) * 1.33; // +1/3
        const decimo = salarioCLT / 12;
        const totalCLT = liquidoCLT + beneficiosCLT + fgts + ferias + decimo;

        // Cálculo PJ
        const impostosPJ = faturamentoPJ * aliquotaPJ;
        const liquidoPJ = faturamentoPJ - impostosPJ - custosPJ;

        const diferenca = liquidoPJ - totalCLT;
        const melhor = diferenca > 0 ? 'PJ' : 'CLT';

        document.getElementById('result-content').innerHTML = `
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-blue-50 p-3 rounded border border-blue-200">
                    <h4 class="font-bold text-blue-800 mb-2">CLT (Pacote Mensal)</h4>
                    <div class="text-sm">Líquido: ${Utils.formatMoeda(liquidoCLT)}</div>
                    <div class="text-sm">Benefícios/FGTS/13º: +${Utils.formatMoeda(beneficiosCLT + fgts + ferias + decimo)}</div>
                    <div class="text-lg font-bold text-blue-900 mt-2">${Utils.formatMoeda(totalCLT)}</div>
                </div>
                <div class="bg-orange-50 p-3 rounded border border-orange-200">
                    <h4 class="font-bold text-orange-800 mb-2">PJ (Líquido)</h4>
                    <div class="text-sm">Faturamento: ${Utils.formatMoeda(faturamentoPJ)}</div>
                    <div class="text-sm text-red-600">Impostos/Custos: -${Utils.formatMoeda(impostosPJ + custosPJ)}</div>
                    <div class="text-lg font-bold text-orange-900 mt-2">${Utils.formatMoeda(liquidoPJ)}</div>
                </div>
            </div>
            <div class="text-center p-4 rounded-lg ${diferenca > 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                <span class="font-bold text-xl">Mais Vantajoso: ${melhor}</span>
                <p class="text-sm mt-1">Diferença estimada: ${Utils.formatMoeda(Math.abs(diferenca))}/mês</p>
            </div>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    }
};

// Inicialização Global
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calc-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = form.getAttribute('data-calc-type');
            if (Calculadoras[type]) Calculadoras[type]();
        });

        document.getElementById('btn-limpar')?.addEventListener('click', () => {
            form.reset();
            document.getElementById('result-container').classList.add('hidden');
        });
    }
});