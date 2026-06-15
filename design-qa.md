# Design QA

## Comparison Target

- Source visual truth: `docs/design-qa/source.png`
- Desktop implementation: `docs/design-qa/implementation-desktop.png`
- Mobile implementation: `docs/design-qa/implementation-mobile.png`
- Full-view comparison: `docs/design-qa/comparison-full.png`
- Focused hero comparison: `docs/design-qa/comparison-hero.png`
- Viewport: 1024 x 1536 for the desktop capture
- State: public home page, signed out, default theme, no open overlays

## Findings

No actionable P0, P1, or P2 mismatches remain.

- Fonts and typography: the Cormorant display face and Manrope interface face reproduce the source's editorial hierarchy, weight contrast, line breaks, and compact navigation.
- Spacing and layout rhythm: the split hero, category triptych, product grid, section spacing, borders, and radii follow the source composition at desktop and collapse cleanly on mobile.
- Colors and visual tokens: terracotta, emerald, ivory, champagne, and graphite are consistently mapped across backgrounds, actions, labels, and typography with accessible contrast.
- Image quality and asset fidelity: all visible fashion, category, hero, and product imagery uses original raster assets generated for this direction. Crops remain sharp and consistent with the source art direction.
- Copy and content: navigation, hero messaging, category labels, value propositions, calls to action, and product content preserve the intended Portuguese storefront voice.
- Interaction and accessibility: navigation, links, catalog cards, cart actions, forms, focus states, reduced-motion handling, and responsive behavior are implemented rather than represented as static chrome.

## Open Questions

- Production photography will replace the demonstration assets through the signed Cloudinary admin flow before launch.
- The WhatsApp destination remains a deployment variable because the production number has not been supplied.

## Patches Made

1. Reduced the desktop category-card height to restore the source's tighter vertical rhythm.
2. Reduced and repositioned the WebGL brass ornament so it supports the hero without obscuring the merchandise.
3. Adjusted the hero image focal point to keep both primary outfits visible in the split layout.
4. Kept a static image fallback and disabled the 3D layer for reduced-motion users and smaller viewports.

## Follow-up Polish

- [P3] Revisit the hero crop after real campaign photography is uploaded, since subject spacing will vary by asset.

## Implementation Checklist

- [x] Source and implementation compared side by side.
- [x] Focused hero region reviewed.
- [x] Desktop and mobile layouts captured.
- [x] Typography, spacing, colors, imagery, copy, interactions, and accessibility reviewed.
- [x] All P0-P2 findings resolved.

final result: passed
