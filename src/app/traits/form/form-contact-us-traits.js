import { ChannelFetchUtil, SpyneTrait, safeClone } from 'spyne';

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
   *   multiline: true      several lines, a <textarea>; left out, an <input>
   *   attrRequired: true   must be filled in; left out, it need not be
   *   attrDisabled: true   shown, but not to be used
   *
   * Required and disabled are attributes that are there or not there, and a
   * template cannot write half of one. So the template has the control once for
   * each case, each inside a section of its own, and this names the one section
   * a field gets.
   *
   * A disabled control takes no part in validation, so "required" is not
   * written on one.
   */
  static contactUs$ControlFor({ multiline, attrRequired, attrDisabled }) {
    const element = isOn(multiline) ? 'Textarea' : 'Input';

    if (isOn(attrDisabled)) {
      return `control${element}Disabled`;
    }

    return isOn(attrRequired)
      ? `control${element}Required`
      : `control${element}`;
  }

  /**
   * The form's data as its template needs it: every field given the one
   * section that holds its control, carrying the attributes the control takes.
   * The authored keys are left as they are. safeClone keeps what the CMS has
   * put on the data.
   */
  static contactUs$ShapeData(data) {
    const shaped = safeClone(data);

    (shaped.formFields ?? []).forEach((field) => {
      const { attrId, attrName, attrType, attrPlaceholder } = field;
      const control = FormContactUsTraits.contactUs$ControlFor(field);

      field[control] = { attrId, attrName, attrType, attrPlaceholder };
    });

    return shaped;
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
