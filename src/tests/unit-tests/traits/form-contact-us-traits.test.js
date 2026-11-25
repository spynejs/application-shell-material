import { expect } from 'chai';
import { FormContactUsTraits } from '/src/app/traits/form/form-contact-us-traits.js';

const controlFor = (field) => FormContactUsTraits.contactUs$ControlFor(field);
const shape = (data) => FormContactUsTraits.contactUs$ShapeData(data);

const optionFor = (option, field) =>
  FormContactUsTraits.contactUs$OptionFor(option, field);

const CONTROLS = [
  'controlInput',
  'controlInputRequired',
  'controlInputDisabled',
  'controlTextarea',
  'controlTextareaRequired',
  'controlTextareaDisabled',
  'controlCheckbox',
  'controlCheckboxChecked',
  'controlCheckboxRequired',
  'controlCheckboxDisabled',
  'controlCheckboxDisabledChecked',
  'controlSwitch',
  'controlSwitchChecked',
  'controlSwitchDisabled',
  'controlSwitchDisabledChecked',
  'controlRadioGroup',
];

const OPTIONS = [
  'option',
  'optionChecked',
  'optionRequired',
  'optionRequiredChecked',
  'optionDisabled',
  'optionDisabledChecked',
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

describe('contactUs$ControlFor, for a choice', () => {
  it('should give a checkbox to a field of that kind', () => {
    expect(controlFor({ kind: 'checkbox' })).to.eq('controlCheckbox');
    expect(controlFor({ kind: 'checkbox', attrChecked: true })).to.eq(
      'controlCheckboxChecked',
    );
    expect(controlFor({ kind: 'checkbox', attrChecked: 'true' })).to.eq(
      'controlCheckboxChecked',
    );
  });

  it('should start a checkbox that must be ticked unticked', () => {
    expect(controlFor({ kind: 'checkbox', attrRequired: true })).to.eq(
      'controlCheckboxRequired',
    );
    expect(
      controlFor({ kind: 'checkbox', attrRequired: true, attrChecked: true }),
    ).to.eq('controlCheckboxRequired');
  });

  it('should give a switch to a field of that kind, and never require one', () => {
    expect(controlFor({ kind: 'switch' })).to.eq('controlSwitch');
    expect(controlFor({ kind: 'switch', attrChecked: true })).to.eq(
      'controlSwitchChecked',
    );
    expect(controlFor({ kind: 'switch', attrRequired: true })).to.eq(
      'controlSwitch',
    );
  });

  it('should disable a choice, on or off, and not require a disabled one', () => {
    expect(controlFor({ kind: 'checkbox', attrDisabled: true })).to.eq(
      'controlCheckboxDisabled',
    );
    expect(
      controlFor({ kind: 'checkbox', attrDisabled: true, attrChecked: true }),
    ).to.eq('controlCheckboxDisabledChecked');
    expect(
      controlFor({ kind: 'checkbox', attrDisabled: true, attrRequired: true }),
    ).to.eq('controlCheckboxDisabled');
    expect(
      controlFor({ kind: 'switch', attrDisabled: true, attrChecked: true }),
    ).to.eq('controlSwitchDisabledChecked');
  });

  it('should give a set of radio buttons one section, whatever its keys', () => {
    expect(controlFor({ kind: 'radio' })).to.eq('controlRadioGroup');
    expect(
      controlFor({ kind: 'radio', attrRequired: true, attrDisabled: true }),
    ).to.eq('controlRadioGroup');
  });

  it('should take a kind it does not know as a text field', () => {
    expect(controlFor({ kind: 'dial' })).to.eq('controlInput');
  });
});

describe('contactUs$OptionFor', () => {
  it('should give a plain radio button, or the one that starts chosen', () => {
    expect(optionFor({}, {})).to.eq('option');
    expect(optionFor({ attrChecked: true }, {})).to.eq('optionChecked');
  });

  it("should carry the field's required and disabled", () => {
    expect(optionFor({}, { attrRequired: true })).to.eq('optionRequired');
    expect(optionFor({ attrChecked: true }, { attrRequired: true })).to.eq(
      'optionRequiredChecked',
    );
    expect(optionFor({}, { attrDisabled: true })).to.eq('optionDisabled');
    expect(
      optionFor(
        { attrChecked: true },
        { attrDisabled: true, attrRequired: true },
      ),
    ).to.eq('optionDisabledChecked');
  });
});

describe('contactUs$ShapeData, for a choice', () => {
  const data = () => ({
    formFields: [
      {
        attrId: 'contact-name',
        label: 'Name',
        attrName: 'fullName',
        attrType: 'text',
      },
      {
        kind: 'checkbox',
        attrId: 'contact-copy',
        label: 'Send me a copy',
        attrName: 'copy',
      },
      {
        kind: 'switch',
        attrId: 'contact-news',
        label: 'News by email',
        attrName: 'news',
        attrValue: 'yes',
        attrChecked: true,
      },
      {
        kind: 'radio',
        attrId: 'contact-reason',
        label: 'What is it about?',
        attrName: 'reason',
        attrRequired: true,
        options: [
          { label: 'A booking', attrValue: 'booking' },
          { label: 'A question', attrValue: 'question', attrChecked: true },
        ],
      },
    ],
  });

  it('should give every field exactly one control', () => {
    shape(data()).formFields.forEach((field) => {
      const given = CONTROLS.filter((control) => field[control] !== undefined);

      expect(given).to.have.lengthOf(1);
    });
  });

  it('should say which element holds a field: a text field, a row or a set', () => {
    const classes = shape(data()).formFields.map(
      (field) => field.attrFieldClass,
    );

    expect(classes).to.deep.eq([
      'contact-us__field',
      'contact-us__choice selection',
      'contact-us__choice selection',
      'contact-us__choice selection-group',
    ]);
  });

  it("should give a checkbox the browser's own value when it has none", () => {
    const [, copy, news] = shape(data()).formFields;

    expect(copy.controlCheckbox).to.deep.eq({
      attrId: 'contact-copy',
      attrName: 'copy',
      attrValue: 'on',
    });
    expect(news.controlSwitchChecked.attrValue).to.eq('yes');
  });

  it('should give every option exactly one radio button', () => {
    const [, , , reason] = shape(data()).formFields;

    reason.controlRadioGroup.options.forEach((option) => {
      const given = OPTIONS.filter((button) => option[button] !== undefined);

      expect(given).to.have.lengthOf(1);
    });
  });

  it('should put on each radio button what it takes from its field', () => {
    const [, , , reason] = shape(data()).formFields;
    const [booking, question] = reason.controlRadioGroup.options;

    expect(reason.controlRadioGroup.attrId).to.eq('contact-reason');
    expect(booking).to.deep.eq({
      label: 'A booking',
      attrValue: 'booking',
      attrOptionId: 'contact-reason-1',
      optionRequired: {
        attrOptionId: 'contact-reason-1',
        attrName: 'reason',
        attrValue: 'booking',
        attrErrorId: 'contact-reason-error',
      },
    });
    expect(question.optionRequiredChecked.attrOptionId).to.eq(
      'contact-reason-2',
    );
  });

  it("should shape each option in place, so that it is the field's own entry", () => {
    const [, , , reason] = shape(data()).formFields;

    // what the CMS has put on an entry of the data is on that entry: one made
    // anew would hold the same words and not be editable
    reason.controlRadioGroup.options.forEach((option, index) => {
      expect(option).to.eq(reason.options[index]);
    });
    expect(reason.options[1].attrChecked).to.eq(true);
  });

  it('should take a set of radio buttons with no options listed', () => {
    const [field] = shape({
      formFields: [{ kind: 'radio', attrId: 'contact-reason' }],
    }).formFields;

    expect(field.controlRadioGroup.options).to.deep.eq([]);
  });

  it('should not change the data it was given, and shape twice alike', () => {
    const given = data();
    const once = shape(given);

    expect(given).to.deep.eq(data());
    expect(shape(once)).to.deep.eq(once);
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
