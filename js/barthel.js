// js/barthel.js
// v1.0 — Implementação completa da Escala de Barthel (Mahoney & Barthel, 1965)
const calculatorModule = {
  uiState: { resultsVisible: false },

  init: function() {
    this.renderForm();
    this.setupValidations();
    this.renderActionButtons();
  },

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
        if (field.maxScore) html += ` <span class="text-xs text-slate-400 font-normal">(máx. ${field.maxScore} pts)</span>`;
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
        } else if (field.type === 'date') {
          html += `<input type="date" id="${field.id}" class="w-full p-3 border rounded-lg">`;
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
    const birthField = document.getElementById('patientBirthdate');
    if (birthField) {
      birthField.addEventListener('change', () => this.validateDate(birthField));
    }
  },

  validateDate: function(field) {
    const value = field.value;
    if (!value) return true;
    const date = new Date(value);
    const year = date.getFullYear();
    if (isNaN(date.getTime()) || year < 1900) {
      field.classList.add('border-red-500', 'bg-red-50');
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
        let total = 0;
        const itemScores = {};
        const errors = [];

        // Itera dinamicamente pelos campos do JSON
        window.PAGE_CONFIG.form.sections.forEach(section => {
          section.fields.forEach(field => {
            if (field.type !== 'select' || !field.required) return;
            const el = document.getElementById(field.id);
            if (!el) return;
            const val = parseInt(el.value, 10);
            if (isNaN(val)) {
              errors.push(`Preencha: ${field.label}`);
              el.classList.add('border-red-500', 'bg-red-50');
              return;
            }
            el.classList.remove('border-red-500', 'bg-red-50');
            total += val;
            itemScores[field.id] = val;
          });
        });

        const birthField = document.getElementById('patientBirthdate');
        if (birthField && birthField.value) {
          if (!this.validateDate(birthField)) errors.push('Data de nascimento inválida');
        }

        if (errors.length > 0) {
          errors.forEach(err => window.CALCULATOR_SYSTEM?.notify?.(err, 'error'));
          this.playSound('error');
          return;
        }

        window.CALCULATOR_SYSTEM = window.CALCULATOR_SYSTEM || {};
        window.CALCULATOR_SYSTEM.lastResult = {
          total,
          itemScores,
          unit: 'pontos'
        };

        document.getElementById('res-total').innerText = total;
        document.getElementById('res-unit').innerText = 'pontos';
        document.getElementById('results-wrapper').classList.remove('hidden');
        this.uiState.resultsVisible = true;

        this.renderAudit(window.CALCULATOR_SYSTEM.lastResult);
        this.renderInterpretation(total);
        this.renderChecklists();

        const interp = this.getInterpretation(total);
        window.CALCULATOR_SYSTEM?.notify?.(`Barthel = ${total} pts — ${interp.label}`, 'success');
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

  // Interpretação clínica da Escala de Barthel (C-07)
  getInterpretation: function(score) {
    const ranges = window.PAGE_CONFIG?.calculation?.interpretation || [
      { max: 20,       label: 'Dependência Total',    color: 'text-red-600',    bg: 'bg-red-50',    conduct: 'Cuidado intensivo — supervisão contínua necessária' },
      { max: 60,       label: 'Dependência Grave',    color: 'text-orange-600', bg: 'bg-orange-50', conduct: 'Assistência em quase todas as AVDs' },
      { max: 90,       label: 'Dependência Moderada', color: 'text-yellow-600', bg: 'bg-yellow-50', conduct: 'Supervisão e ajuda em algumas atividades' },
      { max: 99,       label: 'Dependência Leve',     color: 'text-blue-600',   bg: 'bg-blue-50',   conduct: 'Assistência mínima e supervisão esporádica' },
      { max: Infinity, label: 'Independente',         color: 'text-green-600',  bg: 'bg-green-50',  conduct: 'Alta avaliada conforme contexto clínico global' }
    ];
    return ranges.find(r => score <= r.max) || ranges[ranges.length - 1];
  },

  // Exibe interpretação na UI (equivalente ao que foi corrigido no apgar M-06)
  renderInterpretation: function(score) {
    const interp = this.getInterpretation(score);
    let interpEl = document.getElementById('res-interpretation');
    if (!interpEl) {
      interpEl = document.createElement('div');
      interpEl.id = 'res-interpretation';
      interpEl.className = 'mt-4 p-4 rounded-xl animate-fade-in text-sm text-center';
      const resultBox = document.querySelector('#results-wrapper .text-center');
      if (resultBox) resultBox.appendChild(interpEl);
    }
    interpEl.className = `mt-4 p-4 rounded-xl animate-fade-in ${interp.bg} dark:bg-slate-800`;
    interpEl.innerHTML = `
      <span class="font-black text-lg ${interp.color}">${interp.label}</span>
      <p class="text-slate-600 dark:text-slate-300 text-xs mt-1">${interp.conduct}</p>
    `;
  },

  renderAudit: function(result) {
    const list = document.getElementById('audit-list');
    if (!list) return;
    list.innerHTML = '';

    // Exibe breakdown por item
    window.PAGE_CONFIG.form.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type !== 'select') return;
        const score = result.itemScores[field.id];
        if (score === undefined) return;

        const el = document.getElementById(field.id);
        const selectedLabel = el ? el.options[el.selectedIndex]?.text : '';

        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm border border-slate-100 dark:border-slate-700 animate-fade-in';
        li.innerHTML = `
          <div class="flex items-center gap-3">
            <i class="fa-solid ${field.icon || 'fa-check'} text-nurse-secondary"></i>
            <div>
              <span class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">${field.label}</span>
              <span class="text-xs text-slate-400 block">${selectedLabel}</span>
            </div>
          </div>
          <span class="font-black text-nurse-primary dark:text-cyan-400">${score} pts</span>
        `;
        list.appendChild(li);
      });
    });

    // Total
    const totalLi = document.createElement('li');
    totalLi.className = 'flex items-center justify-between p-4 bg-nurse-primary/5 dark:bg-cyan-900/20 rounded-xl text-sm border-2 border-nurse-primary/20 animate-fade-in mt-2';
    totalLi.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-star text-nurse-primary"></i>
        <span class="font-black uppercase text-[10px] tracking-wider text-nurse-primary">Pontuação Total</span>
      </div>
      <span class="font-black text-2xl text-nurse-primary dark:text-cyan-400">${result.total} pts</span>
    `;
    list.appendChild(totalLi);
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
          if (['text', 'date'].includes(field.type)) {
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
      this.playSound('info');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 400);
  },

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
      const interp = this.getInterpretation(result.total);

      // Breakdown por item para o PDF
      const auditSteps = [];
      window.PAGE_CONFIG.form.sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.type !== 'select') return;
          const score = result.itemScores[field.id];
          if (score !== undefined) {
            auditSteps.push({ label: field.label, value: `${score} pontos` });
          }
        });
      });
      auditSteps.push({ label: 'Pontuação Total', value: `${result.total} pontos — ${interp.label}` });

      const pdfData = {
        patientName,
        patientBirthdate,
        inputs,
        result: {
          label: window.PAGE_CONFIG.calculation.result.label,
          value: result.total,
          unit: 'pontos',
          interpretation: `${interp.label}: ${interp.conduct}`
        },
        auditSteps,
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
      const interp = this.getInterpretation(result.total);
      const text = `Escala de Barthel: ${result.total} pontos — ${interp.label}`;
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

  searchNursingDiagnosis: function() {
    window.CALCULATOR_SYSTEM?.showModal?.('nanda');
  },

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => calculatorModule.init());
} else {
  calculatorModule.init();
}

window.calculatorModule = calculatorModule;
