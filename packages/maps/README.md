# Maps

Lightweight map component using Pigeon Maps with Stamen Watercolor tiles.

## Key Exports

- `MapCard` - Map component wrapped in a content card
- `PigeonMap` - Core map with markers and zoom controls
- Custom marker with image support

## Features

- Stamen Watercolor base tiles with terrain labels overlay (via Stadia Maps)
- Custom themed zoom controls
- Custom circular marker with image overlay
- No lazy loading required (~10KB bundle)

## Tiles

`src/getTileSource.ts` is the only place that reads tile config from the environment:

- Browser tile URLs never carry `STADIA_API_KEY`. Production relies on Stadia's domain auth for `dylangattey.com`
- Development sends no key; Stadia serves keyless `localhost` requests without spending account credits
- `keyedStadiaTileUrl` adds the key, in production only, to tiles the server fetches itself, such as the `/activities` social image
- Tests, Vercel previews, and `MAP_TILES=offline` load debug tiles from this site's `/tiles` route, which serves Stadia's paths with each tile's z/x/y, a grid, and hard edges drawn on it, so tile placement and drift stay visible without any Stadia requests

## Usage

```tsx
import { MapCard } from '@dg/maps/MapCard';

<MapCard location={location} />
```
