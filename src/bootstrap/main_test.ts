import {TestBase} from '../test-base';
TestBase.setup();

import {ElementRegistrar} from '../../external/gs_tools/src/webc';
import {Main} from './main';
import {Mocks} from '../../external/gs_tools/src/mock';
import {ThemeService} from '../theming/theme-service';


describe('bootstrap.Main', () => {
  let main;

  beforeEach(() => {
    main = new Main();
  });

  describe('bootstrap', () => {
    it('should install the given theme', () => {
      let theme = Mocks.object('theme');
      let mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);

      spyOn(ElementRegistrar, 'newInstance').and.returnValue(mockRegistrar);
      spyOn(ThemeService, 'install');
      main.bootstrap(theme);

      expect(ThemeService.install).toHaveBeenCalledWith(theme);
    });
  });
});
