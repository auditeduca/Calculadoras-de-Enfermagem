/**
 * CORE.js - Orquestrador Central Modular
 * Gerencia o estado da aplicação e o fluxo de dados.
 */
const CORE = {
    state: { config: null, db: null, result: null },

    async init() {
        try {
            // Carregamento do Banco de Dados
            const response = await fetch('https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/nursing_calculators.json');
            this.state.db = await response.json();
            
            // Identificação da Calculadora Ativa
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id') || 'insulina';
            this.state.config = this.state.db.calculators.find(c => c.id === id) || this.state.db.calculators[0];
            
            this.renderAll();
        } catch (e) {
            console.error("Erro no CORE:", e);
            this.notify("Falha ao carregar banco de dados clínico.", "error");
        }
    },

    renderAll() {
        if (!this.state.config) return;

        // Injeção de Componentes UI
        UI.renderHeader(this.state.config);
        UI.renderBreadcrumbs(this.state.config.breadcrumbs || { desktop: ["Início", "Cálculos", this.state.config.name] });
        UI.renderTabs();
        UI.renderFields(this.state.config.fields);
        UI.renderSidebar(this.state.db);
        UI.renderAuthor();
        UI.renderAdSense(); // Injeta AdSense nos slots
        this.renderTags();
    },

    renderTags() {
        const tags = ["Enfermagem", "Segurança", this.state.config.name.split(' ')[1] || 'Clínica'];
        const container = document.getElementById('tags-container');
        if (container) {
            container.innerHTML = tags.map(t => `<span class="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 rounded-lg text-[11px] font-bold">#${t}</span>`).join(' ');
        }
    },

    calculate() {
        if (!UTIL.validateFields('dynamic-fields')) return;
        
        const vals = {};
        document.querySelectorAll('.input-field').forEach(i => vals[i.id] = parseFloat(i.value));
        
        let res = 0;
        const id = this.state.config.id;
        
        // Lógica de Cálculo por ID
        if (id === 'insulina') res = (vals.insulinaPrescricao * (vals.insulinaSeringaS || 1)) / vals.insulinaFrasco;
        if (id === 'heparina') res = (vals.heparinaPrescricao * vals.heparinaVolume) / vals.heparinaConcentracao;
        
        const fmt = isNaN(res) ? "0,00" : res.toLocaleString('pt-PT', {minimumFractionDigits: 2, maximumFractionDigits: 3});
        this.state.result = fmt;

        VOICE.speak(`Cálculo auditado. Volume final: ${fmt} mililitros.`);
        
        const display = document.getElementById('res-total');
        if (display) display.innerText = fmt;
        
        const wrapper = document.getElementById('results-wrapper');
        if (wrapper) {
            wrapper.classList.remove('hidden');
            wrapper.scrollIntoView({ behavior: 'smooth' });
        }

        this.renderActionButtons();
        UI.renderAudit(this.state.config);
        UI.renderChecklists();
    },

    renderActionButtons() {
        const container = document.getElementById('action-buttons');
        if (!container) return;
        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <button onclick="UTIL.generatePDF('results-wrapper', '${this.state.config.id}')" class="bg-nurse-primary text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs uppercase hover:bg-nurse-secondary transition-all"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                <button onclick="UTIL.copyResult('${this.state.result}', '${this.state.config.name}')" class="bg-slate-200 dark:bg-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs uppercase hover:bg-slate-300 transition-all"><i class="fa-solid fa-copy"></i> Copiar</button>
            </div>
            <button onclick="UTIL.searchNANDA('${this.state.config.name}', '${this.state.result}')" class="bg-nurse-accent text-white font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest hover:bg-nurse-primary transition-all"><i class="fa-solid fa-magnifying-glass"></i> Diagnóstico NANDA-I</button>`;
    },

    reset() { UTIL.resetSystem(); },
    
    notify(msg, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast-msg ${type === 'error' ? 'bg-red-600' : 'bg-slate-900'}`;
        toast.innerHTML = `<i class="fa-solid fa-circle-check text-nurse-secondary"></i><span>${msg}</span>`;
        container.appendChild(toast);
        setTimeout(() => { 
            toast.style.opacity = '0'; 
            setTimeout(() => toast.remove(), 500); 
        }, 4000);
    }
};

// Inicialização
CORE.init();