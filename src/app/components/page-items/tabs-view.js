import { ChannelPayloadFilter, ViewStream } from 'spyne';
import TabsTmpl from './templates/tabs-view.tmpl.html';
import { PageItemCoreTraits } from 'traits/page/page-item-core-traits.js';
import { TabsViewTraits } from 'traits/page/tabs-view-traits.js';

/**
 * A set of tabs: Material's secondary tabs over a page's lists of one kind, one
 * list shown at a time. The page makes one where the model asks for it
 * (traits/utils/tab-sets.js: the key `tabGroup` on each list).
 *
 * props.data: the tabs and the set's name (tab-sets.js, tabsData).
 * props.pageItems: the set's page items, in order. Each is put into its panel,
 * the same view and template it would be by itself on the page.
 *
 * Which tab is selected is a class, `selected`, on the tab and on its panel; the
 * styles do the rest (scss/03-components/material/_tabs.scss).
 */
export class TabsView extends ViewStream {
  constructor(props = {}) {
    props.class = 'tabs';
    props.template = TabsTmpl;
    props.channels = ['CHANNEL_UI'];
    props.traits = [TabsViewTraits, PageItemCoreTraits];
    super(props);
  }

  addActionListeners() {
    // A page may hold more than one set, and every set hears every press: each
    // takes only the presses on its own tabs, which carry its name.
    const { setId } = this.props.data;
    const ownClick = new ChannelPayloadFilter({ tabSet: setId });
    const ownKey = new ChannelPayloadFilter({ tabSet: setId });

    return [
      ['CHANNEL_UI_CLICK_EVENT', 'tabsView$OnTabClick', ownClick],
      ['CHANNEL_UI_KEYDOWN_EVENT', 'tabsView$OnTabKey', ownKey],
    ];
  }

  broadcastEvents() {
    return [
      ['.tab', 'click'],
      ['.tab', 'keydown'],
    ];
  }

  onRendered() {
    this.tabsView$AddPanels();
  }
}
