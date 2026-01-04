(function(){"use strict";const e=document.getElementById("brain-canvas");if(!e)return;const t=new THREE.Scene,n=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,1e3);n.position.z=50;const a=new THREE.WebGLRenderer({canvas:e,alpha:false,antialias:true});a.setSize(window.innerWidth,window.innerHeight),a.setPixelRatio(Math.min(window.devicePixelRatio,2)),a.setClearColor(16777215);const r=7403906,o=135206232,s=135206232,i=60,c=new THREE.BufferGeometry,u=new Float32Array(3*i),d=[];for(let e=0;e<i;e++){const t=Math.random()*Math.PI*2,n=Math.acos(2*Math.random()-1),a=15+25*Math.random();u[3*e]=a*Math.sin(n)*Math.cos(t),u[3*e+1]=.8*a*Math.sin(n)*Math.sin(t),u[3*e+2]=a*Math.cos(n),d.push({x:.02*(Math.random()-.5),y:.02*(Math.random()-.5),z:.02*(Math.random()-.5)})}c.setAttribute("position",new THREE.BufferAttribute(u,3));const l=new THREE.PointsMaterial({color:r,size:2.5,transparent:true,opacity:.9,sizeAttenuation:true});const p=new THREE.Points(c,l);t.add(p);const m=new THREE.Group;t.add(m);const f=20;let h=0,g=0,v=0,y=0;function b(){for(;m.children.length>0;)m.remove(m.children[0]);const e=c.attributes.position.array;for(let t=0;t<i;t++)for(let n=t+1;n<i;n++){const a=e[3*t]-e[3*n],r=e[3*t+1]-e[3*n+1],o=e[3*t+2]-e[3*n+2],s=Math.sqrt(a*a+r*r+o*o);if(s<f){const i=new THREE.BufferGeometry,c=new Float32Array([e[3*t],e[3*t+1],e[3*t+2],e[3*n],e[3*n+1],e[3*n+2]]);i.setAttribute("position",new THREE.BufferAttribute(c,3));const l=.5*(1-s/f),p=new THREE.LineBasicMaterial({color:s,transparent:true,opacity:l});m.add(new THREE.Line(i,p))}}}function w(e){h=2*e.clientX/window.innerWidth-1,g=-(2*e.clientY/window.innerHeight-1);const t=c.attributes.position.array;for(let e=0;e<i;e++){const n=30*h-t[3*e],a=20*g-t[3*e+1];d[e].x+=1e-3*n,d[e].y+=1e-3*a}}function x(e){const t=a.canvas.getBoundingClientRect(),n=2*(e.clientX-t.left)/t.width-1,r=-(2*(e.clientY-t.top)/t.height-1);const o=c.attributes.position.array;for(let e=0;e<i;e++){const t=o[3*e]-25*n,a=o[3*e+1]-15*r,s=Math.sqrt(t*t+a*a);s<30&&(d[e].x+=t/s*.5,d[e].y+=a/s*.5)}l.color.setHex(o),setTimeout(()=>{l.color.setHex(r)},250)}function k(){requestAnimationFrame(k);const e=c.attributes.position.array;for(let t=0;t<i;t++){e[3*t]+=d[t].x,e[3*t+1]+=d[t].y,e[3*t+2]+=d[t].z,d[t].x*=.98,d[t].y*=.98,d[t].z*=.98;const n=Math.sqrt(e[3*t]*e[3*t]+e[3*t+1]*e[3*t+1]+e[3*t+2]*e[3*t+2]);n>40&&(d[t].x-=e[3*t],d[t].y-=e[3*t+1],d[t].z-=e[3*t+2])}c.attributes.position.needsUpdate=true,v+=.05*(.5*h-v),y+=.05*(.3*g-y),p.rotation.x=.5*y,p.rotation.y=.5*v,m.rotation.x=.5*y,m.rotation.y=.5*v,b(),a.render(t,n)}function C(){if(window.preloadHidden)return;window.preloadHidden=!0;const e=document.getElementById("preload-container");e&&(e.style.transition="opacity 0.5s ease-out",e.style.opacity="0",setTimeout(()=>{e.style.display="none"},500))}e.addEventListener("mousemove",w),e.addEventListener("click",x),window.addEventListener("resize",()=>{n.aspect=window.innerWidth/window.innerHeight,n.updateProjectionMatrix(),a.setSize(window.innerWidth,window.innerHeight)}),k(),window.addEventListener("ModulesLoaded",C),window.addEventListener("DOMContentLoaded",()=>{setTimeout(C,2e3)}),window.addEventListener("load",()=>{setTimeout(C,1e3)});let P=0;function S(){if(P++,P>=30)return void C();const e=document.getElementById("main-container"),t=document.getElementById("header-container"),n=e&&e.innerHTML.trim().length>100,a=t&&t.innerHTML.trim().length>50;(n||a)&&C(),setTimeout(S,200)}setTimeout(S,1e3)})();
/**
 * PRELOAD.JS
 * Animação de Pré-carregamento com Three.js
 * Calculadoras de Enfermagem
 */

