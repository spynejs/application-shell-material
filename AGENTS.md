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
| Tabs | lists of one kind (price lists, or timetables) that are next to each other on a page and give the same `tabGroup` (below): a row of tabs over them, and one list shown at a time | `src/app/components/page-items/tabs-view.js`, `src/app/traits/utils/tab-sets.js`, `src/scss/03-components/material/_tabs.scss` |
| Icon | an `icon` key beside an item's words, in a page item drawn from `icon-grid.tmpl.html` (below) | `src/app/traits/utils/icon-shapes.js`, `src/scss/03-components/material/_icon.scss` |
| Snackbar | a view sends `CHANNEL_MATERIAL_SNACKBAR_REQUEST` with `{ message }` | `src/app/components/material/material-snackbar-host-view.js` |
| FAB | the key `fab` at the root of the model (below): one floating action button, at the bottom of every page once the page is scrolled, leading to the app's contact page | `src/app/components/material/material-fab-host-view.js`, `src/app/traits/utils/fab.js`, `src/scss/03-components/material/_fab.scss` |
| Top app bar | it is the app's header; its title is the model's `text.header`; under 840px it holds the menu button, the title and the light and dark switch | `src/app/components/ui-elements/ui-header-view.js` |
| Navigation drawer | its links are the routes in `src/index.js`; it is there in a window under 840px | `src/app/components/ui-elements/ui-menu-drawer-view.js` |
| Navigation bar | its destinations are the top-level routes in `src/index.js`; it is there in a window under 600px, for an app with three to five of them; a top-level page gives its destination an icon and a label with `navIcon` and `navLabel` (below) | `src/app/components/nav/nav-destinations-view.js`, `src/scss/03-components/material/_navigation-bar.scss` |
| Navigation rail | the same destinations, down the leading edge of a window from 600 to 839px, for an app with three to seven of them; it has no keys of its own | `src/app/components/nav/nav-destinations-view.js`, `src/scss/03-components/material/_navigation-rail.scss` |
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

A top-level page takes two keys for its destination in the navigation bar and rail, both of which can be left out:

| Key of a top-level page | Value | Left out |
|---|---|---|
| `navIcon` | a name in `src/app/traits/utils/icon-shapes.js` | the icon of the page's `pageType` (`NAV_ICON_OF_KIND` in `src/app/traits/utils/nav-icons.js`), or `info` |
| `navLabel` | the destination's words, one or two | the route's key, as a sentence: `page-view` reads "Page view" |

```json
{ "pageId": "classes", "pageType": "list", "navIcon": "fitness_center", "navLabel": "Classes" }
```

The destination you are on draws the icon's filled shape, where the app has one (`src/app/traits/utils/icon-shapes-filled.js`). An app with two top-level pages, or more than five, has no bar, and one with two, or more than seven, has no rail: Material gives a bar to three to five destinations and a rail to three to seven. The menu button and the drawer are there at every width under 840px.

A price list or a timetable takes two keys for tabs, in its `props.data` beside its `title`. Both can be left out:

| Key of a list's data | Value | Left out |
|---|---|---|
| `tabGroup` | a word, the same on every list of the set | the list is drawn by itself, as a page item is |
| `tabLabel` | the words on the list's tab, one or two | the list's `title` |

```json
{ "template": "price-list.tmpl.html", "data": { "title": "Coffee and drinks", "tabLabel": "Drinks", "tabGroup": "menu", "items": [] } }
```

A set is two or more lists of one kind, next to each other in a page's `pageItems`, with the same word: a price list and a timetable do not make one, and neither do two lists with another item between them. The first list is shown when the page opens. Under its tab a list does not repeat its title. To take a list out of its set, remove its `tabGroup`; to have two lists one under another, give them none. Material advises no more than four tabs; with more, or with long labels, the row scrolls sideways and no label is cut. `TAB_TEMPLATES` in `src/app/traits/utils/tab-sets.js` names the templates that may be a set.

An app takes one key, at the root of its model, for a floating action button. It can be left out, and so can every key of it but its words:

| Key of `fab` | Value | Left out |
|---|---|---|
| `ctaText` | the FAB's words, one or two | no FAB |
| `icon` | a name in `src/app/traits/utils/icon-shapes.js` | `mail` |
| `attrPageId`, `attrTopicId` | the page it leads to, by the route's ids | the page that holds the contact form |

```json
{ "fab": { "ctaText": "Book", "icon": "calendar_month" } }
```

The FAB is a call to action, and its keys are a call to action's: with no page named it leads where a hero's button leads, to the page that holds the contact form (`src/app/traits/utils/call-to-action-routes.js`). It is Material's extended FAB: an icon, drawn filled, and words. It is not shown at the top of a page, where the hero's own button is, and comes in once the page is scrolled; it is never shown on the page it leads to. An app has one, or none: an app with no `fab`, or with no contact form and no page named, has none. To take it away, remove the key.

