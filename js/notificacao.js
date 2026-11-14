/**
 * Consulta da lista nacional de notificação compulsória.
 * O HTML (lista, filtros e mapa) é gerado de configs/conteudo/notificacao-compulsoria.json.
 */
(function () {
  "use strict";

  var raiz = document.querySelector("[data-notif]");
  if (!raiz) return;

  var busca = raiz.querySelector("[data-notif-busca]");
  var lista = raiz.querySelector("[data-notif-lista]");
  var vazio = raiz.querySelector("[data-notif-vazio]");
  var local = raiz.querySelector("[data-notif-local]");
  var filtros = { periodicity: "all", type: "all" };

  function marcar(botao) {
    var grupo = botao.getAttribute("data-group");
    raiz.querySelectorAll('[data-group="' + grupo + '"]').forEach(function (outro) {
      outro.classList.remove("bg-nurse-primary", "text-white", "border-nurse-primary");
      outro.setAttribute("aria-pressed", "false");
    });
    botao.classList.add("bg-nurse-primary", "text-white", "border-nurse-primary");
    botao.setAttribute("aria-pressed", "true");
  }

  function aplicar() {
    var termo = (busca.value || "").trim().toLowerCase();
    var visiveis = 0;
    lista.querySelectorAll("[data-periodicity]").forEach(function (item) {
      var texto = item.textContent.toLowerCase();
      var okPeriodo = filtros.periodicity === "all" || item.getAttribute("data-periodicity") === filtros.periodicity;
      var okTipo = filtros.type === "all" || item.getAttribute("data-type") === filtros.type;
      var ok = okPeriodo && okTipo && texto.indexOf(termo) !== -1;
      item.classList.toggle("hidden", !ok);
      if (ok) visiveis += 1;
    });
    vazio.classList.toggle("hidden", visiveis !== 0);
  }

  raiz.querySelectorAll("[data-group]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      filtros[botao.getAttribute("data-group")] = botao.getAttribute("data-filter");
      marcar(botao);
      aplicar();
    });
  });
  busca.addEventListener("input", aplicar);

  raiz.querySelectorAll(".state").forEach(function (estado) {
    estado.addEventListener("click", function () {
      raiz.querySelectorAll(".state.selected").forEach(function (outro) {
        outro.classList.remove("selected");
        outro.style.fill = "";
      });
      estado.classList.add("selected");
      estado.style.fill = "#1A3E74";
      local.textContent = estado.getAttribute("title") || "Nacional";
    });
  });

  var limpar = raiz.querySelector("[data-notif-limpar]");
  limpar.addEventListener("click", function () {
    filtros.periodicity = "all";
    filtros.type = "all";
    busca.value = "";
    local.textContent = "Nacional";
    raiz.querySelectorAll(".state.selected").forEach(function (estado) {
      estado.classList.remove("selected");
      estado.style.fill = "";
    });
    raiz.querySelectorAll("[data-group]").forEach(function (botao) {
      var ativo = botao.getAttribute("data-filter") === "all";
      botao.classList.toggle("bg-nurse-primary", ativo);
      botao.classList.toggle("text-white", ativo);
      botao.classList.toggle("border-nurse-primary", ativo);
      botao.setAttribute("aria-pressed", ativo ? "true" : "false");
    });
    aplicar();
  });
})();
