import { expect } from 'chai';
import {
  TAB_TEMPLATES,
  tabAfterKey,
  tabGroupOf,
  tabLabelOf,
  tabSets,
  tabsData,
} from '/src/app/traits/utils/tab-sets.js';

const item = (template, data = {}) => ({
  isPrototype: false,
  viewClass: 'ViewStream',
  props: { template, data },
});
const priceList = (data) => item('price-list.tmpl.html', data);
const timetable = (data) => item('timetable.tmpl.html', data);
const article = (data) => item('article.tmpl.html', data);

describe('TAB_TEMPLATES', () => {
  it('should name the price list and the timetable, and nothing else', () => {
    expect(TAB_TEMPLATES).to.deep.eq([
      'price-list.tmpl.html',
      'timetable.tmpl.html',
    ]);
  });

  it('should not be changed by the code that reads it', () => {
    expect(Object.isFrozen(TAB_TEMPLATES)).to.eq(true);
  });
});

describe('tabGroupOf', () => {
  it('should give the word a list writes as its tabGroup', () => {
    expect(tabGroupOf(priceList({ tabGroup: 'menu' }))).to.eq('menu');
    expect(tabGroupOf(timetable({ tabGroup: ' days ' }))).to.eq('days');
  });

  it('should give nothing for a list that names no group', () => {
    expect(tabGroupOf(priceList({ title: 'Breads' }))).to.eq('');
    expect(tabGroupOf(priceList({ tabGroup: '' }))).to.eq('');
    expect(tabGroupOf(priceList({ tabGroup: '   ' }))).to.eq('');
  });

  it('should give nothing for a word that is not text', () => {
    expect(tabGroupOf(priceList({ tabGroup: true }))).to.eq('');
    expect(tabGroupOf(priceList({ tabGroup: 2 }))).to.eq('');
  });

  it('should give nothing for an item that is not a list', () => {
    expect(tabGroupOf(article({ tabGroup: 'menu' }))).to.eq('');
  });

  it('should give nothing for an item with no props or no data', () => {
    expect(tabGroupOf(undefined)).to.eq('');
    expect(tabGroupOf({})).to.eq('');
    expect(tabGroupOf({ props: { template: 'price-list.tmpl.html' } })).to.eq(
      '',
    );
  });
});

describe('tabLabelOf', () => {
  it('should give the tabLabel before the title', () => {
    expect(
      tabLabelOf(priceList({ title: 'Coffee and drinks', tabLabel: 'Drinks' })),
    ).to.eq('Drinks');
  });

  it('should give the title where there is no tabLabel', () => {
    expect(tabLabelOf(priceList({ title: ' Breads ' }))).to.eq('Breads');
    expect(tabLabelOf(priceList({ title: 'Breads', tabLabel: '  ' }))).to.eq(
      'Breads',
    );
  });

  it('should give its place as a number where there is neither', () => {
    expect(tabLabelOf(priceList({}), 0)).to.eq('1');
    expect(tabLabelOf(priceList({ title: '' }), 2)).to.eq('3');
  });
});

describe('tabSets', () => {
  it('should leave a page with no groups as its items, one by one', () => {
    const items = [
      article({ title: 'About' }),
      priceList({ title: 'Breads' }),
      priceList({ title: 'Pastries' }),
    ];

    expect(tabSets(items)).to.deep.eq([
      { tabGroup: '', items: [items[0]] },
      { tabGroup: '', items: [items[1]] },
      { tabGroup: '', items: [items[2]] },
    ]);
  });

  it('should make one set of lists next to each other with the same word', () => {
    const items = [
      priceList({ title: 'Breads', tabGroup: 'menu' }),
      priceList({ title: 'Pastries', tabGroup: 'menu' }),
      priceList({
        title: 'Coffee and drinks',
        tabLabel: 'Drinks',
        tabGroup: 'menu',
      }),
    ];

    expect(tabSets(items)).to.deep.eq([
      { tabGroup: 'menu', items, labels: ['Breads', 'Pastries', 'Drinks'] },
    ]);
  });

  it('should keep what is before and after a set where it was', () => {
    const items = [
      article({ title: 'This week' }),
      timetable({ title: 'Friday', tabGroup: 'days' }),
      timetable({ title: 'Saturday', tabGroup: 'days' }),
      article({ title: 'Getting here' }),
    ];
    const parts = tabSets(items);

    expect(parts.map((part) => part.items.length)).to.deep.eq([1, 2, 1]);
    expect(parts[1].labels).to.deep.eq(['Friday', 'Saturday']);
    expect(parts[0].tabGroup).to.eq('');
    expect(parts[2].tabGroup).to.eq('');
  });

  it('should not make a set of one list', () => {
    const items = [
      priceList({ title: 'Breads', tabGroup: 'menu' }),
      article({ title: 'About' }),
    ];

    expect(tabSets(items)).to.deep.eq([
      { tabGroup: '', items: [items[0]] },
      { tabGroup: '', items: [items[1]] },
    ]);
  });

  it('should not join lists of the same word that are apart', () => {
    const items = [
      priceList({ title: 'Breads', tabGroup: 'menu' }),
      article({ title: 'A word from the baker' }),
      priceList({ title: 'Pastries', tabGroup: 'menu' }),
    ];

    expect(tabSets(items).map((part) => part.tabGroup)).to.deep.eq([
      '',
      '',
      '',
    ]);
  });

  it('should not join lists of different words', () => {
    const items = [
      priceList({ title: 'Breads', tabGroup: 'food' }),
      priceList({ title: 'Coffee', tabGroup: 'drinks' }),
    ];

    expect(tabSets(items).map((part) => part.items.length)).to.deep.eq([1, 1]);
  });

  it('should not join a price list and a timetable of the same word', () => {
    const items = [
      priceList({ title: 'Classes', tabGroup: 'gym' }),
      timetable({ title: 'This week', tabGroup: 'gym' }),
    ];

    expect(tabSets(items).map((part) => part.items.length)).to.deep.eq([1, 1]);
  });

  it('should make two sets of two words, one after the other', () => {
    const items = [
      priceList({ title: 'Breads', tabGroup: 'food' }),
      priceList({ title: 'Pastries', tabGroup: 'food' }),
      priceList({ title: 'Coffee', tabGroup: 'drinks' }),
      priceList({ title: 'Tea', tabGroup: 'drinks' }),
    ];

    expect(tabSets(items).map((part) => part.labels)).to.deep.eq([
      ['Breads', 'Pastries'],
      ['Coffee', 'Tea'],
    ]);
  });

  it('should not make a set of items that are not lists', () => {
    const items = [
      article({ title: 'One', tabGroup: 'pair' }),
      article({ title: 'Two', tabGroup: 'pair' }),
    ];

    expect(tabSets(items).map((part) => part.tabGroup)).to.deep.eq(['', '']);
  });

  it('should number a tab whose list has no words for it', () => {
    const items = [
      priceList({ title: 'Breads', tabGroup: 'menu' }),
      priceList({ tabGroup: 'menu' }),
    ];

    expect(tabSets(items)[0].labels).to.deep.eq(['Breads', '2']);
  });

  it('should give back the same page items, unchanged', () => {
    const items = [
      priceList({ title: 'Breads', tabGroup: 'menu' }),
      priceList({ title: 'Pastries', tabGroup: 'menu' }),
    ];
    const before = JSON.stringify(items);
    const [set] = tabSets(items);

    expect(set.items[0]).to.eq(items[0]);
    expect(set.items[1]).to.eq(items[1]);
    expect(JSON.stringify(items)).to.eq(before);
  });

  it('should give nothing for a page with no items', () => {
    expect(tabSets()).to.deep.eq([]);
    expect(tabSets([])).to.deep.eq([]);
  });
});

