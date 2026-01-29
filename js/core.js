const CORE = {
    state: { config: null, db: null, result: null },

    async init() {
        try {
            const response = await fetch('https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/nursing_calculators.json');
            this.state.db = await response.json();
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id') || 'insulina';
            this.state.config = this.state.db.calculators.find(c => c.id === id) || this.state.db.calculators[0];
            
            this.renderAll();
        } catch (e) { console.error("Erro CORE:", e); }
    },

    renderAll() {
        UI.renderHeader(this.state.config);
        UI.renderBreadcrumbs(this.state.config.breadcrumbs || { desktop: ["Início", "Cálculos", this.state.config.name] });
        UI.renderTabs();
        this.renderFields();
        UI.renderSidebar(this.state.db);
        UI.renderAuthor();
        this.renderTags();
    },

    renderFields() {
        const container = document.getElementById('dynamic-fields');
        const fields = this.state.config.fields["Parâmetros"] || [];
        container.innerHTML = fields.map(f => `
            <div>
                <label class="label-main">${f.name} ${f.unit ? `<span class="lowercase text-slate-400">(${f.unit})</span>` : ''} <i class="fa-solid fa-circle-info text-nurse-secondary cursor-help" title="${f.tooltip}"></i></label>
                <input id="${f.id}" type="${f.type}" placeholder="${f.placeholder}" class="input-field border-red-200" required />
            </div>
        `).join('');
    },

    calculate() {
        if (!UTIL.validateInputs('dynamic-fields')) return;

        const inputs = {
            name: document.getElementById('patient_name').value,
            dob: document.getElementById('patient_dob').value,
            age: UTIL.getAge(document.getElementById('patient_dob').value)
        };

        if (inputs.age === null) return;

        const fieldValues = {};
        document.querySelectorAll('#dynamic-fields input').forEach(i => fieldValues[i.id] = parseFloat(i.value));
        
        // Lógica para Insulina
        const prescricao = fieldValues.insulinaPrescricao || 0;
        const frasco = fieldValues.insulinaFrasco || 100; // Padrão 100 UI/ml
        const seringa = fieldValues.insulinaSeringaS || 1; // Padrão 1ml

        UTIL.checkAnomalous(prescricao, 'insulina');

        const resultValue = (prescricao * seringa) / frasco;
        const fmt = resultValue.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        
        document.getElementById('res-total').innerText = fmt;
        document.getElementById('res-unit-label').innerText = "mililitros (ml)";
        document.getElementById('results-wrapper').classList.remove('hidden');
        document.getElementById('results-wrapper').scrollIntoView({ behavior: 'smooth' });

        UI.renderAudit(this.state.config, { ...inputs, prescricao, frasco, seringa }, fmt);
        UI.renderChecklists();
        this.renderActionButtons(fmt);
    },

    renderActionButtons(res) {
        const container = document.getElementById('action-buttons');
        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <button onclick="UTIL.generatePDF('results-wrapper', '${this.state.config.id}')" class="bg-nurse-primary text-white font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs uppercase"><i class="fa-solid fa-file-pdf"></i> Gerar PDF</button>
                <button onclick="CORE.copyResult('${res}')" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-5 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase"><i class="fa-solid fa-copy"></i> Copiar</button>
            </div>
            <button onclick="CORE.searchNANDA('${res}')" class="bg-nurse-accent text-white font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest hover:brightness-110 transition-all"><i class="fa-solid fa-magnifying-glass"></i> Buscar Diagnóstico nanda/nic/noc</button>
        `;
    },

    renderTags() {
        const tags = ["Enfermagem", "Segurança Clínica", "MAV", this.state.config.name.split(' ')[1]];
        document.getElementById('tags-container').innerHTML = tags.map(t => `
            <div class="tag-pill" onclick="CORE.tagSearch('${t}')">
                <i class="fa-solid fa-hashtag text-nurse-secondary text-[10px]"></i>
                <span>${t}</span>
            </div>
        `).join('');
    },

    tagSearch(tag) {
        window.open(`https://www.google.com/search?q=site:auditeduca.github.io/Calculadoras-de-Enfermagem+${tag}`, '_blank');
    },

    searchNANDA(res) {
        const query = encodeURIComponent(`NANDA NIC NOC enfermagem ${this.state.config.name} dose ${res}`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    },

    copyResult(res) {
        const text = `AUDITORIA: ${this.state.config.name}\nPaciente: ${document.getElementById('patient_name').value}\nResultado: ${res} ml\nAuditado em: ${new Date().toLocaleString()}`;
        navigator.clipboard.writeText(text);
        this.notify("Copiado!");
    },

    notify(msg, type = 'success') {
        const c = document.getElementById('notification-container');
        const t = document.createElement('div');
        t.className = `toast-msg ${type === 'error' ? 'bg-red-600' : 'bg-slate-900'} animate-fade-in`;
        t.innerHTML = `<i class="fa-solid fa-circle-check text-nurse-secondary"></i><span>${msg}</span>`;
        c.appendChild(t);
        setTimeout(() => t.remove(), 4000);
    },

    reset() { location.reload(); }
};

CORE.init();