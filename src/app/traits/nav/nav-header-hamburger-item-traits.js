import { SpyneTrait } from 'spyne';

export class NavHeaderHamburgerItemTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'navHeaderHamburgerItem$';
    super(context, traitPrefix);
  }

  static navHeaderHamburgerItem$OnShowMenuDrawerEvent(e) {
    const { action } = e;
    const isActiveBurger = action === 'CHANNEL_MENU_DRAWER__SHOW_EVENT';
    this.props.el$.toggleClass('open', isActiveBurger);
    this.props.el.setAttribute('aria-expanded', String(isActiveBurger));

    // The channel sends HIDE only when the drawer was open, so focus comes back
    // here exactly once per close.
    if (action === 'CHANNEL_MENU_DRAWER__HIDE_EVENT') {
      this.props.el.focus();
    }
  }
}
