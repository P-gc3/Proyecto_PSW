/* =========================================================
   MOSAIC — Global configuration
   -----------------------------------------------------------
   When the PHP + MySQL backend is ready:
     1. Set USE_MOCK to false.
     2. Point API_BASE_URL at your PHP endpoints, e.g. "/api"
        (see api.js for the exact endpoint paths expected).
   Nothing else in the front end needs to change — every data
   call in the app goes through api.js.
   ========================================================= */

window.MOSAIC_CONFIG = {
  USE_MOCK: true,
  API_BASE_URL: "/api",     // future PHP endpoints, e.g. /api/posts.php
  SESSION_KEY: "mosaic_session", // localStorage key for the logged-in user (demo only)
  PAGE_SIZE: 8               // default page size for feeds — mirrors LIMIT/OFFSET paging in SQL
};
