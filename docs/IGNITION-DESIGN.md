# Ignition Studio + Evidence Constellation

## Frameless artwork and shared fire background — 15 November 2026

The current hero uses `apps/web/public/design/ignition-chamber-cutout.png`, a 1536×1024 RGBA version with actual transparent pixels outside the chamber. The original artwork is retained. The transparent version was created with the built-in image tool in background-extraction mode, then copied into the project. It remains a decorative concept illustration. Both the base image and independently masked flame animation use the same cutout so their coordinates agree.

The outer card border, surface and shadow were removed. The shared `AmbientFire` component in the root layout provides animated SVG flame ribbons, a warm glow and drifting embers across all pages. It is hidden from accessibility tools, sits behind the content and cannot intercept clicks. Light mode reduces its intensity; mobile uses fewer embers. The existing motion control pauses it, system reduced-motion preferences stop its animation, and print hides it.

### Transparent artwork edit prompt

Use case: background-extraction. Edit target: the referenced EmberScope chamber illustration. Remove ONLY the black studio backdrop and the floor/shadow/reflection outside the physical combustion chamber, output actual alpha transparency. Keep the entire metal chamber, every pipe, foot, bolt, glass window, the enclosed orange flame and its blue base intact. Keep its exact original position, scale, proportions, perspective and lighting in the same wide 1536x1024 canvas: chamber remains on the right, left remains empty transparent space. Do not crop, center, redraw or redesign the chamber or flame. Retain the dark interior behind the glass; transparency is only OUTSIDE the physical object, including empty gaps between pipes and legs. No text or new elements. Clean crisp antialiased silhouette, no black rectangular halo. This is a decorative web illustration, not measured scientific data.

## Original design

Selected direction: option 2's charcoal/copper/orange chamber aesthetic combined with option 4's purple/cyan evidence map. Implemented in the active app, not as a static screenshot background.

The hero artwork is saved at `apps/web/public/design/ignition-chamber.png`. It was generated with the built-in image-generation tool on 14 November 2026. It is an illustrative apparatus, not a NASA photograph or measured flame simulation. Labels in the five earlier design previews were placeholders; the implemented map uses the curated investigation names, exact publication excerpts and original sources.

Motion uses lightweight CSS: chamber drift, ambient light, a scanning overlay, ember particles and flow along the selected study connection. The header motion control pauses the decorative effects and remembers the choice. System reduced-motion settings take precedence. The map has a list alternative; selection, source/finding tabs and keyboard navigation remain available with motion paused.

Map edges mean corpus membership and provenance. Investigation goal highlighting does not create numerical data or alter the report's selected mission conditions. The report, atlas, comparison and source tools remain accessible.

## Artwork generation prompt

Use case: ui-mockup supporting 3D illustration asset. A photorealistic cinematic scientific microgravity combustion chamber for the right half of a premium dark web dashboard, matching a charcoal-and-ember-orange Ignition Studio design. Wide landscape 1536x1024 raster artwork only, NO UI, NO text, NO typography, NO labels, NO logos. A richly detailed dark brushed titanium combustion chamber with a large rounded square front glass observation window, visible industrial bolts and restrained copper edges. Inside the glass, a dramatic round suspended microgravity flame, spherical and buoyant-looking, bright vivid amber/orange fiery filaments surrounding an intense deep blue lower core. The flame floats freely in the middle, no candle, no burner stem. Beautiful realistic refraction and warm orange reflections on the chamber, subtle smoky interior; not a sun, not a planet. Three-quarter near-frontal view, right-facing slight perspective. Camera at chamber center. Entire apparatus visible with breathing room, fill roughly 80% image height, centered toward right, softly disappearing into a near-black #090909 background. Lighting from glowing flame, fine restrained highlights, premium high-end product rendering, scientific concept illustration. No Earth, no astronauts, no stars, no floating particles outside device. A clean dark backdrop allows overlaying an animated scanline in the implemented interface. Polished natural volumetric flame detail, crisp metal construction. This is a conceptual apparatus illustration, not a NASA experiment photograph.
