// No arquivo page-loader-v4.js, atualize o método loadHomePage:

async loadHomePage() {
    try {
        const response = await fetch('assets/pages/home-v4.html');
        
        if (!response.ok) {
            throw new Error(`Status ${response.status}`);
        }
        
        const content = await response.text();
        document.getElementById('dynamic-content').innerHTML = content;
        
        // Inicializar animações após carregamento
        this.initHomePageAnimations();
        
    } catch (error) {
        console.error('Erro ao carregar página inicial:', error);
        this.loadDefaultHomePage();
    }
},

// Novo método para inicializar animações
initHomePageAnimations() {
    // Adicionar efeitos de hover interativos
    const cards = document.querySelectorAll('.card-base');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('shadow-xl', 'scale-[1.02]');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('shadow-xl', 'scale-[1.02]');
        });
    });
    
    // Adicionar contador de acessos (simulado)
    this.updateAccessCounter();
},

// Método para atualizar contador de acessos
updateAccessCounter() {
    try {
        let accessCount = localStorage.getItem('calc_access_count') || 0;
        accessCount = parseInt(accessCount) + 1;
        localStorage.setItem('calc_access_count', accessCount);
        
        // Pode ser usado para mostrar estatísticas
        if (accessCount % 10 === 0) {
            console.log(`🎉 ${accessCount} acessos à plataforma!`);
        }
    } catch (e) {
        // Ignorar erro se localStorage não estiver disponível
    }
},

// Manter o método loadDefaultHomePage() existente