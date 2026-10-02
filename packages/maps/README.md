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

- Production (`NODE_ENV=production`) sends `STADIA_API_KEY`
- Development sends no key; Stadia serves keyless `localhost` requests without spending account credits
- Tests and `MAP_TILES=offline` render an inline placeholder tile and make no tile requests

## Usage

```tsx
import { MapCard } from '@dg/maps/MapCard';

<MapCard location={location} />
```
