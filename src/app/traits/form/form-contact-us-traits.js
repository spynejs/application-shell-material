import { ChannelFetchUtil, DomElement, SpyneTrait, safeClone } from 'spyne';
import OptionsTmpl from 'components/page-items/templates/contact-us-options.tmpl.html';

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
   *   kind: 'checkbox'     a checkbox beside the field's label
   *   kind: 'switch'       a switch beside the field's label
   *   kind: 'radio'        a set of radio buttons under the field's label, one for
   *                        each entry of the field's `options`
   *
   *   attrRequired: true   must be filled in, ticked or chosen; left out, it need
   *                        not be. A switch is never required: off is an answer.
   *   attrDisabled: true   shown, but not to be used
   *   attrChecked: true    a checkbox or a switch that starts on; on an entry of
   *                        `options`, the radio button that starts chosen
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
   * A choice is laid out as a row (one control and its label) or as a set.
   */
  static contactUs$FieldClassFor({ kind }) {
    if (kind === 'radio') {
      return 'contact-us__choice selection-group';
    }

    return kind === 'checkbox' || kind === 'switch'
      ? 'contact-us__choice selection'
      : 'contact-us__field';
  }

  /**
   * A set of radio buttons as its template needs it: each entry of `options`
   * given the one section that holds its button. A loop sees its own entry and
   * nothing outside it, so what a button takes from its field (the name they
   * share, the error line they describe themselves by) is put on each.
   *
   * The entries are the form's own copy of the data, and each is given its keys
   * in place, as a field is. An entry made anew would hold the same words, and
   * the CMS would not know them for the model's: what it has put on the data is
   * on the entry it was given.
   */
  static contactUs$ShapeOptions(field) {
    const { attrId, attrName, options = [] } = field;

    options.forEach((option, index) => {
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
   * What a field's control takes: a text field its type and placeholder, a
   * checkbox or a switch its value, a set of radio buttons its options.
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

    if (kind === 'checkbox' || kind === 'switch') {
      // with no value of its own it sends the browser's word for one: on
      return { attrId, attrName, attrValue: attrValue ?? 'on' };
    }

    return { attrId, attrName, attrType, attrPlaceholder };
  }

  /**
   * The form's data as its template needs it: every field given the one
   * section that holds its control, carrying the attributes the control takes,
   * and the class of the element that holds it. The authored keys are left as
   * they are. safeClone keeps what the CMS has put on the data.
   */
  static contactUs$ShapeData(data) {
    const shaped = safeClone(data);

    (shaped.formFields ?? []).forEach((field) => {
      const control = FormContactUsTraits.contactUs$ControlFor(field);

      field.attrFieldClass = FormContactUsTraits.contactUs$FieldClassFor(field);
      field[control] = FormContactUsTraits.contactUs$ControlData(field);
    });

    return shaped;
  }

  /**
   * Puts each set's radio buttons in its region, once the form has rendered. A
   * set is a loop of its own, and its field is already one entry of the
   * fields' loop, with the set inside a section of that: deeper than one
   * template goes. The buttons are plain markup with no behavior of their own,
   * so they are a DomElement and not a view; the form broadcasts their input
   * as it does every control's.
   */
  static contactUs$AddRadioSets(props = this.props) {
    (props.data.formFields ?? [])
      .filter((field) => field.controlRadioGroup !== undefined)
      .forEach(({ attrId, controlRadioGroup }) => {
        const set = new DomElement({
          class: 'selection-group__options',
          template: OptionsTmpl,
          data: controlRadioGroup,
        });

        this.props.el$(`#${attrId}`).el.appendChild(set.render());
      });
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
    this.contactUs$MirrorFieldError(e.srcElement.el);
  }

  static contactUs$MirrorFieldError(control) {
    const errorEl = this.props.el$(
      `#${control.getAttribute('aria-describedby')}`,
    ).el;

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
    const controls = this.props.el$(':is(input, textarea)').els;

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
