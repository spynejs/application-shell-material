import { ViewStream } from 'spyne';
import FooterLinksTmpl from './templates/ui-footer-links.tmpl.html';

// The footer's links: columns of them, each under a title, and one row under the
// columns for a site's pages elsewhere. The footer adds it where the app's model
// asks for links (traits/utils/footer-links.js); an app that asks for none has the
// footer it had, one line of words.
//
// A link to a page of the app is a route link: a press on it changes the route and
// loads no document. A link to somewhere else is the browser's own, and this view
// does not hear it.
//
// props.data: footerLinksOf.
export class UIFooterLinksView extends ViewStream {
  constructor(props = {}) {
    props.class = 'footer-links';
    props.template = FooterLinksTmpl;
    super(props);
  }

  addActionListeners() {
    return [];
  }

  broadcastEvents() {
    // Only where there is one: a footer whose links all lead elsewhere has
    // nothing for the route to hear.
    return this.props.data.hasRouteLinks
      ? [['a[data-channel="ROUTE"]', 'click']]
      : [];
  }

  onRendered() {}
}
