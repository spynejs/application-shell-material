import { expect } from 'chai';
import { ICON_SHAPES } from '/src/app/traits/utils/icon-shapes.js';
import { ICON_SHAPES_FILLED } from '/src/app/traits/utils/icon-shapes-filled.js';
import { iconPathFilled } from '/src/app/traits/utils/icons.js';
import {
  NAV_ICON_OF_ANY_PAGE,
  NAV_ICON_OF_KIND,
  navDestinations,
  navIconName,
  navLabel,
  withNavIcons,
} from '/src/app/traits/utils/nav-icons.js';

describe('ICON_SHAPES_FILLED', () => {
  it('should hold only names the set has', () => {
    Object.keys(ICON_SHAPES_FILLED).forEach((name) => {
      expect(ICON_SHAPES, name).to.have.property(name);
    });
  });

  it('should give every name a shape that is path data and nothing else', () => {
    Object.entries(ICON_SHAPES_FILLED).forEach(([name, shape]) => {
      expect(shape, name).to.match(/^[Mm][MmZzLlHhVvCcSsQqTtAa0-9 .,-]+$/);
    });
  });

  it('should hold no drawing that is the outlined one over again', () => {
    Object.entries(ICON_SHAPES_FILLED).forEach(([name, shape]) => {
      expect(shape, name).to.not.eq(ICON_SHAPES[name]);
    });
  });

  it('should not be changed by the code that reads it', () => {
    expect(Object.isFrozen(ICON_SHAPES_FILLED)).to.eq(true);
  });
});

describe('iconPathFilled', () => {
  it('should give the filled shape of an icon that has one', () => {
    expect(iconPathFilled('home')).to.eq(ICON_SHAPES_FILLED.home);
    expect(iconPathFilled('home')).to.not.eq(ICON_SHAPES.home);
  });

  it('should give the outlined shape where there is no filled drawing', () => {
    expect(ICON_SHAPES_FILLED).to.not.have.property('wifi');
    expect(iconPathFilled('wifi')).to.eq(ICON_SHAPES.wifi);
    expect(iconPathFilled('menu')).to.eq(ICON_SHAPES.menu);
  });

  it('should give an empty path for a name that is not in the set, and for what is not a name', () => {
    expect(iconPathFilled('no_such_icon')).to.eq('');
    expect(iconPathFilled('constructor')).to.eq('');
    expect(iconPathFilled(undefined)).to.eq('');
    expect(iconPathFilled(null)).to.eq('');
  });
});

describe('NAV_ICON_OF_KIND', () => {
  it('should name only icons this app has', () => {
    [...Object.values(NAV_ICON_OF_KIND), NAV_ICON_OF_ANY_PAGE].forEach(
      (name) => {
        expect(ICON_SHAPES, name).to.have.property(name);
      },
    );
  });
});

describe('navIconName', () => {
  it('should give the icon a page names', () => {
    expect(navIconName({ pageType: 'generic', navIcon: 'schedule' })).to.eq(
      'schedule',
    );
  });

  it('should give the icon of a page’s kind where the page names none', () => {
    expect(navIconName({ pageType: 'landing' })).to.eq('home');
    expect(navIconName({ pageType: 'about' })).to.eq('groups');
    expect(navIconName({ pageType: 'gallery' })).to.eq('photo_camera');
    expect(navIconName({ pageType: 'blog' })).to.eq('description');
    expect(navIconName({ pageType: 'article' })).to.eq('description');
    expect(navIconName({ pageType: 'shop' })).to.eq('shopping_bag');
    expect(navIconName({ pageType: 'contact' })).to.eq('mail');
    expect(navIconName({ pageType: 'list' })).to.eq('info');
    expect(navIconName({ pageType: 'generic' })).to.eq('info');
  });

  it('should give the icon of a page’s kind where the page names one this app does not have', () => {
    expect(navIconName({ pageType: 'shop', navIcon: 'no_such_icon' })).to.eq(
      'shopping_bag',
    );
    expect(navIconName({ pageType: 'shop', navIcon: 'toString' })).to.eq(
      'shopping_bag',
    );
  });

  it('should give one icon to a page of no kind it knows', () => {
    expect(navIconName({ pageType: 'buttons' })).to.eq(NAV_ICON_OF_ANY_PAGE);
    expect(navIconName({ pageType: 'constructor' })).to.eq(
      NAV_ICON_OF_ANY_PAGE,
    );
    expect(navIconName({})).to.eq(NAV_ICON_OF_ANY_PAGE);
    expect(navIconName(undefined)).to.eq(NAV_ICON_OF_ANY_PAGE);
    expect(navIconName(null)).to.eq(NAV_ICON_OF_ANY_PAGE);
  });
});

