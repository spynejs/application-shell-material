import { Channel } from 'spyne';
import { ChannelMaterialPagesTraits } from 'traits/channel/channel-material-pages-traits.js';

// A sub-channel of the Material channel, for what the pages and the stage share and
// no other Material component needs: the move between pages that is under way.
//
// It listens to the main channel (CHANNEL_MATERIAL) for a move beginning and ending,
// and holds the move in full. It has one action out, which always carries the whole
// of it:
//
//   CHANNEL_MATERIAL_PAGES_MOVE_EVENT
//     payload: { pageMoveId, transition, from, phase }
//       transition  as the main channel named it: 'top-level' | 'forward' |
//                   'backward' | 'container-transform'
//       from        the route being left: { pageId, topicId }
//       phase       'idle'        no move has been made yet
//                   'leaving'     the move has begun
//                   'collapsing'  a page has found the card the move returns to, and
//                                 the page being left is to collapse into it
//                   'arrived'     the pages have changed places
//                   'left'        the page that was leaving has gone
//
// And two in, from views:
//
//   CHANNEL_MATERIAL_PAGES_COLLAPSE_REQUEST  from the page that has the card:
//                                            { pageMoveId }
//   CHANNEL_MATERIAL_PAGES_ARRIVE_REQUEST    from the stage, as it changes the
//                                            pages over: { pageMoveId }
//
// It replays, which is why it exists. A page is created by the same route change
// that begins a move, and may be created before or after the main channel says so.
// The main channel's actions are moments and are not replayed. Here the latest state
// is handed to whoever subscribes, so a page learns of the move that made it either
// way. Because one payload is all a late subscriber gets, every payload is complete.
export class ChannelMaterialPages extends Channel {
  constructor(name, props = {}) {
    name = 'CHANNEL_MATERIAL_PAGES';
    props.replay = true;
    props.traits = [ChannelMaterialPagesTraits];
    super(name, props);
    this.props.move = ChannelMaterialPagesTraits.channelMaterialPages$IdleMove();
  }

  onRegistered() {
    this.channelMaterialPages$OnRegistered();
  }

  addRegisteredActions() {
    return [
      'CHANNEL_MATERIAL_PAGES_MOVE_EVENT',
      [
        'CHANNEL_MATERIAL_PAGES_COLLAPSE_REQUEST',
        'channelMaterialPages$OnCollapseRequest',
      ],
      [
        'CHANNEL_MATERIAL_PAGES_ARRIVE_REQUEST',
        'channelMaterialPages$OnArriveRequest',
      ],
    ];
  }
}
