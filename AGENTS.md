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
| Text field | an entry of the contact form's `formFields` (below); anywhere else, any `<input>` or `<textarea>` in a template. It is Material's outlined field, or the filled one where what holds it says so; a date or a time is a text field of that type; it can have supporting text and an icon at its start or its end | `src/app/traits/form/form-contact-us-traits.js`, `src/scss/03-components/material/_text-fields.scss`, `_filled-text-field.scss`, `_field-extras.scss` |
| Select | in the contact form, an entry of `formFields` with `kind: "select"` (below); anywhere else, the browser's own `<select>` in a template. The field is Material's; the list that opens is the device's own | `src/scss/03-components/material/_select.scss` |
| Slider | in the contact form, an entry of `formFields` with `kind: "slider"` (below); anywhere else, the browser's own `<input type="range">` in a view that says where its handle is (below, "In a view") | `src/scss/03-components/material/_slider.scss`, `src/app/traits/material/material-slider-traits.js`, `src/app/components/page-items/sliders-view.js` |
| Checkbox, radio button, switch | in the contact form, an entry of `formFields` with a `kind` (below); anywhere else, the browser's own control written in a template (below, "In a view"). The control's type is what draws it: no class asks for Material's | `src/scss/03-components/material/_checkbox.scss`, `_radio.scss`, `_switch.scss`, and `_selection.scss` for a control's row and a set |
| List, divider | a page item drawn from `timetable.tmpl.html` or `price-list.tmpl.html`: each of its `rows` or `items` is a list item; no keys of its own | `src/scss/03-components/material/_list.scss` |
| Tabs | lists of one kind (price lists, or timetables) that are next to each other on a page and give the same `tabGroup` (below): a row of tabs over them, and one list shown at a time | `src/app/components/page-items/tabs-view.js`, `src/app/traits/utils/tab-sets.js`, `src/scss/03-components/material/_tabs.scss` |
| Icon | an `icon` key beside an item's words, in a page item drawn from `icon-grid.tmpl.html` (below) | `src/app/traits/utils/icon-shapes.js`, `src/scss/03-components/material/_icon.scss` |
| Snackbar | a view sends `CHANNEL_MATERIAL_SNACKBAR_REQUEST` with `{ message }` | `src/app/components/material/material-snackbar-host-view.js` |
| FAB | the key `fab` at the root of the model (below): one floating action button, at the bottom of every page once the page is scrolled, leading to the app's contact page | `src/app/components/material/material-fab-host-view.js`, `src/app/traits/utils/fab.js`, `src/scss/03-components/material/_fab.scss` |
| Tooltip | a control that shows no words asks for one in its markup, with `data-tooltip="true"` beside its `aria-label` (below): the label is shown under the control, to a pointer that rests on it and to the keyboard's focus; the menu button and the light and dark switch have one | `src/app/components/material/material-tooltip-host-view.js`, `src/app/traits/material/material-tooltip-traits.js`, `src/scss/03-components/material/_tooltip.scss` |
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

An entry of the contact form's `formFields` is a text field, or with a `kind` it is another control. It takes five keys that say which control it is and what state it starts in, and every one can be left out:

| Key of an entry | Value | Left out |
|---|---|---|
| `kind` | `checkbox`, `switch`, `radio`, `select` or `slider` | a text field |
| `attrRequired` | `true`: the field must be filled in, the checkbox ticked, one of the set or of the select chosen | it need not be. A switch and a slider are never required: off is an answer, and so is any place along a slider |
| `attrDisabled` | `true`: shown, but not to be used | it can be used |
| `multiline` | `true`: a text field of several lines, a `<textarea>` | one line |
| `attrChecked` | `true`: a checkbox or a switch that starts on | it starts off. A checkbox that must be ticked always starts off |

```json
{ "kind": "checkbox", "attrId": "contact-copy", "label": "Send me a copy", "attrName": "copy" }
```

A `radio` is a set of radio buttons under the entry's `label`, one for each entry of its `options`. A `select` takes `options` the same way, and draws one field with the list the device opens for it; its first option is an empty one, so that nothing is chosen until the visitor chooses. An option has a `label` and an `attrValue`, and the one that starts chosen has `attrChecked`:

