import {assert, TestBase} from '../test-base';
TestBase.setup();

import {DomEvent} from 'external/gs_tools/src/event';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {TextInput} from './text-input';


describe('input.TextInput', () => {
  let textInput: TextInput;

  beforeEach(() => {
    textInput = new TextInput();
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
    it('should update the event target value', () => {
      let value = 'value';
      let eventTarget = Mocks.object('eventTarget');
      textInput['inputEl_'] = eventTarget;

      textInput['onGsValueChange_'](value);

      assert(eventTarget.value).to.equal(value);
    });

    it('should not throw error if there are no listenable input elements', () => {
      textInput['inputEl_'] = null;

      assert(() => {
        textInput['onGsValueChange_']('value');
      }).toNot.throw();
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

  describe('onInputChange_', () => {
    it('should set the new value and dispatch a CHANGE event', () => {
      let value = 'value';
      let inputElement = Mocks.object('inputElement');
      inputElement.value = value;

      textInput['inputEl_'] = inputElement;

      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);

      spyOn(textInput, 'getElement').and.returnValue(mockElement);
      spyOn(textInput['gsValueBridge_'], 'set');

      textInput['onInputChange_']();

      assert(textInput['gsValueBridge_'].set).to.haveBeenCalledWith(value);
      assert(mockElement.dispatch).to.haveBeenCalledWith(DomEvent.CHANGE);
    });

    it('should not set the new value if there are no input elements', () => {
      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);

      spyOn(textInput, 'getElement').and.returnValue(mockElement);
      spyOn(textInput['gsValueBridge_'], 'set');

      textInput['onInputChange_']();

      assert(textInput['gsValueBridge_'].set).toNot.haveBeenCalled();
      assert(mockElement.dispatch).to.haveBeenCalledWith(DomEvent.CHANGE);
    });

    it('should not dispatch event if there are no elements', () => {
      let value = 'value';
      let inputElement = Mocks.object('inputElement');
      inputElement.value = value;

      textInput['inputEl_'] = inputElement;

      spyOn(textInput, 'getElement').and.returnValue(null);
      spyOn(textInput['gsValueBridge_'], 'set');

      textInput['onInputChange_']();

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
});
