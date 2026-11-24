import { ViewStream } from 'spyne';
import NavDestinationsTmpl from './templates/nav-destinations-view.tmpl.html';
import { NavDestinationsViewTraits } from 'traits/nav/nav-destinations-view-traits.js';

/**
 * The app's destinations, each an icon over a label: Material's navigation bar
 * in a window under 600px. The styles decide whether it shows and how it is
 * laid out (scss/03-components/material/_navigation-bar.scss); this view only
 * holds the links and marks the one you are on.
 *
 * props.data: the destinations (traits/utils/nav-icons.js, navDestinations).
 * props.pageId: the page the app opened on.
 */
export class NavDestinationsView extends ViewStream {
  constructor(props = {}) {
    props.id = 'nav-destinations';
    props.tagName = 'nav';
    props.class = 'nav-destinations';
    // The header's links are "Main Navigation"; two navigations in one page
    // need two names.
    props['aria-label'] = 'Destinations';
    props.template = NavDestinationsTmpl;
    props.traits = [NavDestinationsViewTraits];
    // Born from CHANNEL_APP's own event, so it takes the channel without the
    // replay: it is told the page it opened on (props.pageId).
    props.channels = [['CHANNEL_APP', true]];
    super(props);
  }

  addActionListeners() {
    return [['CHANNEL_APP_PAGE_DATA_EVENT', 'navDestinations$OnPageEvent']];
  }

  broadcastEvents() {
    return [['a', 'click']];
  }

  onRendered() {
    this.navDestinations$MarkSelected();
  }
}
