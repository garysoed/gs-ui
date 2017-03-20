import {assert, TestBase} from '../test-base';
TestBase.setup();

import {ListenableDom} from 'external/gs_tools/src/event';
import {Fakes, Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {Event} from '../const/event';

import {AnchorLocation} from './anchor-location';
import {Menu} from './menu';


describe('tool.Menu', () => {
  let menu;
  let mockMenuService;

  beforeEach(() => {
    mockMenuService = jasmine.createSpyObj('MenuService', ['showOverlay']);
    menu = new Menu(mockMenuService);
    TestDispose.add(menu);
  });

  describe('onAction_', () => {
    it('should call the menu service correctly', () => {
      const parentWidth = 123;
      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = parentWidth;
      spyOn(menu['gsFitParentWidthHook_'], 'get').and.returnValue(true);

      const anchorPoint = AnchorLocation.BOTTOM_LEFT;
      const anchorTarget = AnchorLocation.TOP_RIGHT;

      const menuContentStyle = Mocks.object('menuContentStyle');
      const menuContent = Mocks.object('menuContent');
      menuContent.style = menuContentStyle;

      const mockEventTarget = jasmine.createSpyObj('EventTarget', ['querySelector']);
      mockEventTarget.querySelector.and.returnValue(menuContent);
      mockEventTarget.parentElement = parentElement;
      mockEventTarget['gsAnchorPoint'] = anchorPoint;
      mockEventTarget['gsAnchorTarget'] = anchorTarget;

      menu['element_'] = {getEventTarget: () => mockEventTarget};
      menu['onAction_']();

      assert(mockMenuService.showOverlay).to.haveBeenCalledWith(
          mockEventTarget,
          menuContent,
          parentElement,
          anchorTarget,
          anchorPoint);
      assert(mockEventTarget.querySelector).to.haveBeenCalledWith('[gs-content]');
      assert(menuContentStyle.width).to.equal(`${parentWidth}px`);
    });

    it('should not set the width to the parent element if fit-parent-width is not set', () => {
      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = 123;
      spyOn(menu['gsFitParentWidthHook_'], 'get').and.returnValue(false);

      const menuContentStyle = Mocks.object('menuContentStyle');
      const menuContent = Mocks.object('menuContent');
      menuContent.style = menuContentStyle;

      const mockEventTarget = jasmine.createSpyObj('EventTarget', ['querySelector']);
      mockEventTarget.querySelector.and.returnValue(menuContent);
      mockEventTarget.parentElement = parentElement;
      mockEventTarget['gsAnchorPoint'] = AnchorLocation.BOTTOM_LEFT;
      mockEventTarget['gsAnchorTarget'] = AnchorLocation.TOP_RIGHT;

      menu['element_'] = {getEventTarget: () => mockEventTarget};
      menu['onAction_']();

      assert(menuContentStyle.width).toNot.beDefined();
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
      const anchorPoint = AnchorLocation.BOTTOM_LEFT;
      const anchorTarget = AnchorLocation.TOP_RIGHT;
      element['gsAnchorTarget'] = anchorTarget;
      element['gsAnchorPoint'] = anchorPoint;

      const mockListenableElement = Mocks.disposable('ListenableElement');

      const parentElement = Mocks.object('parentElement');
      element.parentElement = parentElement;
      const mockListenableParentElement =
          jasmine.createSpyObj('ListenableParentElement', ['dispose', 'on']);
      mockListenableParentElement.on.and
          .returnValue(Mocks.disposable('ListenableParentElement.on'));

      Fakes.build(spyOn(ListenableDom, 'of'))
          .when(element).return(mockListenableElement)
          .when(parentElement).return(mockListenableParentElement);

      const rootElement = Mocks.object('rootElement');
      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
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
      const parentElement = Mocks.object('parentElement');
      element.parentElement = parentElement;
      const mockListenableParentElement =
          jasmine.createSpyObj('ListenableParentElement', ['dispose', 'on']);
      mockListenableParentElement.on.and
          .returnValue(Mocks.disposable('ListenableParentElement.on'));

      Fakes.build(spyOn(ListenableDom, 'of'))
          .when(element).return(Mocks.disposable('ListenableElement'))
          .when(parentElement).return(mockListenableParentElement);

      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(Mocks.object('rootElement'));
      element.shadowRoot = mockShadowRoot;

      spyOn(menu, 'onAction_');

      menu.onCreated(element);

      assert(element['gsAnchorTarget']).to.equal(AnchorLocation.AUTO);
    });

    it('should default the anchor point to AUTO', () => {
      const parentElement = Mocks.object('parentElement');
      element.parentElement = parentElement;
      const mockListenableParentElement =
          jasmine.createSpyObj('ListenableParentElement', ['dispose', 'on']);
      mockListenableParentElement.on.and
          .returnValue(Mocks.disposable('ListenableParentElement.on'));

      Fakes.build(spyOn(ListenableDom, 'of'))
          .when(element).return(Mocks.disposable('ListenableElement'))
          .when(parentElement).return(mockListenableParentElement);

      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(Mocks.object('rootElement'));
      element.shadowRoot = mockShadowRoot;

      spyOn(menu, 'onAction_');

      menu.onCreated(element);

      assert(element['gsAnchorPoint']).to.equal(AnchorLocation.AUTO);
    });
  });
});
