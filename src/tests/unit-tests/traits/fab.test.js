import { expect } from 'chai';
import { ICON_SHAPES } from '/src/app/traits/utils/icon-shapes.js';
import { ICON_SHAPES_FILLED } from '/src/app/traits/utils/icon-shapes-filled.js';
import { FAB_ICON, fabOf, isFabsOwnPage } from '/src/app/traits/utils/fab.js';

const form = { props: { template: 'contact-us.tmpl.html', data: {} } };
const hrefOf = ({ pageId, topicId }) =>
  topicId ? `/${pageId}/${topicId}` : `/${pageId}`;

// An app whose contact form is on a sub-page of About, as a generated app's is.
const app = (fab) => ({
  ...(fab === undefined ? {} : { fab }),
  content: [
    { pageId: 'home' },
    { pageId: 'classes', content: [{ topicId: 'boxing' }] },
    {
      pageId: 'about',
      content: [{ pageId: 'about', topicId: 'contact-us', pageItems: [form] }],
    },
  ],
});

// An app with no contact form.
const appWithNoForm = (fab) => ({
  fab,
  content: [{ pageId: 'home' }, { pageId: 'classes' }],
});

describe('FAB_ICON', () => {
  it('should be an icon the app has, with a filled drawing', () => {
    expect(ICON_SHAPES).to.have.property(FAB_ICON);
    expect(ICON_SHAPES_FILLED).to.have.property(FAB_ICON);
  });
});

describe('fabOf', () => {
  it('should give no FAB to an app that asks for none', () => {
    expect(fabOf(app(), hrefOf)).to.eq(null);
    expect(fabOf(app(null), hrefOf)).to.eq(null);
    expect(fabOf({}, hrefOf)).to.eq(null);
    expect(fabOf(undefined, hrefOf)).to.eq(null);
  });

  it('should give no FAB where the key is not an object or has no words', () => {
    expect(fabOf(app('Contact'), hrefOf)).to.eq(null);
    expect(fabOf(app({}), hrefOf)).to.eq(null);
    expect(fabOf(app({ ctaText: '' }), hrefOf)).to.eq(null);
    expect(fabOf(app({ ctaText: '   ' }), hrefOf)).to.eq(null);
    expect(fabOf(app({ ctaText: 7 }), hrefOf)).to.eq(null);
  });

  it('should lead to the contact page where the key names no page', () => {
    expect(fabOf(app({ ctaText: 'Contact' }), hrefOf)).to.deep.eq({
      label: 'Contact',
      icon: 'mail',
      attrIconPath: ICON_SHAPES_FILLED.mail,
      attrPageId: 'about',
      attrTopicId: 'contact-us',
      attrHref: '/about/contact-us',
    });
  });

  it('should lead to the page the key names, where it is a page of the app', () => {
    const fab = fabOf(
      app({ ctaText: 'Book', attrPageId: 'classes', attrTopicId: 'boxing' }),
      hrefOf,
    );

    expect([fab.attrPageId, fab.attrTopicId, fab.attrHref]).to.deep.eq([
      'classes',
      'boxing',
      '/classes/boxing',
    ]);

    const top = fabOf(app({ ctaText: 'Book', attrPageId: 'classes' }), hrefOf);

    expect([top.attrPageId, top.attrTopicId, top.attrHref]).to.deep.eq([
      'classes',
      '',
      '/classes',
    ]);
  });

  it('should lead to the contact page where the key names no page of the app', () => {
    const fab = fabOf(app({ ctaText: 'Book', attrPageId: 'booking' }), hrefOf);

    expect(fab.attrHref).to.eq('/about/contact-us');
  });

  it('should lead to the page, where its sub-page is not one of the app’s', () => {
    const fab = fabOf(
      app({ ctaText: 'Book', attrPageId: 'classes', attrTopicId: 'pilates' }),
      hrefOf,
    );

    expect([fab.attrPageId, fab.attrTopicId]).to.deep.eq(['classes', '']);
  });

  it('should give no FAB where there is nowhere for it to lead', () => {
    expect(fabOf(appWithNoForm({ ctaText: 'Contact' }), hrefOf)).to.eq(null);
  });

  it('should give a FAB to an app with no contact form that names a page', () => {
    const fab = fabOf(
      appWithNoForm({ ctaText: 'Classes', attrPageId: 'classes' }),
      hrefOf,
    );

    expect(fab.attrHref).to.eq('/classes');
  });

  it('should trim its words', () => {
    expect(fabOf(app({ ctaText: '  Book a table ' }), hrefOf).label).to.eq(
      'Book a table',
    );
  });

  it('should take the icon the key names, where the app has it', () => {
    const fab = fabOf(app({ ctaText: 'Book', icon: 'calendar_month' }), hrefOf);

    expect(fab.icon).to.eq('calendar_month');
    expect(fab.attrIconPath).to.eq(ICON_SHAPES_FILLED.calendar_month);
  });

  it('should take its own icon where the key names one the app does not have', () => {
    expect(fabOf(app({ ctaText: 'Book', icon: 'rocket' }), hrefOf).icon).to.eq(
      FAB_ICON,
    );
    expect(fabOf(app({ ctaText: 'Book', icon: 7 }), hrefOf).icon).to.eq(
      FAB_ICON,
    );
  });

  it('should draw the outlined shape of an icon that has no filled one', () => {
    const fab = fabOf(app({ ctaText: 'Find us', icon: 'search' }), hrefOf);

    expect(ICON_SHAPES_FILLED).to.not.have.property('search');
    expect(fab.attrIconPath).to.eq(ICON_SHAPES.search);
  });

  it('should not change the model it reads', () => {
    const model = app({ ctaText: ' Contact ', attrPageId: 'nowhere' });
    const before = JSON.stringify(model);

    fabOf(model, hrefOf);

    expect(JSON.stringify(model)).to.eq(before);
  });
});

describe('isFabsOwnPage', () => {
  const fab = fabOf(app({ ctaText: 'Contact' }), hrefOf);
  const toAPage = fabOf(
    app({ ctaText: 'Classes', attrPageId: 'classes' }),
    hrefOf,
  );

  it('should say so on the page the FAB leads to', () => {
    expect(
      isFabsOwnPage(fab, { pageId: 'about', topicId: 'contact-us' }),
    ).to.eq(true);
    expect(isFabsOwnPage(toAPage, { pageId: 'classes' })).to.eq(true);
    expect(isFabsOwnPage(toAPage, { pageId: 'classes', topicId: '' })).to.eq(
      true,
    );
  });

  it('should not say so on any other page', () => {
    expect(isFabsOwnPage(fab, { pageId: 'home' })).to.eq(false);
    expect(isFabsOwnPage(fab, { pageId: 'about' })).to.eq(false);
    expect(isFabsOwnPage(fab, { pageId: 'about', topicId: 'coaches' })).to.eq(
      false,
    );
    expect(
      isFabsOwnPage(toAPage, { pageId: 'classes', topicId: 'boxing' }),
    ).to.eq(false);
  });

  it('should not say so where there is no FAB, or no page', () => {
    expect(isFabsOwnPage(null, { pageId: 'home' })).to.eq(false);
    expect(isFabsOwnPage(undefined, { pageId: 'home' })).to.eq(false);
    expect(isFabsOwnPage(fab, undefined)).to.eq(false);
  });
});
