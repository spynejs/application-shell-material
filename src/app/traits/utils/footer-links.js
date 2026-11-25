// The links an app's footer has, where its model asks for any.
//
// An app model takes one key at its root, `footer`, beside its `text.footer`, which
// is the footer's one line of words and stays as it is:
//
//   "footer": {
//     "columns": [
//       { "title": "Visit",
//         "links": [
//           { "label": "Menu", "attrPageId": "menu" },
//           { "label": "Classes", "attrPageId": "classes", "attrTopicId": "beginners" }
//         ] }
//     ],
//     "social": [
//       { "label": "Instagram", "attrHref": "https://www.instagram.com/example" }
//     ]
//   }
//
// `columns` are lists of links, each under its `title`. `social` is one row of links
// under them, meant for a site's pages elsewhere.
//
// A link is one of two kinds, and what it names says which:
//
//   - a page of the app: `attrPageId`, and `attrTopicId` for one of its sub-pages;
//   - somewhere else: `attrHref`, a whole address that begins `https://`,
//     `http://`, `mailto:` or `tel:`. A web address opens in a new tab.
//
// A link with no words, or one that names neither, is not drawn: a link that leads
// nowhere is worse than none. A column left with no links is not drawn, and an app
// whose `footer` leaves nothing to draw has the footer it had.

import { safeClone } from 'spyne';
import { isRouteOf } from 'traits/utils/call-to-action-routes.js';

const wordsOf = (value) => (typeof value === 'string' ? value.trim() : '');

// An address that leaves the app, and one of those that is a page on the web.
const ELSEWHERE = /^(https?:\/\/|mailto:|tel:)\S+$/i;
const ON_THE_WEB = /^https?:\/\//i;

/**
 * Makes one link ready for its markup, and says whether it is one to draw. The
 * entry it is given is changed and not replaced, so that what the CMS has put on
 * it stays: its words can still be clicked to edit.
 *
 * Every link is given every key the markup reads, so that one piece of markup
 * draws both kinds: a key that does not apply is an empty string.
 *
 *   attrChannel  'ROUTE' for a page of the app; a press on it changes the route
 *                and loads no document
 *   attrHref     the address
 *   attrTarget   '_blank' for a page on the web
 *   attrRel      'noopener noreferrer' with it
 */
const shapeLink = (link, model, hrefOf) => {
  if (link === null || typeof link !== 'object' || wordsOf(link.label) === '') {
    return false;
  }

  const pageId = wordsOf(link.attrPageId);
  const href = wordsOf(link.attrHref);

  if (isRouteOf(model, pageId)) {
    // A sub-page that is not one of the page's own: the page.
    const asked = wordsOf(link.attrTopicId);
    const topicId = isRouteOf(model, pageId, asked) ? asked : '';

    Object.assign(link, {
      attrChannel: 'ROUTE',
      attrPageId: pageId,
      attrTopicId: topicId,
      attrHref: hrefOf({ pageId, topicId }),
      attrTarget: '',
      attrRel: '',
    });

    return true;
  }

  if (ELSEWHERE.test(href)) {
    const onTheWeb = ON_THE_WEB.test(href);

    Object.assign(link, {
      attrChannel: '',
      attrPageId: '',
      attrTopicId: '',
      attrHref: href,
      attrTarget: onTheWeb ? '_blank' : '',
      attrRel: onTheWeb ? 'noopener noreferrer' : '',
    });

    return true;
  }

  return false;
};

const listOf = (value) => (Array.isArray(value) ? value : []);

/**
 * What the footer's links draw, or null where the app's model asks for none.
 *
 *   { columns: [{ title, attrTitleId, links }], social: [link],
 *     attrColumnCount, attrSocialCount, hasRouteLinks }
 *
 * `model` is the app's; it is not changed. `hrefOf` turns route ids into an
 * address the way the app's routes are written. The two counts are for the styles,
 * which do not draw a part that has nothing in it. `hasRouteLinks` is for the view,
 * which listens for presses only where there is a link to a page of the app.
 */
export const footerLinksOf = (model, hrefOf) => {
  const asked = model?.footer;

  if (asked === null || typeof asked !== 'object') {
    return null;
  }

  const footer = safeClone(asked);
  const linksOf = (list) =>
    listOf(list).filter((link) => shapeLink(link, model, hrefOf));

  const columns = listOf(footer.columns)
    .filter((column) => column !== null && typeof column === 'object')
    .filter((column) => {
      column.links = linksOf(column.links);
      column.title = wordsOf(column.title) === '' ? '' : column.title;

      return column.links.length > 0;
    });
  const social = linksOf(footer.social);

  if (columns.length === 0 && social.length === 0) {
    return null;
  }

  columns.forEach((column, index) => {
    column.attrTitleId = `footer-links-title-${index}`;
  });

  return Object.assign(footer, {
    columns,
    social,
    attrColumnCount: String(columns.length),
    attrSocialCount: String(social.length),
    hasRouteLinks: [...columns.flatMap((c) => c.links), ...social].some(
      (link) => link.attrChannel === 'ROUTE',
    ),
  });
};
