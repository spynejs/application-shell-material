import { SpyneTrait } from 'spyne';
import { MaterialFabView } from 'components/material/material-fab-view.js';
import { isFabsOwnPage } from 'traits/utils/fab.js';

export class MaterialFabTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'materialFab$';
    super(context, traitPrefix);
  }

  /**
   * The app has its data: where its model asks for a FAB, the host adds it, and
   * keeps what it leads to, to know its own page by. An app that asks for none
   * gets none, and the host stays empty.
   */
  static materialFab$OnAppInit(e) {
    const { fab } = e.payload.initData;

    if (fab === null || fab === undefined) {
      return;
    }

    this.props.fab = fab;
    this.appendView(new MaterialFabView({ data: fab }));
    this.materialFab$MarkOwnPage(e.payload);
  }

  static materialFab$OnPage(e) {
    this.materialFab$MarkOwnPage(e.payload);
  }

  /**
   * Says whether the page on screen is the one the FAB leads to. It is not shown
   * there: what it leads to is already in front of the visitor.
   */
  static materialFab$MarkOwnPage(page) {
    this.props.el$.toggleClass(
      'is-own-page',
      isFabsOwnPage(this.props.fab, page),
    );
  }

  /**
   * Says whether the page has left its top. At the top of a page its hero and
   * the hero's button are the thing to press; the FAB comes in once they are
   * scrolled away. The state is the Material channel's; the look is CSS.
   */
  static materialFab$OnScroll(e) {
    const { scrolled } = e.payload;

    this.props.el$.toggleClass('is-scrolled', scrolled);
  }
}
