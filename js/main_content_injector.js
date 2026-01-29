/**
 * Main Content Injector
 * Sistema de injeção de calculadoras de enfermagem em elemento main-content
 * 
 * Uso:
 * const injector = new MainContentInjector();
 * injector.init();
 */

class MainContentInjector {
  constructor(options = {}) {
    this.containerId = options.containerId || 'main-content';
    this.jsonPath = options.jsonPath || 'nursing_calculators.json';
    this.container = null;
    this.calculators = [];
    this.theme = options.theme || 'light';
    this.language = options.language || 'pt-BR';
  }

  /**
   * Inicializa o sistema
   */
  async init() {
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.error(`Container com ID "${this.containerId}" não encontrado`);
      return false;
    }

    try {
      await this.loadCalculators();
      this.render();
      return true;
    } catch (error) {
      console.error('Erro ao inicializar injector:', error);
      this.renderError(error);
      return false;
    }
  }

  /**
   * Carrega as calculadoras do JSON
   */
  async loadCalculators() {
    const response = await fetch(this.jsonPath);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar ${this.jsonPath}: ${response.statusText}`);
    }

    const data = await response.json();
    this.calculators = data.calculators || [];

    if (this.calculators.length === 0) {
      throw new Error('Nenhuma calculadora encontrada no JSON');
    }
  }

  /**
   * Renderiza todas as calculadoras
   */
  render() {
    this.container.innerHTML = '';
    this.container.classList.add('nursing-calculators-container');

    this.calculators.forEach(calculator => {
      const element = this.createCalculatorElement(calculator);
      this.container.appendChild(element);
    });

    this.attachEventListeners();
  }

  /**
   * Cria elemento HTML para uma calculadora
   */
  createCalculatorElement(calculator) {
    const wrapper = document.createElement('div');
    wrapper.className = 'calculator-wrapper';
    wrapper.id = `calculator-${calculator.id}`;
    wrapper.setAttribute('data-calculator', calculator.id);

    const card = document.createElement('div');
    card.className = 'calculator-card';

    // Header
    const header = document.createElement('div');
    header.className = 'calculator-header';
    header.innerHTML = `
      <h2 class="calculator-title">${calculator.name}</h2>
      <p class="calculator-description">${calculator.description}</p>
    `;

    // Form
    const form = document.createElement('form');
    form.className = 'calculator-form';
    form.id = `form-${calculator.id}`;
    form.setAttribute('data-calculator', calculator.id);

    // Adiciona campos
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'calculator-fields';

    if (Array.isArray(calculator.fields)) {
      calculator.fields.forEach(field => {
        const fieldElement = this.createFieldElement(field);
        fieldsContainer.appendChild(fieldElement);
      });
    } else if (typeof calculator.fields === 'object') {
      Object.keys(calculator.fields).forEach(groupName => {
        if (Array.isArray(calculator.fields[groupName])) {
          const groupLabel = document.createElement('h4');
          groupLabel.className = 'field-group-label';
          groupLabel.textContent = groupName.charAt(0).toUpperCase() + groupName.slice(1);
          fieldsContainer.appendChild(groupLabel);

          calculator.fields[groupName].forEach(field => {
            const fieldElement = this.createFieldElement(field);
            fieldsContainer.appendChild(fieldElement);
          });
        }
      });
    }

    form.appendChild(fieldsContainer);

    // Botões
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'calculator-buttons';
    buttonGroup.innerHTML = `
      <button type="button" class="btn btn-calculate" data-calculator="${calculator.id}">
        Calcular
      </button>
      <button type="button" class="btn btn-clear" data-calculator="${calculator.id}">
        Limpar
      </button>
      <button type="button" class="btn btn-copy" data-calculator="${calculator.id}">
        Copiar Resultado
      </button>
    `;

    form.appendChild(buttonGroup);

    // Resultado
    const resultContainer = document.createElement('div');
    resultContainer.className = 'calculator-result';
    resultContainer.id = `result-${calculator.id}`;

    // Fórmula
    let formulaHTML = '';
    if (calculator.formula) {
      formulaHTML = `
        <div class="calculator-formula">
          <details>
            <summary>📐 Fórmula</summary>
            <div class="formula-content">
              <p><strong>Descrição:</strong> ${calculator.formula.description || ''}</p>
              <code>${calculator.formula.calculation || ''}</code>
            </div>
          </details>
        </div>
      `;
    }

    // Avisos
    let warningHTML = '';
    if (calculator.warnings && Array.isArray(calculator.warnings)) {
      warningHTML = `
        <div class="calculator-warnings">
          <details>
            <summary>⚠️ Avisos Importantes</summary>
            <ul class="warning-list">
              ${calculator.warnings.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </details>
        </div>
      `;
    }

    // Referência
    const referenceHTML = `
      <div class="calculator-reference">
        <small>
          <strong>Fonte:</strong> 
          <a href="${calculator.url}" target="_blank" rel="noopener noreferrer">
            ${calculator.url}
          </a>
        </small>
      </div>
    `;

    card.appendChild(header);
    card.appendChild(form);
    card.appendChild(resultContainer);
    card.innerHTML += formulaHTML;
    card.innerHTML += warningHTML;
    card.innerHTML += referenceHTML;

    wrapper.appendChild(card);
    return wrapper;
  }

  /**
   * Cria elemento HTML para um campo
   */
  createFieldElement(field) {
    const container = document.createElement('div');
    container.className = 'form-group';

    const label = document.createElement('label');
    label.htmlFor = field.id;
    label.className = 'form-label';
    label.textContent = field.name;

    if (field.required) {
      const required = document.createElement('span');
      required.className = 'required';
      required.textContent = '*';
      label.appendChild(required);
    }

    container.appendChild(label);

    let input;

    if (field.type === 'select') {
      input = document.createElement('select');
      input.id = field.id;
      input.name = field.id;
      input.className = 'form-control';

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Selecione uma opção';
      input.appendChild(defaultOption);

      field.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        input.appendChild(optionElement);
      });
    } else if (field.type === 'date') {
      input = document.createElement('input');
      input.type = 'date';
      input.id = field.id;
      input.name = field.id;
      input.className = 'form-control';
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
      input.id = field.id;
      input.name = field.id;
      input.className = 'form-control';
      input.placeholder = field.placeholder || '';
    }

    if (field.required) {
      input.required = true;
    }

    container.appendChild(input);

    if (field.unit) {
      const unitLabel = document.createElement('span');
      unitLabel.className = 'unit-label';
      unitLabel.textContent = field.unit;
      container.appendChild(unitLabel);
    }

    return container;
  }

  /**
   * Anexa event listeners aos botões
   */
  attachEventListeners() {
    // Botões de calcular
    document.querySelectorAll('.btn-calculate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const calculatorId = e.target.getAttribute('data-calculator');
        this.calculate(calculatorId);
      });
    });

    // Botões de limpar
    document.querySelectorAll('.btn-clear').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const calculatorId = e.target.getAttribute('data-calculator');
        this.clear(calculatorId);
      });
    });

    // Botões de copiar
    document.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const calculatorId = e.target.getAttribute('data-calculator');
        this.copyResult(calculatorId);
      });
    });
  }

  /**
   * Executa o cálculo
   */
  calculate(calculatorId) {
    const form = document.getElementById(`form-${calculatorId}`);
    const resultDiv = document.getElementById(`result-${calculatorId}`);

    if (!form) {
      console.error(`Formulário não encontrado: form-${calculatorId}`);
      return;
    }

    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      let result = this.executeCalculation(calculatorId, data);

      this.displayResult(result, resultDiv, calculatorId);
    } catch (error) {
      this.displayError(error, resultDiv);
    }
  }

  /**
   * Executa o cálculo específico
   */
  executeCalculation(calculatorId, data) {
    if (typeof NursingCalculators === 'undefined') {
      throw new Error('NursingCalculators não está carregado');
    }

    switch (calculatorId) {
      case 'heparina':
        return NursingCalculators.heparina(
          parseFloat(data.heparinaConcentracao),
          parseFloat(data.heparinaVolume),
          parseFloat(data.heparinaPrescricao)
        );

      case 'insulina':
        return NursingCalculators.insulina(
          parseFloat(data.prescricao),
          data.seringaSelect
        );

      case 'balancohidrico':
        return NursingCalculators.balancohidrico(
          {
            oral: parseFloat(data.ingestaoOral) || 0,
            sonda: parseFloat(data.ingestaoSonda) || 0,
            parenteral: parseFloat(data.ingestaoParenteral) || 0,
            outros: parseFloat(data.ingestaoOutros) || 0
          },
          {
            urina: parseFloat(data.eliminacaoUrina) || 0,
            vomito: parseFloat(data.eliminacaoVomito) || 0,
            drenos: parseFloat(data.eliminacaoDrenos) || 0,
            outros: parseFloat(data.eliminacaoOutros) || 0
          }
        );

      case 'dimensionamento':
        return NursingCalculators.dimensionamento({
          cargaHoraria: parseFloat(data.cargaHoraria),
          tipoUnidade: data.tipoUnidade,
          numCM: parseFloat(data.numCM) || 0,
          numCI: parseFloat(data.numCI) || 0,
          numCAD: parseFloat(data.numCAD) || 0,
          numCSI: parseFloat(data.numCSI) || 0
        });

      case 'gasometria':
        return NursingCalculators.gasometria({
          ph: parseFloat(data.ph) || null,
          paco2: parseFloat(data.paco2) || null,
          po2: parseFloat(data.po2) || null,
          hco3: parseFloat(data.hco3) || null,
          be: parseFloat(data.be) || null,
          ctco2: parseFloat(data.ctco2) || null,
          sato2: parseFloat(data.sato2) || null,
          na: parseFloat(data.na) || null,
          k: parseFloat(data.k) || null,
          ca: parseFloat(data.ca) || null,
          cl: parseFloat(data.cl) || null,
          glu: parseFloat(data.glu) || null,
          lactato: parseFloat(data.lactato) || null,
          thb: parseFloat(data.thb) || null,
          fo2hb: parseFloat(data.fo2hb) || null,
          fcohb: parseFloat(data.fcohb) || null,
          fmethb: parseFloat(data.fmethb) || null,
          fhhb: parseFloat(data.fhhb) || null
        });

      case 'gotejamento':
        return NursingCalculators.gotejamento({
          volume: parseFloat(data.volume),
          tempo: parseFloat(data.tempo),
          unidadeTempo: data.unidadeTempo,
          equipo: data.equipo
        });

      case 'gestacional':
        return NursingCalculators.gestacional(data.dum);

      case 'imc':
        return NursingCalculators.imc(
          parseFloat(data.peso),
          parseFloat(data.altura)
        );

      case 'medicamentos':
        return NursingCalculators.medicamentos(
          parseFloat(data.prescricao),
          parseFloat(data.concentracao),
          parseFloat(data.volumeTotal)
        );

      default:
        throw new Error(`Calculadora desconhecida: ${calculatorId}`);
    }
  }

  /**
   * Exibe o resultado
   */
  displayResult(result, resultDiv, calculatorId) {
    resultDiv.innerHTML = '';
    resultDiv.classList.add('show');

    if (result.error) {
      this.displayError(new Error(result.error), resultDiv);
      return;
    }

    const resultContent = document.createElement('div');
    resultContent.className = 'result-content';

    const title = document.createElement('h3');
    title.className = 'result-title';
    title.textContent = '✅ Resultado';
    resultContent.appendChild(title);

    const table = document.createElement('table');
    table.className = 'result-table';

    Object.keys(result).forEach(key => {
      if (!['detalhes', 'valores', 'interpretacao', 'pacientes'].includes(key)) {
        const row = table.insertRow();
        row.className = 'result-row';

        const labelCell = row.insertCell(0);
        labelCell.className = 'result-label';
        labelCell.textContent = this.formatLabel(key);

        const valueCell = row.insertCell(1);
        valueCell.className = 'result-value';

        if (typeof result[key] === 'object') {
          valueCell.textContent = JSON.stringify(result[key]);
        } else {
          valueCell.textContent = result[key];
        }
      }
    });

    resultContent.appendChild(table);
    resultDiv.appendChild(resultContent);

    // Armazena resultado para cópia
    resultDiv.setAttribute('data-result', JSON.stringify(result));
  }

  /**
   * Exibe erro
   */
  displayError(error, resultDiv) {
    resultDiv.innerHTML = '';
    resultDiv.classList.add('show');

    const errorContent = document.createElement('div');
    errorContent.className = 'error-content';

    const title = document.createElement('h3');
    title.className = 'error-title';
    title.textContent = '❌ Erro';
    errorContent.appendChild(title);

    const message = document.createElement('p');
    message.className = 'error-message';
    message.textContent = error.message;
    errorContent.appendChild(message);

    resultDiv.appendChild(errorContent);
  }

  /**
   * Limpa o formulário
   */
  clear(calculatorId) {
    const form = document.getElementById(`form-${calculatorId}`);
    const resultDiv = document.getElementById(`result-${calculatorId}`);

    if (form) {
      form.reset();
    }

    if (resultDiv) {
      resultDiv.classList.remove('show');
      resultDiv.innerHTML = '';
    }
  }

  /**
   * Copia o resultado
   */
  copyResult(calculatorId) {
    const resultDiv = document.getElementById(`result-${calculatorId}`);
    const resultData = resultDiv.getAttribute('data-result');

    if (!resultData) {
      alert('Nenhum resultado para copiar. Execute um cálculo primeiro.');
      return;
    }

    try {
      const result = JSON.parse(resultData);
      const text = JSON.stringify(result, null, 2);

      navigator.clipboard.writeText(text).then(() => {
        alert('Resultado copiado para a área de transferência!');
      }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar resultado');
      });
    } catch (error) {
      console.error('Erro ao processar resultado:', error);
      alert('Erro ao copiar resultado');
    }
  }

  /**
   * Formata label para exibição
   */
  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Renderiza erro
   */
  renderError(error) {
    this.container.innerHTML = `
      <div class="error-container">
        <h2>⚠️ Erro ao Carregar Calculadoras</h2>
        <p>${error.message}</p>
        <p>Verifique se o arquivo nursing_calculators.json está disponível.</p>
      </div>
    `;
  }

  /**
   * Adiciona estilos CSS
   */
  static injectStyles() {
    if (document.getElementById('nursing-calculators-styles')) {
      return; // Estilos já foram injetados
    }

    const style = document.createElement('style');
    style.id = 'nursing-calculators-styles';
    style.textContent = `
      .nursing-calculators-container {
        display: grid;
        gap: 2rem;
        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      }

      .calculator-wrapper {
        width: 100%;
      }

      .calculator-card {
        background: white;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: box-shadow 0.3s;
      }

      .calculator-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .calculator-header {
        margin-bottom: 1.5rem;
      }

      .calculator-title {
        color: #667eea;
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
      }

      .calculator-description {
        color: #666;
        margin: 0;
        font-size: 0.95rem;
      }

      .calculator-form {
        margin-bottom: 1.5rem;
      }

      .calculator-fields {
        margin-bottom: 1.5rem;
      }

      .form-group {
        margin-bottom: 1rem;
        position: relative;
      }

      .form-label {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
        font-weight: 500;
        font-size: 0.95rem;
      }

      .required {
        color: #e74c3c;
        margin-left: 0.25rem;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.3s;
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .unit-label {
        position: absolute;
        right: 0.75rem;
        top: 2.5rem;
        color: #999;
        font-size: 0.85rem;
        pointer-events: none;
      }

      .field-group-label {
        color: #667eea;
        margin: 1rem 0 0.5rem 0;
        font-size: 0.95rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .calculator-buttons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 0.95rem;
        cursor: pointer;
        transition: background-color 0.3s;
        font-weight: 600;
      }

      .btn-calculate {
        background-color: #667eea;
        color: white;
        flex: 1;
        min-width: 150px;
      }

      .btn-calculate:hover {
        background-color: #5568d3;
      }

      .btn-clear {
        background-color: #e0e0e0;
        color: #333;
      }

      .btn-clear:hover {
        background-color: #d0d0d0;
      }

      .btn-copy {
        background-color: #27ae60;
        color: white;
      }

      .btn-copy:hover {
        background-color: #229954;
      }

      .calculator-result {
        display: none;
        background-color: #f0f7ff;
        border-left: 4px solid #667eea;
        padding: 1rem;
        margin-top: 1.5rem;
        border-radius: 4px;
      }

      .calculator-result.show {
        display: block;
      }

      .result-content {
        padding: 0;
      }

      .result-title {
        color: #667eea;
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
      }

      .result-table {
        width: 100%;
        border-collapse: collapse;
      }

      .result-row {
        border-bottom: 1px solid #e0e0e0;
      }

      .result-row:last-child {
        border-bottom: none;
      }

      .result-label {
        padding: 0.75rem;
        font-weight: 600;
        color: #333;
        width: 40%;
      }

      .result-value {
        padding: 0.75rem;
        color: #667eea;
        font-weight: 700;
      }

      .error-content {
        padding: 0;
      }

      .error-title {
        color: #e74c3c;
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
      }

      .error-message {
        color: #c0392b;
        margin: 0;
      }

      .calculator-formula {
        margin-top: 1.5rem;
      }

      .calculator-formula details {
        cursor: pointer;
      }

      .calculator-formula summary {
        color: #667eea;
        font-weight: 600;
        padding: 0.75rem;
        background-color: #f9f9f9;
        border-radius: 4px;
        user-select: none;
      }

      .calculator-formula summary:hover {
        background-color: #f0f0f0;
      }

      .formula-content {
        padding: 1rem;
        background-color: #f9f9f9;
        border-radius: 4px;
        margin-top: 0.5rem;
      }

      .formula-content code {
        display: block;
        background-color: #fff;
        padding: 0.75rem;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
        font-family: 'Courier New', monospace;
        overflow-x: auto;
      }

      .calculator-warnings {
        margin-top: 1.5rem;
      }

      .calculator-warnings details {
        cursor: pointer;
      }

      .calculator-warnings summary {
        color: #f39c12;
        font-weight: 600;
        padding: 0.75rem;
        background-color: #fffbf0;
        border-radius: 4px;
        user-select: none;
      }

      .calculator-warnings summary:hover {
        background-color: #fff5e6;
      }

      .warning-list {
        padding: 1rem;
        background-color: #fffbf0;
        border-radius: 4px;
        margin-top: 0.5rem;
        list-style-position: inside;
      }

      .warning-list li {
        color: #d68910;
        margin-bottom: 0.5rem;
      }

      .calculator-reference {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
      }

      .calculator-reference small {
        color: #999;
      }

      .calculator-reference a {
        color: #667eea;
        text-decoration: none;
      }

      .calculator-reference a:hover {
        text-decoration: underline;
      }

      .error-container {
        background-color: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 4px;
        padding: 2rem;
        text-align: center;
        color: #856404;
      }

      @media (max-width: 768px) {
        .nursing-calculators-container {
          grid-template-columns: 1fr;
        }

        .calculator-buttons {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// Exportar para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainContentInjector;
}
