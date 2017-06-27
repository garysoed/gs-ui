import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { RadioButton } from '../input/radio-button';

describe('input.RadioButton', () => {
  let mockRadioButtonService: any;
  let button: RadioButton;

  beforeEach(() => {
    mockRadioButtonService = jasmine.createSpyObj('RadioButtonService', ['setSelected']);

    button = new RadioButton(mockRadioButtonService, Mocks.object('ThemeService'));
    TestDispose.add(button);
  });

  describe('onCheckedChanged_', () => {
    it('should update the service', () => {
      const newValue = true;
      const element = Mocks.object('element');
      button.onCheckedChanged_(newValue, element, {oldValue: false});
      assert(mockRadioButtonService.setSelected).to.haveBeenCalledWith(element, newValue);
    });

    it('should do nothing if the new and old values are the same', () => {
      const newValue = true;
      const element = Mocks.object('element');
      button.onCheckedChanged_(newValue, element, {oldValue: newValue});
      assert(mockRadioButtonService.setSelected).toNot.haveBeenCalled();
    });
  });

  describe('onClick_', () => {
    it('should set itself as selected if it is not disabled', () => {
      const element = Mocks.object('element');
      button.onClick_(element, false);
      assert(mockRadioButtonService.setSelected).to.haveBeenCalledWith(element, true);
    });

    it('should do nothing if it is disabled', () => {
      button.onClick_(Mocks.object('element'), true);
      assert(mockRadioButtonService.setSelected).toNot.haveBeenCalled();
    });
  });

  describe('onGroupChanged_', () => {
    it('should update the service', () => {
      const value = true;
      const element = Mocks.object('element');
      button.onGroupChanged_(element, value);
      assert(mockRadioButtonService.setSelected).to.haveBeenCalledWith(element, value);
    });

    it('should update the service to not checked if the bridge value is null', () => {
      const element = Mocks.object('element');
      button.onGroupChanged_(element, null);
      assert(mockRadioButtonService.setSelected).to.haveBeenCalledWith(element, false);
    });
  });
});
