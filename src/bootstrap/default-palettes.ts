import { HslColor } from 'external/gs_tools/src/color';


/**
 * Default built in palettes for gs-ui.
 *
 * Taken from Palleton. Theme colors uses "Pastel" - Middle, lighter and darker.
 * Accent uses "Full colors" - Middle
 *
 * Name taken by finding the closest color to the accent color in htmlcsscolor. If there is a
 * conflict, use the normal theme color.
 */
/* tslint:disable:object-literal-sort-keys */
export const DefaultPalettes = {
  red: HslColor.newInstance(0, 1, 0.5),
  scarlet: HslColor.newInstance(7.5, 1, 0.5),
  vermilion: HslColor.newInstance(15, 1, 0.5),
  blazeorange: HslColor.newInstance(22.5, 1, 0.5),
  flushorange: HslColor.newInstance(30, 1, 0.5),
  orangepeel: HslColor.newInstance(37.5, 1, 0.5),
  amber: HslColor.newInstance(45, 1, 0.5),
  schoolbusyellow: HslColor.newInstance(52.5, 1, 0.5),
  yellow: HslColor.newInstance(60, 1, 0.5),
  chartreuse: HslColor.newInstance(82.5, 1, 0.5),
  harlequin: HslColor.newInstance(105, 1, 0.5),
  green: HslColor.newInstance(127.5, 1, 0.5),
  springgreen: HslColor.newInstance(150, 1, 0.5),
  aqua: HslColor.newInstance(172.5, 1, 0.5),
  cerulean: HslColor.newInstance(195, 1, 0.5),
  blueribbon: HslColor.newInstance(217.5, 1, 0.5),
  blue: HslColor.newInstance(240, 1, 0.5),
  blueviolet: HslColor.newInstance(255, 1, 0.5),
  electricviolet: HslColor.newInstance(270, 1, 0.5),
  violet: HslColor.newInstance(285, 1, 0.5),
  magenta: HslColor.newInstance(300, 1, 0.5),
  purplepizzazz: HslColor.newInstance(315, 1, 0.5),
  rose: HslColor.newInstance(330, 1, 0.5),
  torchred: HslColor.newInstance(345, 1, 0.5),
  grey: HslColor.newInstance(0, 0, 0.5),
};
/* tslint:enable:object-literal-sort-keys */
