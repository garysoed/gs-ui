import { assert, Matchers, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { Disposable, ElementSelector } from 'external/gs_tools/src/interfaces';
import { StringParser } from 'external/gs_tools/src/parse';
import { Persona } from 'external/gs_tools/src/persona';
import { TestDispose } from 'external/gs_tools/src/testing';

import { $, $inputValue, BaseInput, inputValueProvider } from '../input/base-input2';

class TestInput extends BaseInput<string> {
  constructor() {
    super(Mocks.object('ThemeService'), StringParser);
  }

  protected getInputEl_(): Promise<HTMLInputElement> {
    throw new Error('Method not implemented.');
  }

  protected getInputElSelector_(): ElementSelector {
    throw new Error('Method not implemented.');
  }

  protected getInputElValue_(): string {
    throw new Error('Method not implemented.');
  }

  protected listenToValueChanges_(): Disposable {
    throw new Error('Method not implemented.');
  }

  protected setInputElDisabled_(): void {
    throw new Error('Method not implemented.');
  }

  protected setInputElValue_(): void {
    throw new Error('Method not implemented.');
  }
}

describe('input.BaseInput', () => {
  let input: BaseInput<string>;

  beforeEach(() => {
    input = new TestInput();
    TestDispose.add(input);
  });

  describe('onClick_', () => {
    it(`should focus on the input element and focus on it`, async () => {
      const mockInputEl = jasmine.createSpyObj('InputEl', ['focus']);
      spyOn(input, 'getInputEl_').and.returnValue(mockInputEl);
      spyOn(Persona, 'getValue').and.returnValue(false);

      await input.onClick_();
      assert(mockInputEl.focus).to.haveBeenCalledWith();
      assert(Persona.getValue).to.haveBeenCalledWith($.host.disabled, input);
    });

    it(`should do nothing if disabled`, async () => {
      const mockInputEl = jasmine.createSpyObj('InputEl', ['focus']);
      spyOn(input, 'getInputEl_').and.returnValue(mockInputEl);
      spyOn(Persona, 'getValue').and.returnValue(true);

      await input.onClick_();
      assert(mockInputEl.focus).toNot.haveBeenCalled();
      assert(Persona.getValue).to.haveBeenCalledWith($.host.disabled, input);
    });
  });

  describe('onDisabledChange_', () => {
    it(`should propagate the value to the input element`, async () => {
      const newValue = true;
      const inputEl = jasmine.createSpyObj('InputEl', ['click', 'focus']);
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);
      spyOn(input, 'setInputElDisabled_');
      spyOn(Persona, 'getValue').and.returnValue(newValue);

      await input.onDisabledChange_();
      assert(input['setInputElDisabled_']).to.haveBeenCalledWith(inputEl, newValue);
      assert(Persona.getValue).to.haveBeenCalledWith($.host.disabled, input);

    });
  });

  describe('onHostCreated_', () => {
    it(`should setup correctly`, async () => {
      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputEl_').and.returnValue(Promise.resolve(inputEl));

      const mockDisposable = jasmine.createSpyObj('Disposable', ['dispose']);
      const spyListen = spyOn(input, 'listenToValueChanges_').and.returnValue(mockDisposable);

      const value = 'value';
      spyOn(input, 'getInputElValue_').and.returnValue(value);

      await input.onHostCreated_();
      assert(await Graph.get($inputValue, Graph.getTimestamp(), input)).to.equal(value);
      assert(input['getInputElValue_']).to.haveBeenCalledWith(inputEl);

      await inputValueProvider('other', input);

      assert(input['listenToValueChanges_']).to.haveBeenCalledWith(inputEl, Matchers.anyFunction());
      await spyListen.calls.argsFor(0)[1]();
      assert(await Graph.get($inputValue, Graph.getTimestamp(), input)).to.equal(value);
    });
  });

  describe('onValueChange_', () => {
    it(`should update the value on the element and dispatch the change event`, async () => {
      const inValue = 'inValue';
      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);

      spyOn(input, 'setInputElValue_');

      spyOn(Persona, 'getValue').and.returnValue(inValue);

      await input.onValueChange_();
      assert(input['setInputElValue_']).to.haveBeenCalledWith(inputEl, inValue);
      assert(Persona.getValue).to.haveBeenCalledWith($.host.value, input);
    });
  });

  describe('renderValue_', () => {
    it(`should render correctly and dispatches the correct event`, async () => {
      const mockDispatcher = jasmine.createSpy('Dispatcher');
      const value = 'value';

      assert(await input.renderValue_(mockDispatcher, value)).to.equal(value);
      assert(mockDispatcher).to.haveBeenCalledWith('change', null);
    });
  });
});
