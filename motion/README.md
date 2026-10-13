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
```

The input library lives in ../public/demos. Regenerate source cuts using
../scripts/prepare-demo-media.py first if capture sources change. Original source
bounds/crops are in provenance.json. The renderer validates final duration and
absence of an audio stream and records every still's frame and exported byte size
in films-provenance.json. Run the root build/check after rendering. Final files
are exported once; there is no runtime rendering or live AI in these demos.

The wide composition keeps footage beside explanations. Portrait captions are
rewritten for the available width. Screens establish context, move toward the
relevant result, then hold. Caption dialogue keeps the actual exchange. English
feedback and the separately selected practice focus must never be conflated.
The optional Hebrew capture is a different session, not a translated rendition.
