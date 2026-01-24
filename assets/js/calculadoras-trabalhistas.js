/**
 * Lógica Central das Calculadoras Trabalhistas - Enfermagem
 * Vigência: 2025
 */

const CONSTANTES = {
    SALARIO_MINIMO: 1518.00,
    IRRF_DEDUCAO_SIMPLIFICADA: 564.80,
    IRRF_DEDUCAO_DEPENDENTE: 189.59
};

const Utils = {
    formatMoeda: (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    parseMoeda: (v) => parseFloat(v) || 0,
    
    calcularINSS: (bruto) => {
        let inss = 0;
        const faixas = [1518.00, 2793.88, 4190.83, 8157.41];
        if (bruto > 0) inss += Math.min(bruto, faixas[0]) * 0.075;
        if (bruto > faixas[0]) inss += (Math.min(bruto, faixas[1]) - faixas[0]) * 0.09;
        if (bruto > faixas[1]) inss += (Math.min(bruto, faixas[2]) - faixas[1]) * 0.12;
        if (bruto > faixas[2]) inss += (Math.min(bruto, faixas[3]) - faixas[2]) * 0.14;
        return inss;
    },

    calcularIRRF: (baseLegal, baseSimplificada) => {
        const base = Math.min(Math.max(baseLegal, 0), Math.max(baseSimplificada, 0));
        let irrf = 0, deducao = 0;
        if (base <= 2259.20) return 0;
        else if (base <= 2826.65) { irrf = base * 0.075; deducao = 169.44; }
        else if (base <= 3751.05) { irrf = base * 0.15; deducao = 381.44; }
        else if (base <= 4664.68) { irrf = base * 0.225; deducao = 662.77; }
        else { irrf = base * 0.275; deducao = 896.00; }
        return Math.max(irrf - deducao, 0);
    }
};

const Calculadoras = {
    adicionalNoturno: () => {
        const salario = Utils.parseMoeda(document.getElementById('salario').value);
        const jornada = parseInt(document.getElementById('jornada').value);
        const horasRelogio = Utils.parseMoeda(document.getElementById('horas-noturnas').value);
        if (!salario) return;

        const valorHora = salario / jornada;
        const fatorReducao = 1.142857; // 60 / 52.5
        const horasReduzidas = horasRelogio * fatorReducao;
        const total = (valorHora * 0.20) * horasReduzidas;

        document.getElementById('result-content').innerHTML = `
            <div class="flex justify-between py-1 border-b"><span>Hora Normal:</span> <strong>${Utils.formatMoeda(valorHora)}</strong></div>
            <div class="flex justify-between py-1 border-b"><span>Horas Reduzidas (52m30s):</span> <strong>${horasReduzidas.toFixed(2)}h</strong></div>
            <div class="flex justify-between py-2 text-teal-800 bg-teal-50 px-2 rounded mt-2"><span>Total Adicional (20%):</span> <strong>${Utils.formatMoeda(total)}</strong></div>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    },
    horaExtra: () => {
        const salario = Utils.parseMoeda(document.getElementById('salario').value);
        const jornada = parseInt(document.getElementById('jornada').value);
        const he50 = Utils.parseMoeda(document.getElementById('he50').value);
        const he100 = Utils.parseMoeda(document.getElementById('he100').value);
        if (!salario) return;

        const valorHora = salario / jornada;
        const total50 = valorHora * 1.5 * he50;
        const total100 = valorHora * 2.0 * he100;
        const dsr = (total50 + total100) / 6;

        document.getElementById('result-content').innerHTML = `
            <div class="flex justify-between py-1 border-b"><span>HE 50%:</span> <strong>${Utils.formatMoeda(total50)}</strong></div>
            <div class="flex justify-between py-1 border-b"><span>HE 100%:</span> <strong>${Utils.formatMoeda(total100)}</strong></div>
            <div class="flex justify-between py-1 border-b text-gray-600"><span>DSR (est. 1/6):</span> <strong>${Utils.formatMoeda(dsr)}</strong></div>
            <div class="flex justify-between py-2 text-teal-800 bg-teal-50 px-2 rounded mt-2"><span>Total Bruto:</span> <strong>${Utils.formatMoeda(total50 + total100 + dsr)}</strong></div>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    },
    salarioLiquido: () => {
        const bruto = Utils.parseMoeda(document.getElementById('salario').value);
        const dependentes = parseInt(document.getElementById('dependentes').value) || 0;
        const desc = Utils.parseMoeda(document.getElementById('descontos').value);
        if (!bruto) return;

        const inss = Utils.calcularINSS(bruto);
        const baseLegal = bruto - inss - (dependentes * CONSTANTES.IRRF_DEDUCAO_DEPENDENTE);
        const baseSimp = bruto - CONSTANTES.IRRF_DEDUCAO_SIMPLIFICADA;
        const irrf = Utils.calcularIRRF(baseLegal, baseSimp);
        const liquido = bruto - inss - irrf - desc;

        document.getElementById('result-content').innerHTML = `
            <div class="flex justify-between py-1"><span>Bruto:</span> <strong>${Utils.formatMoeda(bruto)}</strong></div>
            <div class="flex justify-between py-1 text-red-600"><span>INSS:</span> <strong>-${Utils.formatMoeda(inss)}</strong></div>
            <div class="flex justify-between py-1 text-red-600"><span>IRRF:</span> <strong>-${Utils.formatMoeda(irrf)}</strong></div>
            <div class="flex justify-between py-1 text-red-600 border-b"><span>Outros:</span> <strong>-${Utils.formatMoeda(desc)}</strong></div>
            <div class="flex justify-between py-2 text-teal-800 bg-teal-50 px-2 rounded mt-2"><span>Líquido:</span> <strong>${Utils.formatMoeda(liquido)}</strong></div>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    },
    salarioHora: () => {
        const salario = Utils.parseMoeda(document.getElementById('salario').value);
        const jornada = parseInt(document.getElementById('jornada').value);
        const insalubridade = document.getElementById('insalubridade').value;
        let adic = 0;
        if(insalubridade === '20') adic = CONSTANTES.SALARIO_MINIMO * 0.2;
        if(insalubridade === '40') adic = CONSTANTES.SALARIO_MINIMO * 0.4;
        if(insalubridade === 'fixo') adic = Utils.parseMoeda(document.getElementById('insalubridade-valor').value);
        
        const total = salario + adic;
        const valorHora = total / jornada;

        document.getElementById('result-content').innerHTML = `
            <div class="flex justify-between py-1 border-b"><span>Remuneração Total:</span> <strong>${Utils.formatMoeda(total)}</strong></div>
            <div class="flex justify-between py-2 text-teal-800 bg-teal-50 px-2 rounded mt-2"><span>Valor Hora:</span> <strong>${Utils.formatMoeda(valorHora)}</strong></div>
            <div class="grid grid-cols-2 gap-2 mt-2 text-center text-xs">
                <div class="bg-white p-2 border rounded">Plantão 12h<br><strong>${Utils.formatMoeda(valorHora * 12)}</strong></div>
                <div class="bg-white p-2 border rounded">Plantão 24h<br><strong>${Utils.formatMoeda(valorHora * 24)}</strong></div>
            </div>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    },
    cltPj: () => {
        const salCLT = Utils.parseMoeda(document.getElementById('salario-clt').value);
        const benCLT = Utils.parseMoeda(document.getElementById('beneficios-clt').value);
        const fatPJ = Utils.parseMoeda(document.getElementById('faturamento-pj').value);
        const impPJ = Utils.parseMoeda(document.getElementById('imposto-pj').value) / 100;
        const custPJ = Utils.parseMoeda(document.getElementById('custos-pj').value);

        const inss = Utils.calcularINSS(salCLT);
        const irrf = Utils.calcularIRRF(salCLT - inss, salCLT - inss - CONSTANTES.IRRF_DEDUCAO_SIMPLIFICADA);
        const liqCLT = salCLT - inss - irrf;
        
        const pacoteCLT = liqCLT + benCLT + (salCLT * 0.08) + (salCLT / 12 * 1.33) + (salCLT / 12);
        const liqPJ = fatPJ - (fatPJ * impPJ) - custPJ;
        
        const dif = liqPJ - pacoteCLT;
        const msg = dif > 0 ? "PJ Vantajoso" : "CLT Vantajoso";
        const color = dif > 0 ? "text-orange-700 bg-orange-50 border-orange-200" : "text-blue-700 bg-blue-50 border-blue-200";

        document.getElementById('result-content').innerHTML = `
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                <div class="bg-blue-50 p-2 rounded border border-blue-100"><strong>CLT (Pacote):</strong><br>${Utils.formatMoeda(pacoteCLT)}</div>
                <div class="bg-orange-50 p-2 rounded border border-orange-100"><strong>PJ (Líquido):</strong><br>${Utils.formatMoeda(liqPJ)}</div>
            </div>
            <div class="text-center font-bold border p-3 rounded ${color}">
                ${msg} <br> <span class="text-sm font-normal">Diferença: ${Utils.formatMoeda(Math.abs(dif))}</span>
            </div>
        `;
        document.getElementById('result-container').classList.remove('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calc-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = form.getAttribute('data-calc-type');
            if(Calculadoras[type]) Calculadoras[type]();
        });
        document.getElementById('btn-limpar')?.addEventListener('click', () => {
            form.reset();
            document.getElementById('result-container').classList.add('hidden');
        });
    }
});