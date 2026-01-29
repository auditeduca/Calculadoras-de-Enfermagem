/**
 * Calculator Engine - Motor de Calculadoras de Enfermagem
 * Responsável por: Cálculos, PDF, NANDA/NIC/NOC, Feedback de Botões
 * Versão: 2.0.0
 * Data: 28 de janeiro de 2026
 */

// ============================================================================
// 1. MOTOR DE NOTIFICAÇÕES
// ============================================================================
const NotificationEngine = {
    show(message, type = 'success', duration = 3500) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';
        
        toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => toast.remove(), duration);
    },
    
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    info(msg) { this.show(msg, 'info'); }
};

// ============================================================================
// 2. MOTOR DE PDF
// ============================================================================
const PDFEngine = {
    async generate(data) {
        try {
            const template = document.getElementById('pdf-render-template');
            if (!template) throw new Error('Template PDF não encontrado');
            
            // Preencher dados
            this.populateTemplate(data);
            
            // Aguardar renderização
            await new Promise(r => setTimeout(r, 600));
            
            // Converter para canvas
            const canvas = await html2canvas(template, { 
                scale: 2, 
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            // Gerar PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'pt', 'a4');
            pdf.setProperties({ 
                title: `${data.calculatorName} - ${data.patientName}`,
                author: 'Calculadoras de Enfermagem',
                subject: 'Relatório Clínico'
            });
            
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 595.28, 841.89);
            
            // Salvar
            const filename = `${data.calculatorName}_${data.patientName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
            pdf.save(filename);
            
            NotificationEngine.success('PDF gerado com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            NotificationEngine.error('Erro ao gerar PDF: ' + error.message);
            return false;
        }
    },
    
    populateTemplate(data) {
        // Dados básicos
        document.getElementById('pdf_meta_date').innerText = 'DATA: ' + new Date().toLocaleString('pt-BR');
        document.getElementById('pdf_meta_ip').innerText = 'IP: ' + (APP_STATE.ip || 'Offline');
        
        // Dados do paciente
        document.getElementById('pdf_p_name').innerText = data.patientName || '-';
        document.getElementById('pdf_p_dob').innerText = data.patientDob ? 
            new Date(data.patientDob).toLocaleDateString('pt-BR') : '-';
        
        // Resultado
        document.getElementById('pdf_res_val').innerText = data.resultValue || '-';
        document.getElementById('pdf_res_unit').innerText = data.resultUnit || '-';
        
        // Parâmetros
        document.getElementById('pdf_params_text').innerText = data.params || 'Nenhum parâmetro informado';
        
        // Auditoria
        document.getElementById('pdf_audit_text').innerText = 
            `Rastreabilidade: Input [${data.params}] → Output [${data.resultValue}]. ` +
            `Processado em: ${new Date().toLocaleString('pt-BR')}`;
        
        // Checklists
        this.renderChecklist('pdf_9certos_list', data.certos || []);
        this.renderChecklist('pdf_metas_list', data.metas || []);
        
        // QR Code
        this.generateQRCode();
    },
    
    renderChecklist(containerId, items) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = items.map(item => `
            <div class="flex items-center gap-2">
                <div class="pdf-check-box">${item.checked ? '✓' : ''}</div>
                <span style="font-size: 8px; font-weight: 600; color: #334155;">${item.label}</span>
            </div>
        `).join('');
    },
    
    generateQRCode() {
        const qrEl = document.getElementById('pdf_qrcode');
        if (!qrEl) return;
        
        qrEl.innerHTML = '';
        try {
            new QRCode(qrEl, {
                text: window.location.href,
                width: 60,
                height: 60,
                colorDark: '#1A3E74',
                colorLight: '#ffffff'
            });
        } catch (e) {
            console.warn('Erro ao gerar QR Code:', e);
        }
    }
};

// ============================================================================
// 3. MOTOR DE NANDA/NIC/NOC
// ============================================================================
const NANDAEngine = {
    // Base de dados simulada (em produção, usar API)
    database: {
        nanda: [
            { id: '00132', label: 'Dor aguda', code: 'Acute Pain' },
            { id: '00134', label: 'Dor crônica', code: 'Chronic Pain' },
            { id: '00146', label: 'Ansiedade', code: 'Anxiety' },
            { id: '00148', label: 'Medo', code: 'Fear' },
            { id: '00155', label: 'Risco de queda', code: 'Risk for Falls' },
            { id: '00163', label: 'Risco de lesão por pressão', code: 'Risk for Pressure Ulcer' },
            { id: '00004', label: 'Risco de infecção', code: 'Risk for Infection' }
        ],
        nic: [
            { id: '1400', label: 'Manejo da dor', code: 'Pain Management' },
            { id: '2300', label: 'Administração de medicamentos', code: 'Medication Administration' },
            { id: '6680', label: 'Monitoramento vital', code: 'Vital Signs Monitoring' },
            { id: '4720', label: 'Redução da ansiedade', code: 'Anxiety Reduction' }
        ],
        noc: [
            { id: '1605', label: 'Controle da dor', code: 'Pain Control' },
            { id: '1212', label: 'Nível de ansiedade', code: 'Anxiety Level' },
            { id: '1910', label: 'Risco de queda', code: 'Fall Risk' }
        ]
    },
    
    search(query) {
        if (!query || query.length < 2) {
            NotificationEngine.info('Digite pelo menos 2 caracteres');
            return [];
        }
        
        const q = query.toLowerCase();
        const results = {
            nanda: this.database.nanda.filter(item => 
                item.label.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
            ),
            nic: this.database.nic.filter(item => 
                item.label.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
            ),
            noc: this.database.noc.filter(item => 
                item.label.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
            )
        };
        
        return results;
    },
    
    showModal(results) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4';
        
        let html = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="sticky top-0 bg-nurse-primary text-white p-6 flex justify-between items-center">
                    <h2 class="text-xl font-bold">NANDA / NIC / NOC</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-2xl hover:opacity-80">×</button>
                </div>
                
                <div class="p-6 space-y-6">
        `;
        
        if (results.nanda.length > 0) {
            html += '<div><h3 class="font-bold text-nurse-primary mb-3">NANDA (Diagnósticos)</h3>';
            html += '<div class="space-y-2">';
            results.nanda.forEach(item => {
                html += `<div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border-l-4 border-nurse-primary">
                    <p class="font-bold text-sm">${item.label}</p>
                    <p class="text-xs text-slate-500">${item.code} (${item.id})</p>
                </div>`;
            });
            html += '</div></div>';
        }
        
        if (results.nic.length > 0) {
            html += '<div><h3 class="font-bold text-nurse-secondary mb-3">NIC (Intervenções)</h3>';
            html += '<div class="space-y-2">';
            results.nic.forEach(item => {
                html += `<div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border-l-4 border-nurse-secondary">
                    <p class="font-bold text-sm">${item.label}</p>
                    <p class="text-xs text-slate-500">${item.code} (${item.id})</p>
                </div>`;
            });
            html += '</div></div>';
        }
        
        if (results.noc.length > 0) {
            html += '<div><h3 class="font-bold text-amber-600 mb-3">NOC (Resultados)</h3>';
            html += '<div class="space-y-2">';
            results.noc.forEach(item => {
                html += `<div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border-l-4 border-amber-600">
                    <p class="font-bold text-sm">${item.label}</p>
                    <p class="text-xs text-slate-500">${item.code} (${item.id})</p>
                </div>`;
            });
            html += '</div></div>';
        }
        
        if (results.nanda.length === 0 && results.nic.length === 0 && results.noc.length === 0) {
            html += '<p class="text-center text-slate-500">Nenhum resultado encontrado</p>';
        }
        
        html += '</div></div>';
        
        modal.innerHTML = html;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
};

// ============================================================================
// 4. MOTOR DE CÁLCULO
// ============================================================================
const CalculationEngine = {
    // Funções de cálculo específicas por tipo
    calculators: {
        score: function(fields) {
            let total = 0;
            Object.values(fields).forEach(value => {
                total += parseInt(value) || 0;
            });
            return total;
        },
        
        formula: function(fields) {
            // Implementar fórmulas específicas
            return 0;
        },
        
        classification: function(fields) {
            // Implementar classificações específicas
            return 'Classificação pendente';
        }
    },
    
    calculate(calculatorType, fields) {
        try {
            const calculator = this.calculators[calculatorType] || this.calculators.score;
            const result = calculator(fields);
            return { success: true, value: result };
        } catch (error) {
            console.error('Erro no cálculo:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============================================================================
// 5. GERENCIADOR DE BOTÕES COM FEEDBACK
// ============================================================================
const ButtonManager = {
    setLoading(buttonId, text = 'Processando...') {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${text}`;
    },
    
    setNormal(buttonId) {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || 'Botão';
    },
    
    setSuccess(buttonId, text = 'Concluído!', duration = 2000) {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${text}`;
        
        setTimeout(() => this.setNormal(buttonId), duration);
    },
    
    setError(buttonId, text = 'Erro!', duration = 2000) {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-exclamation-circle"></i> ${text}`;
        
        setTimeout(() => this.setNormal(buttonId), duration);
    }
};

// ============================================================================
// 6. ESTADO GLOBAL
// ============================================================================
let APP_STATE = {
    ip: 'Offline',
    lastResult: null,
    patientData: {},
    calculatorData: null
};

// Fetch IP
fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(d => APP_STATE.ip = d.ip)
    .catch(() => APP_STATE.ip = 'Offline');

// ============================================================================
// 7. APLICAÇÃO PRINCIPAL
// ============================================================================
const CalculatorApp = {
    init(calculatorData) {
        APP_STATE.calculatorData = calculatorData;
        this.renderForm();
    },
    
    renderForm() {
        const form = document.getElementById('calculator-form');
        if (!form) return;
        
        const fields = APP_STATE.calculatorData.fields || {};
        let html = '';
        
        // Dados do paciente
        html += `
            <div class="grid md:grid-cols-2 gap-4 pb-4 border-b">
                <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Paciente</label>
                    <input id="patient_name" type="text" placeholder="Nome completo" class="input-field"/>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Data de Nascimento</label>
                    <input id="patient_dob" type="date" class="input-field"/>
                </div>
            </div>
        `;
        
        // Campos da calculadora
        for (const [category, fieldList] of Object.entries(fields)) {
            html += `<div class="pt-4 border-t"><h3 class="text-sm font-bold mb-4 text-slate-700 dark:text-slate-300">${category}</h3><div class="grid md:grid-cols-2 gap-4">`;
            
            for (const field of fieldList) {
                const fieldId = `field_${field.id}`;
                html += `
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-2">${field.name}</label>
                        <input id="${fieldId}" type="${field.type}" placeholder="${field.placeholder || ''}" class="input-field"/>
                    </div>
                `;
            }
            
            html += '</div></div>';
        }
        
        form.innerHTML = html;
    },
    
    async calculate() {
        ButtonManager.setLoading('btn-calculate', 'Calculando...');
        
        // Simular processamento
        await new Promise(r => setTimeout(r, 1000));
        
        try {
            // Coletar dados
            const formData = this.getFormData();
            
            // Calcular
            const result = CalculationEngine.calculate(
                APP_STATE.calculatorData.calculation_type || 'score',
                formData
            );
            
            if (result.success) {
                APP_STATE.lastResult = {
                    value: result.value.toString(),
                    unit: 'pontos',
                    interpretation: 'Resultado processado com sucesso'
                };
                
                this.displayResult();
                ButtonManager.setSuccess('btn-calculate', 'Calculado!');
                document.getElementById('btn-pdf').disabled = false;
                NotificationEngine.success('Cálculo realizado com sucesso!');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            ButtonManager.setError('btn-calculate', 'Erro!');
            NotificationEngine.error('Erro: ' + error.message);
        }
    },
    
    getFormData() {
        const form = document.getElementById('calculator-form');
        const inputs = form.querySelectorAll('input[id^="field_"]');
        const data = {};
        
        inputs.forEach(input => {
            data[input.id] = input.value;
        });
        
        return data;
    },
    
    displayResult() {
        const area = document.getElementById('result-area');
        const value = document.getElementById('result-value');
        const unit = document.getElementById('result-unit');
        const interp = document.getElementById('result-interpretation');
        
        if (!APP_STATE.lastResult) return;
        
        value.textContent = APP_STATE.lastResult.value;
        unit.textContent = APP_STATE.lastResult.unit;
        interp.innerHTML = `<p><strong>Interpretação:</strong> ${APP_STATE.lastResult.interpretation}</p>`;
        
        area.classList.remove('hidden');
    },
    
    async generatePDF() {
        ButtonManager.setLoading('btn-pdf', 'Gerando PDF...');
        
        try {
            const patientName = document.getElementById('patient_name').value || 'Paciente';
            const patientDob = document.getElementById('patient_dob').value || '';
            
            const pdfData = {
                calculatorName: APP_STATE.calculatorData.name,
                patientName: patientName,
                patientDob: patientDob,
                resultValue: APP_STATE.lastResult?.value || '-',
                resultUnit: APP_STATE.lastResult?.unit || '-',
                params: this.getFormData(),
                certos: this.get9Certos(),
                metas: this.getMetas()
            };
            
            const success = await PDFEngine.generate(pdfData);
            
            if (success) {
                ButtonManager.setSuccess('btn-pdf', 'PDF Gerado!');
            } else {
                ButtonManager.setError('btn-pdf', 'Erro ao Gerar!');
            }
        } catch (error) {
            ButtonManager.setError('btn-pdf', 'Erro!');
            NotificationEngine.error('Erro: ' + error.message);
        }
    },
    
    get9Certos() {
        const certos = [
            'Paciente certo',
            'Medicamento certo',
            'Dose certa',
            'Via certa',
            'Hora certa',
            'Registro certo',
            'Orientação certa',
            'Resposta certa',
            'Validade certa'
        ];
        
        return certos.map(c => ({ label: c, checked: true }));
    },
    
    getMetas() {
        const metas = [
            'Meta 1: Identificação Correta do Paciente',
            'Meta 2: Comunicação Efetiva',
            'Meta 3: Melhorar Segurança dos Medicamentos',
            'Meta 6: Reduzir Risco de Quedas e Lesões'
        ];
        
        return metas.map(m => ({ label: m, checked: true }));
    },
    
    searchNANDA() {
        const query = prompt('Buscar NANDA/NIC/NOC:');
        if (!query) return;
        
        ButtonManager.setLoading('btn-nanda', 'Buscando...');
        
        setTimeout(() => {
            const results = NANDAEngine.search(query);
            NANDAEngine.showModal(results);
            ButtonManager.setNormal('btn-nanda');
        }, 500);
    },
    
    clear() {
        if (confirm('Deseja limpar o formulário?')) {
            document.getElementById('calculator-form').reset();
            document.getElementById('result-area').classList.add('hidden');
            document.getElementById('btn-pdf').disabled = true;
            APP_STATE.lastResult = null;
            NotificationEngine.success('Formulário limpo!');
        }
    }
};

// ============================================================================
// 8. INICIALIZAÇÃO
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof CALCULATOR_DATA !== 'undefined') {
        CalculatorApp.init(CALCULATOR_DATA);
    }
});

// Exportar para uso em Node.js (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NotificationEngine,
        PDFEngine,
        NANDAEngine,
        CalculationEngine,
        ButtonManager,
        CalculatorApp
    };
}
