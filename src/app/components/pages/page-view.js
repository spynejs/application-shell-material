import {
  ChannelPayloadFilter,
  ViewStream,
  safeClone,
  SpyneAppProperties,
} from 'spyne';
import { PageItemCoreTraits } from 'traits/page/page-item-core-traits.js';
import { PageLeaveTraits } from 'traits/page/page-leave-traits.js';
import { PageReturnTraits } from 'traits/page/page-return-traits.js';
import PageTmpl from './templates/page.tmpl.html';

export class PageView extends ViewStream {
  constructor(props = {}) {
    props.class = `page-view page-view-${props?.data?.pageId}`;
    // CHANNEL_MATERIAL_PAGES replays, and is joined plain: what it replays is the
    // move that made this page, which the page is meant to receive.
    props.channels = [
      ['CHANNEL_ROUTE', true],
      'CHANNEL_MATERIAL',
      'CHANNEL_MATERIAL_PAGES',
    ];
    props.traits = [PageItemCoreTraits, PageLeaveTraits, PageReturnTraits];
    props.data = safeClone(props.data);
    props.data.href = SpyneAppProperties.getHrefFromData(props.data);
    props.template = PageTmpl;

    super(props);
  }
  addActionListeners() {
    // The page marks itself as leaving on the route change, and removes itself
    // when the Material channel says the page has left. The filter is the exit
    // condition: a page that is not leaving stays.
    const isLeavingFilter = new ChannelPayloadFilter({
      payload: () => this.props.isLeaving === true,
    });

    return [
      ['CHANNEL_ROUTE_CHANGE_EVENT', 'pageLeave$OnRouteChange'],
      ['CHANNEL_MATERIAL_PAGE_LEFT_EVENT', 'disposeViewStream', isLeavingFilter],
      ['CHANNEL_MATERIAL_PAGES_MOVE_EVENT', 'pageReturn$OnPageMove'],
    ];
  }

  broadcastEvents() {
    return [['a', 'click']];
  }

  onRendered() {
    this.pageItemCore$onRendered();
    this.pageReturn$OnRendered();
  }
}
