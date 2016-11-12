import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {DomEvent, ListenableDom} from 'external/gs_tools/src/event';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {BaseActionElement} from './base-action-element';
import {Event} from '../const/event';


describe('common.BaseActionElement', () => {
  let actionElement: BaseActionElement;

  beforeEach(() => {
    actionElement = new BaseActionElement();
    TestDispose.add(actionElement);
  });

  describe('onClick_', () => {
    let mockListenableElement;

    beforeEach(() => {
      mockListenableElement = jasmine.createSpyObj(
          'ListenableElement', ['dispatch', 'getEventTarget']);
    });

    it('should dispatch the ACTION vent if the element is not disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue(null);
      mockListenableElement.eventTarget = mockEventTarget;

      spyOn(actionElement, 'isDisabled').and.returnValue(false);
      spyOn(actionElement, 'getElement').and.returnValue(mockListenableElement);
      actionElement['onClick_']();

      assert(mockListenableElement.dispatch)
          .to.haveBeenCalledWith(Event.ACTION, Matchers.any(Function));
    });

    it('should do nothing if the element is disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue('');
      mockListenableElement.getEventTarget.and.returnValue(mockEventTarget);

      spyOn(actionElement, 'getElement').and.returnValue(mockListenableElement);
      actionElement['onClick_']();

      assert(mockListenableElement.dispatch).toNot.haveBeenCalled();
    });

    it('should do nothing if the element is not available', () => {
      spyOn(actionElement, 'isDisabled').and.returnValue(false);
      spyOn(actionElement, 'getElement').and.returnValue(null);
      actionElement['onClick_']();

      assert(mockListenableElement.dispatch).toNot.haveBeenCalled();
    });
  });

  describe('isDisabled', () => {
    it('should return true if the element is disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue('');
      spyOn(actionElement, 'getElement').and.returnValue({getEventTarget: () => mockEventTarget});
      assert(actionElement.isDisabled()).to.beTrue();
    });

    it('should return false if the element is not disabled', () => {
      let mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue(null);
      spyOn(actionElement, 'getElement').and.returnValue({getEventTarget: () => mockEventTarget});
      assert(actionElement.isDisabled()).to.beFalse();
    });

    it('should return true if there are no elements', () => {
      spyOn(actionElement, 'getElement').and.returnValue(null);
      assert(actionElement.isDisabled()).to.beTrue();
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

      assert(mockListenableDom.on).to.haveBeenCalledWith(DomEvent.CLICK, Matchers.any(Function));

      mockListenableDom.on.calls.argsFor(0)[1]();
      assert(actionElement['onClick_']).to.haveBeenCalledWith();

      assert(mockClassList.add).to.haveBeenCalledWith('gs-action');
    });
  });
});