```json
{ "kind": "radio", "attrId": "contact-reason", "label": "What is it about?", "attrName": "reason", "attrRequired": true, "options": [{ "label": "A booking", "attrValue": "booking" }, { "label": "A question", "attrValue": "question" }] }
```

Other keys an entry takes, by what it is:

| Other key | On | Value |
|---|---|---|
| `attrType` | a text field | the input's type. `date`, `time`, `datetime-local`, `month` or `week` makes it a date or a time, with the browser's own picker |
| `supportingText` | a text field or a select | a line of words under the field. It gives way to the error line |
| `leadingIcon`, `trailingIcon` | a text field or a select | a name in `src/app/traits/utils/icon-shapes.js`: an icon at the field's start, or at its end. Not on a date or a time, where the browser draws its own at the end |
| `attrMin`, `attrMax`, `attrStep`, `attrValue` | a slider | its two ends, its step and where it starts. Left out: 0, 100, 1 and the middle |

```json
{ "kind": "select", "attrId": "contact-heard", "label": "How did you hear of us?", "attrName": "heard", "options": [{ "label": "From a friend", "attrValue": "friend" }, { "label": "A search", "attrValue": "search" }] }
```

```json
{ "kind": "slider", "attrId": "contact-party", "label": "How many are coming?", "attrName": "party", "attrMin": 1, "attrMax": 12, "attrValue": 2 }
```

The form itself takes one key beside `formFields`: `fieldStyle`, which is `filled` for Material's filled text fields. Left out, or `outlined`, its fields are outlined. Material advises one of the two to a form, not a mix, so the key is the form's and not a field's.

A slider shows no number: where one matters, say the range in the field's `label`. The words of a select's options cannot be clicked to edit in the CMS, since an option holds text and nothing else; change them in the model. Every other label can be.

Every entry has an `attrId` that no other on the page has, a `label`, and an `attrName`. A checkbox or a switch that is on sends `on`, or its `attrValue` where it has one; one that is off sends nothing. A field that is required and left empty shows the browser's own words under it when the form is sent, in the visitor's language. **The form's sending names what it sends**: `contactUs$SendFormData` in `src/app/traits/form/form-contact-us-traits.js` takes the name, the email and the message. A field you add is held by the form and is not sent until you add its name there. `src/app/components/page-items/templates/forms-demo.tmpl.html` shows every control in every state.

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

A control that shows no words, only an icon, gets a tooltip in its own markup. No key in a model asks for one. Two things are written, both in the view that holds the control:

```html
<button id="share" aria-label="Share" data-tooltip="true">…</button>
```

```js
broadcastEvents() {
  return [
    ['#share', 'click'],
    ['[data-tooltip]', 'pointerenter'],
    ['[data-tooltip]', 'pointerleave'],
    ['[data-tooltip]', 'focus'],
    ['[data-tooltip]', 'blur'],
  ];
}
```

The tooltip's words are the control's `aria-label`, so the name is written once. The four events are how the tooltip's region hears the pointer and the focus come and go: a control in a view that does not broadcast them gets no tooltip. Do not add a `title` as well, and do not give a tooltip to a control that already shows its words. It is Material's plain tooltip: it shows after the pointer has rested half a second, or at once for the keyboard's focus, stays 1.5 seconds after the pointer leaves, and stands under the control, which is where Material puts it in an app bar; above a control is not built. It is placed when the pointer or the focus arrives and does not follow a control that then moves, as one in a page does when the page is scrolled: the two that have one are in the app bar, which stays where it is. A finger's touch shows none.

A checkbox, a radio button or a switch outside the contact form is the browser's own control, written in the template of the view that holds it. Nothing asks for Material's drawing: an `<input type="checkbox">`, an `<input type="radio">` and an `<input type="checkbox" role="switch">` are drawn as Material's wherever they are. A control and its words are one row, and a set is under one label:

