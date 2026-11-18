import { ChannelPayloadFilter, ViewStream } from 'spyne';
import { StageContainerTraits } from 'traits/app/stage-container-traits.js';

export class StageContainer extends ViewStream {
  constructor(props = {}) {
    props.id = 'stage-view';
    props.traits = [StageContainerTraits];
    props.channels = [
      'CHANNEL_APP',
      'CHANNEL_ROUTE',
      'CHANNEL_MATERIAL',
      'CHANNEL_MATERIAL_PAGES',
    ];
    props.template = `<div class="slot slot-ui"></div>
                      <div class="slot slot-page  page-container "></div>`;
    super(props);
  }

  addActionListeners() {
    // A move down a level arrives at the top of the page.
    const movedDownFilter = new ChannelPayloadFilter({
      payload: ({ transition }) =>
        transition === 'forward' || transition === 'container-transform',
    });

    // A move beginning, and a move back up a level that a page has asked to make
    // a collapse. Both come from the one channel that holds the move, as one
    // action; a view takes one listener for an action.
    const beginningFilter = new ChannelPayloadFilter({
      payload: ({ phase }) => phase === 'leaving' || phase === 'collapsing',
    });

    return [
      ['CHANNEL_APP_INIT_EVENT', 'stage$OnAppInitEvent'],
      ['CHANNEL_APP_PAGE_DATA_EVENT', 'stage$OnRouteEvent'],
      ['CHANNEL_MATERIAL_PAGE_LEFT_EVENT', 'stage$ArriveAtTop', movedDownFilter],
      ['CHANNEL_MATERIAL_PAGES_MOVE_EVENT', 'stage$OnPageMove', beginningFilter],
    ];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {
    this.stage$OnRendered();
  }
}
