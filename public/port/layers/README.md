# Blacklace Island — six-layer port parallax

The port now supports six independent transparent PNG planes. It **does not** pretend that the reference contact sheet is six alpha-matted assets. The existing complete day/night panorama stays visible until all six files load successfully.

Expected paths (each must have a full-canvas, aligned transparent background, identical pixel dimensions, ideally 1920×1080 or higher):

- `public/port/layers/sky.png` — complete opaque sky and clouds (plane 0)
- `public/port/layers/volcano.png` — volcano and distant mountains, transparent elsewhere (plane 1)
- `public/port/layers/hills.png` — hills and distant settlements (plane 2)
- `public/port/layers/village.png` — Rotas and the Institute (plane 3)
- `public/port/layers/quay.png` — quay, water, docks, stones (plane 4)
- `public/port/layers/foreground.png` — flowers, foliage, bird and near props (plane 5)

**Do not upload the reference contact sheet as a transparent asset.** Its checkerboard and titles are pixels, not true transparency. Each element needs a proper alpha matte and missing backgrounds must be reconstructed behind foreground objects.

Validation before merging assets: inspect all six alpha channels, verify exact alignment with the landmark hotspots, ensure no gaps appear at maximum perspective movement, test portrait and landscape, reduced motion and night mode. The six-layer loader currently reuses the day assets in night mode; separate night color treatment is still required before replacing the existing night panorama in production.

This is a staging contract, not a claim that final image assets have already been integrated.
