import { ChannelPayloadFilter, ViewStream } from 'spyne';
import { MaterialMenuTraits } from 'traits/material/material-menu-traits.js';
import { DialogMenuDemoTraits } from 'traits/page/dialog-menu-demo-traits.js';

/**
 * The page item that shows a dialog and a menu at work, and how a view of your
 * own uses each. It is the plain view with three things added:
 *
 * - it asks for a dialog, with a request on the Material channel, and hears the
 *   answer there by the name it gave its question;
 * - it keeps each of its menus beside the button that opens it
 *   (traits/material/material-menu-traits.js);
 * - it hears a press on a menu's item, as it hears any press.
 *
 * A page item asks for it with `viewClass: "DialogMenuDemoView"`. Its template is
 * `dialog-menu-demo.tmpl.html` and its data is the page item's.
 */
export class DialogMenuDemoView extends ViewStream {
  constructor(props = {}) {
    props.traits = [MaterialMenuTraits, DialogMenuDemoTraits];
    props.channels = ['CHANNEL_UI', 'CHANNEL_MATERIAL'];
    super(props);
  }

  addActionListeners() {
    // Every view's presses are on the UI channel: only what this one marks as its
    // own is taken. A view takes one listener for an action, so the one for a
    // press tells its own apart (dialogMenuDemo$OnPress).
    const ownPress = new ChannelPayloadFilter({
      demo: (demo) => demo !== undefined,
    });
    // An answer comes back with the name its question was given.
    const ownAnswer = new ChannelPayloadFilter({
      name: (name) => DialogMenuDemoTraits.dialogMenuDemo$IsOwnQuestion(name),
    });

    return [
      ['CHANNEL_UI_CLICK_EVENT', 'dialogMenuDemo$OnPress', ownPress],
      ['CHANNEL_UI_TOGGLE_EVENT', 'materialMenu$OnToggle'],
      [
        'CHANNEL_MATERIAL_DIALOG_ANSWER_EVENT',
        'dialogMenuDemo$OnAnswer',
        ownAnswer,
      ],
    ];
  }

  broadcastEvents() {
    return [
      ['[data-demo]', 'click'],
      ['.menu', 'toggle'],
    ];
  }

  onRendered() {}
}
