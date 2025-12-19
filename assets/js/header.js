/**
 * HEADER.JS - Mega Menu e Mobile
 */
function initHeader() {
    const triggers = document.querySelectorAll('.nav-trigger');
    const panels = document.querySelectorAll('.mega-panel');

    const closeAll = () => {
        panels.forEach(p => p.classList.remove('active'));
        triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
    };

    triggers.forEach(t => {
        t.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = document.getElementById(t.dataset.panel);
            const isOpen = target?.classList.contains('active');
            closeAll();
            if (!isOpen && target) {
                target.classList.add('active');
                t.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Mobile Logic
    const mobBtn = document.getElementById('mobile-menu-trigger');
    const mobMenu = document.getElementById('mobile-menu');
    if (mobBtn && mobMenu) {
        mobBtn.onclick = () => mobMenu.classList.toggle('hidden');
    }
}

initHeader();