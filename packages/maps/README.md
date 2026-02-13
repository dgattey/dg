# Maps

Lightweight map component using Pigeon Maps with Stadia tile provider.

## Key Exports

- `MapCard` - Map component wrapped in a content card
- `PigeonMap` - Core map with markers and zoom controls
- Custom marker with image support

## Features

- Light/dark mode support via Stadia Maps tiles
- Custom themed zoom controls
- Custom circular marker with image overlay
- No lazy loading required (~10KB bundle vs ~500KB for Mapbox)

## Usage

```tsx
import { MapCard } from '@dg/maps/MapCard';

<MapCard location={location} />
```
