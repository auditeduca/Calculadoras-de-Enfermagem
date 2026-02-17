// js/apache.js
const calculatorModule = {
  uiState: { resultsVisible: false },

  init: function() {
    this.renderForm();
    this.setupValidations();
    this.renderActionButtons();
    console.log('Módulo APACHE II inicializado');
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
    if (isNaN(date.getTime())) {
      field.classList.add('border-red-500', 'bg-red-50');
      return false;
    }
    if (year < 1900) {
      field.classList.add('border-red-500', 'bg-red-50');
      return false;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
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
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando...';
    btn.disabled = true;

    setTimeout(() => {
      try {
        // Coletar pontuações APS
        const temperatura = parseInt(document.getElementById('temperatura').value);
        const pam = parseInt(document.getElementById('pam').value);
        const fc = parseInt(document.getElementById('fc').value);
        const fr = parseInt(document.getElementById('fr').value);
        const oxigenacao = parseInt(document.getElementById('oxigenacao').value);
        const ph = parseInt(document.getElementById('ph').value);
        const sodio = parseInt(document.getElementById('sodio').value);
        const potassio = parseInt(document.getElementById('potassio').value);
        const creatinina = parseInt(document.getElementById('creatinina').value);
        const hematocrito = parseInt(document.getElementById('hematocrito').value);
        const leucocitos = parseInt(document.getElementById('leucocitos').value);

        const aps = temperatura + pam + fc + fr + oxigenacao + ph + sodio + potassio + creatinina + hematocrito + leucocitos;

        const idade_score = parseInt(document.getElementById('idade').value);
        const cronica_score = parseInt(document.getElementById('doenca_cronica').value);

        const apache_total = aps + idade_score + cronica_score;

        window.CALCULATOR_SYSTEM = window.CALCULATOR_SYSTEM || {};
        window.CALCULATOR_SYSTEM.lastResult = {
          aps,
          idade_score,
          cronica_score,
          apache_total,
          unit: 'pontos'
        };

        document.getElementById('res-total').innerText = apache_total;
        document.getElementById('res-unit').innerText = 'pontos';
        document.getElementById('results-wrapper').classList.remove('hidden');
        this.uiState.resultsVisible = true;

        this.renderAudit(window.CALCULATOR_SYSTEM.lastResult);
        this.renderChecklists();

        window.CALCULATOR_SYSTEM?.notify?.(`APACHE II = ${apache_total} pontos`, 'success');
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
    // Reutiliza a mesma lógica da insulina (poderia ser fatorada)
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
      document.getElementById('patientName').value = '';
      document.getElementById('patientBirthdate').value = '';
      // Resetar todos os selects (manter valores padrão)
      document.getElementById('temperatura').value = '0';
      document.getElementById('pam').value = '0';
      document.getElementById('fc').value = '0';
      document.getElementById('fr').value = '0';
      document.getElementById('oxigenacao').value = '0';
      document.getElementById('ph').value = '0';
      document.getElementById('sodio').value = '0';
      document.getElementById('potassio').value = '0';
      document.getElementById('creatinina').value = '0';
      document.getElementById('hematocrito').value = '0';
      document.getElementById('leucocitos').value = '0';
      document.getElementById('idade').value = '0';
      document.getElementById('doenca_cronica').value = '0';

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
    window.CALCULATOR_SYSTEM?.notify?.('PDF gerado (simulação)', 'success');
    this.playSound('success');
  },

  copyResult: async function() {
    if (!window.CALCULATOR_SYSTEM?.lastResult) {
      window.CALCULATOR_SYSTEM?.notify?.('Nenhum resultado para copiar', 'error');
      this.playSound('error');
      return;
    }
    const text = `APACHE II: ${window.CALCULATOR_SYSTEM.lastResult.apache_total} pontos`;
    await navigator.clipboard.writeText(text);
    window.CALCULATOR_SYSTEM?.notify?.('Resultado copiado!', 'success');
    this.playSound('success');
  },

  playSound: function(type) {
    // Mesma implementação da insulina (pode ser copiada)
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

// Inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => calculatorModule.init());
} else {
  calculatorModule.init();
}

window.calculatorModule = calculatorModule;