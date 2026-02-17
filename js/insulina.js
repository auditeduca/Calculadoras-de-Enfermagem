// js/insulina.js
const calculatorModule = {
  uiState: {
    resultsVisible: false,
    currentTab: 'calculator'
  },

  init: function() {
    this.renderForm();
    this.setupValidations();
    this.renderActionButtons();
    console.log('Módulo insulina inicializado');
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
        if (field.unit) html += ` (${field.unit})`;
        if (field.required) html += ` <span class="text-red-500">*</span>`;
        html += `</label>`;

        if (field.type === 'select') {
          html += `<select id="${field.id}" class="w-full p-3 border rounded-lg bg-white dark:bg-slate-800">`;
          field.options.forEach(opt => {
            const selected = (opt.value == field.default) ? 'selected' : '';
            html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
          });
          html += `</select>`;
        } else if (field.type === 'number') {
          html += `<input type="number" id="${field.id}" step="${field.step || 'any'}" min="${field.min || 0}" placeholder="${field.placeholder || ''}" class="w-full p-3 border rounded-lg">`;
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

    // Exibir botões calcular/limpar
    document.getElementById('btn-calculate').style.display = 'block';
    document.getElementById('btn-reset').style.display = 'block';

    // Anexar eventos
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
    const doseField = document.getElementById('prescribedDose');
    if (doseField) {
      doseField.addEventListener('keydown', (e) => this.blockNonNumeric(e));
      doseField.addEventListener('input', () => this.validateDose(doseField));
    }
    const birthField = document.getElementById('patientBirthdate');
    if (birthField) {
      birthField.addEventListener('change', () => this.validateDate(birthField));
    }
  },

  blockNonNumeric: function(e) {
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (controlKeys.includes(e.key)) return;
    if (!/^[\d.]$/.test(e.key)) {
      e.preventDefault();
    }
    if (e.key === '.' && e.target.value.includes('.')) {
      e.preventDefault();
    }
  },

  validateDose: function(field) {
    const value = field.value;
    if (value === '') {
      this.clearFieldError(field);
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      this.showFieldError(field, 'Valor inválido');
    } else if (num > 1000) {
      this.showFieldWarning(field, 'Valor acima de 1000 UI');
    } else {
      this.clearFieldError(field);
    }
  },

  validateDate: function(field) {
    const value = field.value;
    if (!value) return true;
    const date = new Date(value);
    const year = date.getFullYear();
    if (isNaN(date.getTime())) {
      this.showFieldError(field, 'Data inválida');
      return false;
    }
    if (year < 1900) {
      this.showFieldError(field, 'Ano mínimo 1900');
      return false;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date > today) {
      this.showFieldError(field, 'Data futura');
      return false;
    }
    this.clearFieldError(field);
    return true;
  },

  showFieldError: function(field, message) {
    field.classList.add('border-red-500', 'bg-red-50');
    field.classList.remove('border-yellow-500', 'bg-yellow-50');
  },

  showFieldWarning: function(field, message) {
    field.classList.add('border-yellow-500', 'bg-yellow-50');
    field.classList.remove('border-red-500', 'bg-red-50');
  },

  clearFieldError: function(field) {
    field.classList.remove('border-red-500', 'bg-red-50', 'border-yellow-500', 'bg-yellow-50');
  },

  calculate: function() {
    const btn = document.getElementById('btn-calculate');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando...';
    btn.disabled = true;

    setTimeout(() => {
      try {
        const dose = document.getElementById('prescribedDose').value.trim();
        const concentration = document.getElementById('insulinConcentration').value;

        // Validações
        const errors = [];
        const warnings = [];

        this.clearFieldError(document.getElementById('prescribedDose'));

        if (dose === '') {
          errors.push('Informe a prescrição médica');
          this.showFieldError(document.getElementById('prescribedDose'), 'Campo obrigatório');
        } else {
          const doseNum = parseFloat(dose);
          if (isNaN(doseNum) || doseNum <= 0) {
            errors.push('Prescrição deve ser um número positivo');
            this.showFieldError(document.getElementById('prescribedDose'), 'Valor inválido');
          } else if (doseNum > 1000) {
            warnings.push('Prescrição acima de 1000 UI – verifique necessidade');
            this.showFieldWarning(document.getElementById('prescribedDose'), 'Valor alto');
          }
        }

        const concNum = parseInt(concentration, 10);
        if (![100, 200, 300].includes(concNum)) {
          errors.push('Concentração inválida');
          this.showFieldError(document.getElementById('insulinConcentration'), 'Opção inválida');
        }

        // Data opcional
        const birthField = document.getElementById('patientBirthdate');
        if (birthField && birthField.value) {
          if (!this.validateDate(birthField)) {
            errors.push('Data de nascimento inválida');
          }
        }

        if (errors.length > 0) {
          errors.forEach(err => window.CALCULATOR_SYSTEM?.notify?.(err, 'error'));
          this.playSound('error');
          btn.innerHTML = originalText;
          btn.disabled = false;
          return;
        }

        if (warnings.length > 0) {
          warnings.forEach(warn => window.CALCULATOR_SYSTEM?.notify?.(warn, 'warning'));
          this.playSound('warning');
        }

        // Cálculo
        const doseNum = parseFloat(dose);
        const volume = doseNum / concNum;

        window.CALCULATOR_SYSTEM = window.CALCULATOR_SYSTEM || {};
        window.CALCULATOR_SYSTEM.lastResult = {
          prescribedDose: doseNum,
          insulinConcentration: concNum,
          volume: volume.toFixed(2),
          unit: 'mL',
          concentrationType: concNum === 100 ? 'U100' : concNum === 200 ? 'U200' : 'U300'
        };

        // Atualizar UI
        document.getElementById('res-total').innerText = window.CALCULATOR_SYSTEM.lastResult.volume;
        document.getElementById('res-unit').innerText = window.CALCULATOR_SYSTEM.lastResult.unit;
        document.getElementById('results-wrapper').classList.remove('hidden');
        this.uiState.resultsVisible = true;

        this.renderAudit(window.CALCULATOR_SYSTEM.lastResult);
        this.renderChecklists();

        window.CALCULATOR_SYSTEM?.notify?.('Cálculo realizado!', 'success');
        this.playSound('success');

      } catch (error) {
        window.CALCULATOR_SYSTEM?.notify?.('Erro inesperado', 'error');
        this.playSound('error');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }, 600);
  },

  renderAudit: function(result) {
    const steps = window.PAGE_CONFIG.calculation.audit.steps;
    const list = document.getElementById('audit-list');
    if (!list) return;
    list.innerHTML = '';

    steps.forEach(step => {
      let value = '';
      if (step.sourceField) {
        value = result[step.sourceField];
        if (step.format && typeof this[step.format] === 'function') {
          value = this[step.format](value);
        }
        if (step.suffix) value += ' ' + step.suffix;
      } else if (step.fixedValue) {
        value = step.fixedValue;
      } else if (step.dynamicExpression) {
        value = step.dynamicExpression.replace(/\{\{(\w+)\}\}/g, (_, key) => result[key] || '');
      }

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

  concentrationType: function(value) {
    const types = { 100: 'U100', 200: 'U200', 300: 'U300' };
    return types[value] || '';
  },

  renderChecklists: function() {
    const nineRights = [
      "Paciente Certo", "Medicação Certa", "Dose Certa", "Via Certa", "Hora Certa",
      "Registro Certo", "Validade Certa", "Resposta Certa", "Forma Farmacêutica Certa"
    ];
    const container = document.getElementById('checklist-9rights');
    if (container) {
      container.innerHTML = nineRights.map(text => `
        <label class="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-nurse-secondary transition group animate-fade-in">
          <input type="checkbox" class="w-4 h-4 accent-nurse-primary transition"/> 
          <span class="group-hover:text-nurse-primary transition-colors">${text}</span>
        </label>
      `).join('');
    }

    const safetyGoals = [
      { id: 1, text: "Identificar o paciente corretamente", class: "glass-meta-blue" },
      { id: 2, text: "Comunicação Efetiva na passagem de plantão", class: "glass-meta-blue" },
      { id: 3, text: "Segurança de Medicamentos de Alta Vigilância", class: "glass-meta-orange" },
      { id: 6, text: "Reduzir risco de quedas do paciente", class: "glass-meta-blue" }
    ];
    const goalsContainer = document.getElementById('checklist-safety-goals');
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
      document.getElementById('prescribedDose').value = '';
      document.getElementById('insulinConcentration').value = '100';
      document.getElementById('prescribedDose').classList.remove('border-red-500', 'bg-red-50', 'border-yellow-500', 'bg-yellow-50');
      document.getElementById('results-wrapper').classList.add('hidden');
      this.uiState.resultsVisible = false;
      window.CALCULATOR_SYSTEM = window.CALCULATOR_SYSTEM || {};
      window.CALCULATOR_SYSTEM.lastResult = null;

      document.querySelectorAll('#checklist-9rights input, #checklist-safety-goals input').forEach(cb => cb.checked = false);

      window.CALCULATOR_SYSTEM?.notify?.('Campos resetados', 'info');
      this.playSound('info');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 400);
  },

  generatePDF: async function() {
    if (!window.CALCULATOR_SYSTEM?.lastResult) {
      window.CALCULATOR_SYSTEM?.notify?.('Realize um cálculo primeiro', 'error');
      this.playSound('error');
      return;
    }

    // Simulação de geração de PDF (substituir pela implementação real)
    window.CALCULATOR_SYSTEM?.notify?.('PDF gerado (simulação)', 'success');
    this.playSound('success');
  },

  copyResult: async function() {
    if (!window.CALCULATOR_SYSTEM?.lastResult) {
      window.CALCULATOR_SYSTEM?.notify?.('Nenhum resultado para copiar', 'error');
      this.playSound('error');
      return;
    }

    const btn = document.querySelector('#result-actions button:nth-child(2)'); // hack, melhor usar id específico
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Copiando...';
      btn.disabled = true;
    }

    try {
      const text = `${window.PAGE_CONFIG.calculation.result.label}: ${window.CALCULATOR_SYSTEM.lastResult.volume} ${window.CALCULATOR_SYSTEM.lastResult.unit}`;
      await navigator.clipboard.writeText(text);
      window.CALCULATOR_SYSTEM?.notify?.('Resultado copiado!', 'success');
      this.playSound('success');
    } catch (err) {
      window.CALCULATOR_SYSTEM?.notify?.('Erro ao copiar', 'error');
      this.playSound('error');
    } finally {
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar Resultado';
        btn.disabled = false;
      }
    }
  },

  searchNursingDiagnosis: function() {
    // Abrir modal ou pesquisa (simulado)
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
      switch(type) {
        case 'error':
          oscillator.frequency.value = 440;
          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;
        case 'warning':
          oscillator.frequency.value = 330;
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;
        case 'success':
          oscillator.frequency.value = 523;
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;
        default: break;
      }
    } catch (e) {
      console.log('Áudio não suportado');
    }
  }
};

// Inicialização após carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => calculatorModule.init());
} else {
  calculatorModule.init();
}

window.calculatorModule = calculatorModule;