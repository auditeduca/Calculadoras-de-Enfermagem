// js/apgar.js
// v2.0 — Corrigido: window.PAGE_CONFIG, renderForm(), generatePDF real, interpretação na UI, seletores por id, DOMContentLoaded guard
const calculatorModule = {
  uiState: { resultsVisible: false },

  init: function() {
    this.renderForm();
    this.setupValidations();
    this.renderActionButtons();
  },

  // CORRIGIDO C-02 / A-01 pattern: renderForm() dinâmico com window.PAGE_CONFIG
  renderForm: function() {
    const formContainer = document.getElementById('calculator-form');
    if (!formContainer) return;
    const sections = window.PAGE_CONFIG.form.sections;
    let html = '';
    sections.forEach(section => {
      html += `<div class="mb-8"><h3 class="text-lg font-bold mb-4">${section.title}</h3>`;
      section.fields.forEach(field => {
        html += `<div class="mb-4">`;
        html += `<label for="${field.id}" class="block text-sm font-bold mb-2">${field.label}`;
        if (field.required) html += ` <span class="text-red-500">*</span>`;
        html += `</label>`;

        if (field.type === 'select') {
          html += `<select id="${field.id}" class="w-full p-3 border rounded-lg bg-white dark:bg-slate-800">`;
          field.options.forEach(opt => {
            const selected = (opt.value == field.default) ? 'selected' : '';
            html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
          });
          html += `</select>`;
        } else if (field.type === 'text') {
          html += `<input type="text" id="${field.id}" placeholder="${field.placeholder || ''}" class="w-full p-3 border rounded-lg">`;
        } else if (field.type === 'date' || field.type === 'datetime-local') {
          html += `<input type="${field.type}" id="${field.id}" class="w-full p-3 border rounded-lg">`;
        }
        if (field.tooltip) {
          html += `<p class="text-xs text-slate-500 mt-1">${field.tooltip}</p>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    });
    formContainer.innerHTML = html;

    document.getElementById('btn-calculate').style.display = 'block';
    document.getElementById('btn-reset').style.display = 'block';
    document.getElementById('btn-calculate').addEventListener('click', () => this.calculate());
    document.getElementById('btn-reset').addEventListener('click', () => this.reset());
  },

  renderActionButtons: function() {
    const container = document.getElementById('result-actions');
    if (!container) return;
    const buttons = window.PAGE_CONFIG.calculation.actionButtons || [];
    container.innerHTML = '';
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.id = `btn-action-${btn.action}`;
      button.className = btn.type === 'primary' ? 'btn-primary-action' : 'btn-secondary-action';
      button.innerHTML = `<i class="fa-solid ${btn.icon}"></i> ${btn.label}`;
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof this[btn.action] === 'function') this[btn.action]();
      });
      container.appendChild(button);
    });
  },

  setupValidations: function() {
    // patientBirthdate pode ser datetime-local no Apgar
    const birthField = document.getElementById('patientBirthdate');
    if (birthField) {
      birthField.addEventListener('change', () => this.validateDateTime(birthField));
    }
  },

  validateDateTime: function(field) {
    const value = field.value;
    if (!value) return true;
    const date = new Date(value);
    const year = date.getFullYear();
    if (isNaN(date.getTime()) || year < 1900) {
      field.classList.add('border-red-500', 'bg-red-50');
      return false;
    }
    const today = new Date();
    if (date > today) {
      field.classList.add('border-red-500', 'bg-red-50');
      return false;
    }
    field.classList.remove('border-red-500', 'bg-red-50');
    return true;
  },

  calculate: function() {
    const btn = document.getElementById('btn-calculate');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Avaliando...';
    btn.disabled = true;

    setTimeout(() => {
      try {
        const getVal = (id) => {
          const el = document.getElementById(id);
          if (!el) return NaN;
          return parseInt(el.value, 10);
        };

        // 1º minuto
        const f1   = getVal('frequencia1');
        const r1   = getVal('respiracao1');
        const t1   = getVal('tonus1');
        const ref1 = getVal('reflexo1');
        const c1   = getVal('cor1');
        const apgar1 = f1 + r1 + t1 + ref1 + c1;

        // 5º minuto
        const f5   = getVal('frequencia5');
        const r5   = getVal('respiracao5');
        const t5   = getVal('tonus5');
        const ref5 = getVal('reflexo5');
        const c5   = getVal('cor5');
        const apgar5 = f5 + r5 + t5 + ref5 + c5;

        const errors = [];
        if (isNaN(apgar1) || isNaN(apgar5)) {
          errors.push('Preencha todos os campos de avaliação (1º e 5º minuto)');
        }
        if (errors.length > 0) {
          errors.forEach(err => window.CALCULATOR_SYSTEM?.notify?.(err, 'error'));
          this.playSound('error');
          return;
        }

        const birthField = document.getElementById('patientBirthdate');
        if (birthField && birthField.value) {
          if (!this.validateDateTime(birthField)) {
            window.CALCULATOR_SYSTEM?.notify?.('Data/hora de nascimento inválida', 'error');
            this.playSound('error');
            return;
          }
        }

        // CORRIGIDO C-02: usa window.PAGE_CONFIG em vez do padrão antigo
        window.CALCULATOR_SYSTEM = window.CALCULATOR_SYSTEM || {};
        window.CALCULATOR_SYSTEM.lastResult = {
          apgar1, apgar5,
          f1, r1, t1, ref1, c1,
          f5, r5, t5, ref5, c5,
          unit: 'pontos'
        };

        document.getElementById('res-total').innerText = `${apgar1} / ${apgar5}`;
        document.getElementById('res-unit').innerText = 'pontos';
        document.getElementById('results-wrapper').classList.remove('hidden');
        this.uiState.resultsVisible = true;

        this.renderAudit(window.CALCULATOR_SYSTEM.lastResult);
        this.renderInterpretation(apgar1, apgar5);  // CORRIGIDO M-06: exibir na UI
        this.renderChecklists();

        const i1 = this.getInterpretation(apgar1);
        const i5 = this.getInterpretation(apgar5);
        window.CALCULATOR_SYSTEM?.notify?.(`1º min: ${i1} | 5º min: ${i5}`, 'success');
        this.playSound('success');

      } catch (error) {
        window.CALCULATOR_SYSTEM?.notify?.('Erro inesperado', 'error');
        this.playSound('error');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }, 400);
  },

  getInterpretation: function(score) {
    // Interpretações do JSON se disponível, fallback padrão
    const ranges = window.PAGE_CONFIG?.calculation?.interpretation || [
      { max: 3,  label: 'Asfixia grave',     color: 'text-red-600' },
      { max: 6,  label: 'Asfixia moderada',  color: 'text-yellow-600' },
      { max: 10, label: 'Boa vitalidade',    color: 'text-green-600' }
    ];
    const range = ranges.find(r => score <= r.max) || ranges[ranges.length - 1];
    return range.label;
  },

  // CORRIGIDO M-06: interpretação persistida na UI
  renderInterpretation: function(apgar1, apgar5) {
    let interpEl = document.getElementById('res-interpretation');
    if (!interpEl) {
      interpEl = document.createElement('div');
      interpEl.id = 'res-interpretation';
      interpEl.className = 'mt-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-center animate-fade-in grid grid-cols-2 gap-3';
      const resultBox = document.querySelector('#results-wrapper .text-center');
      if (resultBox) resultBox.appendChild(interpEl);
    }
    const interp1 = this.getInterpretation(apgar1);
    const interp5 = this.getInterpretation(apgar5);
    interpEl.innerHTML = `
      <div class="p-2 rounded-lg bg-white dark:bg-slate-700">
        <span class="text-[10px] uppercase font-black tracking-wider text-slate-400 block">1º Minuto</span>
        <span class="font-bold text-nurse-primary dark:text-cyan-400">${apgar1} pts — ${interp1}</span>
      </div>
      <div class="p-2 rounded-lg bg-white dark:bg-slate-700">
        <span class="text-[10px] uppercase font-black tracking-wider text-slate-400 block">5º Minuto</span>
        <span class="font-bold text-nurse-primary dark:text-cyan-400">${apgar5} pts — ${interp5}</span>
      </div>
    `;
  },

  // CORRIGIDO C-02: usa window.PAGE_CONFIG.calculation.audit.steps
  renderAudit: function(result) {
    const steps = window.PAGE_CONFIG.calculation.audit.steps;
    const list = document.getElementById('audit-list');
    if (!list) return;
    list.innerHTML = '';

    steps.forEach(step => {
      let value = result[step.sourceField];
      if (step.suffix) value += ' ' + step.suffix;

      const li = document.createElement('li');
      li.className = 'flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm border border-slate-100 dark:border-slate-700 animate-fade-in';
      li.innerHTML = `
        <div class="flex items-center gap-3">
          <i class="fa-solid ${step.icon} text-nurse-secondary"></i>
          <span class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">${step.label}</span>
        </div>
        <span class="font-bold text-nurse-primary dark:text-cyan-400">${value}</span>
      `;
      list.appendChild(li);
    });
  },

  renderChecklists: function() {
    const config = window.PAGE_CONFIG;
    const nineRights = config?.checklists?.nineRights || [
      'Paciente Certo', 'Medicação Certa', 'Dose Certa', 'Via Certa', 'Hora Certa',
      'Registro Certo', 'Validade Certa', 'Resposta Certa', 'Forma Farmacêutica Certa'
    ];
    const safetyGoals = config?.checklists?.safetyGoals || [
      { id: 1, text: 'Identificar o paciente corretamente', class: 'glass-meta-blue' },
      { id: 2, text: 'Comunicação Efetiva na passagem de plantão', class: 'glass-meta-blue' },
      { id: 3, text: 'Segurança de Medicamentos de Alta Vigilância', class: 'glass-meta-orange' },
      { id: 6, text: 'Reduzir risco de quedas do paciente', class: 'glass-meta-blue' }
    ];

    const container = document.getElementById('checklist-9rights') || document.getElementById('checklist-9certos');
    if (container) {
      container.innerHTML = nineRights.map(text => `
        <label class="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-nurse-secondary transition group animate-fade-in">
          <input type="checkbox" class="w-4 h-4 accent-nurse-primary transition"/>
          <span class="group-hover:text-nurse-primary transition-colors">${text}</span>
        </label>
      `).join('');
    }

    const goalsContainer = document.getElementById('checklist-safety-goals') || document.getElementById('checklist-metas');
    if (goalsContainer) {
      goalsContainer.innerHTML = safetyGoals.map(goal => `
        <label class="glass-meta ${goal.class} py-3 cursor-pointer group animate-fade-in">
          <input type="checkbox" class="w-4 h-4 accent-white mr-2 transition"/>
          <span class="text-[10px] uppercase font-black tracking-wider group-hover:underline">${goal.id}. ${goal.text}</span>
        </label>
      `).join('');
    }
  },

  // CORRIGIDO A-09: usa getElementById em vez de querySelector frágil
  reset: function() {
    const btn = document.getElementById('btn-reset');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Limpando...';
    btn.disabled = true;

    setTimeout(() => {
      window.PAGE_CONFIG.form.sections.forEach(section => {
        section.fields.forEach(field => {
          const el = document.getElementById(field.id);
          if (!el) return;
          if (['text', 'date', 'datetime-local'].includes(field.type)) {
            el.value = '';
          } else if (field.type === 'select') {
            el.value = field.default !== undefined ? String(field.default) : el.options[0]?.value;
          }
          el.classList.remove('border-red-500', 'bg-red-50');
        });
      });

      document.getElementById('results-wrapper').classList.add('hidden');
      this.uiState.resultsVisible = false;
      window.CALCULATOR_SYSTEM = window.CALCULATOR_SYSTEM || {};
      window.CALCULATOR_SYSTEM.lastResult = null;

      const interpEl = document.getElementById('res-interpretation');
      if (interpEl) interpEl.remove();

      document.querySelectorAll('#checklist-9rights input, #checklist-9certos input, #checklist-safety-goals input, #checklist-metas input').forEach(cb => cb.checked = false);

      window.CALCULATOR_SYSTEM?.notify?.('Campos resetados', 'info');
      this.playSound('info'); // CORRIGIDO A-11: case 'info' existe agora
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 400);
  },

  // CORRIGIDO C-03: generatePDF real (não mais vazio)
  generatePDF: async function() {
    if (!window.CALCULATOR_SYSTEM?.lastResult) {
      window.CALCULATOR_SYSTEM?.notify?.('Realize uma avaliação primeiro', 'error');
      this.playSound('error');
      return;
    }

    const btn = document.getElementById('btn-action-generatePDF');
    const originalText = btn?.innerHTML;
    if (btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando PDF...'; btn.disabled = true; }

    try {
      const patientName = document.getElementById('patientName')?.value || '';
      const patientBirthdate = document.getElementById('patientBirthdate')?.value || '';

      const inputs = [];
      window.PAGE_CONFIG.form.sections.forEach(section => {
        section.fields.forEach(field => {
          const el = document.getElementById(field.id);
          if (el) {
            let value = el.value;
            if (field.type === 'select') {
              const opt = el.options[el.selectedIndex];
              value = opt ? opt.text : '';
            }
            inputs.push({ label: field.label, value: value || '—', unit: field.unit || '' });
          }
        });
      });

      const result = window.CALCULATOR_SYSTEM.lastResult;
      const interp1 = this.getInterpretation(result.apgar1);
      const interp5 = this.getInterpretation(result.apgar5);

      const pdfData = {
        patientName,
        patientBirthdate,
        inputs,
        result: {
          label: window.PAGE_CONFIG.calculation.result.label,
          value: `${result.apgar1} / ${result.apgar5}`,
          unit: 'pontos',
          interpretation: `1º min: ${interp1} | 5º min: ${interp5}`
        },
        auditSteps: [
          { label: 'Apgar 1º minuto', value: `${result.apgar1} pontos — ${interp1}` },
          { label: 'Apgar 5º minuto', value: `${result.apgar5} pontos — ${interp5}` }
        ],
        showNineRights: true,
        showSafetyGoals: true,
        canonicalUrl: window.PAGE_CONFIG.seo?.canonical || window.location.href
      };

      await window.CALCULATOR_SYSTEM.generatePDFReport(pdfData);
      this.playSound('success');
    } catch (error) {
      window.CALCULATOR_SYSTEM?.notify?.('Erro ao gerar PDF', 'error');
      this.playSound('error');
    } finally {
      if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
    }
  },

  copyResult: async function() {
    if (!window.CALCULATOR_SYSTEM?.lastResult) {
      window.CALCULATOR_SYSTEM?.notify?.('Nenhum resultado para copiar', 'error');
      this.playSound('error');
      return;
    }

    const btn = document.getElementById('btn-action-copyResult');
    const originalText = btn?.innerHTML;
    if (btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Copiando...'; btn.disabled = true; }

    try {
      const result = window.CALCULATOR_SYSTEM.lastResult;
      const i1 = this.getInterpretation(result.apgar1);
      const i5 = this.getInterpretation(result.apgar5);
      const text = `Apgar 1º min: ${result.apgar1} (${i1}) | 5º min: ${result.apgar5} (${i5})`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      window.CALCULATOR_SYSTEM?.notify?.('Resultado copiado!', 'success');
      this.playSound('success');
    } catch (err) {
      window.CALCULATOR_SYSTEM?.notify?.('Erro ao copiar', 'error');
      this.playSound('error');
    } finally {
      if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
    }
  },

  // CORRIGIDO A-11: adicionado case 'info'
  playSound: function(type) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      const now = audioCtx.currentTime;
      switch (type) {
        case 'error':
          oscillator.frequency.value = 440;
          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now); oscillator.stop(now + 0.3);
          break;
        case 'warning':
          oscillator.frequency.value = 330;
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start(now); oscillator.stop(now + 0.2);
          break;
        case 'success':
          oscillator.frequency.value = 523;
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.start(now); oscillator.stop(now + 0.15);
          break;
        case 'info':
          oscillator.frequency.value = 440;
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.start(now); oscillator.stop(now + 0.15);
          break;
        default: break;
      }
    } catch (e) { /* áudio não suportado */ }
  }
};

// CORRIGIDO A-10: guard DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => calculatorModule.init());
} else {
  calculatorModule.init();
}

window.calculatorModule = calculatorModule;
