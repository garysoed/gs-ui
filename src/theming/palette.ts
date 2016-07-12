import {IColor} from '../../external/gs_tools/src/color';
import {Log} from '../../external/gs_tools/src/util';
import {Validate} from '../../external/gs_tools/src/valid';

const LOG = new Log('theming.Palette');


/**
 * Represents a color palette.
 */
export class Palette {
  private accent_: IColor;
  private dark_: IColor;
  private normal_: IColor;
  private light_: IColor;

  constructor(accent: IColor, dark: IColor, normal: IColor, light: IColor) {
    this.accent_ = accent;
    this.dark_ = dark;
    this.normal_ = normal;
    this.light_ = light;
  }

  /**
   * The accent color. This is recommended to be at 100% saturation.
   */
  get accent(): IColor {
    return this.accent_;
  }

  /**
   * The dark color. This is recommended to have a luminance of at most 0.06.
   */
  get dark(): IColor {
    return this.dark_;
  }

  /**
   * The light color. This is recommended to have luminance of at least 0.42.
   */
  get light(): IColor {
    return this.light_;
  }

  /**
   * The normal color. This is recommended to have luminance of at most 0.22.
   */
  get normal(): IColor {
    return this.normal_;
  }

  /**
   * Creates a new instance of the palette.
   *
   * @param accent The accent color. This is recommended to be at 100% saturation.
   * @param dark The dark color. This is recommended to have a luminance of at most 0.06.
   * @param normal The normal color. This is recommended to have luminance of at most 0.22.
   * @param light The light color. This is recommended to have luminance of at least 0.42.
   * @param name Name of the palette.
   * @return New instanc of Palette.
   */
  static newInstance(
      accent: IColor,
      dark: IColor,
      normal: IColor,
      light: IColor,
      name: string): Palette {
    let validationResult = Validate
        .batch({
          'DARK_LUMINANCE': Validate.number(dark.luminance).toNot.beGreaterThan(0.06)
              .orThrows('"dark" color is recommended to have luminance <= 0.06, but was ${value}'),
          'NORMAL_LUMINANCE': Validate.number(normal.luminance).toNot.beGreaterThan(0.22)
              .orThrows('"normal" color is recommended to have luminance <= 0.22,'
                  + ' but was ${value}'),
          'LIGHT_LUMINANCE': Validate.number(light.luminance).to.beGreaterThanOrEqualTo(0.42)
              .orThrows('"light" color is recommended to have luminance >= 0.42, but was ${value}'),
        })
        .to.allBeValid()
        .orThrows(`Palette ${name} does not meet the recommended specs: \${value}`);

    if (!validationResult.passes) {
      Log.warn(LOG, validationResult.errorMessage);
    }

    return new Palette(accent, dark, normal, light);
  }
}
