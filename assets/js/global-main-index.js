/**
 * global-main-index.js
 * Gerencia os dados, estado e renderização da página principal.
 * Versão atualizada com prefixo global-main.
 */

const BASE_URL = 'https://www.calculadorasdeenfermagem.com.br/';

// DATA LAYER
const TOOLS_DATA = [
    // CALCULADORAS
    { id: 'balanco-hidrico', name: 'Balanço Hídrico', category: 'Controle Hídrico', type: 'calculator', description: 'Controle preciso de líquidos e fluidos.', filename: BASE_URL + 'balancohidrico.html', icon: 'fas fa-tint', color: 'emerald' },
    { id: 'gasometria', name: 'Cálculo de Gasometria', category: 'Exames', type: 'calculator', description: 'Interpretação de gasometria arterial e distúrbios.', filename: BASE_URL + 'gasometria.html', icon: 'fas fa-vial', color: 'emerald' },
    { id: 'gotejamento', name: 'Cálculo de Gotejamento', category: 'Medicamentos', type: 'calculator', description: 'Velocidade de infusão de soluções parenterais.', filename: BASE_URL + 'gotejamento.html', icon: 'fas fa-hand-holding-water', color: 'emerald' },
    { id: 'aspiracao-heparina', name: 'Cálculo de Heparina', category: 'Medicamentos', type: 'calculator', description: 'Cálculo para administração de heparina.', filename: BASE_URL + 'heparina.html', icon: 'fas fa-syringe', color: 'emerald' },
    { id: 'imc', name: 'Índice de Massa Corporal (IMC)', category: 'Nutrição', type: 'calculator', description: 'Avaliação nutricional e peso ideal.', filename: BASE_URL + 'imc.html', icon: 'fas fa-weight', color: 'emerald' },
    { id: 'aspiracao-insulina', name: 'Cálculo de Insulina', category: 'Medicamentos', type: 'calculator', description: 'Cálculo de doses e unidades de insulina.', filename: BASE_URL + 'insulina.html', icon: 'fas fa-syringe', color: 'emerald' },
    { id: 'medicamentos', name: 'Cálculo de Medicamentos', category: 'Medicamentos', type: 'calculator', description: 'Regra de três para doses e diluições.', filename: BASE_URL + 'medicamentos.html', icon: 'fas fa-pills', color: 'emerald' },
    { id: 'dimensionamento', name: 'Dimensionamento de Equipe', category: 'Gestão', type: 'calculator', description: 'Organização de recursos humanos segundo COFEN.', filename: BASE_URL + 'dimensionamento.html', icon: 'fas fa-users-cog', color: 'emerald' },
    { id: 'idade-gestacional', name: 'Idade Gestacional e DPP', category: 'Obstetrícia', type: 'calculator', description: 'Cálculo de DUM, DPP e idade gestacional.', filename: BASE_URL + 'gestacional.html', icon: 'fas fa-baby', color: 'emerald' },

    // ESCALAS
    { id: 'aldrete-e-kroulik', name: 'Escala de Aldrete e Kroulik', category: 'Sedação', type: 'scale', description: 'Avaliação do paciente em recuperação pós-anestésica.', filename: BASE_URL + 'aldrete.html', icon: 'fas fa-notes-medical', color: 'blue' },
    { id: 'apache-ii', name: 'Escala de APACHE II', category: 'UTI', type: 'scale', description: 'Avaliação de gravidade em pacientes críticos.', filename: BASE_URL + 'apache.html', icon: 'fa-solid fa-receipt', color: 'blue' },
    { id: 'apgar', name: 'Escala de Apgar', category: 'Neonatalogia', type: 'scale', description: 'Avaliação imediata do recém-nascido.', filename: BASE_URL + 'apgar.html', icon: 'fas fa-baby-carriage', color: 'blue' },
    { id: 'asa', name: 'Risco Perioperatório - ASA', category: 'Anestesia', type: 'scale', description: 'Classificação do estado físico pré-operatório.', filename: BASE_URL + 'asa.html', icon: 'fas fa-notes-medical', color: 'blue' },
    { id: 'ballard', name: 'Escala de Ballard', category: 'Neonatalogia', type: 'scale', description: 'Maturidade neuromuscular do recém-nascido.', filename: BASE_URL + 'ballard.html', icon: 'fas fa-baby-carriage', color: 'blue' },
    { id: 'barthel', name: 'Escala de Barthel', category: 'Funcional', type: 'scale', description: 'Nível de independência funcional do paciente.', filename: BASE_URL + 'barthel.html', icon: 'fas fa-walking', color: 'blue' },
    { id: 'bps', name: 'Escala de Behavioural (BPS)', category: 'Dor', type: 'scale', description: 'Dor em pacientes sedados/ventilados.', filename: BASE_URL + 'bps.html', icon: 'fa-solid fa-mask-face', color: 'blue' },
    { id: 'berg', name: 'Escala de BERG (BBS)', category: 'Fisioterapia', type: 'scale', description: 'Equilíbrio estático e dinâmico.', filename: BASE_URL + 'berg.html', icon: 'fa-solid fa-person', color: 'blue' },
    { id: 'bishop', name: 'Índice de Bishop', category: 'Obstetrícia', type: 'scale', description: 'Maturidade cervical para parto.', filename: BASE_URL + 'bishop.html', icon: 'fa-solid fa-user-doctor', color: 'blue' },
    { id: 'braden', name: 'Escala de Braden', category: 'Pele', type: 'scale', description: 'Risco de desenvolvimento de lesão por pressão.', filename: BASE_URL + 'braden.html', icon: 'fas fa-bed', color: 'blue' },
    { id: 'cam-icu', name: 'Escala CAM-ICU', category: 'UTI', type: 'scale', description: 'Avaliação de delirium em unidade intensiva.', filename: BASE_URL + 'cam.html', icon: 'fas fa-hospital-alt', color: 'blue' },
    { id: 'capurro', name: 'Método de Capurro', category: 'Neonatalogia', type: 'scale', description: 'Estimativa da idade gestacional ao nascer.', filename: BASE_URL + 'capurro.html', icon: 'fas fa-baby-carriage', color: 'blue' },
    { id: 'cincinnati', name: 'Escala de Cincinnati', category: 'AVC', type: 'scale', description: 'Triagem rápida para suspeita de AVC.', filename: BASE_URL + 'cincinnati.html', icon: 'fas fa-hospital-user', color: 'blue' },
    { id: 'cornell', name: 'Escala de Cornell', category: 'Psiquiatria', type: 'scale', description: 'Depressão em pacientes com demência.', filename: BASE_URL + 'cornell.html', icon: 'fas fa-notes-medical', color: 'blue' },
    { id: 'cries', name: 'Escala de CRIES', category: 'Dor', type: 'scale', description: 'Avaliação de dor neonatal.', filename: BASE_URL + 'cries.html', icon: 'fa-solid fa-child', color: 'blue' },
    { id: 'curb-65', name: 'Escala de CURB-65', category: 'Pneumologia', type: 'scale', description: 'Gravidade em pneumonia adquirida na comunidade.', filename: BASE_URL + 'curb-65.html', icon: 'fa-solid fa-lungs-virus', color: 'blue' },
    { id: 'downton', name: 'Escala de Downton', category: 'Segurança', type: 'scale', description: 'Risco de queda em pacientes idosos.', filename: BASE_URL + 'downton.html', icon: 'fa-solid fa-shower', color: 'blue' },
    { id: 'elpo', name: 'Escala de ELPO', category: 'Pele', type: 'scale', description: 'Risco de lesão cirúrgica.', filename: BASE_URL + 'elpo.html', icon: 'fas fa-child', color: 'blue' },
    { id: 'fast', name: 'Escala de FAST', category: 'AVC', type: 'scale', description: 'Protocolo de avaliação rápida de AVC.', filename: BASE_URL + 'fast.html', icon: 'fa-solid fa-person-walking-with-cane', color: 'blue' },
    { id: 'flacc', name: 'Escala de FLACC', category: 'Dor', type: 'scale', description: 'Dor em crianças não verbais.', filename: BASE_URL + 'flacc.html', icon: 'fas fa-hospital-alt', color: 'blue' },
    { id: 'four', name: 'Escala de FOUR', category: 'Neurologia', type: 'scale', description: 'Coma e resposta neurológica detalhada.', filename: BASE_URL + 'four.html', icon: 'fa-solid fa-user-nurse', color: 'blue' },
    { id: 'fugulin-scp', name: 'Escala de Fugulin (SCP)', category: 'Gestão', type: 'scale', description: 'Grau de dependência dos cuidados de enfermagem.', filename: BASE_URL + 'fugulin.html', icon: 'fas fa-hospital-alt', color: 'blue' },
    { id: 'gds', name: 'Escala de GDS', category: 'Geriatria', type: 'scale', description: 'Rastreio de depressão geriátrica.', filename: BASE_URL + 'gds.html', icon: 'fas fa-child', color: 'blue' },
    { id: 'glasgow', name: 'Escala de Coma de Glasgow', category: 'Neurologia', type: 'scale', description: 'Avaliação do nível de consciência.', filename: BASE_URL + 'glasgow.html', icon: 'fa-solid fa-eye', color: 'blue' },
    { id: 'gosnell', name: 'Escala de Gosnell', category: 'Pele', type: 'scale', description: 'Risco de úlcera por pressão.', filename: BASE_URL + 'gosnell.html', icon: 'fa-solid fa-weight-scale', color: 'blue' },
    { id: 'hamilton', name: 'Escala de Hamilton', category: 'Psiquiatria', type: 'scale', description: 'Avaliação da gravidade de ansiedade.', filename: BASE_URL + 'hamilton.html', icon: 'fas fa-file-medical-alt', color: 'blue' },
    { id: 'humpty-dumpty', name: 'Escala de Humpty-Dumpty', category: 'Segurança', type: 'scale', description: 'Risco de quedas em pediatria.', filename: BASE_URL + 'humpty.html', icon: 'fas fa-file-medical-alt', color: 'blue' },
    { id: 'johns', name: 'Escala de Johns Hopkins', category: 'Segurança', type: 'scale', description: 'Risco de queda intra-hospitalar.', filename: BASE_URL + 'johns.html', icon: 'fa-solid fa-person-walking-with-cane', color: 'blue' },
    { id: 'jouvet', name: 'Escala de Jouvet', category: 'Neurologia', type: 'scale', description: 'Avaliação da profundidade do coma.', filename: BASE_URL + 'jouvet.html', icon: 'fas fa-bed', color: 'blue' },
    { id: 'katz', name: 'Escala de Katz', category: 'Funcional', type: 'scale', description: 'Atividades da vida diária (AVD).', filename: BASE_URL + 'katz.html', icon: 'fa-solid fa-bath', color: 'blue' },
    { id: 'lachs', name: 'Escala de Lachs', category: 'Geriatria', type: 'scale', description: 'Avaliação funcional do idoso.', filename: BASE_URL + 'lachs.html', icon: 'fa-solid fa-person-walking-with-cane', color: 'blue' },
    { id: 'lanss', name: 'Escala de LANSS', category: 'Dor', type: 'scale', description: 'Avaliação de dor neuropática.', filename: BASE_URL + 'lanss.html', icon: 'fas fa-user-nurse', color: 'blue' },
    { id: 'lawton', name: 'Escala de Lawton', category: 'Funcional', type: 'scale', description: 'Atividades instrumentais da vida diária.', filename: BASE_URL + 'lawton.html', icon: 'fa-solid fa-mug-saucer', color: 'blue' },
    { id: 'manchester', name: 'Escala de Manchester', category: 'Triagem', type: 'scale', description: 'Priorização de atendimento em urgência.', filename: BASE_URL + 'manchester.html', icon: 'fas fa-clinic-medical', color: 'blue' },
    { id: 'meem', name: 'Escala de MEEM', category: 'Cognitivo', type: 'scale', description: 'Mini Exame do Estado Mental.', filename: BASE_URL + 'meem.html', icon: 'fas fa-wheelchair', color: 'blue' },
    { id: 'meows', name: 'Escala de MEOWS', category: 'Obstetrícia', type: 'scale', description: 'Alerta obstétrico precoce.', filename: BASE_URL + 'meows.html', icon: 'fas fa-notes-medical', color: 'blue' },
    { id: 'morse', name: 'Escala de Morse', category: 'Segurança', type: 'scale', description: 'Risco de queda de pacientes adultos.', filename: BASE_URL + 'morse.html', icon: 'fas fa-walking', color: 'blue' },
    { id: 'news', name: 'Escala de NEWS', category: 'Alerta Clínico', type: 'scale', description: 'National Early Warning Score.', filename: BASE_URL + 'news.html', icon: 'fas fa-chart-line', color: 'blue' },
    { id: 'nihss', name: 'Escala NIHSS', category: 'AVC', type: 'scale', description: 'Gravidade do déficit neurológico no AVC.', filename: BASE_URL + 'nihss.html', icon: 'fas fa-brain', color: 'blue' },
    { id: 'nips', name: 'Escala de NIPS', category: 'Dor', type: 'scale', description: 'Dor no recém-nascido (Neonatal Infant Pain Scale).', filename: BASE_URL + 'nips.html', icon: 'fa-solid fa-eye-dropper', color: 'blue' },
    { id: 'norton', name: 'Escala de Norton', category: 'Pele', type: 'scale', description: 'Risco de desenvolvimento de LPP.', filename: BASE_URL + 'norton.html', icon: 'fas fa-file-medical-alt', color: 'blue' },
    { id: 'numerica-dor', name: 'Escala Numérica de Dor', category: 'Dor', type: 'scale', description: 'Intensidade da dor referida.', filename: BASE_URL + 'escalanumerica.html', icon: 'fas fa-hospital-alt', color: 'blue' },
    { id: 'ofras', name: 'Escala de OFRAS', category: 'Segurança', type: 'scale', description: 'Risco de quedas em obstetrícia.', filename: BASE_URL + 'ofras.html', icon: 'fa-solid fa-square-plus', color: 'blue' },
    { id: 'painad', name: 'Escala de PAINAD', category: 'Dor', type: 'scale', description: 'Dor em pacientes com demência.', filename: BASE_URL + 'painad.html', icon: 'fa-solid fa-hand-holding-medical', color: 'blue' },
    { id: 'pelod', name: 'Escala de PELOD', category: 'Pediatria', type: 'scale', description: 'Disfunção orgânica pediátrica.', filename: BASE_URL + 'pelod.html', icon: 'fa-solid fa-comment-medical', color: 'blue' },
    { id: 'perroca-scp', name: 'Classificação Perroca (SCP)', category: 'Gestão', type: 'scale', description: 'Complexidade do cuidado assistencial.', filename: BASE_URL + 'perroca.html', icon: 'fas fa-hospital-alt', color: 'blue' },
    { id: 'pews', name: 'Escala de PEWS', category: 'Alerta Clínico', type: 'scale', description: 'Alerta precoce pediátrico.', filename: BASE_URL + 'pews.html', icon: 'fas fa-notes-medical', color: 'blue' },
    { id: 'prism', name: 'Escala PRISM', category: 'Pediatria', type: 'scale', description: 'Risco de mortalidade em UTIP.', filename: BASE_URL + 'prism.html', icon: 'fas fa-lungs', color: 'blue' },
    { id: 'qsofa', name: 'Escala qSOFA', category: 'Alerta Clínico', type: 'scale', description: 'Triagem rápida para sepse.', filename: BASE_URL + 'qsofa.html', icon: 'fas fa-lungs', color: 'blue' },
    { id: 'ramsay', name: 'Escala de Ramsay', category: 'Sedação', type: 'scale', description: 'Nível de sedação do paciente.', filename: BASE_URL + 'ramsay.html', icon: 'fas fa-sleep', color: 'blue' },
    { id: 'richmond', name: 'Escala de RASS', category: 'Sedação', type: 'scale', description: 'Richmond Agitation-Sedation Scale.', filename: BASE_URL + 'richmond.html', icon: 'fas fa-user-md', color: 'blue' },
    { id: 'saps-iii', name: 'Escala de SAPS III', category: 'UTI', type: 'scale', description: 'Simplified Acute Physiology Score.', filename: BASE_URL + 'saps.html', icon: 'fas fa-hospital-alt', color: 'blue' },
    { id: 'sofa', name: 'Escala SOFA', category: 'UTI', type: 'scale', description: 'Falência orgânica sequencial.', filename: BASE_URL + 'sofa.html', icon: 'fas fa-heartbeat', color: 'blue' },
    { id: 'tinetti', name: 'Escala de Tinetti', category: 'Segurança', type: 'scale', description: 'Equilíbrio e marcha em idosos.', filename: BASE_URL + 'tinetti.html', icon: 'fa-solid fa-person-walking-with-cane', color: 'blue' },
    { id: 'waterlow', name: 'Escala de Waterlow', category: 'Pele', type: 'scale', description: 'Avaliação abrangente de risco de LPP.', filename: BASE_URL + 'waterlow.html', icon: 'fa-solid fa-weight-scale', color: 'blue' },
    { id: 'zarit', name: 'Escala de Zarit', category: 'Cuidadores', type: 'scale', description: 'Sobrecarga do cuidador.', filename: BASE_URL + 'zarit.html', icon: 'fa-solid fa-hospital-user', color: 'blue' },
];

