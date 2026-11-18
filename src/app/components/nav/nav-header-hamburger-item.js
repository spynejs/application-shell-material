import { ViewStream } from 'spyne';
import HamburgerTmpl from './templates/nav-header-hamburger-item.tmpl.html';
import { NavHeaderHamburgerItemTraits } from 'traits/nav/nav-header-hamburger-item-traits.js';

export class NavHeaderHamburgerItem extends ViewStream {
  constructor(props = {}) {
    props.id = 'menu_toggle';
    // A button, so the keyboard can reach it and assistive technology can name it.
    props.tagName = 'button';
    props.type = 'button';
    props['aria-label'] = 'Menu';
    props['aria-controls'] = 'menu-drawer';
    props['aria-expanded'] = 'false';
    props.dataset = {
      eventType: 'menuDrawer',
      isHamburger: 'true',
    };
    props.channels = ['CHANNEL_MENU_DRAWER'];
    props.traits = [NavHeaderHamburgerItemTraits];
    props.template = HamburgerTmpl;
    super(props);
  }

  addActionListeners() {
    return [
      [
        'CHANNEL_MENU_DRAWER_.*_EVENT',
        'navHeaderHamburgerItem$OnShowMenuDrawerEvent',
      ],
    ];
  }

  broadcastEvents() {
    return [['#menu_toggle', 'click']];
  }

  onRendered() {}
}
