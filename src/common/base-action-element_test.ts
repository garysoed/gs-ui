import {TestBase} from '../test-base';
TestBase.setup();

import {BaseActionElement} from './base-action-element';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';
import {Event} from '../const/event';
import {Mocks} from '../../external/gs_tools/src/mock';
import {TestDispose} from '../../external/gs_tools/src/testing';


describe('common.BaseActionElement', () => {
  let actionElement;

  beforeEach(() => {
    actionElement = new BaseActionElement();
    TestDispose.add(actionElement);
  });

  describe('onClick_', () => {
    let mockListenableElement;

    beforeEach(() => {
      mockListenableElement = jasmine.createSpyObj('ListenableElement', ['dispatch']);
    });

    it('should dispatch the ACTION vent if the element is not disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue(null);
      mockListenableElement.eventTarget = mockEventTarget;

      Mocks.getter(actionElement, 'isDisabled', false);
      Mocks.getter(actionElement, 'element', mockListenableElement);
      actionElement['onClick_']();

      expect(mockListenableElement.dispatch)
          .toHaveBeenCalledWith(Event.ACTION, jasmine.any(Function));
    });

    it('should do nothing if the element is disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue('');
      mockListenableElement.eventTarget = mockEventTarget;

      Mocks.getter(actionElement, 'element', mockListenableElement);
      actionElement['onClick_']();

      expect(mockListenableElement.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('isDisabled', () => {
    it('should return true if the element is disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue('');
      Mocks.getter(actionElement, 'element', {eventTarget: mockEventTarget});
      expect(actionElement.isDisabled).toEqual(true);
    });

    it('should return false if the element is not disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue(null);
      Mocks.getter(actionElement, 'element', {eventTarget: mockEventTarget});
      expect(actionElement.isDisabled).toEqual(false);
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      let element = Mocks.object('element');
      let mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      element.classList = mockClassList;

      let mockListenableDom = jasmine.createSpyObj('ListenableDom', ['dispose', 'on']);
      mockListenableDom.on.and.returnValue(Mocks.disposable('ListenableDom.on'));

      spyOn(ListenableDom, 'of').and.returnValue(mockListenableDom);
      spyOn(actionElement, 'onClick_');

      actionElement.onCreated(element);

      expect(mockListenableDom.on).toHaveBeenCalledWith(DomEvent.CLICK, jasmine.any(Function));

      mockListenableDom.on.calls.argsFor(0)[1]();
      expect(actionElement['onClick_']).toHaveBeenCalledWith();

      expect(mockClassList.add).toHaveBeenCalledWith('gs-action');
    });
  });
});
