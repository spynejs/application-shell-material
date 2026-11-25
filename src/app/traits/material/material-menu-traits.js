import { SpyneTrait } from 'spyne';

// A menu is the browser's own popover: a list of things to press that opens from
// a button. The browser opens it, closes it on a press outside it and on Escape,
// draws it over everything else, and gives the focus back to its button. All of
// that is markup (scss/03-components/material/_menu.scss).
//
// One thing the browser does not do: put the menu beside its button. A stylesheet
// cannot know where a button is, so the view that holds a menu measures, and says
// where the menu stands in custom properties on it; the styles do the rest.
//
// A view with a menu composes this trait, broadcasts the menu's toggle, and
// listens for it:
//
//   props.traits = [MaterialMenuTraits];
//   broadcastEvents()    ['.menu', 'toggle']
//   addActionListeners() ['CHANNEL_UI_TOGGLE_EVENT', 'materialMenu$OnToggle']
//
// A press on an item is the view's own to hear, as any press is.

// What is kept between a menu and the window's edge.
const FROM_EDGE = 8;

export class MaterialMenuTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'materialMenu$';
    super(context, traitPrefix);
  }

  /**
   * Where a menu stands, from where its button is. Numbers in, numbers out;
   * nothing is measured here.
   *
   *   button         its box in the window: { top, right, bottom, left }
   *   menu           its size with nothing holding it in: { width, height }
   *   window         { width, height }
   *   scroll         how far the page is scrolled: { x, y }
   *   held           the button stays where it is when the page scrolls (it is
   *                  in something fixed in place, such as the app bar)
   *   isRightToLeft  the page runs from the right, as in Arabic
   *
   * It opens under its button where it fits there, and over it where it fits
   * only there; where it fits neither way, on the side with more room, and
   * `room` is how tall it may then be. Its start is on the button's start where
   * it fits, and its end on the button's end where it does not.
   *
   * A menu whose button moves with the page is placed in the page, so that it
   * moves with its button; one whose button is held is placed in the window.
   * Of each pair, `top` and `bottom`, `left` and `right`, one is a distance and
   * the other is null.
   */
  static materialMenu$PlaceFor({
    button,
    menu,
    window: win,
    scroll = { x: 0, y: 0 },
    held = false,
    isRightToLeft = false,
  }) {
    const below = win.height - button.bottom - FROM_EDGE;
    const above = button.top - FROM_EDGE;
    const opensDown =
      menu.height <= below || (menu.height > above && below >= above);

    const fitsFromLeft = button.left + menu.width <= win.width - FROM_EDGE;
    const fitsFromRight = button.right - menu.width >= FROM_EDGE;
    const fromLeft = isRightToLeft
      ? !fitsFromRight && fitsFromLeft
      : fitsFromLeft || !fitsFromRight;

    // Held inside the window where the button is nearer its edge than a menu
    // may be, or the menu fits from neither side.
    const most = Math.max(win.width - FROM_EDGE - menu.width, FROM_EDGE);
    const within = (distance) => Math.min(Math.max(distance, FROM_EDGE), most);
    const moved = held ? { x: 0, y: 0 } : scroll;

    return {
      position: held ? 'fixed' : 'absolute',
      top: opensDown ? button.bottom + moved.y : null,
      bottom: opensDown ? null : win.height - button.top - moved.y,
      left: fromLeft ? within(button.left) + moved.x : null,
      right: fromLeft ? null : within(win.width - button.right) - moved.x,
      room: Math.max(opensDown ? below : above, 0),
    };
  }

  // Whether an element stays where it is when the page scrolls: it, or something
  // round it, is fixed in place or sticks.
  static materialMenu$IsHeldInPlace(el) {
    for (let node = el; node instanceof Element; node = node.parentElement) {
      if (['fixed', 'sticky'].includes(getComputedStyle(node).position)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Measures a menu and its button, and says on the menu where it stands. The
   * menu is measured with nothing holding it in, so what was said the last time
   * it was open is taken off first.
   */
  static materialMenu$Place(menu, button) {
    const { style } = menu;
    const root = document.documentElement;
    const length = (distance) => (distance === null ? 'auto' : `${distance}px`);

    style.removeProperty('--menu-room');

    const at = MaterialMenuTraits.materialMenu$PlaceFor({
      button: button.getBoundingClientRect(),
      menu: { width: menu.offsetWidth, height: menu.offsetHeight },
      // The page's own width, which is the window's less a scrollbar's room:
      // distances from the far side are counted from there.
      window: {
        width: root.getBoundingClientRect().width,
        height: root.clientHeight,
      },
      scroll: { x: window.scrollX, y: window.scrollY },
      held: MaterialMenuTraits.materialMenu$IsHeldInPlace(button),
      isRightToLeft: getComputedStyle(button).direction === 'rtl',
    });

    style.setProperty('--menu-position', at.position);
    style.setProperty('--menu-top', length(at.top));
    style.setProperty('--menu-bottom', length(at.bottom));
    style.setProperty('--menu-left', length(at.left));
    style.setProperty('--menu-right', length(at.right));
    style.setProperty('--menu-room', length(at.room));
  }

  /**
   * A menu has opened or closed. Every view hears every menu's: only a menu of
   * this view's is taken. An open one is placed beside the button that opens it,
   * which is the one in this view that names the menu in `popovertarget` and is
   * not one of its own items. The styles do not show a menu for the moment it
   * waits to be placed, so it is never seen where the browser first puts it.
   */
  static materialMenu$OnToggle(e) {
    const menu = e.srcElement.el;

    if (!this.props.el.contains(menu)) {
      return;
    }

    const isOpen = e.event.newState === 'open';
    const button = this.props.el.querySelector(
      `[popovertarget="${menu.id}"]:not([popovertargetaction="hide"])`,
    );

    if (isOpen && button !== null) {
      MaterialMenuTraits.materialMenu$Place(menu, button);
    }

    this.props.el$(`[id="${menu.id}"]`).toggleClass('is-placed', isOpen);
  }
}
