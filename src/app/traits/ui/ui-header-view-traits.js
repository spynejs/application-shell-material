import { SpyneTrait } from 'spyne';
import { NavPrimaryView } from 'components/nav/nav-primary-view.js';
import { NavHeaderHamburgerItem } from 'components/nav/nav-header-hamburger-item.js';

export class UIHeaderViewTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'uiHeader$';

    super(context, traitPrefix);
  }

  static uiHeader$AddNavLinks(navLinks = []) {
    const data = navLinks.filter((o) => o.navLevel === 1);
    this.appendView(new NavPrimaryView({ data }), '.header-content');
  }

  static uiHeader$OnAppDataEvent(logoTxt = '') {
    this.props.el$('.branding h1 span').el.innerHTML = logoTxt;
  }

  static uiHeader$UIHeaderViewOnAppInitEvent(e) {
    const { initData } = e.payload;
    const { navLinks, header } = initData;
    this.uiHeader$AddNavLinks(navLinks);
    this.uiHeader$OnAppDataEvent(header);
  }

  // The header is a Material top app bar: its surface changes once the page has
  // scrolled under it. The state comes from the Material channel; the look is CSS.
  static uiHeader$OnScrollState(e) {
    const { scrolled } = e.payload;
    this.props.el$.toggleClass('is-scrolled', scrolled);
  }

  static uiHeader$UIHeaderViewOnRendered() {
    this.appendView(new NavHeaderHamburgerItem());
  }
}