const VACCINES_DATA = [
    { id: 'v-prematuro', name: 'Prematuro', category: 'Vacinas', type: 'vaccine', description: 'Calendário vacinal específico para prematuros.', filename: '#', icon: 'fas fa-syringe', color: 'yellow' },
    { id: 'v-crianca', name: 'Criança (0-10 anos)', category: 'Vacinas', type: 'vaccine', description: 'Esquema vacinal pediátrico completo.', filename: '#', icon: 'fas fa-syringe', color: 'yellow' },
    { id: 'v-adolescente', name: 'Adolescente', category: 'Vacinas', type: 'vaccine', description: 'Reforços e vacinas da adolescência.', filename: '#', icon: 'fas fa-syringe', color: 'yellow' },
    { id: 'v-adulto', name: 'Adulto (20-59 anos)', category: 'Vacinas', type: 'vaccine', description: 'Calendário de rotina para vida adulta.', filename: '#', icon: 'fas fa-syringe', color: 'yellow' },
    { id: 'v-idoso', name: 'Idoso (60+ anos)', category: 'Vacinas', type: 'vaccine', description: 'Proteção vacinal na terceira idade.', filename: '#', icon: 'fas fa-syringe', color: 'yellow' },
    { id: 'v-gestante', name: 'Gestante', category: 'Vacinas', type: 'vaccine', description: 'Imunização materna essencial.', filename: '#', icon: 'fas fa-syringe', color: 'yellow' },
    { id: 'v-especial', name: 'Pacientes Especiais', category: 'Vacinas', type: 'vaccine', description: 'Calendário para condições clínicas especiais.', filename: '#', icon: 'fas fa-syringe', color: 'yellow' },
    { id: 'v-ocupacional', name: 'Ocupacional', category: 'Vacinas', type: 'vaccine', description: 'Saúde do trabalhador da enfermagem.', filename: '#', icon: 'fas fa-syringe', color: 'yellow' }
];

