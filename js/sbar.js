(function () {
  "use strict";

  var campos = [
    ["sbar-situacao", "Situação"],
    ["sbar-contexto", "Contexto"],
    ["sbar-avaliacao", "Avaliação"],
    ["sbar-recomendacao", "Recomendação"]
  ];

  function montar() {
    return campos.map(function (par) {
      var el = document.getElementById(par[0]);
      var texto = el && el.value ? el.value.trim() : "";
      return par[1] + ": " + (texto || "—");
    }).join("\n\n");
  }

  function copiar() {
    var aviso = document.getElementById("sbar-aviso");
    var texto = montar();
    function ok() {
      if (aviso) aviso.textContent = "Passagem copiada.";
    }
    function falha() {
      if (aviso) aviso.textContent = "Não foi possível copiar. Selecione o texto e copie manualmente.";
    }
    var area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    var copiou = false;
    try { copiou = document.execCommand("copy"); } catch (erro) { copiou = false; }
    area.remove();
    if (copiou) {
      ok();
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(ok, falha);
      return;
    }
    falha();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var botao = document.getElementById("sbar-copiar");
    if (botao) botao.addEventListener("click", copiar);
  });
})();
