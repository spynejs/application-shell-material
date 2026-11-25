import { expect } from 'chai';
import { DomElementTemplate, SpyneApp } from 'spyne';
import ContactUsTmpl from '/src/app/components/page-items/templates/contact-us.tmpl.html';
import SelectOptionsTmpl from '/src/app/components/page-items/templates/contact-us-select-options.tmpl.html';
import { FormContactUsTraits } from '/src/app/traits/form/form-contact-us-traits.js';
import { MaterialSliderTraits } from '/src/app/traits/material/material-slider-traits.js';
import { ICON_SHAPES } from '/src/app/traits/utils/icon-shapes.js';

// A form's other fields: the select, the slider, a date and a time, and what a
// text field may have besides its control (supporting text, an icon at its start
// or its end, the filled style). What is held here is what the form's trait makes
// of a field's entry, and what the two templates draw from it.

// A template is drawn through the app's sanitizer, which the app sets up as it
// starts.
before(() => {
  SpyneApp.init({ debug: false });
});

const controlFor = (field) => FormContactUsTraits.contactUs$ControlFor(field);

const shaped = (formFields, keys = {}) =>
  FormContactUsTraits.contactUs$ShapeData({ formFields, ...keys });

const draw = (template, data) => {
  const el = document.createElement('div');

  el.appendChild(new DomElementTemplate(template, data).renderDocFrag());

  return el;
};

const drawForm = (formFields, keys) =>
  draw(ContactUsTmpl, shaped(formFields, keys));

const said = (control) =>
  ['required', 'disabled', 'selected'].filter((name) =>
    control.hasAttribute(name),
  );

describe("a form's select", () => {
  const field = (keys = {}) => ({
    kind: 'select',
    attrId: 'f-heard',
    label: 'How did you hear of us?',
    attrName: 'heard',
    options: [
      { label: 'From a friend', attrValue: 'friend' },
      { label: 'A search', attrValue: 'search', attrChecked: true },
    ],
    ...keys,
  });

  it('should give a select one section, by what it must be', () => {
    expect(controlFor({ kind: 'select' })).to.eq('controlSelect');
    expect(controlFor({ kind: 'select', attrRequired: true })).to.eq(
      'controlSelectRequired',
    );
    expect(
      controlFor({ kind: 'select', attrRequired: true, attrDisabled: true }),
    ).to.eq('controlSelectDisabled');
  });

  it('should hold it as a text field is held', () => {
    expect(shaped([field()]).formFields[0].attrFieldClass).to.eq(
      'contact-us__field',
    );
  });

  it('should draw one select, with an empty option and no other', () => {
    const select = drawForm([field()]).querySelector('#f-heard');

    expect(select.tagName).to.eq('SELECT');
    expect(select.getAttribute('name')).to.eq('heard');
    expect(select.options).to.have.lengthOf(1);
    expect(select.options[0].value).to.eq('');
  });

  it('should write required and disabled on the select, not on an option', () => {
    const of = (keys) =>
      said(drawForm([field(keys)]).querySelector('#f-heard'));

    expect(of({})).to.deep.eq([]);
    expect(of({ attrRequired: true })).to.deep.eq(['required']);
    expect(of({ attrDisabled: true })).to.deep.eq(['disabled']);
  });

  it('should give every option exactly one section, in place', () => {
    const [heard] = shaped([field()]).formFields;
    const { options } = heard.controlSelect;

    expect(options[0]).to.eq(heard.options[0]);
    expect(options[0].option).to.deep.eq({
      attrValue: 'friend',
      label: 'From a friend',
    });
    expect(options[0].optionChecked).to.eq(undefined);
    expect(options[1].optionChecked.attrValue).to.eq('search');
    expect(options[1].option).to.eq(undefined);
  });

  it('should draw an option for each entry, and choose the one that starts chosen', () => {
    const [heard] = shaped([field()]).formFields;
    const options = [
      ...draw(SelectOptionsTmpl, heard.controlSelect).querySelectorAll(
        'option',
      ),
    ];

    expect(options.map((option) => option.getAttribute('value'))).to.deep.eq([
      'friend',
      'search',
    ]);
    expect(options.map(said)).to.deep.eq([[], ['selected']]);
  });

  it("should write an option's words as text and nothing else", () => {
    const [heard] = shaped([field()]).formFields;
    const [friend] = draw(
      SelectOptionsTmpl,
      heard.controlSelect,
    ).querySelectorAll('option');

    expect(friend.textContent.trim()).to.eq('From a friend');
    expect(friend.children).to.have.lengthOf(0);
  });

  it('should shape twice alike', () => {
    const once = shaped([field()]);

    expect(FormContactUsTraits.contactUs$ShapeData(once)).to.deep.eq(once);
  });
});

