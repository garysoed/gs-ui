import {TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from '../../external/gs_tools/src/mock';
import {RadioButtonService} from './radio-button-service';
import {TestDispose} from '../../external/gs_tools/src/testing';


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

      expect(mockButtonEl['gsChecked']).toEqual(true);
      expect(otherButton['gsChecked']).toEqual(false);
      expect(mockDocument.querySelector)
          .toHaveBeenCalledWith(jasmine.stringMatching(/gs-group="group"/));
      expect(mockButtonEl.getAttribute).toHaveBeenCalledWith('gs-group');
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

          expect(mockGsCheckedSetter).toHaveBeenCalledWith(true);
          expect(mockGsCheckedSetter).not.toHaveBeenCalledWith(false);
        });

    it('should not unselect the button if there are no selected buttons', () => {
      mockDocument.querySelector.and.returnValue(null);

      service.setSelected(mockButtonEl, true);

      expect(mockButtonEl['gsChecked']).toEqual(true);
    });

    it('should not unselect any buttons if the request is to unselect a button', () => {
      let otherButton = Mocks.object('otherButton');
      otherButton['gsChecked'] = true;
      mockDocument.querySelector.and.returnValue(otherButton);

      mockButtonEl.getAttribute.and.returnValue('group');

      service.setSelected(mockButtonEl, false);

      expect(mockButtonEl['gsChecked']).toEqual(false);
      expect(otherButton['gsChecked']).toEqual(true);
    });

    it('should throw error if the element name is not gs-radio-button', () => {
      let element = Mocks.object('element');
      element.nodeName = 'other';
      expect(() => {
        service.setSelected(element, true);
      }).toThrowError(/gs-radio-button/);
    });
  });
});