### In a view

Material's events go through one channel, `CHANNEL_MATERIAL`. Its file, `src/app/channels/channel-material.js`, says at its head what every action carries.

- `CHANNEL_MATERIAL_SNACKBAR_REQUEST`, sent by a view with `{ message }`: show a snackbar.
- `CHANNEL_MATERIAL_SCROLL_EVENT`, `{ scrolled }`: the page left its top, or came back to it.
- `CHANNEL_MATERIAL_BREAKPOINT_EVENT`, `{ breakpoint }`: the window entered `compact`, `medium`, `expanded`, `large` or `extra-large`.
- `CHANNEL_MATERIAL_DISMISS_EVENT`, `{ reason }`: whatever is open is to close.
- `CHANNEL_MATERIAL_PAGE_LEAVING_EVENT` and `CHANNEL_MATERIAL_PAGE_LEFT_EVENT`: a move between pages beginning and ending, with its transition.

### Adding a Material component the template does not have

The template builds a component when a page uses it. It has no chips, dialog, switch, checkbox, radio button, slider, menu, search, badge, tooltip, sheet, progress indicator, carousel or data table. Google's values for every one of them are already installed: `@material/web` is a dependency for its design tokens, and `node_modules/@material/web/tokens/versions/latest/sass/` holds a file for each, such as `_md-comp-filter-chip.scss` and `_md-comp-switch.scss`. Do not import Google's web components from that package: a component here is plain markup and SpyneJS code, drawn from Google's values.

A component is four parts, and each has one place:

1. **Its values**, in `src/scss/00-spynejs-design-system/tokens/_material.scss`. `@use` the component's token file and the `-meta` file beside it, and add a map made with `_component(...)`, as `$navigation-bar` is. A size comes out as a number, and a color or a type style as a reference to the theme's custom property, so the component follows the theme and dark without a line of its own.
2. **Its styles**, in a file of its own in `src/scss/03-components/material/`: one mixin, `styles`, with every rule under `main#app`, included in `_index.scss` beside it. Read every size and color from the map. Where the tokens say nothing, follow the component's guidelines at m3.material.io and say so in a comment. The three states are a layer in the content's color: under the pointer, in focus, pressed. `_ripple.scss` draws the press and `_focus.scss` the keyboard's ring; with reduced motion asked for, nothing moves.
3. **Its markup and behavior**, written by the Grammar. Content a model writes is a page item: a template in `src/app/components/page-items/templates/`, which an entry of a page's `pageItems` names in `props.template` (`icon-grid.tmpl.html`). It needs no class of its own: its `viewClass` is `ViewStream`. A part of the app's frame is a ViewStream with a trait, as the navigation bar is. Clicks are declared in `broadcastEvents`, and what must be heard elsewhere goes through a channel.
4. **Its record**: a row in the table above, the keys a model writes for it, and a test for anything it works out.

The navigation bar, part by part: `$navigation-bar` in the tokens file; `src/scss/03-components/material/_navigation-bar.scss`; `src/app/components/nav/nav-destinations-view.js` with `src/app/traits/nav/nav-destinations-view-traits.js` and the data shaped in `src/app/traits/utils/nav-icons.js`; its row, the keys `navIcon` and `navLabel`, and `src/tests/unit-tests/traits/nav-icons.test.js`.

Four things that are not obvious:

- **A template is cleaned before it is drawn.** An SVG `<use>` does not survive, so an icon is its shape in place: `<svg class="icon" viewBox="0 -960 960 960" aria-hidden="true"><path d="{{attrIconPath}}" /></svg>`. A new icon is a new entry in `src/app/traits/utils/icon-shapes.js`; its head says how to add one.
- **A `<button>` written in a template string inside `app.model.json` does not survive either.** Put markup that has one in a template file.
- **Which layout a window gets is a media query**, and a count or a state the styles need is an attribute on an element. The bar is a bar, a rail, or not there, with no script listening to the window.
- **Check it in light and in dark, at 375px, 700px and 1200px**, then run `npm run lint`, `npm test` and `npm run build`.

### The rest: material.spynejs.com

Every component and feature has a page at **https://material.spynejs.com**, set out for agents: every key with an example to copy, the classes and custom properties, each action's payload, and the files and methods by name. **Before changing how one of the things above works, or writing a style that uses colour, type, shape, elevation or motion, read its page there.**

- `https://material.spynejs.com/llms.txt` is the index: every page, with one line on each. Start there.
- A page's Markdown is at its own address with `.md` added: `https://material.spynejs.com/components/buttons.md`. Fetch the `.md`: the site draws its pages in the browser, so a page's own address holds only a pointer to it.
- `https://material.spynejs.com/llms-full.txt` is every page in one file; `https://material.spynejs.com/material.json` is the same facts as data.

The site follows the template as it was last published. Where the site and this repo differ, this repo is what this app has.
