/* Landing page scaffold script.
 *
 * Reads contact details from contact.config.js (window.SITE_CONTACT) rather
 * than hardcoding them here — see that file's header comment for why.
 */

// ===== CONTACT =====
function sendToWhatsApp(message) {
  const contact = window.SITE_CONTACT || {};
  if (!contact.whatsapp) {
    console.error("SITE_CONTACT.whatsapp is not set — check contact.config.js");
    return;
  }
  const url =
    "https://api.whatsapp.com/send?phone=" +
    contact.whatsapp +
    "&text=" +
    encodeURIComponent(message);
  window.open(url, "_blank", "noopener");
}

function openWhatsApp() {
  const contact = window.SITE_CONTACT || {};
  sendToWhatsApp(contact.whatsappMessage || "Hi! I'd like to know more.");
}

// ===== MOBILE NAV =====
function toggleNav() {
  const menu = document.getElementById("mobile-menu");
  if (menu) menu.classList.toggle("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (btn && menu) {
    btn.addEventListener("click", () => menu.classList.toggle("hidden"));
  }

  const year = document.getElementById("footer-year");
  if (year) year.textContent = new Date().getFullYear();
});
