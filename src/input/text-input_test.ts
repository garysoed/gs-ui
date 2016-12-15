import {assert, TestBase} from '../test-base';
TestBase.setup();

import {DomEvent} from 'external/gs_tools/src/event';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {TextInput} from './text-input';


describe('input.TextInput', () => {
  let textInput: TextInput;

  beforeEach(() => {
    let mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    textInput = new TextInput(mockThemeService);
    TestDispose.add(textInput);
  });

  describe('onClick_', () => {
    it('should click and focus the input element', () => {
      let mockInputElement = jasmine.createSpyObj('InputElement', ['click', 'focus']);
      textInput['inputEl_'] = mockInputElement;

      spyOn(textInput, 'isDisabled').and.returnValue(false);

      textInput['onClick_']();

      assert(mockInputElement.click).to.haveBeenCalledWith();
      assert(mockInputElement.focus).to.haveBeenCalledWith();
    });

    it('should do nothing if there are no input elements', () => {
      textInput['inputEl_'] = null;

      spyOn(textInput, 'isDisabled').and.returnValue(false);

      assert(() => {
        textInput['onClick_']();
      }).toNot.throw();
    });

    it('should do nothing if disabled', () => {
      let mockInputElement = jasmine.createSpyObj('InputElement', ['click', 'focus']);
      textInput['inputEl_'] = mockInputElement;

      spyOn(textInput, 'isDisabled').and.returnValue(true);

      textInput['onClick_']();

      assert(mockInputElement.click).toNot.haveBeenCalled();
      assert(mockInputElement.focus).toNot.haveBeenCalled();
    });
  });

  describe('onGsValueChange_', () => {
    it('should update the input target value', () => {
      let value = 'value';
      spyOn(textInput['inputValueBridge_'], 'get').and.returnValue(null);
      spyOn(textInput['inputValueBridge_'], 'set');

      textInput['onGsValueChange_'](value);

      assert(textInput['inputValueBridge_'].set).to.haveBeenCalledWith(value);
    });

    it('should not update the input value if it is the same', () => {
      let value = 'value';
      spyOn(textInput['inputValueBridge_'], 'get').and.returnValue(value);
      spyOn(textInput['inputValueBridge_'], 'set');

      textInput['onGsValueChange_'](value);

      assert(textInput['inputValueBridge_'].set).toNot.haveBeenCalled();
    });
  });

  describe('onDisabledChange_', () => {
    it('should set the value to the input element', () => {
      let value = true;
      spyOn(textInput['inputDisabledBridge_'], 'set');
      textInput['onDisabledChange_'](value);
      assert(textInput['inputDisabledBridge_'].set).to.haveBeenCalledWith(value);
    });
  });

  describe('onInputTick_', () => {
    it('should set the new value and dispatch a CHANGE event', () => {
      let oldValue = 'oldValue';
      spyOn(textInput['gsValueBridge_'], 'get').and.returnValue(oldValue);

      let value = 'value';
      let inputElement = Mocks.object('inputElement');
      inputElement.value = value;

      textInput['inputEl_'] = inputElement;

      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);

      spyOn(textInput, 'getElement').and.returnValue(mockElement);
      spyOn(textInput['gsValueBridge_'], 'set');

      textInput['onInputTick_']();

      assert(textInput['gsValueBridge_'].set).to.haveBeenCalledWith(value);
      assert(mockElement.dispatch).to.haveBeenCalledWith(DomEvent.CHANGE);
    });

    it('should not set the new value if there are no input elements', () => {
      let oldValue = 'oldValue';
      spyOn(textInput['gsValueBridge_'], 'get').and.returnValue(oldValue);

      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);

      spyOn(textInput, 'getElement').and.returnValue(mockElement);
      spyOn(textInput['gsValueBridge_'], 'set');

      textInput['onInputTick_']();

      assert(textInput['gsValueBridge_'].set).toNot.haveBeenCalled();
      assert(mockElement.dispatch).toNot.haveBeenCalledWith(DomEvent.CHANGE);
    });

    it('should not set the new value if the value does not change', () => {
      let value = 'value';
      let inputElement = Mocks.object('inputElement');
      inputElement.value = value;
      spyOn(textInput['gsValueBridge_'], 'get').and.returnValue(value);

      textInput['inputEl_'] = inputElement;

      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);

      spyOn(textInput, 'getElement').and.returnValue(mockElement);
      spyOn(textInput['gsValueBridge_'], 'set');

      textInput['onInputTick_']();

      assert(textInput['gsValueBridge_'].set).toNot.haveBeenCalled();
      assert(mockElement.dispatch).toNot.haveBeenCalled();
    });

    it('should not dispatch event if there are no elements', () => {
      let value = 'value';
      let inputElement = Mocks.object('inputElement');
      inputElement.value = value;
      spyOn(textInput['gsValueBridge_'], 'get').and.returnValue('oldValue');

      textInput['inputEl_'] = inputElement;

      spyOn(textInput, 'getElement').and.returnValue(null);
      spyOn(textInput['gsValueBridge_'], 'set');

      textInput['onInputTick_']();

      assert(textInput['gsValueBridge_'].set).to.haveBeenCalledWith(value);
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      let inputElement = Mocks.object('inputElement');
      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(inputElement);

      let mockElement = Mocks.element();
      mockElement.shadowRoot = mockShadowRoot;

      textInput.onCreated(mockElement);

      assert(textInput['inputEl_']).to.equal(inputElement);
      assert(mockShadowRoot.querySelector).to.haveBeenCalledWith('input');
    });
  });

  describe('onInserted', () => {
    it('should start the interval', () => {
      let element = Mocks.object('element');
      spyOn(textInput['interval_'], 'start');
      textInput.onInserted(element);

      assert(textInput['interval_'].start).to.haveBeenCalledWith();
    });
  });

  describe('onRemoved', () => {
    it('should stop the interval', () => {
      let element = Mocks.object('element');
      spyOn(textInput['interval_'], 'stop');
      textInput.onRemoved(element);

      assert(textInput['interval_'].stop).to.haveBeenCalledWith();
    });
  });
});
