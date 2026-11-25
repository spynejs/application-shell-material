import { expect } from 'chai';
import { footerLinksOf } from '/src/app/traits/utils/footer-links.js';

// The footer's links are worked out from the app's model: which of the links it
// asks for lead somewhere, and what each one's markup needs. What is held here is
// that working out. That they are then drawn, and that a press on one goes where
// it says, is held in a browser.

const hrefOf = ({ pageId, topicId }) =>
  `/${[pageId, topicId].filter((id) => id !== '').join('/')}`;

const model = (footer) => ({
  content: [
    { pageId: 'home' },
    { pageId: 'menu' },
    { pageId: 'classes', content: [{ topicId: 'beginners' }] },
  ],
  ...(footer === undefined ? {} : { footer }),
});

const one = (link) =>
  footerLinksOf(
    model({ columns: [{ title: 'Visit', links: [link] }] }),
    hrefOf,
  );

describe("the footer's links", () => {
  describe('whether there are any', () => {
    it('should be none for an app whose model asks for none', () => {
      expect(footerLinksOf(model(), hrefOf)).to.eq(null);
      expect(footerLinksOf(model(null), hrefOf)).to.eq(null);
      expect(footerLinksOf(model('links'), hrefOf)).to.eq(null);
    });

    it('should be none where nothing asked for leads anywhere', () => {
      const footer = {
        columns: [{ title: 'Visit', links: [{ label: 'Nowhere' }] }],
        social: [],
      };

      expect(footerLinksOf(model(footer), hrefOf)).to.eq(null);
    });

    it("should leave the app's model as it was", () => {
      const asked = model({
        columns: [
          { title: 'Visit', links: [{ label: 'Menu', attrPageId: 'menu' }] },
        ],
      });
      const before = JSON.stringify(asked);

      footerLinksOf(asked, hrefOf);

      expect(JSON.stringify(asked)).to.eq(before);
    });
  });

  describe('a link to a page of the app', () => {
    it('should be a route link, with the address the routes give it', () => {
      const [link] = one({ label: 'Menu', attrPageId: 'menu' }).columns[0]
        .links;

      expect(link).to.include({
        label: 'Menu',
        attrChannel: 'ROUTE',
        attrPageId: 'menu',
        attrTopicId: '',
        attrHref: '/menu',
        attrTarget: '',
        attrRel: '',
      });
    });

    it('should reach a sub-page', () => {
      const [link] = one({
        label: 'Beginners',
        attrPageId: 'classes',
        attrTopicId: 'beginners',
      }).columns[0].links;

      expect(link.attrTopicId).to.eq('beginners');
      expect(link.attrHref).to.eq('/classes/beginners');
    });

    it('should lead to the page where its sub-page is not one of the page’s', () => {
      const [link] = one({
        label: 'Advanced',
        attrPageId: 'classes',
        attrTopicId: 'advanced',
      }).columns[0].links;

      expect(link.attrTopicId).to.eq('');
      expect(link.attrHref).to.eq('/classes');
    });

    it('should go before an address, where a link is given both', () => {
      const [link] = one({
        label: 'Menu',
        attrPageId: 'menu',
        attrHref: 'https://example.com',
      }).columns[0].links;

      expect(link.attrChannel).to.eq('ROUTE');
      expect(link.attrHref).to.eq('/menu');
    });
  });

  describe('a link to somewhere else', () => {
    it('should open a page on the web in a new tab', () => {
      const [link] = one({
        label: 'Instagram',
        attrHref: 'https://www.instagram.com/example',
      }).columns[0].links;

      expect(link).to.include({
        attrChannel: '',
        attrPageId: '',
        attrHref: 'https://www.instagram.com/example',
        attrTarget: '_blank',
        attrRel: 'noopener noreferrer',
      });
    });

    it('should leave an address to write to, or to call, in its own tab', () => {
      const mail = one({
        label: 'Write',
        attrHref: 'mailto:hello@example.com',
      });
      const call = one({ label: 'Call', attrHref: 'tel:+15550100' });

      expect(mail.columns[0].links[0].attrTarget).to.eq('');
      expect(call.columns[0].links[0].attrHref).to.eq('tel:+15550100');
    });

    it('should not draw one whose address is not a whole one', () => {
      expect(one({ label: 'Menu', attrHref: '/menu' })).to.eq(null);
      expect(one({ label: 'Script', attrHref: 'javascript:alert(1)' })).to.eq(
        null,
      );
    });
  });

  describe('what is not drawn', () => {
    it('should not draw a link with no words', () => {
      expect(one({ label: ' ', attrPageId: 'menu' })).to.eq(null);
      expect(one({ attrPageId: 'menu' })).to.eq(null);
    });

    it('should not draw a link to a page the app does not have', () => {
      expect(one({ label: 'Shop', attrPageId: 'shop' })).to.eq(null);
    });

    it('should not draw a column left with no links, and keep the others', () => {
      const footer = footerLinksOf(
        model({
          columns: [
            { title: 'Shop', links: [{ label: 'Shop', attrPageId: 'shop' }] },
            { title: 'Visit', links: [{ label: 'Menu', attrPageId: 'menu' }] },
          ],
        }),
        hrefOf,
      );

      expect(footer.columns.map((column) => column.title)).to.deep.eq([
        'Visit',
      ]);
    });
  });

  describe('what the footer is told of them', () => {
    const footer = footerLinksOf(
      model({
        columns: [
          { title: 'Visit', links: [{ label: 'Menu', attrPageId: 'menu' }] },
          { links: [{ label: 'Home', attrPageId: 'home' }] },
        ],
        social: [
          { label: 'Instagram', attrHref: 'https://www.instagram.com/example' },
          { label: 'Broken' },
        ],
      }),
      hrefOf,
    );

    it('should count its columns and its row, for the styles', () => {
      expect(footer.attrColumnCount).to.eq('2');
      expect(footer.attrSocialCount).to.eq('1');
    });

    it('should give each column an id for its title, and a title to write', () => {
      expect(footer.columns.map((column) => column.attrTitleId)).to.deep.eq([
        'footer-links-title-0',
        'footer-links-title-1',
      ]);
      expect(footer.columns.map((column) => column.title)).to.deep.eq([
        'Visit',
        '',
      ]);
    });

    it('should say whether any link is to a page of the app', () => {
      const elsewhere = footerLinksOf(
        model({
          social: [{ label: 'Instagram', attrHref: 'https://example.com' }],
        }),
        hrefOf,
      );

      expect(footer.hasRouteLinks).to.eq(true);
      expect(elsewhere.hasRouteLinks).to.eq(false);
      expect(elsewhere.attrColumnCount).to.eq('0');
    });
  });
});
