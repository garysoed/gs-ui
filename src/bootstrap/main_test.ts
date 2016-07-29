import {TestBase} from '../test-base';
TestBase.setup();

import {ElementRegistrar} from '../../external/gs_tools/src/webc';
import {Injector} from '../../external/gs_tools/src/inject';
import {Main} from './main';
import {Mocks} from '../../external/gs_tools/src/mock';
import {Templates} from '../../external/gs_tools/src/webc';
import {TestInject} from '../../external/gs_tools/src/testing';
import {ThemeService} from '../theming/theme-service';


describe('bootstrap.Main', () => {
  let mockThemeService;
  let mockRegistrar;
  let main;

  beforeEach(() => {
    let injector = Mocks.object('injector');
    mockThemeService = jasmine.createSpyObj('ThemeService', ['install']);
    mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);
    main = new Main(injector, mockThemeService, mockRegistrar);
  });

  describe('bootstrap', () => {
    it('should set up correctly', () => {
      let theme = Mocks.object('theme');
      main.bootstrap(theme);
      expect(mockRegistrar.register).toHaveBeenCalled();
      expect(mockThemeService.install).toHaveBeenCalledWith(theme);
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

      expect(main['injector_']).toEqual(mockInjector);
      expect(main['themeService_']).toEqual(mockThemeService);
      expect(main['registrar']).toEqual(mockRegistrar);

      expect(mockThemeService.initialize).toHaveBeenCalledWith();
      expect(mockInjector.instantiate).toHaveBeenCalledWith(ThemeService);
      expect(ElementRegistrar.newInstance).toHaveBeenCalledWith(mockInjector, templates);
      expect(TestInject.getBoundValue('x.dom.document')()).toEqual(document);
      expect(TestInject.getBoundValue('x.dom.window')()).toEqual(window);
      expect(TestInject.getBoundValue('x.gs_tools.templates')()).toEqual(templates);

      expect(Templates.newInstance).toHaveBeenCalledWith(jasmine.any(Map));
    });
  });
});
