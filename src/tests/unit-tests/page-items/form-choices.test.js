import { expect } from 'chai';
import { DomElementTemplate, SpyneApp } from 'spyne';
import ContactUsTmpl from '/src/app/components/page-items/templates/contact-us.tmpl.html';
import OptionsTmpl from '/src/app/components/page-items/templates/contact-us-options.tmpl.html';
import { FormContactUsTraits } from '/src/app/traits/form/form-contact-us-traits.js';

// A form's choices: the checkbox, the switch and the set of radio buttons a field
// asks for with its `kind`. What is held here is what the two templates draw from
// the data the form's trait has shaped: one control for each field, with the
// attributes its case asks for and no others.

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

const shaped = (formFields) =>
  FormContactUsTraits.contactUs$ShapeData({ formFields });

const drawForm = (formFields) => draw(ContactUsTmpl, shaped(formFields));

const drawSet = (field) =>
  draw(OptionsTmpl, shaped([field]).formFields[0].controlRadioGroup);

const said = (control) =>
  ['checked', 'required', 'disabled'].filter((name) =>
    control.hasAttribute(name),
  );

describe("a form's checkbox and switch", () => {
  const fields = [
    { kind: 'checkbox', attrId: 'f-a', label: 'Plain', attrName: 'a' },
    {
      kind: 'checkbox',
      attrId: 'f-b',
      label: 'Starts on',
      attrName: 'b',
      attrChecked: true,
    },
    {
      kind: 'checkbox',
      attrId: 'f-c',
      label: 'Must be ticked',
      attrName: 'c',
      attrRequired: true,
    },
    {
      kind: 'checkbox',
      attrId: 'f-d',
      label: 'Not to be used',
      attrName: 'd',
      attrDisabled: true,
      attrChecked: true,
    },
    { kind: 'switch', attrId: 'f-e', label: 'A switch', attrName: 'e' },
    {
      kind: 'switch',
      attrId: 'f-f',
      label: 'A switch, on',
      attrName: 'f',
      attrValue: 'yes',
      attrChecked: true,
    },
  ];

  it('should draw one control for each field, and no text field', () => {
    const el = drawForm(fields);

    fields.forEach(({ attrId }) => {
      expect(el.querySelectorAll(`#${attrId}`)).to.have.lengthOf(1);
    });
    // the form's own message field is the one text control
    expect(el.querySelectorAll('textarea')).to.have.lengthOf(1);
    expect(
      el.querySelectorAll('input:not([type="checkbox"])'),
    ).to.have.lengthOf(0);
  });

  it('should write on each the attributes its case asks for', () => {
    const el = drawForm(fields);
    const of = (id) => said(el.querySelector(`#${id}`));

    expect(of('f-a')).to.deep.eq([]);
    expect(of('f-b')).to.deep.eq(['checked']);
    expect(of('f-c')).to.deep.eq(['required']);
    expect(of('f-d')).to.deep.eq(['checked', 'disabled']);
    expect(of('f-e')).to.deep.eq([]);
    expect(of('f-f')).to.deep.eq(['checked']);
  });

  it('should make a switch a checkbox with the switch role', () => {
    const el = drawForm(fields);

    expect(el.querySelector('#f-a').getAttribute('role')).to.eq(null);
    expect(el.querySelector('#f-e').getAttribute('type')).to.eq('checkbox');
    expect(el.querySelector('#f-e').getAttribute('role')).to.eq('switch');
  });

  it("should give a control its name, its value and its label's words", () => {
    const el = drawForm(fields);

    expect(el.querySelector('#f-a').getAttribute('name')).to.eq('a');
    expect(el.querySelector('#f-a').getAttribute('value')).to.eq('on');
    expect(el.querySelector('#f-f').getAttribute('value')).to.eq('yes');
    expect(el.querySelector('label[for="f-c"]').textContent.trim()).to.eq(
      'Must be ticked',
    );
  });

  it('should hold a choice in a row, and a text field in a field', () => {
    const el = drawForm([
      { attrId: 'f-t', label: 'Name', attrName: 'fullName', attrType: 'text' },
      ...fields,
    ]);

    expect(el.querySelector('#f-t').parentElement.className).to.eq(
      'contact-us__field',
    );
    expect(el.querySelector('#f-a').parentElement.className).to.eq(
      'contact-us__choice selection',
    );
  });

  it("should point each control at its field's error line", () => {
    const el = drawForm(fields);

    fields.forEach(({ attrId }) => {
      const line = el
        .querySelector(`#${attrId}`)
        .getAttribute('aria-describedby');

      expect(line).to.eq(`${attrId}-error`);
      expect(el.querySelectorAll(`#${line}`)).to.have.lengthOf(1);
    });
  });
});

