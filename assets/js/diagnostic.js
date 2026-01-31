/**
 * Diagnóstico de Integridade de Dados - Versão Corrigida
 * Foco: Validar por que o SYSTEM.data está vazio e corrigir caminhos 404.
 */
async function runAdvancedDiagnostic() {
    console.group("%c 🏥 RELATÓRIO DE SAÚDE DOS DADOS ", "background: #1A3E74; color: white; font-size: 14px; padding: 4px; border-radius: 4px;");

    const baseUrl = 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/';
    
    // Caminhos corrigidos baseados na estrutura do seu repositório
    const resources = {
        content: { url: baseUrl + 'content-calculators.json' },
        ipsg: { url: baseUrl + 'IPSG.json' },
        rightForm: { url: baseUrl + 'Right_Form.json' },
        shared: { url: baseUrl + 'shared-components.json' },
        calculators: { url: baseUrl + 'nursing_calculators.json' },
        nanda: { url: baseUrl + 'nanda.json' },
        modal: { url: baseUrl + 'modal-content.json' }
    };

    let report = [];
    let globalSuccess = true;

    const analyze = (data) => {
        if (!data) return { valid: false, text: "Vazio/Nulo" };
        const size = Array.isArray(data) ? data.length : Object.keys(data).length;
        return { valid: size > 0, text: `${Array.isArray(data) ? 'Array' : 'Objeto'} (${size})` };
    };

    for (const [key, config] of Object.entries(resources)) {
        let status = {
            Arquivo: key,
            URL_Status: "⏳",
            Conteudo_Remoto: "❌",
            No_SYSTEM_Data: "❌",
            Detalhes: "-"
        };

        try {
            const res = await fetch(config.url);
            if (res.ok) {
                status.URL_Status = "✅ 200 OK";
                const json = await res.json();
                const remoteInfo = analyze(json);
                status.Conteudo_Remoto = remoteInfo.valid ? "✅ " + remoteInfo.text : "⚠️ Vazio";

                // Verificação de Ingestão (Onde o problema foi detectado no seu console)
                if (window.SYSTEM && window.SYSTEM.data) {
                    const localData = window.SYSTEM.data[key];
                    if (localData) {
                        const localInfo = analyze(localData);
                        status.No_SYSTEM_Data = localInfo.valid ? "✅ " + localInfo.text : "⚠️ Vazio";
                    } else {
                        status.No_SYSTEM_Data = "❌ Não Injetado";
                        globalSuccess = false;
                    }
                } else {
                    status.No_SYSTEM_Data = "❌ SYSTEM não existe";
                    globalSuccess = false;
                }
            } else {
                status.URL_Status = `❌ ${res.status} (Erro)`;
                globalSuccess = false;
            }
        } catch (e) {
            status.URL_Status = "❌ Erro Conexão";
            status.Detalhes = e.message;
            globalSuccess = false;
        }
        report.push(status);
    }

    console.table(report);

    // Diagnóstico Educativo
    if (!globalSuccess) {
        console.warn("%c DICA DE CORREÇÃO: ", "font-weight: bold; color: orange;");
        console.log("1. Se 'Conteudo_Remoto' está ✅ mas 'No_SYSTEM_Data' está ❌:");
        console.log("   -> O arquivo existe na web, mas o seu código init() não está salvando o resultado no objeto SYSTEM.data.");
        console.log("2. Se 'URL_Status' está 404:");
        console.log("   -> O arquivo não existe no caminho especificado (verifique se nanda.json está na pasta /data/).");
    }

    console.groupEnd();
}

// Inicia o processo
window.addEventListener('load', () => {
    // Aguarda 3 segundos para dar tempo do SYSTEM.init() preencher os dados
    setTimeout(runAdvancedDiagnostic, 3000);
});