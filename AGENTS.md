# AGENTS.md — application-shell

This is a SpyneJS application. **Before writing or modifying any SpyneJS code in this repo, read `node_modules/@spynejs/grammar/AGENTS.md`** — it is the working contract for the SpyneJS Grammar installed with this project (`@spynejs/grammar`, stackVersion v50-r12): the fetch discipline, the ambient rules, and the task-recognition table that routes a task to the cards and records that govern it. The Grammar itself lives under `node_modules/@spynejs/grammar/grammar/` — `trees.md` routes a task, `cards/` are the operations, `records/` are the constructions, `01-mental-model.md` is what kind of thing everything is; `manifest.json` at the package root is the machine-readable index.

If `node_modules/@spynejs/grammar` is missing, run `npm install` first — the Grammar is a declared devDependency, and SpyneJS code should not be authored without it.

## This repo specifically

- All page content lives in `src/static/data/app.model.json`; the route tree lives in `config.channels.ROUTE` in `src/index.js`. Adding a page is a data edit (see the Grammar's `author-app-model-node` card), not a new view class.
- `npm start` — dev server; `npm test` — web-test-runner suite; `npm run build` — production build.

## Material Design

This app is on the Material template: Google's Material Design 3 for the SpyneJS Application Shell. All of it is already in this repo, written as SpyneJS code. A component here is not something to import: it is plain markup with classes, drawn from `src/static/data/app.model.json`. This section says what there is and how to ask for it; the Grammar says how the code is written.

### What the template has

| Thing | How an app gets it | Where it is made |
|---|---|---|
| Button | a `button` key beside a call to action's `ctaText` (below) | `src/app/traits/utils/material-button-options.js` |
| Card | a page's sub-pages are drawn as cards; a card has no keys of its own | `src/app/components/page-items/cards-container-view.js` |
| Text field | an entry of the contact form's `formFields` (below) | `src/app/traits/form/form-contact-us-traits.js` |
| List, divider | a page item drawn from `timetable.tmpl.html` or `price-list.tmpl.html`: each of its `rows` or `items` is a list item; no keys of its own | `src/scss/03-components/material/_list.scss` |
| Icon | an `icon` key beside an item's words, in a page item drawn from `icon-grid.tmpl.html` (below) | `src/app/traits/utils/icon-shapes.js`, `src/scss/03-components/material/_icon.scss` |
| Snackbar | a view sends `CHANNEL_MATERIAL_SNACKBAR_REQUEST` with `{ message }` | `src/app/components/material/material-snackbar-host-view.js` |
| Top app bar | it is the app's header; its title is the model's `text.header` | `src/app/components/ui-elements/ui-header-view.js` |
| Navigation drawer | its links are the routes in `src/index.js`; it is there in a window under 840px | `src/app/components/ui-elements/ui-menu-drawer-view.js` |
| Page transitions | named from the route: `top-level`, `forward`, `backward`, `container-transform` | `src/app/traits/channel/channel-material-traits.js` |
| Ripple, reduced motion, breakpoints | every app has them; nothing asks for them | `src/app/traits/material/material-ripple-traits.js`, `src/scss/03-components/material/_motion.scss` |

Colour, type, shape, elevation and motion are Google's tokens, as custom properties that start `--md-sys-`, such as `--md-sys-color-primary` and `--md-sys-shape-corner-medium`. A model does not choose them; a style reads them. The Material styles are in `src/scss/03-components/material/`.

### The keys a model writes

A call to action takes a `button` key for its button's look. Every key of it can be left out, and so can `button`:

| Key of `button` | Values | Left out |
|---|---|---|
| `variant` | `filled`, `tonal`, `outlined`, `elevated`, `text` | `filled` |
| `size` | `xs`, `sm`, `md`, `lg`, `xl` | `sm` |
| `shape` | `round`, `square` | `round` |

```json
{ "ctaText": "Order ahead", "attrCtaHref": "/order", "button": { "variant": "tonal", "size": "md" } }
```

It is read in a page's `hero`, in a call-to-action banner, in each row of a split feature, and in the contact form's data, beside `formFields`. Write only what is not a default.

An entry of the contact form's `formFields` takes three keys of Material's, each `true` or left out:

| Key of an entry | `true` means |
|---|---|
| `attrRequired` | the field must be filled in |
| `attrDisabled` | the field is shown, but not to be used |
| `multiline` | several lines, a `<textarea>` |

An item of an icon grid names its icon with an `icon` key. The value is one of the names in `src/app/traits/utils/icon-shapes.js`: they are Google's Material Symbols names, such as `schedule`, `location_on` and `verified`. A name that is not there draws nothing.

```json
{ "icon": "schedule", "name": "Open late", "text": "Until 8pm on weekdays." }
```

The shape is put beside the name before the item renders, as `attrIconPath` (`pageItemCore$PlaceIcons` in `src/app/traits/page/page-item-core-traits.js`), and a template draws it as `<svg class="icon" viewBox="0 -960 960 960" aria-hidden="true"><path d="{{attrIconPath}}" /></svg>`. A model writes `icon` and never `attrIconPath`.

### In a view

Material's events go through one channel, `CHANNEL_MATERIAL`. Its file, `src/app/channels/channel-material.js`, says at its head what every action carries.

- `CHANNEL_MATERIAL_SNACKBAR_REQUEST`, sent by a view with `{ message }`: show a snackbar.
- `CHANNEL_MATERIAL_SCROLL_EVENT`, `{ scrolled }`: the page left its top, or came back to it.
- `CHANNEL_MATERIAL_BREAKPOINT_EVENT`, `{ breakpoint }`: the window entered `compact`, `medium`, `expanded`, `large` or `extra-large`.
- `CHANNEL_MATERIAL_DISMISS_EVENT`, `{ reason }`: whatever is open is to close.
- `CHANNEL_MATERIAL_PAGE_LEAVING_EVENT` and `CHANNEL_MATERIAL_PAGE_LEFT_EVENT`: a move between pages beginning and ending, with its transition.

### The rest: material.spynejs.com

Every component and feature has a page at **https://material.spynejs.com**, set out for agents: every key with an example to copy, the classes and custom properties, each action's payload, and the files and methods by name. **Before changing how one of the things above works, or writing a style that uses colour, type, shape, elevation or motion, read its page there.**

- `https://material.spynejs.com/llms.txt` is the index: every page, with one line on each. Start there.
- A page's Markdown is at its own address with `.md` added: `https://material.spynejs.com/components/buttons.md`. Fetch the `.md`: the site draws its pages in the browser, so a page's own address holds only a pointer to it.
- `https://material.spynejs.com/llms-full.txt` is every page in one file; `https://material.spynejs.com/material.json` is the same facts as data.

The site follows the template as it was last published. Where the site and this repo differ, this repo is what this app has.
