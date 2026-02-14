/**
 * CALCULATOR SYSTEM - Sistema Principal
 * Gerencia navegação, modais, tutorial, notificações, PDF e compartilhamento
 */

const CALCULATOR_SYSTEM = {
  engine: null,
  lastResult: null,
  currentTutorialStep: 0,
  tutorialInterval: null,

  async init(configUrl) {
    this.engine = new CalculatorEngine(configUrl);
    await this.engine.init();
  },

  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
    const targetBtn = document.getElementById('btn-tab-' + tabId);
    const targetPane = document.getElementById('pane-' + tabId);
    if (targetBtn) targetBtn.classList.add('active');
    if (targetPane) targetPane.classList.remove('hidden');
  },

  calculate() {
    if (this.engine) this.engine.calculate();
  },

  reset() {
    if (this.engine) this.engine.reset();
  },

  // ========== MODAIS ==========
  modals: {
    tutorial: {
      title: "Tutorial de Uso - Calculadora de Insulina",
      icon: "fa-question-circle",
      content: `
        <div id="tutorial-content" class="space-y-6">
          <div class="tutorial-step active" id="tutorial-step-1">
            <div class="bg-gradient-to-r from-nurse-primary to-nurse-accent text-white p-4 rounded-xl mb-4">
              <h4 class="font-bold text-sm mb-2">Bem-vindo ao Tutorial!</h4>
              <p class="text-xs opacity-90">Vamos explorar os recursos desta calculadora profissional passo a passo.</p>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Esta ferramenta foi desenvolvida para auxiliar profissionais de saúde no cálculo preciso, com foco em segurança do paciente.
            </p>
          </div>
          <div class="tutorial-step" id="tutorial-step-2">
            <h4 class="font-bold text-sm mb-3 text-nurse-primary dark:text-cyan-400">Passo 1: Identificação do Paciente</h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Campos opcionais para registro do nome e data de nascimento. Útil para auditoria e documentação.
            </p>
          </div>
          <div class="tutorial-step" id="tutorial-step-3">
            <h4 class="font-bold text-sm mb-3 text-nurse-primary dark:text-cyan-400">Passo 2: Parâmetros de Dosagem</h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Informe a prescrição médica em UI e selecione a concentração da insulina (U100, U200, U300).
            </p>
          </div>
          <div class="tutorial-step" id="tutorial-step-4">
            <h4 class="font-bold text-sm mb-3 text-nurse-primary dark:text-cyan-400">Passo 3: Resultados e Auditoria</h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Após o cálculo, você verá o volume a aspirar e uma auditoria detalhada do cálculo.
            </p>
          </div>
          <div class="tutorial-step" id="tutorial-step-5">
            <h4 class="font-bold text-sm mb-3 text-nurse-primary dark:text-cyan-400">Passo 4: Ferramentas de Segurança</h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Utilize os checklists de segurança para garantir a administração correta da medicação.
            </p>
          </div>
          <div class="tutorial-step" id="tutorial-step-6">
            <h4 class="font-bold text-sm mb-3 text-nurse-primary dark:text-cyan-400">Passo 5: Recursos Adicionais</h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Explore outros recursos: PDF, copiar resultado, diagnósticos NANDA, compartilhamento.
            </p>
          </div>
          <div class="tutorial-step" id="tutorial-step-7">
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl mb-4">
              <h4 class="font-bold text-sm mb-2">Tutorial Concluído!</h4>
              <p class="text-xs opacity-90">Agora você está pronto para utilizar todos os recursos com segurança e precisão.</p>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 text-center">
              <i class="fa-solid fa-heart-pulse text-nurse-secondary mr-2"></i>
              <strong>Lembre-se:</strong> A segurança do paciente é sempre a prioridade máxima.
            </p>
          </div>
        </div>
        <div class="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button onclick="CALCULATOR_SYSTEM.prevTutorialStep()" class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition disabled:opacity-50" id="prev-tutorial-btn" disabled>
            <i class="fa-solid fa-chevron-left mr-1"></i> Anterior
          </button>
          <div class="flex gap-1">
            ${[1,2,3,4,5,6,7].map(i => `<div class="w-2 h-2 rounded-full ${i === 1 ? 'bg-nurse-primary' : 'bg-slate-300 dark:bg-slate-600'}" id="tutorial-dot-${i}"></div>`).join('')}
          </div>
          <button onclick="CALCULATOR_SYSTEM.nextTutorialStep()" class="px-4 py-2 bg-nurse-primary text-white rounded-lg text-xs font-bold hover:bg-nurse-secondary transition" id="next-tutorial-btn">
            Próximo <i class="fa-solid fa-chevron-right ml-1"></i>
          </button>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button onclick="CALCULATOR_SYSTEM.startAutoTutorial()" class="w-full px-4 py-2 bg-nurse-accent text-white rounded-lg text-xs font-bold hover:bg-nurse-primary transition mb-2">
            <i class="fa-solid fa-play mr-1"></i> Reproduzir Tutorial Automático
          </button>
          <button onclick="CALCULATOR_SYSTEM.closeModal()" class="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <i class="fa-solid fa-times mr-1"></i> Fechar Tutorial
          </button>
        </div>
      `
    },
    nanda: {
      title: "Diagnósticos de Enfermagem - NANDA",
      icon: "fa-stethoscope",
      content: `
        <div class="space-y-4">
          <div class="bg-gradient-to-r from-nurse-primary to-nurse-accent text-white p-4 rounded-xl">
            <h4 class="font-bold text-sm mb-2">NANDA-I Classificação 2021-2023</h4>
            <p class="text-xs opacity-90">Diagnósticos de Enfermagem: Definições e Classificação</p>
          </div>
          <div class="space-y-3">
            <div class="border-l-4 border-red-500 pl-4 py-2">
              <strong class="text-sm text-red-600 dark:text-red-400">Risco de Glicemia Instável (00218)</strong>
              <p class="text-xs text-slate-600 dark:text-slate-400">Vulnerável à variação dos níveis séricos de glicose entre valores altos e baixos.</p>
            </div>
            <div class="border-l-4 border-blue-500 pl-4 py-2">
              <strong class="text-sm text-blue-600 dark:text-blue-400">Controle Ineficaz do Regime Terapêutico (00078)</strong>
              <p class="text-xs text-slate-600 dark:text-slate-400">Padrão de regulação insatisfatório para atingir objetivos específicos de saúde.</p>
            </div>
            <div class="border-l-4 border-green-500 pl-4 py-2">
              <strong class="text-sm text-green-600 dark:text-green-400">Conhecimento Deficiente (00126)</strong>
              <p class="text-xs text-slate-600 dark:text-slate-400">Insuficiência ou ausência de informações cognitivas relacionadas a um tópico específico.</p>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <button onclick="CALCULATOR_SYSTEM.searchNANDAOnline()" class="flex-1 bg-nurse-primary text-white text-xs font-bold py-2 px-3 rounded-lg text-center hover:bg-nurse-secondary transition">
              <i class="fa-solid fa-magnifying-glass mr-1"></i> Buscar Online
            </button>
          </div>
        </div>
      `
    },
    medication: {
      title: "9 Certos da Medicação",
      icon: "fa-check-double",
      content: `
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <i class="fa-solid fa-user-check text-green-500 mt-1"></i>
              <div><strong class="text-sm">Paciente Certo</strong><p class="text-xs">Verificar nome e identificação.</p></div>
            </div>
            <div class="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <i class="fa-solid fa-pills text-blue-500 mt-1"></i>
              <div><strong class="text-sm">Medicação Certa</strong><p class="text-xs">Conferir nome e apresentação.</p></div>
            </div>
            <div class="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <i class="fa-solid fa-syringe text-purple-500 mt-1"></i>
              <div><strong class="text-sm">Dose Certa</strong><p class="text-xs">Verificar dose prescrita.</p></div>
            </div>
            <div class="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <i class="fa-solid fa-route text-yellow-500 mt-1"></i>
              <div><strong class="text-sm">Via Certa</strong><p class="text-xs">Confirmar via de administração.</p></div>
            </div>
            <div class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <i class="fa-solid fa-clock text-red-500 mt-1"></i>
              <div><strong class="text-sm">Hora Certa</strong><p class="text-xs">Administrar no horário prescrito.</p></div>
            </div>
            <div class="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <i class="fa-solid fa-file-alt text-indigo-500 mt-1"></i>
              <div><strong class="text-sm">Registro Certo</strong><p class="text-xs">Documentar corretamente.</p></div>
            </div>
            <div class="flex items-start gap-2 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <i class="fa-solid fa-comment-medical text-teal-500 mt-1"></i>
              <div><strong class="text-sm">Orientação Certa</strong><p class="text-xs">Fornecer orientações adequadas.</p></div>
            </div>
            <div class="flex items-start gap-2 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <i class="fa-solid fa-heartbeat text-pink-500 mt-1"></i>
              <div><strong class="text-sm">Resposta Certa</strong><p class="text-xs">Monitorar resposta terapêutica.</p></div>
            </div>
            <div class="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <i class="fa-solid fa-calendar-check text-gray-500 mt-1"></i>
              <div><strong class="text-sm">Validade Certa</strong><p class="text-xs">Verificar prazo de validade.</p></div>
            </div>
          </div>
        </div>
      `
    },
    safety: {
      title: "Metas Internacionais de Segurança",
      icon: "fa-star",
      content: `
        <div class="space-y-4">
          <div class="space-y-3">
            <div class="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900 rounded-xl border-l-4 border-blue-500">
              <span class="bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
              <div><strong class="text-sm">Identificação correta do paciente</strong><p class="text-xs">Utilizar pelo menos dois identificadores.</p></div>
            </div>
            <div class="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-white dark:from-green-900/10 dark:to-slate-900 rounded-xl border-l-4 border-green-500">
              <span class="bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
              <div><strong class="text-sm">Melhorar a comunicação efetiva</strong><p class="text-xs">Comunicação clara durante transferências.</p></div>
            </div>
            <div class="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/10 dark:to-slate-900 rounded-xl border-l-4 border-orange-500">
              <span class="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
              <div><strong class="text-sm">Segurança de medicamentos de alta vigilância</strong><p class="text-xs">Concentrações especiais, dupla checagem.</p></div>
            </div>
          </div>
        </div>
      `
    }
  },

  showModal(type) {
    const modal = document.getElementById('reference-modal');
    if (!modal) return;
    const modalData = this.modals[type];
    if (!modalData) return;

    document.getElementById('modal-icon').className = `fa-solid ${modalData.icon} text-2xl`;
    document.getElementById('modal-title').textContent = modalData.title;
    document.getElementById('modal-content').innerHTML = modalData.content;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (type === 'tutorial') {
      this.currentTutorialStep = 1;
      setTimeout(() => this.updateTutorialUI(), 100);
    }
  },

  showModalShared(sharedId) {
    // Tenta buscar do conteúdo compartilhado (se carregado via engine)
    const shared = window.__sharedContent?.[sharedId];
    if (shared) {
      this.openModal(shared.titulo, shared.icone, shared.html);
    } else {
      // Fallback para um modal informativo
      this.openModal(
        'Conteúdo Compartilhado',
        'fa-share-alt',
        `<p>O conteúdo "${sharedId}" não está disponível no momento.</p>`
      );
    }
  },

  openModal(title, icon, content) {
    const modal = document.getElementById('reference-modal');
    if (!modal) return;

    document.getElementById('modal-icon').className = `fa-solid ${icon} text-2xl`;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const modal = document.getElementById('reference-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
    if (this.tutorialInterval) {
      clearInterval(this.tutorialInterval);
      this.tutorialInterval = null;
    }
    document.querySelectorAll('.highlight-element').forEach(el => el.classList.remove('highlight-element'));
  },

  // ========== TUTORIAL NAVIGATION ==========
  nextTutorialStep() {
    if (this.currentTutorialStep < 7) {
      this.currentTutorialStep++;
      this.updateTutorialUI();
      this.highlightTutorialElements(this.currentTutorialStep);
    }
  },

  prevTutorialStep() {
    if (this.currentTutorialStep > 1) {
      this.currentTutorialStep--;
      this.updateTutorialUI();
      this.highlightTutorialElements(this.currentTutorialStep);
    }
  },

  updateTutorialUI() {
    for (let i = 1; i <= 7; i++) {
      const step = document.getElementById(`tutorial-step-${i}`);
      const dot = document.getElementById(`tutorial-dot-${i}`);
      if (step) step.classList.toggle('active', i === this.currentTutorialStep);
      if (dot) {
        if (i === this.currentTutorialStep) {
          dot.classList.remove('bg-slate-300', 'dark:bg-slate-600');
          dot.classList.add('bg-nurse-primary');
        } else {
          dot.classList.remove('bg-nurse-primary');
          dot.classList.add('bg-slate-300', 'dark:bg-slate-600');
        }
      }
    }
    const prevBtn = document.getElementById('prev-tutorial-btn');
    const nextBtn = document.getElementById('next-tutorial-btn');
    if (prevBtn) prevBtn.disabled = this.currentTutorialStep === 1;
    if (nextBtn) {
      if (this.currentTutorialStep === 7) {
        nextBtn.innerHTML = 'Concluir <i class="fa-solid fa-check ml-1"></i>';
        nextBtn.onclick = () => this.closeModal();
      } else {
        nextBtn.innerHTML = 'Próximo <i class="fa-solid fa-chevron-right ml-1"></i>';
        nextBtn.onclick = () => this.nextTutorialStep();
      }
    }
  },

  highlightTutorialElements(step) {
    document.querySelectorAll('.highlight-element').forEach(el => el.classList.remove('highlight-element'));
    switch(step) {
      case 2:
        document.getElementById('patient_name')?.classList.add('highlight-element');
        document.getElementById('patient_birthdate')?.classList.add('highlight-element');
        break;
      case 3:
        document.getElementById('prescricao_medica')?.classList.add('highlight-element');
        document.getElementById('concentracao_insulina')?.classList.add('highlight-element');
        document.getElementById('btn-calculate')?.classList.add('highlight-element');
        break;
      case 4:
        document.getElementById('res-total')?.parentElement?.classList.add('highlight-element');
        document.getElementById('audit-list')?.classList.add('highlight-element');
        break;
      case 5:
        document.getElementById('checklist-9certos')?.classList.add('highlight-element');
        document.getElementById('checklist-metas')?.classList.add('highlight-element');
        break;
      case 6:
        document.getElementById('btn-pdf')?.classList.add('highlight-element');
        document.querySelector('button[onclick="CALCULATOR_SYSTEM.copyResult()"]')?.classList.add('highlight-element');
        break;
    }
  },

  startAutoTutorial() {
    if (this.tutorialInterval) clearInterval(this.tutorialInterval);
    this.currentTutorialStep = 1;
    this.updateTutorialUI();
    this.highlightTutorialElements(1);
    this.tutorialInterval = setInterval(() => {
      if (this.currentTutorialStep < 7) this.nextTutorialStep();
      else {
        clearInterval(this.tutorialInterval);
        this.tutorialInterval = null;
      }
    }, 3000);
  },

  showTutorial() {
    this.showModal('tutorial');
  },

  showNANDAModal() {
    this.showModal('nanda');
  },

  showMedicationChecklist() {
    this.showModal('medication');
  },

  showSafetyGoals() {
    this.showModal('safety');
  },

  showAuditHelp() {
    this.notify('A auditoria verifica cada etapa do cálculo para garantir a precisão e segurança.', 'info');
  },

  searchNANDAOnline() {
    const query = encodeURIComponent("NANDA diagnóstico enfermagem diabetes insulina");
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
    this.closeModal();
  },

  // ========== PDF ==========
  async generatePDF() {
    if (!this.lastResult && !this.engine?.resultData) {
      this.notify('Realize um cálculo primeiro', 'error');
      return;
    }

    const data = this.engine?.resultData || this.lastResult;
    const patientName = document.getElementById('patient_name')?.value || "Não informado";
    const patientBirthdate = document.getElementById('patient_birthdate')?.value || "Não informado";
    const today = new Date().toLocaleString('pt-BR');
    const resTotal = document.getElementById('res-total')?.innerText || "0,00";
    const resUnit = document.getElementById('res-unit')?.innerText || "";

    const pdfBody = document.getElementById('pdf-body');
    if (!pdfBody) return;

    pdfBody.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>PACIENTE:</strong> ${patientName.toUpperCase()}</p>
          <p style="margin: 0; font-size: 12px;"><strong>DATA DE NASCIMENTO:</strong> ${patientBirthdate}</p>
        </div>
        <h2 style="font-size: 14px; color: #1A3E74; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">DADOS DO CÁLCULO AUDITADO</h2>
        <table style="width: 100%; font-size: 11px; margin-bottom: 20px;">
          <tr><td>Prescrição Médica:</td><td style="text-align: right; font-weight: bold;">${data.prescricao || ''} UI</td></tr>
          <tr><td>Concentração:</td><td style="text-align: right; font-weight: bold;">${data.concentracaoTipo || ''} (${data.concentracao || ''} UI/mL)</td></tr>
        </table>
        <div style="background: #1A3E74; color: white; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <p style="margin:0; font-size: 11px; text-transform: uppercase; opacity: 0.8;">VOLUME FINAL A ASPIRAR</p>
          <p style="margin:10px 0 0 0; font-size: 36px; font-weight: 900;">${resTotal} ${resUnit}</p>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 10px; color: #64748b;"><strong>Checklist aplicado:</strong> 9 Certos da Medicação e Metas Internacionais de Segurança</p>
          <p style="margin: 5px 0 0 0; font-size: 9px; color: #94a3b8;">Documento gerado por Calculadoras de Enfermagem Profissional</p>
        </div>
      </div>
      <p style="font-size: 9px; color: #64748b; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px;">Relatório gerado em: ${today}</p>
    `;

    try {
      const { jsPDF } = window.jspdf;
      const canvas = await html2canvas(document.getElementById('pdf-render-template'), { scale: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Auditoria_${new Date().getTime()}.pdf`);
      this.notify('PDF gerado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.notify('Erro ao gerar PDF', 'error');
    }
  },

  // ========== COMPARTILHAMENTO E CÓPIA ==========
  share(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const text = encodeURIComponent("Confira esta calculadora profissional de enfermagem!");
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400,noopener,noreferrer');
  },

  copyLink() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => this.notify('Link copiado!', 'success'))
      .catch(() => this.notify('Erro ao copiar link', 'error'));
  },

  async copyResult() {
    if (!this.lastResult && !this.engine?.resultData) {
      this.notify('Nenhum resultado para copiar', 'error');
      return;
    }
    const patientName = document.getElementById('patient_name')?.value || "Não informado";
    const patientBirthdate = document.getElementById('patient_birthdate')?.value || "Não informado";
    const today = new Date().toLocaleString('pt-BR');
    const resTotal = document.getElementById('res-total')?.innerText || "0,00";
    const resUnit = document.getElementById('res-unit')?.innerText || "";
    const text = `REGISTRO DE AUDITORIA\nData: ${today}\nPaciente: ${patientName}\nNascimento: ${patientBirthdate}\n\nRESULTADO: ${resTotal} ${resUnit}\n\nAuditoria realizada por Calculadoras de Enfermagem Profissional`;
    try {
      await navigator.clipboard.writeText(text);
      this.notify('Resultado copiado!', 'success');
    } catch {
      this.notify('Erro ao copiar resultado', 'error');
    }
  },

  // ========== NOTIFICAÇÕES (TOAST) ==========
  notify(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type === 'success' ? 'border-green-500' : type === 'error' ? 'border-red-500' : 'border-nurse-secondary'}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-circle-info'}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }
};

// Disponibiliza globalmente
window.CALCULATOR_SYSTEM = CALCULATOR_SYSTEM;