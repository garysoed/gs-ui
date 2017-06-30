import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { ListenableDom } from 'external/gs_tools/src/event';
import { TestDispose } from 'external/gs_tools/src/testing';

import { TextInput } from '../input/text-input';


describe('input.TextInput', () => {
  let input: TextInput;

  beforeEach(() => {
    input = new TextInput(Mocks.object('ThemeService'));
    TestDispose.add(input);
  });

  describe('getInputElValue_', () => {
    it(`should return the correct value`, () => {
      const value = 'value';
      const inputEl = Mocks.object('inputEl');
      inputEl.value = value;
      assert(input['getInputElValue_'](inputEl)).to.equal(value);
    });
  });

  describe('isValueChanged_', () => {
    it(`should return true if the values are different`, () => {
      assert(input['isValueChanged_']('value1', 'value2')).to.beTrue();
    });

    it(`should return false if the values are the same`, () => {
      assert(input['isValueChanged_']('value', 'value')).to.beFalse();
    });
  });

  describe('listenToValueChanges_', () => {
    it(`should listen to the correct event`, () => {
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
    it(`should add the disabled attribute when setting disabled`, () => {
      const mockInputEl = jasmine.createSpyObj('InputEl', ['setAttribute']);
      input['setInputElDisabled_'](mockInputEl, true);
      assert(mockInputEl.setAttribute).to.haveBeenCalledWith('disabled', '');
    });

    it(`should delete the disabled attribute when enabling`, () => {
      const mockInputEl = jasmine.createSpyObj('InputEl', ['removeAttribute']);
      input['setInputElDisabled_'](mockInputEl, false);
      assert(mockInputEl.removeAttribute).to.haveBeenCalledWith('disabled');
    });
  });

  describe('setInputElValue_', () => {
    it(`should set the value correctly`, () => {
      const inputEl = Mocks.object('inputEl');
      const value = 'value';
      input['setInputElValue_'](inputEl, value);
      assert(inputEl.value).to.equal(value);
    });
  });
});
