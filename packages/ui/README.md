# UI

Shared UI components and MUI theming. Organized into three categories:

## Structure

- **core/** - MUI-dependent components (buttons, layouts, navigation)
- **dependent/** - Components requiring Next.js or API dependencies (images, links, content cards)
- **icons/** - Icon components (goal: centralize all icon imports here)

## Key Exports

- `theme` - MUI theme configuration with color palette, typography, and component overrides
- Common components: buttons, cards, layouts, navigation, rich text rendering
- Next.js-specific: optimized images, client-side routing links, content wrappers
