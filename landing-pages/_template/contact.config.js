// STOP: is this THIS client's number, not Grasshopper's own (33767834576)?
//
// This is the ONE place phone, WhatsApp, email, and social links live for
// this site. No other file should contain a raw phone number or a
// wa.me / api.whatsapp.com URL — see ../CLAUDE.md's "Contact-info
// centralization" section for why that rule exists (a real client site
// shipped with Grasshopper's own number hardcoded three levels deep,
// because there was no single place to check before deploying).

window.SITE_CONTACT = {
  businessName: "",

  // Digits only, country code, no "+", no spaces — e.g. "15551234567".
  whatsapp: "",

  // What visitors see printed on the page, formatted however reads best
  // for this client's locale — e.g. "+1 (555) 123-4567".
  phone: "",

  // Prefilled into the WhatsApp deep link. Kept here (not inline in
  // main.js) so it's easy to find and reword without touching code.
  whatsappMessage: "Hi! I'd like to know more.",

  email: "",

  socials: {
    instagram: "",
    facebook: "",
  },
};
