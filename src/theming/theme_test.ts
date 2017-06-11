import { assert, assertColor, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { Log } from 'external/gs_tools/src/util';

import { Colors, HslColor } from 'external/gs_tools/src/color';
import { Solve, Spec } from 'external/gs_tools/src/solver';
import { BLACK, Theme, WHITE } from '../theming/theme';


describe('theming.Theme', () => {
  const ACTION_DISTANCE = 0.2;
  const BASE_DISTANCE = 0.1;
  const CONTRAST = 12;
  let accent: any;
  let base: any;
  let theme: Theme;

  beforeEach(() => {
    accent = Mocks.object('accent');
    base = Mocks.object('base');
    theme = new Theme(
        base,
        accent,
        BASE_DISTANCE,
        ACTION_DISTANCE,
        CONTRAST);
  });

  describe('createShade_', () => {
    it('should create the shade correctly in normal mode', () => {
      const hue = 123;
      const baseColor = HslColor.newInstance(hue, 0.5, 0.5);
      const shade = Theme['createShade_'](baseColor, 0.25, false);
      assertColor(shade).to.haveHsl(hue, 0.375, 0.25);
    });

    it('should create the shade correctly in reversed mode', () => {
      const hue = 123;
      const baseColor = HslColor.newInstance(hue, 0.5, 0.5);
      const shade = Theme['createShade_'](baseColor, 0.25, true);
      assertColor(shade).to.haveHsl(hue, 0.125, 0.25);
    });

    it('should cap negative value to 0', () => {
      const hue = 123;
      const baseColor = HslColor.newInstance(hue, 0.5, 0.5);
      const shade = Theme['createShade_'](baseColor, -0.5, false);
      assertColor(shade).to.haveHsl(hue, 0.5, 0);
    });

    it('should cap values > 1 to 1', () => {
      const hue = 123;
      const baseColor = HslColor.newInstance(hue, 0.5, 0.5);
      const shade = Theme['createShade_'](baseColor, 3, false);
      assertColor(shade).to.haveHsl(hue, 0, 1);
    });
  });

  describe('isHighContrastAction_', () => {
    it('should return true if passes all the checks', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const actionNormalDark = Mocks.object('actionNormalDark');
      const actionNormalDarkest = Mocks.object('actionNormalDarkest');
      const actionNormalLight = Mocks.object('actionNormalLight');
      const actionReversedDark = Mocks.object('actionReversedDark');
      const actionReversedLight = Mocks.object('actionReversedLight');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(actionNormalDark)
          .when(Matchers.anyThing(), 0, false).return(actionNormalDarkest)
          .when(Matchers.anyThing(), 0.75, false).return(actionNormalLight)
          .when(Matchers.anyThing(), 0.25, true).return(actionReversedDark)
          .when(Matchers.anyThing(), 0.75, true).return(actionReversedLight);

      const accentColor = Mocks.object('accentColor');
      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(actionNormalDark, WHITE).return(12)
          .when(BLACK, actionNormalLight).return(13)
          .when(actionReversedLight, baseNormalDark).return(14)
          .when(WHITE, actionReversedDark).return(15)
          .when(actionReversedLight, BLACK).return(16)
          .when(actionNormalDarkest, baseReversedLight).return(17);

      const passes = Theme['isHighContrastAction_'](
          0.25,
          12,
          accentColor,
          baseNormalDark,
          baseReversedLight);
      assert(passes).to.beTrue();
      assert(Colors.getContrast).to.haveBeenCalledWith(actionNormalDark, WHITE);
      assert(Colors.getContrast).to.haveBeenCalledWith(BLACK, actionNormalLight);
      assert(Colors.getContrast).to.haveBeenCalledWith(actionReversedLight, baseNormalDark);
      assert(Colors.getContrast).to.haveBeenCalledWith(WHITE, actionReversedDark);
      assert(Colors.getContrast).to.haveBeenCalledWith(actionReversedLight, BLACK);
      assert(Colors.getContrast).to.haveBeenCalledWith(actionNormalDarkest, baseReversedLight);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accentColor, 0.25, false);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accentColor, 0, false);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accentColor, 0.75, false);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accentColor, 0.25, true);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accentColor, 0.75, true);
    });

    it('should return false if actionNormalDarkest on baseReversedLight is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const actionNormalDark = Mocks.object('actionNormalDark');
      const actionNormalDarkest = Mocks.object('actionNormalDarkest');
      const actionNormalLight = Mocks.object('actionNormalLight');
      const actionReversedDark = Mocks.object('actionReversedDark');
      const actionReversedLight = Mocks.object('actionReversedLight');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(actionNormalDark)
          .when(Matchers.anyThing(), 0, false).return(actionNormalDarkest)
          .when(Matchers.anyThing(), 0.75, false).return(actionNormalLight)
          .when(Matchers.anyThing(), 0.25, true).return(actionReversedDark)
          .when(Matchers.anyThing(), 0.75, true).return(actionReversedLight);

      const accentColor = Mocks.object('accentColor');
      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(actionNormalDark, WHITE).return(12)
          .when(BLACK, actionNormalLight).return(13)
          .when(actionReversedLight, baseNormalDark).return(14)
          .when(WHITE, actionReversedDark).return(15)
          .when(actionReversedLight, BLACK).return(16)
          .when(actionNormalDarkest, baseReversedLight).return(10);

      const passes = Theme['isHighContrastAction_'](
          0.25,
          12,
          accentColor,
          baseNormalDark,
          baseReversedLight);
      assert(passes).to.beFalse();
    });

    it('should return false if actionReversedLight on black is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const actionNormalDark = Mocks.object('actionNormalDark');
      const actionNormalDarkest = Mocks.object('actionNormalDarkest');
      const actionNormalLight = Mocks.object('actionNormalLight');
      const actionReversedDark = Mocks.object('actionReversedDark');
      const actionReversedLight = Mocks.object('actionReversedLight');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(actionNormalDark)
          .when(Matchers.anyThing(), 0, false).return(actionNormalDarkest)
          .when(Matchers.anyThing(), 0.75, false).return(actionNormalLight)
          .when(Matchers.anyThing(), 0.25, true).return(actionReversedDark)
          .when(Matchers.anyThing(), 0.75, true).return(actionReversedLight);

      const accentColor = Mocks.object('accentColor');
      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(actionNormalDark, WHITE).return(12)
          .when(BLACK, actionNormalLight).return(13)
          .when(actionReversedLight, baseNormalDark).return(14)
          .when(WHITE, actionReversedDark).return(15)
          .when(actionReversedLight, BLACK).return(10)
          .when(actionNormalDarkest, baseReversedLight).return(17);

      const passes = Theme['isHighContrastAction_'](
          0.25,
          12,
          accentColor,
          baseNormalDark,
          baseReversedLight);
      assert(passes).to.beFalse();
    });

    it('should return false if white on actionReversedDark is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const actionNormalDark = Mocks.object('actionNormalDark');
      const actionNormalDarkest = Mocks.object('actionNormalDarkest');
      const actionNormalLight = Mocks.object('actionNormalLight');
      const actionReversedDark = Mocks.object('actionReversedDark');
      const actionReversedLight = Mocks.object('actionReversedLight');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(actionNormalDark)
          .when(Matchers.anyThing(), 0, false).return(actionNormalDarkest)
          .when(Matchers.anyThing(), 0.75, false).return(actionNormalLight)
          .when(Matchers.anyThing(), 0.25, true).return(actionReversedDark)
          .when(Matchers.anyThing(), 0.75, true).return(actionReversedLight);

      const accentColor = Mocks.object('accentColor');
      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(actionNormalDark, WHITE).return(12)
          .when(BLACK, actionNormalLight).return(13)
          .when(actionReversedLight, baseNormalDark).return(14)
          .when(WHITE, actionReversedDark).return(10)
          .when(actionReversedLight, BLACK).return(16)
          .when(actionNormalDarkest, baseReversedLight).return(17);

      const passes = Theme['isHighContrastAction_'](
          0.25,
          12,
          accentColor,
          baseNormalDark,
          baseReversedLight);
      assert(passes).to.beFalse();
    });

    it('should return false if actionReversedLight on baseNormalDark is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const actionNormalDark = Mocks.object('actionNormalDark');
      const actionNormalDarkest = Mocks.object('actionNormalDarkest');
      const actionNormalLight = Mocks.object('actionNormalLight');
      const actionReversedDark = Mocks.object('actionReversedDark');
      const actionReversedLight = Mocks.object('actionReversedLight');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(actionNormalDark)
          .when(Matchers.anyThing(), 0, false).return(actionNormalDarkest)
          .when(Matchers.anyThing(), 0.75, false).return(actionNormalLight)
          .when(Matchers.anyThing(), 0.25, true).return(actionReversedDark)
          .when(Matchers.anyThing(), 0.75, true).return(actionReversedLight);

      const accentColor = Mocks.object('accentColor');
      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(actionNormalDark, WHITE).return(12)
          .when(BLACK, actionNormalLight).return(13)
          .when(actionReversedLight, baseNormalDark).return(10)
          .when(WHITE, actionReversedDark).return(15)
          .when(actionReversedLight, BLACK).return(16)
          .when(actionNormalDarkest, baseReversedLight).return(17);

      const passes = Theme['isHighContrastAction_'](
          0.25,
          12,
          accentColor,
          baseNormalDark,
          baseReversedLight);
      assert(passes).to.beFalse();
    });

    it('should return false if black on actionNormalLight is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const actionNormalDark = Mocks.object('actionNormalDark');
      const actionNormalDarkest = Mocks.object('actionNormalDarkest');
      const actionNormalLight = Mocks.object('actionNormalLight');
      const actionReversedDark = Mocks.object('actionReversedDark');
      const actionReversedLight = Mocks.object('actionReversedLight');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(actionNormalDark)
          .when(Matchers.anyThing(), 0, false).return(actionNormalDarkest)
          .when(Matchers.anyThing(), 0.75, false).return(actionNormalLight)
          .when(Matchers.anyThing(), 0.25, true).return(actionReversedDark)
          .when(Matchers.anyThing(), 0.75, true).return(actionReversedLight);

      const accentColor = Mocks.object('accentColor');
      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(actionNormalDark, WHITE).return(12)
          .when(BLACK, actionNormalLight).return(10)
          .when(actionReversedLight, baseNormalDark).return(14)
          .when(WHITE, actionReversedDark).return(15)
          .when(actionReversedLight, BLACK).return(16)
          .when(actionNormalDarkest, baseReversedLight).return(17);

      const passes = Theme['isHighContrastAction_'](
          0.25,
          12,
          accentColor,
          baseNormalDark,
          baseReversedLight);
      assert(passes).to.beFalse();
    });

    it('should return false if actionNormalDark on white is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const actionNormalDark = Mocks.object('actionNormalDark');
      const actionNormalDarkest = Mocks.object('actionNormalDarkest');
      const actionNormalLight = Mocks.object('actionNormalLight');
      const actionReversedDark = Mocks.object('actionReversedDark');
      const actionReversedLight = Mocks.object('actionReversedLight');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(actionNormalDark)
          .when(Matchers.anyThing(), 0, false).return(actionNormalDarkest)
          .when(Matchers.anyThing(), 0.75, false).return(actionNormalLight)
          .when(Matchers.anyThing(), 0.25, true).return(actionReversedDark)
          .when(Matchers.anyThing(), 0.75, true).return(actionReversedLight);

      const accentColor = Mocks.object('accentColor');
      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(actionNormalDark, WHITE).return(10)
          .when(BLACK, actionNormalLight).return(13)
          .when(actionReversedLight, baseNormalDark).return(14)
          .when(WHITE, actionReversedDark).return(15)
          .when(actionReversedLight, BLACK).return(16)
          .when(actionNormalDarkest, baseReversedLight).return(17);

      const passes = Theme['isHighContrastAction_'](
          0.25,
          12,
          accentColor,
          baseNormalDark,
          baseReversedLight);
      assert(passes).to.beFalse();
    });
  });

  describe('isHighContrastBase_', () => {
    it('should return true if passes all the checks', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(12)
          .when(BLACK, baseNormalLightest).return(13)
          .when(baseReversedLightest, baseNormalDark).return(14)
          .when(WHITE, baseNormalDark).return(12)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(16)
          .when(WHITE, baseReversedDarkest).return(17)
          .when(baseNormalDarkest, baseReversedLight).return(18)
          .when(BLACK, baseReversedLight).return(19)
          .when(baseNormalDarkest, baseReversedLightest).return(20);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beTrue();
      assert(Colors.getContrast).to.haveBeenCalledWith(baseNormalDarkest, WHITE);
      assert(Colors.getContrast).to.haveBeenCalledWith(BLACK, baseNormalLightest);
      assert(Colors.getContrast).to.haveBeenCalledWith(baseReversedLightest, baseNormalDark);
      assert(Colors.getContrast).to.haveBeenCalledWith(WHITE, baseNormalDark);
      assert(Colors.getContrast).to.haveBeenCalledWith(baseReversedLightest, baseReversedDarkest);
      assert(Colors.getContrast).to.haveBeenCalledWith(baseReversedLightest, BLACK);
      assert(Colors.getContrast).to.haveBeenCalledWith(WHITE, baseReversedDarkest);
      assert(Colors.getContrast).to.haveBeenCalledWith(baseNormalDarkest, baseReversedLight);
      assert(Colors.getContrast).to.haveBeenCalledWith(BLACK, baseReversedLight);
      assert(Colors.getContrast).to.haveBeenCalledWith(baseNormalDarkest, baseReversedLightest);
      assert(Theme['createShade_']).to.haveBeenCalledWith(baseColor, 0.25, false);
      assert(Theme['createShade_']).to.haveBeenCalledWith(baseColor, 0, false);
      assert(Theme['createShade_']).to.haveBeenCalledWith(baseColor, 1, false);
      assert(Theme['createShade_']).to.haveBeenCalledWith(baseColor, 0, true);
      assert(Theme['createShade_']).to.haveBeenCalledWith(baseColor, 0.75, true);
      assert(Theme['createShade_']).to.haveBeenCalledWith(baseColor, 1, true);
    });

    it('should return false if baseNormalDarkest on WHITE is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(10)
          .when(BLACK, baseNormalLightest).return(13)
          .when(baseReversedLightest, baseNormalDark).return(14)
          .when(WHITE, baseNormalDark).return(12)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(16)
          .when(WHITE, baseReversedDarkest).return(17)
          .when(baseNormalDarkest, baseReversedLight).return(18)
          .when(BLACK, baseReversedLight).return(19)
          .when(baseNormalDarkest, baseReversedLightest).return(20);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
    });

    it('should return false if BLACK on baseNormalLightest is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(12)
          .when(BLACK, baseNormalLightest).return(10)
          .when(baseReversedLightest, baseNormalDark).return(14)
          .when(WHITE, baseNormalDark).return(12)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(16)
          .when(WHITE, baseReversedDarkest).return(17)
          .when(baseNormalDarkest, baseReversedLight).return(18)
          .when(BLACK, baseReversedLight).return(19)
          .when(baseNormalDarkest, baseReversedLightest).return(20);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
    });

    it('should return false if baseReversedLightest on baseNormalDark is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(12)
          .when(BLACK, baseNormalLightest).return(13)
          .when(baseReversedLightest, baseNormalDark).return(10)
          .when(WHITE, baseNormalDark).return(12)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(16)
          .when(WHITE, baseReversedDarkest).return(17)
          .when(baseNormalDarkest, baseReversedLight).return(1)
          .when(BLACK, baseReversedLight).return(19)
          .when(baseNormalDarkest, baseReversedLightest).return(20);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
    });

    it('should return false if WHITE on baseNormalDark is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(12)
          .when(BLACK, baseNormalLightest).return(13)
          .when(baseReversedLightest, baseNormalDark).return(14)
          .when(WHITE, baseNormalDark).return(10)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(16)
          .when(WHITE, baseReversedDarkest).return(17)
          .when(baseNormalDarkest, baseReversedLight).return(18)
          .when(BLACK, baseReversedLight).return(19)
          .when(baseNormalDarkest, baseReversedLightest).return(20);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
    });

    it('should return false if baseReversedLightest on baseReversedDarkest is low contrast',
        () => {
          const baseNormalDark = Mocks.object('baseNormalDark');
          const baseNormalDarkest = Mocks.object('baseNormalDarkest');
          const baseNormalLightest = Mocks.object('baseNormalLightest');
          const baseReversedDarkest = Mocks.object('baseReversedDarkest');
          const baseReversedLight = Mocks.object('baseReversedLight');
          const baseReversedLightest = Mocks.object('baseReversedLightest');
          Fakes.build(spyOn(Theme, 'createShade_'))
              .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
              .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
              .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
              .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
              .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
              .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

          const baseColor = Mocks.object('baseColor');

          Fakes.build(spyOn(Colors, 'getContrast'))
              .when(baseNormalDark, WHITE).return(12)
              .when(BLACK, baseNormalLightest).return(13)
              .when(baseReversedLightest, baseNormalDark).return(14)
              .when(WHITE, baseNormalDark).return(12)
              .when(baseReversedLightest, baseReversedDarkest).return(10)
              .when(baseReversedLightest, BLACK).return(16)
              .when(WHITE, baseReversedDarkest).return(17)
              .when(baseNormalDarkest, baseReversedLight).return(18)
              .when(BLACK, baseReversedLight).return(19)
              .when(baseNormalDarkest, baseReversedLightest).return(20);

          assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
        });

    it('should return false if baseReversedLightest on BLACK is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(12)
          .when(BLACK, baseNormalLightest).return(13)
          .when(baseReversedLightest, baseNormalDark).return(14)
          .when(WHITE, baseNormalDark).return(12)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(10)
          .when(WHITE, baseReversedDarkest).return(17)
          .when(baseNormalDarkest, baseReversedLight).return(18)
          .when(BLACK, baseReversedLight).return(19)
          .when(baseNormalDarkest, baseReversedLightest).return(20);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
    });

    it('should return false if WHITE on baseReversedDarkest is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(12)
          .when(BLACK, baseNormalLightest).return(13)
          .when(baseReversedLightest, baseNormalDark).return(14)
          .when(WHITE, baseNormalDark).return(12)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(16)
          .when(WHITE, baseReversedDarkest).return(10)
          .when(baseNormalDarkest, baseReversedLight).return(18)
          .when(BLACK, baseReversedLight).return(19)
          .when(baseNormalDarkest, baseReversedLightest).return(20);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
    });

    it('should return false if baseNormalDarkest on baseReversedLight is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(12)
          .when(BLACK, baseNormalLightest).return(13)
          .when(baseReversedLightest, baseNormalDark).return(14)
          .when(WHITE, baseNormalDark).return(12)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(16)
          .when(WHITE, baseReversedDarkest).return(17)
          .when(baseNormalDarkest, baseReversedLight).return(10)
          .when(BLACK, baseReversedLight).return(19)
          .when(baseNormalDarkest, baseReversedLightest).return(20);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
    });

    it('should return false if BLACK on baseReversedLight is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(12)
          .when(BLACK, baseNormalLightest).return(13)
          .when(baseReversedLightest, baseNormalDark).return(14)
          .when(WHITE, baseNormalDark).return(12)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(16)
          .when(WHITE, baseReversedDarkest).return(17)
          .when(baseNormalDarkest, baseReversedLight).return(18)
          .when(BLACK, baseReversedLight).return(10)
          .when(baseNormalDarkest, baseReversedLightest).return(20);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
    });

    it('should return false if baseNormalDarkest on baseReversedLightest is low contrast', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseNormalDarkest = Mocks.object('baseNormalDarkest');
      const baseNormalLightest = Mocks.object('baseNormalLightest');
      const baseReversedDarkest = Mocks.object('baseReversedDarkest');
      const baseReversedLight = Mocks.object('baseReversedLight');
      const baseReversedLightest = Mocks.object('baseReversedLightest');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(Matchers.anyThing(), 0.25, false).return(baseNormalDark)
          .when(Matchers.anyThing(), 0, false).return(baseNormalDarkest)
          .when(Matchers.anyThing(), 1, false).return(baseNormalLightest)
          .when(Matchers.anyThing(), 0, true).return(baseReversedDarkest)
          .when(Matchers.anyThing(), 0.75, true).return(baseReversedLight)
          .when(Matchers.anyThing(), 1, true).return(baseReversedLightest);

      const baseColor = Mocks.object('baseColor');

      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(baseNormalDark, WHITE).return(12)
          .when(BLACK, baseNormalLightest).return(13)
          .when(baseReversedLightest, baseNormalDark).return(14)
          .when(WHITE, baseNormalDark).return(12)
          .when(baseReversedLightest, baseReversedDarkest).return(15)
          .when(baseReversedLightest, BLACK).return(16)
          .when(WHITE, baseReversedDarkest).return(17)
          .when(baseNormalDarkest, baseReversedLight).return(18)
          .when(BLACK, baseReversedLight).return(19)
          .when(baseNormalDarkest, baseReversedLightest).return(10);

      assert(Theme['isHighContrastBase_'](0.25, 12, baseColor)).to.beFalse();
    });
  });

  describe('isHighContrastForegroundAlpha_', () => {
    it('should return true if the contrast is high enough', () => {
      const foreground = Mocks.object('foreground');
      const background = Mocks.object('background');
      const alpha = 0.12;
      const mixColor = Mocks.object('mixColor');
      spyOn(Colors, 'mix').and.returnValue(mixColor);
      spyOn(Colors, 'getContrast').and.returnValue(14);

      assert(Theme['isHighContrastForegroundAlpha_'](foreground, background, alpha, 12))
          .to.beTrue();
      assert(Colors.getContrast).to.haveBeenCalledWith(mixColor, background);
      assert(Colors.mix).to.haveBeenCalledWith(foreground, background, alpha);
    });

    it('should return false if the contrast is too low', () => {
      const foreground = Mocks.object('foreground');
      const background = Mocks.object('background');
      const alpha = 0.12;
      const mixColor = Mocks.object('mixColor');
      spyOn(Colors, 'mix').and.returnValue(mixColor);
      spyOn(Colors, 'getContrast').and.returnValue(10);

      assert(Theme['isHighContrastForegroundAlpha_'](foreground, background, alpha, 12))
          .to.beFalse();
      assert(Colors.getContrast).to.haveBeenCalledWith(mixColor, background);
      assert(Colors.mix).to.haveBeenCalledWith(foreground, background, alpha);
    });
  });

  describe('getAction', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getAction()).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accent, 0.5, true);
    });
  });

  describe('getActionDark', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getActionDark(true)).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accent, 0.3, true);
    });
  });

  describe('getActionDarkest', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      const createShadeSpy = spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getActionDarkest(true)).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accent, Matchers.anyThing(), true);
      assert(createShadeSpy.calls.argsFor(0)[1] as number).to.beCloseTo(0.1, 0.01);
    });
  });

  describe('getActionLight', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getActionLight(true)).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accent, 0.7, true);
    });
  });

  describe('getActionLightest', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getActionLightest(true)).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(accent, 0.9, true);
    });
  });

  describe('getBase', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getBase()).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(base, 0.5, true);
    });
  });

  describe('getBaseDark', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getBaseDark(true)).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(base, 0.4, true);
    });
  });

  describe('getBaseDarkest', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getBaseDarkest(true)).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(base, 0.3, true);
    });
  });

  describe('getBaseLight', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getBaseLight(true)).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(base, 0.6, true);
    });
  });

  describe('getBaseLightest', () => {
    it('should return the correct shade', () => {
      const shade = Mocks.object('shade');
      spyOn(Theme, 'createShade_').and.returnValue(shade);
      assert(theme.getBaseLightest(true)).to.equal(shade);
      assert(Theme['createShade_']).to.haveBeenCalledWith(base, 0.7, true);
    });
  });

  describe('getBlackFade', () => {
    it('should return the correct color', () => {
      const baseReversedLight = Mocks.object('baseReversedLight');
      spyOn(theme, 'getBaseLight').and.returnValue(baseReversedLight);

      const fade = Mocks.object('fade');
      spyOn(Theme, 'getForegroundFade_').and.returnValue(fade);

      assert(theme.getBlackFade()).to.equal(fade);
      assert(Theme['getForegroundFade_']).to.haveBeenCalledWith(BLACK, baseReversedLight, 8);
      assert(theme.getBaseLight).to.haveBeenCalledWith(true);
    });
  });

  describe('getBlackOnAccent', () => {
    it('should return BLACK if it has a bigger contrast', () => {
      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(BLACK).return(34)
          .when(WHITE).return(12);
      assert(theme.getBlackOnAccent()).to.equal(BLACK);
      assert(Colors.getContrast).to.haveBeenCalledWith(BLACK, accent);
      assert(Colors.getContrast).to.haveBeenCalledWith(WHITE, accent);
    });

    it('should return WHITE if it has a bigger contrast', () => {
      Fakes.build(spyOn(Colors, 'getContrast'))
          .when(BLACK).return(12)
          .when(WHITE).return(34);
      assert(theme.getBlackOnAccent()).to.equal(WHITE);
      assert(Colors.getContrast).to.haveBeenCalledWith(BLACK, accent);
      assert(Colors.getContrast).to.haveBeenCalledWith(WHITE, accent);
    });
  });

  describe('getForegroundFade_', () => {
    it('should return the correct color', () => {
      const foreground = Mocks.object('foreground');
      const background = Mocks.object('background');
      const contrast = 12;

      const mixColor = Mocks.object('mixColor');
      spyOn(Colors, 'mix').and.returnValue(mixColor);

      const alpha = 0.34;
      const spySolve = spyOn(Solve, 'findThreshold').and.returnValue(alpha);

      assert(Theme['getForegroundFade_'](foreground, background, contrast)).to.equal(mixColor);
      assert(Colors.mix).to.haveBeenCalledWith(foreground, background, alpha);
      assert(Solve.findThreshold).to.haveBeenCalledWith(
          Matchers.any(Spec),
          Matchers.any(Function) as any,
          false);
      assert(spySolve.calls.argsFor(0)[0].getStart()).to.equal(0);
      assert(spySolve.calls.argsFor(0)[0].getDelta()).to.equal(0.1);
      assert(spySolve.calls.argsFor(0)[0].getEnd()).to.equal(1);

      const testAlpha = 0.56;
      spyOn(Theme, 'isHighContrastForegroundAlpha_').and.returnValue(true);
      assert(spySolve.calls.argsFor(0)[1](testAlpha) as boolean).to.beTrue();
      assert(Theme['isHighContrastForegroundAlpha_']).to.haveBeenCalledWith(
          foreground,
          background,
          testAlpha,
          contrast);
    });

    it('should throw error if alpha value cannot be computed', () => {
      spyOn(Solve, 'findThreshold').and.returnValue(null);

      assert(() => {
        Theme['getForegroundFade_'](Mocks.object('foreground'), Mocks.object('background'), 12);
      }).to.throwError(/No alpha value/);
    });
  });

  describe('getWhiteFade', () => {
    it('should return the correct color', () => {
      const baseNormalDark = Mocks.object('baseNormalDark');
      spyOn(theme, 'getBaseDark').and.returnValue(baseNormalDark);

      const fade = Mocks.object('fade');
      spyOn(Theme, 'getForegroundFade_').and.returnValue(fade);

      assert(theme.getWhiteFade()).to.equal(fade);
      assert(Theme['getForegroundFade_']).to.haveBeenCalledWith(WHITE, baseNormalDark, 8);
      assert(theme.getBaseDark).to.haveBeenCalledWith(false);
    });
  });

  describe('newInstance', () => {
    it('should return the correct theme', () => {
      const contrast = 12;
      const actionDistance = 0.34;
      const baseDistance = 0.05;
      const spySolve = spyOn(Solve, 'findThreshold').and.returnValues(baseDistance, actionDistance);

      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseReversedLight = Mocks.object('baseReversedLight');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(base, 0.45, false).return(baseNormalDark)
          .when(base, 0.55, true).return(baseReversedLight);

      const theme = Theme.newInstance(base, accent, contrast);
      assert(theme['accent_']).to.equal(accent);
      assert(theme['actionDistance_']).to.equal(actionDistance);
      assert(theme['base_']).to.equal(base);
      assert(theme['baseDistance_']).to.equal(baseDistance);
      assert(theme['contrast_']).to.equal(contrast);

      assert(spySolve.calls.argsFor(1)[0].getStart()).to.equal(0);
      assert(spySolve.calls.argsFor(1)[0].getDelta()).to.equal(0.01);
      assert(spySolve.calls.argsFor(1)[0].getEnd()).to.equal(0.5);

      const testValue = 0.06;
      spyOn(Theme, 'isHighContrastAction_').and.returnValue(true);
      assert(spySolve.calls.argsFor(1)[1](testValue) as boolean).to.beTrue();
      assert(Theme['isHighContrastAction_']).to.haveBeenCalledWith(
          testValue,
          contrast,
          accent,
          baseNormalDark,
          baseReversedLight);

      assert(Theme['createShade_']).to.haveBeenCalledWith(base, 0.55, true);
      assert(Theme['createShade_']).to.haveBeenCalledWith(base, 0.45, false);

      spyOn(Theme, 'isHighContrastBase_').and.returnValue(true);
      assert(spySolve.calls.argsFor(0)[0].getStart()).to.equal(0);
      assert(spySolve.calls.argsFor(0)[0].getDelta()).to.equal(0.01);
      assert(spySolve.calls.argsFor(0)[0].getEnd()).to.equal(0.5);

      assert(spySolve.calls.argsFor(0)[1](testValue) as boolean).to.beTrue();
      assert(Theme['isHighContrastBase_']).to.haveBeenCalledWith(testValue, contrast, base);
    });

    it('should throw error if action distance cannot be computed', () => {
      const baseDistance = 0.05;
      spyOn(Solve, 'findThreshold').and.returnValues(baseDistance, null);

      const baseNormalDark = Mocks.object('baseNormalDark');
      const baseReversedLight = Mocks.object('baseReversedLight');
      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(base, 0.45, false).return(baseNormalDark)
          .when(base, 0.55, true).return(baseReversedLight);

      assert(() => {
        Theme.newInstance(base, accent, 12);
      }).to.throwError(/Action distance/);
    });

    it('should throw error if base distance cannot be computed', () => {
      spyOn(Solve, 'findThreshold').and.returnValues(null);

      assert(() => {
        Theme.newInstance(base, accent, 12);
      }).to.throwError(/Base distance/);
    });

    it('should log warning if base and accent colors are equal', () => {
      spyOn(Solve, 'findThreshold').and.returnValues(0.05, 0.34);
      spyOn(Log, 'warn');

      Fakes.build(spyOn(Theme, 'createShade_'))
          .when(base, 0.45, false).return(Mocks.object('baseNormalDark'))
          .when(base, 0.55, true).return(Mocks.object('baseReversedLight'));

      Theme.newInstance(base, base, 12);
      assert(Log.warn).to.haveBeenCalledWith(
          Matchers.any(Log),
          Matchers.stringMatching(/base and accent/));
    });
  });
});
