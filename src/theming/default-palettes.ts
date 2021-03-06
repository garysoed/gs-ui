import { Colors, HslColor } from 'external/gs_tools/src/color';
import { OrderedMap } from 'external/gs_tools/src/immutable';
import { Color } from 'external/gs_tools/src/interfaces';


const COLOR_MAP: OrderedMap<string, Color> = OrderedMap.of([
  ['red', HslColor.newInstance(0, 1, 0.5)],
  ['scarlet', HslColor.newInstance(7.5, 1, 0.5)],
  ['vermilion', HslColor.newInstance(15, 1, 0.5)],
  ['blazeorange', HslColor.newInstance(22.5, 1, 0.5)],
  ['flushorange', HslColor.newInstance(30, 1, 0.5)],
  ['orangepeel', HslColor.newInstance(37.5, 1, 0.5)],
  ['amber', HslColor.newInstance(45, 1, 0.5)],
  ['schoolbusyellow', HslColor.newInstance(52.5, 1, 0.5)],
  ['yellow', HslColor.newInstance(60, 1, 0.5)],
  ['chartreuse', HslColor.newInstance(82.5, 1, 0.5)],
  ['harlequin', HslColor.newInstance(105, 1, 0.5)],
  ['green', HslColor.newInstance(127.5, 1, 0.5)],
  ['springgreen', HslColor.newInstance(150, 1, 0.5)],
  ['aqua', HslColor.newInstance(172.5, 1, 0.5)],
  ['cerulean', HslColor.newInstance(195, 1, 0.5)],
  ['blueribbon', HslColor.newInstance(217.5, 1, 0.5)],
  ['blue', HslColor.newInstance(240, 1, 0.5)],
  ['blueviolet', HslColor.newInstance(255, 1, 0.5)],
  ['electricviolet', HslColor.newInstance(270, 1, 0.5)],
  ['violet', HslColor.newInstance(285, 1, 0.5)],
  ['magenta', HslColor.newInstance(300, 1, 0.5)],
  ['purplepizzazz', HslColor.newInstance(315, 1, 0.5)],
  ['rose', HslColor.newInstance(330, 1, 0.5)],
  ['torchred', HslColor.newInstance(345, 1, 0.5)],
  ['grey', HslColor.newInstance(0, 0, 0.5)],
]);

/**
 * Default built in palettes for gs-ui.
 *
 * Generated by taking the hues at red (0), yellow (60), and blue (240), and generating secondary,
 * tertiary, and quarternary colors.
 */
export const DefaultPalettes = {
  get(name: string): Color {
    const color = COLOR_MAP.get(name);
    if (!color) {
      throw new Error(`Color ${name} cannot be found`);
    }
    return color;
  },

  getAt(index: number): Color {
    const colorCount = COLOR_MAP.size() - 1;
    const entry = COLOR_MAP.getAt((colorCount - ((-1 * index) % colorCount)) % colorCount);
    if (!entry) {
      throw new Error(`No color found at position ${index}`);
    }
    return entry[1];
  },

  getClosestIndex(color: Color): number {
    type DistanceData = {distance: number, index: number};
    return COLOR_MAP
        .entries()
        .reduce((previousResult: DistanceData, value: [string, Color], index: number) => {
          const distance = Colors.getDistance(value[1], color);
          return distance < previousResult.distance ? {distance, index} : previousResult;
        },
        {distance: Number.POSITIVE_INFINITY, index: -1})
        .index;
  },

  getNames(): string[] {
    return [...COLOR_MAP.keys()];
  },
};
// TODO: Mutable