describe("a form's set of radio buttons", () => {
  const field = (keys = {}) => ({
    kind: 'radio',
    attrId: 'f-how',
    label: 'How?',
    attrName: 'how',
    options: [
      { label: 'By post', attrValue: 'post' },
      { label: 'By email', attrValue: 'email', attrChecked: true },
      { label: 'Not at all', attrValue: 'none' },
    ],
    ...keys,
  });

  it('should draw a region for the set, named by its label, and no buttons in it', () => {
    const el = drawForm([field()]);
    const region = el.querySelector('#f-how');

    expect(region.getAttribute('role')).to.eq('radiogroup');
    expect(region.getAttribute('aria-labelledby')).to.eq('f-how-label');
    expect(el.querySelector('#f-how-label').textContent.trim()).to.eq('How?');
    expect(region.children).to.have.lengthOf(0);
    expect(region.parentElement.className).to.eq(
      'contact-us__choice selection-group',
    );
  });

  it('should draw one radio button for each option, of one name', () => {
    const buttons = [...drawSet(field()).querySelectorAll('input')];

    expect(buttons.map((button) => button.getAttribute('type'))).to.deep.eq([
      'radio',
      'radio',
      'radio',
    ]);
    expect(buttons.map((button) => button.getAttribute('name'))).to.deep.eq([
      'how',
      'how',
      'how',
    ]);
    expect(buttons.map((button) => button.getAttribute('value'))).to.deep.eq([
      'post',
      'email',
      'none',
    ]);
  });

  it('should give each button an id, and its label the same one', () => {
    const el = drawSet(field());

    ['f-how-1', 'f-how-2', 'f-how-3'].forEach((id) => {
      expect(el.querySelectorAll(`#${id}`)).to.have.lengthOf(1);
      expect(el.querySelectorAll(`label[for="${id}"]`)).to.have.lengthOf(1);
    });
    expect(el.querySelector('label[for="f-how-3"]').textContent.trim()).to.eq(
      'Not at all',
    );
  });

  it('should check the option that starts chosen, and only it', () => {
    const buttons = [...drawSet(field()).querySelectorAll('input')];

    expect(buttons.map(said)).to.deep.eq([[], ['checked'], []]);
  });

  it('should write required on every button of a set that must be answered', () => {
    const buttons = [
      ...drawSet(field({ attrRequired: true })).querySelectorAll('input'),
    ];

    expect(buttons.map(said)).to.deep.eq([
      ['required'],
      ['checked', 'required'],
      ['required'],
    ]);
  });

  it('should disable every button of a disabled set, and require none', () => {
    const buttons = [
      ...drawSet(
        field({ attrDisabled: true, attrRequired: true }),
      ).querySelectorAll('input'),
    ];

    expect(buttons.map(said)).to.deep.eq([
      ['disabled'],
      ['checked', 'disabled'],
      ['disabled'],
    ]);
  });

  it("should point every button at the set's error line", () => {
    const buttons = [...drawSet(field()).querySelectorAll('input')];

    buttons.forEach((button) => {
      expect(button.getAttribute('aria-describedby')).to.eq('f-how-error');
    });
  });

  it('should draw nothing for a set with no options', () => {
    expect(
      drawSet(field({ options: [] })).querySelectorAll('input'),
    ).to.have.lengthOf(0);
  });
});
