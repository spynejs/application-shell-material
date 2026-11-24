import { ViewStream } from 'spyne';
import FabTmpl from './templates/material-fab.tmpl.html';

// The app's floating action button: Material's extended FAB, an icon and one or two
// words. It is a link to a page of the app, so it is a ROUTE anchor: the route's ids
// are its dataset, and a press on it loads no document.
//
// props.data: what it draws and where it leads (traits/utils/fab.js, fabOf).
//
// It has no state of its own. Whether it is shown is its host's
// (material-fab-host-view.js).
export class MaterialFabView extends ViewStream {
  constructor(props = {}) {
    const { attrHref, attrPageId, attrTopicId } = props.data;

    props.id = 'material-fab';
    props.tagName = 'a';
    props.class = 'fab';
    props.href = attrHref;
    // Every level of the route is said: an empty topic id is a page with no
    // sub-page, and `endRoute` ends the route there.
    props.dataset = {
      channel: 'ROUTE',
      eventPreventDefault: 'true',
      pageId: attrPageId,
      topicId: attrTopicId,
      endRoute: 'true',
    };
    props.template = FabTmpl;
    super(props);
  }

  addActionListeners() {
    return [];
  }

  broadcastEvents() {
    return [['#material-fab', 'click']];
  }

  onRendered() {}
}
