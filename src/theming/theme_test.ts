import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from 'external/gs_tools/src/mock';
import {Log} from 'external/gs_tools/src/util';

import {Theme} from './theme';


describe('theming.Theme', () => {
  describe('newInstance', () => {
    it('should create the theme correctly', () => {
      let base = Mocks.object('base');
      let accent = Mocks.object('accent');
      let theme = Theme.newInstance(base, accent);
      assert(theme.base).to.equal(base);
      assert(theme.accent).to.equal(accent);
    });

    it('should warn if the base and accent palettes are the same', () => {
      let palette = Mocks.object('palette');

      spyOn(Log, 'warn');
      Theme.newInstance(palette, palette);

      assert(Log.warn).to.haveBeenCalledWith(
          Matchers.any(Log),
          Matchers.stringMatching(/base and accent palettes/));
    });
  });
});
