/**
 * PRELOAD.JS - Calculadoras de Enfermagem
 * 
 * Funcionalidades:
 * - Renderização do modelo 3D (logo)
 * - Sistema de cores: Azul Escuro (#1E3A8A)
 * - Sistema de encerramento do preload (5 segundos)
 * 
 * Dependências: Three.js, OBJLoader, MTLLoader
 */

(function() {
    'use strict';

    // ==========================================
    // CONFIGURAÇÃO DE CORES - AZUL ESCURO
    // ==========================================
    var COLORS = {
        primary: 0x1E3A8A,
        accent: 0x3B82F6,
        highlight: 0x60A5FA
    };

    var MODEL_URLS = {
        obj: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/animation/Health_Calculator_0815105642_texture.obj',
        mtl: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/animation/Health_Calculator_0815105642_texture.mtl',
        texture: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/animation/Health_Calculator_0815105642_texture.png'
    };

    // ==========================================
    // VISUALIZAÇÃO DO MODELO 3D (LOGO)
    // ==========================================
    function initModel3D() {
        var modelCanvas = document.getElementById('model-canvas');
        if (!modelCanvas) return;

        var modelScene = new THREE.Scene();
        var modelCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        modelCamera.position.z = 5;

        var modelRenderer = new THREE.WebGLRenderer({
            canvas: modelCanvas,
            alpha: true,
            antialias: true
        });
        modelRenderer.setSize(400, 400);
        modelRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Iluminação suave e profissional
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        modelScene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 5, 5);
        modelScene.add(directionalLight);

        var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, 3, -5);
        modelScene.add(directionalLight2);

        var model = null;
        var mouseX = 0;
        var mouseY = 0;
        var targetRotationX = 0;
        var targetRotationY = 0;

        // Flag para controlar a animação
        var isAnimating = true;

        // Carregar textura
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load(MODEL_URLS.texture, function() {
            console.log('Textura carregada com sucesso');
        });

        // Configurar o modelo após carregamento
        function setupModel(object) {
            model = object;
            
            // Aplicar textura ao modelo
            model.traverse(function(child) {
                if (child.isMesh) {
                    child.material.needsUpdate = true;
                }
            });

            // Centralizar e dimensionar o modelo
            var box = new THREE.Box3().setFromObject(model);
            var center = box.getCenter(new THREE.Vector3());
            var size = box.getSize(new THREE.Vector3());
            
            var maxDim = Math.max(size.x, size.y, size.z);
            var scale = 3.0 / maxDim;
            model.scale.setScalar(scale);
            
            model.position.x = -center.x * scale;
            model.position.y = -center.y * scale;
            model.position.z = -center.z * scale;

            modelScene.add(model);
        }

        // Tentar carregar com materiais MTL
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.load(MODEL_URLS.mtl, function(materials) {
            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            
            objLoader.load(MODEL_URLS.obj, setupModel, function(xhr) {
                // Progresso de carregamento
            }, function(err) {
                console.warn('Erro ao carregar MTL, tentando sem materiais');
                var objLoader2 = new THREE.OBJLoader();
                objLoader2.load(MODEL_URLS.obj, setupModel);
            });
        }, undefined, function(err) {
            // Tentar carregar apenas o OBJ
            var objLoader = new THREE.OBJLoader();
            objLoader.load(MODEL_URLS.obj, setupModel);
        });

        // Interação com o mouse para rotação suave
        function onModelMouseMove(event) {
            var rect = modelCanvas.getBoundingClientRect();
            mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        }

        modelCanvas.addEventListener('mousemove', onModelMouseMove);

        // Animação do modelo 3D - continua até o preload finalizar
        function animateModel() {
            if (!isAnimating) return;
            
            requestAnimationFrame(animateModel);

            if (model) {
                // Rotação contínua automática
                model.rotation.y += 0.008;
                
                // Movimento suave baseado no mouse
                targetRotationX += (mouseY * 0.3 - targetRotationX) * 0.05;
                targetRotationY += (mouseX * 0.3 - targetRotationY) * 0.05;
                
                model.rotation.x = targetRotationX * 0.2;
            }

            modelRenderer.render(modelScene, modelCamera);
        }

        animateModel();

        // Responsividade
        window.addEventListener('resize', function() {
            var size = Math.min(400, window.innerWidth * 0.7);
            modelCanvas.width = size;
            modelCanvas.height = size;
            modelRenderer.setSize(size, size);
            modelCamera.aspect = 1;
            modelCamera.updateProjectionMatrix();
        });

        // Expor função para parar a animação quando o preload finalizar
        window.stopModelAnimation = function() {
            isAnimating = false;
        };
    }

    // ==========================================
    // SISTEMA DE FECHAMENTO DO PRELOAD
    // ==========================================
    function initPreloadManager() {
        var preloadHidden = false;
        
        function hidePreloader() {
            if (preloadHidden) return;
            preloadHidden = true;
            
            var preload = document.getElementById('preload-container');
            if (preload) {
                preload.style.transition = 'opacity 0.5s ease-out';
                preload.style.opacity = '0';
                setTimeout(function() {
                    preload.style.display = 'none';
                    // Parar a animação do modelo 3D
                    if (typeof window.stopModelAnimation === 'function') {
                        window.stopModelAnimation();
                    }
                }, 500);
            }
        }

        // 1. Módulos carregados (evento do ComponentLoader)
        window.addEventListener('ModulesLoaded', hidePreloader);

        // 2. Timeout fixo de 5 segundos
        setTimeout(hidePreloader, 5000);

        // 3. Verificação periódica do DOM (fallback adicional)
        var pollCount = 0;
        var maxPollCount = 25;
        
        function pollDOM() {
            pollCount++;
                
            var mainContainer = document.getElementById('main-container');
            var headerContainer = document.getElementById('header-container');
            
            var mainLoaded = mainContainer && mainContainer.innerHTML.trim().length > 50;
            var headerLoaded = headerContainer && headerContainer.innerHTML.trim().length > 50;
            
            if (mainLoaded || headerLoaded) {
                hidePreloader();
                return;
            }
            
            if (pollCount < maxPollCount) {
                setTimeout(pollDOM, 200);
            }
        }
        
        setTimeout(pollDOM, 500);
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================
    function init() {
        initModel3D();
        initPreloadManager();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();