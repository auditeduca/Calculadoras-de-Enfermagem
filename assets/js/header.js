/**
 * HEADER.JS
 * Funcionalidades do Cabeçalho e Navegação
 * Calculadoras de Enfermagem
 */

(function() {
  "use strict";
  
  const config = {
    defaultFontSize: 16,
    minFontSize: 12,
    maxFontSize: 24,
    fontStep: 2,
    fontStorageKey: "nursing_calc_font_size",
    themeStorageKey: "nursing_calc_theme"
  };
  
  const state = {
    currentFontSize: config.defaultFontSize,
    isDarkMode: false,
    loaded: false
  };
  
  function querySelector(selector) {
    return document.querySelector(selector);
  }
  
  function querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }
  
  function getElementById(id) {
    return document.getElementById(id);
  }
  
  // Funções de Font Size
  function saveFontSize() {
    try {
      localStorage.setItem(config.fontStorageKey, state.currentFontSize.toString());
    } catch (e) {
      console.warn("[Header] Erro ao salvar tamanho da fonte:", e);
    }
  }
  
  function loadFontSize() {
    try {
      const stored = localStorage.getItem(config.fontStorageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= config.minFontSize && parsed <= config.maxFontSize) {
          state.currentFontSize = parsed;
          return true;
        }
      }
    } catch (e) {
      console.warn("[Header] Erro ao carregar tamanho da fonte:", e);
    }
    state.currentFontSize = config.defaultFontSize;
    return false;
  }
  
  // Funções de Theme
  function saveTheme() {
    try {
      localStorage.setItem(config.themeStorageKey, state.isDarkMode ? "dark" : "light");
    } catch (e) {
      console.warn("[Header] Erro ao salvar tema:", e);
    }
  }
  
  function loadTheme() {
    try {
      const stored = localStorage.getItem(config.themeStorageKey);
      if (stored) {
        state.isDarkMode = stored === "dark";
        return true;
      }
    } catch (e) {
      console.warn("[Header] Erro ao carregar tema:", e);
    }
    state.isDarkMode = false;
    return false;
  }
  
  // Módulo de Font Size
  function initFontSizeControls() {
    function updateFontSize(newSize) {
      const clampedSize = Math.max(config.minFontSize, Math.min(config.maxFontSize, newSize));
      state.currentFontSize = clampedSize;
      document.documentElement.style.fontSize = state.currentFontSize + "px";
      saveFontSize();
      updateFontButtons();
    }
    
    function updateFontButtons() {
      const fontIncreaseBtns = [getElementById("font-increase"), getElementById("mobile-font-increase")];
      const fontReduceBtns = [getElementById("font-reduce"), getElementById("mobile-font-reduce")];
      
      fontIncreaseBtns.forEach(function(btn) {
        if (btn) btn.disabled = state.currentFontSize >= config.maxFontSize;
      });
      
      fontReduceBtns.forEach(function(btn) {
        if (btn) btn.disabled = state.currentFontSize <= config.minFontSize;
      });
    }
    
    function increaseFont(event) {
      event.preventDefault();
      event.stopPropagation();
      updateFontSize(state.currentFontSize + config.fontStep);
    }
    
    function decreaseFont(event) {
      event.preventDefault();
      event.stopPropagation();
      updateFontSize(state.currentFontSize - config.fontStep);
    }
    
    const fontIncreaseDesktop = getElementById("font-increase");
    const fontReduceDesktop = getElementById("font-reduce");
    const fontIncreaseMobile = getElementById("mobile-font-increase");
    const fontReduceMobile = getElementById("mobile-font-reduce");
    
    if (fontIncreaseDesktop) fontIncreaseDesktop.addEventListener("click", increaseFont);
    if (fontReduceDesktop) fontReduceDesktop.addEventListener("click", decreaseFont);
    if (fontIncreaseMobile) fontIncreaseMobile.addEventListener("click", increaseFont);
    if (fontReduceMobile) fontReduceMobile.addEventListener("click", decreaseFont);
    
    updateFontButtons();
  }
  
  // Módulo de Theme Toggle
  function initThemeToggle() {
    const desktopToggle = getElementById("theme-toggle");
    const mobileToggle = getElementById("mobile-theme-toggle");
    
    function applyTheme(isDark) {
      state.isDarkMode = isDark;
      document.body.classList.toggle("dark-theme", isDark);
      
      if (desktopToggle) {
        const icon = desktopToggle.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-moon", "fa-sun");
          icon.classList.add(isDark ? "fa-sun" : "fa-moon");
        }
      }
      
      if (mobileToggle) {
        const sunIcon = mobileToggle.querySelector(".theme-icon.sun");
        const moonIcon = mobileToggle.querySelector(".theme-icon.moon");
        if (sunIcon) sunIcon.style.display = isDark ? "inline" : "none";
        if (moonIcon) moonIcon.style.display = isDark ? "none" : "inline";
      }
      
      saveTheme();
    }
    
    function toggleTheme(event) {
      event.preventDefault();
      event.stopPropagation();
      applyTheme(!state.isDarkMode);
    }
    
    if (desktopToggle) desktopToggle.addEventListener("click", toggleTheme);
    if (mobileToggle) mobileToggle.addEventListener("click", toggleTheme);
    
    if (state.isDarkMode) applyTheme(true);
  }
  
  // Skip Links
  function initSkipLinks() {
    function scrollToTarget(link, targetId) {
      link && link.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        const target = getElementById(targetId);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
          target.setAttribute("tabindex", "-1");
          target.focus();
        }
      });
    }
    
    scrollToTarget(getElementById("skip-top"), "main-header");
    scrollToTarget(getElementById("skip-content"), "main-content");
    scrollToTarget(getElementById("skip-footer"), "footer");
  }
  
  // Mobile Menu
  function initMobileMenu() {
    const menuToggle = getElementById("mobile-menu-toggle");
    const menuClose = getElementById("mobile-menu-close");
    const mobileMenu = getElementById("mobile-menu");
    const menuOverlay = getElementById("mobile-menu-overlay");
    
    function openMenu() {
      if (mobileMenu) {
        mobileMenu.classList.add("active");
        mobileMenu.setAttribute("aria-expanded", "true");
      }
      if (menuOverlay) menuOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
    
    function closeMenu() {
      if (mobileMenu) {
        mobileMenu.classList.remove("active");
        mobileMenu.setAttribute("aria-expanded", "false");
      }
      if (menuOverlay) menuOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
    
    function toggleMenu() {
      mobileMenu && mobileMenu.classList.contains("active") ? closeMenu() : openMenu();
    }
    
    if (menuToggle) menuToggle.addEventListener("click", toggleMenu);
    if (menuClose) menuClose.addEventListener("click", closeMenu);
    if (menuOverlay) menuOverlay.addEventListener("click", closeMenu);
    
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && mobileMenu && mobileMenu.classList.contains("active")) {
        closeMenu();
      }
    });
  }
  
  // Mobile Submenus
  function initMobileSubmenus() {
    // Expansão do primeiro nível
    querySelectorAll(".mobile-nav-item.has-mobile-submenu").forEach(function(navItem) {
      const toggleBtn = navItem.querySelector(".mobile-nav-dropdown");
      const submenu = navItem.querySelector(".mobile-submenu");
      
      if (toggleBtn && submenu) {
        toggleBtn.addEventListener("click", function(event) {
          event.preventDefault();
          const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
          
          querySelectorAll(".mobile-nav-item.has-mobile-submenu").forEach(function(otherItem) {
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
    
    // Expansão do segundo nível
    querySelectorAll(".mobile-submenu-item.has-mobile-submenu").forEach(function(subItem) {
      const toggleBtn = subItem.querySelector(".mobile-submenu-dropdown");
      const submenu = subItem.querySelector(".mobile-submenu.level-3");
      
      if (toggleBtn && submenu) {
        const backIndicator = document.createElement("li");
        backIndicator.className = "submenu-back-item";
        backIndicator.innerHTML = '<a href="#" class="submenu-back-link">Voltar</a>';
        backIndicator.style.cssText = "display: none; padding: 8px 0; border-bottom: 1px solid #e0e0e0; margin-bottom: 8px;";
        submenu.insertBefore(backIndicator, submenu.firstChild);
        
        toggleBtn.addEventListener("click", function(event) {
          event.preventDefault();
          const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
          
          querySelectorAll(".mobile-submenu-item.has-mobile-submenu").forEach(function(otherItem) {
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
        
        backIndicator.querySelector(".submenu-back-link").addEventListener("click", function(event) {
          event.preventDefault();
          toggleBtn.setAttribute("aria-expanded", "false");
          subItem.classList.remove("active");
          submenu.style.display = "";
          backIndicator.style.display = "none";
        });
      }
    });
  }
  
  // Mobile Languages
  function initMobileLanguages() {
    const section = getElementById("mobile-idiomas-section");
    const toggle = getElementById("mobile-idiomas-toggle");
    const list = getElementById("mobile-idiomas-list");
    const arrow = getElementById("mobile-idiomas-arrow");
    
    if (!section || !toggle || !list) return;
    
    toggle.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      const isExpanded = section.classList.contains("expanded");
      section.classList.toggle("expanded");
      list.style.display = isExpanded ? "none" : "grid";
      toggle.setAttribute("aria-expanded", !isExpanded);
      if (arrow) {
        arrow.classList.toggle("fa-chevron-down", isExpanded);
        arrow.classList.toggle("fa-chevron-up", !isExpanded);
      }
    });
    
    querySelectorAll(".language-flag-item").forEach(function(link) {
      link.addEventListener("click", function(event) {
        event.preventDefault();
        
        querySelectorAll(".language-flag-item").forEach(function(item) {
          item.classList.remove("active");
        });
        
        this.classList.add("active");
        const img = this.querySelector("img");
        const current = getElementById("mobile-idiomas-current");
        const alt = img ? img.alt : "";
        const lang = this.getAttribute("data-lang");
        
        if (img && current) {
          current.innerHTML = img.outerHTML + '<span class="language-name">' + alt + '</span>';
        }
        
        try {
          localStorage.setItem("nursing_calc_lang", lang);
        } catch (err) {
          console.warn("[Header] Erro ao salvar idioma:", err);
        }
        
        section.classList.remove("expanded");
        list.style.display = "none";
        toggle.setAttribute("aria-expanded", "false");
        if (arrow) {
          arrow.classList.add("fa-chevron-down");
          arrow.classList.remove("fa-chevron-up");
        }
      });
    });
    
    try {
      const savedLang = localStorage.getItem("nursing_calc_lang") || "pt-br";
      const activeItem = list.querySelector('[data-lang="' + savedLang + '"]');
      if (activeItem) {
        activeItem.classList.add("active");
        const img = activeItem.querySelector("img");
        const current = getElementById("mobile-idiomas-current");
        if (img && current) {
          current.innerHTML = img.outerHTML + '<span class="language-name">' + img.alt + '</span>';
        }
      }
    } catch (err) {
      console.warn("[Header] Erro ao carregar idioma ativo:", err);
    }
  }
  
  // Mobile Search
  function initMobileSearch() {
    const searchToggle = getElementById("mobile-search-toggle");
    const searchContainer = getElementById("mobile-search-container");
    const searchInput = getElementById("mobile-menu-search-input");
    
    if (!searchToggle || !searchContainer) return;
    
    const toggleSearch = function() {
      const isExpanded = searchContainer.classList.contains("expanded");
      searchContainer.classList.toggle("expanded");
      searchToggle.classList.toggle("active");
      searchToggle.setAttribute("aria-expanded", !isExpanded);
      if (!isExpanded && searchInput) setTimeout(function() { searchInput && searchInput.focus(); }, 100);
    };
    
    searchToggle.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      toggleSearch();
    });
    
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && searchContainer.classList.contains("expanded")) {
        toggleSearch();
      }
    });
  }
  
  // Sync Language State
  function syncLanguageState() {
    const activeLanguageLinks = querySelectorAll(".mega-panel-idiomas .idiomas-list li a.active");
    const activeFlag = getElementById("active-lang-flag");
    
    if (activeLanguageLinks.length > 0 && getElementById("mobile-idiomas-current")) {
      const flagLink = activeLanguageLinks[0].querySelector(".idioma-flag-link");
      if (flagLink) {
        const clone = flagLink.cloneNode(true);
        clone.style.width = "24px";
        clone.style.height = "18px";
        clone.style.marginRight = "8px";
        clone.style.verticalAlign = "middle";
        
        const current = getElementById("mobile-idiomas-current");
        current.innerHTML = "";
        current.appendChild(clone);
        
        const langName = activeLanguageLinks[0].textContent.trim();
        if (langName) {
          current.innerHTML += '<span class="language-name">' + langName + '</span>';
        }
      }
    }
  }
  
  // Mega Menu
  function initMegaMenu() {
    const megaMenuItems = querySelectorAll(".has-mega-menu");
    
    megaMenuItems.forEach(function(item) {
      const toggleBtn = item.querySelector(".nav-link-dropdown");
      const megaPanel = item.querySelector(".mega-panel");
      
      if (!toggleBtn || !megaPanel) return;
      
      let timeout;
      
      function showMegaMenu() {
        clearTimeout(timeout);
        megaMenuItems.forEach(function(otherItem) {
          if (otherItem !== item) {
            const otherPanel = otherItem.querySelector(".mega-panel");
            const otherToggle = otherItem.querySelector(".nav-link-dropdown");
            if (otherPanel) otherPanel.classList.remove("active");
            if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
          }
        });
        megaPanel.classList.add("active");
        toggleBtn.setAttribute("aria-expanded", "true");
        document.body.classList.add("mega-menu-active");
      }
      
      function hideMegaMenu() {
        timeout = setTimeout(function() {
          megaPanel.classList.remove("active");
          toggleBtn.setAttribute("aria-expanded", "false");
          document.body.classList.remove("mega-menu-active");
        }, 150);
      }
      
      function handleMouseEnter() {
        if (window.matchMedia("(min-width: 1024px)").matches) {
          showMegaMenu();
        }
      }
      
      function handleMouseLeave() {
        if (window.matchMedia("(min-width: 1024px)").matches) {
          hideMegaMenu();
        }
      }
      
      function handleFocus() {
        if (window.matchMedia("(min-width: 1024px)").matches) {
          showMegaMenu();
        }
      }
      
      function handleClick(event) {
        if (window.matchMedia("(max-width: 1023px)").matches) {
          event.preventDefault();
          const isActive = megaPanel.classList.contains("active");
          megaMenuItems.forEach(function(otherItem) {
            const otherPanel = otherItem.querySelector(".mega-panel");
            const otherToggle = otherItem.querySelector(".nav-link-dropdown");
            if (otherPanel) otherPanel.classList.remove("active");
            if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
          });
          if (!isActive) showMegaMenu();
        }
      }
      
      toggleBtn.addEventListener("mouseenter", handleMouseEnter);
      toggleBtn.addEventListener("mouseleave", handleMouseLeave);
      toggleBtn.addEventListener("focus", handleFocus);
      toggleBtn.addEventListener("click", handleClick);
      megaPanel.addEventListener("mouseenter", function() { clearTimeout(timeout); });
      megaPanel.addEventListener("mouseleave", handleMouseLeave);
      
      document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
          megaPanel.classList.remove("active");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });
    });
  }
  
  // Menu Tabs
  function initMenuTabs() {
    querySelectorAll(".menu-tabs").forEach(function(tabsContainer) {
      const tabTriggers = tabsContainer.querySelectorAll(".menu-tab-trigger");
      const tabContents = tabsContainer.parentElement.parentElement.querySelectorAll(".tab-content");
      
      tabTriggers.forEach(function(trigger) {
        trigger.addEventListener("click", function() {
          const targetTab = this.getAttribute("data-tab");
          
          tabTriggers.forEach(function(t) {
            t.classList.remove("active");
            t.setAttribute("aria-selected", "false");
          });
          
          this.classList.add("active");
          this.setAttribute("aria-selected", "true");
          
          tabContents.forEach(function(content) {
            content.classList.remove("active");
            if (content.id === "tab-" + targetTab) {
              content.classList.add("active");
            }
          });
        });
      });
    });
  }
  
  // Language Selection
  function initLanguageSelection() {
    const languageLinks = querySelectorAll(".mega-panel-idiomas .idiomas-list li a");
    const activeFlag = getElementById("active-lang-flag");
    
    const currentFlagSrc = activeFlag ? activeFlag.src : "";
    const currentFlagAlt = activeFlag ? activeFlag.alt : "Português (Brasil)";
    
    function setActiveLanguage(selectedLink) {
      languageLinks.forEach(function(link) {
        link.classList.remove("active");
      });
      selectedLink.classList.add("active");
      
      const flagLink = selectedLink.querySelector(".idioma-flag-link");
      if (flagLink && activeFlag) {
        activeFlag.src = flagLink.src;
        activeFlag.alt = flagLink.alt;
      }
      
      querySelectorAll(".mega-panel").forEach(function(panel) {
        panel.classList.remove("active");
      });
    }
    
    languageLinks.forEach(function(link) {
      const flagLink = link.querySelector(".idioma-flag-link");
      if (flagLink && currentFlagSrc && flagLink.src === currentFlagSrc) {
        link.classList.add("active");
      }
    });
    
    languageLinks.forEach(function(link) {
      link.addEventListener("click", function(event) {
        event.preventDefault();
        setActiveLanguage(this);
      });
    });
  }
  
  // Search Functionality
  function initSearch() {
    const searchContainer = querySelector(".search-container");
    if (!searchContainer) return;
    
    const searchInput = searchContainer.querySelector(".search-input");
    const searchBtn = searchContainer.querySelector(".search-btn");
    
    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", function() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          console.log("[Search] Buscando:", searchTerm);
        }
      });
      
      searchInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
          searchBtn.click();
        }
      });
    }
  }
  
  // Header Scroll Effects
  function initHeaderScroll() {
    const mainHeader = querySelector(".main-header");
    let lastScrollY = 0;
    
    if (!mainHeader) return;
    
    function handleScroll() {
      const currentScrollY = window.pageYOffset;
      if (currentScrollY > 50) {
        mainHeader.classList.add("scrolled");
      } else {
        mainHeader.classList.remove("scrolled");
      }
      lastScrollY = currentScrollY;
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }
  
  function initHeaderHide() {
    const mainHeader = querySelector(".main-header");
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    if (!mainHeader) return;
    
    function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        mainHeader.classList.add("header-hidden");
      } else {
        mainHeader.classList.remove("header-hidden");
      }
      lastScrollY = currentScrollY;
      ticking = false;
    }
    
    window.addEventListener("scroll", function() {
      if (!ticking) {
        requestAnimationFrame(updateHeaderVisibility);
        ticking = true;
      }
    }, { passive: true });
  }
  
  // Main Initialization
  function initialize() {
    if (state.loaded) return;
    
    state.loaded = true;
    console.log("[Header] Inicializando módulo do cabeçalho...");
    
    loadFontSize();
    loadTheme();
    
    document.documentElement.style.fontSize = state.currentFontSize + "px";
    
    initFontSizeControls();
    initThemeToggle();
    initSkipLinks();
    initMobileMenu();
    initMobileSubmenus();
    initMobileLanguages();
    initMobileSearch();
    syncLanguageState();
    initMegaMenu();
    initMenuTabs();
    initLanguageSelection();
    initSearch();
    initHeaderScroll();
    initHeaderHide();
    
    console.log("[Header] Módulo do cabeçalho inicializado com sucesso");
  }
  
  // Expose global API
  window.HeaderModule = {
    init: function() {
      state.loaded = false;
      initialize();
    },
    setFontSize: function(size) {
      state.currentFontSize = Math.max(config.minFontSize, Math.min(config.maxFontSize, size));
      document.documentElement.style.fontSize = state.currentFontSize + "px";
      saveFontSize();
    },
    toggleTheme: function() {
      initThemeToggle();
    },
    getFontSize: function() {
      return state.currentFontSize;
    }
  };
})();
