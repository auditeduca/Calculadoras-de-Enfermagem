/**
 * Runtime único das calculadoras.
 * Lê configs/paginas/<id>.json (e, se houver, configs/i18n/<lang>/<id>.json).
 * Modos: formula (aritmética segura), score (soma de opções) e named
 * (funções deste arquivo). Não avalia código arbitrário.
 */
(function (root) {
  'use strict';

  var FORMATOS = {
    concentrationType: function (value) {
      var types = { 100: 'U100', 200: 'U200', 300: 'U300' };
      return types[Number(value)] || String(value);
    }
  };

  function gasometria(v) {
    var ph = Number(v.ph);
    var paco2 = Number(v.paco2);
    var hco3 = Number(v.hco3);
    var po2 = Number(v.po2);
    var disturbio = 'Equilíbrio ácido-básico';
    var conduct = 'pH, PaCO₂ e HCO₃ dentro das faixas de referência usuais.';
    if (ph < 7.35 && hco3 < 22) {
      disturbio = 'Acidose metabólica';
      conduct = 'Investigar a causa de base e corrigir o distúrbio conforme protocolo.';
    } else if (ph < 7.35 && paco2 > 45) {
      disturbio = 'Acidose respiratória';
      conduct = 'Avaliar ventilação e permeabilidade da via aérea.';
    } else if (ph > 7.45 && hco3 > 26) {
      disturbio = 'Alcalose metabólica';
      conduct = 'Rever perdas ácidas, cloreto e reposição volêmica.';
    } else if (ph > 7.45 && paco2 < 35) {
      disturbio = 'Alcalose respiratória';
      conduct = 'Investigar hiperventilação (dor, ansiedade, hipoxemia).';
    } else if (ph < 7.35) {
      disturbio = 'Acidemia';
      conduct = 'Correlacionar PaCO₂ e HCO₃ para definir o componente dominante.';
    } else if (ph > 7.45) {
      disturbio = 'Alcalemia';
      conduct = 'Correlacionar PaCO₂ e HCO₃ para definir o componente dominante.';
    }
    if (po2 < 60) conduct += ' Hipoxemia grave (PaO₂ < 60 mmHg).';
    else if (po2 < 80) conduct += ' Hipoxemia (PaO₂ < 80 mmHg).';
    return {
      env: { ph: ph, paco2: paco2, hco3: hco3, po2: po2, classificacao: disturbio },
      display: disturbio,
      interpretation: {
        label: disturbio,
        conduct: conduct,
        color: ph < 7.35 || ph > 7.45 || po2 < 80 ? 'text-red-600' : 'text-green-600',
        bg: 'bg-slate-50'
      }
    };
  }

  function gestacional(v) {
    if (!v.dum) throw new Error('Informe a data da última menstruação');
    var dum = new Date(v.dum + 'T00:00:00');
    if (isNaN(dum.getTime())) throw new Error('Data da última menstruação inválida');
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var dias = Math.floor((hoje.getTime() - dum.getTime()) / 86400000);
    if (dias < 0) throw new Error('A data da última menstruação é futura');
    if (dias > 315) throw new Error('Data fora do intervalo de uma gestação');
    var semanas = Math.floor(dias / 7);
    var resto = dias % 7;
    var dpp = new Date(dum.getTime() + 280 * 86400000);
    var fmt = dpp.toLocaleDateString('pt-BR');
    var texto = semanas + ' sem ' + resto + ' d';
    return {
      env: { semanas: semanas, dias: resto, dpp: fmt },
      display: texto,
      interpretation: {
        label: 'DPP ' + fmt,
        conduct: 'Idade gestacional pela DUM, regra de Naegele (280 dias). Confirmar com ultrassom quando disponível.',
        color: 'text-nurse-primary',
        bg: 'bg-slate-50'
      }
    };
  }

  var NOMEADAS = { gasometria: gasometria, gestacional: gestacional };

  function pular(s, i) {
    while (s[i] === ' ') i += 1;
    return i;
  }

  function avaliarExpressao(s, env) {
    var i = 0;
    function prim() {
      i = pular(s, i);
      var ch = s[i];
      if (ch === '(') {
        i += 1;
        var v = soma();
        i = pular(s, i);
        if (s[i] !== ')') throw new Error('Parêntese não fechado');
        i += 1;
        return v;
      }
      if (ch === '+' || ch === '-') {
        i += 1;
        var n = prim();
        return ch === '-' ? -n : n;
      }
      if (ch >= '0' && ch <= '9' || ch === '.') {
        var j = i;
        while (s[j] >= '0' && s[j] <= '9' || s[j] === '.') j += 1;
        var num = Number(s.slice(i, j));
        if (!isFinite(num)) throw new Error('Número inválido');
        i = j;
        return num;
      }
      if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || ch === '_') {
        var k = i;
        while (/[A-Za-z0-9_]/.test(s[k] || '')) k += 1;
        var nome = s.slice(i, k);
        i = k;
        if (!Object.prototype.hasOwnProperty.call(env, nome)) {
          throw new Error('Identificador desconhecido: ' + nome);
        }
        return Number(env[nome]);
      }
      throw new Error('Expressão inválida');
    }
    function prod() {
      var v = prim();
      for (;;) {
        i = pular(s, i);
        if (s[i] === '*') { i += 1; v *= prim(); }
        else if (s[i] === '/') {
          i += 1;
          var d = prim();
          if (d === 0) throw new Error('Divisão por zero');
          v /= d;
        } else break;
      }
      return v;
    }
    function soma() {
      var v = prod();
      for (;;) {
        i = pular(s, i);
        if (s[i] === '+') { i += 1; v += prod(); }
        else if (s[i] === '-') { i += 1; v -= prod(); }
        else break;
      }
      return v;
    }
    var total = soma();
    i = pular(s, i);
    if (i !== s.length) throw new Error('Sobra na expressão');
    return total;
  }

  function avaliarFormula(formula, env) {
    formula.split(';').forEach(function (parte) {
      var trecho = parte.trim();
      if (!trecho) return;
      var eq = trecho.indexOf('=');
      if (eq < 1) throw new Error('Atribuição ausente');
      var nome = trecho.slice(0, eq).trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(nome)) throw new Error('Nome inválido');
      env[nome] = avaliarExpressao(trecho.slice(eq + 1).trim(), env);
    });
    return env;
  }

  function mesclar(base, overlay) {
    if (!overlay || typeof overlay !== 'object') return base;
    if (Array.isArray(base)) {
      return base.map(function (item, idx) {
        return mesclar(item, overlay[idx]);
      });
    }
    var saida = {};
    Object.keys(base || {}).forEach(function (k) {
      if (overlay && Object.prototype.hasOwnProperty.call(overlay, k)) {
        var bv = base[k];
        var ov = overlay[k];
        if (bv && ov && typeof bv === 'object' && typeof ov === 'object') saida[k] = mesclar(bv, ov);
        else saida[k] = ov;
      } else {
        saida[k] = base[k];
      }
    });
    return saida;
  }

  function escapar(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatar(n, casas) {
    if (typeof n === 'string') return n;
    var d = casas == null ? 2 : casas;
    return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function campoPorId(cfg, id) {
    var achado = null;
    (cfg.form.sections || []).forEach(function (sec) {
      (sec.fields || []).forEach(function (f) { if (f.id === id) achado = f; });
    });
    return achado;
  }

  function lerValor(field, el) {
    if (field.type === 'select') {
      var opt = null;
      (field.options || []).forEach(function (o) {
        if (String(o.value) === el.value) opt = o;
      });
      if (opt && typeof opt.score === 'number') return opt.score;
      var n = Number(el.value);
      return isFinite(n) ? n : el.value;
    }
    if (field.type === 'number') {
      if (el.value === '') return field.required ? NaN : 0;
      return Number(el.value);
    }
    return el.value;
  }

  function interpretar(cfg, env, nomeado) {
    if (nomeado && nomeado.interpretation) return nomeado.interpretation;
    var faixas = cfg.calculation.interpretation || [];
    var chave = (cfg.calculation.result && cfg.calculation.result.interpretationOf) || (cfg.calculation.result && cfg.calculation.result.key);
    var valor = chave && Object.prototype.hasOwnProperty.call(env, chave) ? Number(env[chave]) : NaN;
    var faixa = faixas.find(function (f) { return valor <= f.max; }) || faixas[faixas.length - 1];
    return faixa || { label: '', conduct: '' };
  }

  var api = {
    avaliarFormula: avaliarFormula,
    avaliarExpressao: avaliarExpressao,
    NOMEADAS: NOMEADAS,
    mesclar: mesclar
  };

  function boot() {
    var body = document.body;
    if (!body || !body.getAttribute('data-calc')) return;
    var configUrl = body.getAttribute('data-config');
    var i18nUrl = body.getAttribute('data-i18n');
    var rootUrl = '';
    var tag = document.querySelector('script[src*="calculadora.js"]');
    if (tag && tag.src) rootUrl = tag.src.replace(/\/js\/calculadora\.js.*$/, '');

    fetch(configUrl)
      .then(function (r) { if (!r.ok) throw new Error('config'); return r.json(); })
      .then(function (cfg) {
        if (!i18nUrl) return cfg;
        return fetch(i18nUrl).then(function (r) {
          if (!r.ok) return cfg;
          return r.json().then(function (ov) { return mesclar(cfg, ov); });
        }).catch(function () { return cfg; });
      })
      .then(function (cfg) { iniciar(cfg, rootUrl); })
      .catch(function () { notificar('Não foi possível carregar a calculadora.', 'error'); });
  }

  var estado = { cfg: null, ultimo: null, nomeado: null };

  function iniciar(cfg, rootUrl) {
    estado.cfg = cfg;
    document.title = cfg.seo.title || document.title;
    var badge = document.getElementById('calc-badge');
    var titulo = document.getElementById('calc-title');
    var desc = document.getElementById('calc-description');
    if (badge) badge.textContent = (cfg.header && cfg.header.badge) || '';
    if (titulo) titulo.textContent = (cfg.header && cfg.header.title) || cfg.metadata.title;
    if (desc) desc.textContent = (cfg.header && cfg.header.description) || '';
    renderTrilha(cfg, rootUrl);
    renderAbas(cfg);
    renderForm(cfg);
    var botoes = (cfg.form && cfg.form.buttons) || {};
    var calc = document.getElementById('btn-calculate');
    var reset = document.getElementById('btn-reset');
    if (calc) {
      calc.innerHTML = '<i class="fa-solid ' + escapar((botoes.calculate && botoes.calculate.icon) || 'fa-calculator') + '"></i> ' + escapar((botoes.calculate && botoes.calculate.label) || 'Calcular');
      calc.addEventListener('click', calcular);
    }
    if (reset) {
      reset.innerHTML = '<i class="fa-solid ' + escapar((botoes.reset && botoes.reset.icon) || 'fa-rotate-left') + '"></i> ' + escapar((botoes.reset && botoes.reset.label) || 'Limpar');
      reset.addEventListener('click', limpar);
    }
    var fechar = document.getElementById('calc-modal-close');
    if (fechar) fechar.addEventListener('click', function () {
      document.getElementById('calc-modal').classList.add('hidden');
    });
  }

  function renderTrilha(cfg, rootUrl) {
    var nav = document.getElementById('breadcrumb');
    if (!nav) return;
    var atual = (cfg.header && cfg.header.title) || (cfg.metadata && cfg.metadata.title) || '';
    var inicio = rootUrl.replace(/\/$/, '') + '/index.html';
    nav.className = 'text-sm text-slate-500 mb-4';
    nav.setAttribute('aria-label', 'Trilha');
    nav.innerHTML = '<a class="hover:underline" href="' + escapar(inicio) + '">Início</a>'
      + ' <span aria-hidden="true">&gt;</span> <span>' + escapar(atual) + '</span>';
  }

  function renderAbas(cfg) {
    var bar = document.getElementById('calc-tabs');
    if (!bar) return;
    bar.innerHTML = '';
    (cfg.tabs || []).forEach(function (tab, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'px-4 py-2 rounded-full text-sm font-bold border ' + (idx === 0 ? 'bg-nurse-primary text-white border-nurse-primary' : 'bg-white text-slate-600 border-slate-200');
      b.textContent = tab.label;
      b.addEventListener('click', function () { abrirAba(cfg, tab, b); });
      bar.appendChild(b);
    });
  }

  function abrirAba(cfg, tab, botao) {
    var calc = document.getElementById('pane-calculator');
    var conteudo = document.getElementById('pane-content');
    Array.prototype.forEach.call(document.querySelectorAll('#calc-tabs button'), function (el) {
      el.className = 'px-4 py-2 rounded-full text-sm font-bold border bg-white text-slate-600 border-slate-200';
    });
    botao.className = 'px-4 py-2 rounded-full text-sm font-bold border bg-nurse-primary text-white border-nurse-primary';
    if (tab.type === 'calculator') {
      calc.classList.remove('hidden');
      conteudo.classList.add('hidden');
      return;
    }
    calc.classList.add('hidden');
    conteudo.classList.remove('hidden');
    if (tab.type === 'list') {
      conteudo.innerHTML = '<ol class="list-decimal pl-5 space-y-2">' + (tab.items || []).map(function (item) {
        return '<li>' + escapar(item) + '</li>';
      }).join('') + '</ol>';
      return;
    }
    var c = tab.content || {};
    var html = '';
    if (c.title) html += '<h2 class="text-xl font-bold mb-3">' + escapar(c.title) + '</h2>';
    html += c.body || '';
    conteudo.innerHTML = html;
  }

  function renderForm(cfg) {
    var form = document.getElementById('calculator-form');
    if (!form) return;
    var html = '';
    (cfg.form.sections || []).forEach(function (sec) {
      html += '<fieldset class="mb-6"><legend class="text-lg font-bold mb-3">' + escapar(sec.title || '') + '</legend>';
      (sec.fields || []).forEach(function (field) {
        html += '<div class="mb-4"><label class="block text-sm font-bold mb-1" for="' + escapar(field.id) + '">' + escapar(field.label);
        if (field.required) html += ' <span class="text-red-600">*</span>';
        html += '</label>';
        if (field.type === 'select') {
          html += '<select id="' + escapar(field.id) + '" class="w-full p-3 border rounded-lg bg-white dark:bg-slate-800">';
          (field.options || []).forEach(function (opt) {
            var sel = String(opt.value) === String(field.default) ? ' selected' : '';
            html += '<option value="' + escapar(opt.value) + '"' + sel + '>' + escapar(opt.label) + '</option>';
          });
          html += '</select>';
        } else if (field.type === 'number') {
          html += '<input id="' + escapar(field.id) + '" type="number" class="w-full p-3 border rounded-lg" step="' + escapar(field.step || 'any') + '"' +
            (field.min != null ? ' min="' + escapar(field.min) + '"' : '') +
            (field.max != null ? ' max="' + escapar(field.max) + '"' : '') +
            ' placeholder="' + escapar(field.placeholder || '') + '">';
        } else if (field.type === 'date' || field.type === 'datetime-local') {
          html += '<input id="' + escapar(field.id) + '" type="' + field.type + '" class="w-full p-3 border rounded-lg">';
        } else {
          html += '<input id="' + escapar(field.id) + '" type="text" class="w-full p-3 border rounded-lg" placeholder="' + escapar(field.placeholder || '') + '">';
        }
        if (field.tooltip) html += '<p class="text-xs text-slate-500 mt-1">' + escapar(field.tooltip) + '</p>';
        html += '</div>';
      });
      html += '</fieldset>';
    });
    form.innerHTML = html;
    (cfg.form.sections || []).forEach(function (sec) {
      (sec.fields || []).forEach(function (field) {
        if (!field.alerts) return;
        var el = document.getElementById(field.id);
        if (!el) return;
        el.addEventListener('change', function () { avisarCampo(field, el); });
      });
    });
  }

  function avisarCampo(field, el) {
    var n = Number(el.value);
    (field.alerts || []).forEach(function (alerta) {
      var ok = false;
      if (alerta.when === 'eq') ok = n === alerta.value;
      if (alerta.when === 'gte') ok = n >= alerta.value;
      if (alerta.when === 'lte') ok = n <= alerta.value;
      if (alerta.when === 'gt') ok = n > alerta.value;
      if (alerta.when === 'lt') ok = n < alerta.value;
      if (ok) notificar(alerta.message, alerta.level || 'warning');
    });
  }

  function coletar(cfg) {
    var env = {};
    var cru = {};
    var erros = [];
    (cfg.form.sections || []).forEach(function (sec) {
      (sec.fields || []).forEach(function (field) {
        var el = document.getElementById(field.id);
        if (!el) return;
        cru[field.id] = el.value;
        if ((field.type === 'number' || field.type === 'select') && field.required && el.value === '') {
          erros.push('Preencha: ' + field.label);
          el.classList.add('border-red-500');
          return;
        }
        el.classList.remove('border-red-500');
        var valor = lerValor(field, el);
        if (field.type === 'number' && field.required && !isFinite(valor)) {
          erros.push('Valor inválido: ' + field.label);
          el.classList.add('border-red-500');
          return;
        }
        if (typeof valor === 'number' && isFinite(valor)) env[field.id] = valor;
        else env[field.id] = valor;
      });
    });
    return { env: env, cru: cru, erros: erros };
  }

  function calcular() {
    var cfg = estado.cfg;
    var col = coletar(cfg);
    if (col.erros.length) {
      col.erros.forEach(function (e) { notificar(e, 'error'); });
      return;
    }
    var env = col.env;
    var nomeado = null;
    try {
      if (cfg.calculation.mode === 'score') {
        var total = 0;
        (cfg.form.sections || []).forEach(function (sec) {
          (sec.fields || []).forEach(function (field) {
            if (field.type !== 'select') return;
            var el = document.getElementById(field.id);
            var opt = (field.options || []).find(function (o) { return String(o.value) === el.value; });
            total += opt && typeof opt.score === 'number' ? opt.score : 0;
            env[field.id] = opt ? opt.score : 0;
          });
        });
        env.score = total;
        env.total = total;
      } else if (cfg.calculation.mode === 'named') {
        var fn = NOMEADAS[cfg.calculation.formula];
        if (!fn) throw new Error('Função não registrada');
        nomeado = fn(col.cru);
        Object.keys(nomeado.env || {}).forEach(function (k) { env[k] = nomeado.env[k]; });
      } else {
        avaliarFormula(cfg.calculation.formula, env);
      }
    } catch (err) {
      notificar(err.message || 'Não foi possível calcular', 'error');
      return;
    }
    var result = cfg.calculation.result || {};
    var chaves = result.keys || [result.key || ultimaChave(cfg.calculation.formula)];
    var mostrado = nomeado && nomeado.display
      ? nomeado.display
      : chaves.map(function (k) { return formatar(env[k], result.decimals); }).join(' / ');
    document.getElementById('res-label').textContent = result.label || '';
    document.getElementById('res-total').textContent = mostrado;
    document.getElementById('res-unit').textContent = result.unit || '';
    document.getElementById('results-wrapper').classList.remove('hidden');
    estado.ultimo = { env: env, mostrado: mostrado, nomeado: nomeado };
    renderAuditoria(cfg, env);
    renderInterpretacao(interpretar(cfg, env, nomeado));
    renderAcoes(cfg);
    renderListas(cfg);
    notificar('Cálculo realizado.', 'success');
  }

  function ultimaChave(formula) {
    var partes = String(formula || '').split(';').map(function (p) { return p.trim(); }).filter(Boolean);
    var ultima = partes[partes.length - 1] || '';
    return ultima.split('=')[0].trim();
  }

  function renderAuditoria(cfg, env) {
    var lista = document.getElementById('audit-list');
    var passos = (cfg.calculation.audit && cfg.calculation.audit.steps) || [];
    if (!lista) return;
    lista.innerHTML = '';
    passos.forEach(function (step) {
      var valor = '';
      if (step.sourceField) {
        valor = env[step.sourceField];
        if (step.format && FORMATOS[step.format]) valor = FORMATOS[step.format](valor);
        if (typeof valor === 'number') valor = formatar(valor, 2);
        if (step.suffix) valor = valor + ' ' + step.suffix;
      } else if (step.fixedValue) valor = step.fixedValue;
      else if (step.dynamicExpression) {
        valor = step.dynamicExpression.replace(/\{\{(\w+)\}\}/g, function (_, k) {
          return env[k] == null ? '' : env[k];
        });
      }
      var li = document.createElement('li');
      li.className = 'flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm';
      li.innerHTML = '<span class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">' + escapar(step.label) +
        '</span><span class="font-bold text-nurse-primary dark:text-cyan-300 text-right">' + escapar(valor) + '</span>';
      lista.appendChild(li);
    });
  }

  function renderInterpretacao(faixa) {
    var el = document.getElementById('res-interpretation');
    if (!el) {
      el = document.createElement('div');
      el.id = 'res-interpretation';
      document.querySelector('#results-wrapper .text-center').appendChild(el);
    }
    var extra = faixa.conduct || faixa.mortality || '';
    el.className = 'mt-4 p-4 rounded-xl text-sm text-center ' + (faixa.bg || 'bg-slate-50');
    el.innerHTML = '<span class="font-black ' + escapar(faixa.color || '') + '">' + escapar(faixa.label || '') + '</span>' +
      (extra ? '<p class="text-slate-600 text-xs mt-1">' + escapar(extra) + '</p>' : '');
  }

  function renderAcoes(cfg) {
    var box = document.getElementById('result-actions');
    if (!box) return;
    box.innerHTML = '';
    (cfg.calculation.actionButtons || []).forEach(function (btn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.id = 'btn-action-' + btn.action;
      b.className = btn.type === 'primary'
        ? 'px-3 py-2 rounded-lg bg-nurse-primary text-white text-sm font-bold'
        : 'px-3 py-2 rounded-lg border text-sm font-bold';
      b.innerHTML = '<i class="fa-solid ' + escapar(btn.icon || 'fa-circle') + '"></i> ' + escapar(btn.label);
      b.addEventListener('click', function () {
        if (btn.action === 'generatePDF') gerarPdf();
        else if (btn.action === 'copyResult') copiar();
        else if (btn.action === 'searchNursingDiagnosis') abrirModal('nanda');
      });
      box.appendChild(b);
    });
  }

  function renderListas(cfg) {
    var direitos = (cfg.checklists && cfg.checklists.nineRights) || [
      'Paciente certo', 'Medicação certa', 'Dose certa', 'Via certa', 'Hora certa',
      'Registro certo', 'Validade certa', 'Resposta certa', 'Forma certa'
    ];
    var metas = (cfg.checklists && cfg.checklists.safetyGoals) || [
      { id: 1, text: 'Identificar o paciente corretamente' },
      { id: 3, text: 'Segurança de medicamentos de alta vigilância' }
    ];
    var c1 = document.getElementById('checklist-9rights');
    var c2 = document.getElementById('checklist-safety-goals');
    if (c1) {
      c1.innerHTML = direitos.map(function (t) {
        return '<label class="flex items-center gap-2 text-xs p-2 border rounded-lg"><input type="checkbox" class="accent-nurse-primary"> ' + escapar(t) + '</label>';
      }).join('');
    }
    if (c2) {
      c2.innerHTML = metas.map(function (m) {
        return '<label class="flex items-center gap-2 text-xs p-2 border rounded-lg"><input type="checkbox" class="accent-nurse-primary"> ' + escapar(m.id + '. ' + m.text) + '</label>';
      }).join('');
    }
  }

  function limpar() {
    var cfg = estado.cfg;
    (cfg.form.sections || []).forEach(function (sec) {
      (sec.fields || []).forEach(function (field) {
        var el = document.getElementById(field.id);
        if (!el) return;
        if (field.type === 'select') el.value = field.default != null ? String(field.default) : el.options[0].value;
        else el.value = '';
        el.classList.remove('border-red-500');
      });
    });
    document.getElementById('results-wrapper').classList.add('hidden');
    var interp = document.getElementById('res-interpretation');
    if (interp) interp.remove();
    estado.ultimo = null;
  }

  function copiar() {
    if (!estado.ultimo) { notificar('Calcule antes de copiar.', 'error'); return; }
    var r = estado.cfg.calculation.result || {};
    var texto = (r.label || 'Resultado') + ': ' + estado.ultimo.mostrado + (r.unit ? ' ' + r.unit : '');
    var pronto = function () { notificar('Resultado copiado.', 'success'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(pronto);
    else {
      var ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      pronto();
    }
  }

  function gerarPdf() {
    if (!estado.ultimo) { notificar('Calcule antes de gerar o PDF.', 'error'); return; }
    if (!root.jspdf || !root.jspdf.jsPDF) { root.print(); return; }
    var doc = new root.jspdf.jsPDF();
    var cfg = estado.cfg;
    var y = 16;
    doc.setFontSize(14);
    doc.text(cfg.header.title || cfg.metadata.title, 14, y);
    y += 8;
    doc.setFontSize(11);
    var r = cfg.calculation.result || {};
    doc.text((r.label || 'Resultado') + ': ' + estado.ultimo.mostrado + (r.unit ? ' ' + r.unit : ''), 14, y);
    y += 8;
    (cfg.form.sections || []).forEach(function (sec) {
      (sec.fields || []).forEach(function (field) {
        var el = document.getElementById(field.id);
        if (!el) return;
        var valor = el.type === 'select' && el.selectedOptions[0] ? el.selectedOptions[0].text : el.value;
        var linha = field.label + ': ' + (valor || '—');
        if (y > 280) { doc.addPage(); y = 16; }
        doc.text(linha.slice(0, 110), 14, y);
        y += 6;
      });
    });
    doc.save((cfg.metadata.id || 'calculadora') + '.pdf');
    notificar('PDF gerado.', 'success');
  }

  function abrirModal(id) {
    var modal = estado.cfg.modals && estado.cfg.modals[id];
    var caixa = document.getElementById('calc-modal');
    if (!caixa) return;
    document.getElementById('calc-modal-title').textContent = modal ? modal.title : 'Diagnóstico de enfermagem';
    document.getElementById('calc-modal-body').innerHTML = modal && modal.content
      ? modal.content
      : '<p>Consulte a taxonomia NANDA com o título desta ferramenta e o resultado obtido.</p>';
    caixa.classList.remove('hidden');
  }

  function notificar(msg, tipo) {
    var el = document.getElementById('calc-toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'fixed bottom-4 right-4 px-4 py-3 rounded-xl text-sm z-50 text-white ' +
      (tipo === 'error' ? 'bg-red-700' : tipo === 'warning' ? 'bg-amber-700' : 'bg-slate-900');
    clearTimeout(notificar._t);
    notificar._t = setTimeout(function () { el.classList.add('hidden'); }, 3200);
  }

  api.boot = boot;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : this);