describe('tabsData', () => {
  const data = tabsData('tabs-2', ['Breads', 'Pastries', 'Drinks']);

  it('should carry the name of its set', () => {
    expect(data.setId).to.eq('tabs-2');
  });

  it('should give a tab for each label, in order', () => {
    expect(data.tabs.map((tab) => tab.label)).to.deep.eq([
      'Breads',
      'Pastries',
      'Drinks',
    ]);
    expect(data.tabs.map((tab) => tab.attrIndex)).to.deep.eq([0, 1, 2]);
  });

  it('should select the first tab and no other', () => {
    expect(data.tabs.map((tab) => tab.selectedClass)).to.deep.eq([
      'selected',
      '',
      '',
    ]);
    expect(data.tabs.map((tab) => tab.attrSelected)).to.deep.eq([
      'true',
      'false',
      'false',
    ]);
  });

  it('should put only the selected tab in the Tab order', () => {
    expect(data.tabs.map((tab) => tab.attrTabindex)).to.deep.eq([
      '0',
      '-1',
      '-1',
    ]);
  });

  it('should write the name of the set on every tab', () => {
    data.tabs.forEach((tab) => expect(tab.attrSetId).to.eq('tabs-2'));
  });

  it('should tie each tab to a panel of its own, by ids no two share', () => {
    const ids = data.tabs.flatMap((tab) => [tab.attrTabId, tab.attrPanelId]);

    expect(new Set(ids).size).to.eq(6);
    ids.forEach((id) => expect(id).to.match(/^tabs-2-(tab|panel)-\d$/));
  });

  it('should not share an id with another set of the page', () => {
    const other = tabsData('tabs-5', ['Friday', 'Saturday']);

    expect(other.tabs[0].attrTabId).to.not.eq(data.tabs[0].attrTabId);
    expect(other.tabs[0].attrPanelId).to.not.eq(data.tabs[0].attrPanelId);
  });

  it('should give no tabs for no labels', () => {
    expect(tabsData('tabs-0').tabs).to.deep.eq([]);
  });
});

describe('tabAfterKey', () => {
  it('should go to the next tab on the right arrow', () => {
    expect(tabAfterKey('ArrowRight', 0, 3)).to.eq(1);
    expect(tabAfterKey('ArrowRight', 1, 3)).to.eq(2);
  });

  it('should go to the tab before on the left arrow', () => {
    expect(tabAfterKey('ArrowLeft', 2, 3)).to.eq(1);
    expect(tabAfterKey('ArrowLeft', 1, 3)).to.eq(0);
  });

  it('should go round from the last to the first, and back', () => {
    expect(tabAfterKey('ArrowRight', 2, 3)).to.eq(0);
    expect(tabAfterKey('ArrowLeft', 0, 3)).to.eq(2);
  });

  it('should turn the arrows round in a row that runs from the right', () => {
    expect(tabAfterKey('ArrowLeft', 0, 3, true)).to.eq(1);
    expect(tabAfterKey('ArrowRight', 0, 3, true)).to.eq(2);
  });

  it('should leave every other key alone', () => {
    ['Tab', 'Enter', ' ', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'a'].forEach(
      (key) => expect(tabAfterKey(key, 0, 3), key).to.eq(null),
    );
  });

  it('should go nowhere in a row with no tabs', () => {
    expect(tabAfterKey('ArrowRight', 0, 0)).to.eq(null);
  });
});
