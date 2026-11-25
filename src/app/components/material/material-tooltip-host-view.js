import { ChannelPayloadFilter, ViewStream } from 'spyne';
import TooltipTmpl from './templates/material-tooltip.tmpl.html';
import { MaterialTooltipTraits } from 'traits/material/material-tooltip-traits.js';

// Where the app's tooltip appears: one persistent region across the top of the
// window, holding the one tooltip. It is Material's plain tooltip, the name of a
// control that shows no words, shown to a pointer that rests on the control or to
// the keyboard's focus.
//
// A control asks for it in its own markup, with `data-tooltip="true"` beside its
// `aria-label`. The tooltip's words are that label, so the name a visitor sees and
// the name assistive technology says are one and cannot come apart. The view that
// owns the control broadcasts four of its events: pointerenter, pointerleave, focus
// and blur. This region hears them, and nothing reaches from one view into another.
//
// It says the moment as classes the styles read
// (scss/03-components/material/_tooltip.scss): `is-shown`, a control has the
// pointer or the focus; `is-by-keyboard`, it was the focus; and `is-lingering`, the
// pointer has left. How long each waits is the styles'.
export class MaterialTooltipHostView extends ViewStream {
  constructor(props = {}) {
    props.id = 'material-tooltip-host';
    props.template = TooltipTmpl;
    props.traits = [MaterialTooltipTraits];
    props.channels = ['CHANNEL_UI', 'CHANNEL_MATERIAL'];
    super(props);
  }

  addActionListeners() {
    // Only the controls that ask. Every view's events are on this channel.
    const asks = new ChannelPayloadFilter({ tooltip: 'true' });
    // A pointer that can rest: a finger's touch also arrives as a pointer, and a
    // tooltip is not shown for it.
    const byPointer = new ChannelPayloadFilter({
      tooltip: 'true',
      event: (event) => event.pointerType !== 'touch',
    });
    // The keyboard's focus: the focus a press gives a control does not show one.
    const byKeyboard = new ChannelPayloadFilter({
      tooltip: 'true',
      srcElement: (srcElement) => srcElement.el.matches(':focus-visible'),
    });

    return [
      [
        'CHANNEL_UI_POINTERENTER_EVENT',
        'materialTooltip$OnPointerEnter',
        byPointer,
      ],
      [
        'CHANNEL_UI_POINTERLEAVE_EVENT',
        'materialTooltip$OnPointerLeave',
        byPointer,
      ],
      ['CHANNEL_UI_FOCUS_EVENT', 'materialTooltip$OnFocus', byKeyboard],
      ['CHANNEL_UI_BLUR_EVENT', 'materialTooltip$OnBlur', asks],
      ['CHANNEL_UI_CLICK_EVENT', 'materialTooltip$OnPress', asks],
      ['CHANNEL_MATERIAL_DISMISS_EVENT', 'materialTooltip$OnDismiss'],
    ];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {}
}
