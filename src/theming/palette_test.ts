import {assert, TestBase} from '../test-base';
TestBase.setup();

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
      assert(palette.accent).to.equal(accent);
      assert(palette.dark).to.equal(dark);
      assert(palette.normal).to.equal(normal);
      assert(palette.light).to.equal(light);
    });
  });
});
