window.MainInit = function() {
    console.log('[Page] Inicializando página');
    window.EventBus.on('module:main-module-container:ready', function() {
        initPageLogic();
    });
};

function initPageLogic() {
    setupTableOfContents();
    setupExternalLinks();
}

function setupTableOfContents() {
    const article = document.querySelector('.article-container');
    if (!article) return;
    const headings = article.querySelectorAll('h2');
    if (headings.length === 0) return;
    const tocContainer = document.createElement('div');
    tocContainer.className = 'table-of-contents';
    tocContainer.setAttribute('role', 'navigation');
    const tocTitle = document.createElement('h3');
    tocTitle.textContent = 'Índice de Conteúdo';
    tocContainer.appendChild(tocTitle);
    const tocList = document.createElement('ul');
    headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `heading-${index}`;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
    });
    tocContainer.appendChild(tocList);
    const header = article.querySelector('.article-header');
    if (header) header.insertAdjacentElement('afterend', tocContainer);
}

function setupExternalLinks() {
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(link => {
        if (!link.getAttribute('aria-label')) {
            link.setAttribute('aria-label', `${link.textContent} (abre em nova aba)`);
        }
    });
}

console.log('[page.js] Script carregado');
