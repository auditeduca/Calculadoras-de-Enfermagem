/**
 * Diagnóstico de Integridade de Dados
 */
async function runAdvancedDiagnostic() {
    console.group("%c 🏥 DIAGNÓSTICO DE DADOS CLÍNICOS ", "background: #0284c7; color: white; font-size: 14px; padding: 4px; border-radius: 4px;");

    // Mapeamento dos recursos esperados no SYSTEM.data
    const resources = {
        content: { 
            url: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/content-calculators.json',
            expectedType: 'object'
        },
        ipsg: { 
            url: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/IPSG.json',
            expectedType: 'object'
        },
        rightForm: { 
            url: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/Right_Form.json',
            expectedType: 'object'
        },
        shared: { 
            url: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/shared-components.json',
            expectedType: 'object'
        },
        calculators: { 
            url: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/nursing_calculators.json',
            expectedType: 'object'
        },
        nanda: { 
            url: 'nanda.json', 
            expectedType: 'array'
        },
        modal: { 
            url: 'modal-content.json', 
            expectedType: 'object'
        }
    };

    let report = [];
    let globalSuccess = true;

    const analyzeContent = (data) => {
        if (!data) return { valid: false, summary: "Nulo/Undefined" };
        if (Array.isArray(data)) {
            return {
                valid: data.length > 0,
                type: 'Array',
                count: data.length,
                summary: `Lista com ${data.length} itens`
            };
        }
        if (typeof data === 'object') {
            const keys = Object.keys(data);
            return {
                valid: keys.length > 0,
                type: 'Object',
                count: keys.length,
                summary: `Objeto (${keys.length} chaves)`
            };
        }
        return { valid: false, summary: "Formato desconhecido" };
    };

    for (const [key, config] of Object.entries(resources)) {
        let status = {
            Recurso: key,
            HTTP: "⏳",
            "JSON Válido": "❌",
            "Ingestão (SYSTEM)": "❌",
            "Resumo Conteúdo": "-",
            Tempo: "0ms"
        };

        const startTime = performance.now();

        try {
            const response = await fetch(config.url);
            const endTime = performance.now();
            status.Tempo = (endTime - startTime).toFixed(2) + "ms";

            if (response.ok) {
                status.HTTP = "✅ 200 OK";
                const jsonData = await response.json();
                const analysis = analyzeContent(jsonData);
                
                if (analysis.valid) {
                    status["JSON Válido"] = "✅ Sim";
                    status["Resumo Conteúdo"] = analysis.summary;
                } else {
                    status["JSON Válido"] = "⚠️ Vazio";
                    globalSuccess = false;
                }

                if (window.SYSTEM && window.SYSTEM.data && window.SYSTEM.data[key]) {
                    const memoryAnalysis = analyzeContent(window.SYSTEM.data[key]);
                    if (memoryAnalysis.valid) {
                        status["Ingestão (SYSTEM)"] = "✅ Carregado";
                    } else {
                        status["Ingestão (SYSTEM)"] = "⚠️ Vazio na Memória";
                        globalSuccess = false;
                    }
                } else {
                    status["Ingestão (SYSTEM)"] = "❌ Não encontrado";
                }
            } else {
                status.HTTP = `❌ ${response.status}`;
                globalSuccess = false;
            }
        } catch (error) {
            status.HTTP = "❌ Erro Rede";
            status["Resumo Conteúdo"] = error.message;
            globalSuccess = false;
        }
        report.push(status);
    }

    console.table(report);

    if (globalSuccess) {
        console.log("%c SUCESSO TOTAL: Dados verificados. ", "background: #22c55e; color: white; font-weight: bold; padding: 4px;");
        if (window.SYSTEM && window.SYSTEM.notify) window.SYSTEM.notify("Diagnóstico: OK", "success");
    } else {
        console.log("%c FALHA NO DIAGNÓSTICO. ", "background: #ef4444; color: white; font-weight: bold; padding: 4px;");
        if (window.SYSTEM && window.SYSTEM.notify) window.SYSTEM.notify("Erro nos dados JSON", "error");
    }
    console.groupEnd();
}

// Execução: Aguarda o evento de load e dá um tempo para o SYSTEM.init terminar
window.addEventListener('load', () => {
    setTimeout(runAdvancedDiagnostic, 2000);
});