/**
 * Script de Inicialização - Nosso Compromisso
 */

window.MainInit = function() {
    console.log('[Page] Inicializando Nosso Compromisso');
    
    window.EventBus.on('module:main-module-container:ready', function() {
        console.log('[Page] Módulo principal carregado');
        initPageLogic();
    });
};

function initPageLogic() {
    setupTableHighlight();
    setupExternalLinks();
    setupTableOfContents();
    setupMetricsVisualization();
}

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

function setupExternalLinks() {
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(link => {
        if (!link.getAttribute('aria-label')) {
            link.setAttribute('aria-label', `${link.textContent} (abre em nova aba)`);
        }
    });
}

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

function setupMetricsVisualization() {
    const metricsBox = document.querySelector('.metrics-box');
    if (!metricsBox) return;
    
    const list = metricsBox.querySelector('ul');
    if (!list) return;
    
    const items = list.querySelectorAll('li');
    items.forEach((item, index) => {
        const badge = document.createElement('span');
        badge.className = 'metric-badge';
        badge.textContent = (index + 1);
        badge.style.display = 'inline-block';
        badge.style.backgroundColor = '#00bcd4';
        badge.style.color = 'white';
        badge.style.borderRadius = '50%';
        badge.style.width = '24px';
        badge.style.height = '24px';
        badge.style.lineHeight = '24px';
        badge.style.textAlign = 'center';
        badge.style.marginRight = '8px';
        badge.style.fontWeight = 'bold';
        
        item.insertBefore(badge, item.firstChild);
    });
}

console.log('[nossocompromisso.js] Script carregado');
