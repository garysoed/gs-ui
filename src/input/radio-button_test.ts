import {TestBase} from '../test-base';
TestBase.setup();

import {BaseActionElement} from '../common/base-action-element';
import {Mocks} from '../../external/gs_tools/src/mock';
import {RadioButton} from './radio-button';
import {TestDispose} from '../../external/gs_tools/src/testing';


describe('input.RadioButton', () => {
  let mockRadioButtonService;
  let button;

  beforeEach(() => {
    mockRadioButtonService = jasmine.createSpyObj('RadioButtonService', ['setSelected']);

    // Disables parent class implementations.
    spyOn(BaseActionElement.prototype, 'onClick_');
    spyOn(BaseActionElement.prototype, 'onAttributeChanged');

    button = new RadioButton(mockRadioButtonService);
    TestDispose.add(button);
  });

  describe('onClick_', () => {
    it('should set itself as selected if it is not disabled', () => {
      let element = Mocks.object('element');
      Mocks.getter(button, 'isDisabled', false);
      Mocks.getter(button, 'element', {eventTarget: element});

      button['onClick_']();
      expect(mockRadioButtonService.setSelected).toHaveBeenCalledWith(element, true);
    });

    it('should do nothing if it is disabled', () => {
      Mocks.getter(button, 'isDisabled', true);

      button['onClick_']();
      expect(mockRadioButtonService.setSelected).not.toHaveBeenCalled();
    });
  });

  describe('onAttributeChanged', () => {
    it('should call radio button service if the group is changed', () => {
      let checked = true;
      let element = Mocks.object('element');
      element['gsChecked'] = checked;

      Mocks.getter(button, 'element', {eventTarget: element});

      button.onAttributeChanged('gs-group');

      expect(mockRadioButtonService.setSelected).toHaveBeenCalledWith(element, checked);
    });

    it('should call radio button service if the checked state is changed', () => {
      let checked = true;
      let element = Mocks.object('element');
      element['gsChecked'] = checked;

      Mocks.getter(button, 'element', {eventTarget: element});

      button.onAttributeChanged('gs-checked');

      expect(mockRadioButtonService.setSelected).toHaveBeenCalledWith(element, checked);
    });

    it('should do nothing if other attributes changed', () => {
      button.onAttributeChanged('other');

      expect(mockRadioButtonService.setSelected).not.toHaveBeenCalled();
    });
  });
});
