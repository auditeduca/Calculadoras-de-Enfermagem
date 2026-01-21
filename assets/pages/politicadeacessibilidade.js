/**
 * Script de Inicialização - Política de Acessibilidade Digital
 * 
 * Responsável por:
 * - Inicializar comportamentos específicos da página
 * - Configurar interações
 * - Gerenciar eventos
 */

window.MainInit = function() {
    console.log('[Page] Inicializando Política de Acessibilidade Digital');
    
    // Aguardar carregamento do módulo principal
    window.EventBus.on('module:main-module-container:ready', function() {
        console.log('[Page] Módulo principal carregado');
        initPageLogic();
    });
};

/**
 * Inicializa lógica específica da página
 */
function initPageLogic() {
    // Configurar comportamentos da página
    setupTableHighlight();
    setupExternalLinks();
    setupKeyboardShortcuts();
    setupScrollToTop();
    setupTableOfContents();
}

/**
 * Destaca linhas da tabela de atalhos ao passar mouse
 */
function setupTableHighlight() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(0, 188, 212, 0.1)';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    });
}

/**
 * Adiciona ícone e atributos para links externos
 */
function setupExternalLinks() {
    const links = document.querySelectorAll('a[target="_blank"]');
    
    links.forEach(link => {
        // Adicionar atributo aria-label
        if (!link.getAttribute('aria-label')) {
            link.setAttribute('aria-label', `${link.textContent} (abre em nova aba)`);
        }
        
        // Adicionar ícone visual (opcional)
        if (!link.querySelector('.external-icon')) {
            const icon = document.createElement('span');
            icon.className = 'external-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = ' ↗';
            link.appendChild(icon);
        }
    });
}

/**
 * Configura atalhos de teclado mencionados na página
 */
function setupKeyboardShortcuts() {
    // Alt + Shift + I: Ir para início
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            window.location.href = '/';
        }
    });
    
    // Alt + Shift + T: Voltar ao topo
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

/**
 * Configura botão de voltar ao topo
 */
function setupScrollToTop() {
    // Criar botão se não existir
    let scrollTopBtn = document.getElementById('scroll-to-top');
    
    if (!scrollTopBtn) {
        scrollTopBtn = document.createElement('button');
        scrollTopBtn.id = 'scroll-to-top';
        scrollTopBtn.setAttribute('aria-label', 'Voltar ao topo da página');
        scrollTopBtn.innerHTML = '↑ Topo';
        scrollTopBtn.className = 'scroll-to-top-btn';
        document.body.appendChild(scrollTopBtn);
    }
    
    // Mostrar/ocultar botão ao rolar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });
    
    // Voltar ao topo ao clicar
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Gera índice de conteúdo (Table of Contents)
 */
function setupTableOfContents() {
    const article = document.querySelector('.article-container');
    if (!article) return;
    
    const headings = article.querySelectorAll('h2');
    
    if (headings.length === 0) return;
    
    // Criar container do TOC
    const tocContainer = document.createElement('div');
    tocContainer.className = 'table-of-contents';
    tocContainer.setAttribute('role', 'navigation');
    tocContainer.setAttribute('aria-label', 'Índice de conteúdo');
    
    // Criar título
    const tocTitle = document.createElement('h3');
    tocTitle.textContent = 'Índice de Conteúdo';
    tocContainer.appendChild(tocTitle);
    
    // Criar lista
    const tocList = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        // Adicionar ID se não existir
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        // Criar item da lista
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
    
    tocContainer.appendChild(tocList);
    
    // Inserir após o header
    const header = article.querySelector('.article-header');
    if (header) {
        header.insertAdjacentElement('afterend', tocContainer);
    }
}

// Log de carregamento
console.log('[politicadeacessibilidade.js] Script carregado');
