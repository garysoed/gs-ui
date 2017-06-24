import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { MonadSetter } from 'external/gs_tools/src/event';
import { StringParser } from 'external/gs_tools/src/parse';
import { TestDispose } from 'external/gs_tools/src/testing';

import { BaseInput2 } from '../input/base-input2';

class TestInput extends BaseInput2<string> {
  constructor() {
    super(Mocks.object('ThemeService'), StringParser);
  }

  isValueChanged_(): boolean {
    throw new Error(`Unimplemented`);
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
      input.onClick_(false, mockInputEl);
      assert(mockInputEl.click).to.haveBeenCalledWith();
      assert(mockInputEl.focus).to.haveBeenCalledWith();
    });

    it(`should do nothing if disabled`, () => {
      const mockInputEl = jasmine.createSpyObj('InputEl', ['click', 'focus']);
      input.onClick_(true, mockInputEl);
      assert(mockInputEl.click).toNot.haveBeenCalled();
      assert(mockInputEl.focus).toNot.haveBeenCalled();
    });
  });

  describe('onDisabledChange_', () => {
    it(`should propagate the value to the input element`, () => {
      const newValue = true;
      const id = 'id';
      assert(input.onDisabledChange_(newValue, {id} as MonadSetter<boolean>)).to
          .haveElements([[id, newValue]]);
    });
  });

  describe('onElValueChange_', () => {
    it(`should update the value on the input element`, () => {
      const elValue = 'elValue';
      const inputValue = 'inputValue';
      const inputEl = Mocks.object('inputEl');
      inputEl.value = inputValue;

      spyOn(input, 'isValueChanged_').and.returnValue(true);

      input.onElValueChange_(elValue, inputEl);
      assert(inputEl.value).to.equal(elValue);
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, elValue);
    });

    it(`should set the value to empty string if null`, () => {
      const inputValue = 'inputValue';
      const inputEl = Mocks.object('inputEl');
      inputEl.value = inputValue;

      spyOn(input, 'isValueChanged_').and.returnValue(true);

      input.onElValueChange_(null, inputEl);
      assert(inputEl.value).to.equal('');
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, null);
    });

    it(`should do nothing if the value does not change`, () => {
      const elValue = 'elValue';
      const inputValue = 'inputValue';
      const inputEl = Mocks.object('inputEl');
      inputEl.value = inputValue;

      spyOn(input, 'isValueChanged_').and.returnValue(false);

      input.onElValueChange_(elValue, inputEl);
      assert(inputEl.value).to.equal(inputValue);
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, elValue);
    });
  });

  describe('onInputChange_', () => {
    it(`should update the value on the element and dispatch the change event`, () => {
      const elValueId = 'elValueId';
      const elValue = 'elValue';
      const inputValue = 'inputValue';
      const inputEl = Mocks.object('inputEl');
      inputEl.value = inputValue;
      const mockDispatcher = jasmine.createSpy('Dispatcher');

      spyOn(input, 'isValueChanged_').and.returnValue(true);

      assert(input.onInputChange_({id: elValueId, value: elValue}, inputEl, mockDispatcher))
          .to.haveElements([[elValueId, inputValue]]);
      assert(mockDispatcher).to.haveBeenCalledWith('change', {});
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, elValue);
    });

    it(`should do nothing if the value does not change`, () => {
      const elValueId = 'elValueId';
      const elValue = 'elValue';
      const inputValue = 'inputValue';
      const inputEl = Mocks.object('inputEl');
      inputEl.value = inputValue;
      const mockDispatcher = jasmine.createSpy('Dispatcher');

      spyOn(input, 'isValueChanged_').and.returnValue(false);

      assert(input.onInputChange_({id: elValueId, value: elValue}, inputEl, mockDispatcher))
          .to.haveElements([]);
      assert(mockDispatcher).toNot.haveBeenCalled();
      assert(input['isValueChanged_']).to.haveBeenCalledWith(inputValue, elValue);
    });
  });
});
