/* =========================================================
   MOSAIC — Home page
   ========================================================= */

function collageTilePlaceholder(index){
  const hues = ["#CDEBD9","#DCF0F7","#B7E4C7","#9FD3E8","#E7F2ED"];
  return hues[index % hues.length];
}

function renderCollage(count = 14){
  const grid = document.getElementById("collageGrid");
  if (!grid) return;
  const spanClasses = ["span-2","span-1","span-1","tall","span-1","span-2","span-1"];
  let html = "";
  for (let i = 0; i < count; i++){
    const spanClass = spanClasses[i % spanClasses.length];
    html += `
      <div class="collage-tile ${spanClass}" style="background:${collageTilePlaceholder(i)}">
        <span class="tile-label">Placeholder ${i + 1}</span>
      </div>`;
  }
  grid.innerHTML = html;
}

function videoCard(video){
  return `
    <article class="rail-item" data-video-id="${video.id}" tabindex="0" role="button" aria-label="Play ${video.title}">
      <div class="video-placeholder">
        <div class="play-icon"></div>
        <span class="duration-tag">${video.duration}</span>
      </div>
      <h4>${video.title}</h4>
      <p class="text-faint">Placeholder video · not yet uploaded</p>
    </article>`;
}

async function renderCategoryRails(){
  const wrap = document.getElementById("categoryRails");
  if (!wrap) return;
  wrap.innerHTML = `<div class="skeleton" style="height:180px;"></div>`;

  const categories = await MosaicAPI.getCategories();
  const sections = await Promise.all(categories.map(async cat => {
    const videos = await MosaicAPI.getVideos({ category: cat.id });
    if (!videos.length) return "";
    return `
      <section class="category-rail" aria-labelledby="rail-${cat.id}">
        <div class="section-title">
          <h2 id="rail-${cat.id}">${categoryIconMarkup(cat.icon)} ${cat.name}</h2>
          <a class="see-all" href="feed.html?cat=${cat.id}">See all →</a>
        </div>
        <div class="rail">${videos.map(videoCard).join("")}</div>
      </section>`;
  }));

  wrap.innerHTML = sections.join("");
}

async function renderCategoryBar(){
  const bar = document.getElementById("homeCategoryBar");
  if (!bar) return;
  const categories = await MosaicAPI.getCategories();
  bar.innerHTML = categories.map(cat =>
    `<a class="category-pill" href="feed.html?cat=${cat.id}">${categoryIconMarkup(cat.icon)} ${cat.name}</a>`
  ).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderCollage();
  renderCategoryBar();
  renderCategoryRails();
});
