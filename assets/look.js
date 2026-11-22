/* The site's look picker, like the app's Settings → Themes: Dispatch, Grove or Grove classic, and System, Light or
   Dark. Loaded in <head> without defer so the saved look applies before the page is drawn. Without this file the
   site shows the Dispatch look and follows the system's light or dark. The pick stays in this browser only. */
(() => {
  const KEY = "dispatch-site-look";
  const LOOKS = ["dispatch", "grove", "grove-classic"], THEMES = ["system", "light", "dark"];
  const root = document.documentElement;
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); return { look: LOOKS.includes(v.look) ? v.look : "dispatch", theme: THEMES.includes(v.theme) ? v.theme : "system" }; } catch { return { look: "dispatch", theme: "system" }; } };
  const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* private mode: this page only */ } };
  const apply = (v) => {
    if (v.look === "dispatch") root.removeAttribute("data-look"); else root.setAttribute("data-look", v.look);
    if (v.theme === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", v.theme);
  };
  let cur = read();
  apply(cur);

  // Screenshots: <img data-shot="request"> inside <picture> with a dark <source>. File names: request.png (Dispatch,
  // light), request-dark.png, request-grove.png, request-grove-dark.png, request-grove-classic(-dark).png.
  // A figure with data-look shows that look whatever is picked (the Themes section always shows Grove).
  const file = (shot, look, dark) => `/assets/shots/${shot}${look === "dispatch" ? "" : "-" + look}${dark ? "-dark" : ""}.png`;
  const shots = () => {
    for (const img of document.querySelectorAll("img[data-shot]")) {
      const shot = img.dataset.shot, look = img.closest("[data-look]")?.dataset.look || cur.look;
      const src = img.parentElement.tagName === "PICTURE" ? img.parentElement.querySelector("source") : null;
      const light = file(shot, look, cur.theme === "dark"), dark = file(shot, look, cur.theme !== "light");
      if (img.getAttribute("src") !== light) img.setAttribute("src", light);
      if (src && src.getAttribute("srcset") !== dark) src.setAttribute("srcset", dark);
      const a = img.closest("a.full");
      if (a) a.setAttribute("href", matchMedia("(prefers-color-scheme: dark)").matches && cur.theme !== "light" ? dark : light);
    }
  };

  const sync = () => { for (const i of document.querySelectorAll(".lookPicker input")) i.checked = cur[i.name] === i.value; };
  const ready = () => {
    const picker = document.querySelector(".lookPicker");
    if (picker) {
      picker.hidden = false;
      sync();
      picker.addEventListener("change", (e) => {
        const i = e.target; if (!(i instanceof HTMLInputElement)) return;
        cur = { ...cur, [i.name]: i.value }; save(cur); apply(cur); shots();
      });
      // Close on a click elsewhere or Escape, like the app's menus.
      document.addEventListener("pointerdown", (e) => { if (picker.open && !picker.contains(e.target)) picker.open = false; });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && picker.open) { picker.open = false; picker.querySelector("summary").focus(); } });
    }
    shots();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
  addEventListener("storage", (e) => { if (e.key === KEY) { cur = read(); apply(cur); sync(); shots(); } });
})();
