import { expect } from 'chai';
import { ChannelMaterialTraits } from '/src/app/traits/channel/channel-material-traits.js';
import { MaterialDialogHostTraits } from '/src/app/traits/material/material-dialog-host-traits.js';

// A dialog is asked for on the Material channel and answered there. What is held
// here is the channel's part: that one dialog is open at a time, what answers it,
// and that Escape is the dialog's alone while one is open. And what the dialog's
// template is given. That a dialog then opens and keeps the focus is held in a
// browser, not here.

// The channel's dialog methods, on something that stands in for the channel: its
// state, and a note of everything it sends.
const channel = () => {
  const sent = [];
  const standIn = {
    props: { dialogId: 0, dialog: null, route: null },
    sent,
    sendChannelPayload: (action, payload) => sent.push({ action, payload }),
  };

  [
    'channelMaterial$OnDialogRequest',
    'channelMaterial$OnDialogCloseRequest',
    'channelMaterial$AnswerDialog',
    'channelMaterial$OnEscapeKey',
    'channelMaterial$SendDismissEvent',
  ].forEach((method) => {
    standIn[method] = ChannelMaterialTraits[method].bind(standIn);
  });

  return standIn;
};

const SHOW = 'CHANNEL_MATERIAL_DIALOG_SHOW_EVENT';
const ANSWER = 'CHANNEL_MATERIAL_DIALOG_ANSWER_EVENT';
const DISMISS = 'CHANNEL_MATERIAL_DISMISS_EVENT';
const actionsOf = (c) => c.sent.map(({ action }) => action);
const ask = (c, payload) => c.channelMaterial$OnDialogRequest({ payload });

describe('a dialog, on the Material channel', () => {
  it('should show what was asked for, with a number of its own', () => {
    const c = channel();

    ask(c, {
      name: 'clear',
      headline: 'Clear the list?',
      text: 'This cannot be undone.',
      confirmLabel: 'Clear it',
      dismissLabel: 'Keep it',
    });

    expect(c.sent).to.deep.eq([
      {
        action: SHOW,
        payload: {
          dialogId: 1,
          name: 'clear',
          headline: 'Clear the list?',
          text: 'This cannot be undone.',
          confirmLabel: 'Clear it',
          dismissLabel: 'Keep it',
        },
      },
    ]);
  });

  it('should give a dialog asked for with no confirming words a plain one', () => {
    const c = channel();

    ask(c, { text: 'Saved.' });

    expect(c.sent[0].payload.confirmLabel).to.eq('OK');
    expect(c.sent[0].payload.dismissLabel).to.eq('');
  });

  it("should answer with the dialog's name and what its button said", () => {
    const c = channel();

    ask(c, { name: 'clear', text: 'Clear?' });
    c.channelMaterial$OnDialogCloseRequest({
      payload: { dialogId: 1, answer: 'confirm' },
    });

    expect(c.sent[1]).to.deep.eq({
      action: ANSWER,
      payload: { dialogId: 1, name: 'clear', answer: 'confirm' },
    });
  });

  it('should take anything but a confirming answer as dismissed', () => {
    const c = channel();

    ask(c, { name: 'clear', text: 'Clear?' });
    c.channelMaterial$OnDialogCloseRequest({
      payload: { dialogId: 1, answer: undefined },
    });

    expect(c.sent[1].payload.answer).to.eq('dismiss');
  });

  it('should answer a dialog once, and not hear a dialog that is gone', () => {
    const c = channel();

    ask(c, { name: 'clear', text: 'Clear?' });
    c.channelMaterial$OnDialogCloseRequest({
      payload: { dialogId: 1, answer: 'confirm' },
    });
    c.channelMaterial$OnDialogCloseRequest({
      payload: { dialogId: 1, answer: 'dismiss' },
    });

    expect(actionsOf(c)).to.deep.eq([SHOW, ANSWER]);
  });

  it("should know a dialog's number when an element says it, as text", () => {
    const c = channel();

    ask(c, { name: 'clear', text: 'Clear?' });
    c.channelMaterial$OnDialogCloseRequest({
      payload: { dialogId: '1', answer: 'confirm' },
    });

    expect(actionsOf(c)).to.deep.eq([SHOW, ANSWER]);
  });

  it('should dismiss the open dialog before it shows another', () => {
    const c = channel();

    ask(c, { name: 'first', text: 'One?' });
    ask(c, { name: 'second', text: 'Two?' });

    expect(actionsOf(c)).to.deep.eq([SHOW, ANSWER, SHOW]);
    expect(c.sent[1].payload).to.deep.eq({
      dialogId: 1,
      name: 'first',
      answer: 'dismiss',
    });
    expect(c.sent[2].payload.dialogId).to.eq(2);
    expect(c.props.dialog).to.deep.eq({ dialogId: 2, name: 'second' });
  });

  describe('Escape', () => {
    it('should dismiss the open dialog, and nothing else', () => {
      const c = channel();

      ask(c, { name: 'clear', text: 'Clear?' });
      c.channelMaterial$OnEscapeKey();

      expect(actionsOf(c)).to.deep.eq([SHOW, ANSWER]);
      expect(c.sent[1].payload.answer).to.eq('dismiss');
    });

    it('should close whatever else is open when no dialog is', () => {
      const c = channel();

      c.channelMaterial$OnEscapeKey();

      expect(c.sent).to.deep.eq([
        { action: DISMISS, payload: { reason: 'escape' } },
      ]);
    });
  });
});

describe("what a dialog's template is given", () => {
  const shape = MaterialDialogHostTraits.materialDialogHost$ShapeData;

  it('should name a dialog by its headline and describe it by its text', () => {
    const data = shape({
      dialogId: 3,
      headline: 'Clear the list?',
      text: 'This cannot be undone.',
      confirmLabel: 'Clear it',
      dismissLabel: 'Keep it',
    });

    expect(data.headline).to.deep.eq({
      words: 'Clear the list?',
      attrId: 'material-dialog-3-headline',
    });
    expect(data.labelledBy).to.eq('material-dialog-3-headline');
    expect(data.describedBy).to.eq('material-dialog-3-text');
    expect(data.attrTextId).to.eq('material-dialog-3-text');
  });

  it('should name a dialog with no headline by its text', () => {
    const data = shape({ dialogId: 3, text: 'Saved.', confirmLabel: 'OK' });

    expect(data.headline).to.eq(undefined);
    expect(data.labelledBy).to.eq('material-dialog-3-text');
    expect(data.describedBy).to.eq(undefined);
  });

  it('should have a dismissing button only where there are words for one', () => {
    const one = shape({ dialogId: 3, text: 'Saved.', confirmLabel: 'OK' });
    const two = shape({
      dialogId: 3,
      text: 'Clear?',
      confirmLabel: 'Clear it',
      dismissLabel: 'Keep it',
    });

    expect(one.dismiss).to.eq(undefined);
    expect(two.dismiss).to.deep.eq({ label: 'Keep it', attrDialogId: '3' });
  });

  it("should write the dialog's number where a press is heard from", () => {
    expect(shape({ dialogId: 3, text: 'Saved.' }).attrDialogId).to.eq('3');
  });
});
