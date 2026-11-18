// The look of a Material button, as an app model gives it, and the classes it stands
// for.
//
// A call to action in a model takes one more key, `button`, beside its words:
//
//   { "ctaText": "Order ahead", "attrCtaHref": "/order",
//     "button": { "variant": "tonal", "size": "md", "shape": "square" } }
//
// Every key of `button` can be left out. `button` itself can be left out, and the
// button is then written as the Shell has always written it.
//
// The styles are the template's (elements/_buttons.scss): `.btn`, then one class for
// the variant, one for the size, and `.btn-square` for the square shape. This file is
// the only place that knows both sides.

export const MATERIAL_BUTTON_OPTIONS = {
  variant: {
    default: 'filled',
    values: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
  },
  size: {
    default: 'sm',
    values: ['xs', 'sm', 'md', 'lg', 'xl'],
  },
  shape: {
    default: 'round',
    values: ['round', 'square'],
  },
};

// The class the Shell's own templates give a call to action. It draws as the filled
// button at the small size (elements/_buttons.scss).
export const SHELL_BUTTON_LOOK = 'btn-primary';

// The class given to a call to action that has no words. A button carrying it is not
// drawn (elements/_buttons.scss): a button with nothing on it is not shown.
export const BUTTON_NO_WORDS = 'btn-no-words';

// Whether a call to action was given words for its button and has none: its `ctaText`
// is there, and is empty, only spaces, or not text at all. A call to action with no
// `ctaText` key is not counted. Its button's words may be written in its template, as
// the contact form's are, and nothing in the data can tell the two apart.
export const hasNoButtonWords = (item) =>
  item !== null &&
  typeof item === 'object' &&
  'ctaText' in item &&
  !(typeof item.ctaText === 'string' && item.ctaText.trim() !== '');

// The value given for a key if it is one the key takes, and the key's default if not.
const valueOf = (key, given) => {
  const { values, default: fallback } = MATERIAL_BUTTON_OPTIONS[key];

  return values.includes(given) ? given : fallback;
};

// The whole of a button's options: what was given, and the default for the rest.
export const materialButtonOptions = (given = {}) => ({
  variant: valueOf('variant', given?.variant),
  size: valueOf('size', given?.size),
  shape: valueOf('shape', given?.shape),
  disabled: given?.disabled === true,
});

// The classes for a look, without `.btn` itself: the variant's, the size's, and the
// square shape's if it is asked for.
const lookClasses = (given) => {
  const { variant, size, shape } = materialButtonOptions(given);
  const classes = [`btn-${variant}`, `btn-${size}`];

  if (shape === 'square') {
    classes.push('btn-square');
  }

  return classes;
};

// The class attribute for a button with these options.
export const materialButtonClass = (given = {}) =>
  ['btn', ...lookClasses(given)].join(' ');

// What a template writes after `btn` for a call to action: the classes its `button`
// key asks for, or the Shell's own class when the model has no such key.
export const materialButtonLook = (button) =>
  button === undefined || button === null
    ? SHELL_BUTTON_LOOK
    : lookClasses(button).join(' ');
