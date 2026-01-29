/**
 * MÓDULO DE INTERFACE DO USUÁRIO
 */

window.UI_MODULE = {
    
    /**
     * Renderizar calculadora completa
     */
    renderCalculator(calculator) {
        if (!calculator) return '<p>Calculadora não encontrada</p>';
        
        return `
            <div class="card-base">
                <nav class="flex border-b border-slate-100 dark:border-slate-700">
                    <button class="tab-btn active" onclick="UI_MODULE.switchTab('calc')">Calculadora</button>
                    <button class="tab-btn" onclick="UI_MODULE.switchTab('sobre')">Sobre</button>
                    <button class="tab-btn" onclick="UI_MODULE.switchTab('ajuda')">Instruções</button>
                </nav>
                
                <div class="p-6 md:p-8">
                    <!-- Painel Calculadora -->
                    <div id="pane-calc" class="tab-pane active">
                        <h2 class="text-2xl font-bold text-nurse-primary mb-4">${calculator.name}</h2>
                        <p class="text-slate-600 dark:text-slate-300 mb-6">${calculator.description}</p>
                        
                        <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-6">
                            <h3 class="font-bold text-slate-700 dark:text-slate-300 mb-4">Parâmetros</h3>
                            <div id="dynamic-fields" class="space-y-4">
                                <!-- Campos serão injetados aqui -->
                            </div>
                        </div>
                        
                        <div class="flex gap-4">
                            <button onclick="NURSE_SYSTEM.calculate()" class="btn-primary-action flex-1">
                                <i class="fa-solid fa-calculator"></i> Calcular
                            </button>
                            <button onclick="NURSE_SYSTEM.resetForm()" class="btn-secondary-action">
                                <i class="fa-solid fa-rotate-left"></i>
                            </button>
                        </div>
                        
                        <div id="results-wrapper" class="hidden mt-8 pt-8 border-t border-slate-200">
                            <!-- Resultados serão exibidos aqui -->
                        </div>
                    </div>
                    
                    <!-- Painel Sobre -->
                    <div id="pane-sobre" class="tab-pane hidden">
                        <h2 class="text-2xl font-bold text-nurse-primary mb-4">Sobre</h2>
                        <div class="prose prose-slate dark:prose-invert">
                            <p>${calculator.description}</p>
                            ${calculator.formula ? `
                                <div class="mt-6">
                                    <h3 class="font-bold mb-2">Fórmula utilizada:</h3>
                                    <code class="block bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">${calculator.formula.calculation}</code>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Painel Instruções -->
                    <div id="pane-ajuda" class="tab-pane hidden">
                        <h2 class="text-2xl font-bold text-nurse-primary mb-4">Instruções</h2>
                        <div class="prose prose-slate dark:prose-invert">
                            <ol class="list-decimal pl-5 space-y-2">
                                ${(calculator.instructions || []).map(inst => `<li>${inst}</li>`).join('')}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Renderizar resultados do cálculo
     */
    renderResults(result, calculator) {
        if (!result || !calculator) return '<p>Nenhum resultado para exibir</p>';
        
        return `
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center border-2 border-dashed border-nurse-primary/20 mb-6">
                <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Resultado</p>
                <div class="text-5xl md:text-6xl font-bold text-nurse-primary dark:text-cyan-400 mb-2">
                    ${result.resultado ? this.formatNumber(result.resultado) : '0.00'}
                </div>
                <p class="text-lg font-bold text-nurse-secondary">
                    ${result.unidade || calculator.unit || ''}
                </p>
                ${result.warning ? `
                    <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p class="text-sm text-yellow-700 dark:text-yellow-300">
                            <i class="fa-solid fa-exclamation-triangle mr-2"></i>
                            ${result.warning}
                        </p>
                    </div>
                ` : ''}
            </div>
            
            <div class="flex gap-4 mb-6">
                <button onclick="NURSE_SYSTEM.generatePDF()" class="btn-primary-action flex-1">
                    <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                </button>
                <button onclick="NURSE_SYSTEM.copyResult()" class="btn-secondary-action">
                    <i class="fa-solid fa-copy"></i> Copiar
                </button>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-xl p-6">
                <h3 class="font-bold text-slate-700 dark:text-slate-300 mb-4">Detalhes do Cálculo</h3>
                <div class="space-y-3">
                    ${Object.entries(result)
                        .filter(([key]) => !['resultado', 'unidade', 'warning'].includes(key))
                        .map(([key, value]) => `
                            <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                                <span class="text-sm text-slate-600 dark:text-slate-400">${this.formatLabel(key)}</span>
                                <span class="font-medium">${value}</span>
                            </div>
                        `).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Formatar número
     */
    formatNumber(number) {
        if (typeof number !== 'number') return number;
        return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    },
    
    /**
     * Formatar label
     */
    formatLabel(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    },
    
    /**
     * Alternar entre abas
     */
    switchTab(tabId) {
        // Esconder todos os painéis
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.add('hidden');
            pane.classList.remove('active');
        });
        
        // Mostrar painel selecionado
        const pane = document.getElementById(`pane-${tabId}`);
        if (pane) {
            pane.classList.remove('hidden');
            pane.classList.add('active');
        }
        
        // Atualizar botões da aba
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick="UI_MODULE.switchTab('${tabId}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
};