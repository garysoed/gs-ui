import { Arrays } from 'external/gs_tools/src/collection';
import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { ListenableDom } from 'external/gs_tools/src/event';
import { Injector } from 'external/gs_tools/src/inject';
import { LocationService } from 'external/gs_tools/src/ui';
import { Reflect } from 'external/gs_tools/src/util';
import { BaseElement, ElementRegistrar } from 'external/gs_tools/src/webc';
import { Templates } from 'external/gs_tools/src/webc';

import { BasicButton } from '../button/basic-button';
import { CodeInput } from '../input/code-input';
import { FileInput } from '../input/file-input';
import { FloatInput } from '../input/float-input';
import { RadioButton } from '../input/radio-button';
import { TextInput } from '../input/text-input';
import { Breadcrumb } from '../routing/breadcrumb';
import { IRouteFactoryService } from '../routing/i-route-factory-service';
import { Drawer } from '../section/drawer';
import { HorizontalTab } from '../section/horizontal-tab';
import { VerticalTab } from '../section/vertical-tab';
import { DefaultPalettes } from '../theming/default-palettes';
import { Theme } from '../theming/theme';
import { ThemeService } from '../theming/theme-service';
import { Icon } from '../tool/icon';
import { IndefiniteLoading } from '../tool/indefinite-loading';
import { Menu } from '../tool/menu';
import { MenuItem } from '../tool/menu-item';
import { OverlayContainer } from '../tool/overlay-container';
import { ViewSlot } from '../tool/view-slot';


const DEFAULT_ELEMENTS_: gs.ICtor<BaseElement>[] = [
  BasicButton,
  Breadcrumb,
  CodeInput,
  Drawer,
  HorizontalTab,
  Icon,
  IndefiniteLoading,
  FileInput,
  FloatInput,
  Menu,
  OverlayContainer,
  MenuItem,
  RadioButton,
  TextInput,
  VerticalTab,
  ViewSlot,
];

const DEFAULT_THEME_: Theme = Theme.newInstance(
    DefaultPalettes.get('vermilion'),
    DefaultPalettes.get('cerulean'));

// Needed so ThemeService is loaded and bound.
// tslint:disable-next-line:no-unused-variable
const DEPENDENCIES = [ThemeService];

/**
 * Main entry class to the app.
 */
export class Main extends BaseDisposable {
  private readonly injector_: Injector;
  private readonly registrar_: ElementRegistrar;
  private readonly themeService_: ThemeService;

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

  /**
   * Applies the theme to the given element.
   *
   * @param targetEl The element to apply the theme to.
   */
  applyTheme(targetEl: Element | Document): void {
    this.themeService_.applyTheme(targetEl);
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
   * TODO: Make a builder
   */
  static newInstance(config: {
        ace?: AceAjax.Ace,
        routeFactoryServiceCtor?: gs.ICtor<IRouteFactoryService<any>>,
      } = {}): Main {
    const templates = Templates.newInstance();
    const locationService = Reflect.construct(LocationService, [ListenableDom.of(window)]);

    Injector.bindProvider(() => document, 'x.dom.document');
    Injector.bindProvider(() => window, 'x.dom.window');
    Injector.bindProvider(() => templates, 'x.gs_tools.templates');
    if (!!config.routeFactoryServiceCtor) {
      Injector.bind(config.routeFactoryServiceCtor, 'x.gs_ui.routeFactoryService');
    }
    if (!!config.ace) {
      Injector.bindProvider(() => config.ace, 'x.ace');
    }
    Injector.bindProvider(() => locationService, 'gs.LocationService');

    const injector = Injector.newInstance();
    const themeService = injector.getBoundValue('theming.ThemeService') as ThemeService;
    themeService.initialize();
    return new Main(
        injector,
        locationService,
        themeService,
        ElementRegistrar.newInstance(injector, templates));
  }
}
// TODO: Mutable
