import {Arrays} from '../../external/gs_tools/src/collection';
import {BasicButton} from '../button/basic-button';
import {BaseElement, ElementRegistrar} from '../../external/gs_tools/src/webc';
import {DefaultPalettes} from './default-palettes';
import {HorizontalTab} from '../section/horizontal-tab';
import {Icon} from '../tool/icon';
import {Injector} from '../../external/gs_tools/src/inject';
import {Menu} from '../tool/menu';
import {MenuContainer} from '../tool/menu-container';
import {RadioButton} from '../input/radio-button';
import {Templates} from '../../external/gs_tools/src/webc';
import {Theme} from '../theming/theme';
import {ThemeService} from '../theming/theme-service';


const DEFAULT_ELEMENTS_: gs.ICtor<BaseElement>[] = [
  BasicButton,
  HorizontalTab,
  Icon,
  Menu,
  MenuContainer,
  RadioButton,
];

const DEFAULT_THEME_: Theme = Theme.newInstance(
    DefaultPalettes['vermilion'],
    DefaultPalettes['harlequin']);


/**
 * Main entry class to the app.
 */
export class Main {
  constructor(
      private injector_: Injector,
      private themeService_: ThemeService,
      private registrar_: ElementRegistrar) { }

  /**
   * Bootstraps the app.
   *
   * @param theme The theme to apply to the app.
   */
  bootstrap(theme: Theme = DEFAULT_THEME_): void {
    Arrays.of(DEFAULT_ELEMENTS_)
        .forEach((ctor: gs.ICtor<BaseElement>) => {
          this.registrar_.register(ctor);
        });

    this.themeService_.install(theme);
  }

  get injector(): Injector {
    return this.injector_;
  }

  setTheme(theme: Theme): void {
    this.themeService_.install(theme);
  }

  /**
   * Creates a new instance of the app.
   */
  static newInstance(): Main {
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
    let themeService = injector.instantiate<ThemeService>(ThemeService);
    themeService.initialize();
    return new Main(
        injector,
        themeService,
        ElementRegistrar.newInstance(injector, templates));
  }
}