```html
<label class="selection">
  <input type="checkbox" name="updates" />
  <span>Send me updates</span>
</label>

<div class="selection-group" role="radiogroup" aria-labelledby="size-label">
  <span class="selection-group__label" id="size-label">Size</span>
  <div class="selection-group__options">
    <label class="selection">
      <input type="radio" name="size" value="small" checked />
      <span>Small</span>
    </label>
    <label class="selection">
      <input type="radio" name="size" value="large" />
      <span>Large</span>
    </label>
  </div>
</div>
```

The states are the control's own attributes and nothing else: `checked`, `disabled`, `required`. Radio buttons of one `name` are one choice, and the arrow keys move between them. A row's label wraps its control, or is a `<label for>` beside it; either way the control is drawn first. `selection--trailing` beside `selection` puts the control at the row's far end, as a setting in a list has it; `selection-group--row` beside `selection-group` puts a set's options side by side. A control that is wrong takes the error color from the browser's own `:user-invalid`, or from `aria-invalid="true"` where your code decides; `selection-group__error` is the line of words under a set. To hear a control change, declare its `input` in `broadcastEvents`, as `['input[type="checkbox"]', 'input']`, and read `e.srcElement.el.checked` in the listener for `CHANNEL_UI_INPUT_EVENT`. Not drawn: a checkbox's third state, and a switch's icons.

A text field, a select, a date and a time outside the contact form are the browser's own controls too, and each is drawn as Material's outlined field wherever it is. A field with a label that floats, supporting text or an icon is written as the contact form writes one, in an element of the class `contact-us__field`:

```html
<div class="fields-filled">
  <div class="contact-us__field">
    <label for="reply-to">Reply to</label>
    <svg class="icon contact-us__field-icon contact-us__field-icon--leading" viewBox="0 -960 960 960" aria-hidden="true">
      <path d="{{attrIconPath}}" />
    </svg>
    <input id="reply-to" name="replyTo" type="email" placeholder=" " />
    <p class="contact-us__field-support">We reply to this address.</p>
  </div>
  <div class="contact-us__field">
    <label for="size">Size</label>
    <select id="size" name="size">
      <option value=""></option>
      <option value="small">Small</option>
    </select>
  </div>
</div>
```

`fields-filled` on anything that holds fields makes them filled; without it they are outlined. A text field needs a `placeholder`, even one that is a space: the label rests in the field while the placeholder is shown, and rises when the field is in focus or holds something. A select needs its empty first option for the same reason. An icon's place is its class, `contact-us__field-icon--leading` or `--trailing`, and the field makes room for it by holding it. Write an option's words with the token that keeps the CMS from wrapping them, `{{%label%}}`.

A slider is the one control here that needs a line of script. A stylesheet cannot know where a slider's handle is, so the view that holds one says so, and the track is filled from that:

```js
props.traits = [MaterialSliderTraits];

addActionListeners() {
  return [['CHANNEL_UI_INPUT_EVENT', 'materialSlider$OnInput']];
}

broadcastEvents() {
  return [['input[type="range"]', 'input']];
}

onRendered() {
  this.materialSlider$FillAll();
}
```

A page item that holds sliders and needs nothing else asks for this with `"viewClass": "SlidersView"`. A view that already listens for `CHANNEL_UI_INPUT_EVENT` takes one listener for it, so it calls `MaterialSliderTraits.materialSlider$Fill(e.srcElement.el)` from that one, as the contact form does. Without any of it a slider still works, and its track stays filled to the middle. A slider's label is a `<label for>` before it, the two in an element of the class `slider-field`. Not drawn: the label that shows a slider's value while it is dragged, its tick marks, a slider with two handles, Material's own menu for a select, and its own calendar and clock.

A control with a tooltip sends more than clicks on `CHANNEL_UI`. Anything that listens for that control there must name the click: a listener on `CHANNEL_UI_CLICK_EVENT`, or a `ChannelPayloadFilter` with `action: 'CHANNEL_UI_CLICK_EVENT'`. One that takes every event from the control would act when the pointer only comes to rest on it.

### Adding a Material component the template does not have

The template has no chips, dialog, menu, search, badge, sheet, progress indicator, carousel or data table. Google's values for every one of them are already installed: `@material/web` is a dependency for its design tokens, and `node_modules/@material/web/tokens/versions/latest/sass/` holds a file for each, such as `_md-comp-filter-chip.scss` and `_md-comp-dialog.scss`. Do not import Google's web components from that package: a component here is plain markup and SpyneJS code, drawn from Google's values.

