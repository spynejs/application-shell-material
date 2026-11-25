import { expect } from 'chai';
import { DomElementTemplate, SpyneApp } from 'spyne';
import DialogTmpl from '/src/app/components/material/templates/material-dialog.tmpl.html';
import DemoTmpl from '/src/app/components/page-items/templates/dialog-menu-demo.tmpl.html';
import { MaterialDialogHostTraits } from '/src/app/traits/material/material-dialog-host-traits.js';
import { MaterialDialogView } from '/src/app/components/material/material-dialog-view.js';
import { DialogMenuDemoView } from '/src/app/components/page-items/dialog-menu-demo-view.js';

// What a dialog's template draws from what it is given, and that a menu's markup
// comes through the app's sanitizer as it was written: a menu is the browser's own
// popover, and is nothing without the three attributes that make it one.

// A template is drawn through the app's sanitizer, which the app sets up as it
// starts.
before(() => {
  SpyneApp.init({ debug: false });
});

const draw = (template, data) => {
  const el = document.createElement('div');

  el.appendChild(new DomElementTemplate(template, data).renderDocFrag());

  return el;
};

const shape = MaterialDialogHostTraits.materialDialogHost$ShapeData;

describe('a dialog, as drawn', () => {
  const two = shape({
    dialogId: 7,
    headline: 'Clear the list?',
    text: 'This cannot be undone.',
    confirmLabel: 'Clear it',
    dismissLabel: 'Keep it',
  });
  const one = shape({ dialogId: 8, text: 'Saved.', confirmLabel: 'Got it' });

  it('should draw its headline and its text, each with the id it is named by', () => {
    const el = draw(DialogTmpl, two);
    const headline = el.querySelector('.material-dialog__headline');
    const text = el.querySelector('.material-dialog__text');

    expect(headline.textContent).to.eq('Clear the list?');
    expect(headline.id).to.eq(two.labelledBy);
    expect(text.textContent).to.eq('This cannot be undone.');
    expect(text.id).to.eq(two.describedBy);
  });

  it('should draw the dismissing button before the confirming one', () => {
    const buttons = [...draw(DialogTmpl, two).querySelectorAll('button')];

    expect(buttons.map((b) => b.textContent.trim())).to.deep.eq([
      'Keep it',
      'Clear it',
    ]);
    expect(buttons.map((b) => b.dataset.answer)).to.deep.eq([
      'dismiss',
      'confirm',
    ]);
  });

  it("should write the dialog's number on everything that is pressed", () => {
    const pressed = [
      ...draw(DialogTmpl, two).querySelectorAll('[data-answer]'),
    ];

    // The scrim and the two buttons.
    expect(pressed).to.have.lengthOf(3);
    pressed.forEach((el) => {
      expect(el.dataset.dialogId).to.eq('7');
    });
  });

  it('should have a scrim that dismisses, and is nothing to assistive technology', () => {
    const scrim = draw(DialogTmpl, two).querySelector(
      '.material-dialog__scrim',
    );

    expect(scrim.dataset.answer).to.eq('dismiss');
    expect(scrim.getAttribute('aria-hidden')).to.eq('true');
  });

  it('should draw no headline and one button where it is given neither', () => {
    const el = draw(DialogTmpl, one);

    expect(el.querySelectorAll('.material-dialog__headline')).to.have.lengthOf(
      0,
    );
    expect(
      [...el.querySelectorAll('button')].map((b) => b.textContent.trim()),
    ).to.deep.eq(['Got it']);
  });

  it('should hear its presses and its own closing', () => {
    const events = new MaterialDialogView({ data: two }).broadcastEvents();

    expect(events).to.deep.include(['[data-answer]', 'click']);
    expect(events).to.deep.include(['.material-dialog', 'close']);
  });
});

describe('a menu, as drawn', () => {
  const data = {
    sorts: [
      { label: 'Newest', attrCurrent: 'true', attrWords: 'Sorted by newest.' },
      { label: 'Price', attrCurrent: 'false', attrWords: 'Sorted by price.' },
    ],
    actions: [{ label: 'Edit', attrIconPath: 'M0 0h24', attrWords: 'Edit.' }],
    disabled: 'Disabled',
  };

  it('should come through as a popover with an id', () => {
    const menus = [...draw(DemoTmpl, data).querySelectorAll('.menu')];

    expect(menus).to.have.lengthOf(2);
    menus.forEach((menu) => {
      expect(menu.hasAttribute('popover')).to.eq(true);
      expect(menu.id).to.not.eq('');
    });
  });

  it('should have one button that opens each menu, which names it', () => {
    const el = draw(DemoTmpl, data);

    el.querySelectorAll('.menu').forEach((menu) => {
      const openers = el.querySelectorAll(
        `[popovertarget="${menu.id}"]:not([popovertargetaction="hide"])`,
      );

      expect(openers).to.have.lengthOf(1);
    });
  });

  it('should have items that close their own menu when pressed', () => {
    const el = draw(DemoTmpl, data);
    const sort = el.querySelector('#dialog-menu-demo-sort');
    const items = [...sort.querySelectorAll('.menu__item')];

    expect(items).to.have.lengthOf(2);
    items.forEach((item) => {
      expect(item.getAttribute('popovertarget')).to.eq(sort.id);
      expect(item.getAttribute('popovertargetaction')).to.eq('hide');
    });
  });

  it('should mark the item chosen, of a menu that chooses', () => {
    const items = [
      ...draw(DemoTmpl, data).querySelectorAll('[data-demo="sort"]'),
    ];

    expect(items.map((item) => item.getAttribute('aria-current'))).to.deep.eq([
      'true',
      'false',
    ]);
  });

  it('should draw a divider and an item that cannot be pressed', () => {
    const more = draw(DemoTmpl, data).querySelector('#dialog-menu-demo-more');

    expect(more.querySelectorAll('hr.menu__divider')).to.have.lengthOf(1);
    expect(more.querySelectorAll('.menu__item:disabled')).to.have.lengthOf(1);
  });

  it("should have the view that holds it hear the menu's opening", () => {
    const view = new DialogMenuDemoView({ data });
    const heard = view.addActionListeners().map(([action]) => action);

    expect(view.broadcastEvents()).to.deep.include(['.menu', 'toggle']);
    expect(heard).to.include('CHANNEL_UI_TOGGLE_EVENT');
  });
});
