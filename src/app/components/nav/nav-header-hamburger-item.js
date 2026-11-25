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
    // `tooltip`: it shows no words, so its name is shown as a tooltip
    // (material/material-tooltip-host-view.js).
    props.dataset = {
      eventType: 'menuDrawer',
      isHamburger: 'true',
      tooltip: 'true',
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
    // The click opens and closes the drawer. The other four are for the
    // tooltip: when the pointer and the focus come and go.
    return [
      ['#menu_toggle', 'click'],
      ['#menu_toggle', 'pointerenter'],
      ['#menu_toggle', 'pointerleave'],
      ['#menu_toggle', 'focus'],
      ['#menu_toggle', 'blur'],
    ];
  }

  onRendered() {}
}
