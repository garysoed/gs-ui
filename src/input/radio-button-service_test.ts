import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { RadioButtonService } from '../input/radio-button-service';

describe('input.RadioButtonService', () => {
  let mockDocument: any;
  let service: RadioButtonService;

  beforeEach(() => {
    mockDocument = jasmine.createSpyObj('Document', ['querySelector']);
    service = new RadioButtonService(mockDocument);
    TestDispose.add(service);
  });

  describe('setSelected', () => {
    let mockButtonEl: any;

    beforeEach(() => {
      mockButtonEl = jasmine.createSpyObj('ButtonEl', ['getAttribute', 'setAttribute']);
      mockButtonEl.nodeName = 'gs-radio-button';
    });

    it('should unselect any checked buttons and update the given button', () => {
      const mockOtherButton = jasmine.createSpyObj('OtherButton', ['setAttribute']);
      mockDocument.querySelector.and.returnValue(mockOtherButton);

      Fakes.build(mockButtonEl.getAttribute)
          .when('group-id').return('group')
          .when('checked').return('false');

      service.setSelected(mockButtonEl, true);

      assert(mockButtonEl.setAttribute).to.haveBeenCalledWith('checked', 'true');
      assert(mockOtherButton.setAttribute).to.haveBeenCalledWith('checked', 'false');
      assert(mockDocument.querySelector)
          .to.haveBeenCalledWith(jasmine.stringMatching(/group-id="group"/));
      assert(mockButtonEl.getAttribute).to.haveBeenCalledWith('group-id');
    });

    it('should not unselect the button if the currently selected button is the given button',
        () => {
      mockDocument.querySelector.and.returnValue(mockButtonEl);
      mockButtonEl.getAttribute.and.returnValue('false');

      service.setSelected(mockButtonEl, true);

      assert(mockButtonEl.setAttribute).to.haveBeenCalledWith('checked', 'true');
      assert(mockButtonEl.setAttribute).toNot.haveBeenCalledWith('checked', 'false');
    });

    it('should not throw errors the button if there are no selected buttons', () => {
      mockDocument.querySelector.and.returnValue(null);
      mockButtonEl.getAttribute.and.returnValue('false');

      assert(() => {
        service.setSelected(mockButtonEl, true);
      }).toNot.throw();
    });

    it('should not unselect any buttons if the request is to unselect a button', () => {
      const mockOtherButton = jasmine.createSpyObj('OtherButton', ['setAttribute']);
      mockDocument.querySelector.and.returnValue(mockOtherButton);

      Fakes.build(mockButtonEl.getAttribute)
          .when('group-id').return('group')
          .when('checked').return('true');

      service.setSelected(mockButtonEl, false);

      assert(mockButtonEl.setAttribute).to.haveBeenCalledWith('checked', 'false');
      assert(mockOtherButton.setAttribute).toNot.haveBeenCalled();
    });

    it('should throw error if the element name is not gs-radio-button', () => {
      const element = Mocks.object('element');
      element.nodeName = 'other';
      assert(() => {
        service.setSelected(element, true);
      }).to.throwError(/gs-radio-button/);
    });
  });
});
