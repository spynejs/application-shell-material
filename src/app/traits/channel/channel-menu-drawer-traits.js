import { SpyneTrait, ChannelPayloadFilter } from 'spyne';

export class ChannelMenuDrawerTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'channelMenuDrawer$';
    super(context, traitPrefix);
  }

  static channelMenuDrawer$OnRegistered() {
    const menuDrawerBtnFilter = new ChannelPayloadFilter({
      propFilters: {
        eventType: 'menuDrawer',
      },
    });

    const appInitFilter = new ChannelPayloadFilter({
      action: 'CHANNEL_APP_INIT_EVENT',
    });

    this.getChannel('CHANNEL_UI', menuDrawerBtnFilter).subscribe(
      this.channelMenuDrawer$OnUiClick.bind(this),
    );

    this.getChannel('CHANNEL_APP', appInitFilter).subscribe(
      this.channelMenuDrawer$OnMenuDrawerInit.bind(this),
    );

    // The drawer is a Material component, so what closes it from outside comes from
    // the main Material channel: a dismiss (Escape, or going anywhere) and the window
    // entering another breakpoint. This channel no longer listens to CHANNEL_WINDOW
    // or CHANNEL_ROUTE for either.
    const materialCloseActions = [
      'CHANNEL_MATERIAL_DISMISS_EVENT',
      'CHANNEL_MATERIAL_BREAKPOINT_EVENT',
    ];

    const materialCloseFilter = new ChannelPayloadFilter({
      action: (action) => materialCloseActions.includes(action),
    });

    this.getChannel('CHANNEL_MATERIAL', materialCloseFilter).subscribe(
      this.channelMenuDrawer$OnCloseRequest.bind(this),
    );
  }

  static channelMenuDrawer$OnCloseRequest() {
    this.channelMenuDrawer$SendMenuDrawerEvent(false);
  }

  static channelMenuDrawer$OnMenuDrawerInit(e) {
    const { initData } = e.payload;
    const { isDeepLink, routeData } = initData;
    const action = 'CHANNEL_MENU_DRAWER_INIT_EVENT';

    this.sendChannelPayload(action, {
      initData,
      isDeepLink,
      routeData,
    });
  }

  static channelMenuDrawer$OnUiClick(e) {
    const { isHamburger } = e.payload;

    // The toggle flips the drawer; anything else marked menuDrawer (the scrim)
    // closes it. Open or closed is the channel's state, not a class in the DOM.
    const isHamburgerBtn = isHamburger === 'true';
    const show = isHamburgerBtn === true && this.props.showMenu === false;

    this.channelMenuDrawer$SendMenuDrawerEvent(show);
  }

  static channelMenuDrawer$SendMenuDrawerEvent(b = true) {
    // Closing a closed drawer is not a change, so it is not an event: Escape and
    // route changes arrive all the time, and each HIDE moves focus to the toggle.
    if (b === false && this.props.showMenu === false) {
      return;
    }

    this.props.showMenu = b;

    const action =
      b === true
        ? 'CHANNEL_MENU_DRAWER__SHOW_EVENT'
        : 'CHANNEL_MENU_DRAWER__HIDE_EVENT';
    this.sendChannelPayload(action, { action });
  }
}
