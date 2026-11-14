/**
 * MODULE-LOADER-V5.JS — Integrador de componentes modulares
 * Calculadoras de Enfermagem
 *
 * Uma única tag de script integra topo (acessibilidade), cabeçalho e rodapé
 * modulares em qualquer página do site:
 *
 *   <script src="../../assets/js/module-loader-v5.js" defer></script>
 *
 * O caminho base é resolvido a partir do próprio src do script, portanto
 * funciona em qualquer profundidade de diretório, em ambiente local e no
 * GitHub Pages, sem configuração adicional.
 *
 * O que ele faz:
 *  1. Injeta as folhas de estilo v4 (variables, header, footer, accessibility)
 *     caso ainda não estejam presentes.
 *  2. Garante os contêineres #accessibility-container, #header-container e
 *     #footer-container (cria se não existirem).
 *  3. Busca os componentes gerados (assets/components/*.html) e os injeta.
 *  4. Carrega os scripts v4 (event-bus, header, footer, accessibility) e
 *     dispara os eventos de inicialização esperados por eles.
 */
(function () {
  'use strict';

  // Base = URL deste script sem o sufixo /assets/js/module-loader-v5.js
  var scriptSrc = (document.currentScript && document.currentScript.src) || '';
  var BASE = scriptSrc.replace(/\/assets\/js\/module-loader-v5\.js.*$/, '');
  if (!BASE) return;

  var CSS = [
    'assets/css/variables-v4.css',
    'assets/css/header-v4.css',
    'assets/css/footer-v4.css',
    'assets/css/accessibility-v4.css'
  ];

  var SCRIPTS = [
    'assets/js/event-bus-v4.js',
    'assets/js/header-v4.js',
    'assets/js/footer-v4.js',
    'assets/js/accessibility-v4.js'
  ];

  var COMPONENTES = [
    { id: 'accessibility-container', url: 'assets/components/accessibility-v4.html' },
    { id: 'header-container', url: 'assets/components/header-v4.html' },
    { id: 'footer-container', url: 'assets/components/footer-v4.html' }
  ];

  function injetarCSS() {
    CSS.forEach(function (href) {
      var abs = BASE + '/' + href;
      if (document.querySelector('link[href$="' + href.split('/').pop() + '"]')) return;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = abs;
      document.head.appendChild(link);
    });
  }

  function garantirContainers() {
    var body = document.body;

    if (!document.getElementById('accessibility-container')) {
      var acc = document.createElement('div');
      acc.id = 'accessibility-container';
      body.insertBefore(acc, body.firstChild);
    }

    if (!document.getElementById('header-container')) {
      var header = document.createElement('div');
      header.id = 'header-container';
      header.setAttribute('role', 'banner');
      header.className = 'sticky top-0 z-50 bg-white dark:bg-nurse-bgDark min-h-[70px] transition-opacity duration-500 opacity-50 shadow-sm';
      var acc2 = document.getElementById('accessibility-container');
      body.insertBefore(header, acc2.nextSibling);
    }

    if (!document.getElementById('footer-container')) {
      var footer = document.createElement('div');
      footer.id = 'footer-container';
      footer.setAttribute('role', 'contentinfo');
      footer.className = 'relative z-10 transition-opacity duration-500 opacity-50';
      body.appendChild(footer);
    }
  }

  function carregarScript(src) {
    return new Promise(function (resolve) {
      if (document.querySelector('script[src$="' + src.split('/').pop() + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = BASE + '/' + src;
      s.onload = resolve;
      s.onerror = function () {
        console.warn('[loader-v5] Falha ao carregar script:', src);
        resolve();
      };
      document.head.appendChild(s);
    });
  }

  function carregarComponente(item) {
    var container = document.getElementById(item.id);
    if (!container) return Promise.resolve(false);
    return fetch(BASE + '/' + item.url)
      .then(function (res) {
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.text();
      })
      .then(function (html) {
        container.innerHTML = html;
        container.style.opacity = '1';
        var evento = new CustomEvent('moduleLoaded', { detail: { id: item.id, url: item.url } });
        container.dispatchEvent(evento);
        document.dispatchEvent(new CustomEvent('moduleLoaded', { detail: { id: item.id, url: item.url } }));
        return true;
      })
      .catch(function (e) {
        console.warn('[loader-v5] Módulo ' + item.id + ' não carregado:', e);
        // Esconde a casca vazia para não deixar faixas semi-transparentes.
        if (!container.innerHTML.trim()) container.style.display = 'none';
        return false;
      });
  }

  function inicializar() {
    injetarCSS();
    garantirContainers();

    // Scripts em sequência (event-bus primeiro) e componentes em paralelo
    SCRIPTS.reduce(function (p, src) {
      return p.then(function () { return carregarScript(src); });
    }, Promise.resolve())
      .then(function () {
        return Promise.all(COMPONENTES.map(carregarComponente));
      })
      .then(function (resultados) {
        var ok = {};
        COMPONENTES.forEach(function (c, i) { ok[c.id] = resultados[i]; });

        // Só inicializa cada módulo se o respectivo componente foi injetado;
        // caso contrário, initFooter entraria em retry infinito procurando
        // um rodapé que nunca chegou.
        if (ok['header-container'] && window.HeaderModule && typeof window.HeaderModule.init === 'function') {
          window.HeaderModule.init();
        }
        if (ok['footer-container']) {
          window.dispatchEvent(new CustomEvent('Module:footer-v2-container:Ready'));
        }
        if (ok['accessibility-container']) {
          if (window.AccessControl && typeof window.AccessControl.init === 'function') {
            window.AccessControl.init();
          }
          if (typeof window.initializeAccessibility === 'function') window.initializeAccessibility();
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
})();
