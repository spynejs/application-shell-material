import { ChannelPayloadFilter, ViewStream } from 'spyne';
import { PageLeaveTraits } from 'traits/page/page-leave-traits.js';
import PageTmpl from './templates/page-404.tmpl.html';

export class Page404View extends ViewStream {
  constructor(props = {}) {
    props.id = 'page-404';
    props.channels = [['CHANNEL_ROUTE', true], 'CHANNEL_MATERIAL'];
    props.traits = [PageLeaveTraits];
    props.template = PageTmpl;
    super(props);
  }

  addActionListeners() {
    // As a page does (page-view.js): leaving on the route change, removed when
    // the Material channel says the page has left.
    const isLeavingFilter = new ChannelPayloadFilter({
      payload: () => this.props.isLeaving === true,
    });

    return [
      ['CHANNEL_ROUTE_CHANGE_EVENT', 'pageLeave$OnRouteChange'],
      ['CHANNEL_MATERIAL_PAGE_LEFT_EVENT', 'disposeViewStream', isLeavingFilter],
    ];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {}
}
