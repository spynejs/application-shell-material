import { SpyneTrait, ViewStream } from 'spyne';
import UIFooterContentTmpl from 'components/ui-elements/templates/ui-footer-content.tmpl.html';
import { UIFooterLinksView } from 'components/ui-elements/ui-footer-links-view.js';

export class UIFooterViewTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'uiFooter$';
    super(context, traitPrefix);
  }

  static uiFooter$OnAppDataEvent(e) {
    const { footerLinks } = e.payload.initData;

    // The links come first, over the footer's one line of words. An app whose
    // model asks for none has that line alone, as before.
    if (footerLinks !== null && footerLinks !== undefined) {
      this.appendView(new UIFooterLinksView({ data: footerLinks }));
    }

    this.appendView(
      new ViewStream({
        data: e.payload,
        class: 'footer-content',
        template: UIFooterContentTmpl,
      }),
    );
  }
}