describe("a form's slider", () => {
  const field = (keys = {}) => ({
    kind: 'slider',
    attrId: 'f-party',
    label: 'How many?',
    attrName: 'party',
    ...keys,
  });

  it('should give a slider one section, in use or not', () => {
    expect(controlFor({ kind: 'slider' })).to.eq('controlSlider');
    expect(controlFor({ kind: 'slider', attrDisabled: true })).to.eq(
      'controlSliderDisabled',
    );
    expect(controlFor({ kind: 'slider', attrRequired: true })).to.eq(
      'controlSlider',
    );
  });

  it('should run from 0 to 100 by ones and start in the middle, where nothing is said', () => {
    expect(shaped([field()]).formFields[0].controlSlider).to.deep.eq({
      attrId: 'f-party',
      attrName: 'party',
      attrMin: 0,
      attrMax: 100,
      attrStep: 1,
      attrValue: 50,
    });
  });

  it('should take its ends, its step and its start from the field', () => {
    const [party] = shaped([
      field({ attrMin: 1, attrMax: 12, attrStep: 1, attrValue: 2 }),
    ]).formFields;

    expect(party.controlSlider.attrMin).to.eq(1);
    expect(party.controlSlider.attrMax).to.eq(12);
    expect(party.controlSlider.attrValue).to.eq(2);
    expect(
      shaped([field({ attrMin: 10, attrMax: 20 })]).formFields[0].controlSlider
        .attrValue,
    ).to.eq(15);
  });

  it('should draw a range input under its label, with no error line of its own', () => {
    const el = drawForm([field({ attrMin: 1, attrMax: 12, attrValue: 2 })]);
    const slider = el.querySelector('#f-party');

    expect(slider.getAttribute('type')).to.eq('range');
    expect(slider.getAttribute('min')).to.eq('1');
    expect(slider.getAttribute('max')).to.eq('12');
    expect(slider.getAttribute('value')).to.eq('2');
    expect(slider.hasAttribute('aria-describedby')).to.eq(false);
    expect(slider.parentElement.className).to.eq(
      'contact-us__choice slider-field',
    );
    expect(el.querySelector('label[for="f-party"]').textContent.trim()).to.eq(
      'How many?',
    );
  });

  it('should disable a slider that is not to be used', () => {
    const slider = drawForm([field({ attrDisabled: true })]).querySelector(
      '#f-party',
    );

    expect(slider.hasAttribute('disabled')).to.eq(true);
  });
});

describe("where a slider's handle is", () => {
  const fractionOf = (value, min, max) =>
    MaterialSliderTraits.materialSlider$FractionOf({ value, min, max });

  it('should be a number from 0 to 1 between its two ends', () => {
    expect(fractionOf(0, 0, 100)).to.eq(0);
    expect(fractionOf(30, 0, 100)).to.eq(0.3);
    expect(fractionOf(100, 0, 100)).to.eq(1);
    expect(fractionOf(15, 10, 20)).to.eq(0.5);
  });

  it('should take the words a control gives for its numbers', () => {
    expect(fractionOf('2', '1', '12')).to.be.closeTo(1 / 11, 1e-9);
  });

  it('should stay within its ends, and be at its start when it has none', () => {
    expect(fractionOf(150, 0, 100)).to.eq(1);
    expect(fractionOf(-5, 0, 100)).to.eq(0);
    expect(fractionOf(5, 5, 5)).to.eq(0);
    expect(fractionOf('x', 0, 100)).to.eq(0);
  });

  it('should be said on the control, for its stylesheet to read', () => {
    const slider = document.createElement('input');

    slider.type = 'range';
    slider.min = '1';
    slider.max = '5';
    slider.value = '4';
    MaterialSliderTraits.materialSlider$Fill(slider);

    expect(slider.style.getPropertyValue('--slider-fraction')).to.eq('0.75');
  });

  it('should take 0 and 100 for ends that are not written', () => {
    const slider = document.createElement('input');

    slider.type = 'range';
    slider.value = '25';
    MaterialSliderTraits.materialSlider$Fill(slider);

    expect(slider.style.getPropertyValue('--slider-fraction')).to.eq('0.25');
  });
});

