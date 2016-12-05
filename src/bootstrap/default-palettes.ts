import {RgbColor} from 'external/gs_tools/src/color';

import {Palette} from '../theming/palette';


/**
 * Default built in palettes for gs-ui.
 *
 * Taken from Palleton. Theme colors uses "Pastel" - Middle, lighter and darker.
 * Accent uses "Full colors" - Middle
 *
 * Name taken by finding the closest color to the accent color in htmlcsscolor. If there is a
 * conflict, use the normal theme color.
 */
export const DefaultPalettes = {
  amber: Palette.newInstance( // Hue: 75
      RgbColor.newInstance(255, 191, 0),
      RgbColor.newInstance(128, 101, 21),
      RgbColor.newInstance(170, 142, 57),
      RgbColor.newInstance(212, 186, 106),
      'amber'),
  bluediamond: Palette.newInstance( // Hue: 285
      RgbColor.newInstance(83, 15, 173),
      RgbColor.newInstance(49, 21, 87),
      RgbColor.newInstance(75, 45, 115),
      RgbColor.newInstance(107, 78, 144),
      'bluediamond'),
  brightgreen: Palette.newInstance( // Hue: 165
      RgbColor.newInstance(103, 227, 0),
      RgbColor.newInstance(62, 114, 19),
      RgbColor.newInstance(96, 151, 50),
      RgbColor.newInstance(138, 189, 95),
      'brightgreen'),
  crimson: Palette.newInstance( // Hue: 345
      RgbColor.newInstance(228, 0, 69),
      RgbColor.newInstance(114, 19, 48),
      RgbColor.newInstance(152, 51, 82),
      RgbColor.newInstance(190, 95, 124),
      'crimson'),
  darkmagenta: Palette.newInstance( // Hue: 315
      RgbColor.newInstance(166, 0, 166),
      RgbColor.newInstance(83, 14, 83),
      RgbColor.newInstance(111, 37, 111),
      RgbColor.newInstance(138, 69, 138),
      'darkmagenta'),
  darkorange: Palette.newInstance( // Hue: 45
      RgbColor.newInstance(255, 146, 0),
      RgbColor.newInstance(128, 82, 21),
      RgbColor.newInstance(170, 121, 57),
      RgbColor.newInstance(212, 167, 106),
      'darkorange'),
  denim: Palette.newInstance( // Hue: 225
      RgbColor.newInstance(11, 98, 164),
      RgbColor.newInstance(18, 54, 82),
      RgbColor.newInstance(41, 79, 109),
      RgbColor.newInstance(73, 109, 137),
      'denim'),
  egyptianblue: Palette.newInstance( // Hue: 240
      RgbColor.newInstance(18, 64, 171),
      RgbColor.newInstance(22, 41, 85),
      RgbColor.newInstance(46, 65, 114),
      RgbColor.newInstance(79, 98, 142),
      'egyptianblue'),
  electriclime: Palette.newInstance( // Hue: 135
      RgbColor.newInstance(204, 246, 0),
      RgbColor.newInstance(105, 123, 21),
      RgbColor.newInstance(145, 164, 55),
      RgbColor.newInstance(187, 205, 103),
      'electriclime'),
  freespeechgreen: Palette.newInstance( // Hue: 180
      RgbColor.newInstance(0, 204, 0),
      RgbColor.newInstance(17, 102, 17),
      RgbColor.newInstance(45, 136, 45),
      RgbColor.newInstance(85, 170, 85),
      'freespeechgreen'),
  gold: Palette.newInstance( // Hue: 90
      RgbColor.newInstance(255, 211, 0),
      RgbColor.newInstance(128, 109, 21),
      RgbColor.newInstance(170, 151, 57),
      RgbColor.newInstance(212, 194, 106),
      'gold'),
  goldenyellow: Palette.newInstance( // Hue: 105
      RgbColor.newInstance(255, 232, 0),
      RgbColor.newInstance(128, 118, 21),
      RgbColor.newInstance(170, 160, 57),
      RgbColor.newInstance(212, 203, 106),
      'goldenyellow'),
  grey: Palette.newInstance(
      RgbColor.newInstance(229, 229, 229),
      RgbColor.newInstance(88, 88, 88),
      RgbColor.newInstance(136, 136, 136),
      RgbColor.newInstance(180, 180, 180),
      'grey'),
  jade: Palette.newInstance( // Hue: 195
      RgbColor.newInstance(0, 175, 100),
      RgbColor.newInstance(15, 87, 56),
      RgbColor.newInstance(39, 117, 84),
      RgbColor.newInstance(73, 146, 115),
      'jade'),
  orange: Palette.newInstance( // Hue: 60
      RgbColor.newInstance(255, 170, 0),
      RgbColor.newInstance(128, 92, 21),
      RgbColor.newInstance(170, 132, 57),
      RgbColor.newInstance(212, 177, 106),
      'orange'),
  persianblue: Palette.newInstance( // Hue: 255
      RgbColor.newInstance(27, 27, 179),
      RgbColor.newInstance(26, 26, 89),
      RgbColor.newInstance(52, 52, 119),
      RgbColor.newInstance(86, 86, 149),
      'persianblue'),
  persiangreen: Palette.newInstance( // Hue: 210
      RgbColor.newInstance(0, 153, 153),
      RgbColor.newInstance(13, 77, 77),
      RgbColor.newInstance(34, 102, 102),
      RgbColor.newInstance(64, 127, 127),
      'persiangreen'),
  purpleheart: Palette.newInstance( // Hue: 300
      RgbColor.newInstance(113, 9, 170),
      RgbColor.newInstance(61, 18, 85),
      RgbColor.newInstance(88, 42, 114),
      RgbColor.newInstance(118, 75, 142),
      'purpleheart'),
  red: Palette.newInstance( // Hue: 0
      RgbColor.newInstance(255, 0, 0),
      RgbColor.newInstance(128, 21, 21),
      RgbColor.newInstance(170, 57, 57),
      RgbColor.newInstance(212, 106, 106),
      'red'),
  safetyorange: Palette.newInstance( // Hue: 30
      RgbColor.newInstance(255, 116, 0),
      RgbColor.newInstance(128, 69, 21),
      RgbColor.newInstance(170, 108, 57),
      RgbColor.newInstance(212, 154, 106),
      'safetyorange'),
  springbud: Palette.newInstance( // Hue: 150
      RgbColor.newInstance(159, 238, 0),
      RgbColor.newInstance(86, 119, 20),
      RgbColor.newInstance(122, 159, 53),
      RgbColor.newInstance(165, 198, 99),
      'springbud'),
  ultramarine: Palette.newInstance( // Hue: 270
      RgbColor.newInstance(57, 20, 175),
      RgbColor.newInstance(38, 23, 88),
      RgbColor.newInstance(64, 48, 117),
      RgbColor.newInstance(97, 81, 146),
      'ultramarine'),
  vermilion: Palette.newInstance( // Hue: 15
      RgbColor.newInstance(255, 73, 0),
      RgbColor.newInstance(128, 51, 21),
      RgbColor.newInstance(170, 89, 57),
      RgbColor.newInstance(212, 136, 106),
      'vermilion'),
  violetred: Palette.newInstance( // Hue: 330
      RgbColor.newInstance(205, 0, 116),
      RgbColor.newInstance(102, 17, 65),
      RgbColor.newInstance(136, 45, 96),
      RgbColor.newInstance(170, 85, 133),
      'violetred'),
  yellow: Palette.newInstance( // Hue: 120
      RgbColor.newInstance(255, 255, 0),
      RgbColor.newInstance(128, 128, 21),
      RgbColor.newInstance(170, 170, 57),
      RgbColor.newInstance(212, 212, 106),
      'yellow'),
};
