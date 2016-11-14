import {HslColor} from 'external/gs_tools/src/color';

import {Palette} from '../theming/palette';


/**
 * Default built in palettes for gs-ui.
 */
export const DefaultPalettes = {
  amber: Palette.newInstance(
      HslColor.newInstance(52.5, 1, 0.5),
      HslColor.newInstance(45, 1, 0.17),
      HslColor.newInstance(45, 0.75, 0.35),
      HslColor.newInstance(45, 0.75, 0.5),
      'amber'),
  azure: Palette.newInstance(
      HslColor.newInstance(195, 1, 0.5),
      HslColor.newInstance(210, 1, 0.26),
      HslColor.newInstance(210, 0.75, 0.5),
      HslColor.newInstance(210, 0.75, 0.7),
      'azure'),
  blue: Palette.newInstance(
      HslColor.newInstance(240, 1, 0.5),
      HslColor.newInstance(240, 1, 0.46),
      HslColor.newInstance(240, 0.75, 0.5),
      HslColor.newInstance(240, 0.75, 0.81),
      'blue'),
  cerulian: Palette.newInstance(
      HslColor.newInstance(187.5, 1, 0.5),
      HslColor.newInstance(195, 1, 0.19),
      HslColor.newInstance(195, 0.75, 0.39),
      HslColor.newInstance(195, 0.75, 0.58),
      'cerulian'),
  chartreuse: Palette.newInstance(
      HslColor.newInstance(75, 1, 0.5),
      HslColor.newInstance(90, 1, 0.15),
      HslColor.newInstance(90, 0.75, 0.32),
      HslColor.newInstance(90, 0.75, 0.5),
      'chartreuse'),
  crimson: Palette.newInstance(
      HslColor.newInstance(352.5, 1, 0.5),
      HslColor.newInstance(345, 1, 0.28),
      HslColor.newInstance(345, 0.75, 0.50),
      HslColor.newInstance(345, 0.75, 0.76),
      'crimson'),
  cyan: Palette.newInstance(
      HslColor.newInstance(180, 1, 0.5),
      HslColor.newInstance(180, 1, 0.15),
      HslColor.newInstance(180, 0.75, 0.32),
      HslColor.newInstance(180, 0.75, 0.5),
      'cyan'),
  fuchsia: Palette.newInstance(
      HslColor.newInstance(307.5, 1, 0.5),
      HslColor.newInstance(315, 1, 0.26),
      HslColor.newInstance(315, 0.75, 0.50),
      HslColor.newInstance(315, 0.75, 0.75),
      'fuchsia'),
  green: Palette.newInstance(
      HslColor.newInstance(120, 1, 0.5),
      HslColor.newInstance(120, 1, 0.15),
      HslColor.newInstance(120, 0.75, 0.33),
      HslColor.newInstance(120, 0.75, 0.5),
      'green'),
  grey: Palette.newInstance(
      HslColor.newInstance(0, 0, 0.71),
      HslColor.newInstance(0, 0, 0.27),
      HslColor.newInstance(0, 0, 0.5),
      HslColor.newInstance(0, 0, 0.69),
      'grey'),
  harlequin: Palette.newInstance(
      HslColor.newInstance(112.5, 1, 0.5),
      HslColor.newInstance(105, 1, 0.15),
      HslColor.newInstance(105, 0.75, 0.33),
      HslColor.newInstance(105, 0.75, 0.5),
      'harlequin'),
  indigo: Palette.newInstance(
      HslColor.newInstance(247.5, 1, 0.5),
      HslColor.newInstance(255, 1, 0.43),
      HslColor.newInstance(255, 0.75, 0.5),
      HslColor.newInstance(255, 0.75, 0.8),
      'indigo'),
  lime: Palette.newInstance(
      HslColor.newInstance(67.5, 1, 0.5),
      HslColor.newInstance(75, 1, 0.14),
      HslColor.newInstance(75, 0.75, 0.31),
      HslColor.newInstance(75, 0.75, 0.5),
      'lime'),
  magenta: Palette.newInstance(
      HslColor.newInstance(300, 1, 0.5),
      HslColor.newInstance(300, 1, 0.24),
      HslColor.newInstance(300, 0.75, 0.49),
      HslColor.newInstance(300, 0.75, 0.74),
      'magenta'),
  malachite: Palette.newInstance(
      HslColor.newInstance(127.5, 1, 0.5),
      HslColor.newInstance(135, 1, 0.15),
      HslColor.newInstance(135, 0.75, 0.33),
      HslColor.newInstance(135, 0.75, 0.5),
      'malachite'),
  mulberry: Palette.newInstance(
      HslColor.newInstance(292.5, 1, 0.5),
      HslColor.newInstance(285, 1, 0.3),
      HslColor.newInstance(285, 0.75, 0.5),
      HslColor.newInstance(285, 0.75, 0.76),
      'mulberry'),
  orange: Palette.newInstance(
      HslColor.newInstance(45, 1, 0.5),
      HslColor.newInstance(30, 1, 0.21),
      HslColor.newInstance(30, 0.75, 0.42),
      HslColor.newInstance(30, 0.75, 0.62),
      'orange'),
  red: Palette.newInstance(
      HslColor.newInstance(0, 1, 0.5),
      HslColor.newInstance(0, 1, 0.28),
      HslColor.newInstance(0, 0.75, 0.5),
      HslColor.newInstance(0, 0.75, 0.77),
      'red'),
  rose: Palette.newInstance(
      HslColor.newInstance(315, 1, 0.5),
      HslColor.newInstance(330, 1, 0.27),
      HslColor.newInstance(330, 0.75, 0.50),
      HslColor.newInstance(330, 0.75, 0.76),
      'rose'),
  sapphire: Palette.newInstance(
      HslColor.newInstance(232.5, 1, 0.5),
      HslColor.newInstance(225, 1, 0.37),
      HslColor.newInstance(225, 0.75, 0.5),
      HslColor.newInstance(225, 0.75, 0.77),
      'sapphire'),
  spring: Palette.newInstance(
      HslColor.newInstance(165, 1, 0.5),
      HslColor.newInstance(150, 1, 0.15),
      HslColor.newInstance(150, 0.75, 0.33),
      HslColor.newInstance(150, 0.75, 0.5),
      'spring'),
  turquoise: Palette.newInstance(
      HslColor.newInstance(172.5, 1, 0.5),
      HslColor.newInstance(165, 1, 0.15),
      HslColor.newInstance(165, 0.75, 0.32),
      HslColor.newInstance(165, 0.75, 0.5),
      'turquoise'),
  vermilion: Palette.newInstance(
      HslColor.newInstance(7.5, 1, 0.5),
      HslColor.newInstance(15, 1, 0.25),
      HslColor.newInstance(15, 0.75, 0.5),
      HslColor.newInstance(15, 0.75, 0.71),
      'vermilion'),
  violet: Palette.newInstance(
      HslColor.newInstance(285, 1, 0.5),
      HslColor.newInstance(270, 1, 0.36),
      HslColor.newInstance(270, 0.75, 0.5),
      HslColor.newInstance(270, 0.75, 0.78),
      'violet'),
  yellow: Palette.newInstance(
      HslColor.newInstance(60, 1, 0.5),
      HslColor.newInstance(60, 1, 0.14),
      HslColor.newInstance(60, 0.75, 0.29),
      HslColor.newInstance(60, 0.75, 0.5),
      'yellow'),
};
