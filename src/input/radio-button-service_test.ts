import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { RadioButtonService } from './radio-button-service';


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
      mockButtonEl = jasmine.createSpyObj('ButtonEl', ['getAttribute']);
      mockButtonEl.nodeName = 'gs-radio-button';
    });

    it('should unselect any checked buttons and update the given button', () => {
      const otherButton = Mocks.object('otherButton');
      mockDocument.querySelector.and.returnValue(otherButton);

      mockButtonEl.getAttribute.and.returnValue('group');

      service.setSelected(mockButtonEl, true);

      assert(mockButtonEl['gsChecked'] as boolean).to.beTrue();
      assert(otherButton['gsChecked'] as boolean).to.beFalse();
      assert(mockDocument.querySelector)
          .to.haveBeenCalledWith(jasmine.stringMatching(/gs-group="group"/));
      assert(mockButtonEl.getAttribute).to.haveBeenCalledWith('gs-group');
    });

    it('should not unselect the button if the currently selected button is the given button',
        () => {
          const mockGsCheckedSetter = jasmine.createSpy('GsCheckedSetter');
          Object.defineProperty(mockButtonEl, 'gsChecked', {
            get: () => {},
            set: mockGsCheckedSetter,
          });
          mockDocument.querySelector.and.returnValue(mockButtonEl);

          service.setSelected(mockButtonEl, true);

          assert(mockGsCheckedSetter).to.haveBeenCalledWith(true);
          assert(mockGsCheckedSetter).toNot.haveBeenCalledWith(false);
        });

    it('should not unselect the button if there are no selected buttons', () => {
      mockDocument.querySelector.and.returnValue(null);

      service.setSelected(mockButtonEl, true);

      assert(mockButtonEl['gsChecked'] as boolean).to.beTrue();
    });

    it('should not unselect any buttons if the request is to unselect a button', () => {
      const otherButton = Mocks.object('otherButton');
      otherButton['gsChecked'] = true;
      mockDocument.querySelector.and.returnValue(otherButton);

      mockButtonEl.getAttribute.and.returnValue('group');

      service.setSelected(mockButtonEl, false);

      assert(mockButtonEl['gsChecked'] as boolean).to.beFalse();
      assert(otherButton['gsChecked'] as boolean).to.beTrue();
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
