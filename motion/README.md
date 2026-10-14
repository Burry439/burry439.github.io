# Build-time product films

This renderer is separate from the static website. It uses pinned Remotion/React
packages to produce committed silent MP4s and chapter WebP stills. Pages never
installs these dependencies and the browser does not receive React.

From this directory, with Node 24 and ffmpeg/ffprobe on PATH:

```powershell
npm ci
npm run render
# Render only selected exports:
node render.mjs simreview-mobile the-city-beyond-mobile
# Review the important action/outcome frames without exporting videos:
node render.mjs --review
```

The input library lives in ../public/demos. Regenerate source cuts using
../scripts/prepare-demo-media.py first if capture sources change. Original source
bounds/crops are in provenance.json. The renderer validates final duration and
absence of an audio stream and records every still's frame and exported byte size
in films-provenance.json. Run the root build/check after rendering. Final files
are exported once; there is no runtime rendering or live AI in these demos.

SimReview places the app beside the recorded exchange on desktop. The game uses
a wide stage with a short caption below it. Portrait exports place media above
the caption. Each chapter has its own camera path and reading holds in
src/direction.mjs; these are recorded in the film manifest. The website transcript
uses the same caption source. Caption bounds are checked during rendering.
Screens establish context, move toward the relevant control or result, then hold.
Capture time maps remain in order; omitted waits stay labeled. English
feedback and the separately selected practice focus must never be conflated.
The optional Hebrew capture is a different session, not a translated rendition.

Motion layer (src/index.jsx): chapters keep their published start times, and each
later chapter cross-fades in over the held last frame of the previous one, so the
website's chapter timings and stills stay valid. Captions rise in word by word,
recorded-dialogue highlights sweep in, a segmented progress bar replaces the
chapter counter, and a `tap` time in direction.mjs plays a press ripple at the
chapter's hotspot (from src/demos.mjs). Before-stills are taken just after the
entrance or cross-fade. Render with concurrency 1 on low-memory machines.
The game ending now includes the gate crossing and the actual end-of-playable-area
screen. The original game captures are exported without cropping; the renderer
frames each shot so it can preserve complete response lines.
