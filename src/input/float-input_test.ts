import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { ListenableDom } from 'external/gs_tools/src/event';
import { TestDispose } from 'external/gs_tools/src/testing';

import { FloatInput } from '../input/float-input';


describe('input.FloatInput', () => {
  let input: FloatInput;

  beforeEach(() => {
    const mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    input = new FloatInput(mockThemeService);
    TestDispose.add(input);
  });

  describe('getInputElValue_', () => {
    it(`should return the correct value`, () => {
      const value = 'value';
      const inputEl = document.createElement('input');
      inputEl.value = value;
      assert(input['getInputElValue_'](inputEl)).to.equal(value);
    });
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

  describe('listenToValueChanges_', () => {
    it(`should listen to the value changes correctly`, () => {
      const element = Mocks.object('element');
      const callback = Mocks.object('callback');
      const disposable = Mocks.object('disposable');
      const mockListenableDom = jasmine.createSpyObj('ListenableDom', ['dispose', 'on']);
      mockListenableDom.on.and.returnValue(disposable);
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableDom);

      spyOn(input, 'addDisposable').and.callThrough();

      assert(input['listenToValueChanges_'](element, callback)).to.equal(disposable);
      assert(input.addDisposable).to.haveBeenCalledWith(mockListenableDom);
      assert(mockListenableDom.on).to.haveBeenCalledWith('change', callback, input);
      assert(ListenableDom.of).to.haveBeenCalledWith(element);
    });
  });

  describe('setInputElDisabled_', () => {
    it(`should add the attribute if disabled`, () => {
      const inputEl = document.createElement('input');
      input['setInputElDisabled_'](inputEl, true);
      assert(inputEl.hasAttribute('disabled')).to.beTrue();
    });

    it(`should delete the attribute if not disabled`, () => {
      const inputEl = document.createElement('input');
      inputEl.setAttribute('disabled', '');
      input['setInputElDisabled_'](inputEl, false);
      assert(inputEl.hasAttribute('disabled')).to.beFalse();
    });
  });

  describe('setInputElValue_', () => {
    it(`should set the value correctly`, () => {
      const value = 'value';
      const inputEl = document.createElement('input');
      input['setInputElValue_'](inputEl, value);
      assert(inputEl.value).to.equal(value);
    });
  });
});
