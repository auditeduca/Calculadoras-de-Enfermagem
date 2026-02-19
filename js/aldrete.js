// js/aldrete.js
// v2.0 — Corrigido: window.PAGE_CONFIG, renderForm() dinâmico, seletores por id, DOMContentLoaded guard, playSound('info')
const calculatorModule = {
  uiState: {
    resultsVisible: false,
    currentTab: 'calculator'
  },

  init: function() {
    this.renderForm();
    this.setupValidations();
    this.renderActionButtons();
  },

  // CORRIGIDO A-01: renderForm() dinâmico a partir do JSON (window.PAGE_CONFIG)
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
      // CORRIGIDO A-02: id específico por ação
      button.id = `btn-action-${btn.action}`;
      button.className = btn.type === 'primary' ? 'btn-primary-action' : 'btn-secondary-action';
      button.innerHTML = `<i class="fa-solid ${btn.icon}"></i> ${btn.label}`;
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof this[btn.action] === 'function') {
          this[btn.action]();
        } else {
          console.warn(`Ação ${btn.action} não implementada`);
        }
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
    if (isNaN(date.getTime())) { this.showFieldError(field, 'Data inválida'); return false; }
    if (year < 1900) { this.showFieldError(field, 'Ano mínimo 1900'); return false; }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) { this.showFieldError(field, 'Data futura'); return false; }
    this.clearFieldError(field);
    return true;
  },

  showFieldError: function(field, message) {
    field.classList.add('border-red-500', 'bg-red-50');
    field.classList.remove('border-yellow-500', 'bg-yellow-50');
  },

  clearFieldError: function(field) {
    field.classList.remove('border-red-500', 'bg-red-50', 'border-yellow-500', 'bg-yellow-50');
  },


  getInterpretation: function(score) {
    const ranges = window.PAGE_CONFIG?.calculation?.interpretation || [
      { max: 4,  label: 'Recuperação insatisfatória', color: 'text-red-600',    bg: 'bg-red-50',    conduct: 'Manter em SRPA — monitoramento intensivo' },
      { max: 6,  label: 'Recuperação moderada',       color: 'text-yellow-600', bg: 'bg-yellow-50', conduct: 'Aguardar evolução — reavaliar em 30 min' },
      { max: 8,  label: 'Recuperação boa',            color: 'text-blue-600',   bg: 'bg-blue-50',   conduct: 'Próximo da alta SRPA — monitorar' },
      { max: 10, label: 'Alta da SRPA recomendada',   color: 'text-green-600',  bg: 'bg-green-50',  conduct: 'Score ≥ 9 — elegível para alta conforme protocolo' }
    ];
    return ranges.find(r => score <= r.max) || ranges[ranges.length - 1];
  },

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
  calculate: function() {
    const btn = document.getElementById('btn-calculate');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Avaliando...';
    btn.disabled = true;

    setTimeout(() => {
      try {
        // CORRIGIDO C-01: usa window.PAGE_CONFIG (padrão arquitetural unificado)
        const activity      = parseInt(document.getElementById('activity').value);
        const respiration   = parseInt(document.getElementById('respiration').value);
        const circulation   = parseInt(document.getElementById('circulation').value);
        const consciousness = parseInt(document.getElementById('consciousness').value);
        const oxygenation   = parseInt(document.getElementById('oxygenation').value);

        const errors = [];
        if ([activity, respiration, circulation, consciousness, oxygenation].some(isNaN)) {
          errors.push('Todos os campos devem ser preenchidos');
        }

        const birthField = document.getElementById('patientBirthdate');
        if (birthField && birthField.value) {
          if (!this.validateDate(birthField)) errors.push('Data de nascimento inválida');
        }

        if (errors.length > 0) {
          errors.forEach(err => window.CALCULATOR_SYSTEM?.notify?.(err, 'error'));
          this.playSound('error');
          return;
        }

        const total = activity + respiration + circulation + consciousness + oxygenation;

        window.CALCULATOR_SYSTEM = window.CALCULATOR_SYSTEM || {};
        window.CALCULATOR_SYSTEM.lastResult = {
          activity, respiration, circulation, consciousness, oxygenation,
          total,
          unit: 'pontos'
        };

        document.getElementById('res-total').innerText = total;
        document.getElementById('res-unit').innerText = 'pontos';
        document.getElementById('results-wrapper').classList.remove('hidden');
        this.uiState.resultsVisible = true;

        this.renderAudit(window.CALCULATOR_SYSTEM.lastResult);
        this.renderInterpretation(total);
        this.renderChecklists();

        const alta = total >= 9
          ? 'Apto para alta da SRPA (score ≥ 9)'
          : 'Manter em observação (score < 9)';
        window.CALCULATOR_SYSTEM?.notify?.(`Aldrete = ${total} pontos — ${alta}`, 'success');
        this.playSound('success');

        if (window.AnalyticsTracker) {
          AnalyticsTracker.track('scale', 'calculate', 'aldrete', total);
        }

      } catch (error) {
        window.CALCULATOR_SYSTEM?.notify?.('Erro inesperado', 'error');
        this.playSound('error');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }, 400);
  },

  // CORRIGIDO C-01: usa window.PAGE_CONFIG.calculation.audit.steps
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

  // CORRIGIDO A-02: usa getElementById em vez de querySelector frágil
  reset: function() {
    const btn = document.getElementById('btn-reset');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Limpando...';
    btn.disabled = true;

    setTimeout(() => {
      // Reset guiado pelo JSON
      window.PAGE_CONFIG.form.sections.forEach(section => {
        section.fields.forEach(field => {
          const el = document.getElementById(field.id);
          if (!el) return;
          if (field.type === 'text' || field.type === 'date') {
            el.value = '';
          } else if (field.type === 'select') {
            el.value = field.default !== undefined ? String(field.default) : el.options[0]?.value;
          }
          this.clearFieldError(el);
        });
      });

      document.getElementById('results-wrapper').classList.add('hidden');
      this.uiState.resultsVisible = false;
      const interpEl = document.getElementById('res-interpretation');
      if (interpEl) interpEl.remove();
      window.CALCULATOR_SYSTEM = window.CALCULATOR_SYSTEM || {};
      window.CALCULATOR_SYSTEM.lastResult = null;

      document.querySelectorAll('#checklist-9rights input, #checklist-9certos input, #checklist-safety-goals input, #checklist-metas input').forEach(cb => cb.checked = false);

      window.CALCULATOR_SYSTEM?.notify?.('Campos resetados', 'info');
      this.playSound('info'); // CORRIGIDO A-03: case 'info' agora existe no playSound
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
      const steps = window.PAGE_CONFIG.calculation.audit.steps;
      const auditSteps = steps.map(step => {
        let value = result[step.sourceField];
        if (step.suffix) value += ' ' + step.suffix;
        return { label: step.label, value: value || '—' };
      });

      const pdfData = {
        patientName,
        patientBirthdate,
        inputs,
        result: {
          label: window.PAGE_CONFIG.calculation.result.label,
          value: result.total,
          unit: 'pontos'
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

  // CORRIGIDO A-02: usa id específico
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
      const text = `${window.PAGE_CONFIG.calculation.result.label}: ${result.total} pontos`;
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

  // CORRIGIDO A-03: adicionado case 'info'
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

// CORRIGIDO A-04: guard DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => calculatorModule.init());
} else {
  calculatorModule.init();
}

window.calculatorModule = calculatorModule;
