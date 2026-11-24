import { hasIcon, iconPath, iconPathFilled } from 'traits/utils/icons.js';

/**
 * The icon a destination shows in a navigation bar or rail.
 *
 * A top-level page names its own in the model, with the key `navIcon`: a name from
 * this app's icons (icon-shapes.js). A page that names none, or names one this app
 * does not have, gets the icon of its kind (`pageType`) from this table; a page of
 * no kind listed here gets NAV_ICON_OF_ANY_PAGE.
 *
 * To give a page another icon, write `navIcon` on it in app.model.json. To change
 * what a kind of page gets, change this table.
 */
export const NAV_ICON_OF_KIND = Object.freeze({
  landing: 'home',
  about: 'groups',
  gallery: 'photo_camera',
  blog: 'description',
  article: 'description',
  shop: 'shopping_bag',
  contact: 'mail',
  list: 'info',
  generic: 'info',
});

export const NAV_ICON_OF_ANY_PAGE = 'info';

/** The name of the icon that page shows as a destination. */
export const navIconName = (page) => {
  const { navIcon, pageType } = page ?? {};

  if (hasIcon(navIcon)) {
    return navIcon;
  }

  return typeof pageType === 'string' &&
    Object.hasOwn(NAV_ICON_OF_KIND, pageType)
    ? NAV_ICON_OF_KIND[pageType]
    : NAV_ICON_OF_ANY_PAGE;
};

/**
 * The navigation's links, each with the icon of its page: the icon's name, its
 * outlined shape and its filled shape (for the destination you are on).
 *
 * `links` are the route channel's (each carries a `pageId`); `pages` are the model's
 * top-level pages. Neither is changed: the links come back as new objects.
 */
export const withNavIcons = (links = [], pages = []) =>
  links.map((link) => {
    const navIcon = navIconName(
      pages.find((page) => page?.pageId === link.pageId),
    );

    return {
      ...link,
      navIcon,
      attrIconPath: iconPath(navIcon),
      attrIconPathFilled: iconPathFilled(navIcon),
    };
  });

/**
 * The words a destination shows under its icon.
 *
 * A page says them in the model, with the key `navLabel`. A page that has none
 * shows the route channel's title for the link. The framework makes that title
 * from the route's key, in capitals (`page-view` is PAGE VIEW); Material sets a
 * label as a sentence, so a title that is all capitals is given back with only
 * its first letter a capital. A title in any other case is given back as it is.
 */
export const navLabel = (link, page) => {
  const { navLabel: written } = page ?? {};

  if (typeof written === 'string' && written.trim() !== '') {
    return written.trim();
  }

  const title = String(link?.title ?? '');
  const isAllCapitals = title !== '' && title === title.toUpperCase();

  return isAllCapitals ? title.charAt(0) + title.slice(1).toLowerCase() : title;
};

/**
 * The destinations of a navigation bar or rail: the app's top-level links, each
 * with its `label`, its icon's name and the icon's two shapes.
 *
 * `links` are all of the route channel's; only those of the first level are
 * destinations. `pages` are the model's top-level pages.
 */
export const navDestinations = (links = [], pages = []) =>
  withNavIcons(
    links.filter((link) => link?.navLevel === 1),
    pages,
  ).map((link) => ({
    ...link,
    label: navLabel(
      link,
      pages.find((page) => page?.pageId === link.pageId),
    ),
  }));
