(function () {
    "use strict";

    // Configurações e Referências DOM
    const e = {
        banner: null,
        overlay: null,
        modal: null, // Modal de Preferências
        backToTop: null,
        cookieFab: null,
        yearSpan: null,
        toast: null,
        toastMessage: null,
        scrollTimeout: null,
        detailModals: {},
        accordionBtns: {}
    };

    const T = "ce_cookie_consent_v8_2025";
    let f = null; // Elemento focado anteriormente
    let s = [];   // Stack (Pilha) de modais abertos
    let y = [];   // Elementos focáveis dentro do modal

    // Inicialização
    function k() {
        e.banner = document.getElementById("cookie-banner");
        e.overlay = document.getElementById("cookie-overlay");
        e.modal = document.getElementById("cookie-modal-content");
        e.backToTop = document.getElementById("backToTop");
        e.cookieFab = document.getElementById("cookie-fab");
        e.yearSpan = document.getElementById("current-year");
        e.toast = document.getElementById("toast-notification");
        e.toastMessage = document.getElementById("toast-message");

        // Reseta estados iniciais (acessibilidade)
        if (e.modal && !e.modal.classList.contains("hidden")) {
            e.modal.classList.add("hidden");
            e.modal.setAttribute("aria-hidden", "true");
        }
        if (e.overlay && !e.overlay.classList.contains("hidden")) {
            e.overlay.classList.add("hidden");
            e.overlay.setAttribute("aria-hidden", "true");
        }
        if (e.cookieFab) {
            e.cookieFab.classList.add("hidden");
        }

        // Mapeia Sub-modais de detalhes
        document.querySelectorAll(".cookie-detail-modal").forEach(function (n) {
            if (n.id) {
                e.detailModals[n.id] = n;
                if (!n.classList.contains("hidden")) {
                    n.classList.add("hidden");
                    n.setAttribute("aria-hidden", "true");
                }
            }
        });

        // Mapeia botões de acordeão
        document.querySelectorAll(".cookie-expand-btn").forEach(function (n) {
            const c = n.getAttribute("data-accordion-target");
            if (c) {
                e.accordionBtns[c] = n;
            }
        });

        if (e.yearSpan) e.yearSpan.textContent = new Date().getFullYear();

        F(); // Verifica consentimento existente
        q(); // Configura BackToTop
        O(); // Ajusta UI baseada no banner
        D(); // Configura Event Listeners (CORRIGIDO)
    }

    // Exibe Toast (Notificação)
    function C(t) {
        if (!e.toast || !e.toastMessage) return;
        e.toastMessage.textContent = t;
        e.toast.classList.remove("hidden");
        e.toast.offsetWidth; // Force reflow
        e.toast.classList.add("visible");
        setTimeout(function () {
            e.toast.classList.remove("visible");
            setTimeout(function () {
                e.toast.classList.add("hidden");
            }, 300);
        }, 3000);
    }

    // Verifica LocalStorage
    function F() {
        const t = localStorage.getItem(T);
        if (t) {
            try {
                const i = JSON.parse(t);
                if (B(i)) {
                    I(i);
                    m(); // Esconde banner, mostra FAB
                } else {
                    b(); // Dados inválidos, mostra banner
                }
            } catch {
                b();
            }
        } else {
            b();
        }
    }

    // Valida Objeto de Consentimento
    function B(t) {
        const keys = ["consented", "timestamp", "necessary", "analytics", "marketing", "version"];
        const hasKeys = keys.every(key => Object.prototype.hasOwnProperty.call(t, key));
        if (!hasKeys) return false;
        if (typeof t.consented !== "boolean" || typeof t.necessary !== "boolean" || typeof t.analytics !== "boolean" || typeof t.marketing !== "boolean") return false;
        if (isNaN(Date.parse(t.timestamp))) return false;
        return true;
    }

    // Mostra Banner
    function b() {
        if (e.banner) {
            e.banner.classList.add("visible");
            e.banner.style.display = "flex";
        }
        g(true); // Ajusta layout (botão voltar ao topo)
        if (e.cookieFab) e.cookieFab.classList.add("hidden");
    }

    // Esconde Banner / Estado "Aceito"
    function m() {
        if (e.banner) {
            e.banner.classList.remove("visible");
            setTimeout(function () {
                e.banner.style.display = "none";
                g(false);
            }, 300);
        }
        if (e.cookieFab) e.cookieFab.classList.remove("hidden");
    }

    // Ajusta posições (BackToTop, FAB)
    function g(t) {
        if (e.backToTop) e.backToTop.style.bottom = t ? "150px" : "30px";
        if (e.cookieFab && !e.cookieFab.classList.contains("hidden")) {
            e.cookieFab.style.bottom = t ? "200px" : "80px";
        }
        if (e.toast) e.toast.style.bottom = t ? "220px" : "7rem";
    }

    // ============================================================
    // CORREÇÃO 1: Função Abrir Modal de Preferências (A)
    // ============================================================
    function A() {
        f = document.activeElement; // Salva o foco atual

        // Lógica Corrigida: Adiciona à pilha 's' ANTES de verificar se já está visível
        // O código original só adicionava se !hidden, o que falhava na primeira abertura.
        if (e.modal) {
            // Se o modal ainda não está na pilha, adiciona
            if (s.indexOf(e.modal) === -1) {
                s.push(e.modal);
            }

            e.modal.classList.remove("hidden");
            e.modal.setAttribute("aria-hidden", "false");
        }

        if (e.overlay) {
            e.overlay.classList.remove("hidden");
            e.overlay.setAttribute("aria-hidden", "false");
        }

        if (e.modal) {
            _(); // Colapsa acordeões
            v(e.modal); // Define elementos focáveis

            // Foca no primeiro elemento interativo
            const t = e.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (t) setTimeout(() => t.focus(), 100);
        }

        x(e.modal); // Prende o foco (Focus Trap)
    }

    // Fecha o Modal do Topo da Pilha
    function p() {
        if (s.length > 0) {
            const t = s.pop();
            if (t) {
                t.classList.add("hidden");
                t.setAttribute("aria-hidden", "true");
                // Se fechou o modal principal e temos consentimento, garante estado correto da UI
                if (t === e.modal) m(); 
            }
        }
        h(); // Verifica overlay
    }

    // Abre Modal de Detalhes (Submodal)
    function M(t) {
        const i = e.detailModals[t];
        if (!i) return;

        // Se o modal principal está aberto, garante que ele está na pilha
        if (e.modal && !e.modal.classList.contains("hidden") && s.indexOf(e.modal) === -1) {
            s.push(e.modal);
        } else if (e.modal && !e.modal.classList.contains("hidden")) {
             // Já está aberto e na pilha, mantém
        }

        if (e.overlay) {
            e.overlay.classList.remove("hidden");
            e.overlay.setAttribute("aria-hidden", "false");
        }

        // Adiciona submodal à pilha
        s.push(i);

        i.classList.remove("hidden");
        i.setAttribute("aria-hidden", "false");
        v(i);

        const n = i.querySelector(".cookie-modal-close");
        if (n) setTimeout(() => n.focus(), 100);

        x(i);
    }

    // Fecha Modal de Detalhes Específico (Voltar)
    function w(t) {
        const i = e.detailModals[t];
        if (i) {
            i.classList.add("hidden");
            i.setAttribute("aria-hidden", "true");

            // Remove da pilha
            const index = s.indexOf(i);
            if (index > -1) {
                s.splice(index, 1);
            }
            
            // Restaura o modal anterior (Principal)
            if (s.length > 0) {
                const n = s[s.length - 1]; // Pega o último
                if (n) {
                    n.classList.remove("hidden");
                    n.setAttribute("aria-hidden", "false");
                    // Retorna foco se possível
                    if (f) setTimeout(() => f.focus(), 100);
                }
            }
            h();
        }
    }

    // Gerencia Visibilidade do Overlay
    function h() {
        if (s.length === 0) {
            if (e.overlay) {
                e.overlay.classList.add("hidden");
                e.overlay.setAttribute("aria-hidden", "true");
            }
            if (f) f.focus();
        } else {
            if (e.overlay) {
                e.overlay.classList.remove("hidden");
                e.overlay.setAttribute("aria-hidden", "false");
            }
        }
    }

    // Identifica Elementos Focáveis
    function v(t) {
        if (t) {
            y = Array.from(t.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(function (i) {
                return i.offsetParent !== null && !i.disabled;
            });
        }
    }

    // Focus Trap (Prende navegação via Tab dentro do modal)
    function x(t) {
        if (t) {
            t.addEventListener("keydown", function (n) {
                if (n.key !== "Tab") return;
                v(t); // Atualiza lista
                if (y.length === 0) return;
                
                const c = y[0];
                const l = y[y.length - 1];

                if (n.shiftKey) {
                    if (document.activeElement === c) {
                        n.preventDefault();
                        l.focus();
                    }
                } else {
                    if (document.activeElement === l) {
                        n.preventDefault();
                        c.focus();
                    }
                }
            });
        }
    }

    // Toggle Acordeão (Expandir/Retrair)
    function E(t) {
        const i = document.getElementById(t); // O conteúdo a expandir
        const n = e.accordionBtns[t];       // O botão
        if (!i) return;

        if (i.classList.contains("expanded")) {
            i.classList.remove("expanded");
            if (n) {
                n.classList.remove("expanded");
                n.setAttribute("aria-expanded", "false");
            }
        } else {
            S(); // Fecha outros abertos (comportamento de acordeão único)
            i.classList.add("expanded");
            if (n) {
                n.classList.add("expanded");
                n.setAttribute("aria-expanded", "true");
            }
            // Tenta focar no texto para leitura
            setTimeout(function () {
                const l = i.querySelector("p");
                if (l) l.focus();
            }, 300);
        }
    }

    // Fecha todos os acordeões
    function S() {
        document.querySelectorAll(".cookie-category-description").forEach(function (t) {
            t.classList.remove("expanded");
        });
        document.querySelectorAll(".cookie-expand-btn").forEach(function (t) {
            t.classList.remove("expanded");
            t.setAttribute("aria-expanded", "false");
        });
    }

    function _() {
        S();
    }

    // Salva Preferências
    function L(t) {
        if (typeof t !== "boolean" && t !== "partial") return;
        
        const i = document.getElementById("check-necessary");
        const n = document.getElementById("check-analytics");
        const c = document.getElementById("check-marketing");
        
        const u = {
            consented: t === true || t === "partial",
            timestamp: new Date().toISOString(),
            necessary: i ? i.checked : true,
            analytics: n ? n.checked : (t === true),
            marketing: c ? c.checked : (t === true),
            version: "8.0"
        };

        if (B(u)) {
            try {
                localStorage.setItem(T, JSON.stringify(u));
                I(u);
                window.dispatchEvent(new CustomEvent("consentUpdated", {
                    detail: u
                }));
                C(t === true ? "Cookies aceitos com sucesso!" : "Preferências salvas!");
            } catch (err) {
                console.error(err);
            }
            m();
            // Limpa modais
            while(s.length > 0) { s.pop(); } 
            h();
            // Garante que modais visuais fechem
            if(e.modal) { e.modal.classList.add("hidden"); e.modal.setAttribute("aria-hidden","true"); }
        }
    }

    // Integração (GTAG / DataLayer)
    function I(t) {
        if (typeof window.applyConsentSettings == "function") window.applyConsentSettings(t);
        
        if (typeof gtag !== "undefined") {
            gtag("consent", "update", {
                analytics_storage: t.analytics ? "granted" : "denied",
                ad_storage: t.marketing ? "granted" : "denied",
                ad_user_data: t.marketing ? "granted" : "denied",
                ad_personalization: t.marketing ? "granted" : "denied"
            });
        }
        
        if (window.dataLayer) {
            window.dataLayer.push({
                event: "consent_update",
                consent_analytics: t.analytics ? "granted" : "denied",
                consent_marketing: t.marketing ? "granted" : "denied",
                consent_necessary: "granted"
            });
            window.dataLayer.push({
                event: "privacy_consent",
                consent_analytics: t.analytics,
                consent_marketing: t.marketing,
                consent_necessary: true
            });
        }
    }

    // Scroll Handler
    function q() {
        if (!e.backToTop) return;
        const t = function () {
            window.scrollY > 300 ? (e.backToTop.classList.add("visible"), e.backToTop.classList.remove("hidden")) : (e.backToTop.classList.remove("visible"), e.backToTop.classList.add("hidden"));
        };
        window.addEventListener("scroll", function () {
            clearTimeout(e.scrollTimeout);
            e.scrollTimeout = setTimeout(t, 100);
        });
        t();
        e.backToTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    function O() {
        const t = e.banner && e.banner.classList.contains("visible");
        g(t);
    }

    // ============================================================
    // CORREÇÃO 2: Event Listeners (D)
    // ============================================================
    function D() {
        const t = document.getElementById("cookie-accept");
        const i = document.getElementById("cookie-settings");
        const n = document.getElementById("cookie-fab");
        const c = document.getElementById("cookie-modal-close");
        const l = document.getElementById("cookie-save-preferences");
        const u = document.getElementById("cookie-accept-all");

        // Botão Aceitar no Banner
        if (t) t.addEventListener("click", function () {
            const a = document.getElementById("check-analytics");
            const o = document.getElementById("check-marketing");
            if (a) a.checked = true;
            if (o) o.checked = true;
            L(true);
        });

        // Botão Preferências no Banner
        if (i) i.addEventListener("click", function () {
            A();
        });

        // Botão Flutuante (FAB)
        if (n) n.addEventListener("click", A);

        // Botão Fechar (X) no Modal
        if (c) c.addEventListener("click", function () {
            p();
        });

        // Botão Salvar Preferências
        if (l) l.addEventListener("click", function () {
            L("partial");
        });

        // Botão Aceitar Tudo no Modal
        if (u) u.addEventListener("click", function () {
            const a = document.getElementById("check-analytics");
            const o = document.getElementById("check-marketing");
            if (a) a.checked = true;
            if (o) o.checked = true;
            L(true);
        });

        // DELEGAÇÃO DE EVENTOS PARA ACORDEÃO (EXPANDIR)
        document.addEventListener("click", function (a) {
            // Verifica se clicou no botão de expandir
            const btn = a.target.closest(".cookie-expand-btn");
            if (btn) {
                a.stopPropagation(); // Previne outros handlers se necessário
                const d = btn.getAttribute("data-accordion-target");
                if (d) E(d);
                return;
            }

            // Verifica se clicou no Header (título) para também expandir
            const header = a.target.closest(".cookie-category-header");
            if (header) {
                const desc = header.nextElementSibling;
                if (desc && desc.classList.contains("cookie-category-description")) {
                    const r = desc.id;
                    if (r) E(r);
                }
            }
        });

        // Acessibilidade (Enter/Space nos headers)
        document.addEventListener("keydown", function (a) {
            if (a.target.closest(".cookie-category-header") && (a.key === "Enter" || a.key === " ")) {
                a.preventDefault();
                const d = a.target.closest(".cookie-category-header").nextElementSibling;
                if (d && d.classList.contains("cookie-category-description")) {
                    const r = d.id;
                    if (r) E(r);
                }
            }
        });

        // Botões de Informação (Submodais)
        document.querySelectorAll(".cookie-info-btn").forEach(function (a) {
            a.addEventListener("click", function () {
                const o = this.getAttribute("data-modal-target");
                if (o) {
                    f = this;
                    M(o);
                }
            });
        });

        // Fechar Submodais (botão X interno)
        document.querySelectorAll(".cookie-detail-modal .cookie-modal-close").forEach(function (a) {
            a.addEventListener("click", function () {
                const o = this.closest(".cookie-detail-modal");
                if (o && o.id) w(o.id);
            });
        });

        // Botão Voltar nos Submodais
        document.querySelectorAll(".cookie-detail-back").forEach(function (a) {
            a.addEventListener("click", function () {
                const o = this.getAttribute("data-close");
                if (o) w(o);
            });
        });

        // Click no Overlay (Fechar Modal)
        if (e.overlay) {
            e.overlay.addEventListener("click", function (a) {
                // Só fecha se o clique for EXATAMENTE no overlay (não nos filhos)
                if (a.target === e.overlay) {
                    if (s.length > 0) {
                        const o = s[s.length - 1];
                        if (o) {
                            if (o === e.modal) {
                                p(); // Fecha principal
                                // Não chamamos m() aqui para não bugar a UI se o usuário só quis fechar as preferências sem salvar
                            } else {
                                // Fecha submodal
                                o.classList.add("hidden");
                                o.setAttribute("aria-hidden", "true");
                                s.pop();
                            }
                        }
                    }
                    h();
                }
            });
        }

        // Tecla ESC
        document.addEventListener("keydown", function (a) {
            if (a.key === "Escape" && s.length > 0) {
                const o = s[s.length - 1];
                if (o) {
                    o.classList.add("hidden");
                    o.setAttribute("aria-hidden", "true");
                    s.pop();
                }
                h();
                // Se fechou tudo, restaura estado normal
                if (s.length === 0) m(); 
            }
        });

        // *** REMOVIDO: stopPropagation nos modais ***
        // O código original tinha:
        // document.querySelectorAll(".cookie-modal, .cookie-detail-modal").forEach(...) { stopPropagation }
        // Isso impedia o clique do acordeão de ser ouvido pelo document.
        
        // Mantemos apenas para os checkbox switches para efeito visual
        document.querySelectorAll('.cookie-switch input[type="checkbox"]').forEach(function (a) {
            a.addEventListener("change", function () {
                const o = this.nextElementSibling;
                if (o) {
                    o.style.backgroundColor = this.checked ? "#2563eb" : "#e5e7eb";
                }
            });
        });
    }

    // Inicialização segura
    function P() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", function () {
                setTimeout(k, 50);
            });
        } else {
            setTimeout(k, 50);
        }
    }

    P();
    window.addEventListener("TemplateEngine:Ready", function () {
        setTimeout(k, 100);
    });
})();