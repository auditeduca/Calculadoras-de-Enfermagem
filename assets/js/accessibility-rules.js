/**
 * REGRA DE ACESSIBILIDADE - COMPORTAMENTO OPT-IN
 * ===============================================
 * 
 * Princípio: Os recursos de acessibilidade NÃO DEVEM afetar o CSS, JS e HTML
 * dos módulos (Header, Footer, Main Content) sem que o usuário ative
 * explicitamente cada recurso.
 * 
 * Implementação: Sistema de carregamento manual sob demanda (on-demand)
 * 
 * REGRAS FUNDAMENTAIS:
 * 
 * 1. CARREGAMENTO MANUAL (Não automátio)
 *    - Recursos de acessibilidade são carregados APENAS quando o usuário
 *      clica em um botão/card de acessibilidade ou usa um atalho de teclado
 *    - A função loadSavedState() NÃO é chamada automaticamente na inicialização
 *    - Estado salvo no localStorage é ignorado até que o usuário interaja
 * 
 * 2. EXCLUSIVIDADE DE IMPACTO
 *    - Cada recurso de acessibilidade afeta apenas seu escopo específico
 *    - Fontes especiais não afetam elementos do painel de acessibilidade
 *    - Filtros de daltonismo não afetam o painel de acessibilidade
 *    - Modo de leitura não oculta elementos críticos de UI
 * 
 * 3. ISOLAMENTO DE MÓDULOS
 *    - Header: Mantém seus estilos originais independente de recursos ativos
 *    - Footer: Mantém seus estilos originais independente de recursos ativos
 *    - Main Content: Pode ser modificado, mas não afeta outros módulos
 *    - Widgets de acessibilidade: Sempre visíveis e funcionais
 * 
 * 4. PERSISTÊNCIA DE ESTADO (Sob demanda)
 *    - Estado é salvo APENAS após interação explícita do usuário
 *    - Não há restauração automática na carga da página
 *    - Usuário pode carregar estado anterior através de menu de configurações
 * 
 * CLASSES CSS QUE NÃO AFETAM MÓDULOS:
 * 
 * isolar por seletor:
 * - body.font-atkinson *:not(#accessibility-panel):not(#accessibility-panel *)
 * - body.font-newsreader *:not(#accessibility-panel):not(#accessibility-panel *)
 * - body.font-opendyslexic *:not(#accessibility-panel):not(#accessibility-panel *)
 * - body.deuteranopia #accessibility-panel { filter: none; }
 * - body.protanopia #accessibility-panel { filter: none; }
 * - body.tritanopia #accessibility-panel { filter: none; }
 * 
 * FLUXO DE FUNCIONAMENTO:
 * 
 * 1. Página carrega → NENHUM recurso de acessibilidade está ativo
 * 2. Usuário clica em "Aumentar Fonte" → Fonte aumenta
 * 3. Estado é salvo no localStorage
 * 4. Usuário sai da página e retorna → Fonte volta ao normal
 * 5. Usuário pode restaurar configurações anteriores se desejar
 * 
 * IMPLEMENTAÇÃO NO CÓDIGO:
 * 
 * - init(): Remove chamada loadSavedState()
 * - cycleFeature(): Aplica recurso APENAS após clique do usuário
 * - toggleSimple(): Aplica recurso APENAS após clique do usuário
 * - toggleTTSClick(): Aplica recurso APENAS após clique do usuário
 * - restoreFromStorage(): Nova função opcional para carregar estado anterior
 * 
 * ACESSIBILIDADE WEB (WCAG 2.1):
 * 
 * - 1.3.1 Info and Relationships: Estrutura mantida mesmo com recursos ativos
 * - 1.4.1 Use of Color: Recursos não dependem apenas de cores
 * - 1.4.3 Contrast (Minimum): Contraste mantido em todos os modos
 * - 2.1.1 Keyboard: Todos os recursos acessíveis por teclado
 * - 2.2.2 Pause, Stop, Hide: Controles disponíveis para todos os recursos
 * - 2.4.7 Focus Visible: Foco sempre visível independente de configurações
 */

const AccessibilityRule = {
    // Verifica se o usuário interagiu com a página
    userHasInteracted: false,
    
    // Flag para controlar se estado deve ser restaurado
    shouldRestoreState: false,
    
    /**
     * Ativa flag de interação do usuário
     * Deve ser chamada em todos os handlers de clique e teclado
     */
    markUserInteraction() {
        this.userHasInteracted = true;
    },
    
    /**
     * Carrega estado salvo APENAS se usuário permitiu
     * @param {Function} loadFn - Função que carrega o estado
     */
    conditionalRestore(loadFn) {
        if (this.shouldRestoreState && this.userHasInteracted) {
            loadFn();
        }
    },
    
    /**
     * Ativa restauração automática de estado
     * Usuário deve habilitar isso explicitamente nas configurações
     */
    enableAutoRestore() {
        this.shouldRestoreState = true;
        localStorage.setItem('acc_auto_restore', 'true');
    },
    
    /**
     * Desativa restauração automática de estado
     */
    disableAutoRestore() {
        this.shouldRestoreState = false;
        localStorage.setItem('acc_auto_restore', 'false');
    },
    
    /**
     * Inicializa a regra verificando preferências salvas
     */
    init() {
        const autoRestore = localStorage.getItem('acc_auto_restore');
        this.shouldRestoreState = autoRestore === 'true';
    }
};

// Inicializar regra
AccessibilityRule.init();
