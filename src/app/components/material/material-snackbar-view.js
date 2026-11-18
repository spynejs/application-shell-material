import { ViewStream } from 'spyne';
import SnackbarTmpl from './templates/material-snackbar.tmpl.html';

// One snackbar. It is born from a SHOW on the Material channel and removes itself:
// when its time is up (HIDE), or when a newer snackbar is shown, since Material shows
// one at a time. The channel does not replay, so it never hears the SHOW that
// created it.
export class MaterialSnackbarView extends ViewStream {
  constructor(props = {}) {
    props.class = 'material-snackbar';
    props.channels = ['CHANNEL_MATERIAL'];
    props.template = SnackbarTmpl;
    super(props);
  }

  addActionListeners() {
    return [
      ['CHANNEL_MATERIAL_SNACKBAR_SHOW_EVENT', 'disposeViewStream'],
      ['CHANNEL_MATERIAL_SNACKBAR_HIDE_EVENT', 'disposeViewStream'],
    ];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {}
}
