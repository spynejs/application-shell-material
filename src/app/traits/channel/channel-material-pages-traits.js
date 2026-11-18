import { SpyneTrait, ChannelPayloadFilter } from 'spyne';

export class ChannelMaterialPagesTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'channelMaterialPages$';
    super(context, traitPrefix);
  }

  static channelMaterialPages$IdleMove() {
    return { pageMoveId: 0, transition: null, from: null, phase: 'idle' };
  }

  static channelMaterialPages$OnRegistered() {
    // A replaying channel gives its first subscriber something to receive.
    this.channelMaterialPages$SendMove();

    const leavingFilter = new ChannelPayloadFilter({
      action: 'CHANNEL_MATERIAL_PAGE_LEAVING_EVENT',
    });

    this.getChannel('CHANNEL_MATERIAL', leavingFilter).subscribe(
      this.channelMaterialPages$OnPageLeaving.bind(this),
    );

    const leftFilter = new ChannelPayloadFilter({
      action: 'CHANNEL_MATERIAL_PAGE_LEFT_EVENT',
    });

    this.getChannel('CHANNEL_MATERIAL', leftFilter).subscribe(
      this.channelMaterialPages$OnPageLeft.bind(this),
    );
  }

  // The state, whole, on every change.
  static channelMaterialPages$SendMove() {
    const action = 'CHANNEL_MATERIAL_PAGES_MOVE_EVENT';
    this.sendChannelPayload(action, { ...this.props.move });
  }

  static channelMaterialPages$SetPhase(phase) {
    this.props.move = { ...this.props.move, phase };
    this.channelMaterialPages$SendMove();
  }

  // A move has begun: it replaces whatever move was held.
  static channelMaterialPages$OnPageLeaving(e) {
    const { pageMoveId, transition, from } = e.payload;

    this.props.move = { pageMoveId, transition, from, phase: 'leaving' };
    this.channelMaterialPages$SendMove();
  }

  // The leaving page's time is up. Only the move that is held can end; the end of
  // an earlier one, overtaken by a second move, changes nothing here.
  static channelMaterialPages$OnPageLeft(e) {
    if (e.payload.pageMoveId === this.props.move.pageMoveId) {
      this.channelMaterialPages$SetPhase('left');
    }
  }

  // A page has the card that this move returns to. That makes a move back up a
  // level a collapse; it is asked for once, while the move is beginning.
  static channelMaterialPages$OnCollapseRequest(e) {
    const { pageMoveId, transition, phase } = this.props.move;
    const isThisMove = e.payload.pageMoveId === pageMoveId;

    if (isThisMove && transition === 'backward' && phase === 'leaving') {
      this.channelMaterialPages$SetPhase('collapsing');
    }
  }

  // The stage has changed the pages over.
  static channelMaterialPages$OnArriveRequest(e) {
    const { pageMoveId, phase } = this.props.move;

    if (e.payload.pageMoveId === pageMoveId && phase === 'collapsing') {
      this.channelMaterialPages$SetPhase('arrived');
    }
  }
}
