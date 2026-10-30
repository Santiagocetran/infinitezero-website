import "./network";
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const statement = document.querySelector(".statement");
if (statement && "IntersectionObserver" in window) {
  const words = [...statement.querySelectorAll<HTMLElement>("span")];
  statement.classList.add("reveal-ready");
  const reveal = (visible: boolean) =>
    words.forEach((word, i) => {
      word.style.transitionDelay =
        visible && !reduce.matches ? `${i * 90}ms` : "0ms";
      word.classList.toggle("lit", visible || reduce.matches);
    });
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= 0.4) reveal(true);
        // Reset only once fully offscreen, avoiding flicker near the threshold.
        else if (!entry.isIntersecting) reveal(false);
      }
    },
    { threshold: [0, 0.4] },
  );
  observer.observe(statement);
  reduce.addEventListener("change", () => {
    const bounds = statement.getBoundingClientRect();
    reveal(reduce.matches || (bounds.bottom > 0 && bounds.top < innerHeight));
  });
  if (reduce.matches) reveal(true);
}
const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
const menu = document.querySelector<HTMLDialogElement>("#mobile-menu");
if (toggle && menu && typeof menu.showModal === "function") {
  document.documentElement.classList.add("js");
  toggle.hidden = false;
  const close = () => menu.close();
  toggle.addEventListener("click", () => {
    menu.showModal();
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  });
  menu.querySelector(".menu-close")?.addEventListener("click", close);
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      close();
      const href = a.getAttribute("href");
      if (href?.startsWith("#")) {
        const target = document.querySelector<HTMLElement>(href);
        if (target) {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      }
    }),
  );
  menu.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
  window
    .matchMedia("(min-width: 521px)")
    .addEventListener("change", (event) => {
      if (event.matches && menu.open) close();
    });
}
