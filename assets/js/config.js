/**
 * SITE_CONFIG - Configuração Centralizada
 * 
 * Este arquivo centraliza toda a configuração do site, facilitando:
 * - Manutenção de páginas
 * - Adição de novas páginas
 * - Gerenciamento de componentes
 * - Configuração de comportamentos globais
 * 
 * @version 4.0.0
 * @author Calculadoras de Enfermagem
 */

const SITE_CONFIG = {
    // Informações do site
    site: {
        name: 'Calculadoras de Enfermagem',
        version: '4.0.0',
        baseUrl: '',
        environment: 'production'
    },

    // Configuração de componentes compartilhados
    components: {
        accessibility: {
            id: 'accessibility-v2-container',
            path: 'assets/components/accessibility-v4.html',
            enabled: true
        },
        header: {
            id: 'header-v2-container',
            path: 'assets/components/header-v4.html',
            enabled: true
        },
        footer: {
            id: 'footer-v2-container',
            path: 'assets/components/footer-v4.html',
            enabled: true
        },
        breadcrumb: {
            id: 'breadcrumb-container',
            path: 'assets/components/breadcrumb.html',
            enabled: false
        },
        relatedContent: {
            id: 'related-content-container',
            path: 'assets/components/related-content.html',
            enabled: false
        }
    },

    // Scripts compartilhados (carregados em sequência)
    sharedScripts: [
        'assets/js/event-bus-v4.js',
        'assets/js/accessibility-v4.js',
        'assets/js/header-v4.js',
        'assets/js/footer-v4.js'
    ],

    // Configuração de páginas institucionais
    pages: {
        // Páginas existentes (v2 - já modulares)
        missao: {
            title: 'Missão, Visão e Valores',
            description: 'Conheça os pilares que sustentam nossa plataforma e nosso compromisso com a excelência na enfermagem.',
            keywords: 'missão, visão, valores, enfermagem',
            path: 'assets/pages/missao.html',
            script: 'assets/pages/missao.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Sobre Nós', href: '#' },
                { label: 'Missão, Visão e Valores', current: true }
            ],
            status: 'modular'
        },

        objetivo: {
            title: 'Objetivos da Plataforma',
            description: 'Descubra como unimos tecnologia e ciência para o empoderamento do enfermeiro na beira do leito.',
            keywords: 'objetivos, plataforma, estratégia',
            path: 'assets/pages/objetivo.html',
            script: 'assets/pages/objetivo.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Sobre Nós', href: '#' },
                { label: 'Objetivos', current: true }
            ],
            status: 'modular'
        },

        mapaDoSite: {
            title: 'Mapa do Site',
            description: 'Guia de navegação completo do site Calculadoras de Enfermagem.',
            keywords: 'mapa, site, navegação, índice',
            path: 'assets/pages/mapa-do-site.html',
            script: 'assets/pages/mapa-do-site.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Mapa do Site', current: true }
            ],
            status: 'modular'
        },

        // Páginas a refatorar (v3 -> v2)
        politicaAcessibilidade: {
            title: 'Política de Acessibilidade Digital',
            description: 'Nosso compromisso com a inclusão digital e conformidade com WCAG 2.1 AA.',
            keywords: 'acessibilidade, WCAG, inclusão digital',
            path: 'assets/pages/politicadeacessibilidade.html',
            script: 'assets/pages/politicadeacessibilidade.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Acessibilidade Digital', href: '#' },
                { label: 'Política de Acessibilidade', current: true }
            ],
            status: 'refatorando'
        },

        recursosAssistivos: {
            title: 'Recursos Assistivos',
            description: 'Ferramentas de acessibilidade disponíveis no site.',
            keywords: 'recursos assistivos, acessibilidade, tecnologia assistiva',
            path: 'assets/pages/recursos-assistivos.html',
            script: 'assets/pages/recursos-assistivos.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Acessibilidade Digital', href: '#' },
                { label: 'Recursos Assistivos', current: true }
            ],
            status: 'refatorando'
        },

        nossoCompromisso: {
            title: 'Nosso Compromisso',
            description: 'Governança, responsabilidade social e compromisso com acessibilidade, sustentabilidade e proteção de dados.',
            keywords: 'compromisso, governança, responsabilidade',
            path: 'assets/pages/nossocompromisso.html',
            script: 'assets/pages/nossocompromisso.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Sustentabilidade Digital', href: '#' },
                { label: 'Nosso Compromisso', current: true }
            ],
            status: 'refatorando'
        },

        impactoDigital: {
            title: 'Relatório de Impacto Digital',
            description: 'Nosso impacto na transformação digital da saúde e enfermagem.',
            keywords: 'impacto, relatório, transformação digital',
            path: 'assets/pages/impactodigital.html',
            script: 'assets/pages/impactodigital.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Sustentabilidade Digital', href: '#' },
                { label: 'Relatório de Impacto', current: true }
            ],
            status: 'refatorando'
        },

        tecnologiaVerde: {
            title: 'Tecnologia Verde',
            description: 'Nosso compromisso com sustentabilidade ambiental e tecnologia verde.',
            keywords: 'tecnologia verde, sustentabilidade, ambiental',
            path: 'assets/pages/tecnologiaverde.html',
            script: 'assets/pages/tecnologiaverde.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Sustentabilidade Digital', href: '#' },
                { label: 'Tecnologia Verde', current: true }
            ],
            status: 'refatorando'
        },

        politica: {
            title: 'Política de Privacidade',
            description: 'Proteção de dados e privacidade dos usuários.',
            keywords: 'privacidade, dados, LGPD',
            path: 'assets/pages/politica.html',
            script: 'assets/pages/politica.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Políticas do Site', href: '#' },
                { label: 'Privacidade', current: true }
            ],
            status: 'refatorando'
        },

        notificacoesLegais: {
            title: 'Notificações Legais',
            description: 'Informações legais e regulatórias do site.',
            keywords: 'legal, regulatório, notificações',
            path: 'assets/pages/notificacoes-legais.html',
            script: 'assets/pages/notificacoes-legais.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Políticas do Site', href: '#' },
                { label: 'Notificações Legais', current: true }
            ],
            status: 'refatorando'
        },

        termos: {
            title: 'Termos e Condições',
            description: 'Termos de uso e condições da plataforma.',
            keywords: 'termos, condições, uso',
            path: 'assets/pages/termos.html',
            script: 'assets/pages/termos.js',
            breadcrumb: [
                { label: 'Início', href: '/' },
                { label: 'Políticas do Site', href: '#' },
                { label: 'Termos e Condições', current: true }
            ],
            status: 'refatorando'
        }
    },

    // Configuração de carregamento
    loader: {
        cacheEnabled: true,
        cacheExpiry: 3600000, // 1 hora em ms
        timeout: 10000, // 10 segundos
        retries: 3,
        debug: false // Ativar para debug
    },

    // Configuração de acessibilidade
    accessibility: {
        wcagLevel: 'AA',
        enableVLibras: true,
        enableScreenReader: true,
        enableKeyboardNavigation: true
    },

    // Configuração de performance
    performance: {
        preloadCriticalResources: true,
        lazyLoadImages: true,
        minifyCSS: true,
        minifyJS: true
    }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SITE_CONFIG;
}

// Log de inicialização
if (SITE_CONFIG.loader.debug) {
    console.log('[CONFIG] Site Config carregado:', SITE_CONFIG);
}
