import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { RadioButtonService } from './radio-button-service';


describe('input.RadioButtonService', () => {
  let mockDocument;
  let service;

  beforeEach(() => {
    mockDocument = jasmine.createSpyObj('Document', ['querySelector']);
    service = new RadioButtonService(mockDocument);
    TestDispose.add(service);
  });

  describe('setSelected', () => {
    let mockButtonEl;

    beforeEach(() => {
      mockButtonEl = jasmine.createSpyObj('ButtonEl', ['getAttribute']);
      mockButtonEl.nodeName = 'gs-radio-button';
    });

    it('should unselect any checked buttons and update the given button', () => {
      let otherButton = Mocks.object('otherButton');
      mockDocument.querySelector.and.returnValue(otherButton);

      mockButtonEl.getAttribute.and.returnValue('group');

      service.setSelected(mockButtonEl, true);

      assert(<boolean> mockButtonEl['gsChecked']).to.beTrue();
      assert(<boolean> otherButton['gsChecked']).to.beFalse();
      assert(mockDocument.querySelector)
          .to.haveBeenCalledWith(jasmine.stringMatching(/gs-group="group"/));
      assert(mockButtonEl.getAttribute).to.haveBeenCalledWith('gs-group');
    });

    it('should not unselect the button if the currently selected button is the given button',
        () => {
          let mockGsCheckedSetter = jasmine.createSpy('GsCheckedSetter');
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

      assert(<boolean> mockButtonEl['gsChecked']).to.beTrue();
    });

    it('should not unselect any buttons if the request is to unselect a button', () => {
      let otherButton = Mocks.object('otherButton');
      otherButton['gsChecked'] = true;
      mockDocument.querySelector.and.returnValue(otherButton);

      mockButtonEl.getAttribute.and.returnValue('group');

      service.setSelected(mockButtonEl, false);

      assert(<boolean> mockButtonEl['gsChecked']).to.beFalse();
      assert(<boolean> otherButton['gsChecked']).to.beTrue();
    });

    it('should throw error if the element name is not gs-radio-button', () => {
      let element = Mocks.object('element');
      element.nodeName = 'other';
      assert(() => {
        service.setSelected(element, true);
      }).to.throwError(/gs-radio-button/);
    });
  });
});
