/* =========================================================
   MOSAIC — Mock data
   -----------------------------------------------------------
   Each object below is shaped the way its future MySQL row
   would look (see README.md for the matching schema), so that
   swapping the mock functions in api.js for real fetch() calls
   requires no changes to the page scripts that consume them.
   ========================================================= */

window.MOSAIC_MOCK = {

  /* `icon` matches a <symbol id="icon-<value>"> in assets/icons/icons.svg.
     Storing the key (not a path) means the DB just needs a short
     VARCHAR column — no file paths to keep in sync. */
  categories: [
    { id: "Islands", name: "Islands",  icon: "leaf" },
    { id: "music",  name: "Music",   icon: "music" },
    { id: "Villagers", name: "Villagers",  icon: "Villagers" },
    { id: "Events", name: "Events",  icon: "Events" },
    { id: "Museum",name: "Museum", icon: "Museum" },
    { id: "Games", name: "Games",  icon: "Games" }
  ],

  users: [
    { id: 1, username: "ana_reviews",  display_name: "Ana Torres",   avatar: "", bio: "Cataloguing every film I watch since 2019.", followers: 482, following: 210 },
    { id: 2, username: "leo.codes",    display_name: "Leo Fernández",avatar: "", bio: "Backend dev, weekend hiker, terrible cook.", followers: 128, following: 96 },
    { id: 3, username: "mia_plays",    display_name: "Mia Chen",     avatar: "", bio: "Speedrunner. Currently obsessed with roguelikes.", followers: 951, following: 140 },
    { id: 4, username: "you",          display_name: "You",          avatar: "", bio: "This is your profile — edit me later.", followers: 12, following: 34 }
  ],

  currentUserId: 4,

  posts: [
    { id: 101, user_id: 1, category_id: "Islands", caption: "Rewatched Amélie tonight — still perfect.", created_at: "2026-08-20T19:20:00", likes: 34, comments: 5 },
    { id: 102, user_id: 3, category_id: "Villagers", caption: "New personal best on the dungeon run, 12:04.", created_at: "2026-08-21T09:05:00", likes: 58, comments: 12 },
    { id: 103, user_id: 2, category_id: "Museum",caption: "First attempt at pan-seared salmon. 7/10.", created_at: "2026-08-21T13:40:00", likes: 21, comments: 3 },
    { id: 104, user_id: 1, category_id: "Games", caption: "Three days in Oaxaca and I'm already planning the next trip.", created_at: "2026-08-22T08:15:00", likes: 76, comments: 9 },
    { id: 105, user_id: 3, category_id: "music",  caption: "This live session has been on repeat all week.", created_at: "2026-08-22T17:50:00", likes: 40, comments: 6 },
    { id: 106, user_id: 2, category_id: "Events", caption: "Local league final tomorrow, can't wait.", created_at: "2026-08-23T07:30:00", likes: 15, comments: 1 }
  ],

  reviews: [
    { id: 201, user_id: 1, category_id: "Islands", title: "Paddington 2",   rating: 5, body: "The kindest, most quietly perfect sequel ever made.", created_at: "2026-08-18T12:00:00" },
    { id: 202, user_id: 4, category_id: "Villagers", title: "Hollow Knight",  rating: 5, body: "Atmosphere and difficulty balance are unmatched.", created_at: "2026-08-19T21:10:00" },
    { id: 203, user_id: 3, category_id: "music",  title: "Random Access Memories", rating: 4, body: "Ages incredibly well, still sounds futuristic.", created_at: "2026-08-20T15:45:00" }
  ],

  /* Video placeholders per category — will map to a `videos` table
     with a category_id foreign key once the backend exists. */
  videos: [
    { id: 301, category_id: "Islands", title: "Trailer roundup — this week", duration: "04:12" },
    { id: 302, category_id: "Islands", title: "Behind the scenes: indie darlings", duration: "07:45" },
    { id: 303, category_id: "music",  title: "Live session: acoustic set", duration: "18:30" },
    { id: 304, category_id: "music",  title: "Studio breakdown", duration: "09:02" },
    { id: 305, category_id: "Villagers", title: "Boss fight highlights", duration: "05:55" },
    { id: 306, category_id: "Villagers", title: "Speedrun world record", duration: "12:04" },
    { id: 307, category_id: "Events", title: "Match highlights", duration: "03:40" },
    { id: 308, category_id: "Museum",title: "5-minute weeknight pasta", duration: "05:00" },
    { id: 309, category_id: "Games", title: "48 hours in Lisbon", duration: "10:22" }
  ]
};