A component is four parts, and each has one place:

1. **Its values**, in `src/scss/00-spynejs-design-system/tokens/_material.scss`. `@use` the component's token file and the `-meta` file beside it, and add a map made with `_component(...)`, as `$navigation-bar` is. A size comes out as a number, and a color or a type style as a reference to the theme's custom property, so the component follows the theme and dark without a line of its own.
2. **Its styles**, in a file of its own in `src/scss/03-components/material/`: one mixin, `styles`, with every rule under `main#app`, included in `_index.scss` beside it. Read every size and color from the map. Where the tokens say nothing, follow the component's guidelines at m3.material.io and say so in a comment. The three states are a layer in the content's color: under the pointer, in focus, pressed. `_ripple.scss` draws the press and `_focus.scss` the keyboard's ring; with reduced motion asked for, nothing moves.
3. **Its markup and behavior**, written by the Grammar. Content a model writes is a page item: a template in `src/app/components/page-items/templates/`, which an entry of a page's `pageItems` names in `props.template` (`icon-grid.tmpl.html`). It needs no class of its own: its `viewClass` is `ViewStream`. A part of the app's frame is a ViewStream with a trait, as the navigation bar is. Clicks are declared in `broadcastEvents`, and what must be heard elsewhere goes through a channel.
4. **Its record**: a row in the table above, the keys a model writes for it, and a test for anything it works out.

The navigation bar, part by part: `$navigation-bar` in the tokens file; `src/scss/03-components/material/_navigation-bar.scss`; `src/app/components/nav/nav-destinations-view.js` with `src/app/traits/nav/nav-destinations-view-traits.js` and the data shaped in `src/app/traits/utils/nav-icons.js`; its row, the keys `navIcon` and `navLabel`, and `src/tests/unit-tests/traits/nav-icons.test.js`.

Six things that are not obvious:

- **A template is cleaned before it is drawn.** An SVG `<use>` does not survive, so an icon is its shape in place: `<svg class="icon" viewBox="0 -960 960 960" aria-hidden="true"><path d="{{attrIconPath}}" /></svg>`. A new icon is a new entry in `src/app/traits/utils/icon-shapes.js`; its head says how to add one.
- **A `<button>` written in a template string inside `app.model.json` does not survive either.** Put markup that has one in a template file.
- **A template takes a loop inside a loop, and no deeper**, and a section counts as a level. A list inside a section inside a loop draws every case of it, empty. Give the inner list a template of its own and put it in once the view has rendered, as the contact form does a set of radio buttons (`contactUs$AddOptions`, `contact-us-options.tmpl.html`).
- **Shape a model's data in place.** A trait that gets data ready for a template takes its own copy with `safeClone` and adds keys to the entries it was given, as `contactUs$ShapeData` does. An entry made anew, `{ label: option.label }`, holds the same words and draws the same, and the CMS can no longer be clicked to edit them: it knows a word by what it has put on the entry.
- **Which layout a window gets is a media query**, and a count or a state the styles need is an attribute on an element. The bar is a bar, a rail, or not there, with no script listening to the window.
- **Check it in light and in dark, at 375px, 700px and 1200px**, then run `npm run lint`, `npm test` and `npm run build`.

### The rest: material.spynejs.com

Every component and feature has a page at **https://material.spynejs.com**, set out for agents: every key with an example to copy, the classes and custom properties, each action's payload, and the files and methods by name. **Before changing how one of the things above works, or writing a style that uses colour, type, shape, elevation or motion, read its page there.**

- `https://material.spynejs.com/llms.txt` is the index: every page, with one line on each. Start there.
- A page's Markdown is at its own address with `.md` added: `https://material.spynejs.com/components/buttons.md`. Fetch the `.md`: the site draws its pages in the browser, so a page's own address holds only a pointer to it.
- `https://material.spynejs.com/llms-full.txt` is every page in one file; `https://material.spynejs.com/material.json` is the same facts as data.

The site follows the template as it was last published. Where the site and this repo differ, this repo is what this app has.
