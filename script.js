/* Grasshopper Solutions — shared site script.
 *
 * Note: the header and footer partials are injected asynchronously, so every
 * element lookup here must be null-guarded and anything touching the partials
 * has to run (or re-run) after they land. `initPartialDependentUI()` is called
 * by the partial loader on each page once injection finishes.
 */

// ===== CONTACT CHANNELS =====
const WHATSAPP_NUMBER = "33767834576";
const CONTACT_EMAIL = "general@grasshoppersolutions.online";

/**
 * Open WhatsApp with a prefilled message.
 * Shared by the homepage contact form and the project cost calculator so the
 * number and the URL shape live in exactly one place.
 */
function sendToWhatsApp(message) {
  const url =
    "https://api.whatsapp.com/send?phone=" +
    WHATSAPP_NUMBER +
    "&text=" +
    encodeURIComponent(message);
  window.open(url, "_blank", "noopener");
}

// ===== I18N =====
// Each generated page defines window.GH_I18N in its <head> (strings from
// i18n/<lang>/site-js.json). Falls back to the key so a missing string is
// visible rather than fatal.
function siteText(key) {
  const dict = window.GH_I18N || {};
  return dict[key] !== undefined ? dict[key] : key;
}

function selectedText(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return "";
  const option = select.options[select.selectedIndex];
  return option ? option.text.trim() : select.value;
}

// ===== LANGUAGE SWITCHER (EN | ES) =====
// The links work without JS; this only remembers the choice (it then beats
// the first-visit browser-language detection in each English page's <head>)
// and carries the query string and hash across, so a shared calculator link
// (?state=...) opens with the same configuration in the other language.
document.addEventListener("click", (event) => {
  const link = event.target.closest && event.target.closest("[data-lang-switch]");
  if (!link) return;
  event.preventDefault();
  try {
    localStorage.setItem("gh_lang", link.dataset.langSwitch);
  } catch (err) {
    /* storage blocked - the switch still works for this navigation */
  }
  window.location.href = link.getAttribute("href") + window.location.search + window.location.hash;
});

// ===== UI HELPERS =====
function notify() {
  const toast = document.getElementById("notification-toast");
  if (!toast) return;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function toggleAIBubble() {
  const bubble = document.getElementById("ai-bubble");
  if (bubble) bubble.classList.toggle("hidden");
}

function toggleNav() {
  const menu = document.getElementById("mobile-menu");
  if (menu) menu.classList.toggle("hidden");
}

// ===== CLOCK + FOOTER YEAR =====
setInterval(() => {
  const el = document.getElementById("time");
  if (el) el.textContent = new Date().toTimeString().split(" ")[0];
}, 1000);

/**
 * Wire up anything that lives inside the injected header/footer.
 * Safe to call more than once.
 */
function initPartialDependentUI() {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (btn && menu && !btn.dataset.bound) {
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => menu.classList.toggle("hidden"));
  }

  const year = document.getElementById("footer-year");
  if (year) year.textContent = new Date().getFullYear();

  if (typeof lucide !== "undefined") lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", initPartialDependentUI);

// ===== HOMEPAGE CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Honeypot: real users never see this field, bots fill everything.
    const trap = document.getElementById("contact-company");
    if (trap && trap.value.trim() !== "") return;

    if (!form.reportValidity()) return;

    const name = document.getElementById("contact-name").value.trim();
    // The visible (translated) option text, so the message reads in the
    // page's language; the option values stay English.
    const type = selectedText("contact-type");
    const budget = selectedText("contact-budget");
    const details = document.getElementById("contact-message").value.trim();

    const message =
      siteText("contact_greeting") +
      "\n\n" +
      siteText("contact_name") +
      ": " +
      name +
      "\n" +
      siteText("contact_type") +
      ": " +
      type +
      "\n" +
      siteText("contact_budget") +
      ": " +
      budget +
      "\n\n" +
      details +
      "\n\n" +
      siteText("contact_sent_from");

    sendToWhatsApp(message);

    const sent = document.getElementById("contact-sent");
    if (sent) sent.classList.remove("hidden");
  });
}

document.addEventListener("DOMContentLoaded", initContactForm);

// ===== CAROUSELS =====
function initCarousel(containerId, prevId, nextId) {
  const container = document.getElementById(containerId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  if (!container || !prevBtn || !nextBtn) return;

  // Scroll by roughly one card's width (+ gap) rather than a fixed guess, so
  // the arrows always reveal exactly the next card regardless of viewport.
  const stepFor = () => {
    const card = container.querySelector(":scope > *");
    const gap = parseFloat(getComputedStyle(container).columnGap || "16") || 16;
    return card ? card.getBoundingClientRect().width + gap : 340;
  };

  nextBtn.addEventListener("click", () =>
    container.scrollBy({ left: stepFor(), behavior: "smooth" })
  );
  prevBtn.addEventListener("click", () =>
    container.scrollBy({ left: -stepFor(), behavior: "smooth" })
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initCarousel("carousel-container", "slide-prev", "slide-next");
  initCarousel("app-carousel-container", "app-slide-prev", "app-slide-next");
  initCarousel("ext-carousel-container", "ext-slide-prev", "ext-slide-next");
});

// ===== PROJECT CARD DESCRIPTION TOGGLE =====
// Desktop reveals the description on hover (group-hover:block in markup);
// this handles the tap-to-expand path for touch devices, where hover isn't
// a thing. Collapsed by default either way.
function toggleCardDesc(btn) {
  const card = btn.closest(".project-card");
  const panel = card ? card.querySelector(".desc-panel") : null;
  if (!panel) return;

  const nowHidden = panel.classList.toggle("hidden");
  btn.setAttribute("aria-expanded", String(!nowHidden));
  const icon = btn.querySelector(".desc-toggle-icon");
  if (icon) icon.classList.toggle("rotate-180", !nowHidden);
}
