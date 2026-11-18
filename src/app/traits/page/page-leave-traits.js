import { SpyneTrait } from 'spyne';

/**
 * How a page leaves, for Material's transition between pages: the page that is
 * leaving fades out, and only then is it removed and the next one shown.
 *
 * A page still carries its own exit. On the route change it marks itself as
 * leaving; the fade is CSS on that class. It removes itself when the Material
 * channel says the page has left (the listener and its filter are declared in
 * the view), so the wait is the channel's and nothing here keeps time.
 */
export class PageLeaveTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'pageLeave$';
    super(context, traitPrefix);
  }

  static pageLeave$OnRouteChange(e) {
    this.props.isLeaving = true;
    this.props.el$.addClass('is-leaving');
    this.pageLeave$MarkFollowedCard(e.srcElement?.el);
  }

  /**
   * If the move began on one of this page's cards, the card is marked. When
   * the move is a container transform, the marked card is the shape that
   * grows into the next page (material/_motion.scss). The route payload
   * carries the link that was followed; looking for it among this page's own
   * cards keeps the mark inside this page.
   */
  static pageLeave$MarkFollowedCard(followed) {
    const card = this.props
      .el$('a.page-card')
      .els.find((el) => el === followed);

    if (card !== undefined) {
      card.classList.add('is-container-origin');
    }
  }
}
