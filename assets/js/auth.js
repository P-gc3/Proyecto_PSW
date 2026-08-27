/* =========================================================
   MOSAIC — Sign in / Sign up
   -----------------------------------------------------------
   Auth pages don't render the shared header/footer shell (no
   nav while logged out) — nav.js is only included here for the
   showToast() helper.
   ========================================================= */

function wireSignInForm(){
  const form = document.getElementById("signInForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value;
    const errorEl = document.getElementById("signInError");

    try{
      await MosaicAPI.login({ email, password });
      window.location.href = "home.html";
    }catch(err){
      errorEl.textContent = "Enter both an email and a password to continue.";
      errorEl.classList.add("show");
    }
  });
}

function wireSignUpForm(){
  const form = document.getElementById("signUpForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const display_name = document.getElementById("signUpName").value.trim();
    const username = document.getElementById("signUpUsername").value.trim();
    const email = document.getElementById("signUpEmail").value.trim();
    const password = document.getElementById("signUpPassword").value;
    const errorEl = document.getElementById("signUpError");

    if (!display_name || !username || !email || password.length < 6){
      errorEl.textContent = "Fill in every field — passwords need at least 6 characters.";
      errorEl.classList.add("show");
      return;
    }
    errorEl.classList.remove("show");

    await MosaicAPI.signup({ display_name, username, email, password });
    window.location.href = "home.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireSignInForm();
  wireSignUpForm();
});
