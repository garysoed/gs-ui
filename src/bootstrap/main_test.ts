import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {Injector} from 'external/gs_tools/src/inject';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose, TestInject} from 'external/gs_tools/src/testing';
import {ElementRegistrar} from 'external/gs_tools/src/webc';
import {Templates} from 'external/gs_tools/src/webc';

import {ThemeService} from '../theming/theme-service';

import {Main} from './main';


describe('bootstrap.Main', () => {
  let mockThemeService;
  let mockRegistrar;
  let main;

  beforeEach(() => {
    let injector = Mocks.object('injector');
    let locationService = Mocks.disposable('LocationService');
    mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme', 'install']);
    mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);
    main = new Main(injector, locationService, mockThemeService, mockRegistrar);
    TestDispose.add(main);
  });

  describe('applyTheme', () => {
    it('should apply the theme correctly', () => {
      let targetEl = Mocks.object('targetEl');
      main.applyTheme(targetEl);
      assert(mockThemeService.applyTheme).to.haveBeenCalledWith(targetEl);
    });
  });

  describe('bootstrap', () => {
    it('should set up correctly', () => {
      let customElement1 = Mocks.object('customElement1');
      let customElement2 = Mocks.object('customElement2');
      let theme = Mocks.object('theme');
      main.bootstrap(theme, [customElement1, customElement2]);
      assert(mockRegistrar.register).to.haveBeenCalledWith(customElement1);
      assert(mockRegistrar.register).to.haveBeenCalledWith(customElement2);
      assert(mockThemeService.install).to.haveBeenCalledWith(theme);
    });
  });

  describe('newInstance', () => {
    it('should set up correctly', () => {
      let ace = Mocks.object('ace');
      let routeFactoryServiceCtor = Mocks.object('routeFactoryServiceCtor');
      let templates = Mocks.object('templates');
      spyOn(Templates, 'newInstance').and.returnValue(templates);

      let mockThemeService = jasmine.createSpyObj('ThemeService', ['initialize', 'install']);
      let mockInjector = jasmine.createSpyObj('Injector', ['bindProvider', 'instantiate']);
      mockInjector.instantiate.and.returnValue(mockThemeService);
      spyOn(Injector, 'newInstance').and.returnValue(mockInjector);

      let mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);

      spyOn(ElementRegistrar, 'newInstance').and.returnValue(mockRegistrar);

      let main = Main.newInstance({
        ace: ace,
        routeFactoryServiceCtor: routeFactoryServiceCtor,
      });
      TestDispose.add(main);

      assert(main['injector_']).to.equal(mockInjector);
      assert(main['themeService_']).to.equal(mockThemeService);
      assert(main['registrar_']).to.equal(mockRegistrar);

      assert(mockThemeService.initialize).to.haveBeenCalledWith();
      assert(mockInjector.instantiate).to.haveBeenCalledWith(ThemeService);
      assert(ElementRegistrar.newInstance).to.haveBeenCalledWith(mockInjector, templates);
      assert(TestInject.getBoundValue('x.dom.document')()).to.equal(document);
      assert(TestInject.getBoundValue('x.dom.window')()).to.equal(window);
      assert(TestInject.getBoundValue('x.gs_tools.templates')()).to.equal(templates);
      assert(TestInject.getBoundValue('x.gs_ui.routeFactoryService'))
          .to.equal(routeFactoryServiceCtor);
      assert(TestInject.getBoundValue('x.ace')()).to.equal(ace);

      assert(Templates.newInstance).to.haveBeenCalledWith(Matchers.any(Map));
    });

    it('should not throw error if config is empty', () => {
      let mockThemeService = jasmine.createSpyObj('ThemeService', ['initialize', 'install']);
      let mockInjector = jasmine.createSpyObj('Injector', ['bindProvider', 'instantiate']);
      mockInjector.instantiate.and.returnValue(mockThemeService);
      spyOn(Injector, 'newInstance').and.returnValue(mockInjector);

      let mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);

      spyOn(ElementRegistrar, 'newInstance').and.returnValue(mockRegistrar);

      assert(() => {
        TestDispose.add(Main.newInstance({}));
      }).toNot.throw();
    });

  });
});
