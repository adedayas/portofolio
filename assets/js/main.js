document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* ========================================================
     KONFIGURASI
  ======================================================== */

  const COMPONENT_DIRECTORY = "./components";
  const DESKTOP_BREAKPOINT = 992;
  const BACK_TO_TOP_OFFSET = 300;
  const NAVBAR_FALLBACK_HEIGHT = 58;

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
        cache: "no-store",
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
     PENGUMUMAN AKSESIBILITAS
  ======================================================== */

  function announceStatus(message) {
    const statusElement = document.getElementById("portfolio-status");

    if (!statusElement) {
      return;
    }

    statusElement.textContent = "";

    window.setTimeout(function () {
      statusElement.textContent = message;
    }, 50);
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

      const themeColorMeta = document.querySelector('meta[name="theme-color"]');

      if (themeColorMeta) {
        themeColorMeta.setAttribute("content", isDark ? "#182433" : "#066fd1");
      }

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

      announceStatus(
        nextTheme === "dark"
          ? "Mode gelap diaktifkan."
          : "Mode terang diaktifkan.",
      );
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

    const toggleButton =
      document.getElementById("mobile-navbar-toggle") ||
      document.querySelector(".mobile-navbar-toggle");

    if (!navbarMenu) {
      console.warn("Menu navbar tidak ditemukan.");

      return;
    }

    if (!toggleButton) {
      console.warn("Tombol hamburger tidak ditemukan.");

      return;
    }

    if (toggleButton.dataset.initialized === "true") {
      return;
    }

    if (!window.bootstrap || !window.bootstrap.Collapse) {
      console.error("Bootstrap Collapse tidak tersedia.");

      return;
    }

    toggleButton.dataset.initialized = "true";

    const toggleIcon = toggleButton.querySelector(".ti");

    const collapseInstance = window.bootstrap.Collapse.getOrCreateInstance(
      navbarMenu,
      {
        toggle: false,
      },
    );

    function updateToggleButton(isOpen) {
      toggleButton.setAttribute("aria-expanded", String(isOpen));

      const label = isOpen ? "Tutup menu navigasi" : "Buka menu navigasi";

      toggleButton.setAttribute("aria-label", label);

      toggleButton.setAttribute("title", isOpen ? "Tutup menu" : "Buka menu");

      if (toggleIcon) {
        toggleIcon.className = isOpen ? "ti ti-x" : "ti ti-menu-2";
      }
    }

    toggleButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (navbarMenu.classList.contains("collapsing")) {
        return;
      }

      const isOpen = navbarMenu.classList.contains("show");

      if (isOpen) {
        collapseInstance.hide();
      } else {
        collapseInstance.show();
      }
    });

    navbarMenu.addEventListener("shown.bs.collapse", function () {
      updateToggleButton(true);
    });

    navbarMenu.addEventListener("hidden.bs.collapse", function () {
      updateToggleButton(false);
    });

    const navigationLinks = navbarMenu.querySelectorAll(
      'a.nav-link[href^="#"]',
    );

    navigationLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;

        const isOpen = navbarMenu.classList.contains("show");

        if (isMobile && isOpen) {
          collapseInstance.hide();
        }
      });
    });

    document.addEventListener("click", function (event) {
      const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;

      const isOpen = navbarMenu.classList.contains("show");

      if (!isMobile || !isOpen) {
        return;
      }

      const clickedInsideMenu = navbarMenu.contains(event.target);

      const clickedToggle = toggleButton.contains(event.target);

      if (!clickedInsideMenu && !clickedToggle) {
        collapseInstance.hide();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") {
        return;
      }

      const isOpen = navbarMenu.classList.contains("show");

      if (!isOpen) {
        return;
      }

      collapseInstance.hide();
      toggleButton.focus();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        navbarMenu.classList.remove("show", "collapsing");

        navbarMenu.style.height = "";

        updateToggleButton(false);
      }
    });

    updateToggleButton(false);
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
    const modalElement = document.getElementById("gallery-modal");

    const modalImage = document.getElementById("gallery-modal-image");

    const modalTitle = document.getElementById("gallery-modal-title");

    const modalDescription = document.getElementById(
      "gallery-modal-description",
    );

    const closeButton = document.getElementById("gallery-modal-close");

    if (!modalElement || !modalImage || !modalTitle || !closeButton) {
      console.error("Elemen modal galeri tidak lengkap.", {
        modal: Boolean(modalElement),
        image: Boolean(modalImage),
        title: Boolean(modalTitle),
        closeButton: Boolean(closeButton),
      });

      return;
    }

    if (!window.bootstrap || !window.bootstrap.Modal) {
      console.error("Bootstrap Modal tidak tersedia.");

      return;
    }

    if (modalElement.dataset.galleryInitialized === "true") {
      return;
    }

    modalElement.dataset.galleryInitialized = "true";

    const galleryButtons = document.querySelectorAll(".gallery-image-button");

    let lastGalleryButton = null;

    const galleryModal = window.bootstrap.Modal.getOrCreateInstance(
      modalElement,
      {
        backdrop: true,
        keyboard: true,
        focus: false,
      },
    );

    galleryButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();

        const imageSource = button.dataset.galleryImage;

        const imageTitle = button.dataset.galleryTitle || "Dokumentasi";

        if (!imageSource) {
          console.error("data-gallery-image kosong.", button);

          return;
        }

        lastGalleryButton = button;

        modalImage.src = imageSource;

        modalImage.alt = imageTitle;

        modalTitle.textContent = imageTitle;

        if (modalDescription) {
          modalDescription.textContent = `Dokumentasi ${imageTitle}.`;
        }

        galleryModal.show();

        announceStatus(`Membuka dokumentasi ${imageTitle}.`);
      });
    });

    closeButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const activeElement = document.activeElement;

      if (activeElement && modalElement.contains(activeElement)) {
        activeElement.blur();
      }

      if (!document.body.hasAttribute("tabindex")) {
        document.body.setAttribute("tabindex", "-1");
      }

      document.body.focus({
        preventScroll: true,
      });

      window.setTimeout(function () {
        galleryModal.hide();
      }, 0);
    });

    modalElement.addEventListener("hide.bs.modal", function () {
      const activeElement = document.activeElement;

      if (activeElement && modalElement.contains(activeElement)) {
        activeElement.blur();

        document.body.focus({
          preventScroll: true,
        });
      }
    });

    modalElement.addEventListener("hidden.bs.modal", function () {
      modalImage.removeAttribute("src");

      modalImage.alt = "";

      modalTitle.textContent = "Dokumentasi";

      if (modalDescription) {
        modalDescription.textContent =
          "Tampilan dokumentasi pekerjaan IT Support.";
      }

      if (lastGalleryButton && document.body.contains(lastGalleryButton)) {
        lastGalleryButton.focus({
          preventScroll: true,
        });
      }

      announceStatus("Galeri ditutup.");
    });

    console.log("Galeri berhasil diinisialisasi.");
  }

  /* ========================================================
     NAVIGASI AKTIF
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
       TINGGI BARIS ATAS NAVBAR
    ====================================================== */

    function getNavbarTopHeight() {
      const navbarElement = document.querySelector("#navbar-container .navbar");

      const navbarStart = document.querySelector(
        "#navbar-container .navbar-start",
      );

      /*
       * Jangan gunakan tinggi #navbar-container
       * pada mobile karena menu terbuka ikut
       * menambah tinggi container tersebut.
       */
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        if (navbarStart) {
          return Math.max(
            NAVBAR_FALLBACK_HEIGHT,
            navbarStart.offsetHeight + 16,
          );
        }

        return NAVBAR_FALLBACK_HEIGHT;
      }

      if (navbarElement) {
        return Math.min(navbarElement.offsetHeight, 80);
      }

      return NAVBAR_FALLBACK_HEIGHT;
    }

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
       MENENTUKAN SECTION AKTIF
    ====================================================== */

    function getCurrentSectionId() {
      const markerPosition = getNavbarTopHeight() + 90;

      let activeTargetId = navigationItems[0].targetId;

      navigationItems.forEach(function (item) {
        const sectionTop = item.section.getBoundingClientRect().top;

        if (sectionTop <= markerPosition) {
          activeTargetId = item.targetId;
        }
      });

      const reachedBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      if (reachedBottom) {
        activeTargetId = navigationItems[navigationItems.length - 1].targetId;
      }

      return activeTargetId;
    }

    /* ======================================================
       MEMPERBARUI STATUS DARI SCROLL
    ====================================================== */

    function updateActiveFromScroll() {
      if (navigationLocked) {
        return;
      }

      setActiveNavigation(getCurrentSectionId());
    }

    /* ======================================================
       SCROLL KE SECTION
    ====================================================== */

    function scrollToSection(item) {
      const targetPosition =
        item.section.getBoundingClientRect().top +
        window.scrollY -
        getNavbarTopHeight() -
        12;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
    }

    /* ======================================================
       KLIK MENU
    ====================================================== */

    navigationItems.forEach(function (item) {
      item.link.addEventListener("click", function (event) {
        event.preventDefault();

        navigationLocked = true;

        /*
         * Status aktif langsung berubah
         * pada klik pertama.
         */
        setActiveNavigation(item.targetId);

        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", item.targetId);
        }

        /*
         * Tunggu menu mobile mulai tertutup,
         * kemudian hitung posisi section.
         */
        if (window.innerWidth < DESKTOP_BREAKPOINT) {
          window.setTimeout(function () {
            scrollToSection(item);
          }, 80);
        } else {
          scrollToSection(item);
        }

        if (unlockTimer) {
          window.clearTimeout(unlockTimer);
        }

        unlockTimer = window.setTimeout(function () {
          navigationLocked = false;
          unlockTimer = null;

          /*
           * Pertahankan target yang baru
           * dipilih setelah smooth scroll.
           */
          setActiveNavigation(item.targetId);
        }, 1200);
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

    const initialItem = navigationItems.find(function (item) {
      return item.targetId === initialHash;
    });

    if (initialItem) {
      setActiveNavigation(initialHash);

      window.setTimeout(function () {
        scrollToSection(initialItem);
      }, 100);
    } else {
      updateActiveFromScroll();
    }
  }

  /* ========================================================
     CETAK PORTOFOLIO
  ======================================================== */

  function initializePrintPortfolio() {
    const printButton = document.getElementById("print-portfolio");

    if (!printButton) {
      console.warn("Tombol cetak portofolio tidak ditemukan.");

      return;
    }

    if (printButton.dataset.initialized === "true") {
      return;
    }

    printButton.dataset.initialized = "true";

    printButton.addEventListener("click", async function () {
      const galleryImages = Array.from(
        document.querySelectorAll("#galeri .gallery-image"),
      );

      galleryImages.forEach(function (image) {
        image.loading = "eager";

        const source = image.getAttribute("src");

        if (source) {
          image.src = source;
        }
      });

      await Promise.all(
        galleryImages.map(async function (image) {
          try {
            if (!image.complete) {
              await new Promise(function (resolve) {
                image.addEventListener("load", resolve, {
                  once: true,
                });

                image.addEventListener("error", resolve, {
                  once: true,
                });
              });
            }

            if (typeof image.decode === "function") {
              await image.decode();
            }
          } catch (error) {
            console.warn(
              "Gambar galeri gagal disiapkan untuk cetak:",
              image.src,
            );
          }
        }),
      );

      await new Promise(function (resolve) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(resolve);
        });
      });

      window.print();
    });
  }

  /* ========================================================
     LEWATI KE KONTEN UTAMA
  ======================================================== */

  function initializeSkipLink() {
    const skipLink = document.querySelector(".skip-link");

    const mainContent = document.getElementById("main-content");

    if (!skipLink || !mainContent) {
      return;
    }

    if (skipLink.dataset.initialized === "true") {
      return;
    }

    skipLink.dataset.initialized = "true";

    skipLink.addEventListener("click", function (event) {
      event.preventDefault();

      mainContent.scrollIntoView({
        behavior: "auto",
        block: "start",
      });

      mainContent.focus({
        preventScroll: true,
      });

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#main-content");
      }
    });
  }

  /* ========================================================
     INISIALISASI HALAMAN
  ======================================================== */

  async function initializePage() {
    const navbarLoaded = await loadComponent("navbar-container", "navbar.html");

    if (navbarLoaded) {
      const themeLoaded = await loadComponent(
        "theme-toggle-container",
        "theme-toggle.html",
      );

      if (themeLoaded) {
        initializeThemeToggle();
      }

      initializeNavbar();
    }

    const sidebarLoaded = await loadComponent(
      "sidebar-container",
      "sidebar.html",
    );

    if (navbarLoaded && sidebarLoaded) {
      initializeSidebarToggle();
    }

    const alertLoaded = await loadComponent("alert-container", "alert.html");

    if (alertLoaded) {
      initializeAlert();
    }

    const footerLoaded = await loadComponent("footer-container", "footer.html");

    if (footerLoaded) {
      initializeFooter();
      initializeBackToTop();
    }

    if (navbarLoaded) {
      initializeActiveNavigation();
    }

    initializeGallery();
    initializePrintPortfolio();
    initializeSkipLink();

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
