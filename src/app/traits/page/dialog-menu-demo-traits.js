import { SpyneTrait } from 'spyne';

// The names this page item gives its questions begin with this, so that an answer
// is known for one of its own.
const QUESTION = 'dialog-menu-demo:';

export class DialogMenuDemoTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'dialogMenuDemo$';
    super(context, traitPrefix);
  }

  static dialogMenuDemo$IsOwnQuestion(name) {
    return typeof name === 'string' && name.startsWith(QUESTION);
  }

  /**
   * A press on something of this page item's. What was pressed says what it is
   * in `data-demo`: a button that asks a question, or an item of a menu.
   */
  static dialogMenuDemo$OnPress(e) {
    const { demo, ask } = e.payload;

    if (demo === 'ask') {
      this.dialogMenuDemo$Ask(ask);
    } else {
      this.dialogMenuDemo$OnItemChosen(e.srcElement.el);
    }
  }

  /**
   * Asks for a dialog. The words are the page item's own data: `asks` is a list
   * of questions, each with the `attrName` its button carries. The dialog is the
   * Material channel's to show; this view only asks, and hears the answer.
   */
  static dialogMenuDemo$Ask(askName) {
    const asked = this.props.data.asks.find(
      ({ attrName }) => attrName === askName,
    );

    if (asked === undefined) {
      return;
    }

    const { headline, text, confirmLabel, dismissLabel } = asked;
    const name = `${QUESTION}${askName}`;
    const action = 'CHANNEL_MATERIAL_DIALOG_REQUEST';

    this.sendInfoToChannel(
      'CHANNEL_MATERIAL',
      { name, headline, text, confirmLabel, dismissLabel },
      action,
    );
  }

  // The answer to one of this view's questions: 'confirm' or 'dismiss'. A real
  // view would now do what was confirmed. This one says which it was.
  static dialogMenuDemo$OnAnswer(e) {
    const words = this.props.data.answers[e.payload.answer];

    this.props.el$('.dialog-menu-demo__answer').el.textContent = words;
  }

  /**
   * An item of a menu was pressed. The browser has closed the menu, or is about
   * to: the item names it in `popovertarget`. In a menu that chooses among
   * things, the item pressed becomes the one chosen (`aria-current`), which the
   * styles draw selected. Then this view says what was pressed, in the item's
   * own words (`data-words`).
   */
  static dialogMenuDemo$OnItemChosen(item) {
    if (item.dataset.demo === 'sort') {
      this.props.el$('[data-demo="sort"]').els.forEach((el) => {
        el.setAttribute('aria-current', String(el === item));
      });
    }

    this.props.el$('.dialog-menu-demo__chosen').el.textContent =
      item.dataset.words;
  }
}