describe("what a form's text field may have besides its control", () => {
  const field = (keys = {}) => ({
    attrId: 'f-email',
    label: 'Email',
    attrName: 'email',
    attrType: 'email',
    ...keys,
  });

  it('should draw a line of supporting text, and none where there is none', () => {
    const withText = drawForm([field({ supportingText: 'We reply here.' })]);
    const without = drawForm([field()]);

    expect(withText.querySelector('#f-email-support').textContent.trim()).to.eq(
      'We reply here.',
    );
    expect(without.querySelector('#f-email-support').textContent.trim()).to.eq(
      '',
    );
  });

  it('should describe the control by its error line first, then its supporting text', () => {
    const control = drawForm([field()]).querySelector('#f-email');

    expect(control.getAttribute('aria-describedby')).to.eq(
      'f-email-error f-email-support',
    );
  });

  it('should draw the icon a field names at its start, or at its end', () => {
    const leading = drawForm([field({ leadingIcon: 'mail' })]);
    const trailing = drawForm([field({ trailingIcon: 'info' })]);

    expect(
      leading
        .querySelector('.contact-us__field-icon--leading path')
        .getAttribute('d'),
    ).to.eq(ICON_SHAPES.mail);
    expect(leading.querySelector('.contact-us__field-icon--trailing')).to.eq(
      null,
    );
    expect(
      trailing
        .querySelector('.contact-us__field-icon--trailing path')
        .getAttribute('d'),
    ).to.eq(ICON_SHAPES.info);
    expect(trailing.querySelector('.contact-us__field-icon--leading')).to.eq(
      null,
    );
  });

  it('should draw no icon for a field that names none, or one that is not there', () => {
    expect(drawForm([field()]).querySelectorAll('svg')).to.have.lengthOf(0);
    expect(
      drawForm([field({ leadingIcon: 'no_such_icon' })]).querySelectorAll(
        'svg',
      ),
    ).to.have.lengthOf(0);
  });

  it('should hold the icon before the control and after it, where the keyboard and a reader find them in order', () => {
    const el = drawForm([field({ leadingIcon: 'mail', trailingIcon: 'info' })]);
    const order = [...el.querySelector('.contact-us__field').children].map(
      (child) => child.tagName.toLowerCase(),
    );

    expect(order).to.deep.eq(['label', 'svg', 'input', 'svg', 'p', 'p']);
  });

  it('should make a date and a time text fields of their type', () => {
    const el = drawForm([
      field({ attrId: 'f-day', attrType: 'date' }),
      field({ attrId: 'f-at', attrType: 'time' }),
    ]);

    expect(el.querySelector('#f-day').getAttribute('type')).to.eq('date');
    expect(el.querySelector('#f-at').getAttribute('type')).to.eq('time');
    expect(el.querySelector('#f-day').parentElement.className).to.eq(
      'contact-us__field',
    );
  });

  it("should make a form's fields filled only where the form says so", () => {
    const form = (keys) =>
      drawForm([field()], keys).querySelector('.contact-us__form');

    expect(
      form({ fieldStyle: 'filled' }).classList.contains('fields-filled'),
    ).to.eq(true);
    expect(form({}).classList.contains('fields-filled')).to.eq(false);
    expect(
      form({ fieldStyle: 'outlined' }).classList.contains('fields-filled'),
    ).to.eq(false);
  });
});
