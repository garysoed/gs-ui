import {Arrays} from '../../external/gs_tools/src/collection';
import {BasicButton} from '../button/basic-button';
import {BaseElement, ElementRegistrar} from '../../external/gs_tools/src/webc';
import {DefaultPalettes} from './default-palettes';
import {Icon} from '../tool/icon';
import {Injector} from '../../external/gs_tools/src/inject';
import {Menu} from '../tool/menu';
import {MenuContainer} from '../tool/menu-container';
import {Templates} from '../../external/gs_tools/src/webc';
import {Theme} from '../theming/theme';
import {ThemeService} from '../theming/theme-service';


const DEFAULT_ELEMENTS_: gs.ICtor<BaseElement>[] = [
  BasicButton,
  Icon,
  Menu,
  MenuContainer,
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
    let templates = Templates.newInstance(new Map<RegExp, string>([
      [/rgba\(11,11,11/g, 'rgba(var(--gsRgbBaseDark)'],
      [/rgba\(22,22,22/g, 'rgba(var(--gsRgbBaseNormal)'],
      [/rgba\(33,33,33/g, 'rgba(var(--gsRgbBaseLight)'],
      [/rgba\(44,44,44/g, 'rgba(var(--gsRgbAccent)'],
    ]));
    Injector.bindProvider(() => document, 'x.dom.document');
    Injector.bindProvider(() => window, 'x.dom.window');
    Injector.bindProvider(() => templates, 'x.gs_tools.templates');
    let injector = Injector.newInstance();
    let registrar = ElementRegistrar.newInstance(injector, templates);
    Arrays.of(DEFAULT_ELEMENTS_)
        .forEach((ctor: gs.ICtor<BaseElement>) => {
          registrar.register(ctor);
        });

    let themeService = injector.instantiate<ThemeService>(ThemeService);
    themeService.initialize();
    themeService.install(theme);
  }

  /**
   * Creates a new instance of the app.
   */
  static newInstance(): Main {
    return new Main();
  }
}
