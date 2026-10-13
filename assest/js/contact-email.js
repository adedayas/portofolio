(function () {
  "use strict";

  const DESTINATION_EMAIL = "adedayas12@gmail.com";

  function initializeContactEmail() {
    const form = document.getElementById("contact-form");

    const sendButton = document.getElementById("contact-send");

    const nameInput = document.getElementById("contact-name");

    const emailInput = document.getElementById("contact-email");

    const messageInput = document.getElementById("contact-message");

    /*
     * Pemeriksaan elemen.
     */
    if (!form || !sendButton || !nameInput || !emailInput || !messageInput) {
      console.error("Form kontak tidak lengkap.", {
        form: Boolean(form),
        sendButton: Boolean(sendButton),
        nameInput: Boolean(nameInput),
        emailInput: Boolean(emailInput),
        messageInput: Boolean(messageInput),
      });

      return;
    }

    /*
     * Mencegah inisialisasi ganda.
     */
    if (sendButton.dataset.initialized === "true") {
      return;
    }

    sendButton.dataset.initialized = "true";

    function openGmailCompose() {
      /*
       * Validasi HTML bawaan browser.
       */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const senderName = nameInput.value.trim();

      const senderEmail = emailInput.value.trim();

      const senderMessage = messageInput.value.trim();

      if (!senderName || !senderEmail || !senderMessage) {
        alert("Silakan lengkapi nama, email, dan pesan.");

        return;
      }

      const subject = `Pesan Portofolio dari ${senderName}`;

      const emailBody = [
        "Halo Ade Dayas Eka Prasetyo,",
        "",
        senderMessage,
        "",
        "Informasi pengirim:",
        `Nama: ${senderName}`,
        `Email: ${senderEmail}`,
      ].join("\r\n");

      /*
       * Nilai pengguna dikodekan agar karakter khusus
       * tidak merusak URL.
       */
      const gmailUrl =
        "https://mail.google.com/mail/?" +
        "view=cm" +
        "&fs=1" +
        `&to=${encodeURIComponent(DESTINATION_EMAIL)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(emailBody)}`;

      /*
       * Membuka Gmail pada tab baru.
       */
      const emailWindow = window.open(
        gmailUrl,
        "_blank",
        "noopener,noreferrer",
      );

      /*
       * Jika popup diblokir, buka Gmail pada tab yang sama.
       */
      if (emailWindow) {
        emailWindow.opener = null;
      } else {
        alert(
          "Tab email diblokir oleh browser. " +
            "Izinkan pop-up untuk membuka Gmail.",
        );
      }
    }

    /*
     * Tombol tidak menjalankan submit bawaan.
     */
    sendButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      openGmailCompose();
    });

    /*
     * Mencegah refresh apabila Enter ditekan.
     */
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopPropagation();

      openGmailCompose();
    });

    console.log("Fitur kontak email berhasil diinisialisasi.");
  }

  /*
   * Aman untuk script di awal maupun akhir halaman.
   */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeContactEmail, {
      once: true,
    });
  } else {
    initializeContactEmail();
  }
})();
