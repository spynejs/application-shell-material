import {
  ChannelFetchUtil,
  DomElement,
  DomElementTemplate,
  SpyneTrait,
  safeClone,
} from 'spyne';
import OptionsTmpl from 'components/page-items/templates/contact-us-options.tmpl.html';
import SelectOptionsTmpl from 'components/page-items/templates/contact-us-select-options.tmpl.html';
import { MaterialSliderTraits } from 'traits/material/material-slider-traits.js';
import { hasIcon, iconPath } from 'traits/utils/icons.js';

// A switch in a field's entry is on when it is true. A model written by hand may
// carry the word; anything else, and a key left out, is off.
const isOn = (value) => value === true || value === 'true';

export class FormContactUsTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'contactUs$';
    super(context, traitPrefix);
  }

  /**
   * Which control a field's entry asks for (app.model.json, formFields):
   *
   *   kind left out        a text field
   *     multiline: true      several lines, a <textarea>; left out, an <input>
   *   kind: 'select'       a select, with one option for each entry of the
   *                        field's `options`, after an empty one
   *   kind: 'slider'       a slider under the field's label
   *   kind: 'checkbox'     a checkbox beside the field's label
   *   kind: 'switch'       a switch beside the field's label
   *   kind: 'radio'        a set of radio buttons under the field's label, one for
   *                        each entry of the field's `options`
   *
   *   attrRequired: true   must be filled in, ticked or chosen; left out, it need
   *                        not be. A switch is never required: off is an answer.
   *   attrDisabled: true   shown, but not to be used
   *   attrChecked: true    a checkbox or a switch that starts on; on an entry of
   *                        `options`, the radio button or the option that starts
   *                        chosen
   *
   * Required, disabled and checked are attributes that are there or not there,
   * and a template cannot write half of one. So the template has the control
   * once for each case, each inside a section of its own, and this names the one
   * section a field gets.
   *
   * A disabled control takes no part in validation, so "required" is not
   * written on one. A checkbox that must be ticked starts unticked.
   */
  static contactUs$ControlFor({
    kind,
    multiline,
    attrRequired,
    attrDisabled,
    attrChecked,
  }) {
    if (kind === 'radio') {
      return 'controlRadioGroup';
    }

    if (kind === 'slider') {
      return isOn(attrDisabled) ? 'controlSliderDisabled' : 'controlSlider';
    }

    if (kind === 'select') {
      if (isOn(attrDisabled)) {
        return 'controlSelectDisabled';
      }

      return isOn(attrRequired) ? 'controlSelectRequired' : 'controlSelect';
    }

    if (kind === 'checkbox' || kind === 'switch') {
      const element = kind === 'switch' ? 'Switch' : 'Checkbox';
      const checked = isOn(attrChecked) ? 'Checked' : '';

      if (isOn(attrDisabled)) {
        return `control${element}Disabled${checked}`;
      }

      return kind === 'checkbox' && isOn(attrRequired)
        ? 'controlCheckboxRequired'
        : `control${element}${checked}`;
    }

    const element = isOn(multiline) ? 'Textarea' : 'Input';

    if (isOn(attrDisabled)) {
      return `control${element}Disabled`;
    }

    return isOn(attrRequired)
      ? `control${element}Required`
      : `control${element}`;
  }

  /**
   * Which radio button an entry of a field's `options` gets: the same cases as
   * a control's, with the field's own required and disabled, since every
   * button of a set carries them.
   */
  static contactUs$OptionFor({ attrChecked }, { attrRequired, attrDisabled }) {
    const checked = isOn(attrChecked) ? 'Checked' : '';

    if (isOn(attrDisabled)) {
      return `optionDisabled${checked}`;
    }

    return isOn(attrRequired) ? `optionRequired${checked}` : `option${checked}`;
  }

  /**
   * The class of the element that holds a field: a text field's, or a choice's.
   * A choice is laid out as a row (one control and its label), as a set, or as
   * a slider under its label. A select is a text field with an arrow.
   */
  static contactUs$FieldClassFor({ kind }) {
    if (kind === 'radio') {
      return 'contact-us__choice selection-group';
    }

    if (kind === 'slider') {
      return 'contact-us__choice slider-field';
    }

    return kind === 'checkbox' || kind === 'switch'
      ? 'contact-us__choice selection'
      : 'contact-us__field';
  }

  /**
   * A field's `options` as their template needs them: each entry given the one
   * section that holds its control. A loop sees its own entry and nothing
   * outside it, so what a radio button takes from its field (the name they
   * share, the error line they describe themselves by) is put on each. An
   * option of a select takes nothing from its field: required and disabled are
   * the select's own.
   *
   * The entries are the form's own copy of the data, and each is given its keys
   * in place, as a field is. An entry made anew would hold the same words, and
   * the CMS would not know them for the model's: what it has put on the data is
   * on the entry it was given.
   */
  static contactUs$ShapeOptions(field) {
    const { kind, attrId, attrName, options = [] } = field;

    options.forEach((option, index) => {
      if (kind === 'select') {
        const chosen = isOn(option.attrChecked) ? 'optionChecked' : 'option';

        option[chosen] = { attrValue: option.attrValue, label: option.label };

        return;
      }

      const attrOptionId = `${attrId}-${index + 1}`;
      const button = FormContactUsTraits.contactUs$OptionFor(option, field);

      option.attrOptionId = attrOptionId;
      option[button] = {
        attrOptionId,
        attrName,
        attrValue: option.attrValue,
        attrErrorId: `${attrId}-error`,
      };
    });

    return options;
  }

  /**
   * A slider's ends, its step and where it starts, as numbers its control can
   * take: 0 to 100 by ones, starting in the middle, where the field says
   * nothing.
   */
  static contactUs$SliderData({
    attrId,
    attrName,
    attrMin,
    attrMax,
    attrStep,
    attrValue,
  }) {
    const min = Number(attrMin ?? 0);
    const max = Number(attrMax ?? 100);

    return {
      attrId,
      attrName,
      attrMin: min,
      attrMax: max,
      attrStep: Number(attrStep ?? 1),
      attrValue: Number(attrValue ?? (min + max) / 2),
    };
  }

  /**
   * What a field's control takes: a text field its type and placeholder, a
   * checkbox or a switch its value, a set of radio buttons and a select their
   * options, a slider its ends.
   */
  static contactUs$ControlData(field) {
    const { kind, attrId, attrName, attrType, attrPlaceholder, attrValue } =
      field;

    if (kind === 'radio') {
      return {
        attrId,
        options: FormContactUsTraits.contactUs$ShapeOptions(field),
      };
    }

    if (kind === 'select') {
      return {
        attrId,
        attrName,
        options: FormContactUsTraits.contactUs$ShapeOptions(field),
      };
    }

    if (kind === 'slider') {
      return FormContactUsTraits.contactUs$SliderData(field);
    }

    if (kind === 'checkbox' || kind === 'switch') {
      // with no value of its own it sends the browser's word for one: on
      return { attrId, attrName, attrValue: attrValue ?? 'on' };
    }

    return { attrId, attrName, attrType, attrPlaceholder };
  }

  /**
   * The icon a field names at its start or its end (`leadingIcon`,
   * `trailingIcon`: a name in icon-shapes.js), as a section its template draws.
   * A name that is not an icon's draws nothing.
   */
  static contactUs$IconFor(name) {
    return hasIcon(name) ? { attrIconPath: iconPath(name) } : undefined;
  }

  /**
   * The form's data as its template needs it: every field given the one
   * section that holds its control, carrying the attributes the control takes,
   * the class of the element that holds it, and its icons. The form itself is
   * given the class that makes its text fields filled, where its `fieldStyle`
   * says so. The authored keys are left as they are. safeClone keeps what the
   * CMS has put on the data.
   */
  static contactUs$ShapeData(data) {
    const shaped = safeClone(data);

    if (shaped.fieldStyle === 'filled') {
      shaped.attrFieldsClass = 'fields-filled';
    }

    (shaped.formFields ?? []).forEach((field) => {
      const control = FormContactUsTraits.contactUs$ControlFor(field);
      const leading = FormContactUsTraits.contactUs$IconFor(field.leadingIcon);
      const trailing = FormContactUsTraits.contactUs$IconFor(
        field.trailingIcon,
      );

      field.attrFieldClass = FormContactUsTraits.contactUs$FieldClassFor(field);
      field[control] = FormContactUsTraits.contactUs$ControlData(field);

      if (leading !== undefined) {
        field.iconLeading = leading;
      }

      if (trailing !== undefined) {
        field.iconTrailing = trailing;
      }
    });

    return shaped;
  }

  /**
   * Puts each field's options in, once the form has rendered: a set's radio
   * buttons in its region, and a select's options in the select. Options are a
   * loop of their own, and their field is already one entry of the fields'
   * loop, with its control inside a section of that: deeper than one template
   * goes. They are plain markup with no behavior of their own, so neither is a
   * view; the form broadcasts their input as it does every control's.
   */
  static contactUs$AddOptions(props = this.props) {
    (props.data.formFields ?? []).forEach((field) => {
      const { attrId, controlRadioGroup } = field;
      const select =
        field.controlSelect ??
        field.controlSelectRequired ??
        field.controlSelectDisabled;

      if (controlRadioGroup !== undefined) {
        const set = new DomElement({
          class: 'selection-group__options',
          template: OptionsTmpl,
          data: controlRadioGroup,
        });

        this.props.el$(`#${attrId}`).el.appendChild(set.render());
      }

      if (select !== undefined) {
        const options = new DomElementTemplate(SelectOptionsTmpl, select);

        this.props.el$(`#${attrId}`).el.appendChild(options.renderDocFrag());
      }
    });
  }

  /**
   * Fills each slider's track up to where it starts. A stylesheet cannot know
   * where a slider's handle is; MaterialSliderTraits says so on the control.
   */
  static contactUs$FillSliders() {
    // Asked of the element itself: most forms have no slider, and the view's own
    // selector says so in the console each time it finds none.
    this.props.el
      .querySelectorAll('input[type="range"]')
      .forEach((slider) => MaterialSliderTraits.materialSlider$Fill(slider));
  }

  static contactUs$SendFormData(e, props = this.props) {
    const { srcElement } = e;

    const { mode, apiUrl } = props;

    const form = srcElement.el;

    // The form is novalidate, so this is where an invalid form stops.
    if (this.contactUs$ShowFieldErrors() === false) {
      return;
    }

    const formData = new FormData(form);

    const formDataObj = {
      name: formData.get('fullName'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    // held for the success state, which greets the sender by name
    this.props.submittedData = formDataObj;

    if (mode === 'api') {
      this.contactUs$SendFormViaApi(formDataObj, apiUrl);
    } else {
      this.contactUs$SendFormViaEmail(formDataObj);
    }
  }

  /**
   * Material puts a field's error in a line under the field. The text is the
   * browser's own message for the control's constraints (required, type), so
   * it is in the visitor's language and nothing here decides what is valid.
   * It is mirrored as the visitor types; whether the line shows is CSS, on
   * the same :user-invalid state that colours the field.
   */
  static contactUs$OnFieldInput(e) {
    const control = e.srcElement.el;

    // A slider has no error to mirror: any place along it is an answer. What it
    // has is a track to fill up to its handle. A view takes one listener for an
    // action, so the two kinds of control part here and not at a filter.
    if (control.type === 'range') {
      MaterialSliderTraits.materialSlider$Fill(control);

      return;
    }

    this.contactUs$MirrorFieldError(control);
  }

  static contactUs$MirrorFieldError(control) {
    // a control is described by its error line first, then its supporting text
    const [errorId] = control.getAttribute('aria-describedby').split(' ');
    const errorEl = this.props.el$(`#${errorId}`).el;

    if (errorEl !== null) {
      errorEl.innerText = control.validationMessage;
    }
  }

  /**
   * On a submit attempt: every field shows its error, and the first invalid
   * one takes focus, where its label and its error are read out together.
   * Returns false when the form is not ready to send.
   */
  static contactUs$ShowFieldErrors() {
    // every control that has an error line: a slider has none
    const controls = this.props.el$(
      ':is(input, textarea, select)[aria-describedby]',
    ).els;

    controls.forEach((control) => this.contactUs$MirrorFieldError(control));

    const firstInvalid = controls.find((control) => !control.validity.valid);

    if (firstInvalid !== undefined) {
      firstInvalid.focus();
    }

    return firstInvalid === undefined;
  }

  static contactUs$SendFormViaEmail({ name, email, message }) {
    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );

    window.location.href = `mailto:test@test.com?subject=${subject}&body=${body}`;
  }

  static contactUs$SendFormViaApi(body, apiUrl) {
    new ChannelFetchUtil(
      {
        url: apiUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      },
      this.contactUs$OnSuccess.bind(this),
    );
  }

  /**
   * Swaps the form for the success state: a heading that greets the sender
   * by name, with the confirmation message beneath it. The status container
   * carries role="status", so assistive technology announces it without
   * moving focus. Values are written via innerText, never markup.
   */
  static contactUs$OnSuccess(e, props = this.props) {
    const { successMessage, submittedData } = props;
    const name = submittedData?.name?.trim();

    const titleEl = this.props.el$('.contact-us__status-title').el;
    const msgEl = this.props.el$('.contact-us__status-msg').el;

    if (titleEl !== null) {
      titleEl.innerText = name ? `Thanks, ${name}.` : 'Thanks.';
    }

    if (msgEl !== null) {
      msgEl.innerText = successMessage;
    }

    this.props.el$.addClass('contact-us--submitted');

    // Material also reports what the app has done in a snackbar. The message above
    // stays: on the web a snackbar that leaves by itself must not be the only report.
    this.sendInfoToChannel(
      'CHANNEL_MATERIAL',
      { message: successMessage },
      'CHANNEL_MATERIAL_SNACKBAR_REQUEST',
    );
  }
}
