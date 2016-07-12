import {TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from '../../external/gs_tools/src/mock';
import {Templates} from '../../external/gs_tools/src/webc';
import {ThemeService} from './theme-service';


describe('theming.ThemeService', () => {
  describe('install', () => {
    it('should append the correct template to the header element', () => {
      let mainCssTemplate = 'rgba(11,11,11-rgba(22,22,22-rgba(33,33,33-rgba(44,44,44';
      spyOn(Templates, 'getTemplate').and.returnValue(mainCssTemplate);

      let theme = Mocks.object('theme');
      theme['base'] = {
        'dark': {
          'red': 1,
          'green': 2,
          'blue': 3,
        },
        'light': {
          'red': 4,
          'green': 5,
          'blue': 6,
        },
        'normal': {
          'red': 7,
          'green': 8,
          'blue': 9,
        },
      };
      theme['accent'] = {
        'accent': {
          'red': 10,
          'green': 11,
          'blue': 12,
        },
      };

      let headEl = Mocks.object('headEl');
      headEl.innerHTML = 'existingInnerHTML';
      spyOn(document, 'querySelector').and.returnValue(headEl);

      ThemeService.install(theme);

      expect(headEl.innerHTML)
          .toEqual('existingInnerHTMLrgba(1,2,3-rgba(7,8,9-rgba(4,5,6-rgba(10,11,12');
      expect(document.querySelector).toHaveBeenCalledWith('head');
      expect(Templates.getTemplate).toHaveBeenCalledWith('src/theming/theme-style');
    });

    it('should throw error if the theme-style template cannot be found', () => {
      spyOn(Templates, 'getTemplate').and.returnValue(null);

      expect(() => {
        ThemeService.install(Mocks.object('theme'));
      }).toThrowError(/not found/);
    });
  });
});
