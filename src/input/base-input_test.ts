import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Interval } from 'external/gs_tools/src/async';
import { DomEvent } from 'external/gs_tools/src/event';
import { Mocks } from 'external/gs_tools/src/mock';
import { StringParser } from 'external/gs_tools/src/parse';
import { TestDispose } from 'external/gs_tools/src/testing';

import { BaseInput } from '../input/base-input';


class Input extends BaseInput<string> { }

describe('input.BaseInput', () => {
  let mockGsValueHook;
  let mockValueHook;
  let input: Input;

  beforeEach(() => {
    mockGsValueHook = jasmine.createSpyObj('GsValueHook', ['get', 'set']);
    mockValueHook = jasmine.createSpyObj('ValueHook', ['get', 'set']);
    const mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    input = new Input(mockThemeService, mockGsValueHook, mockValueHook, StringParser);
    TestDispose.add(input);
  });

  describe('onClick_', () => {
    it('should click and focus the input element', () => {
      const mockInputElement = jasmine.createSpyObj('InputElement', ['click', 'focus']);
      input['inputEl_'] = mockInputElement;

      spyOn(input, 'isDisabled').and.returnValue(true);

      input['onClick_']();

      assert(mockInputElement.click).toNot.haveBeenCalled();
      assert(mockInputElement.focus).toNot.haveBeenCalled();
    });
  });

  describe('onGsValueChange_', () => {
    it('should update the input target value', () => {
      const value = 'value';
      mockValueHook.get.and.returnValue(null);

      input['onGsValueChange_'](value);

      assert(mockValueHook.set).to.haveBeenCalledWith(value);
    });

    it('should not update the input value if it is the same', () => {
      const value = 'value';
      mockValueHook.get.and.returnValue(value);

      input['onGsValueChange_'](value);

      assert(mockValueHook.set).toNot.haveBeenCalled();
    });
  });

  describe('onDisabledChange_', () => {
    it('should set the value to the input element', () => {
      const value = true;
      spyOn(input['inputDisabledHook_'], 'set');
      input['onDisabledChange_'](value);
      assert(input['inputDisabledHook_'].set).to.haveBeenCalledWith(value);
    });
  });

  describe('onInputTick_', () => {
    it('should set the new value and dispatch a CHANGE event', () => {
      const oldValue = 'oldValue';
      mockGsValueHook.get.and.returnValue(oldValue);

      const value = 'value';
      mockValueHook.get.and.returnValue(value);

      const mockElement = jasmine.createSpyObj('Element', ['dispatch']);

      spyOn(input, 'getElement').and.returnValue(mockElement);

      input['onInputTick_']();

      assert(mockGsValueHook.set).to.haveBeenCalledWith(value);
      assert(mockElement.dispatch).to.haveBeenCalledWith(DomEvent.CHANGE);
    });

    it('should not set the new value if the value does not change', () => {
      const value = 'value';
      mockValueHook.get.and.returnValue(value);
      mockGsValueHook.get.and.returnValue(value);

      const mockElement = jasmine.createSpyObj('Element', ['dispatch']);

      spyOn(input, 'getElement').and.returnValue(mockElement);

      input['onInputTick_']();

      assert(mockGsValueHook.set).toNot.haveBeenCalled();
      assert(mockElement.dispatch).toNot.haveBeenCalled();
    });

    it('should not dispatch event if there are no elements', () => {
      const value = 'value';
      mockValueHook.get.and.returnValue(value);
      mockGsValueHook.get.and.returnValue('oldValue');

      spyOn(input, 'getElement').and.returnValue(null);

      input['onInputTick_']();

      assert(mockGsValueHook.set).to.haveBeenCalledWith(value);
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      const inputElement = Mocks.object('inputElement');
      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(inputElement);

      const element = Mocks.object('element');
      element.shadowRoot = mockShadowRoot;

      spyOn(input, 'listenTo');

      input.onCreated(element);

      assert(input.listenTo).to
          .haveBeenCalledWith(input['interval_'], Interval.TICK_EVENT, input['onInputTick_']);
      assert(input['inputEl_']).to.equal(inputElement);
      assert(mockShadowRoot.querySelector).to.haveBeenCalledWith('input');
    });
  });

  describe('onInserted', () => {
    it('should start the interval', () => {
      const element = Mocks.object('element');
      spyOn(input['interval_'], 'start');
      input.onInserted(element);

      assert(input['interval_'].start).to.haveBeenCalledWith();
    });
  });

  describe('onRemoved', () => {
    it('should stop the interval', () => {
      const element = Mocks.object('element');
      spyOn(input['interval_'], 'stop');
      input.onRemoved(element);

      assert(input['interval_'].stop).to.haveBeenCalledWith();
    });
  });
});

