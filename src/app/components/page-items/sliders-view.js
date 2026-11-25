import { ChannelPayloadFilter, ViewStream } from 'spyne';
import { MaterialSliderTraits } from 'traits/material/material-slider-traits.js';

/**
 * A page item that holds sliders outside a form. It is the plain view with one
 * thing added: it keeps each slider's track filled up to its handle, which a
 * stylesheet cannot do by itself (traits/material/material-slider-traits.js).
 *
 * A page item asks for it with `viewClass: "SlidersView"`; its template and its
 * data are whatever the page item gives, as for any other.
 */
export class SlidersView extends ViewStream {
  constructor(props = {}) {
    props.traits = [MaterialSliderTraits];
    props.channels = ['CHANNEL_UI'];
    super(props);
  }

  addActionListeners() {
    // Every view hears every control's input. Only a slider's is taken.
    const fromASlider = new ChannelPayloadFilter({
      srcElement: (srcElement) => srcElement.el.type === 'range',
    });

    return [['CHANNEL_UI_INPUT_EVENT', 'materialSlider$OnInput', fromASlider]];
  }

  broadcastEvents() {
    return [['input[type="range"]', 'input']];
  }

  onRendered() {
    this.materialSlider$FillAll();
  }
}
