/**
 * Which of a page's items are shown under tabs, one at a time.
 *
 * A page's items are drawn one under another. Lists of one kind that sit together
 * (a menu's price lists, a program's days) may be a set of tabs instead: each list
 * says so in the model, with the key `tabGroup` in its `props.data`, the same word
 * on each. Items next to each other, of one kind, with the same word, are one set.
 * Nothing here makes a set that the model has not asked for.
 *
 * To put two lists under tabs, write the same `tabGroup` on both in
 * app.model.json. To take a list out of its set, remove the key. To give a tab
 * shorter words than its list's title, write `tabLabel` beside it.
 */

/**
 * The templates whose items may be a set of tabs. To let another kind of page item
 * take tabs, add its template's name here.
 */
export const TAB_TEMPLATES = Object.freeze([
  'price-list.tmpl.html',
  'timetable.tmpl.html',
]);

const wordsOf = (value) => (typeof value === 'string' ? value.trim() : '');

/** The word a page item gives for its set of tabs, or '' when it is in none. */
export const tabGroupOf = (pageItem) => {
  const { template, data } = pageItem?.props ?? {};

  return TAB_TEMPLATES.includes(template) ? wordsOf(data?.tabGroup) : '';
};

/**
 * The words on a page item's tab: its `tabLabel`, or its `title`. An item that has
 * neither gets its place in the set as a number, so that no tab is empty.
 */
export const tabLabelOf = (pageItem, index = 0) => {
  const { tabLabel, title } = pageItem?.props?.data ?? {};

  return wordsOf(tabLabel) || wordsOf(title) || String(index + 1);
};

const isSameSet = (a, b) =>
  tabGroupOf(a) !== '' &&
  tabGroupOf(a) === tabGroupOf(b) &&
  a.props.template === b.props.template;

/**
 * A page's items in the order the model has them, as the parts a page draws: an
 * item by itself, or a set of tabs.
 *
 *   { tabGroup: '', items: [pageItem] }                     an item by itself
 *   { tabGroup: 'menu', items: [...], labels: ['Breads', ...] }   a set of tabs
 *
 * A set is two or more items next to each other. One item that names a group by
 * itself is an item by itself: one tab is not tabs. The page items are not
 * changed, and the same objects come back.
 */
export const tabSets = (pageItems = []) => {
  const parts = [];

  pageItems.forEach((pageItem) => {
    const last = parts[parts.length - 1];

    if (last && isSameSet(last.items[last.items.length - 1], pageItem)) {
      last.items.push(pageItem);
    } else {
      parts.push({ tabGroup: tabGroupOf(pageItem), items: [pageItem] });
    }
  });

  return parts.map(({ tabGroup, items }) =>
    items.length > 1
      ? { tabGroup, items, labels: items.map(tabLabelOf) }
      : { tabGroup: '', items },
  );
};

/**
 * What a set's view draws: a tab and a panel for each list, the first selected.
 *
 * `setId` is the set's name on its page (the page gives each set its own). It is
 * written on every tab, so that a press on a tab is known for its own set's; and
 * the ids that tie a tab to its panel for assistive technology are made of it.
 *
 * A template's loop reads only its own item, so each tab carries everything its
 * markup needs. Keys that land in an attribute begin with `attr`.
 */
export const tabsData = (setId, labels = []) => ({
  setId,
  tabs: labels.map((label, index) => ({
    label,
    selectedClass: index === 0 ? 'selected' : '',
    attrSetId: setId,
    attrIndex: index,
    attrTabId: `${setId}-tab-${index}`,
    attrPanelId: `${setId}-panel-${index}`,
    attrSelected: String(index === 0),
    attrTabindex: index === 0 ? '0' : '-1',
  })),
});

/**
 * The tab an arrow key goes to from the tab at `index`, in a row of `count`: the
 * next one for the arrow that points the way the row runs, the one before for the
 * other, round from the last to the first and back. `null` for any other key.
 *
 * `isRightToLeft`: the row runs from the right, as in Arabic, and the arrows are
 * the other way round.
 */
export const tabAfterKey = (key, index, count, isRightToLeft = false) => {
  const forward = isRightToLeft ? 'ArrowLeft' : 'ArrowRight';
  const back = isRightToLeft ? 'ArrowRight' : 'ArrowLeft';

  if (count < 1 || (key !== forward && key !== back)) {
    return null;
  }

  return (index + (key === forward ? 1 : count - 1)) % count;
};
