# Maps

Mapbox GL integration for interactive maps. Dynamically imported to reduce bundle size.

## Key Exports

- `MapCanvas` - Interactive map component with markers and controls
- Mapbox GL configuration and styling
- Location marker rendering utilities

## Usage

Lazy load via dynamic import to avoid loading the large Mapbox dependency upfront:

```ts
const MapCanvas = dynamic(() => import('@dg/maps').then(m => m.MapCanvas))
```
