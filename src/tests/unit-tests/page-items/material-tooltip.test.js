import { expect } from 'chai';
import { DomElementTemplate, SpyneApp } from 'spyne';
import TooltipTmpl from '/src/app/components/material/templates/material-tooltip.tmpl.html';
import NavPrimaryTmpl from '/src/app/components/nav/templates/nav-primary-view.tmpl.html';
import { MaterialTooltipHostView } from '/src/app/components/material/material-tooltip-host-view.js';
import { NavHeaderHamburgerItem } from '/src/app/components/nav/nav-header-hamburger-item.js';
import { NavPrimaryView } from '/src/app/components/nav/nav-primary-view.js';

// The tooltip is the name of a control that shows no words. What is held here is
// what a tooltip rests on: the region's own markup; that each control which asks
// for one has a name to show; and that the view which owns it says when the
// pointer and the focus come and go. Where it stands and when it shows are held
// in a browser, not here.

const WHAT_A_TOOLTIP_HEARS = ['pointerenter', 'pointerleave', 'focus', 'blur'];
const eventsOn = (view, selector) =>
  view
    .broadcastEvents()
    .filter(([sel]) => sel === selector)
    .map(([, event]) => event);

describe('the tooltip', () => {
  let region;
  let header;

  // Drawn once the app's sanitizer is set up, not while the tests are being read.
  before(() => {
    SpyneApp.init({ debug: false });

    region = document.createElement('div');
    region.appendChild(new DomElementTemplate(TooltipTmpl, {}).renderDocFrag());

    header = document.createElement('nav');
    header.appendChild(
      new DomElementTemplate(NavPrimaryTmpl, [
        { pageId: 'home', title: 'Home', href: '/' },
        { pageId: 'about', title: 'About', href: '/about' },
      ]).renderDocFrag(),
    );
  });

  describe('the region', () => {
    it('should hold one tooltip, with the tooltip role', () => {
      const tooltips = region.querySelectorAll('.tooltip');

      expect(tooltips.length).to.eq(1);
      expect(tooltips[0].getAttribute('role')).to.eq('tooltip');
    });

    it('should start with no words', () => {
      expect(region.querySelector('.tooltip').textContent).to.eq('');
    });

    // Its words are the control's own name, which assistive technology already
    // says: said from here as well, a visitor would hear the name twice.
    it('should keep its words from being said a second time', () => {
      expect(
        region.querySelector('.tooltip').getAttribute('aria-hidden'),
      ).to.eq('true');
    });

    it('should hear each thing under one label of its own', () => {
      const labels = new MaterialTooltipHostView()
        .addActionListeners()
        .map(([label]) => label);

      expect(labels).to.deep.eq([
        'CHANNEL_UI_POINTERENTER_EVENT',
        'CHANNEL_UI_POINTERLEAVE_EVENT',
        'CHANNEL_UI_FOCUS_EVENT',
        'CHANNEL_UI_BLUR_EVENT',
        'CHANNEL_UI_CLICK_EVENT',
        'CHANNEL_MATERIAL_DISMISS_EVENT',
      ]);
      expect(new Set(labels).size).to.eq(labels.length);
    });
  });

  describe('the light and dark switch', () => {
    it('should ask for a tooltip', () => {
      const asking = [...header.querySelectorAll('[data-tooltip]')];

      expect(asking.map((el) => el.id)).to.deep.eq(['theme-toggle']);
      expect(asking[0].dataset.tooltip).to.eq('true');
    });

    it('should have a name to show, and no words of its own', () => {
      const control = header.querySelector('#theme-toggle');

      expect(control.getAttribute('aria-label')).to.eq('Toggle Theme');
      expect(control.textContent.trim()).to.eq('');
    });

    it('should not be named a second time by a title', () => {
      expect(header.querySelector('#theme-toggle').hasAttribute('title')).to.eq(
        false,
      );
    });

    it('should say when the pointer and the focus come and go', () => {
      expect(eventsOn(new NavPrimaryView(), '[data-tooltip]')).to.deep.eq(
        WHAT_A_TOOLTIP_HEARS,
      );
    });

    it('should leave the header’s links without one', () => {
      expect(header.querySelectorAll('a[data-tooltip]').length).to.eq(0);
    });
  });

  describe('the menu button', () => {
    let button;

    before(() => {
      button = new NavHeaderHamburgerItem();
    });

    it('should ask for a tooltip', () => {
      expect(button.props.dataset.tooltip).to.eq('true');
    });

    it('should have a name to show', () => {
      expect(button.props['aria-label']).to.eq('Menu');
    });

    it('should say when the pointer and the focus come and go', () => {
      expect(eventsOn(button, '#menu_toggle')).to.deep.eq([
        'click',
        ...WHAT_A_TOOLTIP_HEARS,
      ]);
    });
  });
});
