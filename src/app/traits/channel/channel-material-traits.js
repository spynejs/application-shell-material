import { SpyneTrait, ChannelPayloadFilter } from 'spyne';
import {
  animationFrames,
  delay,
  delayWhen,
  filter,
  map,
  race,
  switchMap,
  timer,
} from 'rxjs';

// 'materialExtraLarge' -> 'extra-large'. The media queries for Material's breakpoints
// are declared in the app config under names that start with `material`; the rest of
// the name is the breakpoint.
const breakpointFromQueryName = (mediaQueryName) =>
  mediaQueryName
    .replace(/^material/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

// A card that is a link. In Material's terms it is a container, and a container can
// grow into the page it leads to.
const CONTAINER_LINK = 'a.page-card';

// Which of Material's transitions a move between pages takes, read from what the
// route payload says changed and from the element that was followed, if one was
// (m3.material.io, Transitions):
//   'container-transform'  down a level, by following a card: the card grows into
//                          its page;
//   'forward'              down a level by any other way: a page to one of its own
//                          sub-pages;
//   'backward'             back up a level;
//   'top-level'            anything else: between destinations, or between two
//                          pages at the same level.
// paths[0] is the route's outermost key. If that changed, the move is between
// destinations, whatever else changed with it.
const pageTransitionFromRoute = (
  { paths = [], pathsAdded = [], pathsRemoved = [], pathsChanged = [] },
  followed,
) => {
  if (pathsChanged.includes(paths[0])) {
    return 'top-level';
  }

  if (pathsAdded.length > 0) {
    return followed?.matches?.(CONTAINER_LINK) === true
      ? 'container-transform'
      : 'forward';
  }

  return pathsRemoved.length > 0 ? 'backward' : 'top-level';
};

// The route a payload describes, as a card describes the page it leads to: the
// value of each of the route's own keys. A key the route does not reach is ''.
const routeFromPayload = ({ routeData = {} }) => ({
  pageId: routeData.pageId ?? '',
  topicId: routeData.topicId ?? '',
});

export class ChannelMaterialTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'channelMaterial$';
    super(context, traitPrefix);
  }

  static channelMaterial$OnRegistered() {
    // Escape, wherever focus is. keydown is already in config.channels.WINDOW.events.
    const escapeKeyFilter = new ChannelPayloadFilter({
      action: 'CHANNEL_WINDOW_KEYDOWN_EVENT',
      event: (keyEvent) => keyEvent.key === 'Escape',
    });

    this.getChannel('CHANNEL_WINDOW', escapeKeyFilter).subscribe(
      this.channelMaterial$OnEscapeKey.bind(this),
    );

    // Going anywhere.
    const routeChangeFilter = new ChannelPayloadFilter({
      action: 'CHANNEL_ROUTE_CHANGE_EVENT',
    });

    this.getChannel('CHANNEL_ROUTE', routeChangeFilter).subscribe(
      this.channelMaterial$OnRouteChange.bind(this),
    );

    // Where the visitor started. The first route is not a change, but it is the
    // route the first move will leave.
    const firstRouteFilter = new ChannelPayloadFilter({
      action: 'CHANNEL_ROUTE_DEEPLINK_EVENT',
    });

    this.getChannel('CHANNEL_ROUTE', firstRouteFilter).subscribe(
      this.channelMaterial$OnFirstRoute.bind(this),
    );

    // A breakpoint's media query starting to match: the window has entered it. The
    // query that stopped matching is the one it left, and is not reported.
    const breakpointFilter = new ChannelPayloadFilter({
      mediaQueryName: (name) => /^material[A-Z]/.test(name),
      matches: true,
    });

    this.getChannel('CHANNEL_WINDOW', breakpointFilter).subscribe(
      this.channelMaterial$OnBreakpointEntered.bind(this),
    );

    // Scrolling. The window channel reports every scroll (debounced in the app
    // config); what Material's components need is whether the page is at its top.
    const scrollFilter = new ChannelPayloadFilter({
      action: 'CHANNEL_WINDOW_SCROLL_EVENT',
    });

    this.getChannel('CHANNEL_WINDOW', scrollFilter).subscribe(
      this.channelMaterial$OnWindowScroll.bind(this),
    );

    // A snackbar leaves by itself. This is timing, which the declared idioms do not
    // reach, so it is raw RxJS on the channel's own stream: every snackbar shown
    // starts the wait, and a newer one replaces a wait in progress.
    this.observer
      .pipe(
        filter((p) => p.action === 'CHANNEL_MATERIAL_SNACKBAR_SHOW_EVENT'),
        switchMap((p) =>
          timer(this.props.snackbarDuration).pipe(
            map(() => p.payload.snackbarId),
          ),
        ),
      )
      .subscribe(this.channelMaterial$OnSnackbarTimeUp.bind(this));

    // A leaving page is given time to fade out before it is removed. The same
    // kind of wait, on the channel's own stream. Every move gets its own: a
    // second move during the wait does not cancel the first page's removal.
    //
    // The wait is counted from the next frame the browser draws, because that
    // is when the fade starts, and it comes late: the next page is being built
    // first. Where no frame is drawn (a tab in the background) the limit stands
    // in for it, so a page still leaves.
    this.observer
      .pipe(
        filter((p) => p.action === 'CHANNEL_MATERIAL_PAGE_LEAVING_EVENT'),
        delayWhen(() =>
          race(animationFrames(), timer(this.props.pageExitFrameLimit)),
        ),
        delay(this.props.pageExitDuration),
        map((p) => p.payload),
      )
      .subscribe(this.channelMaterial$OnPageExitTimeUp.bind(this));
  }

  // A move between pages has begun: the page on screen is leaving.
  static channelMaterial$SendPageLeavingEvent(transition, from, byLink) {
    this.props.pageMoveId += 1;

    const { pageMoveId } = this.props;
    const action = 'CHANNEL_MATERIAL_PAGE_LEAVING_EVENT';

    this.sendChannelPayload(action, { pageMoveId, transition, from, byLink });
  }

  // Its time is up: a page that is leaving removes itself on this. The payload is
  // the one the move began with, so it still names the transition.
  static channelMaterial$OnPageExitTimeUp({ pageMoveId, transition, byLink }) {
    const action = 'CHANNEL_MATERIAL_PAGE_LEFT_EVENT';
    this.sendChannelPayload(action, { pageMoveId, transition, byLink });
  }

  // A view asked for a snackbar (sendInfoToChannel with the REQUEST action).
  static channelMaterial$OnSnackbarRequest(e) {
    const { message } = e.payload;

    this.props.snackbarId += 1;

    const { snackbarId } = this.props;
    const action = 'CHANNEL_MATERIAL_SNACKBAR_SHOW_EVENT';

    this.sendChannelPayload(action, { snackbarId, message });
  }

  static channelMaterial$OnSnackbarTimeUp(snackbarId) {
    const action = 'CHANNEL_MATERIAL_SNACKBAR_HIDE_EVENT';
    this.sendChannelPayload(action, { snackbarId });
  }

  static channelMaterial$OnEscapeKey() {
    this.channelMaterial$SendDismissEvent('escape');
  }

  static channelMaterial$OnFirstRoute(e) {
    this.props.route = routeFromPayload(e.payload);
  }

  static channelMaterial$OnRouteChange(e) {
    // The route the channel was on is the one this move leaves. The route payload
    // says what changed, not what it changed from, so the channel keeps it.
    const from = this.props.route;

    this.props.route = routeFromPayload(e.payload);

    this.channelMaterial$SendDismissEvent('route');
    // srcElement is the link that was followed. A move by the browser's history
    // has none, and that is how the two are told apart (`byLink`): the route's
    // own `isHistory` is false for a Back that lands on the page first loaded.
    this.channelMaterial$SendPageLeavingEvent(
      pageTransitionFromRoute(e.payload, e.srcElement?.el),
      from,
      e.srcElement?.el !== undefined,
    );
  }

  static channelMaterial$SendDismissEvent(reason) {
    const action = 'CHANNEL_MATERIAL_DISMISS_EVENT';
    this.sendChannelPayload(action, { reason });
  }

  static channelMaterial$OnWindowScroll(e) {
    const { scrollY } = e.payload;
    const scrolled = scrollY > 0;

    // Only the change is an event.
    if (scrolled === this.props.scrolled) {
      return;
    }

    this.props.scrolled = scrolled;

    const action = 'CHANNEL_MATERIAL_SCROLL_EVENT';
    this.sendChannelPayload(action, { scrolled });
  }

  static channelMaterial$OnBreakpointEntered(e) {
    const { mediaQueryName } = e.payload;
    const breakpoint = breakpointFromQueryName(mediaQueryName);
    const action = 'CHANNEL_MATERIAL_BREAKPOINT_EVENT';

    this.sendChannelPayload(action, { breakpoint });
  }
}
