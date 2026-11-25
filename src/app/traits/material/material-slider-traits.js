import { SpyneTrait } from 'spyne';

// A slider's track is filled up to its handle, and a stylesheet cannot know where
// the handle is: the browser holds a slider's value and tells no style of it. So
// the view that holds a slider says where it is, as a number from 0 to 1 in the
// custom property --slider-fraction on the control, and material/_slider.scss
// draws the track from that.
//
// A view with a slider composes this trait, broadcasts the slider's input, and
// listens for it:
//
//   props.traits = [MaterialSliderTraits];
//   broadcastEvents()    ['input[type="range"]', 'input']
//   addActionListeners() ['CHANNEL_UI_INPUT_EVENT', 'materialSlider$OnInput']
//   onRendered()         this.materialSlider$FillAll();
//
// A view that already listens for CHANNEL_UI_INPUT_EVENT takes one listener for
// it, and calls materialSlider$Fill from that, as the contact form does.
export class MaterialSliderTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'materialSlider$';
    super(context, traitPrefix);
  }

  /**
   * Where a value is between a slider's two ends, from 0 to 1. A slider whose
   * ends are the same, or are not numbers, is at its start.
   */
  static materialSlider$FractionOf({ value, min, max }) {
    const [at, from, to] = [value, min, max].map(Number);
    const fraction = (at - from) / (to - from);

    return Number.isFinite(fraction) ? Math.min(Math.max(fraction, 0), 1) : 0;
  }

  /**
   * Says on a slider where its handle is. The browser gives a slider with no
   * ends written 0 and 100, so those stand in for an end that is not written.
   */
  static materialSlider$Fill(slider) {
    const { value, min, max } = slider;
    const fraction = MaterialSliderTraits.materialSlider$FractionOf({
      value,
      min: min === '' ? 0 : min,
      max: max === '' ? 100 : max,
    });

    slider.style.setProperty('--slider-fraction', fraction);
  }

  static materialSlider$OnInput(e) {
    MaterialSliderTraits.materialSlider$Fill(e.srcElement.el);
  }

  static materialSlider$FillAll() {
    this.props
      .el$('input[type="range"]')
      .els.forEach((slider) =>
        MaterialSliderTraits.materialSlider$Fill(slider),
      );
  }
}
