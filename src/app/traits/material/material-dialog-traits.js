import { SpyneTrait } from 'spyne';

export class MaterialDialogTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'materialDialog$';
    super(context, traitPrefix);
  }

  // Opened as a modal: the browser puts it over everything, moves the focus to
  // its first button, and remembers where the focus was.
  static materialDialog$Open() {
    this.props.el.showModal();
  }

  // One of its buttons, or the scrim round it. The pressed element says the
  // answer.
  static materialDialog$OnPress(e) {
    this.materialDialog$AskToClose(e.payload.answer);
  }

  // The browser closed it by a way of its own. It was not answered: dismissed.
  static materialDialog$OnClosedByBrowser() {
    this.materialDialog$AskToClose('dismiss');
  }

  // The dialog does not close itself. It says how it was answered, and the
  // channel answers: the asking view and this dialog then hear the same thing.
  static materialDialog$AskToClose(answer) {
    const { dialogId } = this.props.data;
    const action = 'CHANNEL_MATERIAL_DIALOG_CLOSE_REQUEST';

    this.sendInfoToChannel('CHANNEL_MATERIAL', { dialogId, answer }, action);
  }

  // Answered: by a button, by Escape, by a move to another page, or because
  // another dialog was asked for. Closing it first is what has the browser give
  // the focus back to where it was; then nothing of the dialog is left.
  static materialDialog$OnAnswer() {
    this.props.el.close();
    this.disposeViewStream();
  }
}
