/**
 * PRELOAD.JS - Calculadoras de Enfermagem
 * * Este módulo é auto-contido. Ele injeta o CSS necessário, 
 * o HTML do preloader e gerencia o carregamento das dependências 3D.
 * * Uso: Basta incluir <script src="preload.js"></script> no head ou body.
 */

(function() {
    'use strict';

    // Configurações
    const CONFIG = {
        colors: {
            primary: 0x1E3A8A,    // Azul Escuro
            accent: 0x3B82F6,     // Azul Claro
            highlight: 0x60A5FA,  // Azul Destaque
            bg: '#ffffff'
        },
        urls: {
            obj: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/animation/Health_Calculator_0815105642_texture.obj',
            mtl: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/animation/Health_Calculator_0815105642_texture.mtl',
            texture: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/animation/Health_Calculator_0815105642_texture.png'
        },
        libs: {
            three: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            objLoader: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js',
            mtlLoader: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/MTLLoader.js'
        },
        minTime: 2000 // Tempo mínimo de exibição para evitar "piscada" rápida demais
    };

    // ==========================================
    // 1. INJEÇÃO DE ESTILOS (CSS)
    // ==========================================
    function injectStyles() {
        const css = `
            #preload-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: ${CONFIG.colors.bg};
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: opacity 0.8s ease-in-out, visibility 0.8s;
            }

            #preload-content-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 2;
            }

            /* Canvas de Fundo (Curvas) */
            #curves-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                opacity: 0.6;
            }

            /* Canvas do Modelo 3D */
            #model-canvas {
                width: 300px;
                height: 300px;
                z-index: 3;
                opacity: 0; /* Começa invisível e faz fade-in */
                transition: opacity 1s ease;
            }

            /* Texto */
            .preload-text {
                font-family: 'Inter', sans-serif;
                color: #1E3A8A;
                font-size: 1.1rem;
                letter-spacing: 2px;
                margin-top: 20px;
                text-transform: uppercase;
                font-weight: 500;
                animation: pulse 2s infinite;
                z-index: 3;
            }

            /* Barra de Progresso */
            .preload-progress-container {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: rgba(30, 58, 138, 0.1);
                z-index: 3;
            }

            .preload-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #1E3A8A, #3B82F6);
                width: 0%;
                transition: width 0.2s linear;
                box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
            }

            @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }

            /* Loader Fallback (caso 3D demore) */
            .fallback-loader {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(30, 58, 138, 0.1);
                border-radius: 50%;
                border-top-color: #1E3A8A;
                animation: spin 1s ease-in-out infinite;
                position: absolute;
                display: none; /* Só aparece se necessário */
            }

            @keyframes spin { to { transform: rotate(360deg); } }

            body.preload-active {
                overflow: hidden !important;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==========================================
    // 2. INJEÇÃO DE HTML
    // ==========================================
    function injectHTML() {
        const html = `
            <canvas id="curves-canvas"></canvas>
            <div id="preload-content-wrapper">
                <div class="fallback-loader" id="fallback-loader"></div>
                <canvas id="model-canvas"></canvas>
                <p class="preload-text">Carregando...</p>
                <div class="preload-progress-container">
                    <div class="preload-progress-bar" id="preload-progress"></div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.id = 'preload-container';
        container.innerHTML = html;
        document.body.prepend(container);
        document.body.classList.add('preload-active');
    }

    // ==========================================
    // 3. CARREGAMENTO DE SCRIPTS (Helper)
    // ==========================================
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${url}"]`)) {
                resolve(); // Já carregado
                return;
            }
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ==========================================
    // 4. LÓGICA THREE.JS (Curvas e Modelo)
    // ==========================================
    function initThreeJS() {
        const modelCanvas = document.getElementById('model-canvas');
        const curvesCanvas = document.getElementById('curves-canvas');
        const fallbackLoader = document.getElementById('fallback-loader');

        // --- Cenas ---
        const modelScene = new THREE.Scene();
        const curvesScene = new THREE.Scene();

        // --- Câmeras ---
        const modelCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000); // Aspecto 1:1 para o logo
        modelCamera.position.z = 5;
        
        const curvesCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        curvesCamera.position.z = 80;

        // --- Renderers ---
        const modelRenderer = new THREE.WebGLRenderer({ canvas: modelCanvas, alpha: true, antialias: true });
        modelRenderer.setSize(300, 300);
        modelRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const curvesRenderer = new THREE.WebGLRenderer({ canvas: curvesCanvas, alpha: true, antialias: true });
        curvesRenderer.setSize(window.innerWidth, window.innerHeight);
        curvesRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // --- Iluminação (Modelo) ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        modelScene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        modelScene.add(dirLight);

        // --- Lógica das Curvas (Cometas) ---
        const allComets = [];
        const colors = [CONFIG.colors.primary, CONFIG.colors.accent, CONFIG.colors.highlight];
        
        for (let w = 0; w < 3; w++) {
            const waveColor = colors[w];
            for (let c = 0; c < 5; c++) {
                const cometGroup = new THREE.Group();
                // Cabeça
                const head = new THREE.Mesh(
                    new THREE.SphereGeometry(0.8, 16, 16),
                    new THREE.MeshBasicMaterial({ color: waveColor })
                );
                cometGroup.add(head);
                
                // Cauda
                for (let t = 0; t < 30; t++) {
                    const particle = new THREE.Mesh(
                        new THREE.SphereGeometry(0.3 - (t * 0.01), 8, 8),
                        new THREE.MeshBasicMaterial({ 
                            color: waveColor, 
                            transparent: true, 
                            opacity: 0.6 - (t / 30) * 0.6 
                        })
                    );
                    particle.position.x = -t * 1.5;
                    cometGroup.add(particle);
                }
                
                cometGroup.userData = {
                    waveIndex: w,
                    offset: (c * 2000) + (w * 500)
                };
                curvesScene.add(cometGroup);
                allComets.push(cometGroup);
            }
        }

        // --- Carregamento do Modelo 3D ---
        let modelObj = null;
        
        // Timeout para mostrar loader de fallback se o 3D demorar
        const fallbackTimeout = setTimeout(() => {
            if (!modelObj) fallbackLoader.style.display = 'block';
        }, 500);

        const mtlLoader = new THREE.MTLLoader();
        mtlLoader.load(CONFIG.urls.mtl, (materials) => {
            materials.preload();
            const objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(CONFIG.urls.obj, (object) => {
                clearTimeout(fallbackTimeout);
                fallbackLoader.style.display = 'none';
                
                modelObj = object;
                
                // Normalizar escala
                const box = new THREE.Box3().setFromObject(modelObj);
                const size = box.getSize(new THREE.Vector3());
                const scale = 3.0 / Math.max(size.x, size.y, size.z);
                modelObj.scale.setScalar(scale);
                
                // Centralizar
                const center = box.getCenter(new THREE.Vector3());
                modelObj.position.x = -center.x * scale;
                modelObj.position.y = -center.y * scale;
                modelObj.position.z = -center.z * scale;

                modelScene.add(modelObj);
                
                // Fade in suave do canvas 3D
                modelCanvas.style.opacity = '1';

            }, undefined, (error) => {
                console.warn('Erro ao carregar modelo:', error);
                fallbackLoader.style.display = 'block'; // Mostra fallback em erro
            });
        });

        // --- Loop de Animação ---
        const startTime = Date.now();
        
        function animate() {
            if (!document.getElementById('preload-container')) return; // Parar se removido
            
            requestAnimationFrame(animate);
            const elapsed = Date.now() - startTime;

            // 1. Animar Modelo (Rotação)
            if (modelObj) {
                modelObj.rotation.y += 0.01;
                modelObj.rotation.x = Math.sin(elapsed * 0.001) * 0.1;
            }

            // 2. Animar Curvas (Cometas)
            const duration = 10000;
            const progress = (elapsed % duration) / duration;

            allComets.forEach(comet => {
                const data = comet.userData;
                const waveProgress = (progress + (data.offset / duration)) % 1;
                
                const baseX = -70 + waveProgress * 160;
                const waveY = (data.waveIndex - 1) * 20 + Math.sin(waveProgress * Math.PI * 2) * 10;
                
                comet.position.set(baseX, waveY, -data.waveIndex * 5);
                
                // Animar cauda
                comet.children.forEach((child, index) => {
                    if (index > 0) { // Ignorar a cabeça
                        child.position.y = Math.sin((elapsed * 0.005) + (index * 0.2)) * 0.5;
                    }
                });
            });

            modelRenderer.render(modelScene, modelCamera);
            curvesRenderer.render(curvesScene, curvesCamera);
        }

        animate();

        // --- Resize ---
        window.addEventListener('resize', () => {
            curvesCamera.aspect = window.innerWidth / window.innerHeight;
            curvesCamera.updateProjectionMatrix();
            curvesRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ==========================================
    // 5. GERENCIAMENTO DE ESTADO E SAÍDA
    // ==========================================
    function initProgressAndExit() {
        const progressBar = document.getElementById('preload-progress');
        const container = document.getElementById('preload-container');
        let width = 0;
        
        // Simulação de progresso (visual apenas)
        const progressInterval = setInterval(() => {
            if (width >= 90) {
                clearInterval(progressInterval);
            } else {
                width += Math.random() * 5;
                progressBar.style.width = Math.min(width, 90) + '%';
            }
        }, 200);

        // Função de Saída
        function hidePreloader() {
            clearInterval(progressInterval);
            progressBar.style.width = '100%';

            setTimeout(() => {
                container.style.opacity = '0';
                container.style.visibility = 'hidden';
                document.body.classList.remove('preload-active');
                
                // Limpar DOM após transição
                setTimeout(() => {
                    if (container.parentNode) {
                        container.parentNode.removeChild(container);
                    }
                    // Disparar evento para a aplicação saber que terminou
                    window.dispatchEvent(new Event('PreloadFinished'));
                }, 800);
            }, 500);
        }

        // Gatilhos de encerramento
        const startTime = Date.now();
        
        function checkLoad() {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, CONFIG.minTime - elapsedTime);

            if (document.readyState === 'complete') {
                setTimeout(hidePreloader, remainingTime);
            } else {
                window.addEventListener('load', () => setTimeout(hidePreloader, remainingTime));
            }
        }

        // Permite que a aplicação force o fechamento chamando window.closePreloader()
        window.closePreloader = hidePreloader;
        
        checkLoad();
    }

    // ==========================================
    // INICIALIZAÇÃO MESTRE
    // ==========================================
    async function init() {
        injectStyles();
        injectHTML();
        
        try {
            // Verifica se Three.js já existe, senão carrega
            if (typeof THREE === 'undefined') {
                await loadScript(CONFIG.libs.three);
            }
            // Carrega loaders auxiliares
            await Promise.all([
                loadScript(CONFIG.libs.objLoader),
                loadScript(CONFIG.libs.mtlLoader)
            ]);
            
            initThreeJS();
            initProgressAndExit();
        } catch (err) {
            console.error('Erro ao inicializar preload:', err);
            // Em caso de erro crítico, remove o preload para não bloquear o site
            document.getElementById('preload-container').style.display = 'none';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();