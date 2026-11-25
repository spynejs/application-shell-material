import { Channel } from 'spyne';
import { ChannelMaterialTraits } from 'traits/channel/channel-material-traits.js';

// The main Material channel. It turns what the browser and the router report into
// Material's own vocabulary, once, for every Material component:
//
//   CHANNEL_MATERIAL_DISMISS_EVENT     something asked for whatever is open to close
//                                      payload: { reason: 'escape' | 'route' }
//   CHANNEL_MATERIAL_BREAKPOINT_EVENT  the window entered one of Material's breakpoints
//                                      payload: { breakpoint: 'compact' | 'medium' |
//                                      'expanded' | 'large' | 'extra-large' }
//   CHANNEL_MATERIAL_SCROLL_EVENT      the page left its top, or came back to it
//                                      payload: { scrolled: true | false }
//
// And it is where a view asks for a snackbar, Material's brief report of something
// the app has done:
//
//   CHANNEL_MATERIAL_SNACKBAR_REQUEST     in, from any view: { message }
//   CHANNEL_MATERIAL_SNACKBAR_SHOW_EVENT  out: { snackbarId, message }
//   CHANNEL_MATERIAL_SNACKBAR_HIDE_EVENT  out, when its time is up: { snackbarId }
//
// And it is where a view asks a visitor a question that must be answered, in
// Material's dialog, and hears the answer:
//
//   CHANNEL_MATERIAL_DIALOG_REQUEST        in, from any view: { name, headline,
//                                          text, confirmLabel, dismissLabel }
//   CHANNEL_MATERIAL_DIALOG_SHOW_EVENT     out: the same, with { dialogId }
//   CHANNEL_MATERIAL_DIALOG_CLOSE_REQUEST  in, from the dialog itself:
//                                          { dialogId, answer }
//   CHANNEL_MATERIAL_DIALOG_ANSWER_EVENT   out: { dialogId, name, answer }
//                                          answer: 'confirm' | 'dismiss'
//
// `name` is the asking view's own word for its question: it comes back with the
// answer, and that is how a view knows an answer for its own. One dialog is open
// at a time. Escape and a move to another page answer the open one with 'dismiss';
// so does a second request, before its own dialog is shown. While a dialog is
// open, Escape is its alone: it is in front of whatever else is open, and the
// DISMISS above is not sent.
//
// And it says when a move between pages begins and ends, and which of Material's
// transitions the move takes:
//
//   CHANNEL_MATERIAL_PAGE_LEAVING_EVENT  a route change: the page on screen is leaving
//                                        payload: { pageMoveId, transition, from }
//                                        transition: 'top-level' | 'forward' |
//                                        'backward' | 'container-transform'
//                                        from: the route being left,
//                                        { pageId, topicId }
//   CHANNEL_MATERIAL_PAGE_LEFT_EVENT     the leaving page's time is up
//                                        payload: { pageMoveId, transition }
//
// A component's own channel listens here; it does not listen to CHANNEL_WINDOW or
// CHANNEL_ROUTE for these. CHANNEL_MATERIAL_PAGES is such a channel: it holds the
// move that these two actions begin and end, for the pages and the stage.
//
// It keeps a little state: whether the page is scrolled, so that it reports the
// change and not every scroll; the number of the latest snackbar, of the latest
// dialog and of the latest move; the dialog that is open, if one is; and the route
// the visitor is on, so that a move can say where it is from. It does not
// replay: its actions are moments, and a moment replayed to a late subscriber would
// be acted on twice.
export class ChannelMaterial extends Channel {
  constructor(name, props = {}) {
    name = 'CHANNEL_MATERIAL';
    props.traits = [ChannelMaterialTraits];
    super(name, props);
    this.props.scrolled = false;
    this.props.snackbarId = 0;
    // How long a snackbar stays. Material: 4 to 10 seconds for one with no action.
    this.props.snackbarDuration = 5000;
    this.props.dialogId = 0;
    // The dialog that is open: { dialogId, name }. None is, until one is asked for.
    this.props.dialog = null;
    this.props.pageMoveId = 0;
    // The route the visitor is on: { pageId, topicId }. Unknown until the first
    // route arrives.
    this.props.route = null;
    // How long a leaving page is given before it is removed, in ms, counted
    // from the frame in which its fade starts. The fade itself is CSS
    // (material/_motion.scss) and takes 100ms; the rest is one frame of room.
    this.props.pageExitDuration = 120;
    // How long to wait for that frame before counting anyway, in ms.
    this.props.pageExitFrameLimit = 250;
  }

  onRegistered() {
    this.channelMaterial$OnRegistered();
  }

  addRegisteredActions() {
    return [
      'CHANNEL_MATERIAL_DISMISS_EVENT',
      'CHANNEL_MATERIAL_BREAKPOINT_EVENT',
      'CHANNEL_MATERIAL_SCROLL_EVENT',
      [
        'CHANNEL_MATERIAL_SNACKBAR_REQUEST',
        'channelMaterial$OnSnackbarRequest',
      ],
      'CHANNEL_MATERIAL_SNACKBAR_SHOW_EVENT',
      'CHANNEL_MATERIAL_SNACKBAR_HIDE_EVENT',
      ['CHANNEL_MATERIAL_DIALOG_REQUEST', 'channelMaterial$OnDialogRequest'],
      'CHANNEL_MATERIAL_DIALOG_SHOW_EVENT',
      [
        'CHANNEL_MATERIAL_DIALOG_CLOSE_REQUEST',
        'channelMaterial$OnDialogCloseRequest',
      ],
      'CHANNEL_MATERIAL_DIALOG_ANSWER_EVENT',
      'CHANNEL_MATERIAL_PAGE_LEAVING_EVENT',
      'CHANNEL_MATERIAL_PAGE_LEFT_EVENT',
    ];
  }
}
