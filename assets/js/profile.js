/* =========================================================
   MOSAIC — Profile page
   ========================================================= */

function wireTabs(){
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

async function renderProfileHeader(){
  const user = await MosaicAPI.getCurrentUser();
  document.getElementById("profileAvatar").src = placeholderAvatarUrl(user.id);
  document.getElementById("profileName").textContent = user.display_name;
  document.getElementById("profileUsername").textContent = `@${user.username}`;
  document.getElementById("profileBio").textContent = user.bio;
  document.getElementById("statFollowers").textContent = user.followers;
  document.getElementById("statFollowing").textContent = user.following;
}

async function renderProfilePosts(){
  const user = await MosaicAPI.getCurrentUser();
  const categories = await MosaicAPI.getCategories();
  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const allPosts = await MosaicAPI.getPosts({ category: null, page: 1, limit: 50 });
  const mine = allPosts.filter(p => p.user_id === user.id);
  const el = document.getElementById("profilePosts");

  if (!mine.length){
    el.innerHTML = `<div class="state-block"><h3>No posts yet</h3><p>Anything you share will show up here.</p></div>`;
    return;
  }
  el.innerHTML = mine.map(p => {
    const cat = categoryMap[p.category_id];
    return `
    <article class="card post-card">
      <div class="post-header">
        <span class="post-category-tag">${categoryIconMarkup(cat?.icon, "icon-sm")} ${cat?.name || p.category_id}</span>
        <div class="who"><span>${new Date(p.created_at).toLocaleDateString()}</span></div>
      </div>
      <div class="post-media"><span class="text-faint">Image / video placeholder</span></div>
      <div class="post-body"><p>${p.caption}</p></div>
    </article>`;
  }).join("");
}

async function renderProfileReviews(){
  const user = await MosaicAPI.getCurrentUser();
  const categories = await MosaicAPI.getCategories();
  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const allReviews = await MosaicAPI.getReviews({ category: null });
  const mine = allReviews.filter(r => r.user_id === user.id);
  const el = document.getElementById("profileReviews");

  if (!mine.length){
    el.innerHTML = `<div class="state-block"><h3>No reviews yet</h3><p>Reviews you write will show up here.</p></div>`;
    return;
  }
  el.innerHTML = mine.map(r => {
    const cat = categoryMap[r.category_id];
    return `
    <article class="card card-pad review-card" style="margin-bottom:16px;">
      <div class="flex-between">
        <h3 style="margin:0;">${r.title}</h3>
        <span class="post-category-tag">${categoryIconMarkup(cat?.icon, "icon-sm")} ${cat?.name || r.category_id}</span>
      </div>
      <div class="star-rating">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p>${r.body}</p>
    </article>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  wireTabs();
  await renderProfileHeader();
  await renderProfilePosts();
  await renderProfileReviews();
});
