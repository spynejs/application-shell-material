import { ViewStream } from 'spyne';
import { UISkipLinkTraits } from 'traits/ui/ui-skip-link-traits.js';

// The link that skips to the page's content. It is the first thing in the app, so
// it is the first thing the keyboard reaches, before the app bar and its links. It
// is not seen until then (scss/03-components/material/_skip-link.scss).
//
// It leads nowhere by itself: a press on it is broadcast, and the stage, which
// holds the page, hears it and takes the focus (components/stage-container.js).
// Nothing loads and the address does not change.
//
// Its words are "Skip to content" until the app's model gives others, in
// `text.skipLink`.
export class UISkipLinkView extends ViewStream {
  constructor(props = {}) {
    props.tagName = 'a';
    props.class = 'skip-link btn';
    props.href = '#stage-view';
    // What the stage listens for; and the link's own going to `#stage-view` is
    // stopped, since the app's routes are not to hear of it.
    props.dataset = { skipTo: 'content', eventPreventDefault: 'true' };
    props.template = '<span class="skip-link__label">Skip to content</span>';
    props.traits = [UISkipLinkTraits];
    props.channels = ['CHANNEL_APP'];
    super(props);
  }

  addActionListeners() {
    return [['CHANNEL_APP_INIT_EVENT', 'uiSkipLink$OnAppInitEvent']];
  }

  broadcastEvents() {
    return [['.skip-link', 'click']];
  }

  onRendered() {}
}
