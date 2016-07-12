import {TestBase} from '../test-base';
TestBase.setup();

import {Log} from '../../external/gs_tools/src/util';
import {Mocks} from '../../external/gs_tools/src/mock';
import {Theme} from './theme';


describe('theming.Theme', () => {
  describe('newInstance', () => {
    it('should create the theme correctly', () => {
      let base = Mocks.object('base');
      let accent = Mocks.object('accent');
      let theme = Theme.newInstance(base, accent);
      expect(theme.base).toEqual(base);
      expect(theme.accent).toEqual(accent);
    });

    it('should warn if the base and accent palettes are the same', () => {
      let palette = Mocks.object('palette');

      spyOn(Log, 'warn');
      Theme.newInstance(palette, palette);

      expect(Log.warn).toHaveBeenCalledWith(
          jasmine.any(Log),
          jasmine.stringMatching(/base and accent palettes/));
    });
  });
});
