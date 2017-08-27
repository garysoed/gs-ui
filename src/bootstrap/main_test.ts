import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Injector } from 'external/gs_tools/src/inject';
import { Mocks } from 'external/gs_tools/src/mock';
import { Persona } from 'external/gs_tools/src/persona';
import { TestDispose, TestInject } from 'external/gs_tools/src/testing';
import { ElementRegistrar } from 'external/gs_tools/src/webc';
import { Templates } from 'external/gs_tools/src/webc';

import { Main } from './main';


describe('bootstrap.Main', () => {
  let mockThemeService: any;
  let mockRegistrar: any;
  let main: Main;

  beforeEach(() => {
    const injector = Mocks.object('injector');
    mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme', 'install']);
    mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);
    main = new Main(injector, mockThemeService, mockRegistrar);
    TestDispose.add(main);
  });

  describe('applyTheme', () => {
    it('should apply the theme correctly', () => {
      const targetEl = Mocks.object('targetEl');
      main.applyTheme(targetEl);
      assert(mockThemeService.applyTheme).to.haveBeenCalledWith(targetEl);
    });
  });

  describe('bootstrap', () => {
    it('should set up correctly', () => {
      const customElement1 = Mocks.object('customElement1');
      const customElement2 = Mocks.object('customElement2');
      const theme = Mocks.object('theme');
      main.bootstrap(theme, [customElement1, customElement2]);
      assert(mockRegistrar.register).to.haveBeenCalledWith(customElement1);
      assert(mockRegistrar.register).to.haveBeenCalledWith(customElement2);
      assert(mockThemeService.install).to.haveBeenCalledWith(theme);
    });
  });

  describe('newInstance', () => {
    it('should set up correctly', () => {
      const ace = Mocks.object('ace');
      const routeFactoryServiceCtor = Mocks.object('routeFactoryServiceCtor');
      const templates = Mocks.object('templates');
      spyOn(Templates, 'newInstance').and.returnValue(templates);

      const mockThemeService = jasmine.createSpyObj('ThemeService', ['initialize', 'install']);
      const mockInjector = jasmine.createSpyObj('Injector', ['bindProvider', 'getBoundValue']);
      mockInjector.getBoundValue.and.returnValue(mockThemeService);
      spyOn(Injector, 'newInstance').and.returnValue(mockInjector);

      const mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);

      spyOn(ElementRegistrar, 'newInstance').and.returnValue(mockRegistrar);
      spyOn(Persona, 'registerAll');

      const main = Main.newInstance({
        ace: ace,
        routeFactoryServiceCtor: routeFactoryServiceCtor,
      });
      TestDispose.add(main);

      assert(main['injector_']).to.equal(mockInjector);
      assert(main['themeService_']).to.equal(mockThemeService);
      assert(main['registrar_']).to.equal(mockRegistrar);

      assert(mockThemeService.initialize).to.haveBeenCalledWith();
      assert(mockInjector.getBoundValue).to.haveBeenCalledWith('theming.ThemeService');
      assert(ElementRegistrar.newInstance).to.haveBeenCalledWith(mockInjector, templates);
      assert(TestInject.getBoundValue('x.dom.document')()).to.equal(document);
      assert(TestInject.getBoundValue('x.dom.window')()).to.equal(window);
      assert(TestInject.getBoundValue('x.gs_tools.templates')()).to.equal(templates);
      assert(TestInject.getBoundValue('x.gs_ui.routeFactoryService'))
          .to.equal(routeFactoryServiceCtor);
      assert(TestInject.getBoundValue('x.ace')()).to.equal(ace);

      assert(Templates.newInstance).to.haveBeenCalledWith();
      assert(Persona.registerAll).to.haveBeenCalledWith(mockInjector, templates);
    });

    it('should not throw error if config is empty', () => {
      const mockThemeService = jasmine.createSpyObj('ThemeService', ['initialize', 'install']);
      const mockInjector = jasmine.createSpyObj('Injector', ['bindProvider', 'getBoundValue']);
      mockInjector.getBoundValue.and.returnValue(mockThemeService);

      spyOn(Injector, 'newInstance').and.returnValue(mockInjector);
      spyOn(Persona, 'registerAll');

      const mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);

      spyOn(ElementRegistrar, 'newInstance').and.returnValue(mockRegistrar);

      assert(() => {
        TestDispose.add(Main.newInstance({}));
      }).toNot.throw();
    });

  });
});
