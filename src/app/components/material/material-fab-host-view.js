import { ViewStream } from 'spyne';
import { MaterialFabTraits } from 'traits/material/material-fab-traits.js';

// Where the app's floating action button stands: one persistent, empty region at
// the bottom of the app, at the trailing edge. It is there from the start, so that
// it knows whether the page is scrolled before there is a FAB to show. When the app
// has its data it adds the FAB, where the model asks for one (traits/utils/fab.js:
// the key `fab` at the model's root).
//
// It says two things about the moment, as classes the styles read
// (scss/03-components/material/_fab.scss): `is-scrolled`, the page has left its top;
// and `is-own-page`, the page on screen is the one the FAB leads to. The FAB is
// shown when the first is so and the second is not.
export class MaterialFabHostView extends ViewStream {
  constructor(props = {}) {
    props.id = 'material-fab-host';
    props.traits = [MaterialFabTraits];
    props.channels = ['CHANNEL_APP', 'CHANNEL_MATERIAL'];
    super(props);
  }

  addActionListeners() {
    return [
      ['CHANNEL_APP_INIT_EVENT', 'materialFab$OnAppInit'],
      ['CHANNEL_APP_PAGE_DATA_EVENT', 'materialFab$OnPage'],
      ['CHANNEL_MATERIAL_SCROLL_EVENT', 'materialFab$OnScroll'],
    ];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {}
}
