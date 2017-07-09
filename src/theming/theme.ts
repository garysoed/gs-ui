import { Color, Colors, HslColor, RgbColor } from 'external/gs_tools/src/color';
import { cache } from 'external/gs_tools/src/data/cache';
import { Solve, Spec } from 'external/gs_tools/src/solver';
import { Log } from 'external/gs_tools/src/util';


const LOG: Log = new Log('theming.Theme');

export const BLACK = RgbColor.newInstance(0, 0, 0);
export const WHITE = RgbColor.newInstance(255, 255, 255);


/**
 * Represents a theme.
 */
export class Theme {
  private readonly accent_: Color;
  private readonly actionDistance_: number;
  private readonly base_: Color;
  private readonly baseDistance_: number;
  private readonly contrast_: number;

  constructor(
      base: Color,
      accent: Color,
      baseDistance: number,
      actionDistance: number,
      contrast: number) {
    this.accent_ = accent;
    this.actionDistance_ = actionDistance;
    this.base_ = base;
    this.baseDistance_ = baseDistance;
    this.contrast_ = contrast;
  }

  getAccent(): Color {
    return this.accent_;
  }

  getAccentHue(): Color {
    return this.accent_;
  }

  @cache()
  getAction(): Color {
    return Theme.createShade_(this.accent_, 0.5, true);
  }

  @cache()
  getActionDark(reverseMode: boolean): Color {
    return Theme.createShade_(this.accent_, 0.5 - this.actionDistance_, reverseMode);
  }

  @cache()
  getActionDarkest(reverseMode: boolean): Color {
    return Theme.createShade_(this.accent_, 0.5 - this.actionDistance_ * 2, reverseMode);
  }

  @cache()
  getActionLight(reverseMode: boolean): Color {
    return Theme.createShade_(this.accent_, 0.5 + this.actionDistance_, reverseMode);
  }

  @cache()
  getActionLightest(reverseMode: boolean): Color {
    return Theme.createShade_(this.accent_, 0.5 + this.actionDistance_ * 2, reverseMode);
  }

  @cache()
  getBase(): Color {
    return Theme.createShade_(this.base_, 0.5, true);
  }

  @cache()
  getBaseDark(reverseMode: boolean): Color {
    return Theme.createShade_(this.base_, 0.5 - this.baseDistance_, reverseMode);
  }

  @cache()
  getBaseDarkest(reverseMode: boolean): Color {
    return Theme.createShade_(this.base_, 0.5 - this.baseDistance_ * 2, reverseMode);
  }

  getBaseHue(): Color {
    return this.base_;
  }

  @cache()
  getBaseLight(reverseMode: boolean): Color {
    return Theme.createShade_(this.base_, 0.5 + this.baseDistance_, reverseMode);
  }

  @cache()
  getBaseLightest(reverseMode: boolean): Color {
    return Theme.createShade_(this.base_, 0.5 + this.baseDistance_ * 2, reverseMode);
  }

  @cache()
  getBlackFade(): Color {
    return Theme.getForegroundFade_(BLACK, this.getBaseLight(true), this.contrast_ * 2 / 3);
  }

  @cache()
  getBlackFader(): Color {
    return Theme.getForegroundFade_(BLACK, WHITE, this.contrast_ / 3);
  }

  @cache()
  getBlackOnAccent(): Color {
    const accent = this.getAccent();
    return Colors.getContrast(BLACK, accent) > Colors.getContrast(WHITE, accent) ? BLACK : WHITE;
  }

  getContrast(): number {
    return this.contrast_;
  }

  @cache()
  getWhiteFade(): Color {
    return Theme.getForegroundFade_(WHITE, this.getBaseDark(false), this.contrast_ * 2 / 3);
  }

  @cache()
  getWhiteFader(): Color {
    return Theme.getForegroundFade_(WHITE, BLACK, this.contrast_ / 3);
  }

  /**
   * @param base Base color.
   * @param value Proportion of shade. 0 means totally dark, 1 means totally bright.
   * @param reverseMode If true, saturation === value. Otherwise, saturation === 1 - value.
   * @return The shade color.
   */
  private static createShade_(base: Color, value: number, reverseMode: boolean): Color {
    const cappedValue = Math.min(Math.max(value, 0), 1);
    return HslColor.newInstance(
        base.getHue(),
        (reverseMode ? cappedValue : 1 - cappedValue) * base.getSaturation(),
        cappedValue);
  }

  /**
   * @param foreground
   * @param background
   * @param contrast Ideal contrast ratio.
   * @return Foreground with the alpha applied such that its contrast ratio is just ideal.
   */
  private static getForegroundFade_(
      foreground: Color, background: Color, contrast: number): Color {
    const alpha = Solve.findThreshold(
        Spec.newInstance(0, 0.1, 1),
        (alpha: number) => {
          return Theme.isHighContrastForegroundAlpha_(foreground, background, alpha, contrast);
        },
        false);
    if (alpha === null) {
      throw new Error('No alpha value can be computed');
    }

    return Colors.mix(foreground, background, alpha);
  }

