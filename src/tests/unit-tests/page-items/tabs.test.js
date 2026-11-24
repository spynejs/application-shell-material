import { expect } from 'chai';
import { DomElementTemplate, SpyneApp } from 'spyne';
import TabsTmpl from '/src/app/components/page-items/templates/tabs-view.tmpl.html';
import { tabsData } from '/src/app/traits/utils/tab-sets.js';

// A set of tabs is a template and the data it is given (tab-sets.js, tabsData):
// what is held here is what the template draws from that data, before a tab is
// pressed. Its lists are put into the panels by the view, and are not here.

// A template is drawn through the app's sanitizer, which the app sets up as it
// starts.
before(() => {
  SpyneApp.init({ debug: false });
});

const render = (data) => {
  const el = document.createElement('div');

  el.appendChild(new DomElementTemplate(TabsTmpl, data).renderDocFrag());

  return el;
};

describe('the tabs template', () => {
  let el;
  let tabs;
  let panels;

  // Drawn once the app's sanitizer is set up (the `before` above), not while the
  // tests are being read.
  before(() => {
    el = render(tabsData('tabs-1', ['Breads', 'Pastries', 'Drinks']));
    tabs = [...el.querySelectorAll('[role="tab"]')];
    panels = [...el.querySelectorAll('[role="tabpanel"]')];
  });

  it('should draw a tab for each label, in a list of tabs', () => {
    expect(el.querySelectorAll('[role="tablist"]').length).to.eq(1);
    expect(tabs.map((tab) => tab.textContent.trim())).to.deep.eq([
      'Breads',
      'Pastries',
      'Drinks',
    ]);
    tabs.forEach((tab) => {
      expect(tab.closest('[role="tablist"]')).to.not.eq(null);
      expect(tab.tagName).to.eq('BUTTON');
      expect(tab.getAttribute('type')).to.eq('button');
    });
  });

  it('should draw a panel for each tab, outside the list of tabs', () => {
    expect(panels.length).to.eq(3);
    panels.forEach((panel) => {
      expect(panel.closest('[role="tablist"]')).to.eq(null);
    });
  });

  it('should tie each tab to its panel, both ways', () => {
    tabs.forEach((tab, index) => {
      expect(tab.getAttribute('aria-controls')).to.eq(panels[index].id);
      expect(panels[index].getAttribute('aria-labelledby')).to.eq(tab.id);
    });
  });

  it('should select the first tab and its panel, and no other', () => {
    expect(tabs.map((tab) => tab.classList.contains('selected'))).to.deep.eq([
      true,
      false,
      false,
    ]);
    expect(
      panels.map((panel) => panel.classList.contains('selected')),
    ).to.deep.eq([true, false, false]);
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).to.deep.eq([
      'true',
      'false',
      'false',
    ]);
  });

  it('should put only the selected tab in the Tab order', () => {
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).to.deep.eq([
      '0',
      '-1',
      '-1',
    ]);
  });

  it('should write on each tab what a press carries: its set and its place', () => {
    expect(tabs.map((tab) => tab.dataset.tabSet)).to.deep.eq([
      'tabs-1',
      'tabs-1',
      'tabs-1',
    ]);
    expect(tabs.map((tab) => tab.dataset.tabIndex)).to.deep.eq(['0', '1', '2']);
    expect(panels.map((panel) => panel.dataset.tabIndex)).to.deep.eq([
      '0',
      '1',
      '2',
    ]);
  });

  it('should leave the panels empty, for the view to fill', () => {
    panels.forEach((panel) => expect(panel.children.length).to.eq(0));
  });
});
