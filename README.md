# Application Shell — Material

The [SpyneJS Application Shell](https://github.com/spynejs/application-shell) in
[Material Design 3](https://m3.material.io): the same pages, navigation, and page
items, drawn with Material's colour roles, type scale, shapes, motion, and components.

Material Design is an open-source design system created by Google. This template is
an independent implementation of it, and is not affiliated with or endorsed by
Google. See [NOTICE.md](NOTICE.md).

Use it as the starting point for an application that needs routing and a page
structure from the outset, and should look and move as Material does.

For the Shell in its own design, see
[application-shell](https://github.com/spynejs/application-shell). For a minimal
starting point, see
[application-starter](https://github.com/spynejs/application-starter).

## What is Material here

- **Tokens.** Colour roles for a light and a dark scheme, the type scale, corners,
  elevation, durations and easings are read at build time from
  [`@material/web`](https://github.com/material-components/material-web) 2.5.0,
  published by Google, and emitted as `--md-sys-*` custom properties. No Material
  value is typed in by hand.
- **Components.** Buttons (five variants, five sizes, two shapes), cards, outlined
  text fields with a floating label and an error line, the top app bar, the modal
  navigation drawer, and the snackbar.
- **Motion.** Moves between pages follow Material's transitions (top level,
  forward and backward, container transform), a press ripples from the pressed
  point, and a visitor's request for reduced motion is followed.
- **Content keys.** In `app.model.json` a call to action can say how its button
  looks, with a `button` key beside `ctaText`
  (`{ "variant": "tonal", "size": "md", "shape": "square" }`), and a field of the
  contact form can say `attrRequired`, `attrDisabled`, or `multiline`.

## Requirements

Node.js 18 or newer.

## Getting started

```bash
git clone https://github.com/spynejs/application-shell-material.git my-app
cd my-app
rm -rf .git && git init
npm install
npm start
```

`npm start` runs the webpack dev server with hot reload.

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | Development server with hot reload; debug on, with the CMS and the console |
| `npm run build` | Production build into `dist/`; debug off, no CMS and no console |
| `npm test` | Unit tests via Web Test Runner |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with autofix |
| `npm run format` | Prettier over `src/` |

Under `npm start`, ctrl+alt+p turns the CMS and the console off for the browser tab, and the same keys turn them on again.

## Structure

```
src/
  app/
    channels/      Channels — event flow and application state
    components/    ViewStreams — nav, pages, page items, UI elements
    traits/        SpyneTraits — reusable behaviour
  scss/            Styles, including the design system tokens
  static/          Data, fonts, and images
  index.js         Application entry: config, channel registration, root view
```

SpyneJS separates rendering (`ViewStream`), event flow (`Channel`), and
behaviour (`SpyneTrait`). Components are organised by those roles rather than by
feature.

## Content

Page content is read from `src/static/data/app.model.json` through a
`ChannelFetch`. Editing that file changes the rendered pages without touching
component code.

## Deployment

The build output in `dist/` is a static single-page application. All application
routes must resolve to `index.html`, and requests for static assets must be
served directly. See [HOSTING.md](HOSTING.md) for platform-specific
configuration.

## Images

The photographs in `src/static/imgs/` are placeholders from
[Pexels](https://www.pexels.com), provided under the
[Pexels License](https://www.pexels.com/license/). They are not covered by this
project's MIT license. If you keep them, you are responsible for following the
Pexels terms; if you replace them, remove the `photoCredit` entry from
`src/static/data/app.model.json` to drop the footer credit. See
[NOTICE.md](NOTICE.md) for details and photo credits.

## License

Source code: MIT — see [LICENSE](LICENSE). Photographs are excluded, and the
Material Design values and the typeface come under licenses of their own; see
[NOTICE.md](NOTICE.md).
