
    // --- LÓGICA DE FONTE & TEMA (Mantida) ---
    let currentZoom = 100;
    function changeFontSize(action) {
        if (action === 'increase') { if (currentZoom < 150) currentZoom += 10; } 
        else if (action === 'decrease') { if (currentZoom > 90) currentZoom -= 10; }
        document.documentElement.style.fontSize = currentZoom + '%';
        localStorage.setItem('user-font-size', currentZoom);
    }
    const savedZoom = localStorage.getItem('user-font-size');
    if (savedZoom) { currentZoom = parseInt(savedZoom); document.documentElement.style.fontSize = currentZoom + '%'; }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('dark-theme', isDark);
        const icon = document.querySelector('#theme-toggle i');
        if(isDark) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); } 
        else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
    }
    if (localStorage.getItem('dark-theme') === 'true') { toggleTheme(); }

    // --- MEGA MENUS & MOBILE LOGIC ---
    document.addEventListener('DOMContentLoaded', () => {
        
        // 1. MEGA MENU DESKTOP
        const navTriggers = document.querySelectorAll('.nav-trigger');
        const panels = document.querySelectorAll('.mega-panel');
        let activePanel = null;

        function closeAllPanels() {
            panels.forEach(panel => {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
            });
            navTriggers.forEach(trigger => {
                trigger.classList.remove('active-nav');
                trigger.setAttribute('aria-expanded', 'false');
            });
            activePanel = null;
        }

        navTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = trigger.dataset.panel;
                if(!targetId) return; // Botões sem painel (Início)
                const targetPanel = document.getElementById(targetId);

                if (activePanel === targetPanel) {
                    closeAllPanels();
                } else {
                    closeAllPanels();
                    targetPanel.classList.add('active');
                    targetPanel.setAttribute('aria-hidden', 'false');
                    trigger.classList.add('active-nav');
                    trigger.setAttribute('aria-expanded', 'true');
                    activePanel = targetPanel;
                    
                    // Foco inteligente para acessibilidade (AA)
                    if (targetId === 'panel-busca') {
                        setTimeout(() => document.getElementById('panel-busca-input').focus(), 100);
                    } else {
                        // Tenta focar o primeiro elemento interativo do painel para navegação eficiente
                        const firstFocusable = targetPanel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                        if(firstFocusable) setTimeout(() => firstFocusable.focus(), 100);
                    }
                }
            });
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mega-panel') && !e.target.closest('.nav-trigger')) {
                closeAllPanels();
            }
        });

        // --- ACESSIBILIDADE E NAVEGAÇÃO POR TECLADO ---

        // 1. Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllPanels();
                closeMobileMenu(); // Fecha o mobile também
            }
        });

        // 2. Fechar Mega Menu ao navegar com TAB para fora (Próximo Menu)
        document.addEventListener('focusin', (e) => {
            if (activePanel) {
                const isInsidePanel = activePanel.contains(e.target);
                const isTrigger = [...navTriggers].some(t => t.contains(e.target));
                
                // Se o foco saiu do painel e não foi para o botão que abriu, fecha
                if (!isInsidePanel && !isTrigger) {
                    closeAllPanels();
                }
            }
        });

        // 3. Navegação nas Abas Laterais (Setas e Enter/Space)
        const tabTriggers = document.querySelectorAll('.menu-tab-trigger');
        
        tabTriggers.forEach((trigger, index) => {
            // Ativação com Enter/Space
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateTab(trigger);
                }
                
                // Navegação com setas cima/baixo dentro do grupo
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const parentPanel = trigger.closest('.mega-panel');
                    const siblings = Array.from(parentPanel.querySelectorAll('.menu-tab-trigger'));
                    const currentIndex = siblings.indexOf(trigger);
                    let nextIndex;

                    if (e.key === 'ArrowDown') {
                        nextIndex = (currentIndex + 1) % siblings.length;
                    } else {
                        nextIndex = (currentIndex - 1 + siblings.length) % siblings.length;
                    }
                    siblings[nextIndex].focus();
                    activateTab(siblings[nextIndex]); // Opcional: ativar ao focar (comportamento Windows)
                }
            });

            // Ativação com Mouse (Mantido)
            trigger.addEventListener('mouseenter', () => activateTab(trigger));
        });

        function activateTab(trigger) {
            const parentPanel = trigger.closest('.mega-panel');
            const targetId = trigger.dataset.target;
            
            parentPanel.querySelectorAll('.menu-tab-trigger').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            parentPanel.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            trigger.classList.add('active');
            trigger.setAttribute('aria-selected', 'true');
            const targetContent = document.getElementById(targetId);
            if(targetContent) targetContent.classList.add('active');
        }

        // --- FIM LÓGICA ACESSIBILIDADE ---


        // 2. MENU MOBILE ACCORDION (Logica de fechar outros ao abrir um)
        const mobileTrigger = document.getElementById('mobile-menu-trigger');
        const closeMobileBtn = document.getElementById('close-mobile-menu');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileDrawer = document.getElementById('mobile-menu-drawer');
        const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
        const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');

        function openMobileMenu() {
            mobileMenu.classList.remove('hidden');
            mobileMenu.setAttribute('aria-hidden', 'false');
            mobileTrigger.setAttribute('aria-expanded', 'true');
            setTimeout(() => {
                mobileBackdrop.classList.remove('opacity-0');
                mobileDrawer.classList.remove('-translate-x-full');
            }, 10);
        }

        function closeMobileMenu() {
            mobileBackdrop.classList.add('opacity-0');
            mobileDrawer.classList.add('-translate-x-full');
            mobileTrigger.setAttribute('aria-expanded', 'false');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
                mobileMenu.setAttribute('aria-hidden', 'true');
            }, 300);
        }

        if(mobileTrigger) {
            mobileTrigger.addEventListener('click', openMobileMenu);
            closeMobileBtn.addEventListener('click', closeMobileMenu);
            mobileBackdrop.addEventListener('click', closeMobileMenu);
        }

        accordionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('i');
                const isActive = this.classList.contains('active');

                // Fechar todos os outros
                accordionBtns.forEach(otherBtn => {
                    if(otherBtn !== this) {
                        otherBtn.classList.remove('active');
                        otherBtn.setAttribute('aria-expanded', 'false');
                        otherBtn.nextElementSibling.style.maxHeight = null;
                        const otherIcon = otherBtn.querySelector('i');
                        if(otherIcon) otherIcon.classList.remove('rotate-180');
                    }
                });

                // Toggle atual
                if(isActive) {
                    this.classList.remove('active');
                    this.setAttribute('aria-expanded', 'false');
                    content.style.maxHeight = null;
                    icon.classList.remove('rotate-180');
                } else {
                    this.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                    content.style.maxHeight = content.scrollHeight + "px";
                    icon.classList.add('rotate-180');
                }
            });
        });

        // 3. LÓGICA DE BUSCA
        let searchIndex = [];
        
        function buildSearchIndex() {
            const links = document.querySelectorAll('.mega-panel a');
            links.forEach(link => {
                if(link.textContent && link.href) {
                    searchIndex.push({
                        text: link.textContent.trim(),
                        href: link.href
                    });
                }
            });
        }
        buildSearchIndex();

        window.performSearch = function(query) {
            const resultsContainer = document.getElementById('active-search-results');
            const defaultMsg = document.getElementById('default-search-msg');
            
            if (!query || query.length < 2) {
                resultsContainer.classList.add('hidden');
                defaultMsg.classList.remove('hidden');
                return;
            }

            defaultMsg.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
            resultsContainer.innerHTML = '';

            const lowerQuery = query.toLowerCase();
            const filtered = searchIndex.filter(item => item.text.toLowerCase().includes(lowerQuery)).slice(0, 10);

            if (filtered.length === 0) {
                resultsContainer.innerHTML = '<li class="p-4 text-gray-500 text-center">Nenhum resultado encontrado.</li>';
                return;
            }

            filtered.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="${item.href}" class="block p-3 hover:bg-blue-50 rounded border border-gray-100 transition flex justify-between items-center group">
                        <span class="font-medium text-gray-700 group-hover:text-blue-700">${item.text}</span>
                        <i class="fas fa-arrow-right text-gray-300 text-xs group-hover:text-blue-500" aria-hidden="true"></i>
                    </a>
                `;
                resultsContainer.appendChild(li);
            });
        };

        window.clearSearch = function() {
            const input = document.getElementById('panel-busca-input');
            input.value = '';
            performSearch('');
            input.focus();
        };
    });