(function(){
  "use strict";
  
  const e = document.getElementById("brain-canvas");
  if (!e) return;
  
  const t = new THREE.Scene,
        n = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1e3);
  
  n.position.z = 50;
  
  const a = new THREE.WebGLRenderer({canvas: e, alpha: false, antialias: true});
  a.setSize(window.innerWidth, window.innerHeight);
  a.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  a.setClearColor(16777215);
  
  const r = 7403906,
        o = 135206232,
        s = 135206232,
        i = 60,
        c = new THREE.BufferGeometry,
        u = new Float32Array(3 * i),
        d = [];
  
  for (let e = 0; e < i; e++) {
    u[3 * e] = 1.2 * (Math.random() - .5) * 100;
    u[3 * e + 1] = 1.2 * (Math.random() - .5) * 100;
    u[3 * e + 2] = 1.2 * (Math.random() - .5) * 100;
    d.push(new THREE.Vector3(1.2 * (Math.random() - .5) * 100, 1.2 * (Math.random() - .5) * 100, 1.2 * (Math.random() - .5) * 100));
  }
  
  c.setAttribute("position", new THREE.BufferAttribute(u, 3));
  
  const l = new THREE.PointsMaterial({color: r, size: 1.5});
  var p = new THREE.Points(c, l);
  t.add(p);
  
  const m = new THREE.Group;
  t.add(m);
  
  const f = new THREE.Vector3,
        h = .5,
        g = .5;
  
  let v = 0,
      y = 0;
  
  function w(e) {
    v = (e.clientX / window.innerWidth - .5) * 2;
    y = (e.clientY / window.innerHeight - .5) * 2;
  }
  
  function x(e) {
    const t = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    n.updateMatrixWorld(!0);
    const r = new THREE.Raycaster;
    r.setFromCamera(t, n);
    const a = r.intersectObjects([p]);
    a.length > 0 && (_(a[0].object.geometry.attributes.position.array[3 * a[0].index], a[0].object.geometry.attributes.position.array[3 * a[0].index + 1], a[0].object.geometry.attributes.position.array[3 * a[0].index + 2]), b());
  }
  
  function _(e, t, n) {
    const a = 3;
    for (let r = 0; r < a; r++) {
      const a = 1.2 * (Math.random() - .5) * 10,
            i = 1.2 * (Math.random() - .5) * 10,
            c = 1.2 * (Math.random() - .5) * 10,
            u = Math.random() * 20 + 20,
            d = new THREE.SphereGeometry(.2, 8, 8),
            l = new THREE.MeshBasicMaterial({color: s});
      l.blending = THREE.AdditiveBlending;
      const p = new THREE.Mesh(d, l);
      p.position.set(e, t, n);
      p.userData = {velocity: new THREE.Vector3(a, i, c), lifetime: u, age: 0};
      m.add(p);
    }
  }
  
  function b() {
    for (let e = m.children.length - 1; e >= 0; e--) {
      const t = m.children[e];
      t.userData.age++;
      t.position.add(t.userData.velocity);
      t.userData.velocity.multiplyScalar(.9);
      const n = (t.userData.lifetime - t.userData.age) / t.userData.lifetime;
      t.scale.set(n, n, n);
      t.material.opacity = n;
      t.material.color.setHex(o);
      t.userData.age >= t.userData.lifetime && m.remove(t);
    }
  }
  
  let E;
  
  function j(e, t, a) {
    if (E) return clearTimeout(E);
    l.color.setHex(o);
    E = setTimeout(() => {
      l.color.setHex(r);
    }, 250);
  }
  
  function k() {
    requestAnimationFrame(k);
    const e = c.attributes.position.array;
    for (let t = 0; t < i; t++) {
      const n = 3 * t,
            r = new THREE.Vector3(e[n], e[n + 1], e[n + 2]);
      f.copy(r).sub(d[t]);
      const a = f.lengthSq();
      a > .1 ? (r.add(f.normalize().multiplyScalar(-.01)),
      e[n] = r.x, e[n + 1] = r.y, e[n + 2] = r.z) : Math.random() < .05 && (d[t].x = 1.2 * (Math.random() - .5) * 100, d[t].y = 1.2 * (Math.random() - .5) * 100, d[t].z = 1.2 * (Math.random() - .5) * 100);
      a > 40 && (d[t].x -= e[3 * t], d[t].y -= e[3 * t + 1], d[t].z -= e[3 * t + 2]);
    }
    c.attributes.position.needsUpdate = true;
    v += .05 * (.5 * h - v);
    y += .05 * (.3 * g - y);
    p.rotation.x = .5 * y;
    p.rotation.y = .5 * v;
    m.rotation.x = .5 * y;
    m.rotation.y = .5 * v;
    b();
    a.render(t, n);
  }
  
  function C() {
    if (window.preloadHidden) return;
    window.preloadHidden = !0;
    const e = document.getElementById("preload-container");
    e && (e.style.transition = "opacity 0.5s ease-out", e.style.opacity = "0", setTimeout(() => {
      e.style.display = "none";
    }, 500));
  }
  
  e.addEventListener("mousemove", w);
  e.addEventListener("click", x);
  
  window.addEventListener("resize", () => {
    n.aspect = window.innerWidth / window.innerHeight;
    n.updateProjectionMatrix();
    a.setSize(window.innerWidth, window.innerHeight);
  });
  
  k();
  
  window.addEventListener("ModulesLoaded", C);
  
  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(C, 2e3);
  });
  
  window.addEventListener("load", () => {
    setTimeout(C, 1e3);
  });
  
  let P = 0;
  
  function S() {
    if (P++, P >= 30) return void C();
    const e = document.getElementById("main-container"),
          t = document.getElementById("header-container"),
          n = e && e.innerHTML.trim().length > 100,
          a = t && t.innerHTML.trim().length > 50;
    (n || a) && C();
    setTimeout(S, 200);
  }
  
  setTimeout(S, 1e3);
})();
