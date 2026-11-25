import { expect } from 'chai';
import { DomElementTemplate, SpyneApp } from 'spyne';
import FooterLinksTmpl from '/src/app/components/ui-elements/templates/ui-footer-links.tmpl.html';
import { UIFooterLinksView } from '/src/app/components/ui-elements/ui-footer-links-view.js';
import { UISkipLinkView } from '/src/app/components/ui-elements/ui-skip-link-view.js';
import { StageContainer } from '/src/app/components/stage-container.js';
import { footerLinksOf } from '/src/app/traits/utils/footer-links.js';

// What the footer's links draw from what they are given, and what the link that
// skips to the content and the stage it leads to are made of. That the keyboard
// reaches the link first, and where the focus then goes, is held in a browser.

// A template is drawn through the app's sanitizer, which the app sets up as it
// starts.
before(() => {
  SpyneApp.init({ debug: false });
});

const hrefOf = ({ pageId, topicId }) =>
  `/${[pageId, topicId].filter((id) => id !== '').join('/')}`;

const data = footerLinksOf(
  {
    content: [
      { pageId: 'menu' },
      { pageId: 'classes', content: [{ topicId: 'beginners' }] },
    ],
    footer: {
      columns: [
        {
          title: 'Visit',
          links: [
            { label: 'Menu', attrPageId: 'menu' },
            {
              label: 'Beginners',
              attrPageId: 'classes',
              attrTopicId: 'beginners',
            },
          ],
        },
        {
          title: 'Elsewhere',
          links: [{ label: 'Our shop', attrHref: 'https://shop.example.com' }],
        },
      ],
      social: [
        { label: 'Instagram', attrHref: 'https://www.instagram.com/example' },
      ],
    },
  },
  hrefOf,
);

const draw = () => {
  const el = document.createElement('div');

  el.appendChild(new DomElementTemplate(FooterLinksTmpl, data).renderDocFrag());

  return el;
};

describe("the footer's links, as drawn", () => {
  it('should draw a column for each, its title over its list', () => {
    const columns = [...draw().querySelectorAll('.footer-links__column')];

    expect(columns).to.have.lengthOf(2);
    expect(
      columns.map((c) =>
        c.querySelector('.footer-links__title').textContent.trim(),
      ),
    ).to.deep.eq(['Visit', 'Elsewhere']);
    expect(columns.map((c) => c.querySelectorAll('li a').length)).to.deep.eq([
      2, 1,
    ]);
  });

  it("should name each list by its column's title", () => {
    draw()
      .querySelectorAll('.footer-links__column')
      .forEach((column) => {
        const title = column.querySelector('.footer-links__title');
        const list = column.querySelector('ul');

        expect(title.id).to.not.eq('');
        expect(list.getAttribute('aria-labelledby')).to.eq(title.id);
      });
  });

  it('should write a link to a page of the app as a route link', () => {
    const [menu, beginners] = draw().querySelectorAll(
      '.footer-links__column a',
    );

    expect(menu.textContent.trim()).to.eq('Menu');
    expect(menu.dataset.channel).to.eq('ROUTE');
    expect(menu.dataset.pageId).to.eq('menu');
    expect(menu.dataset.topicId).to.eq('');
    expect(menu.dataset.endRoute).to.eq('true');
    expect(menu.getAttribute('href')).to.eq('/menu');
    expect(beginners.dataset.topicId).to.eq('beginners');
    expect(beginners.getAttribute('href')).to.eq('/classes/beginners');
  });

  it('should write a link to somewhere else as the browser’s own, in a new tab', () => {
    const shop = draw().querySelectorAll('.footer-links__column a')[2];

    expect(shop.getAttribute('href')).to.eq('https://shop.example.com');
    expect(shop.getAttribute('target')).to.eq('_blank');
    expect(shop.getAttribute('rel')).to.include('noopener');
    expect(shop.dataset.channel).to.not.eq('ROUTE');
  });

  it('should draw the row under the columns, and say how many each has', () => {
    const el = draw();

    expect(
      [...el.querySelectorAll('.footer-links__social a')].map((a) =>
        a.textContent.trim(),
      ),
    ).to.deep.eq(['Instagram']);
    expect(el.querySelector('.footer-links__columns').dataset.count).to.eq('2');
    expect(el.querySelector('.footer-links__social').dataset.count).to.eq('1');
  });

  it('should hear only the links to pages of the app', () => {
    const heard = new UIFooterLinksView({ data }).broadcastEvents();
    const elsewhere = new UIFooterLinksView({
      data: { ...data, hasRouteLinks: false },
    }).broadcastEvents();

    expect(heard).to.deep.eq([['a[data-channel="ROUTE"]', 'click']]);
    expect(elsewhere).to.deep.eq([]);
  });
});

// A view has no element until it is added to a page. What is held is what each
// view is given to make its element from.
describe('the link that skips to the content', () => {
  it('should be a link with words, that says where it skips to', () => {
    const { props } = new UISkipLinkView();

    expect(props.tagName).to.eq('a');
    expect(props.class.split(' ')).to.include('skip-link');
    expect(props.dataset.skipTo).to.eq('content');
    expect(props.href).to.eq('#stage-view');
    expect(props.template).to.include('Skip to content');
  });

  it('should have its press heard, and its own going stopped', () => {
    const view = new UISkipLinkView();

    expect(view.broadcastEvents()).to.deep.eq([['.skip-link', 'click']]);
    expect(view.props.dataset.eventPreventDefault).to.eq('true');
  });

  it('should lead to a stage that can take the focus and listens for it', () => {
    const stage = new StageContainer();
    const heard = stage
      .addActionListeners()
      .find(([action]) => action === 'CHANNEL_UI_CLICK_EVENT');

    expect(stage.props.id).to.eq('stage-view');
    expect(stage.props.tabindex).to.eq(-1);
    expect(stage.props.channels).to.include('CHANNEL_UI');
    expect(heard[1]).to.eq('stage$OnSkipToContent');
  });
});
