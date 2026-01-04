/**
 * PRELOAD.JS
 * Animação de Pré-carregamento com Three.js
 * Calculadoras de Enfermagem
 */

(function(){
  "use strict";
  
  let canvas, renderer, scene, camera, points, particleGroup;
  let mouseX = 0, mouseY = 0;
  let animationId;
  let isHidden = false;
  
  // Configurações
  const config = {
    particleCount: 60,
    particleColor: 0x7403906,
    particleActiveColor: 0x0812E78,
    particleSize: 1.5
  };
  
  // Inicializa quando o DOM estiver pronto
  function init() {
    console.log('[Preload] Inicializando...');
    
    canvas = document.getElementById("brain-canvas");
    if (!canvas) {
      console.warn('[Preload] Canvas não encontrado');
      // Ainda tenta esconder o preload mesmo sem canvas
      setTimeout(hidePreload, 2000);
      return;
    }
    
    console.log('[Preload] Canvas encontrado, configurando Three.js...');
    setupThreeJS();
    setupEventListeners();
    startAnimation();
    
    // Esconde após timeout (fallback de segurança)
    setTimeout(hidePreload, 4000);
  }
  
  function setupThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    
    renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: false, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xFFFFFF);
    
    // Cria partículas
    createParticles();
  }
  
  function createParticles() {
    const positions = new Float32Array(config.particleCount * 3);
    const targets = [];
    
    for (let i = 0; i < config.particleCount; i++) {
      positions[i * 3] = 1.2 * (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = 1.2 * (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = 1.2 * (Math.random() - 0.5) * 100;
      targets.push(new THREE.Vector3(
        1.2 * (Math.random() - 0.5) * 100,
        1.2 * (Math.random() - 0.5) * 100,
        1.2 * (Math.random() - 0.5) * 100
      ));
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: config.particleColor,
      size: config.particleSize
    });
    
    points = new THREE.Points(geometry, material);
    scene.add(points);
    
    particleGroup = new THREE.Group();
    scene.add(particleGroup);
    
    // Armazena targets no objeto points para uso na animação
    points.userData.targets = targets;
  }
  
  function createExplosion(x, y, z) {
    const particleCount = 3;
    for (let i = 0; i < particleCount; i++) {
      const velocity = new THREE.Vector3(
        1.2 * (Math.random() - 0.5) * 10,
        1.2 * (Math.random() - 0.5) * 10,
        1.2 * (Math.random() - 0.5) * 10
      );
      const lifetime = Math.random() * 20 + 20;
      
      const geometry = new THREE.SphereGeometry(0.2, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: config.particleActiveColor,
        transparent: true,
        opacity: 1
      });
      material.blending = THREE.AdditiveBlending;
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(x, y, z);
      particle.userData = { velocity: velocity, lifetime: lifetime, age: 0 };
      particleGroup.add(particle);
    }
  }
  
  function updateParticles() {
    if (!points) return;
    
    const positions = points.geometry.attributes.position.array;
    const targets = points.userData.targets;
    
    for (let i = 0; i < config.particleCount; i++) {
      const i3 = i * 3;
      const currentPos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      const target = targets[i];
      
      const distanceSq = currentPos.distanceToSquared(target);
      
      if (distanceSq > 0.1) {
        const direction = currentPos.clone().sub(target).normalize();
        positions[i3] = currentPos.x + direction.x * -0.01;
        positions[i3 + 1] = currentPos.y + direction.y * -0.01;
        positions[i3 + 2] = currentPos.z + direction.z * -0.01;
      } else if (Math.random() < 0.05) {
        targets[i].x = 1.2 * (Math.random() - 0.5) * 100;
        targets[i].y = 1.2 * (Math.random() - 0.5) * 100;
        targets[i].z = 1.2 * (Math.random() - 0.5) * 100;
      }
      
      if (distanceSq > 40) {
        targets[i].x -= positions[i3];
        targets[i].y -= positions[i3 + 1];
        targets[i].z -= positions[i3 + 2];
      }
    }
    
    points.geometry.attributes.position.needsUpdate = true;
  }
  
  function updateExplosions() {
    if (!particleGroup) return;
    
    for (let i = particleGroup.children.length - 1; i >= 0; i--) {
      const particle = particleGroup.children[i];
      particle.userData.age++;
      
      particle.position.add(particle.userData.velocity);
      particle.userData.velocity.multiplyScalar(0.9);
      
      const lifeRatio = (particle.userData.lifetime - particle.userData.age) / particle.userData.lifetime;
      particle.scale.set(lifeRatio, lifeRatio, lifeRatio);
      particle.material.opacity = lifeRatio;
      particle.material.color.setHex(config.particleActiveColor);
      
      if (particle.userData.age >= particle.userData.lifetime) {
        particleGroup.remove(particle);
      }
    }
  }
  
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    mouseX += 0.05 * (0.5 * 0.5 - mouseX);
    mouseY += 0.05 * (0.3 * 0.5 - mouseY);
    
    if (points) {
      points.rotation.x = 0.5 * mouseY;
      points.rotation.y = 0.5 * mouseX;
    }
    
    if (particleGroup) {
      particleGroup.rotation.x = 0.5 * mouseY;
      particleGroup.rotation.y = 0.5 * mouseX;
    }
    
    updateParticles();
    updateExplosions();
    
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }
  
  function startAnimation() {
    if (!animationId) {
      animate();
    }
  }
  
  function setupEventListeners() {
    // Mouse move
    document.addEventListener('mousemove', function(e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    
    // Click - cria explosão
    document.addEventListener('click', function(e) {
      if (!canvas || isHidden) return;
      
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      
      camera.updateMatrixWorld();
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObject(points);
      if (intersects.length > 0) {
        const index = intersects[0].index;
        const pos = points.geometry.attributes.position;
        createExplosion(
          pos.array[index * 3],
          pos.array[index * 3 + 1],
          pos.array[index * 3 + 2]
        );
      }
    });
    
    // Resize
    window.addEventListener('resize', function() {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  function hidePreload() {
    if (isHidden) return;
    isHidden = true;
    
    const preloadContainer = document.getElementById("preload-container");
    if (preloadContainer) {
      console.log('[Preload] Escondendo preload...');
      preloadContainer.style.transition = "opacity 0.5s ease-out";
      preloadContainer.style.opacity = "0";
      setTimeout(function() {
        preloadContainer.style.display = "none";
      }, 500);
    } else {
      console.warn('[Preload] Container de preload não encontrado');
    }
  }
  
  // Evento do template-engine
  window.addEventListener('TemplateEngine:Ready', function() {
    console.log('[Preload] TemplateEngine:Ready recebido');
    setTimeout(hidePreload, 300);
  });
  
  // Evento ModulesLoaded (compatibilidade)
  window.addEventListener('ModulesLoaded', function() {
    console.log('[Preload] ModulesLoaded recebido');
    setTimeout(hidePreload, 300);
  });
  
  // Fallback: esconde após load
  window.addEventListener('load', function() {
    console.log('[Preload] Window load');
    setTimeout(hidePreload, 500);
  });
  
  // Inicializa no DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[Preload] DOMContentLoaded');
    setTimeout(init, 50);
  });
})();
