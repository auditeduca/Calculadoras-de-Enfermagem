(function() {
    "use strict";

    const d = {
        defaultFontSize: 16,
        minFontSize: 12,
        maxFontSize: 24,
        fontStep: 2,
        fontStorageKey: "nursing_calc_font_size",
        themeStorageKey: "nursing_calc_theme"
    };

    const c = {
        currentFontSize: d.defaultFontSize,
        isDarkMode: !1,
        loaded: !1
    };

    function b(e) {
        return document.querySelector(e)
    }

    function h(e) {
        return document.querySelectorAll(e)
    }

    function s(e) {
        return document.getElementById(e)
    }

    function y() {
        try {
            localStorage.setItem(d.fontStorageKey, c.currentFontSize.toString())
        } catch (e) {
            console.warn("[Header] Erro ao salvar tamanho da fonte:", e)
        }
    }

    function k() {
        try {
            const e = localStorage.getItem(d.fontStorageKey);
            if (e) {
                const o = parseInt(e, 10);
                if (!isNaN(o) && o >= d.minFontSize && o <= d.maxFontSize) return c.currentFontSize = o, !0
            }
        } catch (e) {
            console.warn("[Header] Erro ao carregar tamanho da fonte:", e)
        }
        return c.currentFontSize = d.defaultFontSize, !1
    }

    function F() {
        try {
            localStorage.setItem(d.themeStorageKey, c.isDarkMode ? "dark" : "light")
        } catch (e) {
            console.warn("[Header] Erro ao salvar tema:", e)
        }
    }

    function w() {
        try {
            const e = localStorage.getItem(d.themeStorageKey);
            if (e) return c.isDarkMode = e === "dark", !0
        } catch (e) {
            console.warn("[Header] Erro ao carregar tema:", e)
        }
        return c.isDarkMode = !1, !1
    }

    function z() {
        function e(l) {
            const u = Math.max(d.minFontSize, Math.min(d.maxFontSize, l));
            c.currentFontSize = u, document.documentElement.style.fontSize = c.currentFontSize + "px", y(), o()
        }

        function o() {
            const l = s("font-increase"),
                u = s("font-reduce"),
                m = s("mobile-font-increase"),
                v = s("mobile-font-reduce"),
                S = [l, m],
                p = [u, v];
            S.forEach(g => {
                g && (g.disabled = c.currentFontSize >= d.maxFontSize)
            }), p.forEach(g => {
                g && (g.disabled = c.currentFontSize <= d.minFontSize)
            })
        }

        function t(l) {
            l.preventDefault(), l.stopPropagation(), e(c.currentFontSize + d.fontStep)
        }

        function n(l) {
            l.preventDefault(), l.stopPropagation(), e(c.currentFontSize - d.fontStep)
        }
        const i = s("font-increase"),
            a = s("font-reduce"),
            r = s("mobile-font-increase"),
            f = s("mobile-font-reduce");
        i && i.addEventListener("click", t), a && a.addEventListener("click", n), r && r.addEventListener("click", t), f && f.addEventListener("click", n), o()
    }

    function E() {
        const e = s("theme-toggle"),
            o = s("mobile-theme-toggle");

        function t(i) {
            if (c.isDarkMode = i, document.body.classList.toggle("dark-theme", i), e) {
                const a = e.querySelector("i");
                a && (a.classList.remove("fa-moon", "fa-sun"), a.classList.add(i ? "fa-sun" : "fa-moon"))
            }
            if (o) {
                const a = o.querySelector(".theme-icon.sun"),
                    r = o.querySelector(".theme-icon.moon");
                a && (a.style.display = i ? "inline" : "none"), r && (r.style.display = i ? "none" : "inline")
            }
            F()
        }

        function n(i) {
            i.preventDefault(), i.stopPropagation(), t(!c.isDarkMode)
        }
        e && e.addEventListener("click", n), o && o.addEventListener("click", n), c.isDarkMode && t(!0)
    }

    function x() {
        function e(i, a) {
            i && i.addEventListener("click", function(r) {
                r.preventDefault(), r.stopPropagation();
                const f = s(a);
                f && (f.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                }), f.setAttribute("tabindex", "-1"), f.focus())
            })
        }
        const o = s("skip-top"),
            t = s("skip-content"),
            n = s("skip-footer");
        e(o, "main-header"), e(t, "main-content"), e(n, "footer")
    }

    function M() {
        const e = s("mobile-menu-toggle"),
            o = s("mobile-menu-close"),
            t = s("mobile-menu"),
            n = s("mobile-menu-overlay");

        function i() {
            t && (t.classList.add("active"), t.setAttribute("aria-expanded", "true")), n && n.classList.add("active"), document.body.style.overflow = "hidden"
        }

        function a() {
            t && (t.classList.remove("active"), t.setAttribute("aria-expanded", "false")), n && n.classList.remove("active"), document.body.style.overflow = ""
        }

        function r() {
            t && t.classList.contains("active") ? a() : i()
        }
        
        // Toggle hamburger menu
        e && e.addEventListener("click", r);
        
        // Close button
        o && o.addEventListener("click", a);
        
        // Click outside to close
        n && n.addEventListener("click", a);
        
        // Escape key to close
        document.addEventListener("keydown", function(l) {
            l.key === "Escape" && t && t.classList.contains("active") && a()
        });
    }

    function V() {
        // Lógica para expansão e retração de todos os sub-menus no menu mobile
        // Expansão do primeiro nível (Sobre Nós, Ferramentas, Biblioteca, Carreiras)
        h(".mobile-nav-item.has-mobile-submenu").forEach(function(navItem) {
            const toggleBtn = navItem.querySelector(".mobile-nav-dropdown");
            const submenu = navItem.querySelector(".mobile-submenu");
            
            if (toggleBtn && submenu) {
                toggleBtn.addEventListener("click", function(e) {
                    e.preventDefault();
                    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
                    
                    // Fechar outros submenus do mesmo nível
                    h(".mobile-nav-item.has-mobile-submenu").forEach(function(otherItem) {
                        if (otherItem !== navItem) {
                            const otherBtn = otherItem.querySelector(".mobile-nav-dropdown");
                            const otherSubmenu = otherItem.querySelector(".mobile-submenu");
                            if (otherBtn && otherSubmenu) {
                                otherBtn.setAttribute("aria-expanded", "false");
                                otherItem.classList.remove("active");
                            }
                        }
                    });
                    
                    toggleBtn.setAttribute("aria-expanded", !isExpanded);
                    navItem.classList.toggle("active");
                });
            }
        });
        
        // Expansão do segundo nível (Institucional, Calculadoras Clínicas, etc.)
        h(".mobile-submenu-item.has-mobile-submenu").forEach(function(subItem) {
            const toggleBtn = subItem.querySelector(".mobile-submenu-dropdown");
            const submenu = subItem.querySelector(".mobile-submenu.level-3");
            
            if (toggleBtn && submenu) {
                // Adicionar indicador de "Voltar"
                const backIndicator = document.createElement("li");
                backIndicator.className = "submenu-back-item";
                backIndicator.innerHTML = '<a href="#" class="submenu-back-link"><i class="fas fa-arrow-left"></i> Voltar</a>';
                backIndicator.style.cssText = "display: none; padding: 8px 0; border-bottom: 1px solid #e0e0e0; margin-bottom: 8px;";
                submenu.insertBefore(backIndicator, submenu.firstChild);
                
                toggleBtn.addEventListener("click", function(e) {
                    e.preventDefault();
                    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
                    
                    // Fechar outros submenus do mesmo nível
                    h(".mobile-submenu-item.has-mobile-submenu").forEach(function(otherItem) {
                        if (otherItem !== subItem) {
                            const otherBtn = otherItem.querySelector(".mobile-submenu-dropdown");
                            const otherSubmenu = otherItem.querySelector(".mobile-submenu.level-3");
                            if (otherBtn && otherSubmenu) {
                                otherBtn.setAttribute("aria-expanded", "false");
                                otherItem.classList.remove("active");
                                otherSubmenu.style.display = "";
                                const back = otherSubmenu.querySelector(".submenu-back-item");
                                if (back) back.style.display = "none";
                            }
                        }
                    });
                    
                    toggleBtn.setAttribute("aria-expanded", !isExpanded);
                    subItem.classList.toggle("active");
                    submenu.style.display = isExpanded ? "" : "block";
                    backIndicator.style.display = isExpanded ? "none" : "block";
                });
                
                // Funcionalidade do botão Voltar
                backIndicator.querySelector(".submenu-back-link").addEventListener("click", function(e) {
                    e.preventDefault();
                    toggleBtn.setAttribute("aria-expanded", "false");
                    subItem.classList.remove("active");
                    submenu.style.display = "";
                    backIndicator.style.display = "none";
                });
            }
        });
    }

    function W() {
        // Lógica para a seção de Idiomas no final do menu mobile
        const e = s("mobile-idiomas-section"),
            o = s("mobile-idiomas-toggle"),
            t = s("mobile-idiomas-list"),
            i = s("mobile-idiomas-arrow");
        
        if (!e || !o || !t) return;
        
        o.addEventListener("click", function(r) {
            r.preventDefault();
            r.stopPropagation();
            const isExpanded = e.classList.contains("expanded");
            e.classList.toggle("expanded");
            t.style.display = isExpanded ? "none" : "grid";
            o.setAttribute("aria-expanded", !isExpanded);
            if (i) {
                i.classList.toggle("fa-chevron-down", isExpanded);
                i.classList.toggle("fa-chevron-up", !isExpanded);
            }
        });
        
        // Funcionalidade de seleção de idioma
        h(".language-flag-item").forEach(function(link) {
            link.addEventListener("click", function(r) {
                r.preventDefault();
                
                // Remover classe active de todos os itens
                h(".language-flag-item").forEach(function(item) {
                    item.classList.remove("active");
                });
                
                // Adicionar classe active ao item selecionado
                this.classList.add("active");
                
                const img = this.querySelector("img");
                const current = s("mobile-idiomas-current");
                const alt = img ? img.alt : "";
                const lang = this.getAttribute("data-lang");
                
                if (img && current) {
                    current.innerHTML = img.outerHTML + '<span>' + alt + '</span>';
                }
                
                // Salvar idioma selecionado no localStorage
                try {
                    localStorage.setItem("nursing_calc_lang", lang);
                } catch (err) {
                    console.warn("[Header] Erro ao salvar idioma:", err);
                }
                
                // Fechar a lista após seleção
                e.classList.remove("expanded");
                t.style.display = "none";
                o.setAttribute("aria-expanded", "false");
                if (i) {
                    i.classList.add("fa-chevron-down");
                    i.classList.remove("fa-chevron-up");
                }
            });
        });
        
        // Inicializar idioma ativo do localStorage
        try {
            const savedLang = localStorage.getItem("nursing_calc_lang") || "pt-br";
            const activeItem = t.querySelector('[data-lang="' + savedLang + '"]');
            if (activeItem) {
                activeItem.classList.add("active");
                // Atualizar显示 atual também
                const img = activeItem.querySelector("img");
                const current = s("mobile-idiomas-current");
                if (img && current) {
                    current.innerHTML = img.outerHTML + '<span>' + img.alt + '</span>';
                }
            }
        } catch (err) {
            console.warn("[Header] Erro ao carregar idioma ativo:", err);
        }
    }

    function J() {
        // Lógica para o botão Buscar expandir área de busca abaixo do cabeçalho (mobile)
        const e = s("mobile-search-toggle"),
            o = s("mobile-search-container"),
            t = s("mobile-menu-search-input");
        
        if (!e || !o) return;
        
        const n = () => {
            const i = o.classList.contains("expanded");
            o.classList.toggle("expanded"), e.classList.toggle("active"), e.setAttribute("aria-expanded", !i), i || setTimeout(() => t && t.focus(), 100)
        };
        
        e.addEventListener("click", function(i) {
            i.preventDefault(), i.stopPropagation(), n()
        });
        
        // Fechar busca ao pressionar Escape
        document.addEventListener("keydown", function(i) {
            i.key === "Escape" && o.classList.contains("expanded") && n()
        })
    }

    function K() {
        // Sincronizar estado do idioma ativo com a seção mobile
        const e = h(".mega-panel-idiomas .idiomas-list li a.active");
        if (e.length > 0 && s("mobile-idiomas-current")) {
            const o = e[0].querySelector(".idioma-flag-link");
            if (o) {
                const t = o.cloneNode(!0);
                t.style.width = "24px", t.style.height = "18px", t.style.marginRight = "8px", t.style.verticalAlign = "middle";
                const n = s("mobile-idiomas-current");
                n.innerHTML = "", n.appendChild(t);
                const i = o.alt || e[0].textContent.trim();
                i && (n.innerHTML += '<span class="current-lang-name">' + i + "</span>")
            }
        }
    }

    function q() {
        const e = h(".has-mega-menu");
        e.forEach(o => {
            const t = o.querySelector(".nav-link-dropdown"),
                n = o.querySelector(".mega-panel");
            if (!t || !n) return;
            let i;

            function a() {
                clearTimeout(i), e.forEach(u => {
                    if (u !== o) {
                        const m = u.querySelector(".mega-panel"),
                            v = u.querySelector(".nav-link-dropdown");
                        m && m.classList.remove("active"), v && v.setAttribute("aria-expanded", "false")
                    }
                }), n.classList.add("active"), t.setAttribute("aria-expanded", "true"), document.body.classList.add("mega-menu-active")
            }

            function r() {
                i = setTimeout(() => {
                    n.classList.remove("active"), t.setAttribute("aria-expanded", "false"), document.body.classList.remove("mega-menu-active")
                }, 150)
            }

            function f() {
                window.matchMedia("(min-width: 1024px)").matches && a()
            }

            function l() {
                window.matchMedia("(min-width: 1024px)").matches && r()
            }
            t.addEventListener("mouseenter", f), t.addEventListener("mouseleave", l), t.addEventListener("focus", f), t.addEventListener("click", function(u) {
                if (window.matchMedia("(max-width: 1023px)").matches) {
                    u.preventDefault();
                    const m = n.classList.contains("active");
                    e.forEach(v => {
                        const S = v.querySelector(".mega-panel"),
                            p = v.querySelector(".nav-link-dropdown");
                        S && S.classList.remove("active"), p && p.setAttribute("aria-expanded", "false")
                    }), m || a()
                }
            }), n.addEventListener("mouseenter", () => clearTimeout(i)), n.addEventListener("mouseleave", l), document.addEventListener("keydown", function(u) {
                u.key === "Escape" && (n.classList.remove("active"), t.setAttribute("aria-expanded", "false"))
            })
        })
    }

    function T() {
        h(".menu-tabs").forEach(o => {
            const t = o.querySelectorAll(".menu-tab-trigger");
            // CORREÇÃO AQUI: substituído .parent() por .parentElement
            const n = o.parentElement.parentElement.querySelectorAll(".tab-content");
            t.forEach(i => {
                i.addEventListener("click", function() {
                    const a = this.getAttribute("data-tab");
                    t.forEach(r => {
                        r.classList.remove("active"), r.setAttribute("aria-selected", "false")
                    }), this.classList.add("active"), this.setAttribute("aria-selected", "true"), n.forEach(r => {
                        r.classList.remove("active"), r.id === "tab-" + a && r.classList.add("active")
                    })
                })
            })
        })
    }

    function A() {
        const e = h(".mega-panel-idiomas .idiomas-list li a");
        const r = s("active-lang-flag");
        const i = r ? r.alt : "Português (Brasil)";
        const o = r ? r.src : "";
        
        // Função para atualizar o estado ativo
        function n(t) {
            e.forEach(a => a.classList.remove("active")), t.classList.add("active");
            const l = t.querySelector(".idioma-flag-link");
            if (l && r) {
                r.src = l.src, r.alt = l.alt
            }
            h(".mega-panel").forEach(a => a.classList.remove("active"))
        }
        
        // Marcar idioma ativo baseado no flag atual
        e.forEach(t => {
            const a = t.querySelector(".idioma-flag-link");
            if (a && o && a.src === o) {
                t.classList.add("active")
            }
        })
        
        e.forEach(t => {
            t.addEventListener("click", function(a) {
                a.preventDefault(), n(this)
            })
        })
    }

    function I() {
        const e = b(".search-container");
        if (!e) return;
        const o = e.querySelector(".search-input"),
            t = e.querySelector(".search-btn");
        t && o && (t.addEventListener("click", function() {
            const n = o.value.trim();
            n && console.log("[Search] Buscando:", n)
        }), o.addEventListener("keydown", function(n) {
            n.key === "Enter" && t.click()
        }))
    }

    function D() {
        const e = b(".main-header");
        let o = 0;
        if (!e) return;

        function t() {
            const n = window.pageYOffset;
            n > 50 ? e.classList.add("scrolled") : e.classList.remove("scrolled"), o = n
        }
        window.addEventListener("scroll", t, {
            passive: !0
        }), t()
    }

    function H() {
        const e = b(".main-header");
        if (!e) return;
        let o = window.scrollY,
            t = !1;

        function n() {
            const i = window.scrollY;
            i > o && i > 100 ? e.classList.add("header-hidden") : e.classList.remove("header-hidden"), o = i, t = !1
        }
        window.addEventListener("scroll", function() {
            t || (requestAnimationFrame(n), t = !0)
        }, {
            passive: !0
        })
    }

    function L() {
        c.loaded || (c.loaded = !0, console.log("[Header] Inicializando módulo do cabeçalho..."), k(), w(), document.documentElement.style.fontSize = c.currentFontSize + "px", z(), E(), x(), M(), V(), W(), J(), K(), q(), T(), A(), I(), D(), H(), console.log("[Header] Módulo do cabeçalho inicializado com sucesso"))
    }
    window.HeaderModule = {
        init: function() {
            // Forçar recarregamento dos elementos do DOM
            c.loaded = !1;
            L();
        },
        setFontSize: function(e) {
            c.currentFontSize = Math.max(d.minFontSize, Math.min(d.maxFontSize, e)), document.documentElement.style.fontSize = c.currentFontSize + "px", y()
        },
        toggleTheme: function() {
            E()
        },
        getFontSize: function() {
            return c.currentFontSize;
        }
    }
})();