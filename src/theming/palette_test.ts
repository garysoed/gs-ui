import {TestBase} from '../test-base';
TestBase.setup();

import {Log} from '../../external/gs_tools/src/util';
import {Palette} from './palette';


describe('theming.Palette', () => {
  describe('newInstance', () => {
    let accent;
    let dark;
    let normal;
    let light;
    let name;

    beforeEach(() => {
      accent = jasmine.createSpyObj('accent', ['getLuminance']);
      dark = jasmine.createSpyObj('dark', ['getLuminance']);
      normal = jasmine.createSpyObj('normal', ['getLuminance']);
      light = jasmine.createSpyObj('light', ['getLuminance']);
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
      dark.getLuminance.and.returnValue(0.1);
      spyOn(Log, 'warn');
      Palette.newInstance(accent, dark, normal, light, name);
      expect(Log.warn).toHaveBeenCalledWith(
          jasmine.any(Log),
          jasmine.stringMatching(/\\"dark\\" color is recommended/));
    });

    it('should warn if the normal color luminance is too high', () => {
      normal.getLuminance.and.returnValue(0.3);
      spyOn(Log, 'warn');
      Palette.newInstance(accent, dark, normal, light, name);
      expect(Log.warn).toHaveBeenCalledWith(
          jasmine.any(Log),
          jasmine.stringMatching(/\\"normal\\" color is recommended/));
    });

    it('should warn if the light color luminance is too low', () => {
      light.getLuminance.and.returnValue(0.4);
      spyOn(Log, 'warn');
      Palette.newInstance(accent, dark, normal, light, name);
      expect(Log.warn).toHaveBeenCalledWith(
          jasmine.any(Log),
          jasmine.stringMatching(/\\"light\\" color is recommended/));
    });
  });
});
