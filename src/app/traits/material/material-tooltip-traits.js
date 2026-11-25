import { SpyneTrait } from 'spyne';

export class MaterialTooltipTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'materialTooltip$';
    super(context, traitPrefix);
  }

  // A pointer has come to rest on a control that asks for a tooltip. The styles
  // wait a moment before they show it.
  static materialTooltip$OnPointerEnter(e) {
    this.materialTooltip$Show(e.srcElement.el, false);
  }

  // The keyboard's focus is on one. It is shown at once.
  static materialTooltip$OnFocus(e) {
    this.materialTooltip$Show(e.srcElement.el, true);
  }

  /**
   * The tooltip is given the control's own name and told where the control is.
   * This measures and nothing more: the control's box as it is drawn, and how
   * wide the words are. Where the tooltip then stands, below the control and
   * inside the window, is the styles' arithmetic. There is one tooltip, so a
   * second control takes it from the first.
   */
  static materialTooltip$Show(control, byKeyboard) {
    const tooltip = this.props.el$('.tooltip').el;
    const { style } = this.props.el;
    const { left, width, bottom } = control.getBoundingClientRect();

    tooltip.textContent = control.getAttribute('aria-label');

    style.setProperty('--tooltip-control-center', `${left + width / 2}px`);
    style.setProperty('--tooltip-control-bottom', `${bottom}px`);
    style.setProperty('--tooltip-width', `${tooltip.offsetWidth}px`);

    this.props.el$.toggleClass('is-by-keyboard', byKeyboard);
    this.props.el$.toggleClass('is-lingering', false);
    this.props.el$.toggleClass('is-shown', true);
  }

  // The pointer has left: the tooltip stays a moment longer, and then goes.
  static materialTooltip$OnPointerLeave() {
    this.props.el$.toggleClass('is-shown', false);
    this.props.el$.toggleClass('is-lingering', true);
  }

  // The focus has moved on.
  static materialTooltip$OnBlur() {
    this.materialTooltip$Hide();
  }

  // The control was pressed: it is doing what its name says.
  static materialTooltip$OnPress() {
    this.materialTooltip$Hide();
  }

  // Escape, or going anywhere: whatever is open closes.
  static materialTooltip$OnDismiss() {
    this.materialTooltip$Hide();
  }

  // Gone at once.
  static materialTooltip$Hide() {
    this.props.el$.toggleClass('is-shown', false);
    this.props.el$.toggleClass('is-lingering', false);
  }
}
