/**
 * Módulo de Integração VLibras
 * Controla o widget do tradutor de Libras (Língua Brasileira de Sinais)
 * 
 * Funcionalidades:
 * - Carregamento preguiçoso (lazy load) do script VLibras
 * - Controle de visibilidade via botão toggle
 * - Persistência de preferência do usuário
 * - Integração com o módulo de acessibilidade existente
 */
(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES DO MÓDULO
    // ============================================
    const VLIBRAS_CONFIG = {
        scriptUrl: 'https://vlibras.gov.br/app/vlibras-plugin.js',
        apiUrl: 'https://vlibras.gov.br/app',
        storageKey: 'nursing_calc_a11y_libras',
        widgetSelector: '[vw].vw-libras-wrapper',
        buttonSelector: '[data-a11y-action="toggle-libras"]'
    };

    // ============================================
    // ESTADO DO MÓDULO
    // ============================================
    const LibrasState = {
        isLoaded: false,
        isInitialized: false,
        isActive: false,
        isLoading: false
    };

    // ============================================
    // FUNÇÕES DE LOG
    // ============================================
    function log(message, type = 'log') {
        const prefix = '[Libras]';
        if (type === 'error') {
            console.error(prefix, message);
        } else if (type === 'warn') {
            console.warn(prefix, message);
        } else {
            console.log(prefix, message);
        }
    }

    // ============================================
    // CARREGAMENTO DO SCRIPT
    // ============================================
    function loadVLibrasScript() {
        return new Promise((resolve, reject) => {
            // Verificar se já está carregado
            if (LibrasState.isLoaded) {
                log('Script já carregado anteriormente');
                resolve();
                return;
            }

            // Verificar se está no processo de carregamento
            if (LibrasState.isLoading) {
                log('Carregamento já em progresso');
                const checkLoaded = setInterval(() => {
                    if (LibrasState.isLoaded) {
                        clearInterval(checkLoaded);
                        resolve();
                    }
                }, 100);
                
                // Timeout após 10 segundos
                setTimeout(() => {
                    clearInterval(checkLoaded);
                    reject(new Error('Timeout ao carregar VLibras'));
                }, 10000);
                return;
            }

            LibrasState.isLoading = true;
            log('Iniciando carregamento do script VLibras...');

            const script = document.createElement('script');
            script.src = VLIBRAS_CONFIG.scriptUrl;
            script.async = true;
            script.charset = 'utf-8';

            script.onload = function() {
                log('Script VLibras carregado com sucesso');
                LibrasState.isLoaded = true;
                LibrasState.isLoading = false;
                
                // Inicializar o widget VLibras
                initializeVLibrasWidget();
                resolve();
            };

            script.onerror = function(error) {
                log('Falha ao carregar script VLibras: ' + error.message, 'error');
                LibrasState.isLoading = false;
                reject(new Error('Falha ao carregar script VLibras'));
            };

            document.body.appendChild(script);
        });
    }

    // ============================================
    // INICIALIZAÇÃO DO WIDGET
    // ============================================
    function initializeVLibrasWidget() {
        if (LibrasState.isInitialized) {
            log('Widget já inicializado');
            return;
        }

        // Verificar se o objeto VLibras está disponível
        if (typeof window.VLibras === 'undefined') {
            log('Objeto VLibras não encontrado após carregamento', 'error');
            return;
        }

        try {
            // Inicializar o widget com a URL do app
            new window.VLibras.Widget(VLIBRAS_CONFIG.apiUrl);
            LibrasState.isInitialized = true;
            log('Widget VLibras inicializado com sucesso');
        } catch (error) {
            log('Erro ao inicializar widget VLibras: ' + error.message, 'error');
        }
    }

    // ============================================
    // CONTROLE DE VISIBILIDADE
    // ============================================
    function setWidgetVisibility(visible) {
        const wrapper = document.querySelector(VLIBRAS_CONFIG.widgetSelector);
        
        if (!wrapper) {
            log('Wrapper VLibras não encontrado', 'warn');
            return;
        }

        if (visible) {
            wrapper.style.display = 'block';
            LibrasState.isActive = true;
            log('Widget VLibras ativado');
        } else {
            wrapper.style.display = 'none';
            LibrasState.isActive = false;
            log('Widget VLibras desativado');
        }

        // Persistir a preferência
        localStorage.setItem(VLIBRAS_CONFIG.storageKey, visible ? 'true' : 'false');
    }

    function getWidgetVisibility() {
        return LibrasState.isActive;
    }

    // ============================================
    // ATUALIZAÇÃO DO BOTÃO
    // ============================================
    function updateButtonState(isActive) {
        const button = document.querySelector(VLIBRAS_CONFIG.buttonSelector);
        
        if (!button) {
            log('Botão de Libras não encontrado', 'warn');
            return;
        }

        // Atualizar classes e atributos ARIA
        button.classList.toggle('a11y-active', isActive);
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive);

        // Atualizar aria-label para feedback claro
        if (isActive) {
            button.setAttribute('aria-label', 'Fechar tradutor de Libras');
        } else {
            button.setAttribute('aria-label', 'Abrir tradutor de Libras');
        }
    }

    // ============================================
    // FUNÇÃO PRINCIPAL DE TOGGLE
    // ============================================
    async function toggleLibras() {
        const button = document.querySelector(VLIBRAS_CONFIG.buttonSelector);
        
        if (!button) {
            log('Botão de Libras não encontrado', 'error');
            return;
        }

        // Verificar estado atual
        const newState = !LibrasState.isActive;

        if (newState) {
            // Ativar: carregar script se necessário e mostrar widget
            try {
                // Feedback visual de carregamento
                const originalContent = button.innerHTML;
                button.innerHTML = '<i class=\"fas fa-spinner fa-spin\" aria-hidden=\"true\"></i>';
                
                await loadVLibrasScript();
                
                // Restaurar conteúdo original
                button.innerHTML = originalContent;
                
                // Mostrar widget
                setWidgetVisibility(true);
                updateButtonState(true);
                
                log('Intérprete de Libras ativado');
            } catch (error) {
                log('Erro ao ativar Libras: ' + error.message, 'error');
                // Manter botão desativado em caso de erro
                updateButtonState(false);
            }
        } else {
            // Desativar: apenas esconder widget
            setWidgetVisibility(false);
            updateButtonState(false);
            
            log('Intérprete de Libras desativado');
        }
    }

    // ============================================
    // RESTAURAÇÃO DE PREFERÊNCIA
    // ============================================
    function restoreUserPreference() {
        const savedPreference = localStorage.getItem(VLIBRAS_CONFIG.storageKey);
        const button = document.querySelector(VLIBRAS_CONFIG.buttonSelector);

        // Configurar estado inicial do wrapper
        const wrapper = document.querySelector(VLIBRAS_CONFIG.widgetSelector);
        if (wrapper) {
            wrapper.style.display = 'none';
        }

        // Se usuário tinha ativado anteriormente, ativar automaticamente
        if (savedPreference === 'true' && button) {
            log('Restaurando preferência do usuário: Libras ativado');
            
            // Usar setTimeout para garantir que o DOM está pronto
            setTimeout(() => {
                toggleLibras();
            }, 500);
        }
    }

    // ============================================
    // CONFIGURAÇÃO DE EVENTOS
    // ============================================
    function setupEventListeners() {
        const button = document.querySelector(VLIBRAS_CONFIG.buttonSelector);
        
        if (!button) {
            log('Botão de Libras não encontrado - eventos não configurados', 'warn');
            return;
        }

        // Evento de clique no botão
        button.addEventListener('click', function(event) {
            event.preventDefault();
            toggleLibras();
        });

        log('Eventos do botão Libras configurados');
    }

    // ============================================
    // ANÚNCIO PARA LEITORES DE TELA
    // ============================================
    function announceForScreenReader(message) {
        const announcer = document.getElementById('a11y-announcer');
        
        if (!announcer) {
            log('Elemento announcer não encontrado', 'warn');
            return;
        }

        // Limpar e definir nova mensagem
        announcer.textContent = '';
        
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }

    // ============================================
    // INICIALIZAÇÃO DO MÓDULO
    // ============================================
    function initialize() {
        log('Inicializando módulo VLibras...');

        // Configurar eventos
        setupEventListeners();

        // Restaurar preferência do usuário
        restoreUserPreference();

        log('Módulo VLibras inicializado');
    }

    // ============================================
    // DETECÇÃO DE DOM PRONTO
    // ============================================
    function onDOMReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    // ============================================
    // API PÚBLICA
    // ============================================
    window.LibrasControl = {
        version: '1.0.0',
        
        // Métodos principais
        toggle: toggleLibras,
        show: function() {
            if (!LibrasState.isActive) toggleLibras();
        },
        hide: function() {
            if (LibrasState.isActive) toggleLibras();
        },
        
        // Estado
        isActive: function() { return LibrasState.isActive; },
        isLoaded: function() { return LibrasState.isLoaded; },
        
        // Carregamento
        load: loadVLibrasScript,
        
        // Inicialização
        init: initialize
    };

    // ============================================
    // INICIAR MÓDULO
    // ============================================
    onDOMReady(function() {
        initialize();
    });

})();
