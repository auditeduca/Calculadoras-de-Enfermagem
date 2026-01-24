/**
 * Component Loader v5.0 (Strict Sequence)
 * Garante a visibilidade e funcionamento dos módulos.
 * Sequência: 
 * 1. Injeta HTML (Header/Footer/Accessibility)
 * 2. Carrega EventBus (Núcleo de comunicação)
 * 3. Carrega Scripts de UI (Menus e Acessibilidade)
 */

document.addEventListener("DOMContentLoaded", async function() {
    console.log("🚀 Iniciando carregamento de módulos...");

    // Passo 1: Injeção do HTML (Containers devem existir no DOM)
    try {
        await Promise.all([
            injectComponent('accessibility-container', 'assets/components/accessibility-v4.html'),
            injectComponent('header-container', 'assets/components/header-v4.html'),
            injectComponent('footer-container', 'assets/components/footer-v4.html')
        ]);
        console.log("✅ HTML dos componentes injetado.");
    } catch (e) {
        console.error("❌ Erro ao injetar HTML:", e);
    }

    // Passo 2: Carregar Scripts na Ordem Correta (Sequencial)
    try {
        // Primeiro o EventBus (Obrigatório para comunicação entre módulos)
        await loadScript('assets/js/event-bus-v4.js');
        console.log("✅ EventBus carregado.");

        // Depois os scripts que dependem do HTML já injetado
        // Usamos Promise.all para carregar scripts de UI em paralelo após o EventBus
        await Promise.all([
            loadScript('assets/js/accessibility-v4.js'),
            loadScript('assets/js/header-v4.js'),
            loadScript('assets/js/footer-v4.js')
        ]);
        console.log("✅ Scripts de UI carregados e inicializados.");
        
        // Dispara evento global de "Tudo Pronto" caso algum script precise
        document.dispatchEvent(new Event('components-loaded'));

    } catch (e) {
        console.error("❌ Erro ao carregar scripts:", e);
    }
});

// Função auxiliar para injetar HTML
async function injectComponent(containerId, url) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`⚠️ Container ID '${containerId}' não encontrado.`);
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        container.innerHTML = html;
        // Garante que o container esteja visível
        container.style.display = 'block'; 
    } catch (error) {
        console.error(`Falha ao carregar ${url}:`, error);
        container.innerHTML = `<div class="p-2 text-red-600 text-xs bg-red-50">Erro ao carregar módulo.</div>`;
    }
}

// Função auxiliar para carregar JS dinamicamente
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true; // Garante execução ordenada se possível
        script.onload = () => resolve(src);
        script.onerror = () => reject(new Error(`Erro ao carregar script: ${src}`));
        document.body.appendChild(script);
    });
}