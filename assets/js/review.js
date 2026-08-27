/* =========================================================
   MOSAIC — Make a review
   ========================================================= */

let selectedRating = 0;

function renderStarInput(){
  const wrap = document.getElementById("starInput");
  wrap.innerHTML = [1,2,3,4,5].map(n =>
    `<button type="button" data-star="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`
  ).join("");

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-star]");
    if (!btn) return;
    selectedRating = Number(btn.dataset.star);
    paintStars();
  });
}

function paintStars(){
  document.querySelectorAll("#starInput button").forEach(btn => {
    btn.classList.toggle("filled", Number(btn.dataset.star) <= selectedRating);
  });
}

async function populateCategorySelect(){
  const select = document.getElementById("reviewCategory");
  const categories = await MosaicAPI.getCategories();
  // data-icon carries the icon key through — <option> can't render an <svg>,
  // so the preview box next to the select shows it instead (see updateSelectIcon).
  select.innerHTML = categories.map(c =>
    `<option value="${c.id}" data-icon="${c.icon}">${c.name}</option>`
  ).join("");
  updateSelectIcon();
  select.addEventListener("change", updateSelectIcon);
}

function updateSelectIcon(){
  const select = document.getElementById("reviewCategory");
  const preview = document.getElementById("reviewCategoryIcon");
  const iconKey = select.selectedOptions[0]?.dataset.icon;
  preview.innerHTML = categoryIconMarkup(iconKey, "icon-lg");
}

function wireReviewForm(){
  const form = document.getElementById("reviewForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("reviewTitle").value.trim();
    const body = document.getElementById("reviewBody").value.trim();
    const category_id = document.getElementById("reviewCategory").value;
    const errorEl = document.getElementById("reviewError");

    if (!title || !body || selectedRating === 0){
      errorEl.textContent = "Please add a title, a rating, and a few words before publishing.";
      errorEl.classList.add("show");
      return;
    }
    errorEl.classList.remove("show");

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Publishing…";

    try{
      await MosaicAPI.createReview({ title, body, rating: selectedRating, category_id });
      showToast("Review published.");
      form.reset();
      selectedRating = 0;
      paintStars();
      window.location.href = "profile.html";
    }catch(err){
      errorEl.textContent = "Something went wrong publishing your review. Please try again.";
      errorEl.classList.add("show");
    }finally{
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish review";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderStarInput();
  populateCategorySelect();
  wireReviewForm();
});
