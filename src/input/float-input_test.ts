import { assert, TestBase } from '../test-base';
TestBase.setup();

import { TestDispose } from 'external/gs_tools/src/testing';

import { BaseInput } from './base-input';
import { FloatInput } from './float-input';


describe('input.FloatInput', () => {
  let input: FloatInput;

  beforeEach(() => {
    let mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    input = new FloatInput(mockThemeService);
    TestDispose.add(input);
  });

  describe('isValueChanged_', () => {
    it('should not call the super method if both new and old values are NaN', () => {
      spyOn(BaseInput.prototype, 'isValueChanged_');

      assert(input['isValueChanged_'](NaN, NaN)).to.beFalse();
      assert(BaseInput.prototype['isValueChanged_']).toNot.haveBeenCalled();
    });
  });
});
