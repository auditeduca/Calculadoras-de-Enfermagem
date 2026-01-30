/**
 * MODAL-REFERENCE.JS - Gerenciador de Modais de Referência
 * Controla modais de NANDA, 9 Certos, Metas de Segurança e Diagnósticos
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class ModalReferenceManager {
  constructor(options = {}) {
    this.modalManager = options.modalManager || window.MODAL_MANAGER;
    this.notificationManager = options.notificationManager || window.NOTIFICATION_MANAGER;
    this.baseURL = options.baseURL || 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/';
    this.initializeModals();
  }

  /**
   * Inicializar modais de referência
   */
  initializeModals() {
    this.registerNANDAModal();
    this.registerMedicationChecklistModal();
    this.registerSafetyGoalsModal();
    this.registerInternationalGoalsModal();
  }

  /**
   * Registrar modal NANDA
   */
  registerNANDAModal() {
    const content = `
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-nurse-primary to-nurse-accent text-white p-4 rounded-xl">
          <h4 class="font-bold text-sm mb-2">NANDA-I Classificação 2021-2023</h4>
          <p class="text-xs opacity-90">Diagnósticos de Enfermagem: Definições e Classificação</p>
        </div>

        <div class="space-y-3">
          <div class="border-l-4 border-red-500 pl-4 py-2">
            <h5 class="font-bold text-sm text-red-700 dark:text-red-400">Diagnósticos de Risco</h5>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Risco de glicemia instável</p>
            <p class="text-xs text-slate-600 dark:text-slate-400">Risco de lesão</p>
            <p class="text-xs text-slate-600 dark:text-slate-400">Risco de infecção</p>
          </div>

          <div class="border-l-4 border-orange-500 pl-4 py-2">
            <h5 class="font-bold text-sm text-orange-700 dark:text-orange-400">Diagnósticos Reais</h5>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Conhecimento deficiente</p>
            <p class="text-xs text-slate-600 dark:text-slate-400">Ansiedade relacionada ao procedimento</p>
            <p class="text-xs text-slate-600 dark:text-slate-400">Dor aguda</p>
          </div>

          <div class="border-l-4 border-blue-500 pl-4 py-2">
            <h5 class="font-bold text-sm text-blue-700 dark:text-blue-400">Diagnósticos de Bem-estar</h5>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Disposição para melhorar o conhecimento</p>
            <p class="text-xs text-slate-600 dark:text-slate-400">Disposição para melhorar o autocuidado</p>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-xs text-blue-900 dark:text-blue-200">
            <strong>Nota:</strong> Para diagnósticos específicos do cálculo, use o botão "Buscar NANDA" para pesquisar online.
          </p>
        </div>

        <button onclick="window.MODAL_REFERENCE_MANAGER?.searchNANDAOnline()" class="w-full btn btn-primary">
          <i class="fa-solid fa-magnifying-glass"></i> Buscar NANDA Online
        </button>
      </div>
    `;

    this.modalManager.register('nanda', {
      title: 'Diagnósticos de Enfermagem - NANDA',
      icon: 'fa-stethoscope',
      content
    });
  }

  /**
   * Registrar modal dos 9 Certos
   */
  registerMedicationChecklistModal() {
    const certos = [
      'Paciente Certo',
      'Medicação Certa',
      'Dose Certa',
      'Via Certa',
      'Hora Certa',
      'Registro Certo',
      'Validade Certa',
      'Resposta Certa',
      'Forma Farmacêutica Certa'
    ];

    const content = `
      <div class="space-y-3">
        <div class="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl">
          <h4 class="font-bold text-sm mb-1">9 Certos da Medicação</h4>
          <p class="text-xs opacity-90">Protocolo de segurança para administração de medicamentos</p>
        </div>

        <div class="space-y-2">
          ${certos.map((certo, index) => `
            <label class="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer hover:border-green-500 transition group">
              <input type="checkbox" class="w-4 h-4 accent-green-600 transition"/>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-green-600">
                ${index + 1}. ${certo}
              </span>
            </label>
          `).join('')}
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p class="text-xs text-yellow-900 dark:text-yellow-200">
            <strong>Importante:</strong> Todos os 9 certos devem ser verificados antes da administração do medicamento.
          </p>
        </div>
      </div>
    `;

    this.modalManager.register('medication', {
      title: '9 Certos da Medicação',
      icon: 'fa-check-double',
      content
    });
  }

  /**
   * Registrar modal de Metas de Segurança
   */
  registerSafetyGoalsModal() {
    const goals = [
      {
        number: 1,
        title: 'Identificar o paciente corretamente',
        description: 'Usar dois identificadores (nome e data de nascimento ou prontuário)',
        class: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
      },
      {
        number: 2,
        title: 'Comunicação Efetiva na passagem de plantão',
        description: 'Utilizar técnicas estruturadas como SBAR',
        class: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
      },
      {
        number: 3,
        title: 'Segurança de Medicamentos de Alta Vigilância',
        description: 'Aplicar protocolos específicos para medicamentos de risco',
        class: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
      },
      {
        number: 6,
        title: 'Reduzir risco de quedas do paciente',
        description: 'Implementar medidas preventivas e de proteção',
        class: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
      }
    ];

    const content = `
      <div class="space-y-3">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl">
          <h4 class="font-bold text-sm mb-1">Metas Internacionais de Segurança</h4>
          <p class="text-xs opacity-90">Protocolo da Organização Mundial da Saúde (OMS)</p>
        </div>

        <div class="space-y-2">
          ${goals.map(goal => `
            <div class="border-l-4 ${goal.class} p-3 rounded-lg">
              <h5 class="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                Meta ${goal.number}: ${goal.title}
              </h5>
              <p class="text-xs text-slate-600 dark:text-slate-400">${goal.description}</p>
            </div>
          `).join('')}
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <p class="text-xs text-green-900 dark:text-green-200">
            <strong>Objetivo:</strong> Melhorar a segurança do paciente através de práticas padronizadas e verificáveis.
          </p>
        </div>
      </div>
    `;

    this.modalManager.register('safety', {
      title: 'Metas Internacionais de Segurança',
      icon: 'fa-star',
      content
    });
  }

  /**
   * Registrar modal de Metas Internacionais Completas
   */
  registerInternationalGoalsModal() {
    const allGoals = [
      { number: 1, title: 'Identificar o paciente corretamente' },
      { number: 2, title: 'Comunicação Efetiva na passagem de plantão' },
      { number: 3, title: 'Segurança de Medicamentos de Alta Vigilância' },
      { number: 4, title: 'Assegurar cirurgias no local, procedimento e paciente corretos' },
      { number: 5, title: 'Reduzir o risco de infecções associadas aos cuidados de saúde' },
      { number: 6, title: 'Reduzir risco de quedas do paciente' }
    ];

    const content = `
      <div class="space-y-3">
        <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl">
          <h4 class="font-bold text-sm mb-1">6 Metas Internacionais de Segurança</h4>
          <p class="text-xs opacity-90">Organização Mundial da Saúde - Programa de Segurança do Paciente</p>
        </div>

        <div class="grid grid-cols-1 gap-2">
          ${allGoals.map(goal => `
            <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <span class="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                ${goal.number}
              </span>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${goal.title}</span>
            </div>
          `).join('')}
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
          <p class="text-xs text-purple-900 dark:text-purple-200">
            <strong>Implementação:</strong> Estas metas devem ser integradas em todos os protocolos de cuidado ao paciente.
          </p>
        </div>
      </div>
    `;

    this.modalManager.register('international-goals', {
      title: '6 Metas Internacionais de Segurança',
      icon: 'fa-globe',
      content
    });
  }

  /**
   * Buscar NANDA online
   */
  searchNANDAOnline(calculatorName = 'insulina') {
    const query = encodeURIComponent(`NANDA diagnóstico enfermagem ${calculatorName} NIC NOC`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
    this.notificationManager.info('Abrindo busca de diagnósticos NANDA...');
    this.modalManager.close();
  }

  /**
   * Mostrar modal NANDA
   */
  showNANDAModal() {
    this.modalManager.show('nanda');
  }

  /**
   * Mostrar modal dos 9 Certos
   */
  showMedicationChecklistModal() {
    this.modalManager.show('medication');
  }

  /**
   * Mostrar modal de Metas de Segurança
   */
  showSafetyGoalsModal() {
    this.modalManager.show('safety');
  }

  /**
   * Mostrar modal de Metas Internacionais
   */
  showInternationalGoalsModal() {
    this.modalManager.show('international-goals');
  }

  /**
   * Fechar modal
   */
  closeModal() {
    this.modalManager.close();
  }
}

// Instância global
window.MODAL_REFERENCE_MANAGER = new ModalReferenceManager({
  modalManager: window.MODAL_MANAGER,
  notificationManager: window.NOTIFICATION_MANAGER
});

// Exportar
window.ModalReferenceManager = ModalReferenceManager;