# Greenhouse M1 — round 4: photo plate + scale-safe foliage

Branch `dgattey/greenhouse-home-ds-e624`. Draft PR: https://github.com/dgattey/dg/pull/599

A single 16:9 thicket cannot cover 390×844, iPad portrait, and 3440×1440. Foreground is now three independently anchored layers plus the four keyed cutouts.

## Layers

- Landscape plate (`spike-glass-plate`) at `(min-width: 768px)`. Portrait plate (`plate-src-portrait`) at `(max-width: 767px)`.
- Left / right edge strips: `height: 100dvh`, `width: clamp(180px, 20vw, 440px)`, `object-fit: cover`, `object-position: bottom left|right`.
- Bottom band: cropped to foliage rows (1536×566), wrap seam MAD 48.3 so the encode is a mirror tile. `repeat-x`, `background-size: auto min(34dvh, 420px)`.
- Four keyed cutouts as the front-most corner layer.

Strips and the band paint behind the frosted cards. Cutouts overlap card corners.

## Transfer (AVIF, measured)

| Asset | Bytes |
| --- | ---: |
| back-plate-1536 | 130.5 KB |
| back-plate-960 | 61.1 KB |
| back-plate-portrait | 88.3 KB |
| edge-left-1536 | 99.0 KB |
| edge-right-1536 | 99.1 KB |
| edge-left-900 | 54.6 KB |
| edge-right-900 | 53.8 KB |
| bottom-band-1536 | 55.9 KB |
| bottom-band-1024 | 28.8 KB |
| 4× 1024w cutouts | 187.4 KB |
| **Desktop (plate + both edges + band + 4 cutouts)** | **571.9 KB** |
| **Mobile (portrait + both 900 edges + band-1024 + 2–3×768 cutouts)** | **~260 KB** |

Desktop is over the 375–450 KB guess because the dedicated edge sources encode near 99 KB each at q40, and home still loads all four cutout species. First paint is the plate (`fetchpriority=high`). Edges, band, and cutouts are `low` / async.

## Safe zones

`homeSafeRects` + cutout AABB at 1440×900, 390×844, 1024×1366, 2560×1440. Ultrawide strip width (440) stays inside the 736px margin around the 68rem grid.

## Shots

| Shot | Path |
| --- | --- |
| Desktop 1440×900 | `/cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/m1-home-desktop.png` |
| Mobile 390×844 | `/cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/m1-home-mobile.png` |
| Tablet 1024×1366 | `/cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/m1-home-tablet.png` |
| Ultrawide 2560×1440 | `/cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/m1-home-ultrawide.png` |
| Live \| mock | `/cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/m1-side-by-side.png` |
| Zoom edges | `/cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/m1-zoom-edges.png` |
