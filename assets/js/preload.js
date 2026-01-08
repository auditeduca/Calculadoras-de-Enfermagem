/**
* PRELOAD.JS
* Animação de Pré-carregamento com Modelo 3D
* Calculadoras de Enfermagem
*/
(function() {
    "use strict";

    let canvas, renderer, scene, camera, model, animationId;
    let isHidden = false;
    const animationDuration = 5000;

    function init() {
        console.log("[Preload] Inicializando...");
        canvas = document.getElementById("model-canvas");
        
        if (!canvas) {
            console.warn("[Preload] Canvas não encontrado");
            setTimeout(hidePreload, animationDuration);
            return;
        }

        // Verificar se Three.js está disponível
        if (typeof THREE === "undefined") {
            console.warn("[Preload] Three.js não encontrado, criando geometria fallback");
            createFallbackAnimation();
            return;
        }

        setupThreeJS();
        startAnimation();
        
        // Tentar carregar o modelo 3D se os loaders estiverem disponíveis
        if (THREE.OBJLoader && THREE.MTLLoader) {
            loadModel3D();
        } else {
            console.warn("[Preload] OBJLoader/MTLLoader não disponíveis");
            createFallbackGeometry();
        }
        
        setTimeout(hidePreload, animationDuration);
    }

    function setupThreeJS() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xFFFFFF);

        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 50;

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: false,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0xFFFFFF);

        // Adicionar iluminação
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xFFFFFF, 0.5);
        directionalLight2.position.set(-10, -10, 5);
        scene.add(directionalLight2);
    }

    function loadModel3D() {
        const objLoader = new THREE.OBJLoader();
        const mtlLoader = new THREE.MTLLoader();

        // URLs dos arquivos 3D
        const basePath = "assets/images/animation/";
        const objUrl = basePath + "Health_Calculator_0815105642_texture.obj";
        const mtlUrl = basePath + "Health_Calculator_0815105642_texture.mtl";

        // Carregar arquivo MTL primeiro
        mtlLoader.load(
            mtlUrl,
            function(materials) {
                materials.preload();
                
                // Carregar arquivo OBJ com materiais
                objLoader.setMaterials(materials);
                loadOBJ(objLoader, objUrl);
            },
            function(error) {
                console.warn("[Preload] Erro ao carregar MTL:", error);
                loadOBJ(objLoader, objUrl);
            }
        );
    }

    function loadOBJ(objLoader, url) {
        objLoader.load(
            url,
            function(object) {
                model = object;
                
                // Centralizar e escalar o modelo
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 30 / maxDim;
                model.scale.set(scale, scale, scale);
                
                model.position.sub(center.multiplyScalar(scale));
                model.rotation.y = Math.PI;

                scene.add(model);
                console.log("[Preload] Modelo 3D carregado com sucesso");
            },
            function(xhr) {
                console.log("[Preload] Carregando modelo: " + (xhr.loaded / xhr.total * 100).toFixed(0) + "%");
            },
            function(error) {
                console.warn("[Preload] Erro ao carregar OBJ:", error);
                createFallbackGeometry();
            }
        );
    }

    function createFallbackGeometry() {
        // Criar geometria fallback - TorusKnot animado
        const geometry = new THREE.TorusKnotGeometry(8, 2.5, 100, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0x1A3E74,
            emissive: 0x87CEEB,
            emissiveIntensity: 0.3,
            shininess: 100,
            flatShading: false
        });
        model = new THREE.Mesh(geometry, material);
        scene.add(model);
        console.log("[Preload] Geometria fallback criada");
    }

    function createFallbackAnimation() {
        // Versão simples com CSS para caso Three.js não esteja disponível
        const container = document.getElementById("preload-container");
        if (container) {
            container.innerHTML = '<div class="simple-loader"></div>';
            
            // Adicionar estilos inline para o loader simples
            const style = document.createElement("style");
            style.textContent = `
                .simple-loader {
                    width: 80px;
                    height: 80px;
                    border: 4px solid #1A3E74;
                    border-top: 4px solid #87CEEB;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(hidePreload, animationDuration);
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        if (model) {
            // Animação de rotação contínua
            model.rotation.y += 0.01;
            model.rotation.x += 0.005;

            // Efeito de pulsação suave
            const time = Date.now() * 0.001;
            const pulseScale = 1 + Math.sin(time * 2) * 0.05;
            model.scale.set(
                model.scale.x * (1 + (pulseScale - 1) * 0.01),
                model.scale.y * (1 + (pulseScale - 1) * 0.01),
                model.scale.z * (1 + (pulseScale - 1) * 0.01)
            );
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    function startAnimation() {
        if (!animationId) {
            animate();
        }
    }

    function hidePreload() {
        if (isHidden) return;
        isHidden = true;

        const preloadContainer = document.getElementById("preload-container");
        if (preloadContainer) {
            console.log("[Preload] Escondendo preload...");
            preloadContainer.style.transition = "opacity 0.8s ease-out";
            preloadContainer.style.opacity = "0";
            
            setTimeout(function() {
                preloadContainer.style.display = "none";
                
                // Limpar recursos Three.js
                if (renderer) {
                    renderer.dispose();
                }
            }, 800);
        } else {
            console.warn("[Preload] Container de preload não encontrado");
        }
    }

    // Event listeners para redimensionamento
    window.addEventListener("resize", function() {
        if (!camera || !renderer) return;
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Eventos de inicialização do site
    window.addEventListener("TemplateEngine:Ready", function() {
        console.log("[Preload] TemplateEngine:Ready recebido");
        setTimeout(hidePreload, 300);
    });

    window.addEventListener("ModulesLoaded", function() {
        console.log("[Preload] ModulesLoaded recebido");
        setTimeout(hidePreload, 300);
    });

    window.addEventListener("load", function() {
        console.log("[Preload] Window load");
        setTimeout(hidePreload, 500);
    });

    document.addEventListener("DOMContentLoaded", function() {
        console.log("[Preload] DOMContentLoaded");
        setTimeout(init, 100);
    });
})();
