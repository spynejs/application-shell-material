import { ViewStream } from 'spyne';
import { MaterialSnackbarTraits } from 'traits/material/material-snackbar-traits.js';

// Where snackbars appear: one persistent, empty region at the bottom of the app. It
// adds a snackbar when the Material channel shows one; each snackbar removes itself.
// The region is a live region, so assistive technology announces a snackbar's text
// without moving focus.
export class MaterialSnackbarHostView extends ViewStream {
  constructor(props = {}) {
    props.id = 'material-snackbar-host';
    props.role = 'status';
    props['aria-live'] = 'polite';
    props.traits = [MaterialSnackbarTraits];
    props.channels = ['CHANNEL_MATERIAL'];
    super(props);
  }

  addActionListeners() {
    return [
      ['CHANNEL_MATERIAL_SNACKBAR_SHOW_EVENT', 'materialSnackbar$OnShow'],
    ];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {}
}
