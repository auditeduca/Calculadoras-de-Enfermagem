(function () {
  var bruto = document.getElementById("busca-dados");
  var campo = document.getElementById("busca-q");
  var topicosEl = document.getElementById("busca-topicos");
  var lista = document.getElementById("busca-lista");
  var resumo = document.getElementById("busca-resumo");
  if (!bruto || !campo || !topicosEl || !lista) return;

  var paginas = JSON.parse(bruto.textContent);
  var params = new URLSearchParams(window.location.search);
  var topicoAtivo = (params.get("topico") || "").replace(/^#/, "");
  campo.value = params.get("q") || "";

  function normalizar(valor) {
    return (valor || "").replace(/^#/, "").trim().toLocaleLowerCase("pt-BR");
  }

  function topicos() {
    var vistos = [];
    paginas.forEach(function (pagina) {
      (pagina.tags || []).forEach(function (tag) {
        if (vistos.indexOf(tag) === -1) vistos.push(tag);
      });
    });
    vistos.sort(function (a, b) {
      return a.localeCompare(b, "pt-BR");
    });
    return vistos;
  }

  function atualizarEndereco() {
    var consulta = new URLSearchParams();
    if (topicoAtivo) consulta.set("topico", topicoAtivo);
    if (campo.value.trim()) consulta.set("q", campo.value.trim());
    var busca = consulta.toString();
    history.replaceState(null, "", busca ? "?" + busca : window.location.pathname);
  }

  function desenhar() {
    var q = normalizar(campo.value);
    var ativo = normalizar(topicoAtivo);
    topicosEl.innerHTML = "";
    topicos().forEach(function (tag) {
      var botao = document.createElement("button");
      botao.type = "button";
      botao.className = "topico-btn" + (normalizar(tag) === ativo ? " ativo" : "");
      botao.textContent = "#" + tag;
      botao.addEventListener("click", function () {
        topicoAtivo = normalizar(tag) === ativo ? "" : tag;
        atualizarEndereco();
        desenhar();
      });
      topicosEl.appendChild(botao);
    });

    var achados = paginas.filter(function (pagina) {
      var tags = pagina.tags || [];
      var noTopico = !ativo || tags.some(function (tag) { return normalizar(tag) === ativo; });
      var texto = normalizar(pagina.title + " " + tags.join(" "));
      var naBusca = !q || texto.indexOf(q) !== -1;
      return noTopico && naBusca;
    });

    lista.innerHTML = "";
    if (!achados.length) {
      resumo.textContent = "Nenhuma página encontrada para esse tópico.";
      return;
    }
    resumo.textContent = achados.length + (achados.length === 1 ? " página" : " páginas");
    achados.forEach(function (pagina) {
      var item = document.createElement("li");
      item.className = "py-4";
      var link = document.createElement("a");
      link.href = pagina.href;
      link.className = "text-lg font-bold text-nurse-primary dark:text-white hover:underline";
      link.textContent = pagina.title;
      item.appendChild(link);
      var faixa = document.createElement("div");
      faixa.className = "flex flex-wrap gap-2 mt-2";
      (pagina.tags || []).forEach(function (tag) {
        var pill = document.createElement("button");
        pill.type = "button";
        pill.className = "tag-pill";
        pill.textContent = "#" + tag;
        pill.addEventListener("click", function () {
          topicoAtivo = tag;
          atualizarEndereco();
          desenhar();
        });
        faixa.appendChild(pill);
      });
      item.appendChild(faixa);
      lista.appendChild(item);
    });
  }

  campo.addEventListener("input", function () {
    atualizarEndereco();
    desenhar();
  });
  desenhar();
})();
