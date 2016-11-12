import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {ElementRegistrar} from 'external/gs_tools/src/webc';
import {Injector} from 'external/gs_tools/src/inject';
import {Mocks} from 'external/gs_tools/src/mock';
import {Templates} from 'external/gs_tools/src/webc';
import {TestDispose, TestInject} from 'external/gs_tools/src/testing';

import {Main} from './main';
import {ThemeService} from '../theming/theme-service';


describe('bootstrap.Main', () => {
  let mockThemeService;
  let mockRegistrar;
  let main;

  beforeEach(() => {
    let injector = Mocks.object('injector');
    let locationService = Mocks.disposable('LocationService');
    mockThemeService = jasmine.createSpyObj('ThemeService', ['install']);
    mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);
    main = new Main(injector, locationService, mockThemeService, mockRegistrar);
    TestDispose.add(main);
  });

  describe('bootstrap', () => {
    it('should set up correctly', () => {
      let theme = Mocks.object('theme');
      main.bootstrap(theme);
      assert(mockRegistrar.register).to.haveBeenCalled();
      assert(mockThemeService.install).to.haveBeenCalledWith(theme);
    });
  });

  describe('newInstance', () => {
    it('should set up correctly', () => {
      let templates = Mocks.object('templates');
      spyOn(Templates, 'newInstance').and.returnValue(templates);

      let mockThemeService = jasmine.createSpyObj('ThemeService', ['initialize', 'install']);
      let mockInjector = jasmine.createSpyObj('Injector', ['bindProvider', 'instantiate']);
      mockInjector.instantiate.and.returnValue(mockThemeService);
      spyOn(Injector, 'newInstance').and.returnValue(mockInjector);

      let mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);

      spyOn(ElementRegistrar, 'newInstance').and.returnValue(mockRegistrar);

      let main = Main.newInstance();
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

      assert(Templates.newInstance).to.haveBeenCalledWith(Matchers.any(Map));
    });
  });
});
