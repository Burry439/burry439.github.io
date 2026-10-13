# Baruch Weinstein — portfolio

A static portfolio for AI product building, prototyping, and product management. Includes guided product demos, the SimReview and The City Beyond case studies, full promo videos, responsive layouts, dark mode, keyboard controls, and reduced-motion support.

## Run

Requires Node 24. No npm dependencies or install step for building and publishing.

```powershell
npm run build
npm run check
npm run preview
```

Open http://127.0.0.1:4174. The local server supports video range requests. Output is generated into `dist/`; edit source, not generated files.

## Edit and expand

- `src/projects.mjs`: profile, social links, project summaries, case study sections, metrics, and video metadata.
- `scripts/build.mjs`: page templates and HTML generation.
- `public/styles.css`: design, responsive layout, themes, and motion.
- `public/app.js`: project deck, theme preferences, navigation, and promo dialogs.
- `src/demos.mjs`: shared demo sequences, explanations, recorded dialogue, actions, timings, and normalized hotspots. Project data opts into a demo.
- `public/demos.js` and `demo.css`: one reusable player for inline demos and the homepage dialog.
- `public/demos/`: silent MP4 segments, before/after WebP frames, and source timestamp provenance.
- `public/assets/`: approved synthetic UI screenshots, gameplay screenshots, posters, and self-hosted fonts.
- `public/videos/*-story.mp4` and `*-story-mobile.mp4`: current widescreen and portrait promo exports. `provenance.json` records their original files, sizes, durations and hashes.

To replace a promo, add the new wide and portrait exports to `public/videos/` and update `video`, `videoMobile`, `poster`, `duration` and `durationMobile` in `src/projects.mjs`. Update promo provenance, build and push. Homepage dialogs and case-study players select portrait at widths up to 600px; video loading remains deferred. Originals remain in the project workspaces. Current story cuts are 1:40 wide / 1:33 portrait for SimReview and 2:10 in both formats for The City Beyond.

To add a project, add an object to the `projects` array using the existing schema. The homepage, deck, case navigation, individual static page, and sitemap are generated from that array. The next-project link selects another project. Review the homepage composition as the collection grows.

## Publishing and domain

GitHub Actions builds and publishes to GitHub Pages on pushes to `main`. The production URL is https://baruchweinstein.com/. Source is in the separate `Burry439/burry439.github.io` repository; existing project repos and the older Portfolio repo are unchanged.

The build accepts `SITE_URL` (origin, no trailing slash) and `SITE_BASE_PATH` (for subdirectory hosting). The workflow gets them from GitHub Pages configuration. HTTPS is enforced; `www` redirects to the apex domain. Connection details and saved DNS records are in `docs/domain-setup.md`.

## Product films and verification

The primary demos are silent 43-second SimReview and 52-second City Beyond films. Each has a separately composed wide (1280×720) and portrait (720×960) export with real screens, controlled close-ups and readable captions. “Explore moments” seeks the same film and holds each recorded result. No React or Remotion code ships to the browser.

The player loads only its selected rendition after activation, reuses it across modes, pauses offscreen/when hidden and cancels pending playback on close or restart. Reduced motion opens still exploration; playing film requires a choice. A separate labeled Hebrew recording and both full promos remain available. Source timestamps are in `public/demos/provenance.json`; final films, still frame numbers, actual sizes and verified silent tracks are in `films-provenance.json`.

Selected rendition plus supporting chapter stills (including the Hebrew example for SimReview): approximately 1.62 MB / 1.51 MB for SimReview wide/portrait; 3.94 MB / 3.47 MB for City wide/portrait. Optional original promos are separate.

To regenerate source cuts, with Python and ffmpeg/ffprobe installed:

```powershell
python scripts/prepare-demo-media.py --sim-source 'PATH/TO/SIMREVIEW/promo' --city-source 'PATH/TO/TIME-TRAVEL/promo'
```

The isolated build-time renderer has its own pinned dependencies:

```powershell
cd motion
npm ci
npm run render
# Or: node render.mjs simreview-mobile the-city-beyond-mobile
cd ..
npm run build
npm run check
```

Exported assets are committed. The Pages workflow only builds the static site and checks source bounds, continuous chapter timings, stills, provenance and media budgets. Browser tests need an installed Playwright package: set `PLAYWRIGHT_PACKAGE` to its package.json and optionally `CHROMIUM_EXECUTABLE`, then run `npm run test:demos`. `npm run test:public` checks published routes, HTTPS redirects, media range requests and both promos. `QA_URL` can select a local preview. Reports/screenshots remain ignored in `qa/`.

The five-person comprehension test in `docs/comprehension-test.md` remains proposed, not conducted. Automated controls/layout checks do not establish audience comprehension.

## Evidence and editorial basis

- SimReview: local `README.md`, current `docs/product-decisions.md` and backend scoring configuration, `docs/case-study.md`, evaluation appendices, synthetic screenshots, and the current promo workspace. The source repo is private and no private recordings or credentials are included here.
- The City Beyond: `docs/portfolio/case_study.html`, GDD, evaluation results, `docs/UX_REVIEW_2026-10-12.md`, and current promo workspace in the public `Burry439/time-travel` project.
- Related local Codex project chats were consulted for ownership and project goals.
- Career copy uses the owner’s verified current LinkedIn profile: full-stack work at JumboMail and Red Black Tree, a teaching assistant role at Reichman, and HCI/business background. Coursework completion is not presented as a confirmed awarded degree. The thesis, video pipeline and family context are excluded at the owner’s request.
- Case study writing uses a short overview, personal contribution, decisions and alternatives, artifacts, measured evidence, limits, and next decisions. Guidance: https://www.nngroup.com/articles/ux-design-portfolios/.
- Visual reference: https://jonzinercohen.com/. The site has original implementation and project content, with similar warm neutrals, floating navigation, project deck, and case-study hierarchy. No reference artwork, personal claims, or analytics identifiers are included.
- General Sans is distributed by Fontshare: https://www.fontshare.com/fonts/general-sans. Files were obtained through Fontshare’s public font CSS API and are self-hosted for performance.

Technical evaluations are labeled as such. No learner, clinical, business, or player outcome claims are made. The latest supplied story promos replace the earlier cuts; narration and recorded outcomes are preserved. The silent primary films remain separate, with updated editorial captions.
