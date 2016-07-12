import {TestBase} from '../test-base';
TestBase.setup();

import {Log} from '../../external/gs_tools/src/util';
import {Mocks} from '../../external/gs_tools/src/mock';
import {Palette} from './palette';


describe('theming.Palette', () => {
  describe('newInstance', () => {
    let accent;
    let dark;
    let normal;
    let light;
    let name;

    beforeEach(() => {
      accent = Mocks.object('accent');
      dark = Mocks.object('dark');
      normal = Mocks.object('normal');
      light = Mocks.object('light');
      name = 'name';
    });

    it('should create the palette correctly', () => {
      let palette = Palette.newInstance(accent, dark, normal, light, name);
      expect(palette.accent).toEqual(accent);
      expect(palette.dark).toEqual(dark);
      expect(palette.normal).toEqual(normal);
      expect(palette.light).toEqual(light);
    });

    it('should warn if the dark color luminance is too high', () => {
      dark.luminance = 0.1;
      spyOn(Log, 'warn');
      Palette.newInstance(accent, dark, normal, light, name);
      expect(Log.warn).toHaveBeenCalledWith(
          jasmine.any(Log),
          jasmine.stringMatching(/\\"dark\\" color is recommended/));
    });

    it('should warn if the normal color luminance is too high', () => {
      normal.luminance = 0.3;
      spyOn(Log, 'warn');
      Palette.newInstance(accent, dark, normal, light, name);
      expect(Log.warn).toHaveBeenCalledWith(
          jasmine.any(Log),
          jasmine.stringMatching(/\\"normal\\" color is recommended/));
    });

    it('should warn if the light color luminance is too low', () => {
      light.luminance = 0.4;
      spyOn(Log, 'warn');
      Palette.newInstance(accent, dark, normal, light, name);
      expect(Log.warn).toHaveBeenCalledWith(
          jasmine.any(Log),
          jasmine.stringMatching(/\\"light\\" color is recommended/));
    });
  });
});
