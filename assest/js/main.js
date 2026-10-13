document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* ========================================================
     KONFIGURASI
  ======================================================== */

  const COMPONENT_DIRECTORY = "components";
  const DESKTOP_BREAKPOINT = 992;
  const BACK_TO_TOP_OFFSET = 300;

  /* ========================================================
     PEMUATAN KOMPONEN
  ======================================================== */

  function getComponentUrl(fileName) {
    return new URL(`${COMPONENT_DIRECTORY}/${fileName}`, document.baseURI).href;
  }

  async function loadComponent(containerId, fileName) {
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`Container #${containerId} tidak ditemukan.`);

      return false;
    }

    const componentUrl = getComponentUrl(fileName);

    try {
      const response = await fetch(componentUrl, {
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      container.innerHTML = await response.text();

      console.log(`${fileName} berhasil dimuat.`);

      return true;
    } catch (error) {
      console.error(`Gagal memuat ${fileName}:`, error);

      container.innerHTML = `
        <div
          class="alert alert-danger m-3"
          role="alert"
        >
          <div class="fw-semibold">
            Gagal memuat komponen ${fileName}.
          </div>

          <div class="small mt-1">
            Lokasi: ${componentUrl}
          </div>
        </div>
      `;

      return false;
    }
  }

  /* ========================================================
     THEME TOGGLE
  ======================================================== */

  function initializeThemeToggle() {
    const root = document.documentElement;

    const button = document.getElementById("theme-toggle");

    const icon = document.getElementById("theme-toggle-icon");

    if (!button || !icon) {
      console.warn("Theme toggle tidak ditemukan.");

      return;
    }

    if (button.dataset.initialized === "true") {
      return;
    }

    button.dataset.initialized = "true";

    const savedTheme = localStorage.getItem("portfolio-theme");

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    function applyTheme(theme) {
      const isDark = theme === "dark";

      root.setAttribute("data-bs-theme", isDark ? "dark" : "light");

      icon.className = isDark ? "ti ti-sun" : "ti ti-moon";

      const label = isDark ? "Gunakan tema terang" : "Gunakan tema gelap";

      button.setAttribute("aria-label", label);

      button.setAttribute("title", label);
    }

    applyTheme(initialTheme);

    button.addEventListener("click", function () {
      const currentTheme = root.getAttribute("data-bs-theme");

      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      localStorage.setItem("portfolio-theme", nextTheme);

      applyTheme(nextTheme);
    });
  }

  /* ========================================================
     SIDEBAR DESKTOP
  ======================================================== */

  function initializeSidebarToggle() {
    const button = document.getElementById("sidebar-toggle");

    const sidebarContainer = document.getElementById("sidebar-container");

    if (!button || !sidebarContainer) {
      console.warn("Tombol atau container sidebar tidak ditemukan.");

      return;
    }

    if (button.dataset.initialized === "true") {
      return;
    }

    button.dataset.initialized = "true";

    const icon = button.querySelector(".ti");

    function applySidebarState(collapsed) {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;

      const shouldCollapse = collapsed && isDesktop;

      document.body.classList.toggle("sidebar-collapsed", shouldCollapse);

      const label = shouldCollapse ? "Perbesar sidebar" : "Perkecil sidebar";

      button.setAttribute("aria-expanded", String(!shouldCollapse));

      button.setAttribute("aria-label", label);

      button.setAttribute("title", label);

      if (icon) {
        icon.className = shouldCollapse
          ? "ti ti-layout-sidebar-left-expand"
          : "ti ti-layout-sidebar-left-collapse";
      }
    }

    const savedState = localStorage.getItem("portfolio-sidebar");

    applySidebarState(savedState === "collapsed");

    button.addEventListener("click", function () {
      const currentlyCollapsed =
        document.body.classList.contains("sidebar-collapsed");

      const nextCollapsed = !currentlyCollapsed;

      localStorage.setItem(
        "portfolio-sidebar",
        nextCollapsed ? "collapsed" : "expanded",
      );

      applySidebarState(nextCollapsed);
    });

    window.addEventListener("resize", function () {
      const storedState = localStorage.getItem("portfolio-sidebar");

      applySidebarState(storedState === "collapsed");
    });
  }

  /* ========================================================
     NAVBAR RESPONSIF
  ======================================================== */

  function initializeNavbar() {
    const navbarMenu = document.getElementById("navbar-menu");

    if (!navbarMenu) {
      console.warn("Menu navbar tidak ditemukan.");

      return;
    }

    if (navbarMenu.dataset.navbarInitialized === "true") {
      return;
    }

    navbarMenu.dataset.navbarInitialized = "true";

    const links = navbarMenu.querySelectorAll('a.nav-link[href^="#"]');

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;

        const menuIsOpen = navbarMenu.classList.contains("show");

        if (isMobile && menuIsOpen && window.bootstrap) {
          const collapse =
            window.bootstrap.Collapse.getOrCreateInstance(navbarMenu);

          collapse.hide();
        }
      });
    });
  }

  /* ========================================================
     ALERT
  ======================================================== */

  function initializeAlert() {
    const alertElement = document.getElementById("portfolio-alert");

    const titleElement = document.getElementById("alert-title");

    const messageElement = document.getElementById("alert-message");

    const iconElement = document.getElementById("alert-icon");

    const closeButton = document.getElementById("alert-close");

    if (!alertElement || !titleElement || !messageElement || !iconElement) {
      console.warn("Komponen alert tidak lengkap.");

      return;
    }

    const alertTypes = {
      info: {
        alertClass: "alert-info",
        iconClass: "ti-info-circle",
      },

      success: {
        alertClass: "alert-success",
        iconClass: "ti-circle-check",
      },

      warning: {
        alertClass: "alert-warning",
        iconClass: "ti-alert-triangle",
      },

      danger: {
        alertClass: "alert-danger",
        iconClass: "ti-circle-x",
      },
    };

    window.showPortfolioAlert = function (title, message, type = "info") {
      const selectedType = alertTypes[type] || alertTypes.info;

      alertElement.classList.remove(
        "d-none",
        "alert-info",
        "alert-success",
        "alert-warning",
        "alert-danger",
      );

      alertElement.classList.add(selectedType.alertClass);

      titleElement.textContent = title;

      messageElement.textContent = message;

      iconElement.className = `ti ${selectedType.iconClass}`;
    };

    window.hidePortfolioAlert = function () {
      alertElement.classList.add("d-none");
    };

    if (closeButton && closeButton.dataset.initialized !== "true") {
      closeButton.dataset.initialized = "true";

      closeButton.addEventListener("click", function () {
        window.hidePortfolioAlert();
      });
    }
  }

  /* ========================================================
     FOOTER
  ======================================================== */

  function initializeFooter() {
    const yearElement = document.getElementById("footer-year");

    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  /* ========================================================
     TOMBOL KEMBALI KE ATAS
  ======================================================== */

  function initializeBackToTop() {
    const button = document.getElementById("back-to-top");

    if (!button) {
      console.warn("Tombol kembali ke atas tidak ditemukan.");

      return;
    }

    if (button.dataset.initialized === "true") {
      return;
    }

    button.dataset.initialized = "true";

    function updateVisibility() {
      const shouldShow = window.scrollY > BACK_TO_TOP_OFFSET;

      button.classList.toggle("is-visible", shouldShow);

      button.setAttribute("aria-hidden", String(!shouldShow));

      button.tabIndex = shouldShow ? 0 : -1;
    }

    updateVisibility();

    window.addEventListener("scroll", updateVisibility, {
      passive: true,
    });

    button.addEventListener("click", function (event) {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      if (window.history && window.history.replaceState) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    });
  }

  /* ========================================================
     GALERI
  ======================================================== */

  function initializeGallery() {
    const galleryButtons = document.querySelectorAll(".gallery-image-button");

    const modalElement = document.getElementById("gallery-modal");

    const modalImage = document.getElementById("gallery-modal-image");

    const modalTitle = document.getElementById("gallery-modal-title");

    if (!galleryButtons.length || !modalElement || !modalImage || !modalTitle) {
      return;
    }

    if (!window.bootstrap) {
      console.warn("JavaScript Tabler tidak tersedia untuk modal galeri.");

      return;
    }

    const galleryModal =
      window.bootstrap.Modal.getOrCreateInstance(modalElement);

    galleryButtons.forEach(function (button) {
      if (button.dataset.initialized === "true") {
        return;
      }

      button.dataset.initialized = "true";

      button.addEventListener("click", function () {
        const imageSource = button.dataset.galleryImage;

        const imageTitle = button.dataset.galleryTitle || "Dokumentasi";

        if (!imageSource) {
          return;
        }

        modalImage.src = imageSource;

        modalImage.alt = imageTitle;

        modalTitle.textContent = imageTitle;

        galleryModal.show();
      });
    });

    if (modalElement.dataset.initialized !== "true") {
      modalElement.dataset.initialized = "true";

      modalElement.addEventListener("hidden.bs.modal", function () {
        modalImage.src = "";
        modalImage.alt = "";
      });
    }
  }

  /* ========================================================
     NAVIGASI AKTIF NAVBAR
  ======================================================== */

  function initializeActiveNavigation() {
    const navbarMenu = document.getElementById("navbar-menu");

    if (!navbarMenu) {
      console.warn("Navigasi aktif gagal: #navbar-menu tidak ditemukan.");

      return;
    }

    if (navbarMenu.dataset.activeNavigation === "initialized") {
      return;
    }

    navbarMenu.dataset.activeNavigation = "initialized";

    const navigationLinks = Array.from(
      navbarMenu.querySelectorAll('a.nav-link[href^="#"]'),
    );

    const navigationItems = navigationLinks
      .map(function (link) {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
          return null;
        }

        const section = document.querySelector(targetId);

        if (!section) {
          console.warn(`Section ${targetId} tidak ditemukan.`);

          return null;
        }

        return {
          link: link,
          targetId: targetId,
          section: section,
        };
      })
      .filter(Boolean);

    if (!navigationItems.length) {
      console.warn("Link atau section navigasi tidak ditemukan.");

      return;
    }

    let navigationLocked = false;
    let unlockTimer = null;
    let scrollFrameRequested = false;

    /* ======================================================
       STATUS LINK AKTIF
    ====================================================== */

    function setActiveNavigation(targetId) {
      navigationLinks.forEach(function (link) {
        const isActive = link.getAttribute("href") === targetId;

        link.classList.toggle("active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    /* ======================================================
       TINGGI NAVBAR
    ====================================================== */

    function getNavbarHeight() {
      const navbarContainer = document.getElementById("navbar-container");

      return navbarContainer ? navbarContainer.offsetHeight : 58;
    }

    /* ======================================================
       MENENTUKAN SECTION AKTIF
    ====================================================== */

    function getCurrentSectionId() {
      const markerPosition = window.scrollY + getNavbarHeight() + 100;

      let currentTargetId = navigationItems[0].targetId;

      navigationItems.forEach(function (item) {
        const sectionTop =
          item.section.getBoundingClientRect().top + window.scrollY;

        if (sectionTop <= markerPosition) {
          currentTargetId = item.targetId;
        }
      });

      const reachedBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      if (reachedBottom) {
        currentTargetId = navigationItems[navigationItems.length - 1].targetId;
      }

      return currentTargetId;
    }

    /* ======================================================
       MEMPERBARUI MENU DARI SCROLL
    ====================================================== */

    function updateActiveFromScroll() {
      if (navigationLocked) {
        return;
      }

      setActiveNavigation(getCurrentSectionId());
    }

    /* ======================================================
       KLIK MENU
    ====================================================== */

    navigationItems.forEach(function (item) {
      item.link.addEventListener("click", function (event) {
        event.preventDefault();

        navigationLocked = true;

        /*
         * Garis langsung muncul pada
         * klik pertama.
         */
        setActiveNavigation(item.targetId);

        /*
         * Memperbarui hash URL tanpa
         * loncatan bawaan browser.
         */
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", item.targetId);
        }

        /*
         * Posisi tujuan memperhitungkan
         * navbar fixed.
         */
        const targetPosition =
          item.section.getBoundingClientRect().top +
          window.scrollY -
          getNavbarHeight() -
          12;

        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: "smooth",
        });

        /*
         * Tutup navbar mobile.
         */
        if (
          window.innerWidth < DESKTOP_BREAKPOINT &&
          navbarMenu.classList.contains("show") &&
          window.bootstrap
        ) {
          const collapse =
            window.bootstrap.Collapse.getOrCreateInstance(navbarMenu);

          collapse.hide();
        }

        if (unlockTimer) {
          window.clearTimeout(unlockTimer);
        }

        /*
         * Kunci garis selama smooth scroll.
         */
        unlockTimer = window.setTimeout(function () {
          navigationLocked = false;

          unlockTimer = null;

          updateActiveFromScroll();
        }, 900);
      });
    });

    /* ======================================================
       SCROLL MANUAL
    ====================================================== */

    window.addEventListener(
      "scroll",
      function () {
        if (navigationLocked || scrollFrameRequested) {
          return;
        }

        scrollFrameRequested = true;

        window.requestAnimationFrame(function () {
          updateActiveFromScroll();

          scrollFrameRequested = false;
        });
      },
      {
        passive: true,
      },
    );

    /* ======================================================
       RESIZE
    ====================================================== */

    window.addEventListener("resize", function () {
      if (!navigationLocked) {
        updateActiveFromScroll();
      }
    });

    /* ======================================================
       STATUS AWAL
    ====================================================== */

    const initialHash = window.location.hash;

    const validInitialHash = navigationItems.some(function (item) {
      return item.targetId === initialHash;
    });

    if (validInitialHash) {
      setActiveNavigation(initialHash);
    } else {
      updateActiveFromScroll();
    }
  }

  /* ========================================================
     INISIALISASI HALAMAN
  ======================================================== */

  async function initializePage() {
    /*
     * Navbar.
     */
    const navbarLoaded = await loadComponent("navbar-container", "navbar.html");

    if (navbarLoaded) {
      /*
       * Theme toggle berada di dalam navbar.
       */
      const themeLoaded = await loadComponent(
        "theme-toggle-container",
        "theme-toggle.html",
      );

      if (themeLoaded) {
        initializeThemeToggle();
      }

      initializeNavbar();
    }

    /*
     * Sidebar.
     */
    const sidebarLoaded = await loadComponent(
      "sidebar-container",
      "sidebar.html",
    );

    if (navbarLoaded && sidebarLoaded) {
      initializeSidebarToggle();
    }

    /*
     * Alert.
     */
    const alertLoaded = await loadComponent("alert-container", "alert.html");

    if (alertLoaded) {
      initializeAlert();
    }

    /*
     * Footer.
     */
    const footerLoaded = await loadComponent("footer-container", "footer.html");

    if (footerLoaded) {
      initializeFooter();
      initializeBackToTop();
    }

    /*
     * Aktifkan navigasi setelah navbar tersedia.
     */
    if (navbarLoaded) {
      initializeActiveNavigation();
    }

    /*
     * Galeri berada langsung di index.html.
     */
    initializeGallery();

    console.log("Komponen utama selesai dimuat.", {
      navbar: navbarLoaded,
      sidebar: sidebarLoaded,
      alert: alertLoaded,
      footer: footerLoaded,
    });
  }

  /*
   * Hanya satu pemanggilan.
   */
  initializePage();
});
