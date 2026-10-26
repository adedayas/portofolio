(function () {
  "use strict";

  /* ========================================================
     KONFIGURASI PLAYLIST
  ======================================================== */

  const PLAYLIST = [
    {
      title: "Ayo Senyum (Instrumental)",
      artist: "JKT48",
      file: "./assets/audio/lagu-1.mp3",
    },
    {
      title: "2565 (Off Vocal Ver.)",
      artist: "CGM48",
      file: "./assets/audio/lagu-2.mp3",
    },
    {
      title: "#KuSangatSuka (Instrumental)",
      artist: "JKT48",
      file: "./assets/audio/lagu-3.mp3",
    },
  ];

  const STORAGE_TRACK_KEY = "portfolio-music-track";

  /*
   * Rentang volume audio adalah 0 sampai 1.
   * Nilai 0.35 berarti 35%.
   */
  const DEFAULT_VOLUME = 0.35;

  /* ========================================================
     INISIALISASI
  ======================================================== */

  function initializeMusicPlayer() {
    const player = document.getElementById("music-player");

    const panel = document.getElementById("music-panel");

    const audio = document.getElementById("music-audio");

    const toggleButton = document.getElementById("music-toggle");

    const closeButton = document.getElementById("music-close");

    const playButton = document.getElementById("music-play");

    const previousButton = document.getElementById("music-previous");

    const nextButton = document.getElementById("music-next");

    const muteButton = document.getElementById("music-mute");

    const volumeInput = document.getElementById("music-volume");

    const progressInput = document.getElementById("music-progress");

    const titleElement = document.getElementById("music-title");

    const artistElement = document.getElementById("music-artist");

    const currentTimeElement = document.getElementById("music-current-time");

    const durationElement = document.getElementById("music-duration");

    const playlistElement = document.getElementById("music-playlist");

    /* ======================================================
       VALIDASI ELEMEN
    ====================================================== */

    const requiredElements = {
      player,
      panel,
      audio,
      toggleButton,
      playButton,
      previousButton,
      nextButton,
      muteButton,
      volumeInput,
      progressInput,
      titleElement,
      artistElement,
      currentTimeElement,
      durationElement,
      playlistElement,
    };

    const missingElements = Object.entries(requiredElements)
      .filter(function (entry) {
        return !entry[1];
      })
      .map(function (entry) {
        return entry[0];
      });

    if (missingElements.length > 0) {
      console.error(
        "Music Player gagal dijalankan. " + "Elemen berikut tidak ditemukan:",
        missingElements,
      );

      return;
    }

    if (player.dataset.initialized === "true") {
      return;
    }

    player.dataset.initialized = "true";

    if (PLAYLIST.length === 0) {
      titleElement.textContent = "Playlist kosong";

      artistElement.textContent = "Tambahkan lagu di music-player.js";

      playButton.disabled = true;
      previousButton.disabled = true;
      nextButton.disabled = true;
      progressInput.disabled = true;

      return;
    }

    let currentTrackIndex = 0;
    let previousVolume = DEFAULT_VOLUME;
    let autoplayAttempted = false;

    /* ======================================================
       PENGUMUMAN AKSESIBILITAS
    ====================================================== */

    function announceMusicStatus(message) {
      const statusElement = document.getElementById("portfolio-status");

      if (!statusElement) {
        return;
      }

      statusElement.textContent = "";

      window.setTimeout(function () {
        statusElement.textContent = message;
      }, 50);
    }

    /* ======================================================
       PANEL MUSIC PLAYER
    ====================================================== */

    function setPanelOpen(isOpen) {
      player.classList.toggle("is-open", isOpen);

      panel.classList.toggle("music-panel-open", isOpen);

      panel.setAttribute("aria-hidden", String(!isOpen));

      toggleButton.setAttribute("aria-expanded", String(isOpen));

      const label = isOpen ? "Tutup pemutar musik" : "Buka pemutar musik";

      toggleButton.setAttribute("aria-label", label);

      toggleButton.setAttribute("title", label);
    }

    toggleButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const shouldOpen = !player.classList.contains("is-open");

      setPanelOpen(shouldOpen);

      announceMusicStatus(
        shouldOpen ? "Pemutar musik dibuka." : "Pemutar musik ditutup.",
      );
    });

    if (closeButton) {
      closeButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        setPanelOpen(false);
        toggleButton.focus();

        announceMusicStatus("Pemutar musik ditutup.");
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && player.classList.contains("is-open")) {
        setPanelOpen(false);
        toggleButton.focus();

        announceMusicStatus("Pemutar musik ditutup.");
      }
    });

    document.addEventListener("click", function (event) {
      if (
        player.classList.contains("is-open") &&
        !player.contains(event.target)
      ) {
        setPanelOpen(false);
      }
    });

    /* ======================================================
       UTILITAS
    ====================================================== */

    function formatTime(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
      }

      const minutes = Math.floor(seconds / 60);

      const remainingSeconds = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

      return `${minutes}:${remainingSeconds}`;
    }

    function getAudioUrl(filePath) {
      return new URL(filePath, document.baseURI).href;
    }

    function clampVolume(value) {
      if (!Number.isFinite(value)) {
        return DEFAULT_VOLUME;
      }

      return Math.min(1, Math.max(0, value));
    }

    function getStoredTrackIndex() {
      const storedValue = localStorage.getItem(STORAGE_TRACK_KEY);

      if (storedValue === null) {
        return 0;
      }

      const storedIndex = Number(storedValue);

      if (
        Number.isInteger(storedIndex) &&
        storedIndex >= 0 &&
        storedIndex < PLAYLIST.length
      ) {
        return storedIndex;
      }

      return 0;
    }

    /* ======================================================
       AKSESIBILITAS INPUT
    ====================================================== */

    function updateVolumeAccessibility(volume) {
      const safeVolume = clampVolume(volume);

      const percentage = Math.round(safeVolume * 100);

      volumeInput.setAttribute("aria-valuenow", String(percentage));

      volumeInput.setAttribute("aria-valuetext", `${percentage} persen`);
    }

    function updateProgressAccessibility(progress) {
      const safeProgress = Number.isFinite(progress)
        ? Math.min(100, Math.max(0, progress))
        : 0;

      const percentage = Math.round(safeProgress);

      progressInput.setAttribute("aria-valuenow", String(percentage));

      progressInput.setAttribute("aria-valuetext", `${percentage} persen`);
    }

    /* ======================================================
       STATUS TOMBOL
    ====================================================== */

    function updatePlayButton() {
      const playIcon = playButton.querySelector(".ti");

      const isPlaying = !audio.paused && !audio.ended;

      player.classList.toggle("is-playing", isPlaying);

      const label = isPlaying ? "Jeda lagu" : "Putar lagu";

      playButton.setAttribute("aria-label", label);

      playButton.setAttribute("title", label);

      if (playIcon) {
        playIcon.className = isPlaying
          ? "ti ti-player-pause"
          : "ti ti-player-play";
      }
    }

    function updateMuteButton() {
      const volumeIcon = muteButton.querySelector(".ti");

      const isMuted = audio.muted || audio.volume === 0;

      const label = isMuted ? "Aktifkan suara" : "Matikan suara";

      muteButton.setAttribute("aria-label", label);

      muteButton.setAttribute("title", label);

      muteButton.setAttribute("aria-pressed", String(isMuted));

      if (!volumeIcon) {
        return;
      }

      if (isMuted) {
        volumeIcon.className = "ti ti-volume-off";
      } else if (audio.volume < 0.5) {
        volumeIcon.className = "ti ti-volume-2";
      } else {
        volumeIcon.className = "ti ti-volume";
      }
    }

    function updateActiveTrack() {
      const trackButtons = playlistElement.querySelectorAll(".music-track");

      trackButtons.forEach(function (button, index) {
        const isActive = index === currentTrackIndex;

        button.classList.toggle("is-active", isActive);

        if (isActive) {
          button.setAttribute("aria-current", "true");
        } else {
          button.removeAttribute("aria-current");
        }
      });
    }

    /* ======================================================
       PEMUTARAN AUDIO
    ====================================================== */

    function playAudio() {
      const playPromise = audio.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function (error) {
          console.warn("Audio belum dapat diputar:", error);

          artistElement.textContent = "Tekan Play untuk memulai";

          updatePlayButton();
        });
      }
    }

    function loadTrack(index, shouldPlay = false) {
      currentTrackIndex = (index + PLAYLIST.length) % PLAYLIST.length;

      const track = PLAYLIST[currentTrackIndex];

      audio.pause();

      audio.src = getAudioUrl(track.file);

      audio.load();

      titleElement.textContent = track.title;

      artistElement.textContent = track.artist;

      progressInput.value = "0";

      currentTimeElement.textContent = "0:00";

      durationElement.textContent = "0:00";

      updateProgressAccessibility(0);

      localStorage.setItem(STORAGE_TRACK_KEY, String(currentTrackIndex));

      updateActiveTrack();
      updatePlayButton();

      if (shouldPlay) {
        playAudio();

        announceMusicStatus(`Memutar ${track.title} oleh ${track.artist}.`);
      }
    }

    /* ======================================================
       AUTOPLAY
    ====================================================== */

    function tryAutoplay() {
      if (autoplayAttempted) {
        return;
      }

      autoplayAttempted = true;

      /*
       * Volume telah ditetapkan menjadi 35%
       * pada bagian inisialisasi.
       */
      audio.muted = false;

      const playPromise = audio.play();

      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(function () {
            const activeTrack = PLAYLIST[currentTrackIndex];

            artistElement.textContent = activeTrack.artist;

            updatePlayButton();

            console.log("Autoplay berhasil dijalankan.");
          })
          .catch(function (error) {
            /*
             * Browser dapat menolak autoplay
             * bersuara sebelum interaksi pengguna.
             */
            console.warn("Autoplay diblokir browser:", error);

            audio.pause();

            artistElement.textContent = "Tekan Play untuk memulai";

            updatePlayButton();
          });
      }
    }

    function removeFirstInteractionListeners() {
      document.removeEventListener("pointerdown", playAfterFirstInteraction);

      document.removeEventListener("keydown", playAfterFirstInteraction);

      document.removeEventListener("touchstart", playAfterFirstInteraction);
    }

    function playAfterFirstInteraction() {
      if (!audio.paused) {
        removeFirstInteractionListeners();
        return;
      }

      /*
       * Jangan mengubah volume di sini.
       * Volume tetap 35%.
       */
      audio.muted = false;

      audio
        .play()
        .then(function () {
          updatePlayButton();
          removeFirstInteractionListeners();
        })
        .catch(function (error) {
          console.warn("Audio belum dapat diputar:", error);
        });
    }

    /* ======================================================
       MEMBUAT PLAYLIST
    ====================================================== */

    function renderPlaylist() {
      playlistElement.innerHTML = "";

      PLAYLIST.forEach(function (track, index) {
        const trackButton = document.createElement("button");

        trackButton.type = "button";
        trackButton.className = "music-track";

        trackButton.setAttribute(
          "aria-label",
          `Putar ${track.title} oleh ${track.artist}`,
        );

        const numberElement = document.createElement("span");

        numberElement.className = "music-track-number";

        numberElement.textContent = String(index + 1);

        const contentElement = document.createElement("span");

        contentElement.className = "music-track-content";

        const titleItem = document.createElement("span");

        titleItem.className = "music-track-title";

        titleItem.textContent = track.title;

        const artistItem = document.createElement("small");

        artistItem.className = "music-track-artist";

        artistItem.textContent = track.artist;

        contentElement.append(titleItem, artistItem);

        trackButton.append(numberElement, contentElement);

        trackButton.addEventListener("click", function () {
          loadTrack(index, true);
        });

        playlistElement.appendChild(trackButton);
      });
    }

    /* ======================================================
       PLAY DAN PAUSE
    ====================================================== */

    playButton.addEventListener("click", function () {
      if (!audio.getAttribute("src")) {
        loadTrack(currentTrackIndex, false);
      }

      if (audio.paused) {
        playAudio();
      } else {
        audio.pause();

        announceMusicStatus("Musik dijeda.");
      }
    });

    /* ======================================================
       PREVIOUS DAN NEXT
    ====================================================== */

    previousButton.addEventListener("click", function () {
      if (audio.currentTime > 3) {
        audio.currentTime = 0;

        announceMusicStatus("Lagu diulang dari awal.");

        return;
      }

      loadTrack(currentTrackIndex - 1, true);
    });

    nextButton.addEventListener("click", function () {
      loadTrack(currentTrackIndex + 1, true);
    });

    /* ======================================================
       VOLUME DAN MUTE
    ====================================================== */

    muteButton.addEventListener("click", function () {
      if (audio.muted || audio.volume === 0) {
        audio.muted = false;

        if (audio.volume === 0) {
          audio.volume = previousVolume > 0 ? previousVolume : DEFAULT_VOLUME;

          volumeInput.value = String(audio.volume);
        }
      } else {
        previousVolume = audio.volume;

        audio.muted = true;
      }

      updateVolumeAccessibility(audio.volume);

      updateMuteButton();

      announceMusicStatus(
        audio.muted ? "Suara dimatikan." : "Suara diaktifkan.",
      );
    });

    volumeInput.addEventListener("input", function () {
      const requestedVolume = Number(volumeInput.value);

      const safeVolume = clampVolume(requestedVolume);

      audio.volume = safeVolume;

      if (safeVolume > 0) {
        audio.muted = false;
        previousVolume = safeVolume;
      } else {
        audio.muted = true;
      }

      updateVolumeAccessibility(safeVolume);

      updateMuteButton();
    });

    volumeInput.addEventListener("change", function () {
      const percentage = Math.round(audio.volume * 100);

      announceMusicStatus(`Volume ${percentage} persen.`);
    });

    /* ======================================================
       PROGRESS LAGU
    ====================================================== */

    progressInput.addEventListener("input", function () {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
      }

      const percentage = Number(progressInput.value);

      audio.currentTime = (percentage / 100) * audio.duration;

      updateProgressAccessibility(percentage);
    });

    /* ======================================================
       EVENT AUDIO
    ====================================================== */

    audio.addEventListener("loadedmetadata", function () {
      durationElement.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("durationchange", function () {
      durationElement.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", function () {
      currentTimeElement.textContent = formatTime(audio.currentTime);

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const progress = (audio.currentTime / audio.duration) * 100;

        progressInput.value = String(progress);

        updateProgressAccessibility(progress);
      } else {
        progressInput.value = "0";

        updateProgressAccessibility(0);
      }
    });

    audio.addEventListener("play", function () {
      updatePlayButton();

      const activeTrack = PLAYLIST[currentTrackIndex];

      artistElement.textContent = activeTrack.artist;
    });

    audio.addEventListener("pause", updatePlayButton);

    audio.addEventListener("ended", function () {
      loadTrack(currentTrackIndex + 1, true);
    });

    audio.addEventListener("volumechange", function () {
      volumeInput.value = String(audio.volume);

      updateVolumeAccessibility(audio.volume);

      updateMuteButton();
    });

    audio.addEventListener("waiting", function () {
      artistElement.textContent = "Memuat audio...";
    });

    audio.addEventListener("canplay", function () {
      const activeTrack = PLAYLIST[currentTrackIndex];

      artistElement.textContent = activeTrack.artist;
    });

    audio.addEventListener("error", function () {
      let errorMessage = "File audio tidak ditemukan";

      if (audio.error) {
        switch (audio.error.code) {
          case 1:
            errorMessage = "Pemutaran dibatalkan";
            break;

          case 2:
            errorMessage = "Gagal memuat file audio";
            break;

          case 3:
            errorMessage = "Audio tidak dapat diproses";
            break;

          case 4:
            errorMessage = "Path atau format audio tidak didukung";
            break;

          default:
            errorMessage = "Terjadi kesalahan audio";
        }
      }

      artistElement.textContent = errorMessage;

      updatePlayButton();

      console.error(
        "Music Player:",
        errorMessage,
        audio.currentSrc || audio.src,
      );
    });

    /* ======================================================
       MENJALANKAN PLAYER
    ====================================================== */

    /*
     * Selalu mengatur volume ke 35%
     * setiap halaman dibuka.
     */
    currentTrackIndex = getStoredTrackIndex();

    audio.volume = DEFAULT_VOLUME;

    audio.muted = false;

    previousVolume = DEFAULT_VOLUME;

    volumeInput.value = String(DEFAULT_VOLUME);

    updateVolumeAccessibility(DEFAULT_VOLUME);

    progressInput.value = "0";

    updateProgressAccessibility(0);

    renderPlaylist();

    loadTrack(currentTrackIndex, false);

    updateMuteButton();
    updatePlayButton();
    setPanelOpen(false);

    /*
     * Coba autoplay setelah audio siap.
     */
    audio.addEventListener("canplay", function autoplayOnce() {
      audio.removeEventListener("canplay", autoplayOnce);

      tryAutoplay();
    });

    /*
     * Fallback setelah interaksi pertama.
     */
    document.addEventListener("pointerdown", playAfterFirstInteraction, {
      once: true,
    });

    document.addEventListener("keydown", playAfterFirstInteraction, {
      once: true,
    });

    document.addEventListener("touchstart", playAfterFirstInteraction, {
      once: true,
      passive: true,
    });

    console.log("Music Player berhasil diinisialisasi.", {
      jumlahLagu: PLAYLIST.length,
      laguAktif: PLAYLIST[currentTrackIndex].title,
      volume: 35,
    });
  }

  /* ========================================================
     MENUNGGU DOM
  ======================================================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMusicPlayer, {
      once: true,
    });
  } else {
    initializeMusicPlayer();
  }
})();