// STATE MANAGEMENT
let state = {
    searchTerm: "",
    viewMode: 'grid',
    sortOrder: 'name-asc',
    showIcons: true
};

// COMPONENT RENDERING
function render() {
    const term = state.searchTerm.toLowerCase();
    const allData = [...TOOLS_DATA, ...VACCINES_DATA];
    
    let filtered = allData.filter(t => 
        t.name.toLowerCase().includes(term) || 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
    );

    filtered.sort((a, b) => {
        const f = state.sortOrder === 'name-asc' ? 1 : -1;
        return f * a.name.localeCompare(b.name);
    });

    const containers = {
        calculator: document.getElementById('calculators-container'),
        scale: document.getElementById('scales-container'),
        vaccine: document.getElementById('vaccines-container')
    };

    const gridClass = state.viewMode === 'grid' || state.viewMode === 'icon-xl' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
        : "flex flex-col gap-4";

    Object.values(containers).forEach(c => {
        if (!c) return;
        c.innerHTML = '';
        c.className = gridClass;
    });

    filtered.forEach(tool => {
        const html = typeof TemplateEngine !== 'undefined' ? TemplateEngine.renderCard(tool, state) : '';
        if (containers[tool.type]) containers[tool.type].innerHTML += html;
    });

    document.getElementById('calculators-section').style.display = filtered.some(t => t.type === 'calculator') ? 'block' : 'none';
    document.getElementById('scales-section').style.display = filtered.some(t => t.type === 'scale') ? 'block' : 'none';
    document.getElementById('vaccines-section').style.display = filtered.some(t => t.type === 'vaccine') ? 'block' : 'none';
    
    const noResults = document.getElementById('no-results');
    if (noResults) noResults.style.display = filtered.length === 0 ? 'block' : 'none';
}

