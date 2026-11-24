import { SpyneTrait } from 'spyne';
import { UIHeaderView } from 'components/ui-elements/ui-header-view.js';
import { UIMenuDrawerView } from 'components/ui-elements/ui-menu-drawer-view.js';
import { StageContainer } from 'components/stage-container.js';
import { UIFooterView } from 'components/ui-elements/ui-footer-view.js';
import { NavDestinationsView } from 'components/nav/nav-destinations-view.js';
import { MaterialSnackbarHostView } from 'components/material/material-snackbar-host-view.js';
import { MaterialFabHostView } from 'components/material/material-fab-host-view.js';
import { MaterialRippleNullView } from 'components/material/material-ripple-null-view.js';
import { LocalStorageNullView } from 'components/ui-elements/null-views/local-storage-null-view.js';

export class AppContainerTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'app$';
    super(context, traitPrefix);
  }

  static app$SetTheme(theme = 'dark', props = this.props) {
    props.el.dataset.theme = theme;
  }

  static app$OnLocalStorageEvent(e) {
    const { theme } = e.payload;
    this.app$SetTheme(theme);
  }

  static app$OnSettingsEvent(e) {
    const { settingsType, settingsValue } = e.payload;

    // CHANNEL_APP holds the mode; this view only applies it. Flipping the
    // attribute locally would drift from what the storage channel persisted.
    if (settingsType === 'theme') {
      this.app$SetTheme(settingsValue);
    }
  }

  /**
   * The app's destinations, for a navigation bar. The app says how many it has
   * (`data-destinations`), and the styles go by that: Material gives a bar to
   * three to five destinations, and room is made for it on the page only where
   * there is one (scss/03-components/material/_navigation-bar.scss).
   */
  static app$OnAppInitEvent(e) {
    const { pageId, initData } = e.payload;
    const data = initData.navDestinations;

    this.props.el.dataset.destinations = data.length;
    this.appendView(new NavDestinationsView({ data, pageId }));
  }

  static app$OnAppViewRendered() {
    this.appendView(new UIHeaderView());
    this.appendView(new UIMenuDrawerView());
    this.appendView(new StageContainer());
    this.appendView(new UIFooterView());
    this.appendView(new MaterialSnackbarHostView());
    this.appendView(new MaterialFabHostView());
    new LocalStorageNullView().appendToNull();
    new MaterialRippleNullView().appendToNull();
  }
}
