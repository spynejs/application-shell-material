import { SpyneTrait } from 'spyne';

export class UISkipLinkTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'uiSkipLink$';
    super(context, traitPrefix);
  }

  // The app's words have arrived. The link is there from the start, with words of
  // its own, so that it is first whenever the keyboard comes; a model that gives
  // it words has them put in here.
  static uiSkipLink$OnAppInitEvent(e) {
    const { skipLink } = e.payload.initData;

    if (typeof skipLink === 'string' && skipLink.trim() !== '') {
      this.props.el$('.skip-link__label').el.textContent = skipLink;
    }
  }
}
