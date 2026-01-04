/**
 * ============================================
 * MAIN-INDEX-LOADER.JS
 * Calculadoras de Enfermagem
 * 
 * Funcionalidades:
 * - Dados das ferramentas clínicas
 * - Renderização de cards
 * - Sistema de classificação
 * - Controle de visualização
 * - CSS inline para cards
 * ============================================
 */

(function() {
    "use strict";

    // ============================================
    // DADOS DAS FERRAMENTAS
    // ============================================
    const toolsData = [
        // Calculadoras
        { id: "balanco-hidrico", name: "Balanço Hídrico", type: "calculator", description: "Controle preciso de líquidos e fluidos corporais.", filename: "balancohidrico.html", icon: "fas fa-tint", color: "blue" },
        { id: "gasometria", name: "Cálculo de Gasometria", type: "calculator", description: "Interpretação de gasometria arterial e distúrbios ácido-básicos.", filename: "gasometria.html", icon: "fas fa-vial", color: "blue" },
        { id: "gotejamento", name: "Cálculo de Gotejamento", type: "calculator", description: "Velocidade de infusão de soluções parenterais.", filename: "gotejamento.html", icon: "fas fa-hand-holding-water", color: "blue" },
        { id: "aspiracao-heparina", name: "Cálculo de Heparina", type: "calculator", description: "Cálculo seguro de doses de heparina.", filename: "heparina.html", icon: "fas fa-syringe", color: "blue" },
        { id: "imc", name: "Índice de Massa Corporal (IMC)", type: "calculator", description: "Avaliação nutricional e classificação de peso.", filename: "imc.html", icon: "fas fa-weight", color: "blue" },
        { id: "aspiracao-insulina", name: "Cálculo de Insulina", type: "calculator", description: "Cálculo de doses e unidades de insulina.", filename: "insulina.html", icon: "fas fa-syringe", color: "blue" },
        { id: "medicamentos", name: "Cálculo de Medicamentos", type: "calculator", description: "Regra de três para doses e diluições.", filename: "medicamentos.html", icon: "fas fa-pills", color: "blue" },
        { id: "dimensionamento", name: "Dimensionamento de Equipe", type: "calculator", description: "Organização de recursos humanos segundo COFEN.", filename: "dimensionamento.html", icon: "fas fa-users-cog", color: "blue" },
        { id: "idade-gestacional", name: "Idade Gestacional e DPP", type: "calculator", description: "Cálculo de DUM, DPP e idade gestacional.", filename: "gestacional.html", icon: "fas fa-baby", color: "blue" },
        
        // Escalas
        { id: "aldrete-e-kroulik", name: "Escala de Aldrete e Kroulik", type: "scale", description: "Avaliação do paciente em recuperação pós-anestésica.", filename: "aldrete.html", icon: "fas fa-notes-medical", color: "blue" },
        { id: "apache-ii", name: "Escala de APACHE II", type: "scale", description: "Avaliação de gravidade em pacientes críticos.", filename: "apache.html", icon: "fa-solid fa-receipt", color: "blue" },
        { id: "apgar", name: "Escala de Apgar", type: "scale", description: "Avaliação imediata do recém-nascido.", filename: "apgar.html", icon: "fas fa-baby-carriage", color: "blue" },
        { id: "asa", name: "Risco Perioperatório - ASA", type: "scale", description: "Classificação do estado físico pré-operatório.", filename: "asa.html", icon: "fas fa-notes-medical", color: "blue" },
        { id: "ballard", name: "Escala de Ballard", type: "scale", description: "Maturidade neuromuscular do recém-nascido.", filename: "ballard.html", icon: "fas fa-baby-carriage", color: "blue" },
        { id: "barthel", name: "Escala de Barthel", type: "scale", description: "Nível de independência funcional do paciente.", filename: "barthel.html", icon: "fas fa-walking", color: "blue" },
        { id: "bps", name: "Escala de Behavioural (BPS)", type: "scale", description: "Avaliação de dor em pacientes sedados/ventilados.", filename: "bps.html", icon: "fa-solid fa-mask-face", color: "blue" },
        { id: "berg", name: "Escala de BERG (BBS)", type: "scale", description: "Equilíbrio estático e dinâmico.", filename: "berg.html", icon: "fa-solid fa-person", color: "blue" },
        { id: "bishop", name: "Índice de Bishop", type: "scale", description: "Maturidade cervical para parto.", filename: "bishop.html", icon: "fa-solid fa-user-doctor", color: "blue" },
        { id: "braden", name: "Escala de Braden", type: "scale", description: "Risco de desenvolvimento de lesão por pressão.", filename: "braden.html", icon: "fas fa-bed", color: "blue" },
        { id: "cam-icu", name: "Escala CAM-ICU", type: "scale", description: "Avaliação de delirium em unidade intensiva.", filename: "cam.html", icon: "fas fa-hospital-alt", color: "blue" },
        { id: "capurro", name: "Método de Capurro", type: "scale", description: "Estimativa da idade gestacional ao nascer.", filename: "capurro.html", icon: "fas fa-baby-carriage", color: "blue" },
        { id: "cincinnati", name: "Escala de Cincinnati", type: "scale", description: "Triagem rápida para suspeita de AVC.", filename: "cincinnati.html", icon: "fas fa-hospital-user", color: "blue" },
        { id: "cornell", name: "Escala de Cornell", type: "scale", description: "Depressão em pacientes com demência.", filename: "cornell.html", icon: "fas fa-notes-medical", color: "blue" },
        { id: "cries", name: "Escala de CRIES", type: "scale", description: "Avaliação de dor neonatal.", filename: "cries.html", icon: "fa-solid fa-child", color: "blue" },
        { id: "curb-65", name: "Escala de CURB-65", type: "scale", description: "Gravidade em pneumonia adquirida na comunidade.", filename: "curb-65.html", icon: "fa-solid fa-lungs-virus", color: "blue" },
        { id: "downton", name: "Escala de Downton", type: "scale", description: "Risco de queda em pacientes idosos.", filename: "downton.html", icon: "fa-solid fa-shower", color: "blue" },
        { id: "elpo", name: "Escala de ELPO", type: "scale", description: "Risco de lesão cirúrgica.", filename: "elpo.html", icon: "fas fa-child", color: "blue" },
        { id: "fast", name: "Escala de FAST", type: "scale", description: "Protocolo de avaliação rápida de AVC.", filename: "fast.html", icon: "fa-solid fa-person-walking-with-cane", color: "blue" },
        { id: "flacc", name: "Escala de FLACC", type: "scale", description: "Dor em crianças não verbais.", filename: "flacc.html", icon: "fas fa-hospital-alt", color: "blue" },
        { id: "four", name: "Escala de FOUR", type: "scale", description: "Coma e resposta neurológica detalhada.", filename: "four.html", icon: "fa-solid fa-user-nurse", color: "blue" },
        { id: "fugulin-scp", name: "Escala de Fugulin (SCP)", type: "scale", description: "Grau de dependência dos cuidados de enfermagem.", filename: "fugulin.html", icon: "fas fa-hospital-alt", color: "blue" },
        { id: "gds", name: "Escala de GDS", type: "scale", description: "Rastreio de depressão geriátrica.", filename: "gds.html", icon: "fas fa-child", color: "blue" },
        { id: "glasgow", name: "Escala de Coma de Glasgow", type: "scale", description: "Avaliação do nível de consciência.", filename: "glasgow.html", icon: "fa-solid fa-eye", color: "blue" },
        { id: "gosnell", name: "Escala de Gosnell", type: "scale", description: "Risco de úlcera por pressão.", filename: "gosnell.html", icon: "fa-solid fa-weight-scale", color: "blue" },
        { id: "hamilton", name: "Escala de Hamilton", type: "scale", description: "Avaliação da gravidade de ansiedade.", filename: "hamilton.html", icon: "fas fa-file-medical-alt", color: "blue" },
        { id: "humpty-dumpty", name: "Escala de Humpty-Dumpty", type: "scale", description: "Risco de quedas em pediatria.", filename: "humpty.html", icon: "fas fa-file-medical-alt", color: "blue" },
        { id: "johns", name: "Escala de Johns Hopkins", type: "scale", description: "Risco de queda intra-hospitalar.", filename: "johns.html", icon: "fa-solid fa-person-walking-with-cane", color: "blue" },
        { id: "jouvet", name: "Escala de Jouvet", type: "scale", description: "Avaliação da profundidade do coma.", filename: "jouvet.html", icon: "fas fa-bed", color: "blue" },
        { id: "katz", name: "Escala de Katz", type: "scale", description: "Atividades da vida diária (AVD).", filename: "katz.html", icon: "fa-solid fa-bath", color: "blue" },
        { id: "lachs", name: "Escala de Lachs", type: "scale", description: "Avaliação funcional do idoso.", filename: "lachs.html", icon: "fa-solid fa-person-walking-with-cane", color: "blue" },
        { id: "lanss", name: "Escala de LANSS", type: "scale", description: "Avaliação de dor neuropática.", filename: "lanss.html", icon: "fas fa-user-nurse", color: "blue" },
        { id: "lawton", name: "Escala de Lawton", type: "scale", description: "Atividades instrumentais da vida diária.", filename: "lawton.html", icon: "fa-solid fa-mug-saucer", color: "blue" },
        { id: "manchester", name: "Escala de Manchester", type: "scale", description: "Priorização de atendimento em urgência.", filename: "manchester.html", icon: "fas fa-clinic-medical", color: "blue" },
        { id: "meem", name: "Escala de MEEM", type: "scale", description: "Mini Exame do Estado Mental.", filename: "meem.html", icon: "fas fa-wheelchair", color: "blue" },
        { id: "meows", name: "Escala de MEOWS", type: "scale", description: "Alerta obstétrico precoce.", filename: "meows.html", icon: "fas fa-notes-medical", color: "blue" },
        { id: "morse", name: "Escala de Morse", type: "scale", description: "Risco de queda de pacientes adultos.", filename: "morse.html", icon: "fas fa-walking", color: "blue" },
        { id: "news", name: "Escala de NEWS", type: "scale", description: "National Early Warning Score.", filename: "news.html", icon: "fas fa-chart-line", color: "blue" },
        { id: "nihss", name: "Escala NIHSS", type: "scale", description: "Gravidade do déficit neurológico no AVC.", filename: "nihss.html", icon: "fas fa-brain", color: "blue" },
        { id: "nips", name: "Escala de NIPS", type: "scale", description: "Dor no recém-nascido (Neonatal Infant Pain Scale).", filename: "nips.html", icon: "fa-solid fa-eye-dropper", color: "blue" },
        { id: "norton", name: "Escala de Norton", type: "scale", description: "Risco de desenvolvimento de LPP.", filename: "norton.html", icon: "fas fa-file-medical-alt", color: "blue" },
        { id: "numerica-dor", name: "Escala Numérica de Dor", type: "scale", description: "Intensidade da dor referida.", filename: "escalanumerica.html", icon: "fas fa-hospital-alt", color: "blue" },
        { id: "ofras", name: "Escala de OFRAS", type: "scale", description: "Risco de quedas em obstetrícia.", filename: "ofras.html", icon: "fa-solid fa-square-plus", color: "blue" },
        { id: "painad", name: "Escala de PAINAD", type: "scale", description: "Dor em pacientes com demência.", filename: "painad.html", icon: "fa-solid fa-hand-holding-medical", color: "blue" },
        { id: "pelod", name: "Escala de PELOD", type: "scale", description: "Disfunção orgânica pediátrica.", filename: "pelod.html", icon: "fa-solid fa-comment-medical", color: "blue" },
        { id: "perroca-scp", name: "Classificação Perroca (SCP)", type: "scale", description: "Complexidade do cuidado assistencial.", filename: "perroca.html", icon: "fas fa-hospital-alt", color: "blue" },
        { id: "pews", name: "Escala de PEWS", type: "scale", description: "Alerta precoce pediátrico.", filename: "pews.html", icon: "fas fa-notes-medical", color: "blue" },
        { id: "prism", name: "Escala PRISM", type: "scale", description: "Risco de mortalidade em UTIP.", filename: "prism.html", icon: "fas fa-lungs", color: "blue" },
        { id: "qsofa", name: "Escala qSOFA", type: "scale", description: "Triagem rápida para sepse.", filename: "qsofa.html", icon: "fas fa-lungs", color: "blue" },
        { id: "ramsay", name: "Escala de Ramsay", type: "scale", description: "Nível de sedação do paciente.", filename: "ramsay.html", icon: "fas fa-sleep", color: "blue" },
        { id: "richmond", name: "Escala de RASS", type: "scale", description: "Richmond Agitation-Sedation Scale.", filename: "richmond.html", icon: "fas fa-user-md", color: "blue" },
        { id: "saps-iii", name: "Escala de SAPS III", type: "scale", description: "Simplified Acute Physiology Score.", filename: "saps.html", icon: "fas fa-hospital-alt", color: "blue" },
        
        // Outras ferramentas
        { id: "vacinal-2024", name: "Calendário Vacinal 2024", type: "other", description: "Calendário nacional completo atualizado para 2024.", filename: "vacinas.html", icon: "fas fa-calendar-check", color: "blue" },
        { id: "gestante", name: "Calendário da Gestante", type: "other", description: "Vacinas recomendadas durante a gestação.", filename: "gestante.html", icon: "fas fa-baby", color: "blue" }
    ];

    // ============================================
    // CSS INCORPORADO PARA CARDS
    // ============================================
    const cssStyles = `
        /* ============================================
           ESTILOS DOS CARDS - MAIN-INDEX-LOADER
           ============================================ */
        
        /* Container do grid de cards */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
            padding: 1rem 0;
            width: 100%;
        }
        
        /* Responsividade do grid */
        @media (max-width: 640px) {
            .cards-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
            .cards-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        /* ============================================
           ESTRUTURA PRINCIPAL DO CARD
           ============================================ */
        .tool-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            height: 100%;
            min-height: 200px;
        }
        
        /* Diferenciação por tipo de ferramenta */
        .tool-card[data-type="calculator"] {
            border-top: 3px solid #3b82f6;
        }
        
        .tool-card[data-type="scale"] {
            border-top: 3px solid #10b981;
        }
        
        .tool-card[data-type="other"] {
            border-top: 3px solid #f59e0b;
        }
        
        /* Estados interativos do card */
        .tool-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-color: #1A3E74;
        }
        
        .tool-card:focus-within {
            outline: 3px solid #008CBA;
            outline-offset: 2px;
            box-shadow: 0 0 0 4px rgba(0, 140, 186, 0.2);
        }
        
        .tool-card.highlighted {
            border-color: #1A3E74;
            box-shadow: 0 4px 12px rgba(26, 62, 116, 0.15);
        }
        
        /* Link estendido para área clicável */
        .card-link {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            text-decoration: none;
        }
        
        .card-link:focus {
            outline: none;
        }
        
        /* ============================================
           CABEÇALHO DO CARD - ÍCONE
           ============================================ */
        .card-header {
            padding: 1.25rem 1.25rem 0.75rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .card-icon-container {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        /* Cores dos ícones por tipo */
        .tool-card[data-type="calculator"] .card-icon-container {
            background-color: rgba(59, 130, 246, 0.1);
        }
        
        .tool-card[data-type="scale"] .card-icon-container {
            background-color: rgba(16, 185, 129, 0.1);
        }
        
        .tool-card[data-type="other"] .card-icon-container {
            background-color: rgba(245, 158, 11, 0.1);
        }
        
        .tool-card[data-type="calculator"] .card-icon {
            color: #3b82f6;
        }
        
        .tool-card[data-type="scale"] .card-icon {
            color: #10b981;
        }
        
        .tool-card[data-type="other"] .card-icon {
            color: #f59e0b;
        }
        
        .tool-card:hover .card-icon-container {
            background-color: #1A3E74;
        }
        
        .tool-card:hover .card-icon {
            color: #ffffff;
        }
        
        .card-icon {
            font-size: 1.5rem;
            transition: color 0.3s ease;
        }
        
        /* ============================================
           BADGE DE CATEGORIA
           ============================================ */
        .category-badge {
            font-family: 'Inter', sans-serif;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            background-color: #f3f4f6;
            color: #6b7280;
        }
        
        .tool-card[data-type="calculator"] .category-badge {
            background-color: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }
        
        .tool-card[data-type="scale"] .category-badge {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }
        
        .tool-card[data-type="other"] .category-badge {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }
        
        /* ============================================
           CORPO DO CARD - CONTEÚDO TEXTUAL
           ============================================ */
        .card-body {
            padding: 0.75rem 1.25rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .tool-title {
            font-family: 'Nunito Sans', sans-serif;
            font-size: 1.125rem;
            font-weight: 700;
            color: #1f2937;
            line-height: 1.4;
            margin: 0 0 0.5rem 0;
            transition: color 0.2s ease;
        }
        
        .tool-card:hover .tool-title {
            color: #1A3E74;
        }
        
        .tool-description {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            font-weight: 400;
            color: #6b7280;
            line-height: 1.6;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        /* ============================================
           RODAPÉ DO CARD - INDICADOR DE ACESSO
           ============================================ */
        .card-footer {
            padding: 0.75rem 1.25rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
        
        .access-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            font-weight: 500;
            color: #1A3E74;
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s ease;
        }
        
        .tool-card:hover .access-indicator {
            opacity: 1;
            transform: translateX(0);
        }
        
        .access-indicator svg {
            transition: transform 0.3s ease;
        }
        
        .tool-card:hover .access-indicator svg {
            transform: translateX(4px);
        }
        
        /* ============================================
           CONTROLE DE VISUALIZAÇÃO DE ÍCONES
           ============================================ */
        .tool-card.icon-hidden .card-icon {
            opacity: 0;
            transform: scale(0.5);
        }
        
        .tool-card.icon-hidden .card-icon-container {
            background-color: transparent !important;
            width: 0;
            padding: 0;
            overflow: hidden;
        }
        
        .tool-card.icon-hidden .card-header {
            padding-left: 1.25rem;
        }
        
        .tool-card.icon-hidden .tool-title {
            font-size: 1.25rem;
        }
        
        .tool-card,
        .card-icon,
        .card-icon-container {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* ============================================
           ANIMAÇÕES
           ============================================ */
        .fade-in-up {
            animation: fadeInUp 0.4s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* ============================================
           ESTADO VAZIO
           ============================================ */
        .empty-state {
            grid-column: 1/-1;
            text-align: center;
            padding: 3rem;
        }
        
        .empty-state i {
            font-size: 5rem;
            color: #9ca3af;
            margin-bottom: 1rem;
        }
        
        .empty-state h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }
        
        .empty-state p {
            color: #6b7280;
        }
        
        /* ============================================
           MODO DE VISUALIZAÇÃO LISTA
           ============================================ */
        .cards-grid.view-list {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .cards-grid.view-list .tool-card {
            flex-direction: row;
            min-height: auto;
            align-items: center;
        }
        
        .cards-grid.view-list .card-header {
            padding: 1rem;
            width: 80px;
            flex-shrink: 0;
        }
        
        .cards-grid.view-list .card-body {
            padding: 1rem;
            flex: 1;
        }
        
        .cards-grid.view-list .card-footer {
            padding: 1rem;
        }
        
        .cards-grid.view-list .card-icon-container {
            width: 40px;
            height: 40px;
        }
        
        .cards-grid.view-list .tool-description {
            -webkit-line-clamp: 2;
        }
        
        /* ============================================
           MODO ALTO CONTRASTE (HERDADO DO CSS ORIGINAL)
           ============================================ */
        .contrast-dark .tool-card {
            background-color: #1a1a1a;
            border: 2px solid #ffffff;
        }
        
        .contrast-dark .tool-title {
            color: #ffffff;
        }
        
        .contrast-dark .tool-description {
            color: #d1d5db;
        }
        
        .contrast-dark .tool-card:hover .tool-title {
            color: #FFA500;
        }
        
        /* ============================================
           BOTÕES DE CONTROLE
           ============================================ */
        [data-sort],
        [data-view] {
            transition: all 0.2s ease;
        }
        
        [data-sort].active,
        [data-view].active {
            background-color: rgba(26, 62, 116, 0.1);
            border-color: #1A3E74;
        }
        
        /* ============================================
           ÁREA DE TOQUE MÍNIMA (MOBILE)
           ============================================ */
        @media (pointer: coarse) {
            .tool-card {
                min-height: 220px;
            }
            
            .card-link {
                padding: 0.5rem;
                margin: -0.5rem;
            }
        }
    `;

    // ============================================
    // ESTADO DA APLICAÇÃO
    // ============================================
    const appState = {
        searchTerm: "",
        filterCategory: "all",
        sortOrder: "az"
    };

    // ============================================
    // FUNÇÕES UTILITÁRIAS
    // ============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getActionButtonText(type) {
        const texts = {
            calculator: 'Calcular',
            scale: 'Classificar',
            other: 'Consultar'
        };
        return texts[type] || 'Acessar';
    }

    function generateCategoryTags(item, type) {
        const typeLabels = {
            calculator: 'Calculadora',
            scale: 'Escala',
            other: 'Informação'
        };
        
        const typeColors = {
            calculator: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
            scale: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
            other: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' }
        };
        
        const colors = typeColors[type] || typeColors.calculator;
        
        return `<span class="category-badge" style="background-color: ${colors.bg}; color: ${colors.text}">${escapeHtml(item.category)}</span>`;
    }

    function isHighlighted(item, options) {
        return options && options.filterCategory && 
               options.filterCategory !== 'all' && 
               item.category === options.filterCategory;
    }

    // ============================================
    // FUNÇÃO DE RENDERIZAÇÃO DE CARD
    // ============================================
    function renderCard(item, options = {}, type = 'calculator') {
        const isHighlightedCard = isHighlighted(item, options);
        const highlightClass = isHighlightedCard ? 'highlighted' : '';
        
        // Cores por tipo de ferramenta
        const typeColors = {
            calculator: { bg: 'rgba(59, 130, 246, 0.1)', icon: '#3b82f6' },
            scale: { bg: 'rgba(16, 185, 129, 0.1)', icon: '#10b981' },
            other: { bg: 'rgba(245, 158, 11, 0.1)', icon: '#f59e0b' }
        };
        
        const colors = typeColors[type] || typeColors.calculator;
        const actionText = getActionButtonText(type);
        const categoryTags = generateCategoryTags(item, type);
        
        return `
            <article class="tool-card ${highlightClass}" 
                     data-type="${type}" 
                     data-id="${item.id}"
                     tabindex="0"
                     role="article"
                     aria-label="Ferramenta: ${escapeHtml(item.name)}">
                <a href="pages/${item.filename}" 
                   class="card-link" 
                   aria-label="Acessar ${escapeHtml(item.name)}"></a>
                <div class="card-header">
                    <div class="card-icon-container" style="background-color: ${colors.bg}">
                        <i class="${item.icon} card-icon" style="color: ${colors.icon}" aria-hidden="true"></i>
                    </div>
                    ${categoryTags}
                </div>
                <div class="card-body">
                    <h3 class="tool-title">${escapeHtml(item.name)}</h3>
                    <p class="tool-description">${escapeHtml(item.description)}</p>
                </div>
                <div class="card-footer">
                    <span class="access-indicator" aria-hidden="true">
                        ${actionText}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </span>
                </div>
            </article>
        `;
    }

    // ============================================
    // MÓDULO DE CLASSIFICAÇÃO (SortManager)
    // ============================================
    const SortManager = (function() {
        let currentSortOrder = 'az';
        const sortOptions = ['az', 'za', 'category'];
        const STORAGE_KEY = 'sortPreference';

        function init() {
            loadSavedPreference();
            setupEventListeners();
        }

        function loadSavedPreference() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && sortOptions.includes(saved)) {
                currentSortOrder = saved;
            }
        }

        function savePreference() {
            localStorage.setItem(STORAGE_KEY, currentSortOrder);
        }

        function setupEventListeners() {
            document.querySelectorAll('[data-sort]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const sortValue = this.dataset.sort;
                    if (sortValue && sortOptions.includes(sortValue)) {
                        setSortOrder(sortValue);
                    }
                });
            });
            updateSortButtons();
        }

        function setSortOrder(order) {
            if (order === currentSortOrder) return;
            currentSortOrder = order;
            savePreference();
            updateSortButtons();
            document.dispatchEvent(new CustomEvent('sortChanged', { detail: { order: currentSortOrder } }));
        }

        function updateSortButtons() {
            document.querySelectorAll('[data-sort]').forEach(btn => {
                const isActive = btn.dataset.sort === currentSortOrder;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive);
            });
        }

        function sortItems(items) {
            return [...items].sort((a, b) => {
                switch (currentSortOrder) {
                    case 'az':
                        return a.name.localeCompare(b.name);
                    case 'za':
                        return b.name.localeCompare(a.name);
                    case 'category':
                        const catCompare = a.category.localeCompare(b.category);
                        if (catCompare !== 0) return catCompare;
                        return a.name.localeCompare(b.name);
                    default:
                        return 0;
                }
            });
        }

        function getCurrentOrder() {
            return currentSortOrder;
        }

        return {
            init,
            setSortOrder,
            getCurrentOrder,
            sortItems
        };
    })();

    // ============================================
    // MÓDULO DE ÍCONES (IconToggleManager)
    // ============================================
    const IconToggleManager = (function() {
        let iconsVisible = true;
        const STORAGE_KEY = 'iconsVisible';

        function init() {
            loadSavedState();
            setupEventListeners();
            applyCurrentState();
        }

        function loadSavedState() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                iconsVisible = saved === 'true';
            }
        }

        function saveState() {
            localStorage.setItem(STORAGE_KEY, iconsVisible.toString());
        }

        function setupEventListeners() {
            const toggleBtn = document.getElementById('toggle-icons-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', toggleIcons);
                updateButtonState();
            }
        }

        function toggleIcons() {
            iconsVisible = !iconsVisible;
            saveState();
            applyCurrentState();
            updateButtonState();
            document.dispatchEvent(new CustomEvent('iconsToggled', { detail: { visible: iconsVisible } }));
        }

        function applyCurrentState() {
            const cards = document.querySelectorAll('.tool-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    if (iconsVisible) {
                        card.classList.remove('icon-hidden');
                    } else {
                        card.classList.add('icon-hidden');
                    }
                }, index * 20);
            });
        }

        function updateButtonState() {
            const toggleBtn = document.getElementById('toggle-icons-btn');
            if (!toggleBtn) return;
            
            if (iconsVisible) {
                toggleBtn.innerHTML = '<i class="fas fa-eye" aria-hidden="true"></i>';
                toggleBtn.setAttribute('aria-pressed', 'false');
                toggleBtn.setAttribute('aria-label', 'Ocultar ícones dos cards');
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-eye-slash" aria-hidden="true"></i>';
                toggleBtn.setAttribute('aria-pressed', 'true');
                toggleBtn.setAttribute('aria-label', 'Mostrar ícones dos cards');
            }
            toggleBtn.classList.toggle('active', !iconsVisible);
        }

        function isVisible() {
            return iconsVisible;
        }

        function setVisible(visible) {
            if (iconsVisible !== visible) {
                toggleIcons();
            }
        }

        return {
            init,
            toggle: toggleIcons,
            setVisible,
            isVisible
        };
    })();

    // ============================================
    // MÓDULO DE VISUALIZAÇÃO (ViewModeManager)
    // ============================================
    const ViewModeManager = (function() {
        let currentViewMode = 'grid';
        const STORAGE_KEY = 'viewMode';
        const validModes = ['grid', 'list'];

        function init() {
            loadSavedState();
            setupEventListeners();
            applyCurrentState();
        }

        function loadSavedState() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && validModes.includes(saved)) {
                currentViewMode = saved;
            }
        }

        function saveState() {
            localStorage.setItem(STORAGE_KEY, currentViewMode);
        }

        function setupEventListeners() {
            document.querySelectorAll('[data-view]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const mode = this.dataset.view;
                    if (mode && validModes.includes(mode)) {
                        setViewMode(mode);
                    }
                });
            });
            updateViewButtons();
        }

        function setViewMode(mode) {
            if (mode === currentViewMode) return;
            currentViewMode = mode;
            saveState();
            applyCurrentState();
            updateViewButtons();
            document.dispatchEvent(new CustomEvent('viewModeChanged', { detail: { mode: currentViewMode } }));
        }

        function applyCurrentState() {
            const containers = document.querySelectorAll('[data-view-container]');
            containers.forEach(container => {
                validModes.forEach(mode => {
                    container.classList.remove(`view-${mode}`);
                });
                container.classList.add(`view-${currentViewMode}`);
            });
        }

        function updateViewButtons() {
            document.querySelectorAll('[data-view]').forEach(btn => {
                const isActive = btn.dataset.view === currentViewMode;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive);
            });
        }

        function getViewMode() {
            return currentViewMode;
        }

        return {
            init,
            setViewMode,
            getViewMode
        };
    })();

    // ============================================
    // FUNÇÕES DE RENDERIZAÇÃO
    // ============================================
    
    /**
     * Filtra e renderiza items para um container específico
     */
    function renderTools(containerType, itemType) {
        const container = document.getElementById(containerType + '-grid');
        if (!container) return;
        
        // Filtrar por tipo
        let filteredItems = toolsData.filter(function(item) {
            return item.type === itemType;
        });
        
        // Aplicar filtro de categoria
        if (appState.filterCategory !== 'all') {
            filteredItems = filteredItems.filter(function(item) {
                return item.category === appState.filterCategory;
            });
        }
        
        // Aplicar busca
        if (appState.searchTerm) {
            const searchLower = appState.searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(function(item) {
                return item.name.toLowerCase().includes(searchLower) ||
                       item.description.toLowerCase().includes(searchLower) ||
                       item.category.toLowerCase().includes(searchLower);
            });
        }
        
        // Aplicar ordenação usando SortManager
        filteredItems = SortManager.sortItems(filteredItems);
        
        // Renderizar
        if (filteredItems.length > 0) {
            container.innerHTML = filteredItems.map(function(item, index) {
                const cardHTML = renderCard(item, appState, itemType);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cardHTML;
                const cardElement = tempDiv.firstElementChild;
                cardElement.style.animationDelay = (index * 50) + 'ms';
                cardElement.classList.add('fade-in-up');
                return cardHTML;
            }).join('');
        } else {
            container.innerHTML = getEmptyStateHTML();
        }
    }
    
    /**
     * Retorna HTML para estado vazio
     */
    function getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Nenhuma ferramenta encontrada</h3>
                <p>Tente verificar os filtros ou categorias disponíveis.</p>
            </div>
        `;
    }
    
    /**
     * Renderiza todas as seções de ferramentas
     */
    function renderAllSections() {
        renderTools('calculadoras', 'calculator');
        renderTools('escalas', 'scale');
        renderTools('vacinas', 'other');
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Busca - não incluída conforme solicitado
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function init() {
        // Injetar estilos CSS
        const styleElement = document.createElement('style');
        styleElement.textContent = cssStyles;
        document.head.appendChild(styleElement);
        
        // Inicializar módulos
        SortManager.init();
        IconToggleManager.init();
        ViewModeManager.init();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Renderizar seções
        renderAllSections();
    }

    // Expor funções globalmente
    window.renderAllTools = renderAllSections;
    window.renderTools = renderTools;

    // Inicializar quando DOM estiver pronto
    if (typeof Utils !== 'undefined' && Utils.onReady) {
        Utils.onReady(function() {
            setTimeout(function() {
                const hasGrids = document.getElementById('calculadoras-grid') && 
                                document.getElementById('escalas-grid') && 
                                document.getElementById('vacinas-grid');
                if (hasGrids) {
                    init();
                }
            }, 100);
        });
    }

    document.addEventListener('ModulesLoaded', function() {
        setTimeout(init, 100);
    });

    // Inicialização automática
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 100);
        });
    } else {
        setTimeout(init, 100);
    }

})();
