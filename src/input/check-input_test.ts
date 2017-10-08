import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { ListenableDom } from 'external/gs_tools/src/event';
import { Graph } from 'external/gs_tools/src/graph';

import { CheckInput, CheckState } from '../input';
import { $ } from '../input/check-input';

describe('input.CheckInput', () => {
  let input: CheckInput;

  beforeEach(() => {
    input = new CheckInput(Mocks.object('ThemeService'));
    TestDispose.add(input);
  });

  describe('getInput_', () => {
    it(`should resolve with the correct input element`, async () => {
      const time = Mocks.object('time');
      const inputEl = document.createElement('input');
      spyOn(Graph, 'get').and.returnValue(Promise.resolve(inputEl));

      await assert(input['getInputEl_'](time)).to.resolveWith(inputEl);
      assert(Graph.get).to.haveBeenCalledWith($.input.el.getId(), time, input);
    });
  });

  describe('getInputElValue_', () => {
    it(`should return CHECKED if the input is checked`, () => {
      const inputEl = document.createElement('input');
      inputEl.indeterminate = false;
      inputEl.checked = true;

      assert(input['getInputElValue_'](inputEl)).to.equal(CheckState.CHECKED);
    });

    it(`should return UNCHECKED if the input is not checked`, () => {
      const inputEl = document.createElement('input');
      inputEl.indeterminate = false;
      inputEl.checked = false;

      assert(input['getInputElValue_'](inputEl)).to.equal(CheckState.UNCHECKED);
    });

    it(`should return INDETERMINATE if the input is indeterminate`, () => {
      const inputEl = document.createElement('input');
      inputEl.indeterminate = true;
      inputEl.checked = false;

      assert(input['getInputElValue_'](inputEl)).to.equal(CheckState.INDETERMINATE);
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
    it(`should set the input to checked if CHECKED`, () => {
      const inputEl = document.createElement('input');

      input['setInputElValue_'](inputEl, CheckState.CHECKED);
      assert(inputEl.checked).to.beTrue();
      assert(inputEl.indeterminate).to.beFalse();
    });

    it(`should set the input to unchecked if UNCHECKED`, () => {
      const inputEl = document.createElement('input');

      input['setInputElValue_'](inputEl, CheckState.UNCHECKED);
      assert(inputEl.checked).to.beFalse();
      assert(inputEl.indeterminate).to.beFalse();
    });

    it(`should set the input to indeterminate if INDETERMINATE`, () => {
      const inputEl = document.createElement('input');

      input['setInputElValue_'](inputEl, CheckState.INDETERMINATE);
      assert(inputEl.checked).to.beFalse();
      assert(inputEl.indeterminate).to.beTrue();
    });

    it(`should set the input to indeterminate if null`, () => {
      const inputEl = document.createElement('input');

      input['setInputElValue_'](inputEl, null);
      assert(inputEl.checked).to.beFalse();
      assert(inputEl.indeterminate).to.beTrue();
    });
  });
});
