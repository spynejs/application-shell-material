import { ChannelPayloadFilter, ViewStream } from 'spyne';
import DialogTmpl from './templates/material-dialog.tmpl.html';
import { MaterialDialogTraits } from 'traits/material/material-dialog-traits.js';

// One dialog: Material's basic dialog, a question a visitor must answer before
// going on. It is the browser's own <dialog>, opened as a modal, so the browser
// keeps the keyboard's focus inside it, closes the page behind it to the keyboard
// and to assistive technology, and gives the focus back when it closes.
//
// It is born from a SHOW on the Material channel and removes itself when the
// channel says it is answered. A press on one of its buttons, or outside it, asks
// the channel to answer; so does the browser closing it by a way of its own. The
// dialog does not decide what an answer means, and does nothing with it.
//
// props.data: materialDialogHost$ShapeData.
export class MaterialDialogView extends ViewStream {
  constructor(props = {}) {
    const { dialogId, labelledBy, describedBy } = props.data;

    props.tagName = 'dialog';
    props.class = 'material-dialog';
    // Material: on the web a basic dialog has the alert dialog role.
    props.role = 'alertdialog';
    props['aria-labelledby'] = labelledBy;
    if (describedBy !== undefined) {
      props['aria-describedby'] = describedBy;
    }
    // The dialog's own number, on the element: it rides the payload of the event
    // the browser sends when it closes the dialog itself.
    props.dataset = { dialogId };
    props.template = DialogTmpl;
    props.traits = [MaterialDialogTraits];
    props.channels = ['CHANNEL_UI', 'CHANNEL_MATERIAL'];
    super(props);
  }

  addActionListeners() {
    // Every view's events are on the UI channel: only this dialog's are taken. A
    // number read from an element is text.
    const { dialogId } = this.props.data;
    const own = new ChannelPayloadFilter({ dialogId: String(dialogId) });
    const ownAnswer = new ChannelPayloadFilter({ dialogId });

    return [
      ['CHANNEL_UI_CLICK_EVENT', 'materialDialog$OnPress', own],
      ['CHANNEL_UI_CLOSE_EVENT', 'materialDialog$OnClosedByBrowser', own],
      [
        'CHANNEL_MATERIAL_DIALOG_ANSWER_EVENT',
        'materialDialog$OnAnswer',
        ownAnswer,
      ],
    ];
  }

  broadcastEvents() {
    return [
      // Its buttons, and the scrim round it: each says its answer in `data-answer`.
      ['[data-answer]', 'click'],
      // The dialog itself: the browser closes one by ways of its own, such as a
      // phone's Back.
      ['.material-dialog', 'close'],
    ];
  }

  onRendered() {
    this.materialDialog$Open();
  }
}
