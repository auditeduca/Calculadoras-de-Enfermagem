/**
 * MAIN_CONTENT_INJECTOR.JS
 * Injeta a interface da calculadora baseada no contexto da página.
 */
class MainContentInjector {
    constructor() {
        this.container = document.getElementById('dynamic-content');
        this.dataPath = 'data/content-calculators.json';
    }

    // Inicializa a injeção baseada no slug (ex: 'insulina')
    async inject(slug) {
        try {
            const data = await this.fetchCalculatorData(slug);
            if (!data) throw new Error("Dados da calculadora não encontrados.");

            const html = this.renderTemplate(data);
            this.container.innerHTML = html;

            // IMPORTANTE: Inicializa o motor de cálculo após a injeção
            if (window.CalculatorSystem && typeof window.CalculatorSystem.init === 'function') {
                window.CalculatorSystem.init();
            }
        } catch (error) {
            console.error("❌ Erro na injeção:", error);
        }
    }

    async fetchCalculatorData(slug) {
        const response = await fetch(this.dataPath);
        const allData = await response.json();
        // Assume que o JSON é um array ou objeto mapeado por slug
        return allData.find(item => item.slug === slug);
    }

    renderTemplate(data) {
        return `
            <div class="calculator-wrapper animate-fade-in bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                <header class="mb-6">
                    <h2 class="text-2xl font-black text-nurse-primary dark:text-cyan-400 font-nunito">${data.title}</h2>
                    <p class="text-slate-600 dark:text-slate-400 text-sm mt-2">${data.description}</p>
                </header>

                <div class="grid gap-6">
                    ${data.fields.map(field => `
                        <div class="form-group">
                            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">${field.label}</label>
                            <input type="${field.type}" 
                                   id="${field.id}" 
                                   placeholder="${field.placeholder}"
                                   class="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-nurse-secondary outline-none transition-all">
                        </div>
                    `).join('')}
                    
                    <button id="btn-calculate" class="w-full bg-nurse-primary hover:bg-nurse-accent text-white font-black py-4 rounded-2xl shadow-lg transition-transform active:scale-95">
                        Calcular Agora
                    </button>
                </div>

                <div id="result-container" class="mt-8 hidden">
                    </div>
            </div>
        `;
    }
}

// Expõe globalmente
window.MainContentInjector = new MainContentInjector();