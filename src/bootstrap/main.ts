import {Arrays} from 'external/gs_tools/src/collection';
import {BaseDisposable} from 'external/gs_tools/src/dispose';
import {BaseElement, ElementRegistrar} from 'external/gs_tools/src/webc';
import {Injector} from 'external/gs_tools/src/inject';
import {ListenableDom} from 'external/gs_tools/src/event';
import {LocationService} from 'external/gs_tools/src/ui';
import {Reflect} from 'external/gs_tools/src/util';
import {Templates} from 'external/gs_tools/src/webc';

import {BasicButton} from '../button/basic-button';
import {DefaultPalettes} from './default-palettes';
import {HorizontalTab} from '../section/horizontal-tab';
import {Icon} from '../tool/icon';
import {IndefiniteLoading} from '../tool/indefinite-loading';
import {Menu} from '../tool/menu';
import {MenuContainer} from '../tool/menu-container';
import {RadioButton} from '../input/radio-button';
import {TextInput} from '../input/text-input';
import {Theme} from '../theming/theme';
import {ThemeService} from '../theming/theme-service';
import {ViewSlot} from '../tool/view-slot';


const DEFAULT_ELEMENTS_: gs.ICtor<BaseElement>[] = [
  BasicButton,
  HorizontalTab,
  Icon,
  IndefiniteLoading,
  Menu,
  MenuContainer,
  RadioButton,
  TextInput,
  ViewSlot,
];

const DEFAULT_THEME_: Theme = Theme.newInstance(
    DefaultPalettes['vermilion'],
    DefaultPalettes['harlequin']);


/**
 * Main entry class to the app.
 */
export class Main extends BaseDisposable {
  private readonly injector_: Injector;
  private readonly themeService_: ThemeService;
  private readonly registrar_: ElementRegistrar;

  constructor(
      injector: Injector,
      locationService: LocationService,
      themeService: ThemeService,
      registrar: ElementRegistrar) {
    super();
    this.injector_ = injector;
    this.themeService_ = themeService;
    this.registrar_ = registrar;
    this.addDisposable(locationService);
  }

  applyTheme(element: Element): void {
    this.themeService_.applyTheme(element);
  }

  /**
   * Bootstraps the app.
   *
   * @param theme The theme to apply to the app.
   */
  bootstrap(theme: Theme = DEFAULT_THEME_, customElements: gs.ICtor<BaseElement>[] = []): void {
    Arrays
        .of(DEFAULT_ELEMENTS_)
        .addAllArray(customElements)
        .forEach((ctor: gs.ICtor<BaseElement>) => {
          this.registrar_.register(ctor);
        });

    this.themeService_.install(theme);
  }

  get injector(): Injector {
    return this.injector_;
  }

  /**
   * Sets the theme for the app.
   *
   * @param theme The theme to set.
   */
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
    let locationService = Reflect.construct(LocationService, [ListenableDom.of(window)]);

    Injector.bindProvider(() => document, 'x.dom.document');
    Injector.bindProvider(() => window, 'x.dom.window');
    Injector.bindProvider(() => templates, 'x.gs_tools.templates');
    Injector.bindProvider(() => locationService, 'gs.LocationService');

    let injector = Injector.newInstance();
    let themeService = injector.instantiate<ThemeService>(ThemeService);
    themeService.initialize();
    return new Main(
        injector,
        locationService,
        themeService,
        ElementRegistrar.newInstance(injector, templates));
  }
}
