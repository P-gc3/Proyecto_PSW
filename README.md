# Mosaic — functional front-end structure

A click-through, navigation-first prototype for a Letterboxd-inspired social
network: a home page with a picture collage and per-category video rails, a
**single reusable feed template** for every category, a profile with tabs,
and forms to write a review or share a post. Pure HTML/CSS/JS, no build
step, ready to be wired to a PHP + MySQL backend.

## Run it locally

Browsers block `fetch()` on `file://` pages, and this project loads its
header/footer as partials, so serve it instead of double-clicking `index.html`:

```bash
cd mosaic
php -S localhost:8000
# or: npx serve .   /   python3 -m http.server 8000
```

Then open `http://localhost:8000/signin.html`.

## Folder structure

```
mosaic/
├── index.html            redirects to signin.html
├── signin.html
├── signup.html
├── home.html              collage + category video rails
├── feed.html               ← ONE template for every category (?cat=Islands, ?cat=music, …)
├── profile.html            tabs: posts / reviews
├── review-new.html         "make a review" form
├── post-new.html           "share a post" form
├── partials/
│   ├── header.html         shared nav — becomes header.php
│   └── footer.html         shared footer — becomes footer.php
├── assets/
│   ├── css/
│   │   ├── variables.css   design tokens (palette, spacing, type)
│   │   ├── base.css        reset + utilities
│   │   ├── layout.css      header, nav, footer, category pills
│   │   ├── components.css  cards, collage grid, video rails, forms, modal
│   │   └── auth.css        sign in / sign up layout only
│   └── js/
│       ├── config.js       USE_MOCK flag + API base URL — flip ONE value here
│       ├── mock-data.js    sample rows shaped like the future MySQL tables
│       ├── api.js          data-access layer — every page calls this, never fetch() directly
│       ├── nav.js           shared shell: loads partials, mobile nav, toasts, modals
│       ├── home.js / feed.js / profile.js / review.js / post.js / auth.js
```

## Why it's built this way (scalability notes)

- **One feed template, not one file per category.** `feed.html` reads its
  category from the URL (`?cat=`), so Islands, Music, Villagers, and any category
  added later all reuse the same markup, CSS and JS — no duplication as the
  category list grows.
- **A single data-access seam (`api.js`).** No page script calls `fetch()`
  or touches mock data directly — everything goes through `MosaicAPI.*`.
  When the backend exists, flip `USE_MOCK = false` in `config.js` and point
  `API_BASE_URL` at your PHP folder; nothing else changes.
- **Partials instead of copy-pasted markup.** The header and footer live in
  `partials/` and are injected by `nav.js`, mirroring the
  `<?php include 'header.php'; ?>` pattern you'll use server-side — turning
  this into PHP includes later is a copy, not a rewrite.
- **Pagination built in from the start.** `getPosts()` already accepts
  `page` / `limit` (`PAGE_SIZE` in `config.js`) and the feed has a "Load
  more" button — maps directly to `LIMIT ? OFFSET ?` in SQL, so feeds stay
  fast at small-to-medium volume instead of loading everything at once.
- **Mock data shaped like real rows.** Every object in `mock-data.js`
  mirrors a MySQL row (see schema below) so the JSON a future PHP endpoint
  returns needs no reshaping on the front end.

## Suggested MySQL schema

```sql
CREATE TABLE users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  username      VARCHAR(30) UNIQUE NOT NULL,
  display_name  VARCHAR(60) NOT NULL,
  email         VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_path   VARCHAR(255),
  bio           VARCHAR(280),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id    VARCHAR(20) PRIMARY KEY,   -- 'Islands', 'music', 'Villagers', ...
  name  VARCHAR(40) NOT NULL,
  emoji VARCHAR(8)
);

CREATE TABLE posts (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  user_id      INT NOT NULL REFERENCES users(id),
  category_id  VARCHAR(20) NOT NULL REFERENCES categories(id),
  caption      VARCHAR(500),
  media_path   VARCHAR(255),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_posts_category_created (category_id, created_at)  -- feed paging
);

CREATE TABLE reviews (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  user_id      INT NOT NULL REFERENCES users(id),
  category_id  VARCHAR(20) NOT NULL REFERENCES categories(id),
  title        VARCHAR(120) NOT NULL,
  rating       TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_category (category_id)
);

CREATE TABLE videos (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  category_id  VARCHAR(20) NOT NULL REFERENCES categories(id),
  title        VARCHAR(120) NOT NULL,
  video_path   VARCHAR(255),
  duration_sec INT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE likes (           -- normalized rather than a counter column,
  post_id INT NOT NULL REFERENCES posts(id),  -- so counts stay correct
  user_id INT NOT NULL REFERENCES users(id),  -- under concurrent writes
  PRIMARY KEY (post_id, user_id)
);
```

## Front end → PHP endpoint map (used by `api.js`)

| Front end call              | Endpoint                          |
|------------------------------|------------------------------------|
| `MosaicAPI.getCategories()`  | `GET /api/categories.php`          |
| `MosaicAPI.getPosts()`       | `GET /api/posts.php?category=&page=&limit=` |
| `MosaicAPI.createPost()`     | `POST /api/posts.php`              |
| `MosaicAPI.getReviews()`     | `GET /api/reviews.php?category=`   |
| `MosaicAPI.createReview()`   | `POST /api/reviews.php`            |
| `MosaicAPI.getVideos()`      | `GET /api/videos.php?category=`    |
| `MosaicAPI.getUser(id)`      | `GET /api/users.php?id=`           |
| `MosaicAPI.getCurrentUser()` | `GET /api/users.php?me=1`          |
| `MosaicAPI.login()`          | `POST /api/auth/login.php`         |
| `MosaicAPI.signup()`         | `POST /api/auth/signup.php`        |
| `MosaicAPI.logout()`         | `POST /api/auth/logout.php`        |

On the PHP side: use **prepared statements** (PDO or mysqli) for every
query, hash passwords with `password_hash()`, validate `category_id`
against the `categories` table, and paginate every list endpoint with
`LIMIT`/`OFFSET` driven by the `page`/`limit` query params already sent by
the front end.

## Color tokens (pale green + light blue)

Defined in `assets/css/variables.css`:

- `--color-primary` `#7FC49A` — pale green, primary actions
- `--color-secondary` `#9FD3E8` — light blue, links & accents
- `--color-bg` `#F2F9F5` — page background
- `--color-surface` `#FFFFFF` — cards
- `--color-text` `#223229` — body text

## Not implemented on purpose

This is a navigation/architecture prototype, so a few things are
intentionally stubbed for now: real authentication/sessions, file uploads,
following/likes persistence, search results, and notifications. Each has a
clearly marked hook in the JS (search `TODO`-style comments in `api.js`)
for where the real backend call goes.
