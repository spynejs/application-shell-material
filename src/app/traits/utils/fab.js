import { hasIcon, iconPathFilled } from 'traits/utils/icons.js';
import { routeCallsToAction } from 'traits/utils/call-to-action-routes.js';

/**
 * The app's floating action button: one button, in front of every page, for the
 * one thing the app most wants done. Material's extended FAB.
 *
 * An app asks for one at the root of its model, with the key `fab`:
 *
 *   "fab": { "ctaText": "Book", "icon": "calendar_month" }
 *
 * It is a call to action, and its keys are a call to action's:
 *
 *   - `ctaText`: its words, one or two. With no words there is no FAB.
 *   - `icon`: a name from this app's icons (icon-shapes.js). Left out, or a name
 *     the app does not have, it is FAB_ICON.
 *   - `attrPageId`, `attrTopicId`: the page it leads to, by the route's ids. Left
 *     out, it leads where every call to action without a destination leads: the
 *     page that holds the contact form (call-to-action-routes.js).
 *
 * To give an app a FAB, write the key. To take it away, remove the key. An app
 * with no contact form whose `fab` names no page has none: it would lead nowhere.
 */
export const FAB_ICON = 'mail';

const wordsOf = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * What the app's FAB draws, or null where the app has none.
 *
 *   { label, icon, attrIconPath, attrPageId, attrTopicId, attrHref }
 *
 * `model` is the app's; it is not changed. `hrefOf` turns route ids into an
 * address the way the app's routes are written. The icon's shape is the filled
 * one, which Material asks of a FAB, or the outlined one where the app has no
 * filled drawing of it.
 */
export const fabOf = (model, hrefOf) => {
  const asked = model?.fab;
  const label = wordsOf(asked?.ctaText);

  if (asked === null || typeof asked !== 'object' || label === '') {
    return null;
  }

  // The same rule as any call to action's, asked of a page that is nowhere in the
  // app, so that "the page you are on" takes nothing away here.
  const { hero } = routeCallsToAction(
    {
      hero: {
        ctaText: label,
        attrPageId: wordsOf(asked.attrPageId),
        attrTopicId: wordsOf(asked.attrTopicId),
        attrCtaHref: '',
      },
    },
    model,
    hrefOf,
  );

  if (hero.attrPageId === '') {
    return null;
  }

  const icon = hasIcon(asked.icon) ? asked.icon : FAB_ICON;

  return {
    label,
    icon,
    attrIconPath: iconPathFilled(icon),
    attrPageId: hero.attrPageId,
    attrTopicId: hero.attrTopicId,
    attrHref: hrefOf({ pageId: hero.attrPageId, topicId: hero.attrTopicId }),
  };
};

/**
 * Whether that page is the one the FAB leads to. The FAB is not shown there: the
 * thing it leads to is already in front of you.
 */
export const isFabsOwnPage = (fab, page) =>
  fab !== null &&
  fab !== undefined &&
  fab.attrPageId === page?.pageId &&
  (fab.attrTopicId ?? '') === (page?.topicId ?? '');
