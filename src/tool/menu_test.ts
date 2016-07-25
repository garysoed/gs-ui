import {TestBase} from '../test-base';
TestBase.setup();

import {AnchorLocation} from './anchor-location';
import {Event} from '../const/event';
import {ListenableDom} from '../../external/gs_tools/src/event';
import {Menu} from './menu';
import {Mocks} from '../../external/gs_tools/src/mock';
import {TestDispose} from '../../external/gs_tools/src/testing';


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

      menu['element_'] = {eventTarget: eventTarget};
      menu['onAction_']();

      expect(mockMenuService.showMenu)
          .toHaveBeenCalledWith(eventTarget, parentElement, anchorTarget, anchorPoint);
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

      expect(element['gsAnchorPoint']).toEqual(anchorPoint);
      expect(element['gsAnchorTarget']).toEqual(anchorTarget);

      expect(mockListenableParentElement.on)
          .toHaveBeenCalledWith(Event.ACTION, jasmine.any(Function));
      mockListenableParentElement.on.calls.argsFor(0)[1]();
      expect(menu['onAction_']).toHaveBeenCalledWith();

      expect(menu['menuRoot_']).toEqual(rootElement);
      expect(mockShadowRoot.querySelector).toHaveBeenCalledWith('.root');
      expect(menu['element_']).toEqual(mockListenableElement);
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

      expect(element['gsAnchorTarget']).toEqual(AnchorLocation.AUTO);
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

      expect(element['gsAnchorPoint']).toEqual(AnchorLocation.AUTO);
    });
  });
});
