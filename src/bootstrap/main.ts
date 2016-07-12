import {Arrays} from '../../external/gs_tools/src/collection';
import {BasicButton} from '../button/basic-button';
import {DefaultPalettes} from './default-palettes';
import {BaseElement, ElementRegistrar} from '../../external/gs_tools/src/webc';
import {Injector} from '../../external/gs_tools/src/inject';
import {Theme} from '../theming/theme';
import {ThemeService} from '../theming/theme-service';


const DEFAULT_ELEMENTS_: gs.ICtor<BaseElement>[] = [
  BasicButton,
];

const DEFAULT_THEME_: Theme = Theme.newInstance(
    DefaultPalettes['cerulian'],
    DefaultPalettes['vermilion']);


/**
 * Main entry class to the app.
 */
export class Main {
  constructor() { }

  /**
   * Bootstraps the app.
   *
   * @param theme The theme to apply to the app.
   */
  bootstrap(theme: Theme = DEFAULT_THEME_): void {
    let injector = Injector.newInstance();
    let registrar = ElementRegistrar.newInstance(injector);
    Arrays.of(DEFAULT_ELEMENTS_)
        .forEach((ctor: gs.ICtor<BaseElement>) => {
          registrar.register(ctor);
        });

    ThemeService.install(theme);
  }

  /**
   * Creates a new instance of the app.
   */
  static newInstance(): Main {
    return new Main();
  }
}
