/* =========================================================
   MOSAIC — Share a post
   ========================================================= */

async function populateCategorySelect(){
  const select = document.getElementById("postCategory");
  const categories = await MosaicAPI.getCategories();
  select.innerHTML = categories.map(c =>
    `<option value="${c.id}" data-icon="${c.icon}">${c.name}</option>`
  ).join("");
  updateSelectIcon();
  select.addEventListener("change", updateSelectIcon);
}

function updateSelectIcon(){
  const select = document.getElementById("postCategory");
  const preview = document.getElementById("postCategoryIcon");
  const iconKey = select.selectedOptions[0]?.dataset.icon;
  preview.innerHTML = categoryIconMarkup(iconKey, "icon-lg");
}

function wireMediaPicker(){
  const picker = document.getElementById("mediaPicker");
  const input = document.getElementById("mediaInput");
  const label = document.getElementById("mediaPickerLabel");

  picker.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    if (input.files.length){
      label.textContent = `${input.files.length} file(s) selected — ${input.files[0].name}${input.files.length > 1 ? " …" : ""}`;
    } else {
      label.textContent = "Click to choose a photo or video";
    }
  });
}

function wirePostForm(){
  const form = document.getElementById("postForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const caption = document.getElementById("postCaption").value.trim();
    const category_id = document.getElementById("postCategory").value;
    const errorEl = document.getElementById("postError");

    if (!caption){
      errorEl.textContent = "Add a caption before sharing.";
      errorEl.classList.add("show");
      return;
    }
    errorEl.classList.remove("show");

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sharing…";

    try{
      // NOTE: file upload itself (input#mediaInput) will be sent as
      // multipart/form-data to a future /api/upload.php endpoint;
      // here we only persist the text fields against the mock API.
      await MosaicAPI.createPost({ caption, category_id });
      showToast("Post shared.");
      form.reset();
      document.getElementById("mediaPickerLabel").textContent = "Click to choose a photo or video";
      window.location.href = `feed.html?cat=${category_id}`;
    }catch(err){
      errorEl.textContent = "Something went wrong sharing your post. Please try again.";
      errorEl.classList.add("show");
    }finally{
      submitBtn.disabled = false;
      submitBtn.textContent = "Share post";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateCategorySelect();
  wireMediaPicker();
  wirePostForm();
});
