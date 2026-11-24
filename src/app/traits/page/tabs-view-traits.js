import { SpyneTrait } from 'spyne';
import { tabAfterKey } from 'traits/utils/tab-sets.js';

export class TabsViewTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'tabsView$';
    super(context, traitPrefix);
  }

  /**
   * Puts each of the set's page items into its panel: the page's own way of
   * adding an item (pageItemCore$AddPageItem), told where to put it.
   */
  static tabsView$AddPanels(pageItems = this.props.pageItems ?? []) {
    pageItems.forEach((pageItem, index) => {
      this.pageItemCore$AddPageItem({
        ...pageItem,
        container: { selector: `.tab-panel[data-tab-index='${index}']` },
      });
    });
  }

  /**
   * Selects the tab at `index`: the class the styles read, on the tab and on its
   * panel, and for assistive technology which tab is selected. Only the selected
   * tab is in the keyboard's Tab order; the arrow keys reach the others.
   *
   * `byKeyboard`: the keyboard's focus goes to the tab with it.
   */
  static tabsView$Select(index, byKeyboard = false) {
    const tabs$ = this.props.el$('.tab');
    const panels$ = this.props.el$('.tab-panel');
    const at = (el) => el.dataset.tabIndex === String(index);
    const tab = tabs$.els.find(at);
    const before = tabs$.els.find((el) => el.classList.contains('selected'));

    if (tab === undefined || tab === before) {
      return;
    }

    TabsViewTraits.tabsView$StartIndicatorFrom(tab, before);
    tabs$.setActiveItem('selected', tab);
    panels$.setActiveItem('selected', panels$.els.find(at));
    tabs$.els.forEach((el) => {
      el.setAttribute('aria-selected', String(el === tab));
      el.setAttribute('tabindex', el === tab ? '0' : '-1');
    });

    if (byKeyboard) {
      tab.focus();
    }
    // In a row too long for its window, the selected tab is brought into it.
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  /**
   * Material's underline moves from the tab that was selected to the one that
   * is. Each tab has its own underline; the styles start the new one where the
   * old one was and let it run to its place. This says where that was, as two
   * custom properties on the tab: how far away, and how wide by comparison.
   */
  static tabsView$StartIndicatorFrom(tab, before) {
    if (before === undefined) {
      return;
    }

    const to = tab.getBoundingClientRect();
    const from = before.getBoundingClientRect();

    if (to.width === 0) {
      return;
    }

    tab.style.setProperty('--_indicator-from', `${from.left - to.left}px`);
    tab.style.setProperty('--_indicator-scale', `${from.width / to.width}`);
  }

  static tabsView$OnTabClick(e) {
    this.tabsView$Select(Number(e.payload.tabIndex));
  }

  /**
   * The arrow keys move between tabs, and the tab they reach is selected.
   * Every other key is left to the browser: Tab goes on into the panel, Enter
   * and Space press the tab.
   */
  static tabsView$OnTabKey(e) {
    const count = this.props.el$('.tab').els.length;
    const isRightToLeft = getComputedStyle(this.props.el).direction === 'rtl';
    const next = tabAfterKey(
      e.event.key,
      Number(e.payload.tabIndex),
      count,
      isRightToLeft,
    );

    if (next !== null) {
      this.tabsView$Select(next, true);
    }
  }
}
