const UI = {
    renderHeader(config) {
        const container = document.getElementById('calc-header');
        if (!container) return;
        container.innerHTML = `
            <span class="bg-nurse-primary text-white text-[11px] font-bold px-5 py-2.5 rounded-full uppercase tracking-widest mb-6 inline-block shadow-lg">Calculadoras Clínicas</span>
            <h1 class="text-4xl md:text-6xl mb-6 leading-tight">${config.name}</h1>
            <div class="h-2 w-24 bg-gradient-to-r from-nurse-secondary to-nurse-primary rounded-full mb-8"></div>
            <p class="text-xl text-slate-500 font-medium italic leading-relaxed max-w-3xl">${config.description}</p>
        `;
    },

    renderBreadcrumbs(bc) {
        const container = document.getElementById('breadcrumb-container');
        if (!container || !bc.desktop) return;
        const html = bc.desktop.map((item, i) => `
            <span class="${i === bc.desktop.length - 1 ? 'text-nurse-primary font-black' : 'text-slate-400 font-medium'} text-sm">
                ${item}
            </span>
        `).join('<i class="fa-solid fa-chevron-right text-[10px] mx-3 opacity-30"></i>');
        container.innerHTML = `<div class="flex items-center">${html}</div>`;
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
                <i class="fa-solid fa-${tab.icon} mr-2"></i> ${tab.label}
            </button>
        `).join('');
    },

    switchTab(id) {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        if (id === 'calc') {
            document.getElementById('pane-calc').classList.remove('hidden');
        } else {
            const pane = document.getElementById('pane-info');
            pane.classList.remove('hidden');
            pane.innerHTML = this.getTabContent(id);
        }
        document.getElementById(`btn-tab-${id}`).classList.add('active');
        VOICE.speak(`Exibindo aba ${id}`);
    },

    getTabContent(id) {
        const cfg = CORE.state.config;
        if (id === 'sobre') return `
            <h2 class="text-2xl font-black mb-6">1. Identificação e Definição</h2>
            <p>A Calculadora de Aspiração de Insulina é uma ferramenta de suporte à decisão clínica projetada para converter a dose prescrita de insulina em Unidades Internacionais (UI) para o volume equivalente em mililitros (ml).</p>
            <p>Assim como a Heparina, a Insulina é um Medicamento de Alta Vigilância (MAV). A calculadora é essencial quando há indisponibilidade de seringas graduadas em Unidades e o profissional precisa utilizar seringas de precisão graduadas em mililitros (como a de 1 ml).</p>
            <h2 class="text-2xl font-black my-6">2. Objetivo e Finalidade</h2>
            <p>Eliminar o erro de conversão matemática no preparo da medicação, garantindo que a dose administrada seja idêntica à prescrita. Prevenção de eventos adversos graves, como crises de hipoglicemia severa.</p>
            <h2 class="text-2xl font-black my-6">5. Lógica de Cálculo e Interpretação</h2>
            <div class="bg-slate-50 p-6 rounded-2xl border font-mono text-sm mb-6">Volume a Aspirar (ml) = Dose Prescrita (UI) / 100</div>
            <table class="w-full text-left border-collapse">
                <thead><tr class="border-b"><th class="py-2">Prescrição</th><th class="py-2 text-center">Volume na Seringa (ml)</th></tr></thead>
                <tbody>
                    <tr><td class="py-2">10 UI</td><td class="py-2 text-center">0,1 ml</td></tr>
                    <tr><td class="py-2">45 UI</td><td class="py-2 text-center">0,45 ml</td></tr>
                </tbody>
            </table>
        `;
        if (id === 'ajuda') return `
            <h2 class="text-2xl font-black mb-6">Instruções de Uso</h2>
            <ul class="space-y-4">
                <li class="flex gap-4"><i class="fa-solid fa-1 bg-nurse-secondary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"></i> <span>Introduza o nome completo e o ano de nascimento do paciente para auditoria.</span></li>
                <li class="flex gap-4"><i class="fa-solid fa-2 bg-nurse-secondary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"></i> <span>Introduza a dose prescrita em Unidades Internacionais (UI).</span></li>
                <li class="flex gap-4"><i class="fa-solid fa-3 bg-nurse-secondary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"></i> <span>Verifique a concentração do frasco disponível (Padrão: 100 UI/ml).</span></li>
                <li class="flex gap-4"><i class="fa-solid fa-4 bg-nurse-secondary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"></i> <span>Clique em "Calcular" e realize a dupla checagem dos protocolos de segurança exibidos abaixo.</span></li>
            </ul>
        `;
        if (id === 'ref') return `
            <h2 class="text-2xl font-black mb-6">Referências Bibliográficas</h2>
            <ul class="space-y-4 text-slate-600">
                <li>• <strong>Sociedade Brasileira de Diabetes (SBD).</strong> Diretrizes da Sociedade Brasileira de Diabetes 2025/2026.</li>
                <li>• <strong>Instituto para Práticas Seguras (ISMP Brasil).</strong> Protocolos de Segurança na Administração de Insulina.</li>
                <li>• <strong>Conselho Federal de Enfermagem (COFEN).</strong> Guia de Boas Práticas: Medicamentos de Alta Vigilância.</li>
            </ul>
        `;
        return '';
    },

    renderAudit(config, inputs, result) {
        const container = document.getElementById('audit-container');
        container.innerHTML = `
            <div class="mb-12 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="bg-slate-50 px-8 py-4 border-b border-slate-200">
                    <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary flex items-center gap-2">
                        <i class="fa-solid fa-magnifying-glass-chart"></i> Auditoria do Cálculo
                    </h3>
                </div>
                <div class="p-8 space-y-6">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="p-4 bg-slate-50 rounded-2xl">
                            <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Identificação do Paciente</p>
                            <p class="font-bold text-sm text-nurse-primary uppercase">${inputs.name}</p>
                            <p class="text-[10px] text-slate-500 font-bold">${inputs.age} anos</p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-2xl">
                            <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Parâmetros Clínicos</p>
                            <div class="text-[10px] font-bold text-slate-600 uppercase">
                                <p>Frasco: ${inputs.frasco} UI/ml</p>
                                <p>Seringa: ${inputs.seringa} ml</p>
                                <p>Prescrição: ${inputs.prescricao} UI</p>
                            </div>
                        </div>
                    </div>
                    <div class="p-6 bg-nurse-primary/5 rounded-2xl border-l-4 border-nurse-secondary">
                        <p class="text-[9px] font-black text-nurse-secondary uppercase mb-2">Fórmula Aplicada</p>
                        <p class="font-mono text-xs text-slate-700 font-bold mb-3">${config.formula.calculation}</p>
                        <p class="text-[9px] font-black text-nurse-primary uppercase mb-1">Resolução Auditada</p>
                        <p class="font-bold text-nurse-primary text-sm">V = (${inputs.prescricao} * ${inputs.seringa}) / ${inputs.frasco} = ${result} ml</p>
                    </div>
                </div>
            </div>
        `;
    },

    renderChecklists() {
        const container = document.getElementById('safety-container');
        const certos = ["Paciente Certo", "Medicação Certa", "Dose Certa", "Via Certa", "Hora Certa", "Registro Certo", "Validade", "Resposta", "Forma"];
        const metas = ["Identificação Correta", "Comunicação Efetiva", "Segurança de medicamento"];

        container.innerHTML = `
            <div class="space-y-8 mb-12">
                <h2 class="text-xl font-black text-nurse-primary flex items-center gap-2 border-l-4 border-nurse-secondary pl-4 uppercase text-[11px] tracking-widest">
                    Check-list de Segurança do Paciente
                </h2>
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><i class="fa-solid fa-list-check"></i> 9 Certos</h3>
                        <div class="grid gap-2">
                            ${certos.map(c => `<label class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer text-[10px] font-bold text-slate-600 hover:bg-nurse-primary/5 transition-all"><input type="checkbox" class="w-4 h-4 accent-nurse-primary"/> <span>${c}</span></label>`).join('')}
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><i class="fa-solid fa-shield-halved"></i> Metas Internacionais</h3>
                        <div class="grid gap-3">
                            ${metas.map(m => `<label class="flex items-center gap-4 p-4 bg-blue-50/50 border-l-4 border-blue-500 rounded-xl cursor-pointer text-[10px] font-black uppercase text-blue-900 transition-all hover:shadow-md"><input type="checkbox" class="w-4 h-4 accent-blue-900"/> <span>${m}</span></label>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderSidebar(db) {
        const container = document.getElementById('sidebar-container');
        const related = db.calculators.filter(c => c.id !== CORE.state.config.id).slice(0, 3);
        
        container.innerHTML = `
            <div class="sidebar-module">
                <h3><i class="fa-solid fa-trophy"></i> Simulados</h3>
                <p class="text-sm opacity-90 mb-6 font-medium">Teste sua precisão em cenários clínicos reais.</p>
                <a href="#" class="block bg-white text-nurse-primary py-4 rounded-2xl font-black text-xs uppercase text-center hover:scale-105 transition-all shadow-xl">Acessar simulados</a>
            </div>
            <div class="sidebar-module from-teal-600 to-nurse-secondary">
                <h3><i class="fa-solid fa-share-nodes"></i> Compartilhar</h3>
                <div class="flex gap-4 justify-center">
                    <button class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all shadow-md"><i class="fab fa-whatsapp"></i></button>
                    <button class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all shadow-md"><i class="fa-solid fa-link"></i></button>
                </div>
            </div>
            <div class="card-base p-8">
                <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary mb-6 flex items-center gap-2 border-b pb-4"><i class="fa-solid fa-list-ul"></i> Relacionadas</h3>
                <div class="space-y-2">
                    ${related.map(c => `<a href="?id=${c.id}" class="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all font-bold text-xs text-slate-500 hover:text-nurse-primary uppercase">${c.name} <i class="fa-solid fa-chevron-right text-[9px] opacity-30"></i></a>`).join('')}
                </div>
            </div>
        `;
    }
};