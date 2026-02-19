import React, { useState } from 'react';
import { CalculatorConfig, AuditStep } from '../data/types';

interface CalculatorProps {
  config: CalculatorConfig;
  auditSteps: AuditStep[];
  onCalculate: (result: any) => void;
}

export default function Calculator({ config, auditSteps, onCalculate }: CalculatorProps) {
  const [prescricao, setPrescricao] = useState('');
  const [concentracao, setConcentracao] = useState(config.fields[1]?.default || 100);
  const [result, setResult] = useState<null | { volume: string; unidade: string }>(null);

  const handleCalculate = () => {
    const p = parseFloat(prescricao);
    const c = typeof concentracao === 'string' ? parseFloat(concentracao) : concentracao;
    if (isNaN(p) || p <= 0 || isNaN(c) || c <= 0) return;
    const volume = (p / c).toFixed(2);
    const res = { volume, unidade: 'mL' };
    setResult(res);
    onCalculate(res);
  };

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            {config.fields[0]?.label}
            {config.fields[0]?.tooltip && (
              <span className="tooltip-container ml-1">
                <i className="fa-solid fa-circle-info label-tooltip"></i>
                <span className="tooltip-text">{config.fields[0].tooltip}</span>
              </span>
            )}
          </label>
          <input
            type="number"
            min={config.fields[0]?.min}
            step={config.fields[0]?.step}
            placeholder={config.fields[0]?.placeholder}
            value={prescricao}
            onChange={(e) => setPrescricao(e.target.value)}
            className="input-field"
            required={config.fields[0]?.required}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            {config.fields[1]?.label}
            {config.fields[1]?.tooltip && (
              <span className="tooltip-container ml-1">
                <i className="fa-solid fa-circle-info label-tooltip"></i>
                <span className="tooltip-text">{config.fields[1].tooltip}</span>
              </span>
            )}
          </label>
          <select
            value={concentracao}
            onChange={(e) => setConcentracao(e.target.value)}
            className="input-field"
          >
            {config.fields[1]?.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <button onClick={handleCalculate} className="btn-primary-action">
          <i className="fa-solid fa-calculator"></i> Calcular
        </button>
        <button onClick={() => { setPrescricao(''); setResult(null); }} className="btn-secondary-action">
          <i className="fa-solid fa-rotate-left"></i> Limpar
        </button>
      </div>

      {result && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 text-center border-2 border-dashed border-nurse-primary/20 mb-6 relative">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-4">Dose a Aspirar</p>
            <div className="text-6xl md:text-8xl font-black text-[#1A3E74] dark:text-cyan-400 tracking-tighter font-nunito leading-none">
              {result.volume}
            </div>
            <p className="text-lg font-black text-nurse-secondary mt-2 uppercase tracking-widest">{result.unidade}</p>
          </div>

          {/* Auditoria */}
          <div className="mb-12">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-6">
              <i className="fa-solid fa-clipboard-check"></i> Auditoria do Cálculo
            </h3>
            <ul className="space-y-3">
              {auditSteps.map((step, idx) => {
                let value = '';
                if (step.label === 'Prescrição Médica') value = `${p} UI`;
                else if (step.label === 'Concentração da Insulina') value = `${c} UI/mL`;
                else if (step.label === 'Tipo de Seringa') value = step.value || '';
                else if (step.label === 'Fator de Cálculo') value = `1 UI = ${(1/c).toFixed(4)} mL`;
                else if (step.label === 'Volume Final Auditado') value = `${result.volume} ${result.unidade}`;
                return (
                  <li key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <i className={`fa-solid ${step.icon} text-nurse-secondary`}></i>
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">{step.label}</span>
                    </div>
                    <span className="font-bold text-nurse-primary dark:text-cyan-400">{value}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}