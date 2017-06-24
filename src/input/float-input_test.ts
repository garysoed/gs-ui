import { assert, TestBase } from '../test-base';
TestBase.setup();

import { TestDispose } from 'external/gs_tools/src/testing';

import { FloatInput } from './float-input';


describe('input.FloatInput', () => {
  let input: FloatInput;

  beforeEach(() => {
    const mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    input = new FloatInput(mockThemeService);
    TestDispose.add(input);
  });

  describe('isValueChanged_', () => {
    it(`should return true if the old and new values are different`, () => {
      assert(input['isValueChanged_'](1, 2)).to.beTrue();
    });

    it(`should return false if the old and new values the same`, () => {
      assert(input['isValueChanged_'](2, 2)).to.beFalse();
    });

    it(`should return false if the old and new values are NaN and non null`, () => {
      assert(input['isValueChanged_'](NaN, NaN)).to.beFalse();
    });
  });
});
