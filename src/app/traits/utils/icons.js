import { ICON_SHAPES } from 'traits/utils/icon-shapes.js';
import { ICON_SHAPES_FILLED } from 'traits/utils/icon-shapes-filled.js';

/**
 * The shape of the icon of that name, as the `d` of an SVG path; an empty string
 * where this app has no icon of that name, so nothing is drawn.
 *
 * The names are the keys of ICON_SHAPES (icon-shapes.js).
 */
export const iconPath = (name) =>
  typeof name === 'string' && Object.hasOwn(ICON_SHAPES, name)
    ? ICON_SHAPES[name]
    : '';

/** Whether this app has an icon of that name. */
export const hasIcon = (name) => iconPath(name) !== '';

/**
 * The filled shape of the icon of that name: what Material draws for the
 * destination you are on, in a navigation bar or rail.
 *
 * Where this app has no filled drawing of it (icon-shapes-filled.js), the outlined
 * shape is given, so a selected icon is never missing; an empty string where this
 * app has no icon of that name at all.
 */
export const iconPathFilled = (name) =>
  typeof name === 'string' && Object.hasOwn(ICON_SHAPES_FILLED, name)
    ? ICON_SHAPES_FILLED[name]
    : iconPath(name);
