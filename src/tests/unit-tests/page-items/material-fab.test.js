import { expect } from 'chai';
import { DomElementTemplate, SpyneApp } from 'spyne';
import FabTmpl from '/src/app/components/material/templates/material-fab.tmpl.html';
import { ICON_SHAPES_FILLED } from '/src/app/traits/utils/icon-shapes-filled.js';
import { fabOf } from '/src/app/traits/utils/fab.js';

// The FAB is a link whose inside is this template and the data fabOf gives it: an
// icon and its words. What is held here is what the template draws from that data.
// The link itself, with the route's ids, is the view's (material-fab-view.js).

const form = { props: { template: 'contact-us.tmpl.html', data: {} } };
const hrefOf = ({ pageId, topicId }) =>
  topicId ? `/${pageId}/${topicId}` : `/${pageId}`;

describe('the FAB’s template', () => {
  let el;

  // Drawn once the app's sanitizer is set up, not while the tests are being read.
  before(() => {
    SpyneApp.init({ debug: false });

    const data = fabOf(
      {
        fab: { ctaText: 'Book a table', icon: 'calendar_month' },
        content: [{ pageId: 'visit', pageItems: [form] }],
      },
      hrefOf,
    );

    el = document.createElement('a');
    el.appendChild(new DomElementTemplate(FabTmpl, data).renderDocFrag());
  });

  it('should draw the icon’s filled shape, hidden from assistive technology', () => {
    const icons = el.querySelectorAll('svg.icon');

    expect(icons.length).to.eq(1);
    expect(icons[0].getAttribute('aria-hidden')).to.eq('true');
    expect(icons[0].querySelector('path').getAttribute('d')).to.eq(
      ICON_SHAPES_FILLED.calendar_month,
    );
  });

  it('should say its words, once', () => {
    expect(el.textContent.trim()).to.eq('Book a table');
    expect(el.querySelectorAll('.fab__label').length).to.eq(1);
  });

  it('should hold nothing to press inside the link', () => {
    expect(el.querySelectorAll('a, button').length).to.eq(0);
  });
});
