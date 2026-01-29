/**
 * CORE.js - Sistema de Auditoria Clínica
 * Responsável por carregar o banco de dados e orquestrar a UI.
 */
const CORE = {
    state: {
        config: null,
        data: null,
        currentTab: 'calc',
        appId: 'insulina' // ID padrão
    },

    async init() {
        try {
            // 1. Tenta identificar a calculadora pela URL (ex: ?id=heparina)
            const params = new URLSearchParams(window.location.search);
            const idFromUrl = params.get('id');
            if (idFromUrl) this.state.appId = idFromUrl;

            // 2. Busca o banco de dados JSON
            const response = await fetch('https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/nursing_calculators.json');
            if (!response.ok) throw new Error("Erro ao carregar banco de dados JSON.");
            const database = await response.json();

            // 3. Filtra a calculadora ativa
            this.state.config = database.calculators.find(c => c.id === this.state.appId);
            if (!this.state.config) throw new Error("Calculadora não encontrada.");

            // 4. Dispara as integrações de UI
            this.renderAll();
            
            VOICE.speak("Sistema de auditoria clínica inicializado com sucesso.");
            console.log("CORE: Sistema carregado para", this.state.config.name);
        } catch (error) {
            console.error("Erro no CORE:", error);
            CORE.notify("Erro ao carregar dados técnicos.", "error");
        }
    },

    renderAll() {
        UI.renderBreadcrumbs(this.state.config.breadcrumbs);
        UI.renderTabs();
        UI.renderFields(this.state.config.fields);
        UI.renderSidebar();
        UI.renderAuthor();
        UI.renderTags(['Enfermagem', 'Auditoria', 'Segurança']);
        
        // Atualiza título da página dinamicamente
        document.title = `${this.state.config.name} | Calculadoras de Enfermagem`;
    },

    // Ação de cálculo com validação e feedback vocal
    calculate() {
        if (!UTIL.validateFields('dynamic-fields')) return;

        VOICE.speak("Calculando dose auditada.");
        
        // Exemplo de lógica simplificada (o motor específico pode vir do calculator-engine.js)
        const inputs = {};
        document.querySelectorAll('.input-field').forEach(i => inputs[i.id] = parseFloat(i.value));

        // Aqui você chamaria a lógica específica do seu calculator-engine.js
        // Por agora, mostramos o wrapper
        document.getElementById('results-wrapper').classList.remove('hidden');
        document.getElementById('results-wrapper').scrollIntoView({ behavior: 'smooth' });
        
        // Renderiza Auditoria Técnica (Memória de Cálculo)
        UI.renderAudit();
        UI.renderChecklists();
        UI.renderActionButtons();
    },

    reset() {
        UTIL.resetSystem();
    },

    notify(msg, type = 'success') {
        const container = document.getElementById('notification-container');
        const toast = document.createElement('div');
        toast.className = `toast-msg flex items-center gap-3 p-4 rounded-xl shadow-2xl transition-all ${type === 'success' ? 'bg-slate-900' : 'bg-red-600'} text-white font-bold text-sm`;
        toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check text-nurse-secondary' : 'fa-triangle-exclamation'}"></i><span>${msg}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
};

window.addEventListener('DOMContentLoaded', () => CORE.init());