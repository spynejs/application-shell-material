import { expect } from 'chai';
import { FormContactUsTraits } from '/src/app/traits/form/form-contact-us-traits.js';

const controlFor = (field) => FormContactUsTraits.contactUs$ControlFor(field);
const shape = (data) => FormContactUsTraits.contactUs$ShapeData(data);

const CONTROLS = [
  'controlInput',
  'controlInputRequired',
  'controlInputDisabled',
  'controlTextarea',
  'controlTextareaRequired',
  'controlTextareaDisabled',
];

describe('contactUs$ControlFor', () => {
  it('should give a plain input to a field with none of the keys', () => {
    expect(controlFor({})).to.eq('controlInput');
  });

  it('should make a field required only when attrRequired is true', () => {
    expect(controlFor({ attrRequired: true })).to.eq('controlInputRequired');
    expect(controlFor({ attrRequired: 'true' })).to.eq('controlInputRequired');
    expect(controlFor({ attrRequired: false })).to.eq('controlInput');
    expect(controlFor({ attrRequired: 'false' })).to.eq('controlInput');
    expect(controlFor({ attrRequired: '' })).to.eq('controlInput');
  });

  it('should give several lines a textarea', () => {
    expect(controlFor({ multiline: true })).to.eq('controlTextarea');
    expect(controlFor({ multiline: true, attrRequired: true })).to.eq(
      'controlTextareaRequired',
    );
    expect(controlFor({ multiline: false, attrRequired: true })).to.eq(
      'controlInputRequired',
    );
  });

  it('should disable a field, and not write required on a disabled one', () => {
    expect(controlFor({ attrDisabled: true })).to.eq('controlInputDisabled');
    expect(controlFor({ attrDisabled: true, attrRequired: true })).to.eq(
      'controlInputDisabled',
    );
    expect(controlFor({ attrDisabled: true, multiline: true })).to.eq(
      'controlTextareaDisabled',
    );
  });
});

describe('contactUs$ShapeData', () => {
  const data = () => ({
    title: 'Write to us',
    formFields: [
      {
        attrId: 'contact-name',
        label: 'Name',
        attrName: 'fullName',
        attrType: 'text',
        attrPlaceholder: 'Your name',
        attrRequired: true,
      },
      {
        attrId: 'contact-notes',
        label: 'Notes',
        attrName: 'notes',
        attrPlaceholder: 'Anything else',
        multiline: true,
      },
    ],
  });

  it('should give every field exactly one control', () => {
    shape(data()).formFields.forEach((field) => {
      const given = CONTROLS.filter((control) => field[control] !== undefined);

      expect(given).to.have.lengthOf(1);
    });
  });

  it('should give the control the attributes it takes', () => {
    const [name, notes] = shape(data()).formFields;

    expect(name.controlInputRequired).to.deep.eq({
      attrId: 'contact-name',
      attrName: 'fullName',
      attrType: 'text',
      attrPlaceholder: 'Your name',
    });
    expect(notes.controlTextarea.attrId).to.eq('contact-notes');
  });

  it('should leave the authored keys as they are', () => {
    const [name] = shape(data()).formFields;

    expect(name.label).to.eq('Name');
    expect(name.attrRequired).to.eq(true);
  });

  it('should not change the data it was given', () => {
    const given = data();

    shape(given);

    expect(given).to.deep.eq(data());
  });

  it('should give the same result when shaped twice', () => {
    const once = shape(data());
    const twice = shape(once);

    expect(twice).to.deep.eq(once);
  });

  it('should take a form with no fields listed', () => {
    expect(shape({ title: 'Write to us' })).to.deep.eq({
      title: 'Write to us',
    });
  });
});
