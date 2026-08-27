/* =========================================================
   MOSAIC — Feed (reusable template for every category)
   -----------------------------------------------------------
   feed.html has no category baked into its markup — the
   category comes from the URL, e.g. feed.html?cat=Villagers.
   That's what lets one file serve every category feed.
   ========================================================= */

function getCategoryFromUrl(){
  const params = new URLSearchParams(window.location.search);
  return params.get("cat") || "Islands";
}

function timeAgo(iso){
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function postCard(post){
  const author = post.author || {};
  const cat = categoryMap[post.category_id];
  return `
    <article class="card post-card" data-post-id="${post.id}">
      <div class="post-header">
        <img class="avatar" src="${placeholderAvatarUrl(author.id)}" alt="${author.display_name || 'User'}">
        <div class="who">
          <strong>${author.display_name || "Unknown user"}</strong>
          <span>@${author.username || "unknown"} · ${timeAgo(post.created_at)}</span>
        </div>
        <span class="post-category-tag">${categoryIconMarkup(cat?.icon, "icon-sm")} ${cat?.name || post.category_id}</span>
      </div>
      <div class="post-media">
        <span class="text-faint">Image / video placeholder</span>
      </div>
      <div class="post-body">
        <p>${post.caption}</p>
      </div>
      <div class="post-actions">
        <button type="button" data-action="like" aria-label="Like post">❤ <span>${post.likes}</span></button>
        <button type="button" data-action="comment" aria-label="Comment on post">💬 <span>${post.comments}</span></button>
        <button type="button" data-action="share" aria-label="Share post">↗ Share</button>
      </div>
    </article>`;
}

let currentPage = 1;
let currentCategory = "Islands";
let categoryMap = {}; // id -> category, filled by loadCategoryMeta, read by postCard

async function loadCategoryMeta(){
  const categories = await MosaicAPI.getCategories();
  categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const cat = categoryMap[currentCategory] || categories[0];

  document.getElementById("feedTitle").innerHTML = `${categoryIconMarkup(cat.icon)} ${cat.name} feed`;
  document.title = `${cat.name} feed · Mosaic`;

  const bar = document.getElementById("feedCategoryBar");
  bar.innerHTML = categories.map(c => `
    <a class="category-pill ${c.id === currentCategory ? "active" : ""}" href="feed.html?cat=${c.id}">
      ${categoryIconMarkup(c.icon)} ${c.name}
    </a>`).join("");
}

async function loadPosts({ append = false } = {}){
  const list = document.getElementById("feedList");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (!append){
    list.innerHTML = `<div class="skeleton" style="height:220px; margin-bottom:16px;"></div>`.repeat(2);
  }

  const posts = await MosaicAPI.getPosts({ category: currentCategory, page: currentPage });

  if (!append) list.innerHTML = "";

  if (posts.length === 0 && currentPage === 1){
    list.innerHTML = `
      <div class="state-block">
        <h3>No posts here yet</h3>
        <p>Be the first to share something in this category.</p>
        <a class="btn btn-primary" href="post-new.html">Share a post</a>
      </div>`;
    loadMoreBtn.classList.add("hidden");
    return;
  }

  list.insertAdjacentHTML("beforeend", posts.map(postCard).join(""));
  loadMoreBtn.classList.toggle("hidden", posts.length < window.MOSAIC_CONFIG.PAGE_SIZE);
}

function wireFeedInteractions(){
  document.getElementById("feedList").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "like"){
      btn.classList.toggle("liked");
      const span = btn.querySelector("span");
      span.textContent = Number(span.textContent) + (btn.classList.contains("liked") ? 1 : -1);
    } else {
      showToast("This will be wired up once the backend is connected.");
    }
  });

  document.getElementById("loadMoreBtn")?.addEventListener("click", () => {
    currentPage += 1;
    loadPosts({ append: true });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  currentCategory = getCategoryFromUrl();
  await loadCategoryMeta();
  await loadPosts();
  wireFeedInteractions();
});
