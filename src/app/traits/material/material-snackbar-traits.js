import { SpyneTrait } from 'spyne';
import { MaterialSnackbarView } from 'components/material/material-snackbar-view.js';

export class MaterialSnackbarTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'materialSnackbar$';
    super(context, traitPrefix);
  }

  // The host adds the snackbar and keeps no handle on it; the snackbar's own
  // listeners take it away.
  static materialSnackbar$OnShow(e) {
    const { message } = e.payload;
    this.appendView(new MaterialSnackbarView({ data: { message } }));
  }
}
