# TRYNEX — Mobile-First Video Platform

A mobile-first React web app (works as installable PWA-style) matching the mockup: dark theme with violet accents, where creators upload videos / web series / short films and viewers watch, like, comment, share. Built on TanStack Start with Lovable Cloud (auth, database, storage).

## Design System

- **Theme:** Deep near-black bg (`#0A0613`), elevated card `#15101F`, violet primary `#8B5CF6` → `#A78BFA` gradient, soft lavender accents, white-on-dark text.
- **Type:** Display = "Sora" (logo + headings), Body = "Inter".
- **UI motifs:** rounded-2xl cards, gradient violet pill buttons, glowing focus rings, bottom tab bar with center "Create" FAB, mobile frame max-width 480px centered on desktop.

## Screens (14)

1. **Login / Signup** — email+password & Google sign-in, TRYNEX wordmark
2. **Home feed** (`/`) — tab pills (For You / Web Series / Short Films / Movies), hero card, Trending Now horizontal scroll, Top Web Series row, bottom nav
3. **Video Playing** (`/watch/$id`) — player, title, tags, like/dislike/comments/share/download, creator follow card, Up Next
4. **Profile** (`/profile` and `/u/$username`) — avatar, stats (Posts/Followers/Following), menu (My Uploads, My Series, Watch History, Liked, Saved, Earnings, Settings)
5. **Upload — Select Type** (`/create`) — Video / Web Series / Short Film / Story Episode
6. **Upload Details Part 1** (`/create/details`) — thumbnail, title, description
7. **Upload Details Part 2** (`/create/details/meta`) — episode #, tags chips, language, visibility, allow comments
8. **Select Video** (`/create/select`) — list of device videos (mock gallery + real file picker)
9. **Process & Publish** (`/create/uploading`) — circular progress, step checklist
10. **Analytics** (`/analytics`) — period selector, KPI cards (Views, Watch Time, Likes, Comments, Shares, Earnings), line chart
11. **Speed menu** — opens as a sheet on the player
12. **Full screen view** — landscape player layout
13. **Full screen + speed** — speed sheet within fullscreen
14. **More Options sheet** — Quality, Speed, Report, Download, Save, Help & Feedback

## Backend (Lovable Cloud)

**Tables:**
- `profiles` — id (=auth.uid), username, display_name, avatar_url, bio, created_at
- `videos` — id, creator_id, title, description, type (enum: video/series/short/story), thumbnail_url, video_url, language, episode_number, series_title, tags[], visibility (public/private), allow_comments, views, created_at
- `likes` — user_id, video_id (composite PK)
- `comments` — id, video_id, user_id, body, created_at
- `follows` — follower_id, following_id (composite PK)
- `watch_history` — id, user_id, video_id, watched_at
- `saved_videos` — user_id, video_id

**Auth:** Email/password + Google. Profile auto-created via trigger on signup (username from email).

**Storage buckets:** `videos` (private, signed URLs), `thumbnails` (public), `avatars` (public).

**RLS:** Users edit only their own profile/videos/comments. Public visibility videos readable by all; private only by owner. Likes/follows/saved scoped to `auth.uid()`.

**Analytics:** view counts incremented via RPC on watch; aggregated client-side from `videos`, `likes`, `comments` for the dashboard.

## Tech

- TanStack Router file-based routes, protected `/_authenticated` for create/profile/analytics
- TanStack Query for all reads, mutations with cache invalidation
- HTML5 `<video>` element with custom controls (play/pause, scrub, speed, fullscreen, quality picker UI)
- Mobile bottom tab bar component, sheet/drawer for menus (vaul)
- Image generation for default thumbnails & hero placeholders

## Out of scope for v1

- Real video transcoding / multiple qualities (quality picker UI shows but plays single source)
- Real earnings payouts (analytics shows mock ₹ derived from views)
- Push notifications
- Native mobile app

Confirm and I'll start with the design system, auth, then build the screens in order.