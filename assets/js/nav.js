/* =========================================================
   MOSAIC — Shared shell (runs on every page)
   -----------------------------------------------------------
   Loads header.html / footer.html partials into every page.
   This mirrors the <?php include 'header.php'; ?> pattern the
   PHP backend will use later, so the swap is a straight file
   copy instead of a redesign.

   NOTE: fetching local partials with fetch() requires the site
   to be served over http (e.g. `php -S localhost:8000` or any
   static server / Live Server), not opened directly as a
   file:// URL, because browsers block fetch() on file://.
   ========================================================= */

async function includePartial(selector, url){
  const el = document.querySelector(selector);
  if (!el) return;
  try{
    const res = await fetch(url);
    el.innerHTML = await res.text();
  }catch(err){
    console.error(`Could not load partial ${url}. Serve this project over a local server (not file://).`, err);
  }
}

function setActiveNavLink(){
  const page = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach(link => {
    link.classList.toggle("active", link.dataset.nav === page);
  });
}

function wireMobileNav(){
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));
}

/** Renders an <svg><use> referencing assets/icons/icons.svg#icon-<key>.
 *  This is the one place that turns a stored icon key into markup —
 *  every page calls this instead of printing an emoji or <img> tag. */
function categoryIconMarkup(iconKey, extraClass = ""){
  if (!iconKey) return "";
    return `<svg class="icon ${extraClass}" aria-hidden="true"><use href="assets/icons/icons.svg#icon-${iconKey}"></use></svg>`;
}

function placeholderAvatarUrl(seed){
  // Simple inline SVG placeholder avatar (no external image dependency).
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' fill='#CDEBD9'/>
    <circle cx='50' cy='38' r='18' fill='#59A97C'/>
    <rect x='18' y='62' width='64' height='34' rx='17' fill='#59A97C'/>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

async function setHeaderAvatar(){
  const img = document.getElementById("headerAvatar");
  if (!img) return;
  const user = await MosaicAPI.getCurrentUser();
  img.src = placeholderAvatarUrl(user?.id);
  img.alt = user ? `${user.display_name}'s profile` : "Your profile";
}

/* ---- Toast ---- */
function showToast(message, duration = 2200){
  let toast = document.querySelector(".toast");
  if (!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

/* ---- Modal ---- */
function openModal(id){ document.getElementById(id)?.classList.add("open"); }
function closeModal(id){ document.getElementById(id)?.classList.remove("open"); }
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) e.target.classList.remove("open");
  if (e.target.matches("[data-close-modal]")) e.target.closest(".modal-overlay")?.classList.remove("open");
});

/* ---- Boot ---- */
document.addEventListener("DOMContentLoaded", async () => {
  await includePartial("#site-header", "partials/header.html");
  await includePartial("#site-footer", "partials/footer.html");
  setActiveNavLink();
  wireMobileNav();
  setHeaderAvatar();

  const searchInput = document.getElementById("siteSearch");
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && searchInput.value.trim()){
      // Placeholder wiring — future: GET /api/search.php?q=
      showToast(`Searching for "${searchInput.value.trim()}"…`);
    }
  });
});
