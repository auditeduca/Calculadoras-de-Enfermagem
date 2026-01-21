/**
 * Script de Inicialização - Recursos Assistivos
 */

window.MainInit = function() {
    console.log('[Page] Inicializando Recursos Assistivos');
    
    window.EventBus.on('module:main-module-container:ready', function() {
        console.log('[Page] Módulo principal carregado');
        initPageLogic();
    });
};

function initPageLogic() {
    setupTableHighlight();
    setupExternalLinks();
    setupTableOfContents();
    setupStepList();
    setupAccessibilityTips();
}

/**
 * Destaca linhas de tabelas ao passar mouse
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
 * Adiciona atributos para links externos
 */
function setupExternalLinks() {
    const links = document.querySelectorAll('a[target="_blank"]');
    
    links.forEach(link => {
        if (!link.getAttribute('aria-label')) {
            link.setAttribute('aria-label', `${link.textContent} (abre em nova aba)`);
        }
    });
}

/**
 * Gera índice de conteúdo
 */
function setupTableOfContents() {
    const article = document.querySelector('.article-container');
    if (!article) return;
    
    const headings = article.querySelectorAll('h2');
    if (headings.length === 0) return;
    
    const tocContainer = document.createElement('div');
    tocContainer.className = 'table-of-contents';
    tocContainer.setAttribute('role', 'navigation');
    tocContainer.setAttribute('aria-label', 'Índice de conteúdo');
    
    const tocTitle = document.createElement('h3');
    tocTitle.textContent = 'Índice de Conteúdo';
    tocContainer.appendChild(tocTitle);
    
    const tocList = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
    
    tocContainer.appendChild(tocList);
    
    const header = article.querySelector('.article-header');
    if (header) {
        header.insertAdjacentElement('afterend', tocContainer);
    }
}

/**
 * Adiciona numeração visual aos passos
 */
function setupStepList() {
    const stepLists = document.querySelectorAll('.step-list');
    
    stepLists.forEach(list => {
        const items = list.querySelectorAll('li');
        items.forEach((item, index) => {
            const stepNumber = document.createElement('span');
            stepNumber.className = 'step-number';
            stepNumber.textContent = (index + 1);
            item.insertBefore(stepNumber, item.firstChild);
        });
    });
}

/**
 * Adiciona tooltips com dicas de acessibilidade
 */
function setupAccessibilityTips() {
    const kbdElements = document.querySelectorAll('kbd');
    
    kbdElements.forEach(kbd => {
        kbd.setAttribute('role', 'doc-noteref');
        kbd.style.cursor = 'help';
        
        // Adicionar tooltip ao passar mouse
        kbd.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('span');
            tooltip.className = 'keyboard-tooltip';
            tooltip.textContent = `Pressione ${this.textContent}`;
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = '#333';
            tooltip.style.color = '#fff';
            tooltip.style.padding = '4px 8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.zIndex = '1000';
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - 30) + 'px';
            tooltip.style.left = rect.left + 'px';
        });
        
        kbd.addEventListener('mouseleave', function() {
            const tooltips = document.querySelectorAll('.keyboard-tooltip');
            tooltips.forEach(t => t.remove());
        });
    });
}

console.log('[recursos-assistivos.js] Script carregado');
