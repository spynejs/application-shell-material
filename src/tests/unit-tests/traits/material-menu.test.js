import { expect } from 'chai';
import { MaterialMenuTraits } from '/src/app/traits/material/material-menu-traits.js';

// Where a menu stands is worked out from numbers: where its button is, how big the
// menu is, and how big the window is. What is held here is that working out. That
// a menu is then drawn there is held in a browser, not here.

const placeFor = MaterialMenuTraits.materialMenu$PlaceFor;

const WINDOW = { width: 1000, height: 800 };
const MENU = { width: 200, height: 160 };
// A button 100px wide and 40px tall, with its top left corner at (left, top).
const buttonAt = (left, top) => ({
  top,
  left,
  right: left + 100,
  bottom: top + 40,
});

describe('where a menu stands', () => {
  describe('over or under its button', () => {
    it('should open under its button where it fits there', () => {
      const at = placeFor({
        button: buttonAt(100, 100),
        menu: MENU,
        window: WINDOW,
      });

      expect(at.top).to.eq(140);
      expect(at.bottom).to.eq(null);
    });

    it('should open over its button where it fits only there', () => {
      const at = placeFor({
        button: buttonAt(100, 700),
        menu: MENU,
        window: WINDOW,
      });

      expect(at.top).to.eq(null);
      // Its bottom edge on the button's top edge: 700px down a window of 800px.
      expect(at.bottom).to.eq(100);
    });

    it('should open on the side with more room where it fits neither way', () => {
      const tall = { width: 200, height: 900 };

      expect(
        placeFor({ button: buttonAt(100, 200), menu: tall, window: WINDOW })
          .top,
      ).to.eq(240);
      expect(
        placeFor({ button: buttonAt(100, 600), menu: tall, window: WINDOW })
          .bottom,
      ).to.eq(200);
    });

    it('should say how tall it may be: the room on its side, less 8px', () => {
      expect(
        placeFor({ button: buttonAt(100, 100), menu: MENU, window: WINDOW })
          .room,
      ).to.eq(800 - 140 - 8);
      expect(
        placeFor({ button: buttonAt(100, 700), menu: MENU, window: WINDOW })
          .room,
      ).to.eq(700 - 8);
    });
  });

  describe('from which side', () => {
    it("should put its start on its button's start where it fits", () => {
      const at = placeFor({
        button: buttonAt(100, 100),
        menu: MENU,
        window: WINDOW,
      });

      expect(at.left).to.eq(100);
      expect(at.right).to.eq(null);
    });

    it("should put its end on its button's end where it does not", () => {
      const at = placeFor({
        button: buttonAt(880, 100),
        menu: MENU,
        window: WINDOW,
      });

      expect(at.left).to.eq(null);
      // The button's right edge is at 980px of 1000px.
      expect(at.right).to.eq(20);
    });

    it('should start from the right where the page runs from the right', () => {
      const at = placeFor({
        button: buttonAt(500, 100),
        menu: MENU,
        window: WINDOW,
        isRightToLeft: true,
      });

      expect(at.left).to.eq(null);
      expect(at.right).to.eq(400);
    });

    it('should turn to the left there too, where it does not fit', () => {
      const at = placeFor({
        button: buttonAt(20, 100),
        menu: MENU,
        window: WINDOW,
        isRightToLeft: true,
      });

      expect(at.left).to.eq(20);
      expect(at.right).to.eq(null);
    });

    it('should stay 8px inside a window too narrow for it either way', () => {
      const narrow = { width: 220, height: 800 };
      const at = placeFor({
        button: buttonAt(60, 100),
        menu: MENU,
        window: narrow,
      });

      expect(at.left).to.be.within(8, 220 - 8 - 200);
      expect(at.right).to.eq(null);
    });
  });

  describe('in the page or in the window', () => {
    const scroll = { x: 0, y: 500 };

    it('should stand in the page, so that it moves with a button that does', () => {
      const at = placeFor({
        button: buttonAt(100, 100),
        menu: MENU,
        window: WINDOW,
        scroll,
      });

      expect(at.position).to.eq('absolute');
      // 140px down the window, in a page scrolled by 500px.
      expect(at.top).to.eq(640);
    });

    it('should measure from the top of the page when it opens over its button', () => {
      const at = placeFor({
        button: buttonAt(100, 700),
        menu: MENU,
        window: WINDOW,
        scroll,
      });

      // The page's first window is 800px tall. The button's top is 1200px down
      // the page, 400px past it.
      expect(at.bottom).to.eq(-400);
    });

    it('should stand in the window where its button is held in place', () => {
      const at = placeFor({
        button: buttonAt(100, 100),
        menu: MENU,
        window: WINDOW,
        scroll,
        held: true,
      });

      expect(at.position).to.eq('fixed');
      expect(at.top).to.eq(140);
    });
  });
});
