import { SpyneTrait } from 'spyne';
import { MaterialDialogView } from 'components/material/material-dialog-view.js';

export class MaterialDialogHostTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'materialDialogHost$';
    super(context, traitPrefix);
  }

  /**
   * What a dialog's template needs, from what the channel shows. The template
   * has no logic, so presence is shaped here:
   *
   *   headline  there only when the dialog has one: its words and its id
   *   dismiss   there only when the dialog has a second, dismissing button
   *
   * Every part that is pressed carries the dialog's number, so that a press is
   * known for this dialog's. A section reads only its own data, so the number is
   * on each. The dialog is named for assistive technology by its headline, or by
   * its text where it has none, and is then described by nothing more.
   */
  static materialDialogHost$ShapeData({
    dialogId,
    headline = '',
    text = '',
    confirmLabel = '',
    dismissLabel = '',
  }) {
    const attrDialogId = String(dialogId);
    const attrTextId = `material-dialog-${dialogId}-text`;
    const attrHeadlineId = `material-dialog-${dialogId}-headline`;
    const hasHeadline = headline !== '';

    return {
      dialogId,
      attrDialogId,
      attrTextId,
      text,
      confirmLabel,
      labelledBy: hasHeadline ? attrHeadlineId : attrTextId,
      describedBy: hasHeadline ? attrTextId : undefined,
      headline: hasHeadline
        ? { words: headline, attrId: attrHeadlineId }
        : undefined,
      dismiss:
        dismissLabel !== '' ? { label: dismissLabel, attrDialogId } : undefined,
    };
  }

  // The region adds the dialog and keeps no handle on it; the dialog's own
  // listeners take it away.
  static materialDialogHost$OnShow(e) {
    const data = MaterialDialogHostTraits.materialDialogHost$ShapeData(
      e.payload,
    );

    this.appendView(new MaterialDialogView({ data }));
  }
}
