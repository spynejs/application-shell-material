import { SpyneTrait } from 'spyne';
import { NavBreadcrumbContainer } from 'components/nav/nav-breadcrumb-container.js';
import { Page404View } from 'components/pages/page-404-view.js';
import { PageView } from 'components/pages/page-view.js';

export class StageContainerTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'stage$';
    super(context, traitPrefix);
  }

  static stage$OnRouteEvent(e, isDeepLink = false) {
    const { pageId, is404 } = e.payload;
    const pageLookupTable = {
      404: Page404View,
    };

    let PageClass = pageLookupTable[pageId] || PageView;
    if (is404) {
      PageClass = Page404View;
    }
    const data = e.payload;
    this.appendView(new PageClass({ data, isDeepLink }), '.page-container');
  }

  /**
   * The move between pages, from the channel that holds it
   * (CHANNEL_MATERIAL_PAGES). It begins ('leaving'), and a page may then ask
   * for it to be a collapse ('collapsing').
   *
   * The page asks in the instant it hears the move begin, and it may hear
   * first. So 'collapsing' can reach the stage before the 'leaving' it
   * answers. The container that holds the pages is stamped with the move it
   * is showing, and a beginning that arrives after its own collapse is let
   * pass.
   */
  static stage$OnPageMove(e) {
    const { phase, pageMoveId } = e.payload;
    const { dataset } = this.props.el$('.page-container').el;
    const isAlreadyCollapsing =
      dataset.pageMoveId === String(pageMoveId) &&
      dataset.pageTransition === 'container-collapse';

    if (phase === 'collapsing') {
      this.stage$OnPageCollapse(e);
    } else if (isAlreadyCollapsing === false) {
      this.stage$OnPageLeaving(e);
    }
  }

  /**
   * A move between pages has begun, and the Material channel has named its
   * transition: 'top-level', 'forward', 'backward' or 'container-transform'.
   * The container that holds the pages carries the name, and the styles
   * choose the motion by it, for the page leaving and the page arriving alike.
   *
   * A container transform is made by the browser (a view transition): it
   * takes a picture before and after a change and moves one shape into the
   * other. The change it is given is the swap of the two pages, which are
   * both in the document already. Where the browser has no view transitions,
   * the move is still one down a level, so it takes 'forward'.
   */
  static stage$OnPageLeaving(e) {
    const { transition, pageMoveId } = e.payload;
    const canTransform = typeof document.startViewTransition === 'function';
    const applied =
      transition === 'container-transform' && canTransform === false
        ? 'forward'
        : transition;
    const pageContainer$ = this.props.el$('.page-container');

    pageContainer$.removeClass('is-page-swapped');
    pageContainer$.el.dataset.pageMoveId = pageMoveId;
    pageContainer$.el.dataset.pageTransition = applied;

    if (applied === 'container-transform') {
      this.stage$PictureTheSwap(() => this.stage$ArriveAtTop());
    }
  }

  /**
   * The way back. A page has found, among its own cards, the one that leads
   * to the page being left, and has asked for the collapse: the page being
   * left shrinks into that card. It is the same browser feature run the other
   * way, and it begins in the same instant as the move, before anything of
   * the backward slide has been drawn. Where the browser has no view
   * transitions nothing is done here, and the move stays the backward slide
   * it was named.
   *
   * Once the pages have changed places the stage says so, and the page that
   * holds the card brings it into view.
   */
  static stage$OnPageCollapse(e) {
    if (typeof document.startViewTransition !== 'function') {
      return;
    }

    const { pageMoveId } = e.payload;
    const pageContainer$ = this.props.el$('.page-container');

    pageContainer$.removeClass('is-page-swapped');
    pageContainer$.el.dataset.pageMoveId = pageMoveId;
    pageContainer$.el.dataset.pageTransition = 'container-collapse';

    this.stage$PictureTheSwap(() =>
      this.sendInfoToChannel(
        'CHANNEL_MATERIAL_PAGES',
        { pageMoveId },
        'CHANNEL_MATERIAL_PAGES_ARRIVE_REQUEST',
      ),
    );
  }

  /**
   * Asks the browser for a view transition around the change of pages: the
   * leaving page gives way to the arriving one (the styles act on the class),
   * and then `onSwapped` puts the window where the arriving page should be
   * seen from. All of it happens between the browser's two pictures.
   *
   * The browser may decline to animate: in a tab in the background, for one.
   * It reports that by rejecting `ready`. The swap is made all the same, so
   * the report needs no answer, only to be received.
   */
  static stage$PictureTheSwap(onSwapped) {
    document
      .startViewTransition(() => {
        this.props.el$('.page-container').addClass('is-page-swapped');
        onSwapped();
      })
      .ready.catch(() => undefined);
  }

  // The page that has arrived is shown from its top. The Shell otherwise
  // leaves the window where it was scrolled to.
  static stage$ArriveAtTop() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  static stage$OnAppInitEvent(e) {
    this.stage$OnRouteEvent(e, true);
  }

  static stage$OnRendered() {
    this.appendView(new NavBreadcrumbContainer(), '.slot-page');
  }
}
