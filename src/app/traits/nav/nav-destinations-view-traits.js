import { SpyneTrait } from 'spyne';

export class NavDestinationsViewTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'navDestinations$';
    super(context, traitPrefix);
  }

  /**
   * Marks the destination of that page as the one you are on: the class the
   * styles read, and `aria-current` for assistive technology. A page under a
   * destination (a sub-page) keeps its destination marked; a page that is no
   * destination (a 404) leaves none marked.
   */
  static navDestinations$MarkSelected(pageId = this.props.pageId) {
    const destinations$ = this.props.el$('a.nav-destination');

    destinations$.setActiveItem('selected', `a[data-page-id='${pageId}']`);
    destinations$.els.forEach((el) => {
      if (el.dataset.pageId === pageId) {
        el.setAttribute('aria-current', 'page');
      } else {
        el.removeAttribute('aria-current');
      }
    });
  }

  static navDestinations$OnPageEvent(e) {
    const { pageId } = e.payload;

    this.navDestinations$MarkSelected(pageId);
  }
}
