import { SpyneTrait } from 'spyne';

// What ripples: buttons, cards that are links, the header's and the drawer's
// navigation links, the two icon buttons, a tab, and the FAB. The styles of each
// draw the ripple (elements/_buttons.scss, material/_cards.scss,
// material/_navigation.scss, ui/menu-drawer.scss, material/_tabs.scss,
// material/_fab.scss); this list and those styles are kept in step by hand.
const RIPPLING = [
  '.btn',
  'a.page-card',
  '.site-nav a.nav',
  '#menu-drawer a.nav',
  '.theme-toggle',
  '#menu_toggle',
  '.tab',
  '.fab',
].join(', ');

// The element that ripples for an event's target: the target itself, or the
// rippling element it is inside. null when there is none.
export const rippling = (target) => target?.closest?.(RIPPLING) ?? null;

export class MaterialRippleTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'materialRipple$';
    super(context, traitPrefix);
  }

  /**
   * The pressed point, in the element's own pixels from its top-left corner.
   * An element may be drawn at another size than it is laid out at (the menu
   * toggle is scaled), so the point is brought back to the laid-out size.
   */
  static materialRipple$OnPointerDown(e) {
    const { target, clientX, clientY } = e.event;
    const el = rippling(target);
    const drawn = el.getBoundingClientRect();
    const x = (clientX - drawn.left) * (el.offsetWidth / drawn.width);
    const y = (clientY - drawn.top) * (el.offsetHeight / drawn.height);

    el.style.setProperty('--ripple-x', `${Math.round(x)}px`);
    el.style.setProperty('--ripple-y', `${Math.round(y)}px`);
  }

  // A press from the keyboard has no point: the ripple starts in the middle,
  // which is what the styles do when nothing is written.
  static materialRipple$OnKeyPress(e) {
    const el = rippling(e.event.target);

    el.style.removeProperty('--ripple-x');
    el.style.removeProperty('--ripple-y');
  }
}