  /**
   * @param value Shade distance.
   * @param contrast Ideal contrast ratio.
   * @param accentColor
   * @param baseNormalDark
   * @param baseReversedLight
   * @return True iff the value and colors provide high enough contrast for action colors.
   */
  private static isHighContrastAction_(
      value: number,
      contrast: number,
      accentColor: Color,
      baseNormalDark: Color,
      baseReversedLight: Color): boolean {
    const actionNormalDark = Theme.createShade_(accentColor, 0.5 - value, false);
    const actionNormalDarkest = Theme.createShade_(accentColor, 0.5 - value * 2, false);
    const actionNormalLight = Theme.createShade_(accentColor, 0.5 + value, false);
    const actionReversedDark = Theme.createShade_(accentColor, 0.5 - value, true);
    const actionReversedLight = Theme.createShade_(accentColor, 0.5 + value, true);

    return true
        // Normal colors
        && Colors.getContrast(actionNormalDark, WHITE) >= contrast
        && Colors.getContrast(BLACK, actionNormalLight) >= contrast

        // Normal Highlights
        && Colors.getContrast(actionReversedLight, baseNormalDark) >= contrast
        && Colors.getContrast(WHITE, actionReversedDark) >= contrast

        // Inverted colors
        && Colors.getContrast(actionReversedLight, BLACK) >= contrast

        // Normal Highlights
        && Colors.getContrast(actionNormalDarkest, baseReversedLight) >= contrast;
  }

  /**
   * @param value Shade distance.
   * @param contrast Ideal contrast ratio.
   * @param baseColor
   * @return True iff the value and colors provide high enough contrast for action colors.
   */
  private static isHighContrastBase_(
      value: number,
      contrast: number,
      baseColor: Color): boolean {
    const baseNormalDark = Theme.createShade_(baseColor, 0.5 - value, false);
    const baseNormalDarkest = Theme.createShade_(baseColor, 0.5 - value * 2, false);
    const baseNormalLightest = Theme.createShade_(baseColor, 0.5 + value * 2, false);
    const baseReversedDarkest = Theme.createShade_(baseColor, 0.5 - value * 2, true);
    const baseReversedLight = Theme.createShade_(baseColor, 0.5 + value, true);
    const baseReversedLightest = Theme.createShade_(baseColor, 0.5 + value * 2, true);

    return true
        // Normal colors
        && Colors.getContrast(baseNormalDark, WHITE) >= contrast
        && Colors.getContrast(BLACK, baseNormalLightest) >= contrast

        // Normal Highlights
        && Colors.getContrast(baseReversedLightest, baseNormalDark) >= contrast
        && Colors.getContrast(WHITE, baseNormalDark) >= contrast
        && Colors.getContrast(baseReversedLightest, baseReversedDarkest) >= contrast

        // Inverted colors
        && Colors.getContrast(baseReversedLightest, BLACK) >= contrast
        && Colors.getContrast(WHITE, baseReversedDarkest) >= contrast

        // Normal Highlights
        && Colors.getContrast(baseNormalDarkest, baseReversedLight) >= contrast
        && Colors.getContrast(BLACK, baseReversedLight) >= contrast
        && Colors.getContrast(baseNormalDarkest, baseReversedLightest) >= contrast;
  }

  /**
   * @param foreground
   * @param background
   * @param alpha
   * @param contrast Ideal contrast ratio.
   * @return True iff the foreground with the alpha applied provides enough contrast ratio on the
   *     given background.
   */
  private static isHighContrastForegroundAlpha_(
      foreground: Color,
      background: Color,
      alpha: number,
      contrast: number): boolean {
    return Colors.getContrast(Colors.mix(foreground, background, alpha), background) >= contrast;
  }

  /**
   * Creates a new instance of the theme.
   * @param base The base palette
   * @param accent The accent palette
   * @param contrast The contrast ratio for most letters.
   * @return New instance of the theme.
   */
  static newInstance(baseColor: Color, accentColor: Color, contrast: number = 4.5): Theme {
    if (baseColor === accentColor) {
      Log.warn(LOG, 'base and accent colors are recommended to not be equal');
    }

    const baseDistance = Solve.findThreshold(
        Spec.newInstance(0, 0.01, 0.5),
        (value: number) => {
          return Theme.isHighContrastBase_(value, contrast, baseColor);
        },
        false);

    if (baseDistance === null) {
      throw new Error('Base distance cannot be computed');
    }

    const baseNormalDark = Theme.createShade_(baseColor, 0.5 - baseDistance, false);
    const baseReversedLight = Theme.createShade_(baseColor, 0.5 + baseDistance, true);

    const actionDistance = Solve.findThreshold(
        Spec.newInstance(0, 0.01, 0.5),
        (value: number) => {
          return Theme.isHighContrastAction_(
              value, contrast, accentColor, baseNormalDark, baseReversedLight);
        },
        false);

    if (actionDistance === null) {
      throw new Error(`Action distance cannot be computed`);
    }
    return new Theme(baseColor, accentColor, baseDistance, actionDistance, contrast);
  }
}
// TODO: Mutable
