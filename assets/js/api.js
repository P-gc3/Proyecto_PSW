/* =========================================================
   MOSAIC — API layer
   -----------------------------------------------------------
   Every page script calls functions from this file instead of
   touching fetch() or the mock data directly. That keeps a
   single seam between the front end and the backend.

   HOW TO CONNECT THE REAL PHP + MYSQL BACKEND
   -----------------------------------------------------------
   1. Set MOSAIC_CONFIG.USE_MOCK = false in config.js.
   2. Implement the PHP endpoints below (suggested paths — feel
      free to adapt to your router). Each should return JSON
      shaped like the matching mock array in mock-data.js:

        GET  /api/categories.php
        GET  /api/posts.php?category=Islands&page=1&limit=8
        POST /api/posts.php                (create post)
        GET  /api/reviews.php?category=Islands
        POST /api/reviews.php              (create review)
        GET  /api/videos.php?category=Islands
        GET  /api/users.php?id=4
        POST /api/auth/login.php
        POST /api/auth/signup.php
        POST /api/auth/logout.php

   3. Nothing in home.js / feed.js / profile.js / review.js /
      post.js needs to change — they only call MosaicAPI.*.
   ========================================================= */

const MosaicAPI = (() => {

  const { USE_MOCK, API_BASE_URL, PAGE_SIZE } = window.MOSAIC_CONFIG;
  const MOCK = window.MOSAIC_MOCK;

  /** Small helper so every mock call still feels async, like a real fetch. */
  function mockResolve(value, delay = 220){
    return new Promise(resolve => setTimeout(() => resolve(structuredClone(value)), delay));
  }

  async function realFetch(path, options = {}){
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...options
    });
    if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
    return res.json();
  }

  return {

    /* ---------- categories ---------- */
    getCategories(){
      if (USE_MOCK) return mockResolve(MOCK.categories);
      return realFetch("/categories.php");
    },

    /* ---------- posts (feed) ---------- */
    getPosts({ category = null, page = 1, limit = PAGE_SIZE } = {}){
      if (USE_MOCK){
        let rows = MOCK.posts.filter(p => !category || p.category_id === category);
        rows = rows.map(p => ({ ...p, author: MOCK.users.find(u => u.id === p.user_id) }));
        const start = (page - 1) * limit;
        return mockResolve(rows.slice(start, start + limit));
      }
      const qs = new URLSearchParams({ page, limit, ...(category ? { category } : {}) });
      return realFetch(`/posts.php?${qs}`);
    },

    createPost(payload){
      if (USE_MOCK){
        const newPost = {
          id: Date.now(),
          user_id: MOCK.currentUserId,
          category_id: payload.category_id,
          caption: payload.caption,
          created_at: new Date().toISOString(),
          likes: 0,
          comments: 0
        };
        MOCK.posts.unshift(newPost);
        return mockResolve(newPost);
      }
      return realFetch("/posts.php", { method: "POST", body: JSON.stringify(payload) });
    },

    /* ---------- reviews ---------- */
    getReviews({ category = null } = {}){
      if (USE_MOCK){
        let rows = MOCK.reviews.filter(r => !category || r.category_id === category);
        rows = rows.map(r => ({ ...r, author: MOCK.users.find(u => u.id === r.user_id) }));
        return mockResolve(rows);
      }
      const qs = new URLSearchParams(category ? { category } : {});
      return realFetch(`/reviews.php?${qs}`);
    },

    createReview(payload){
      if (USE_MOCK){
        const newReview = {
          id: Date.now(),
          user_id: MOCK.currentUserId,
          category_id: payload.category_id,
          title: payload.title,
          rating: payload.rating,
          body: payload.body,
          created_at: new Date().toISOString()
        };
        MOCK.reviews.unshift(newReview);
        return mockResolve(newReview);
      }
      return realFetch("/reviews.php", { method: "POST", body: JSON.stringify(payload) });
    },

    /* ---------- videos (category rails) ---------- */
    getVideos({ category = null } = {}){
      if (USE_MOCK){
        const rows = MOCK.videos.filter(v => !category || v.category_id === category);
        return mockResolve(rows);
      }
      const qs = new URLSearchParams(category ? { category } : {});
      return realFetch(`/videos.php?${qs}`);
    },

    /* ---------- users / profile ---------- */
    getUser(id){
      if (USE_MOCK) return mockResolve(MOCK.users.find(u => u.id === id));
      return realFetch(`/users.php?id=${id}`);
    },

    getCurrentUser(){
      if (USE_MOCK) return mockResolve(MOCK.users.find(u => u.id === MOCK.currentUserId));
      return realFetch("/users.php?me=1");
    },

    /* ---------- auth ---------- */
    login({ email, password }){
      if (USE_MOCK){
        if (!email || !password) return Promise.reject(new Error("Missing credentials"));
        return mockResolve({ token: "mock-token", user: MOCK.users.find(u => u.id === MOCK.currentUserId) });
      }
      return realFetch("/auth/login.php", { method: "POST", body: JSON.stringify({ email, password }) });
    },

    signup(payload){
      if (USE_MOCK){
        return mockResolve({ token: "mock-token", user: { ...payload, id: Date.now() } });
      }
      return realFetch("/auth/signup.php", { method: "POST", body: JSON.stringify(payload) });
    },

    logout(){
      if (USE_MOCK) return mockResolve({ ok: true });
      return realFetch("/auth/logout.php", { method: "POST" });
    }
  };
})();
