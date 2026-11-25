import { ViewStream } from 'spyne';
import { MaterialDialogHostTraits } from 'traits/material/material-dialog-host-traits.js';

// Where the app's dialog appears: one persistent, empty region. It adds a dialog
// when the Material channel shows one; each dialog removes itself when it is
// answered. The region takes no room: an open dialog is drawn by the browser over
// the whole window, wherever it is in the page.
//
// A view asks for a dialog with a request on the Material channel, and hears the
// answer there (channels/channel-material.js):
//
//   this.sendInfoToChannel('CHANNEL_MATERIAL', { name, headline, text,
//     confirmLabel, dismissLabel }, 'CHANNEL_MATERIAL_DIALOG_REQUEST');
//
//   ['CHANNEL_MATERIAL_DIALOG_ANSWER_EVENT', 'myView$OnAnswer', ownName]
//
// The dialog does nothing but ask: what an answer means is the asking view's.
export class MaterialDialogHostView extends ViewStream {
  constructor(props = {}) {
    props.id = 'material-dialog-host';
    props.traits = [MaterialDialogHostTraits];
    props.channels = ['CHANNEL_MATERIAL'];
    super(props);
  }

  addActionListeners() {
    return [
      ['CHANNEL_MATERIAL_DIALOG_SHOW_EVENT', 'materialDialogHost$OnShow'],
    ];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {}
}
