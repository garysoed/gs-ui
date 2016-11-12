import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {DomEvent, ListenableDom} from 'external/gs_tools/src/event';
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
      let mockListenableInputElement = Mocks.listenable('ListenableInputEl', mockInputElement);
      textInput['listenableInputEl_'] = mockListenableInputElement;
      TestDispose.add(mockListenableInputElement);

      spyOn(textInput, 'isDisabled').and.returnValue(false);

      textInput['onClick_']();

      assert(mockInputElement.click).to.haveBeenCalledWith();
      assert(mockInputElement.focus).to.haveBeenCalledWith();
    });

    it('should do nothing if there are no input elements', () => {
      textInput['listenableInputEl_'] = null;

      spyOn(textInput, 'isDisabled').and.returnValue(false);

      assert(() => {
        textInput['onClick_']();
      }).toNot.throw();
    });

    it('should do nothing if disabled', () => {
      let mockInputElement = jasmine.createSpyObj('InputElement', ['click', 'focus']);
      let mockListenableInputElement = Mocks.listenable('ListenableInputEl', mockInputElement);
      textInput['listenableInputEl_'] = mockListenableInputElement;
      TestDispose.add(mockListenableInputElement);

      spyOn(textInput, 'isDisabled').and.returnValue(true);

      textInput['onClick_']();

      assert(mockInputElement.click).toNot.haveBeenCalled();
      assert(mockInputElement.focus).toNot.haveBeenCalled();
    });
  });

  describe('onGsValueChange_', () => {
    fit('should update the event target value', () => {
      let value = 'value';
      let eventTarget = Mocks.object('eventTarget');
      let mockListenableInputEl = jasmine.createSpyObj('ListenableInputEl', ['getEventTarget']);
      mockListenableInputEl.getEventTarget.and.returnValue(eventTarget);
      textInput['listenableInputEl_'] = mockListenableInputEl;

      textInput['onGsValueChange_'](value);

      assert(eventTarget.value).to.equal(value);
    });

    fit('should not throw error if there are no listenable input elements', () => {
      textInput['listenableInputEl_'] = null;

      assert(() => {
        textInput['onGsValueChange_']('value');
      }).toNot.throw();
    });
  });

  describe('onDisabledChange_', () => {
    fit('should set the value to the input element', () => {
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

      let mockListenableInputElement = Mocks.listenable('ListenableInputElement', inputElement);
      textInput['listenableInputEl_'] = mockListenableInputElement;
      TestDispose.add(mockListenableInputElement);

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

      let mockListenableInputElement = Mocks.listenable('ListenableInputElement', inputElement);
      textInput['listenableInputEl_'] = mockListenableInputElement;
      TestDispose.add(mockListenableInputElement);

      spyOn(textInput, 'getElement').and.returnValue(null);
      spyOn(textInput['gsValueBridge_'], 'set');

      textInput['onInputChange_']();

      assert(textInput['gsValueBridge_'].set).to.haveBeenCalledWith(value);
    });
  });

  describe('onAttributeChanged', () => {
    it('should update the input element for disabled attribute', () => {
      spyOn(textInput, 'isDisabled').and.returnValue(true);
      spyOn(textInput['inputDisabledBridge_'], 'set');

      textInput.onAttributeChanged('disabled', '', '');

      assert(textInput['inputDisabledBridge_'].set).to.haveBeenCalledWith(true);
    });

    it('should update the input element for gsValue attribute', () => {
      let newValue = 'newValue';
      let inputElement = Mocks.object('inputElement');
      let mockListenableInputElement = Mocks.listenable('ListenableInputElement', inputElement);
      textInput['listenableInputEl_'] = mockListenableInputElement;
      TestDispose.add(mockListenableInputElement);

      textInput.onAttributeChanged('gsValue', '', newValue);

      assert(inputElement.value).to.equal(newValue);
    });

    it('should do nothing if gsValue attribute changed but there are no input elements', () => {
      assert(() => {
        textInput.onAttributeChanged('gsValue', '', 'newValue');
      }).toNot.throw();
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      let inputElement = Mocks.object('inputElement');
      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(inputElement);

      let gsValue = 'gsValue';
      let disabled = 'disabled';
      let mockElement = Mocks.element();
      spyOn(mockElement, 'getAttribute').and.callFake((attrName: string) => {
        switch (attrName) {
          case 'disabled':
            return disabled;
          case 'gs-value':
            return gsValue;
        }
      });
      mockElement.shadowRoot = mockShadowRoot;

      let mockListenableInputElement = Mocks.listenable('ListenableInputElement');
      spyOn(mockListenableInputElement, 'on').and.callThrough();
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableInputElement);
      TestDispose.add(mockListenableInputElement);

      spyOn(textInput, 'onInputChange_');
      spyOn(textInput, 'onAttributeChanged');

      textInput.onCreated(mockElement);

      assert(textInput.onAttributeChanged).to.haveBeenCalledWith('gsValue', '', gsValue);
      assert(textInput.onAttributeChanged).to.haveBeenCalledWith('disabled', '', disabled);

      assert(mockListenableInputElement.on)
          .to.haveBeenCalledWith(DomEvent.CHANGE, Matchers.any(Function));
      mockListenableInputElement.on.calls.argsFor(1)[1]();
      assert(textInput['onInputChange_']).to.haveBeenCalledWith();

      assert(mockShadowRoot.querySelector).to.haveBeenCalledWith('input');
      assert(ListenableDom.of).to.haveBeenCalledWith(inputElement);
    });
  });
});
