/**
 * global-main-index.js
 * DASHBOARD COMPLETA: 63 Ferramentas (Calculadoras + Escalas + Calendários)
 */

const BASE_URL = 'https://www.calculadorasdeenfermagem.com.br/';

const TOOLS_DATA = [
    // --- CALCULADORAS ---
    { id: 'balanco-hidrico', name: 'Balanço Hídrico', category: 'Controle Hídrico', type: 'calculator', description: 'Controle preciso de líquidos e fluidos.', filename: BASE_URL + 'balancohidrico.html', icon: 'fas fa-tint', color: 'emerald' },
    { id: 'gasometria', name: 'Cálculo de Gasometria', category: 'Exames', type: 'calculator', description: 'Interpretação de gasometria arterial e distúrbios.', filename: BASE_URL + 'gasometria.html', icon: 'fas fa-vial', color: 'emerald' },
    { id: 'gotejamento', name: 'Cálculo de Gotejamento', category: 'Medicamentos', type: 'calculator', description: 'Velocidade de infusão de soluções parenterais.', filename: BASE_URL + 'gotejamento.html', icon: 'fas fa-hand-holding-water', color: 'emerald' },
    { id: 'aspiracao-heparina', name: 'Cálculo de Heparina', category: 'Medicamentos', type: 'calculator', description: 'Cálculo seguro de doses de heparina.', filename: BASE_URL + 'heparina.html', icon: 'fas fa-syringe', color: 'emerald' },
    { id: 'imc', name: 'Índice de Massa Corporal (IMC)', category: 'Nutrição', type: 'calculator', description: 'Avaliação nutricional e peso ideal.', filename: BASE_URL + 'imc.html', icon: 'fas fa-weight', color: 'emerald' },
    { id: 'aspiracao-insulina', name: 'Cálculo de Insulina', category: 'Medicamentos', type: 'calculator', description: 'Cálculo de doses e unidades de insulina.', filename: BASE_URL + 'insulina.html', icon: 'fas fa-syringe', color: 'emerald' },
    { id: 'medicamentos', name: 'Cálculo de Medicamentos', category: 'Medicamentos', type: 'calculator', description: 'Regra de três para doses e diluições.', filename: BASE_URL + 'medicamentos.html', icon: 'fas fa-pills', color: 'emerald' },
    { id: 'dimensionamento', name: 'Dimensionamento de Equipe', category: 'Gestão', type: 'calculator', description: 'Organização de recursos humanos segundo COFEN.', filename: BASE_URL + 'dimensionamento.html', icon: 'fas fa-users-cog', color: 'emerald' },
    { id: 'idade-gestacional', name: 'Idade Gestacional e DPP', category: 'Obstetrícia', type: 'calculator', description: 'Cálculo de DUM, DPP e idade gestacional.', filename: BASE_URL + 'gestacional.html', icon: 'fas fa-baby', color: 'emerald' },

    // --- ESCALAS (52 Itens Preservados) ---
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

    // --- CALENDÁRIOS (Reinclusos) ---
    { id: 'vacinal-2024', name: 'Calendário Vacinal 2024', category: 'Imunização', type: 'other', description: 'Calendário nacional completo atualizado para 2024.', filename: BASE_URL + 'vacinas.html', icon: 'fas fa-calendar-check', color: 'amber' },
    { id: 'gestante', name: 'Calendário da Gestante', category: 'Obstetrícia', type: 'other', description: 'Cálculo de idade gestacional e data provável do parto.', filename: BASE_URL + 'gestante.html', icon: 'fas fa-baby', color: 'purple' }
];

let state = {
    searchTerm: '',
    filterCategory: 'all',
    viewMode: 'grid',
    sortOrder: 'az'
};

function render() {
    const gridContainer = document.getElementById('tools-grid');
    if (!gridContainer) return;

    const term = state.searchTerm.toLowerCase();
    let filtered = TOOLS_DATA.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(term) || tool.description.toLowerCase().includes(term);
        const matchesCategory = state.filterCategory === 'all' || tool.category === state.filterCategory;
        return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
        if (state.sortOrder === 'az') return a.name.localeCompare(b.name);
        if (state.sortOrder === 'za') return b.name.localeCompare(a.name);
        return 0;
    });

    if (state.viewMode === 'list') {
        gridContainer.classList.remove('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
        gridContainer.classList.add('grid-cols-1');
    } else {
        gridContainer.classList.remove('grid-cols-1');
        gridContainer.classList.add('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    }

    if (filtered.length > 0) {
        gridContainer.innerHTML = filtered.map(tool => Utils.renderCard(tool, state)).join('');
    } else {
        gridContainer.innerHTML = `
            <div class="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <i class="fas fa-search text-gray-300 text-5xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900">Nenhum resultado encontrado</h3>
                <p class="text-gray-500">Tente buscar por outros termos ou categorias.</p>
            </div>
        `;
    }
}

function updateViewButtons() {
    const btnGrid = document.getElementById('view-grid');
    const btnList = document.getElementById('view-list');
    if (!btnGrid || !btnList) return;

    if (state.viewMode === 'grid') {
        btnGrid.classList.add('bg-blue-600', 'text-white');
        btnGrid.classList.remove('bg-gray-300', 'text-gray-700');
        btnList.classList.remove('bg-blue-600', 'text-white');
        btnList.classList.add('bg-gray-300', 'text-gray-700');
    } else {
        btnList.classList.add('bg-blue-600', 'text-white');
        btnList.classList.remove('bg-gray-300', 'text-gray-700');
        btnGrid.classList.remove('bg-blue-600', 'text-white');
        btnGrid.classList.add('bg-gray-300', 'text-gray-700');
    }
}

Utils.onReady(() => {
    render();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce((e) => {
            state.searchTerm = e.target.value;
            render();
        }, 300));
    }

    document.getElementById('sort-select')?.addEventListener('change', (e) => {
        state.sortOrder = e.target.value;
        render();
    });

    document.getElementById('category-select')?.addEventListener('change', (e) => {
        state.filterCategory = e.target.value;
        render();
    });

    document.getElementById('view-grid')?.addEventListener('click', () => {
        state.viewMode = 'grid';
        updateViewButtons();
        render();
    });

    document.getElementById('view-list')?.addEventListener('click', () => {
        state.viewMode = 'list';
        updateViewButtons();
        render();
    });
});