import { SpyneTrait, ViewStream, SpyneAppProperties, safeClone } from 'spyne';
import {
  materialButtonLook,
  hasNoButtonWords,
  BUTTON_NO_WORDS,
} from 'traits/utils/material-button-options.js';
import { HeroView } from 'components/page-items/hero-view.js';
import { CardsContainerView } from 'components/page-items/cards-container-view.js';
import { FormContactUsView } from 'components/page-items/form-contact-us-view.js';

export class PageItemCoreTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'pageItemCore$';
    super(context, traitPrefix);
  }

  static pageItemCore$AddStyles(element, cssString) {
    if (!element) return;
    if (typeof cssString !== 'string' || !cssString.trim()) return;

    // Check for an existing Spyne inline style
    const existing = element.querySelector(
      'style[data-spyne-inline-style="true"]',
    );
    if (existing) {
      existing.textContent = cssString;
      return;
    }

    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-spyne-inline-style', 'true');
    styleTag.textContent = cssString;

    element.appendChild(styleTag);
  }

  static pageItemCore$CheckToAddPageTraitContainer(options = {}) {
    const {
      isEnabled = true,
      classOptions = {},
      spacing = 'default',
      selector,
    } = options;

    if (selector) {
      return selector;
    }

    const getContainerClass = () => {
      const classes = ['page-item'];

      // ---------------------------------------------
      // Variant (surface style)
      // ---------------------------------------------
      if (classOptions.variant) {
        classes.push(`page-item--${classOptions.variant}`);
      }

      // ---------------------------------------------
      // Flush (remove internal padding)
      // ---------------------------------------------
      if (classOptions.flush === true) {
        classes.push('page-item--flush');
      }

      // ---------------------------------------------
      // Bleed (full-width section)
      // ---------------------------------------------
      if (classOptions.bleed === true) {
        classes.push('page-item--bleed');
      }

      // ---------------------------------------------
      // Spacing (vertical rhythm)
      // ---------------------------------------------
      if (spacing === 'none') {
        classes.push('page-item--no-spacing');
      }

      if (spacing === 'tight') {
        classes.push('page-item--tight-spacing');
      }

      return classes.join(' ');
    };

    if (isEnabled) {
      const props = {};
      props.class = getContainerClass();

      const vs = new ViewStream(props);
      this.appendView(vs, '.page-body');
      return vs.props.id$;
    }

    return '.page-body';
  }

  /**
   * A call to action's button: how it looks, and whether it is drawn.
   *
   * A model gives a button its words with `ctaText`, and may say how it looks
   * with a `button` key beside them (app.model.json):
   *
   *   { "ctaText": "Order ahead", "attrCtaHref": "/order",
   *     "button": { "variant": "tonal", "size": "md", "shape": "square" } }
   *
   * A template cannot turn those keys into classes, so this does, before the
   * template renders: it adds `attrButtonClass`, which the Shell's templates
   * write after `btn`.
   *
   *   - With no `button` key it is the class the Shell has always written, so
   *     a model without the key renders as it did.
   *   - Where `ctaText` is there and has no words (empty, or only spaces), it
   *     also carries the class that keeps a button from being drawn: a button
   *     with nothing on it is not shown. To have no button, give `ctaText` no
   *     words.
   *
   * It is given to the data itself (a hero's, a page item's), where the hero,
   * the call-to-action banner and the contact form have their button; and to
   * each item of a list in the data that has its own `ctaText`, where the
   * split feature has one for every row.
   *
   * The authored keys are left as they are. safeClone keeps what the CMS has
   * put on the data.
   */
  static pageItemCore$GiveButtonLook(data) {
    if (data === null || typeof data !== 'object') {
      return data;
    }

    const shaped = safeClone(data);

    shaped.attrButtonClass =
      PageItemCoreTraits.pageItemCore$ButtonClass(shaped);

    Object.values(shaped)
      .filter(Array.isArray)
      .forEach((list) => {
        list
          .filter((item) => item?.ctaText !== undefined)
          .forEach((item) => {
            item.attrButtonClass =
              PageItemCoreTraits.pageItemCore$ButtonClass(item);
          });
      });

    return shaped;
  }

  /**
   * The classes one call to action's button carries after `btn`: its look,
   * and, where it was given no words, the class that keeps it from being
   * drawn (see pageItemCore$GiveButtonLook).
   */
  static pageItemCore$ButtonClass(item) {
    const look = materialButtonLook(item.button);

    return hasNoButtonWords(item) ? `${look} ${BUTTON_NO_WORDS}` : look;
  }

  static pageItemCore$AddPageItems(elementsArr = this.props.data.pageItems) {
    const addElement = (obj) => {
      const { props, container, viewClass, isPrototype } = obj;
      props.template = this.pageItemCore$GetTemplate(props, isPrototype);
      props.data = PageItemCoreTraits.pageItemCore$GiveButtonLook(props.data);

      const ViewClass = this.pageItemCore$GetViewClass(viewClass);

      const appendElSelector =
        this.pageItemCore$CheckToAddPageTraitContainer(container);

      const view = new ViewClass(props);

      this.appendView(view, appendElSelector);

      if (props?.styles) {
        PageItemCoreTraits.pageItemCore$AddStyles(view.props.el, props.styles);
      }
    };

    elementsArr.forEach(addElement);
  }

  static pageItemCore$onRendered(props = this.props) {
    const { hero, pageItems, content, pageType } = props.data;

    if (hero) {
      const data = PageItemCoreTraits.pageItemCore$GiveButtonLook(hero);

      this.appendView(new HeroView({ data, pageType }), '.page-heading');
    }

    if (content) {
      this.appendView(
        new CardsContainerView({ data: content, pageType }),
        '.page-body',
      );
    }

    if (pageItems) {
      this.pageItemCore$AddPageItems();
    }
  }

  static pageItemCore$GetTemplate(
    pageItemProps = { template: '' },
    isPrototype = true,
  ) {
    const { template } = pageItemProps;

    if (isPrototype === true) {
      return template;
    }

    const templateLookup = SpyneAppProperties.getProp('pageItemTemplateLookup');
    if (isPrototype === false) {
      return templateLookup[template] || '<h1>Missing Template</h1>';
    }
    return template;
  }

  static pageItemCore$GetViewClass(viewClass = 'ViewStream') {
    const classLookup = {
      ContactUsView: FormContactUsView,
    };
    return classLookup[viewClass] || ViewStream;
  }
}
