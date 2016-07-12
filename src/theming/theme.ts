import {Log} from '../../external/gs_tools/src/util';
import {Palette} from './palette';
import {Validate} from '../../external/gs_tools/src/valid';


const LOG: Log = new Log('theming.Theme');

/**
 * Represents a theme.
 */
export class Theme {
  private accent_: Palette;
  private base_: Palette;

  constructor(base: Palette, accent: Palette) {
    this.accent_ = accent;
    this.base_ = base;
  }

  /**
   * The accent palette.
   */
  get accent(): Palette {
    return this.accent_;
  }

  /**
   * The base color palette.
   */
  get base(): Palette {
    return this.base_;
  }

  /**
   * Creates a new instance of the theme.
   * @param base The base palette
   * @param accent The accent palette
   * @return New instance of the theme.
   */
  static newInstance(base: Palette, accent: Palette): Theme {
    let validationResult = Validate.any(base).toNot.beEqualTo(accent);
    if (!validationResult.passes) {
      Log.warn(LOG, 'base and accent palettes are recommended to not be equal');
    }
    return new Theme(base, accent);
  }
}
