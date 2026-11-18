import { ChannelPayloadFilter, ViewStream } from 'spyne';
import {
  MaterialRippleTraits,
  rippling,
} from 'traits/material/material-ripple-traits.js';

/**
 * Where a press landed, for Material's ripple.
 *
 * A ripple grows from the point that was pressed. Styles draw it, but they cannot
 * know that point, so this view writes it: two custom properties on the pressed
 * element. It has no presence of its own (appendToNull) and is added once, by the
 * app container.
 *
 * It is the one view that writes on elements it did not render, as a deliberate
 * exception. The things that ripple are in every view, and many of those views are
 * built from data and have no code. What it writes is kept as small as it can be:
 * two style properties, on the one element the event names.
 *
 * The press comes from the window channel, which is where the grammar puts an event
 * on elements that come and go. The payload's own element is the window, so the
 * pressed element is read from the browser's event.
 */
export class MaterialRippleNullView extends ViewStream {
  constructor(props = {}) {
    props.channels = ['CHANNEL_WINDOW'];
    props.traits = [MaterialRippleTraits];
    super(props);
  }

  addActionListeners() {
    // A press with the pointer, on something that ripples.
    const pressFilter = new ChannelPayloadFilter({
      event: (pointerEvent) => rippling(pointerEvent.target) !== null,
    });

    // The same, pressed from the keyboard.
    const keyPressFilter = new ChannelPayloadFilter({
      event: (keyEvent) =>
        (keyEvent.key === 'Enter' || keyEvent.key === ' ') &&
        rippling(keyEvent.target) !== null,
    });

    return [
      [
        'CHANNEL_WINDOW_POINTERDOWN_EVENT',
        'materialRipple$OnPointerDown',
        pressFilter,
      ],
      [
        'CHANNEL_WINDOW_KEYDOWN_EVENT',
        'materialRipple$OnKeyPress',
        keyPressFilter,
      ],
    ];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {}
}
