import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { ElementSelector } from 'external/gs_tools/src/interfaces';
import { StringParser } from 'external/gs_tools/src/parse';
import { TestDispose } from 'external/gs_tools/src/testing';

import { BaseInput2 } from '../input/base-input2';

class TestInput extends BaseInput2<string> {
  constructor() {
    super(Mocks.object('ThemeService'), StringParser);
  }

  protected getInputElSelector_(): ElementSelector {
    throw new Error('Method not implemented.');
  }

  protected getInputElValue_(): string {
    throw new Error('Method not implemented.');
  }

  isValueChanged_(): boolean {
    throw new Error(`Unimplemented`);
  }

  protected setInputElDisabled_(): void {
    throw new Error('Method not implemented.');
  }

  protected setInputElValue_(): void {
    throw new Error('Method not implemented.');
  }
}

describe('input.BaseInput', () => {
  let input: BaseInput2<string>;

  beforeEach(() => {
    input = new TestInput();
    TestDispose.add(input);
  });

  describe('onClick_', () => {
    it(`should click on the input element and focus on it`, () => {
      const mockInputEl = jasmine.createSpyObj('InputEl', ['click', 'focus']);
      const element = Mocks.object('element');
      spyOn(input, 'getInputEl_').and.returnValue(mockInputEl);

      input.onClick_(false, element);
      assert(mockInputEl.click).to.haveBeenCalledWith();
      assert(mockInputEl.focus).to.haveBeenCalledWith();
      assert(input['getInputEl_']).to.haveBeenCalledWith(element);
    });

    it(`should do nothing if disabled`, () => {
      const mockInputEl = jasmine.createSpyObj('InputEl', ['click', 'focus']);
      const element = Mocks.object('element');
      spyOn(input, 'getInputEl_').and.returnValue(mockInputEl);

      input.onClick_(true, element);
      assert(mockInputEl.click).toNot.haveBeenCalled();
      assert(mockInputEl.focus).toNot.haveBeenCalled();
      assert(input['getInputEl_']).toNot.haveBeenCalled();
    });
  });

  describe('onDisabledChange_', () => {
    it(`should propagate the value to the input element`, () => {
      const newValue = true;
      const inputEl = jasmine.createSpyObj('InputEl', ['click', 'focus']);
      const element = Mocks.object('element');
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);
      spyOn(input, 'setInputElDisabled_');

      input.onDisabledChange_(element, newValue);
      assert(input['setInputElDisabled_']).to.haveBeenCalledWith(inputEl, newValue);
      assert(input['getInputEl_']).to.haveBeenCalledWith(element);
    });
  });

  describe('onElValueChange_', () => {
    it(`should update the value on the input element`, () => {
      const elValue = 'elValue';
      const inputValue = 'inputValue';
      const element = Mocks.object('element');
      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);
      spyOn(input, 'setInputElValue_');
      spyOn(input, 'getInputElValue_').and.returnValue(inputValue);
      spyOn(input, 'isValueChanged_').and.returnValue(true);

      input.onElValueChange_(elValue, element);
      assert(input['setInputElValue_']).to.haveBeenCalledWith(inputEl, elValue);
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, elValue);
      assert(input['getInputElValue_']).to.haveBeenCalledWith(inputEl);
      assert(input['getInputEl_']).to.haveBeenCalledWith(element);
    });

    it(`should set the value to empty string if null`, () => {
      const inputValue = 'inputValue';
      const element = Mocks.object('element');
      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);
      spyOn(input, 'setInputElValue_');
      spyOn(input, 'getInputElValue_').and.returnValue(inputValue);
      spyOn(input, 'isValueChanged_').and.returnValue(true);

      input.onElValueChange_(null, element);
      assert(input['setInputElValue_']).to.haveBeenCalledWith(inputEl, '');
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, null);
      assert(input['getInputElValue_']).to.haveBeenCalledWith(inputEl);
      assert(input['getInputEl_']).to.haveBeenCalledWith(element);
    });

    it(`should do nothing if the value does not change`, () => {
      const elValue = 'elValue';
      const inputValue = 'inputValue';
      const element = Mocks.object('element');
      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);
      spyOn(input, 'setInputElValue_');
      spyOn(input, 'getInputElValue_').and.returnValue(inputValue);
      spyOn(input, 'isValueChanged_').and.returnValue(false);

      input.onElValueChange_(elValue, element);
      assert(input['setInputElValue_']).toNot.haveBeenCalled();
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, elValue);
      assert(input['getInputElValue_']).to.haveBeenCalledWith(inputEl);
      assert(input['getInputEl_']).to.haveBeenCalledWith(element);
    });
  });

  describe('onInputChange_', () => {
    it(`should update the value on the element and dispatch the change event`, () => {
      const elValueId = 'elValueId';
      const elValue = 'elValue';
      const inputValue = 'inputValue';
      const element = Mocks.object('element');
      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputElValue_').and.returnValue(inputValue);
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);
      const mockDispatcher = jasmine.createSpy('Dispatcher');

      spyOn(input, 'isValueChanged_').and.returnValue(true);

      assert(input.onInputChange_({id: elValueId, value: elValue}, element, mockDispatcher))
          .to.haveElements([[elValueId, inputValue]]);
      assert(mockDispatcher).to.haveBeenCalledWith('change', {});
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, elValue);
      assert(input['getInputEl_']).to.haveBeenCalledWith(element);
      assert(input['getInputElValue_']).to.haveBeenCalledWith(inputEl);
    });

    it(`should do nothing if the value does not change`, () => {
      const elValueId = 'elValueId';
      const elValue = 'elValue';
      const inputValue = 'inputValue';
      const element = Mocks.object('element');
      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputElValue_').and.returnValue(inputValue);
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);
      const mockDispatcher = jasmine.createSpy('Dispatcher');

      spyOn(input, 'isValueChanged_').and.returnValue(false);

      assert(input.onInputChange_({id: elValueId, value: elValue}, element, mockDispatcher))
          .to.haveElements([]);
      assert(mockDispatcher).toNot.haveBeenCalled();
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, elValue);
      assert(input['getInputEl_']).to.haveBeenCalledWith(element);
      assert(input['getInputElValue_']).to.haveBeenCalledWith(inputEl);
    });
  });
});
