const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#primary-nav");
const yearEl = document.querySelector("#year");

function setNavOpen(isOpen) {
  if (!navToggle || !nav) return;
  navToggle.setAttribute("aria-expanded", String(isOpen));
  nav.dataset.open = String(isOpen);
}

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (navToggle && nav) {
  setNavOpen(false);

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setNavOpen(!isOpen);
  });

  nav.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLAnchorElement)) return;
    setNavOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setNavOpen(false);
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (nav.contains(target) || navToggle.contains(target)) return;
    setNavOpen(false);
  });
}

