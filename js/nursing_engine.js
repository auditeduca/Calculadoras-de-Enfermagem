/**
 * SISTEMA INTEGRADO DE AUDITORIA E ACESSIBILIDADE
 * Autor: Leivis - Calculadoras de Enfermagem
 */

const APP_ENGINE = {
    // Banco de dados de Tags (Pode ser movido para o JSON se preferir)
    globalTags: ["Enfermagem", "Segurança do Paciente", "Auditoria Clínica", "Insulina", "Farmacologia"],

    async init() {
        this.renderAuthor();
        this.renderTags();
        this.renderSidebar();
        // ... outras inicializações (AdSense, etc)
    },

    // --- MÓDULO DE VOZ (FEEDBACKS DE SISTEMA) ---
    speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel(); // Interrompe falas anteriores
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.1; 
        window.speechSynthesis.speak(utterance);
    },

    // --- MÓDULO AUTOR (REUTILIZÁVEL) ---
    renderAuthor() {
        const container = document.getElementById('author-container');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-xl">
                <div class="relative flex-shrink-0">
                    <img src="https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/author-info.webp" 
                         alt="Autor Profissional" class="w-32 md:w-40 shadow-2xl border-4 border-white dark:border-slate-700 rounded-3xl object-cover"/>
                    <div class="absolute -bottom-2 -right-2 bg-nurse-secondary text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-lg">
                        <i class="fa-solid fa-check text-[10px]"></i>
                    </div>
                </div>
                <div class="text-center md:text-left">
                    <h3 class="text-2xl font-black mb-3 text-nurse-primary dark:text-cyan-400 font-nunito">Calculadoras de Enfermagem Profissional</h3>
                    <p class="text-slate-600 dark:text-slate-300 italic text-lg leading-relaxed max-w-2xl font-inter">
                        "A precisão técnica é a expressão máxima do cuidado ético ao paciente. Transformamos dados em segurança clínica."
                    </p>
                </div>
            </div>
        `;
    },

    // --- MÓDULO TAGS (DINÂMICO) ---
    renderTags() {
        const container = document.getElementById('tags-container');
        if (!container) return;

        const tagsHTML = this.globalTags.map(tag => `
            <span onclick="APP_ENGINE.handleTagClick('${tag}')" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 rounded-lg text-[11px] font-bold hover:bg-nurse-accent hover:text-white transition-all cursor-pointer">
                #${tag}
            </span>
        `).join('');

        container.innerHTML = `<span class="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center"><i class="fa-solid fa-tags mr-2"></i> Tópicos:</span> ${tagsHTML}`;
    },

    handleTagClick(tag) {
        this.speak(`Filtrando por ${tag}`);
        window.location.href = `busca.html?tag=${tag}`;
    },

    // --- FEEDBACKS DE AÇÕES (PDF, CÓPIA, CÁLCULO) ---
    async generatePDF() {
        this.speak("Iniciando processamento do relatório de auditoria.");
        
        // Simulação de delay de processamento para feedback
        setTimeout(async () => {
            try {
                // ... lógica existente do html2canvas e jspdf ...
                this.speak("PDF gerado com sucesso. O download foi iniciado.");
                this.notify("Documento exportado!");
            } catch (e) {
                this.speak("Erro ao gerar PDF. Tente novamente.");
            }
        }, 500);
    },

    copyToClipboard() {
        const text = "Dados do Cálculo..."; // Lógica para pegar o resultado
        navigator.clipboard.writeText(text).then(() => {
            this.speak("Registro de auditoria copiado para a área de transferência.");
            this.notify("Copiado!");
        });
    },

    calculate() {
        // Validação com Feedback de Voz
        const inputs = document.querySelectorAll('.input-field');
        let empty = false;
        
        inputs.forEach(i => {
            if (!i.value) {
                i.classList.add('border-red-500', 'bg-red-50');
                empty = true;
            }
        });

        if (empty) {
            this.speak("Erro. Existem campos obrigatórios não preenchidos.");
            return;
        }

        this.speak("Calculando dose auditada.");
        // ... lógica do cálculo ...
    }
};

window.addEventListener('DOMContentLoaded', () => APP_ENGINE.init());