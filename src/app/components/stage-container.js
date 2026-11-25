import { ChannelPayloadFilter, ViewStream } from 'spyne';
import { StageContainerTraits } from 'traits/app/stage-container-traits.js';

export class StageContainer extends ViewStream {
  constructor(props = {}) {
    props.id = 'stage-view';
    // It can be given the focus, by the link that skips to the content, and is
    // not a stop of its own for the Tab key.
    props.tabindex = -1;
    props.traits = [StageContainerTraits];
    props.channels = [
      'CHANNEL_UI',
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
    // A move arrives at the top of the page: one down a level, and one between
    // destinations that began on a link. A move between destinations by the
    // browser's own Back or Forward is left alone: the browser puts the window
    // back where that page was left. (A move back up a level has its own way,
    // to the card it came from.)
    const movedDownFilter = new ChannelPayloadFilter({
      payload: ({ transition, byLink }) =>
        transition === 'forward' ||
        transition === 'container-transform' ||
        (transition === 'top-level' && byLink === true),
    });

    // A move beginning, and a move back up a level that a page has asked to make
    // a collapse. Both come from the one channel that holds the move, as one
    // action; a view takes one listener for an action.
    const beginningFilter = new ChannelPayloadFilter({
      payload: ({ phase }) => phase === 'leaving' || phase === 'collapsing',
    });

    // The link that skips to the content. Every view's presses are on the UI
    // channel: only that link's is taken.
    const skipFilter = new ChannelPayloadFilter({ skipTo: 'content' });

    return [
      ['CHANNEL_UI_CLICK_EVENT', 'stage$OnSkipToContent', skipFilter],
      ['CHANNEL_APP_INIT_EVENT', 'stage$OnAppInitEvent'],
      ['CHANNEL_APP_PAGE_DATA_EVENT', 'stage$OnRouteEvent'],
      [
        'CHANNEL_MATERIAL_PAGE_LEFT_EVENT',
        'stage$ArriveAtTop',
        movedDownFilter,
      ],
      [
        'CHANNEL_MATERIAL_PAGES_MOVE_EVENT',
        'stage$OnPageMove',
        beginningFilter,
      ],
    ];
  }

  broadcastEvents() {
    return [];
  }

  onRendered() {
    this.stage$OnRendered();
  }
}
