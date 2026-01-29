const UI = {
    renderAuthor() {
        const container = document.getElementById('author-container');
        container.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-xl">
                <img src="assets/images/author-info.webp" class="w-32 md:w-40 shadow-2xl rounded-3xl object-cover border-4 border-white dark:border-slate-700"/>
                <div class="text-center md:text-left">
                    <h3 class="text-2xl font-black mb-3 text-nurse-primary dark:text-cyan-400 font-nunito">Calculadoras de Enfermagem Profissional</h3>
                    <p class="text-slate-600 dark:text-slate-300 italic text-lg leading-relaxed max-w-2xl font-inter">
                        "A precisão técnica é a expressão máxima do cuidado ético ao paciente."
                    </p>
                </div>
            </div>
        `;
    },

    renderTags(tags) {
        const container = document.getElementById('tags-container');
        const html = tags.map(tag => `
            <span onclick="CORE.filterByTag('${tag}')" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 rounded-lg text-[11px] font-bold hover:bg-nurse-accent hover:text-white transition-all cursor-pointer">
                #${tag}
            </span>
        `).join('');
        container.innerHTML = `<span class="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center"><i class="fa-solid fa-tags mr-2"></i> Tópicos:</span> ${html}`;
    },

    renderActionButtons() {
        const container = document.getElementById('action-buttons-container');
        container.innerHTML = `
            <button onclick="CORE.generatePDF()" class="bg-nurse-primary text-white py-4 rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-2"><i class="fa-solid fa-file-pdf"></i> PDF</button>
            <button onclick="CORE.copyResult()" class="bg-slate-200 dark:bg-slate-700 py-4 rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-2"><i class="fa-solid fa-copy"></i> Copiar</button>
        `;
    }
};