describe('withNavIcons', () => {
  const links = [
    { pageId: 'home', title: 'Home', href: '/', navLevel: 1 },
    { pageId: 'classes', title: 'Classes', href: '/classes', navLevel: 1 },
    { pageId: 'not-in-the-model', title: 'Elsewhere', href: '/x', navLevel: 1 },
  ];
  const pages = [
    { pageId: 'home', pageType: 'landing' },
    { pageId: 'classes', pageType: 'list', navIcon: 'fitness_center' },
  ];

  it('should put an icon’s name and its two shapes on each link', () => {
    const [home, classes] = withNavIcons(links, pages);

    expect(home).to.include({
      navIcon: 'home',
      attrIconPath: ICON_SHAPES.home,
      attrIconPathFilled: ICON_SHAPES_FILLED.home,
    });
    expect(classes).to.include({
      navIcon: 'fitness_center',
      attrIconPath: ICON_SHAPES.fitness_center,
      // fitness_center has no filled drawing of its own
      attrIconPathFilled: ICON_SHAPES.fitness_center,
    });
  });

  it('should keep what a link already carries', () => {
    const [home] = withNavIcons(links, pages);

    expect(home).to.include({
      pageId: 'home',
      title: 'Home',
      href: '/',
      navLevel: 1,
    });
  });

  it('should give a link whose page the model does not have the icon of any page', () => {
    const elsewhere = withNavIcons(links, pages)[2];

    expect(elsewhere.navIcon).to.eq(NAV_ICON_OF_ANY_PAGE);
    expect(elsewhere.attrIconPath).to.eq(ICON_SHAPES[NAV_ICON_OF_ANY_PAGE]);
  });

  it('should change neither the links nor the pages', () => {
    withNavIcons(links, pages);

    expect(links[0]).to.not.have.property('attrIconPath');
    expect(pages[0]).to.not.have.property('navIcon');
  });

  it('should give no links for no links', () => {
    expect(withNavIcons()).to.deep.eq([]);
    expect(withNavIcons([], pages)).to.deep.eq([]);
  });
});

describe('navLabel', () => {
  it('should give the words a page says for itself', () => {
    expect(navLabel({ title: 'CLASSES' }, { navLabel: 'Classes' })).to.eq(
      'Classes',
    );
    expect(navLabel({ title: 'ABOUT' }, { navLabel: ' Our story ' })).to.eq(
      'Our story',
    );
  });

  it('should set a title in capitals as a sentence where the page says nothing', () => {
    expect(navLabel({ title: 'HOME' }, {})).to.eq('Home');
    expect(navLabel({ title: 'PAGE VIEW' }, undefined)).to.eq('Page view');
    expect(navLabel({ title: 'ABOUT' }, { navLabel: '' })).to.eq('About');
    expect(navLabel({ title: 'ABOUT' }, { navLabel: 7 })).to.eq('About');
  });

  it('should leave a title that is not all capitals as it is', () => {
    expect(navLabel({ title: 'FAQ & Help' }, {})).to.eq('FAQ & Help');
    expect(navLabel({ title: 'about' }, {})).to.eq('about');
  });

  it('should give no words for a link with no title', () => {
    expect(navLabel({}, {})).to.eq('');
    expect(navLabel(undefined, undefined)).to.eq('');
  });
});

describe('navDestinations', () => {
  const links = [
    { pageId: 'home', title: 'HOME', href: '/', navLevel: 1 },
    { pageId: 'about', title: 'ABOUT', href: '/about', navLevel: 1 },
    {
      pageId: 'about',
      topicId: 'contact-us',
      title: 'CONTACT US',
      href: '/about/contact-us',
      navLevel: 2,
    },
  ];
  const pages = [
    { pageId: 'home', pageType: 'landing', navLabel: 'Home' },
    { pageId: 'about', pageType: 'about' },
  ];

  it('should give the top-level links only', () => {
    expect(navDestinations(links, pages).map((link) => link.href)).to.deep.eq([
      '/',
      '/about',
    ]);
  });

  it('should give each its label, its icon and the icon’s two shapes', () => {
    const [home, about] = navDestinations(links, pages);

    expect(home).to.include({
      pageId: 'home',
      label: 'Home',
      navIcon: 'home',
      attrIconPath: ICON_SHAPES.home,
      attrIconPathFilled: ICON_SHAPES_FILLED.home,
    });
    expect(about).to.include({ label: 'About', navIcon: 'groups' });
  });

  it('should give no destinations for no links, and for a model with no pages', () => {
    expect(navDestinations()).to.deep.eq([]);
    expect(navDestinations(links, undefined)).to.have.lengthOf(2);
  });
});