function renderControls() {
    const container = document.getElementById('controls-container');
    if (!container) return;

    container.innerHTML = `
        <div class="flex items-center gap-4">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordenar</label>
            <select id="sort-select" class="native-select bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-5 py-2.5 text-sm font-bold dark:text-white outline-none focus:border-nurse-secondary">
                <option value="name-asc" ${state.sortOrder === 'name-asc' ? 'selected' : ''}>A - Z</option>
                <option value="name-desc" ${state.sortOrder === 'name-desc' ? 'selected' : ''}>Z - A</option>
            </select>
        </div>
        <div class="flex items-center gap-6">
            <div class="flex bg-gray-50 dark:bg-slate-700 p-1.5 rounded-2xl shadow-inner">
                <button data-view="grid" title="Grade" class="view-btn p-2.5 rounded-xl transition-all ${state.viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-nurse-primary shadow-sm' : 'text-gray-400'}"><i class="fas fa-th-large"></i></button>
                <button data-view="list" title="Lista" class="view-btn p-2.5 rounded-xl transition-all ${state.viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-nurse-primary shadow-sm' : 'text-gray-400'}"><i class="fas fa-list"></i></button>
                <button data-view="compact" title="Compacto" class="view-btn p-2.5 rounded-xl transition-all ${state.viewMode === 'compact' ? 'bg-white dark:bg-slate-600 text-nurse-primary shadow-sm' : 'text-gray-400'}"><i class="fas fa-stream"></i></button>
                <button data-view="icon-xl" title="Ícones Grandes" class="view-btn p-2.5 rounded-xl transition-all ${state.viewMode === 'icon-xl' ? 'bg-white dark:bg-slate-600 text-nurse-primary shadow-sm' : 'text-gray-400'}"><i class="fas fa-th"></i></button>
            </div>
            <div class="flex items-center gap-3 border-l pl-6 dark:border-slate-700">
                <input type="checkbox" id="toggle-icons" ${state.showIcons ? 'checked' : ''} class="w-5 h-5 rounded accent-nurse-secondary cursor-pointer">
                <label for="toggle-icons" class="text-sm font-bold text-gray-400 uppercase tracking-tighter cursor-pointer">Ícones</label>
            </div>
        </div>`;

    document.getElementById('sort-select').onchange = (e) => { state.sortOrder = e.target.value; render(); };
    document.getElementById('toggle-icons').onchange = (e) => { state.showIcons = e.target.checked; render(); };
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => { state.viewMode = btn.dataset.view; renderControls(); render(); };
    });
}

