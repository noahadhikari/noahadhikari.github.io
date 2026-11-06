# Noah Adhikari

The competitive Pokémon planner is developed separately in the sibling `pokemon-draft-lab` project. Its intended GitHub Pages path is `/pokemon-draft/`. Planner source and tests are kept in that separate project.

A personal website built with plain HTML, CSS, and JavaScript. No Ruby, Jekyll, package installation, or build step.

## Preview

Open `index.html` in a browser. For live reload while editing, use the **Live Server** extension in VS Code and choose **Open with Live Server** on `index.html`.

## Make it yours

- `index.html` — biography, interests, project descriptions, and contact links.
- `assets/css/site.css` — colors, typography, and responsive layouts. The theme colors are at the top.
- `assets/js/site.js` — pixel-world animation, scroll reveals, saved color preference, and the playable piano.
- `assets/images/monogram.svg` — pixel favicon.
- `assets/images/overworld.svg` — static landscape for visitors without JavaScript.

The page works without JavaScript, with a static visual in place of the animated canvas. The piano, motion controls, and color toggle are progressive enhancements. Piano audio starts only after an interaction. All fonts and assets are local, so the design also works offline. There are no analytics or tracking scripts.

The landscape is drawn on a 192 × 176 canvas and enlarged without smoothing. Clouds, reflections, a waterfall, and fireflies animate; pointer movement shifts the distant scenery. **Pause motion** stops the animation and scroll reveals. The animation also stops outside the viewport and when the browser tab is hidden. Reduced-motion preferences are respected automatically.

Pixel graphics and game-style controls sit alongside modern system typography. The piano’s **8-BIT SOUND** button switches between square-wave and softer triangle-wave tones. Audio only starts after interaction.

The content is adapted from the old site. Project ideas are described as explorations, and Berkeley activities are described historically. Update the biography and project details here as needed.

## GitHub Pages

Publish the repository root through **Settings → Pages → Deploy from a branch**, selecting your branch and **/ (root)**. The `.nojekyll` file tells GitHub Pages to serve these files directly. Changes go live after committing and pushing; there is no local compilation.

Old links to `elements.html`, `generic.html`, and `index/index.html` lead back to the redesigned homepage. The unused original Hyperspace assets remain available in the repository; the new site only loads `site.css`, `site.js`, and the two new SVG assets. The original template is by [HTML5 UP](https://html5up.net/), under its [Creative Commons Attribution license](https://html5up.net/license).
