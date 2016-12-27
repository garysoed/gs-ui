import {assert, TestBase} from '../test-base';
TestBase.setup();

import {DomEvent} from 'external/gs_tools/src/event';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';
import {StringParser} from 'external/gs_tools/src/webc';

import {BaseInput} from './base-input';


class Input extends BaseInput<string> { }

describe('input.BaseInput', () => {
  let mockGsValueBridge;
  let mockValueBridge;
  let input: Input;

  beforeEach(() => {
    mockGsValueBridge = jasmine.createSpyObj('GsValueBridge', ['get', 'set']);
    mockValueBridge = jasmine.createSpyObj('ValueBridge', ['get', 'set']);
    let mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    input = new Input(mockThemeService, mockGsValueBridge, mockValueBridge, StringParser);
    TestDispose.add(input);
  });

  describe('onClick_', () => {
    it('should click and focus the input element', () => {
      let mockInputElement = jasmine.createSpyObj('InputElement', ['click', 'focus']);
      input['inputEl_'] = mockInputElement;

      spyOn(input, 'isDisabled').and.returnValue(false);

      input['onClick_']();

      assert(mockInputElement.click).to.haveBeenCalledWith();
      assert(mockInputElement.focus).to.haveBeenCalledWith();
    });

    it('should do nothing if there are no input elements', () => {
      input['inputEl_'] = null;

      spyOn(input, 'isDisabled').and.returnValue(false);

      assert(() => {
        input['onClick_']();
      }).toNot.throw();
    });

    it('should do nothing if disabled', () => {
      let mockInputElement = jasmine.createSpyObj('InputElement', ['click', 'focus']);
      input['inputEl_'] = mockInputElement;

      spyOn(input, 'isDisabled').and.returnValue(true);

      input['onClick_']();

      assert(mockInputElement.click).toNot.haveBeenCalled();
      assert(mockInputElement.focus).toNot.haveBeenCalled();
    });
  });

  describe('onGsValueChange_', () => {
    it('should update the input target value', () => {
      let value = 'value';
      mockValueBridge.get.and.returnValue(null);

      input['onGsValueChange_'](value);

      assert(mockValueBridge.set).to.haveBeenCalledWith(value);
    });

    it('should not update the input value if it is the same', () => {
      let value = 'value';
      mockValueBridge.get.and.returnValue(value);

      input['onGsValueChange_'](value);

      assert(mockValueBridge.set).toNot.haveBeenCalled();
    });
  });

  describe('onDisabledChange_', () => {
    it('should set the value to the input element', () => {
      let value = true;
      spyOn(input['inputDisabledBridge_'], 'set');
      input['onDisabledChange_'](value);
      assert(input['inputDisabledBridge_'].set).to.haveBeenCalledWith(value);
    });
  });

  describe('onInputTick_', () => {
    it('should set the new value and dispatch a CHANGE event', () => {
      let oldValue = 'oldValue';
      mockGsValueBridge.get.and.returnValue(oldValue);

      let value = 'value';
      mockValueBridge.get.and.returnValue(value);

      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);

      spyOn(input, 'getElement').and.returnValue(mockElement);

      input['onInputTick_']();

      assert(mockGsValueBridge.set).to.haveBeenCalledWith(value);
      assert(mockElement.dispatch).to.haveBeenCalledWith(DomEvent.CHANGE);
    });

    it('should not set the new value if the value does not change', () => {
      let value = 'value';
      mockValueBridge.get.and.returnValue(value);
      mockGsValueBridge.get.and.returnValue(value);

      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);

      spyOn(input, 'getElement').and.returnValue(mockElement);

      input['onInputTick_']();

      assert(mockGsValueBridge.set).toNot.haveBeenCalled();
      assert(mockElement.dispatch).toNot.haveBeenCalled();
    });

    it('should not dispatch event if there are no elements', () => {
      let value = 'value';
      mockValueBridge.get.and.returnValue(value);
      mockGsValueBridge.get.and.returnValue('oldValue');

      spyOn(input, 'getElement').and.returnValue(null);

      input['onInputTick_']();

      assert(mockGsValueBridge.set).to.haveBeenCalledWith(value);
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      let inputElement = Mocks.object('inputElement');
      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(inputElement);

      let mockElement = Mocks.element();
      mockElement.shadowRoot = mockShadowRoot;

      input.onCreated(mockElement);

      assert(input['inputEl_']).to.equal(inputElement);
      assert(mockShadowRoot.querySelector).to.haveBeenCalledWith('input');
    });
  });

  describe('onInserted', () => {
    it('should start the interval', () => {
      let element = Mocks.object('element');
      spyOn(input['interval_'], 'start');
      input.onInserted(element);

      assert(input['interval_'].start).to.haveBeenCalledWith();
    });
  });

  describe('onRemoved', () => {
    it('should stop the interval', () => {
      let element = Mocks.object('element');
      spyOn(input['interval_'], 'stop');
      input.onRemoved(element);

      assert(input['interval_'].stop).to.haveBeenCalledWith();
    });
  });
});

