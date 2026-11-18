import { SpyneTrait } from 'spyne';

/**
 * A page being returned to. In Material's container transform a card grows into
 * the page it leads to; on the way back that page collapses into the card again.
 * Only the page that holds the card can know there is one, so it is this page
 * that asks for the collapse.
 *
 * It learns of the move from CHANNEL_MATERIAL_PAGES, which replays: the move may
 * have begun before this page was made, or begin just after. Either way it may
 * hear of it before its cards are in the document, so it looks again once it
 * has rendered.
 */
export class PageReturnTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'pageReturn$';
    super(context, traitPrefix);
  }

  static pageReturn$OnPageMove(e) {
    this.props.pageMove = e.payload;

    const { phase, pageMoveId } = e.payload;

    if (phase === 'leaving') {
      this.pageReturn$AskForCollapse();
    } else if (phase === 'arrived' && this.props.returnMoveId === pageMoveId) {
      this.pageReturn$ShowCard();
    }
  }

  static pageReturn$OnRendered() {
    this.pageReturn$AskForCollapse();
  }

  /**
   * If a move back up a level is beginning, and one of this page's cards leads
   * to the page being left, the card is marked and the collapse is asked for.
   * The page being left hears the same move; it has no card that leads to
   * itself, so it asks for nothing.
   */
  static pageReturn$AskForCollapse() {
    const { pageMoveId, transition, from, phase } = this.props.pageMove ?? {};
    const isBeginningBackward = phase === 'leaving' && transition === 'backward';

    if (!isBeginningBackward || this.props.returnMoveId === pageMoveId) {
      return;
    }

    const card = this.pageReturn$CardFor(from);

    if (card === undefined) {
      return;
    }

    this.props.returnMoveId = pageMoveId;
    this.props.el$('a.page-card').removeClass('is-container-target');
    card.classList.add('is-container-target');

    this.sendInfoToChannel(
      'CHANNEL_MATERIAL_PAGES',
      { pageMoveId },
      'CHANNEL_MATERIAL_PAGES_COLLAPSE_REQUEST',
    );
  }

  // A card says where it leads, in its dataset.
  static pageReturn$CardFor({ pageId, topicId } = {}) {
    return this.props
      .el$('a.page-card')
      .els.find(
        (el) => el.dataset.pageId === pageId && el.dataset.topicId === topicId,
      );
  }

  // The pages have changed places: the card is brought to the middle of the
  // window, so that the page being left has somewhere in sight to collapse to.
  static pageReturn$ShowCard() {
    const card = this.props.el$('a.page-card.is-container-target').el;

    if (card !== null) {
      card.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }
}
