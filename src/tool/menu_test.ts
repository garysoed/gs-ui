import {assert, TestBase} from '../test-base';
TestBase.setup();

import {ListenableDom} from 'external/gs_tools/src/event';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {AnchorLocation} from './anchor-location';
import {Event} from '../const/event';
import {Menu} from './menu';


describe('tool.Menu', () => {
  let menu;
  let mockMenuService;

  beforeEach(() => {
    mockMenuService = jasmine.createSpyObj('MenuService', ['showMenu']);
    menu = new Menu(mockMenuService);
    TestDispose.add(menu);
  });

  describe('onAction_', () => {
    it('should call the menu service correctly', () => {
      let parentElement = Mocks.object('parentElement');
      let anchorPoint = AnchorLocation.BOTTOM_LEFT;
      let anchorTarget = AnchorLocation.TOP_RIGHT;
      let eventTarget = Mocks.object('eventTarget');
      eventTarget.parentElement = parentElement;
      eventTarget['gsAnchorPoint'] = anchorPoint;
      eventTarget['gsAnchorTarget'] = anchorTarget;

      menu['element_'] = {getEventTarget: () => eventTarget};
      menu['onAction_']();

      assert(mockMenuService.showMenu)
          .to.haveBeenCalledWith(eventTarget, parentElement, anchorTarget, anchorPoint);
    });

    it('should not throw error if there are no elements', () => {
      menu['element_'] = null;

      assert(() => {
        menu['onAction_']();
      }).toNot.throw();
    });
  });

  describe('onCreated', () => {
    let element;

    beforeEach(() => {
      element = Mocks.object('element');
    });

    it('should initialize correctly', () => {
      let anchorPoint = AnchorLocation.BOTTOM_LEFT;
      let anchorTarget = AnchorLocation.TOP_RIGHT;
      element['gsAnchorTarget'] = anchorTarget;
      element['gsAnchorPoint'] = anchorPoint;

      let mockListenableElement = Mocks.disposable('ListenableElement');

      let parentElement = Mocks.object('parentElement');
      element.parentElement = parentElement;
      let mockListenableParentElement =
          jasmine.createSpyObj('ListenableParentElement', ['dispose', 'on']);
      mockListenableParentElement.on.and
          .returnValue(Mocks.disposable('ListenableParentElement.on'));

      spyOn(ListenableDom, 'of').and.callFake((eventTarget: any) => {
        switch (eventTarget) {
          case element:
            return mockListenableElement;
          case parentElement:
            return mockListenableParentElement;
        }
      });

      let rootElement = Mocks.object('rootElement');
      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(rootElement);
      element.shadowRoot = mockShadowRoot;

      spyOn(menu, 'onAction_');

      menu.onCreated(element);

      assert(element['gsAnchorPoint']).to.equal(anchorPoint);
      assert(element['gsAnchorTarget']).to.equal(anchorTarget);

      assert(mockListenableParentElement.on)
          .to.haveBeenCalledWith(Event.ACTION, menu['onAction_'], menu);

      assert(menu['menuRoot_']).to.equal(rootElement);
      assert(mockShadowRoot.querySelector).to.haveBeenCalledWith('.root');
      assert(menu['element_']).to.equal(mockListenableElement);
    });

    it('should default the anchor target to AUTO', () => {
      let parentElement = Mocks.object('parentElement');
      element.parentElement = parentElement;
      let mockListenableParentElement =
          jasmine.createSpyObj('ListenableParentElement', ['dispose', 'on']);
      mockListenableParentElement.on.and
          .returnValue(Mocks.disposable('ListenableParentElement.on'));

      spyOn(ListenableDom, 'of').and.callFake((eventTarget: any) => {
        switch (eventTarget) {
          case element:
            return Mocks.disposable('ListenableElement');
          case parentElement:
            return mockListenableParentElement;
        }
      });

      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(Mocks.object('rootElement'));
      element.shadowRoot = mockShadowRoot;

      spyOn(menu, 'onAction_');

      menu.onCreated(element);

      assert(element['gsAnchorTarget']).to.equal(AnchorLocation.AUTO);
    });

    it('should default the anchor point to AUTO', () => {
      let parentElement = Mocks.object('parentElement');
      element.parentElement = parentElement;
      let mockListenableParentElement =
          jasmine.createSpyObj('ListenableParentElement', ['dispose', 'on']);
      mockListenableParentElement.on.and
          .returnValue(Mocks.disposable('ListenableParentElement.on'));

      spyOn(ListenableDom, 'of').and.callFake((eventTarget: any) => {
        switch (eventTarget) {
          case element:
            return Mocks.disposable('ListenableElement');
          case parentElement:
            return mockListenableParentElement;
        }
      });

      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(Mocks.object('rootElement'));
      element.shadowRoot = mockShadowRoot;

      spyOn(menu, 'onAction_');

      menu.onCreated(element);

      assert(element['gsAnchorPoint']).to.equal(AnchorLocation.AUTO);
    });
  });
});
