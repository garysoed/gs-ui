import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { Event } from '../const/event';

import { BaseActionElement } from './base-action-element';


describe('common.BaseActionElement', () => {
  let actionElement: BaseActionElement;

  beforeEach(() => {
    actionElement = new BaseActionElement(Mocks.object('ThemeService'));
    TestDispose.add(actionElement);
  });

  describe('onClick_', () => {
    let mockListenableElement;

    beforeEach(() => {
      mockListenableElement = jasmine.createSpyObj(
          'ListenableElement', ['dispatch', 'getEventTarget']);
    });

    it('should dispatch the ACTION event if the element is not disabled', () => {
      spyOn(actionElement, 'isDisabled').and.returnValue(false);
      spyOn(actionElement, 'getElement').and.returnValue(mockListenableElement);
      actionElement['onClick_']();

      assert(mockListenableElement.dispatch)
          .to.haveBeenCalledWith(Event.ACTION, Matchers.any(Function));
    });

    it('should do nothing if the element is disabled', () => {
      spyOn(actionElement, 'isDisabled').and.returnValue(true);
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
      const mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue('');
      spyOn(actionElement, 'getElement').and.returnValue({getEventTarget: () => mockEventTarget});
      assert(actionElement.isDisabled()).to.beTrue();
    });

    it('should return false if the element is not disabled', () => {
      const mockEventTarget = jasmine.createSpyObj('EventTarget', ['getAttribute']);
      mockEventTarget.getAttribute.and.returnValue(null);
      spyOn(actionElement, 'getElement').and.returnValue({getEventTarget: () => mockEventTarget});
      assert(actionElement.isDisabled()).to.beFalse();
    });

    it('should return true if there are no elements', () => {
      spyOn(actionElement, 'getElement').and.returnValue(null);
      assert(actionElement.isDisabled()).to.beTrue();
    });
  });
});
