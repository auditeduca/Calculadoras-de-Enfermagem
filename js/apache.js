// js/apache.js
const calculatorModule = {
  uiState: { resultsVisible: false },

  init: function() {
    this.setupValidations();
    console.log('Módulo APACHE II inicializado');
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

        CALCULATOR_SYSTEM.lastResult = {
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

        this.renderAudit(CALCULATOR_SYSTEM.lastResult);
        this.renderChecklists();

        CALCULATOR_SYSTEM.notify(`APACHE II = ${apache_total} pontos`, 'success');
        this.playSound('success');

      } catch (error) {
        CALCULATOR_SYSTEM.notify('Erro inesperado', 'error');
        this.playSound('error');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }, 400);
  },

  renderAudit: function(result) {
    const steps = CALCULATOR_SYSTEM.config.calculation.audit.steps;
    const list = document.getElementById('audit-list');
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
    // Padrão (reutilizado de outras)
  },

  reset: function() {
    const btn = document.querySelector('button[onclick*="reset"]');
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
      CALCULATOR_SYSTEM.lastResult = null;

      document.querySelectorAll('#checklist-9rights input, #checklist-safety-goals input').forEach(cb => cb.checked = false);

      CALCULATOR_SYSTEM.notify('Campos resetados', 'info');
      this.playSound('info');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 400);
  },

  generatePDF: async function() {
    // ... implementar conforme padrão
  },

  copyResult: async function() {
    if (!CALCULATOR_SYSTEM.lastResult) return;
    const text = `APACHE II: ${CALCULATOR_SYSTEM.lastResult.apache_total} pontos`;
    await navigator.clipboard.writeText(text);
    CALCULATOR_SYSTEM.notify('Resultado copiado!', 'success');
  },

  playSound: function(type) {
    // ...
  }
};

window.calculatorModule = calculatorModule;