function initQuickAccess() {
    const container = document.getElementById('quick-access-container');
    if (!container) return;

    const shortcuts = [
        { label: 'Cálculos', icon: 'fas fa-calculator', target: 'calculadoras' },
        { label: 'Escalas', icon: 'fas fa-heartbeat', target: 'escalas' },
        { label: 'Vacinas', icon: 'fas fa-syringe', target: 'vacinas' },
        { label: 'Topo', icon: 'fas fa-arrow-up', target: 'top' }
    ];
    
    container.innerHTML = shortcuts.map(s => `
        <button onclick="${s.target === 'top' ? "window.scrollTo({top:0, behavior:'smooth'})" : `document.querySelector('[data-anchor-id=\\'${s.target}\\']')?.scrollIntoView({behavior:'smooth'})`}" 
                class="group flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-700 border-2 border-transparent hover:border-nurse-secondary rounded-[2rem] transition-all shadow-sm">
            <div class="w-14 h-14 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl mb-4 text-nurse-primary dark:text-nurse-secondary group-hover:scale-110 transition-transform shadow-sm">
                <i class="${s.icon} text-xl"></i>
            </div>
            <span class="font-bold text-nurse-primary dark:text-gray-300 text-[10px] uppercase tracking-wider leading-none">${s.label}</span>
        </button>`).join('');
}

// INITIALIZATION
window.onload = () => {
    if (typeof Utils !== 'undefined') {
        Utils.injectComponent('header-container', 'assets/components/header.html');
        Utils.injectComponent('footer-container', 'assets/components/footer.html');
        Utils.injectComponent('modals-container', 'assets/components/modals.html');
    }

    initQuickAccess();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.oninput = (e) => { state.searchTerm = e.target.value; render(); };
        document.getElementById('clear-search').onclick = () => { 
            state.searchTerm = ""; 
            searchInput.value = ""; 
            render(); 
        };
    }

    renderControls();
    render();
    window.dispatchEvent(new CustomEvent('portalReady'));
};