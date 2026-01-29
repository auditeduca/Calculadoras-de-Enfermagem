/**
 * UI.js - Renderização Dinâmica de Componentes
 * Responsável por Sidebar, AdSense, Header, Tabs e Checklists.
 */
const UI = {
    renderHeader(config) {
        const container = document.getElementById('calc-header');
        if (!container) return;
        container.innerHTML = `
            <span class="bg-nurse-primary text-white text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 inline-block shadow-md">Segurança Clínica Profissional</span>
            <h1 class="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">${config.name}</h1>
            <div class="h-2 w-24 bg-gradient-to-r from-nurse-accent to-nurse-primary rounded-full mb-8"></div>
            <p class="text-xl text-slate-600 dark:text-slate-300 font-medium italic">${config.description}</p>
        `;
    },

    renderBreadcrumbs(breadcrumbs) {
        const container = document.getElementById('breadcrumb-container');
        if (!container || !breadcrumbs || !breadcrumbs.desktop) return;
        const html = breadcrumbs.desktop.map((item, index) => {
            const isLast = index === breadcrumbs.desktop.length - 1;
            return `<span class="${isLast ? 'text-nurse-primary dark:text-cyan-400 font-bold' : ''}">${item}</span>`;
        }).join('<i class="fa-solid fa-chevron-right text-[10px] mx-2 opacity-30"></i>');
        container.innerHTML = `<div class="hidden md:flex items-center text-slate-500 dark:text-slate-400">${html}</div>`;
    },

    /**
     * Injeção de AdSense em Slots Modulares
     */
    renderAdSense() {
        const topSlot = document.getElementById('adsense-top');
        const resultSlot = document.getElementById('adsense-results');
        
        const template = (label) => `
            <div class="w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 min-h-[100px] transition-all">
                <div class="text-center">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic block mb-1">Publicidade Profissional</span>
                    <span class="text-[8px] text-slate-300 uppercase">${label}</span>
                </div>
            </div>
        `;

        if (topSlot) topSlot.innerHTML = template('Topo da Página');
        if (resultSlot) resultSlot.innerHTML = template('Resultado da Auditoria');
    },

    renderTabs() {
        const container = document.getElementById('tabs-container');
        const tabs = [
            { id: 'calc', label: 'Calculadora', icon: 'calculator' },
            { id: 'sobre', label: 'Sobre', icon: 'circle-info' },
            { id: 'ajuda', label: 'Instruções', icon: 'book' },
            { id: 'ref', label: 'Referência', icon: 'bookmark' }
        ];
        container.innerHTML = tabs.map(tab => `
            <button onclick="UI.switchTab('${tab.id}')" id="btn-tab-${tab.id}" class="tab-btn ${tab.id === 'calc' ? 'active' : ''}">
                <i class="fa-solid fa-${tab.icon} mr-1"></i> ${tab.label}
            </button>
        `).join('');
    },

    switchTab(tabId) {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        if (tabId === 'calc') {
            document.getElementById('pane-calc').classList.remove('hidden');
        } else {
            const pane = document.getElementById('pane-info');
            pane.classList.remove('hidden');
            const cfg = CORE.state.config;
            const content = cfg.tabs ? cfg.tabs[tabId === 'sobre' ? 'about' : tabId === 'ajuda' ? 'instructions' : 'references'] : cfg[tabId === 'sobre' ? 'description' : 'instructions'];
            
            if (Array.isArray(content)) {
                pane.innerHTML = `<ul class="space-y-3">${content.map(i => `<li class="flex items-start gap-3"><i class="fa-solid fa-check-circle text-nurse-secondary mt-1"></i> <span>${i}</span></li>`).join('')}</ul>`;
            } else {
                pane.innerHTML = `<p class="leading-relaxed">${content || 'Informação técnica em atualização.'}</p>`;
            }
        }
        document.getElementById(`btn-tab-${tabId}`).classList.add('active');
        VOICE.speak(`Exibindo aba ${tabId}`);
    },

    renderFields(fieldsObj) {
        const container = document.getElementById('dynamic-fields');
        if (!container) return;
        let html = '';
        for (const group in fieldsObj) {
            fieldsObj[group].forEach(f => {
                html += `
                    <div class="space-y-1">
                        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-wide">
                            ${f.name} ${f.required ? '<span class="text-red-500">*</span>' : ''}
                            ${f.tooltip ? `<i class="fa-solid fa-circle-info text-nurse-secondary ml-1 cursor-help" title="${f.tooltip}"></i>` : ''}
                        </label>
                        <input id="${f.id}" type="${f.type}" placeholder="${f.placeholder || ''}" class="input-field" ${f.required ? 'required' : ''} />
                    </div>`;
            });
        }
        container.innerHTML = html;
    },

    renderSidebar(db) {
        const container = document.getElementById('sidebar-container');
        if (!container) return;

        // Calculadoras Relacionadas
        const related = db ? db.calculators.filter(c => c.id !== CORE.state.config.id).slice(0, 3).map(c => 
            `<a href="?id=${c.id}" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white font-bold transition-all text-[11px] uppercase border border-white/10 mb-1"><i class="fa-solid fa-calculator text-cyan-300"></i> ${c.name}</a>`
        ).join('') : '';

        container.innerHTML = `
            <!-- Módulo Simulados -->
            <div class="sidebar-module">
                <h3 class="font-bold mb-4 flex items-center gap-2"><i class="fa-solid fa-trophy"></i> Simulados</h3>
                <p class="text-xs mb-4 opacity-80">Pratique com casos clínicos reais e evite erros na assistência.</p>
                <a href="https://simulados-para-enfermagem.com.br" target="_blank" class="block bg-white text-nurse-primary text-center py-3 rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-all">Acessar simulados</a>
            </div>

            <!-- Módulo Relacionadas -->
            <div class="sidebar-module from-teal-600 to-nurse-secondary">
                <h3 class="font-bold mb-4 flex items-center gap-2 font-nunito"><i class="fa-solid fa-list-ul"></i> Relacionadas</h3>
                <div class="space-y-1">${related}</div>
            </div>

            <!-- Módulo Compartilhar -->
            <div class="sidebar-module from-slate-700 to-slate-900">
                <h3 class="font-bold mb-4 flex items-center gap-2 font-nunito"><i class="fa-solid fa-share-nodes"></i> Compartilhar</h3>
                <div class="flex gap-3 justify-center">
                    <button onclick="window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(window.location.href))" class="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-nurse-primary transition-all shadow-md" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
                    <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href))" class="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-nurse-primary transition-all shadow-md" title="Facebook"><i class="fab fa-facebook-f"></i></button>
                    <button onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href))" class="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-nurse-primary transition-all shadow-md" title="LinkedIn"><i class="fab fa-linkedin-in"></i></button>
                    <button onclick="navigator.clipboard.writeText(window.location.href); CORE.notify('Link copiado!')" class="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-nurse-primary transition-all shadow-md" title="Copiar Link"><i class="fa-solid fa-link"></i></button>
                </div>
            </div>
        `;
    },

    renderAuthor() {
        const container = document.getElementById('author-container');
        if (!container) return;
        container.innerHTML = `
            <div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 border border-slate-200 shadow-sm transition-all hover:shadow-xl">
                <img src="https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/author-info.webp" class="w-32 rounded-3xl shadow-xl">
                <div class="text-center md:text-left">
                    <h3 class="text-2xl font-black text-nurse-primary dark:text-cyan-400">Calculadoras de Enfermagem Profissional</h3>
                    <p class="text-slate-600 dark:text-slate-300 italic mt-2">"A precisão técnica é a expressão máxima do cuidado ético ao paciente."</p>
                </div>
            </div>`;
    },

    renderChecklists() {
        const container = document.getElementById('safety-checklists-container');
        if (!container) return;
        const certos = ["Paciente Certo", "Medicação Certa", "Dose Certa", "Via Certa", "Hora Certa", "Registro Certo", "Orientação", "Resposta", "Validade"];
        const metas = [
            { t: "Identificação Correta", c: "bg-blue-500/10 border-blue-500" },
            { t: "Comunicação Efetiva", c: "bg-green-500/10 border-green-500" },
            { t: "Segurança de Medicamentos MAV", c: "bg-orange-500/10 border-orange-500" }
        ];

        container.innerHTML = `
            <div class="space-y-8 mb-12">
                <h2 class="text-xl font-black text-nurse-primary flex items-center gap-2 border-l-4 border-nurse-secondary pl-4 uppercase text-[11px] tracking-widest">Protocolos de Segurança</h2>
                <div class="bg-white dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div class="mb-8">
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><i class="fa-solid fa-check-double"></i> 9 Certos da Medicação</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            ${certos.map(c => `<label class="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl cursor-pointer text-[10px] font-black uppercase text-slate-500 hover:border-nurse-secondary transition-all"><input type="checkbox" class="w-4 h-4 accent-nurse-primary"/> <span>${c}</span></label>`).join('')}
                        </div>
                    </div>
                    <div>
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><i class="fa-solid fa-star"></i> Metas Internacionais</h3>
                        <div class="space-y-2">
                            ${metas.map(m => `<label class="flex items-center gap-3 p-4 border rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-600 ${m.c}"><input type="checkbox" class="w-4 h-4 accent-slate-800"/> <span>${m.t}</span></label>`).join('')}
                        </div>
                    </div>
                </div>
            </div>`;
    },

    renderAudit(config) {
        const container = document.getElementById('audit-clinical-container');
        if (!container) return;
        container.innerHTML = `
            <div class="mb-12 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <h3 class="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-nurse-primary"><i class="fa-solid fa-clipboard-check"></i> Auditoria Clínica Detalhada</h3>
                <div class="p-4 bg-white rounded-xl border border-slate-100 shadow-sm mb-4">
                    <p class="text-[9px] font-black text-slate-400 uppercase mb-2">Identificação Clínica</p>
                    <p class="font-bold text-nurse-primary text-sm">${document.getElementById('patient_name').value || 'Não identificado'}</p>
                </div>
                <div class="p-4 bg-white rounded-xl border-l-4 border-nurse-secondary border-slate-100 shadow-sm">
                    <p class="text-[9px] font-black text-nurse-secondary uppercase mb-2">Memória de Cálculo (Fórmula)</p>
                    <p class="font-mono text-xs text-slate-600">${config.formula.calculation}</p>
                </div>
            </div>`;
    }
};