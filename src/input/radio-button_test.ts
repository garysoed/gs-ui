import {assert, TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {BaseActionElement} from '../common/base-action-element';
import {RadioButton} from './radio-button';


describe('input.RadioButton', () => {
  let mockRadioButtonService;
  let button: RadioButton;

  beforeEach(() => {
    mockRadioButtonService = jasmine.createSpyObj('RadioButtonService', ['setSelected']);

    // Disables parent class implementations.
    spyOn(BaseActionElement.prototype, 'onClick_');
    spyOn(BaseActionElement.prototype, 'onAttributeChanged');

    button = new RadioButton(mockRadioButtonService, Mocks.object('ThemeService'));
    TestDispose.add(button);
  });

  describe('onClick_', () => {
    it('should set itself as selected if it is not disabled', () => {
      let element = Mocks.object('element');
      spyOn(button, 'isDisabled').and.returnValue(false);
      spyOn(button, 'getElement').and.returnValue({getEventTarget: () => element});

      button['onClick_']();
      assert(mockRadioButtonService.setSelected).to.haveBeenCalledWith(element, true);
    });

    it('should do nothing if it is disabled', () => {
      spyOn(button, 'isDisabled').and.returnValue(true);

      button['onClick_']();
      assert(mockRadioButtonService.setSelected).toNot.haveBeenCalled();
    });

    it('should do nothing if there is no element', () => {
      spyOn(button, 'isDisabled').and.returnValue(false);
      spyOn(button, 'getElement').and.returnValue(null);

      button['onClick_']();
      assert(mockRadioButtonService.setSelected).toNot.haveBeenCalled();
    });
  });

  describe('onGsCheckedChanged_', () => {
    it('should update the service', () => {
      let newValue = true;
      spyOn(button, 'updateService_');
      button['onGsCheckedChanged_'](newValue, false /* oldValue */);
      assert(button['updateService_']).to.haveBeenCalledWith(newValue);
    });

    it('should do nothing if the new and old values are the same', () => {
      spyOn(button, 'updateService_');
      button['onGsCheckedChanged_'](false /* newValue */, false /* oldValue */);
      assert(button['updateService_']).toNot.haveBeenCalled();
    });
  });

  describe('onGsGroupChanged_', () => {
    it('should update the service', () => {
      let value = true;
      spyOn(button, 'updateService_');
      spyOn(button['gsCheckedBridge_'], 'get').and.returnValue(value);
      button['onGsGroupChanged_']();
      assert(button['updateService_']).to.haveBeenCalledWith(value);
    });

    it('should update the service to not checked if the bridge value is null', () => {
      spyOn(button, 'updateService_');
      spyOn(button['gsCheckedBridge_'], 'get').and.returnValue(null);
      button['onGsGroupChanged_']();
      assert(button['updateService_']).to.haveBeenCalledWith(false);
    });
  });

  describe('updateService_', () => {
    it('should call the radio button service', () => {
      let eventTarget = Mocks.object('eventTarget');
      let mockElement = jasmine.createSpyObj('Element', ['getEventTarget']);
      mockElement.getEventTarget.and.returnValue(eventTarget);
      spyOn(button, 'getElement').and.returnValue(mockElement);

      let checked = true;
      button['updateService_'](checked);
      assert(mockRadioButtonService.setSelected).to.haveBeenCalledWith(eventTarget, checked);
    });

    it('should not call the service if there are no elements', () => {
      spyOn(button, 'getElement').and.returnValue(null);

      button['updateService_'](true /* checked */);
      assert(mockRadioButtonService.setSelected).toNot.haveBeenCalled();
    });
  });
});
