import { assert, Matchers, Mocks, TestBase, TestGraph } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { Disposable, ElementSelector } from 'external/gs_tools/src/interfaces';
import { StringParser } from 'external/gs_tools/src/parse';
import { TestDispose } from 'external/gs_tools/src/testing';

import { $, BaseInput } from '../input/base-input2';

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
    TestGraph.setup(Graph);
  });

  describe('onClick_', () => {
    it(`should focus on the input element and focus on it`, async () => {
      const mockInputEl = jasmine.createSpyObj('InputEl', ['focus']);
      spyOn(input, 'getInputEl_').and.returnValue(mockInputEl);

      TestGraph.set($.host.disabled.getId(), input, false);

      await input.onClick_();
      assert(mockInputEl.focus).to.haveBeenCalledWith();
    });

    it(`should do nothing if disabled`, async () => {
      const mockInputEl = jasmine.createSpyObj('InputEl', ['focus']);
      spyOn(input, 'getInputEl_').and.returnValue(mockInputEl);

      TestGraph.set($.host.disabled.getId(), input, true);

      await input.onClick_();
      assert(mockInputEl.focus).toNot.haveBeenCalled();
    });
  });

  describe('onDisabledChange_', () => {
    it(`should propagate the value to the input element`, async () => {
      const newValue = true;
      const inputEl = jasmine.createSpyObj('InputEl', ['click', 'focus']);
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);
      spyOn(input, 'setInputElDisabled_');

      TestGraph.set($.host.disabled.getId(), input, newValue);

      await input.onDisabledChange_();
      assert(input['setInputElDisabled_']).to.haveBeenCalledWith(inputEl, newValue);
    });
  });

  describe('onHostCreated_', () => {
    it(`should setup correctly`, async () => {
      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputEl_').and.returnValue(Promise.resolve(inputEl));

      const mockDisposable = jasmine.createSpyObj('Disposable', ['dispose']);
      const spyListen = spyOn(input, 'listenToValueChanges_').and.returnValue(mockDisposable);
      spyOn(Graph, 'refresh');

      await input.onHostCreated_();
      assert(input['listenToValueChanges_']).to.haveBeenCalledWith(inputEl, Matchers.anyFunction());

      spyListen.calls.argsFor(0)[1]();
      assert(Graph.refresh).to.haveBeenCalledWith($.host.outValue.getId(), input);
    });
  });

  describe('onInValueChange_', () => {
    it(`should update the value on the element and dispatch the change event`, async () => {
      const inValue = 'inValue';
      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputEl_').and.returnValue(inputEl);

      spyOn(input, 'setInputElValue_');

      TestGraph.set($.host.inValue.getId(), input, inValue);

      await input.onInValueChange_();
      assert(input['setInputElValue_']).to.haveBeenCalledWith(inputEl, inValue);
    });
  });

  describe('refreshOutValue_', () => {
    it(`should refresh the graph correctly`, () => {
      spyOn(Graph, 'refresh');

      input['refreshOutValue_']();
      assert(Graph.refresh).to.haveBeenCalledWith($.host.outValue.getId(), input);
    });
  });

  describe('renderOutValue_', () => {
    it(`should render correctly and dispatches the correct event`, async () => {
      const mockDispatcher = jasmine.createSpy('Dispatcher');
      const inputValue = 'inputValue';
      spyOn(input, 'getInputElValue_').and.returnValue(inputValue);

      const inputEl = Mocks.object('inputEl');
      spyOn(input, 'getInputEl_').and.returnValue(Promise.resolve(inputEl));

      assert(await input.renderOutValue_(mockDispatcher)).to.equal(inputValue);
      assert(mockDispatcher).to.haveBeenCalledWith('change', null);
      assert(input['getInputElValue_']).to.haveBeenCalledWith(inputEl);
    });
  });
});
