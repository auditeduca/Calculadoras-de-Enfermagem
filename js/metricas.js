(function () {
  "use strict";
  var ENDPOINT = "https://asjkftjfbkuuhilnqonx.supabase.co/functions/v1/analytics-metrics";
  var range = "last_30_days";
  var fmt = function (v) {
    return Number.isFinite(Number(v)) ? new Intl.NumberFormat("pt-BR").format(Number(v)) : "—";
  };
  var pct = function (v) {
    return Number.isFinite(Number(v)) ? (Number(v) * 100).toFixed(1) + "%" : "—";
  };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  };
  function status(ok, texto) {
    var el = document.getElementById("status-operacional");
    if (!el) return;
    var dot = el.querySelector(".metricas-dot");
    if (dot) dot.className = "metricas-dot " + (ok ? "ok" : "err");
    el.lastChild.textContent = " " + texto;
  }
  function preencher(d) {
    var t = d.totals || {};
    document.getElementById("k-users").textContent = fmt(t.activeUsers);
    document.getElementById("k-sessions").textContent = fmt(t.sessions);
    document.getElementById("k-views").textContent = fmt(t.views);
    document.getElementById("k-eng").textContent = pct(t.engagementRate);
    var linhas = (d.pages || []).slice(0, 20).map(function (x, i) {
      return "<tr><td>" + (i + 1) + "</td><td>" + esc(x.title || x.label || x.path || "—") +
        "</td><td class='num'>" + fmt(x.views) + "</td><td class='num'>" + fmt(x.activeUsers) + "</td></tr>";
    }).join("");
    document.querySelector("#tabela-paginas tbody").innerHTML = linhas || "<tr><td colspan='4'>Sem dados.</td></tr>";
    var quando = d.generatedAt ? new Date(d.generatedAt).toLocaleString("pt-BR") : "agora";
    document.getElementById("ultima-atualizacao").textContent = "Última atualização: " + quando;
    status(true, "Dados disponíveis · " + quando);
  }
  function atualizar() {
    status(false, "Consultando…");
    fetch(ENDPOINT + "?range=" + encodeURIComponent(range), { cache: "no-store", headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j || j.version !== 2) throw new Error("resposta"); return j; }); })
      .then(preencher)
      .catch(function () {
        status(false, "Métricas indisponíveis no momento");
        document.getElementById("ultima-atualizacao").textContent = "Última atualização: não disponível";
      });
  }
  document.querySelectorAll(".periodo").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".periodo").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      range = b.getAttribute("data-range");
      atualizar();
    });
  });
  atualizar();
})();
