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
  let main;

  beforeEach(() => {
    main = new Main();
  });

  describe('bootstrap', () => {
    it('should set up correctly', () => {
      let templates = Mocks.object('templates');
      spyOn(Templates, 'newInstance').and.returnValue(templates);

      let mockThemeService = jasmine.createSpyObj('ThemeService', ['initialize', 'install']);
      let mockInjector = jasmine.createSpyObj('Injector', ['bindProvider', 'instantiate']);
      mockInjector.instantiate.and.returnValue(mockThemeService);
      spyOn(Injector, 'newInstance').and.returnValue(mockInjector);

      let theme = Mocks.object('theme');
      let mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);

      spyOn(ElementRegistrar, 'newInstance').and.returnValue(mockRegistrar);
      main.bootstrap(theme);

      expect(mockThemeService.install).toHaveBeenCalledWith(theme);
      expect(mockThemeService.initialize).toHaveBeenCalledWith();
      expect(mockInjector.instantiate).toHaveBeenCalledWith(ThemeService);
      expect(mockRegistrar.register).toHaveBeenCalled();
      expect(ElementRegistrar.newInstance).toHaveBeenCalledWith(mockInjector, templates);
      expect(TestInject.getBoundValue('x.dom.document')()).toEqual(document);
      expect(TestInject.getBoundValue('x.gs_tools.templates')()).toEqual(templates);

      expect(Templates.newInstance).toHaveBeenCalledWith(jasmine.any(Map));
    });
  });
});
