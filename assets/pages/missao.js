(function() {
    'use strict';

    // Objeto principal do módulo
    window.MainInit = function() {
        console.log('[MainModule] Inicializando Missão, Visão e Valores');
        
        // 1. Atualizar Título da Página e Metadados
        updatePageMeta();

        // 2. Inicializar Scroll Suave para o Índice
        initSmoothScroll();

        // 3. Inicializar Botões de Compartilhamento
        initShareButtons();

        // 4. (Opcional) Intersection Observer para highlight no menu lateral
        initScrollSpy();
    };

    function updatePageMeta() {
        // Atualiza título da aba
        document.title = "Missão, Visão e Valores | Calculadoras de Enfermagem";
        
        // Tenta atualizar a meta description se ela existir, senão cria
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = "Conheça a missão, visão e valores da Calculadoras de Enfermagem: compromisso com a excelência clínica e a segurança na assistência através da tecnologia.";
    }

    function initSmoothScroll() {
        const links = document.querySelectorAll('.toc-link');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href'); // #pane-missao
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // Compensação para header fixo (aprox 120px)
                    const headerOffset = 120;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });
        });
    }

    function initShareButtons() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent("Missão, Visão e Valores - Calculadoras de Enfermagem");

        const shareLinks = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
            whatsapp: `https://api.whatsapp.com/send?text=${title}%20${url}`
        };

        const buttons = document.querySelectorAll('.share-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Identifica qual rede social pelo ícone ou classe
                let network = '';
                if (this.classList.contains('facebook')) network = 'facebook';
                else if (this.classList.contains('twitter')) network = 'twitter';
                else if (this.classList.contains('linkedin')) network = 'linkedin';
                else if (this.classList.contains('whatsapp')) network = 'whatsapp';

                if (network && shareLinks[network]) {
                    window.open(shareLinks[network], '_blank', 'width=600,height=400');
                }
            });
        });
    }

    function initScrollSpy() {
        const sections = document.querySelectorAll('section[id^="pane-"]');
        const navLinks = document.querySelectorAll('.toc-link');

        // Observer options
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px', // Ativa quando a seção estiver no meio da tela
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove active de todos
                    navLinks.forEach(link => {
                        link.style.fontWeight = 'normal';
                        link.style.opacity = '0.9';
                        const icon = link.querySelector('i');
                        if(icon) icon.className = 'fa-solid fa-chevron-right';
                    });

                    // Adiciona active ao correspondente
                    const id = entry.target.getAttribute('id');
                    const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                    
                    if (activeLink) {
                        activeLink.style.fontWeight = 'bold';
                        activeLink.style.opacity = '1';
                        const icon = activeLink.querySelector('i');
                        if(icon) icon.className = 'fa-solid fa-circle'; // Muda ícone para bolinha
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

})();