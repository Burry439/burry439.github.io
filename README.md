# Baruch Weinstein — portfolio

A static portfolio for AI product building, prototyping, and product management. Includes the SimReview and The City Beyond case studies, current promo videos, responsive layouts, dark mode, accessible video dialogs, keyboard project navigation, scroll reveals, and reduced-motion support.

## Run

Requires Node 24 and Python 3. No npm dependencies or install step.

```powershell
npm run build
npm run check
npm run preview
```

Open http://localhost:4173. Output is generated into `dist/`; edit source, not generated files.

## Edit and expand

- `src/projects.mjs`: profile, social links, project summaries, case study sections, metrics, and video metadata.
- `scripts/build.mjs`: page templates and HTML generation.
- `public/styles.css`: design, responsive layout, themes, and motion.
- `public/app.js`: project deck, theme preferences, navigation, and promo dialogs.
- `public/assets/`: approved synthetic UI screenshots, gameplay screenshots, posters, and self-hosted fonts.
- `public/videos/simreview.mp4` and `city-beyond.mp4`: current browser-ready promo cuts.

To replace a video, overwrite its file in `public/videos/`, update its poster and duration in `src/projects.mjs`, build, and push. The case study and homepage player use the same file. Originals remain in the project workspaces; the site contains the smaller existing preview encodes.

To add a project, add an object to the `projects` array using the existing schema. The homepage, deck, case navigation, individual static page, and sitemap are generated from that array. The next-project link selects another project. Review the homepage composition as the collection grows.

## Publishing and domain

GitHub Actions builds and publishes to GitHub Pages on pushes to `main`. The production URL is https://burry439.github.io/. Source is in the separate `Burry439/burry439.github.io` repository; existing project repos and the older Portfolio repo are unchanged.

The build accepts `SITE_URL` (origin, no trailing slash) and `SITE_BASE_PATH` (for subdirectory hosting). The workflow gets them from GitHub Pages configuration. A future GoDaddy domain can be connected through the repository’s Pages custom-domain setting and its DNS records; no domain has been purchased or configured by this task.

## Evidence and editorial basis

- SimReview: local `README.md`, `docs/case-study.md`, evaluation appendices, synthetic screenshots, and the current promo workspace. The source repo is private and no private recordings or credentials are included here.
- The City Beyond: `docs/portfolio/case_study.html`, GDD, evaluation results, `docs/UX_REVIEW_2026-10-12.md`, and current promo workspace in the public `Burry439/time-travel` project.
- Related local Codex project chats were consulted for ownership and project goals.
- Role positioning follows the owner’s stated interest in AI product builder, prototyper, and product management roles. LinkedIn’s public index was stale and direct access was blocked; the LinkedIn plugin tools were not available in the chat. No current LinkedIn work history is invented.
- Case study writing uses a short overview, personal contribution, decisions and alternatives, artifacts, measured evidence, limits, and next decisions. Guidance: https://www.nngroup.com/articles/ux-design-portfolios/.
- Visual reference: https://jonzinercohen.com/. The site has original implementation and project content, with similar warm neutrals, floating navigation, project deck, and case-study hierarchy. No reference artwork, personal claims, or analytics identifiers are included.
- General Sans is distributed by Fontshare: https://www.fontshare.com/fonts/general-sans. Files were obtained through Fontshare’s public font CSS API and are self-hosted for performance.

Technical evaluations are labeled as such. No learner, clinical, business, or player outcome claims are made. The supplied promos remain as-is, including any earlier narration or embedded branding; they can be replaced with the planned improved cuts.
