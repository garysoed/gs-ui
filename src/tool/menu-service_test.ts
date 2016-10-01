import {TestBase} from '../test-base';
TestBase.setup();

import {AnchorLocation} from './anchor-location';
import {Anchors} from './anchors';
import {Interval} from '../../external/gs_tools/src/async';
import {ListenableDom} from '../../external/gs_tools/src/event';
import {MenuContainer} from './menu-container';
import {MenuService} from './menu-service';
import {Mocks} from '../../external/gs_tools/src/mock';
import {TestDispose} from '../../external/gs_tools/src/testing';


describe('tool.MenuService', () => {
  let mockDocument;
  let service;
  let window;

  beforeEach(() => {
    mockDocument = jasmine.createSpyObj('Document', ['createElement', 'querySelector']);
    window = Mocks.object('window');
    service = new MenuService(mockDocument, window);
    TestDispose.add(service);
  });

  describe('getMenuContainerEl_', () => {
    it('should create the menu container element correctly', () => {
      mockDocument.querySelector.and.returnValue(null);

      let menuContainerEl = Mocks.object('menuContainerEl');
      mockDocument.createElement.and.returnValue(menuContainerEl);

      let mockBody = jasmine.createSpyObj('Body', ['appendChild']);
      mockDocument.body = mockBody;

      let listenableContainer = Mocks.disposable('listenableContainer');
      spyOn(ListenableDom, 'of').and.returnValue(listenableContainer);

      expect(service['getMenuContainerEl_']()).toEqual(listenableContainer);
      expect(ListenableDom.of).toHaveBeenCalledWith(menuContainerEl);
      expect(mockBody.appendChild).toHaveBeenCalledWith(menuContainerEl);
      expect(mockDocument.createElement).toHaveBeenCalledWith('gs-menu-container');
      expect(mockDocument.querySelector).toHaveBeenCalledWith('gs-menu-container');
    });

    it('should grab the menu container element if one already exists', () => {
      let menuContainerEl = Mocks.object('menuContainerEl');
      mockDocument.querySelector.and.returnValue(menuContainerEl);

      let mockBody = jasmine.createSpyObj('Body', ['appendChild']);
      mockDocument.body = mockBody;

      let listenableContainer = Mocks.disposable('listenableContainer');
      spyOn(ListenableDom, 'of').and.returnValue(listenableContainer);

      expect(service['getMenuContainerEl_']()).toEqual(listenableContainer);
      expect(ListenableDom.of).toHaveBeenCalledWith(menuContainerEl);
      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockDocument.querySelector).toHaveBeenCalledWith('gs-menu-container');
    });

    it('should return the existing menu container element', () => {
      let listenableContainer = Mocks.disposable('listenableContainer');
      TestDispose.add(listenableContainer);
      service['menuContainerEl_'] = listenableContainer;

      expect(service['getMenuContainerEl_']()).toEqual(listenableContainer);
      expect(mockDocument.querySelector).not.toHaveBeenCalled();
    });
  });

  describe('onTick_', () => {
    it('should set the anchor target', () => {
      let menuContainerEl = Mocks.object('menuContainerEl');
      let anchorTarget = Mocks.object('anchorTarget');
      let anchorElement = Mocks.object('anchorElement');

      spyOn(service, 'setAnchorTarget_');

      service['onTick_'](menuContainerEl, anchorTarget, anchorElement);

      expect(service['setAnchorTarget_'])
          .toHaveBeenCalledWith(menuContainerEl, anchorTarget, anchorElement);
    });
  });

  describe('setAnchorTarget_', () => {
    let mockParentElement;

    beforeEach(() => {
      mockParentElement = jasmine.createSpyObj('ParentElement', ['getBoundingClientRect']);
    });

    it('should set the correct X and Y for TOP_LEFT', () => {
      let menuContainerEl = Mocks.object('menuContainerEl');
      let left = 12;
      let top = 34;

      mockParentElement.getBoundingClientRect.and.returnValue({
        left: left,
        top: top,
      });

      service['setAnchorTarget_'](
          menuContainerEl,
          AnchorLocation.TOP_LEFT,
          mockParentElement);

      expect(menuContainerEl['gsAnchorTargetX']).toEqual(left);
      expect(menuContainerEl['gsAnchorTargetY']).toEqual(top);
    });

    it('should set the correct X and Y for TOP_RIGHT', () => {
      let menuContainerEl = Mocks.object('menuContainerEl');
      let left = 12;
      let top = 34;
      let width = 56;

      mockParentElement.getBoundingClientRect.and.returnValue({
        left: left,
        top: top,
        width: width,
      });

      service['setAnchorTarget_'](
          menuContainerEl,
          AnchorLocation.TOP_RIGHT,
          mockParentElement);

      expect(menuContainerEl['gsAnchorTargetX']).toEqual(68);
      expect(menuContainerEl['gsAnchorTargetY']).toEqual(top);
    });

    it('should set the correct X and Y for BOTTOM_RIGHT', () => {
      let menuContainerEl = Mocks.object('menuContainerEl');
      let left = 12;
      let top = 34;
      let width = 56;
      let height = 78;

      mockParentElement.getBoundingClientRect.and.returnValue({
        height: height,
        left: left,
        top: top,
        width: width,
      });

      service['setAnchorTarget_'](
          menuContainerEl,
          AnchorLocation.BOTTOM_RIGHT,
          mockParentElement);

      expect(menuContainerEl['gsAnchorTargetX']).toEqual(68);
      expect(menuContainerEl['gsAnchorTargetY']).toEqual(112);
    });

    it('should set the correct X and T for BOTTOM_LEFT', () => {
      let menuContainerEl = Mocks.object('menuContainerEl');
      let left = 12;
      let top = 34;
      let height = 78;

      mockParentElement.getBoundingClientRect.and.returnValue({
        height: height,
        left: left,
        top: top,
      });

      service['setAnchorTarget_'](
          menuContainerEl,
          AnchorLocation.BOTTOM_LEFT,
          mockParentElement);

      expect(menuContainerEl['gsAnchorTargetX']).toEqual(left);
      expect(menuContainerEl['gsAnchorTargetY']).toEqual(112);
    });

    it('should resolve auto location if the anchor target is AUTO', () => {
      let menuContainerEl = Mocks.object('menuContainerEl');
      let left = 12;
      let top = 34;
      let width = 56;
      let height = 78;

      mockParentElement.getBoundingClientRect.and.returnValue({
        height: height,
        left: left,
        top: top,
        width: width,
      });

      spyOn(Anchors, 'resolveAutoLocation').and.returnValue(AnchorLocation.TOP_LEFT);

      service['setAnchorTarget_'](
          menuContainerEl,
          AnchorLocation.AUTO,
          mockParentElement);

      expect(menuContainerEl['gsAnchorTargetX']).toEqual(left);
      expect(menuContainerEl['gsAnchorTargetY']).toEqual(top);
      expect(Anchors.resolveAutoLocation).toHaveBeenCalledWith(40, 73, window);
    });
  });

  describe('hideMenu', () => {
    it('should hide the menu container', () => {
      let mockMenuContainer = jasmine.createSpyObj('MenuContainer', ['hide']);
      spyOn(service, 'getMenuContainerEl_').and
          .returnValue({getEventTarget: () => mockMenuContainer});
      service.hideMenu();
      expect(mockMenuContainer.hide).toHaveBeenCalledWith();
    });
  });

  describe('showMenu', () => {
    let anchorElement;
    let mockMenu;

    beforeEach(() => {
      mockMenu = jasmine.createSpyObj('Menu', ['appendChild', 'querySelector']);
      anchorElement = Mocks.object('anchorElement');
    });

    it('should open the menu container correctly', (done: any) => {
      let menuContent = Mocks.object('menuContent');
      mockMenu.querySelector.and.returnValue(menuContent);

      let anchorTarget = AnchorLocation.TOP_LEFT;
      let anchorPoint = AnchorLocation.BOTTOM_RIGHT;

      let mockMenuContainerEl = jasmine.createSpyObj(
          'MenuContainerEl',
          ['appendChild', 'show']);
      let mockListenableMenuContainer = jasmine.createSpyObj(
          'ListenableMenuContainer',
          ['getEventTarget', 'once']);
      mockListenableMenuContainer.getEventTarget.and.returnValue(mockMenuContainerEl);
      mockListenableMenuContainer.once.and
          .callFake((eventType: any, handler: () => void, useCapture: any) => {
            handler();
            return Mocks.disposable('ListenableMenuContainer.once');
          });
      spyOn(service, 'getMenuContainerEl_').and.returnValue(mockListenableMenuContainer);

      let mockAnchorTargetWatcher = jasmine
          .createSpyObj('AnchorTargetWatcher', ['dispose', 'on', 'start']);
      spyOn(Interval, 'newInstance').and.returnValue(mockAnchorTargetWatcher);

      spyOn(service, 'onTick_');
      spyOn(service, 'setAnchorTarget_');

      service.showMenu(mockMenu, anchorElement, anchorTarget, anchorPoint)
          .then(() => {
            expect(mockMenu.appendChild).toHaveBeenCalledWith(menuContent);
            expect(mockAnchorTargetWatcher.dispose).toHaveBeenCalledWith();

            expect(mockMenuContainerEl.show).toHaveBeenCalledWith();
            expect(mockListenableMenuContainer.once).toHaveBeenCalledWith(
                MenuContainer.HIDE_EVENT,
                jasmine.any(Function),
                false);

            expect(service['setAnchorTarget_'])
                .toHaveBeenCalledWith(mockMenuContainerEl, anchorTarget, anchorElement);
            expect(mockMenuContainerEl['gsAnchorPoint']).toEqual(anchorPoint);
            expect(mockMenuContainerEl.appendChild).toHaveBeenCalledWith(menuContent);

            expect(mockAnchorTargetWatcher.start).toHaveBeenCalledWith();
            expect(mockAnchorTargetWatcher.on).toHaveBeenCalledWith(
                Interval.TICK_EVENT,
                jasmine.any(Function));
            mockAnchorTargetWatcher.on.calls.argsFor(0)[1]();
            expect(service['onTick_'])
                .toHaveBeenCalledWith(mockMenuContainerEl, anchorTarget, anchorElement);

            expect(Interval.newInstance)
                .toHaveBeenCalledWith(MenuService['ANCHOR_TARGET_INTERVAL_']);

            expect(mockMenu.querySelector).toHaveBeenCalledWith('[gs-content]');
            done();
          }, done.fail);
    });

    it('should do nothing if there is no menu content', (done: any) => {
      mockMenu.querySelector.and.returnValue(null);

      let mockMenuContainerEl = jasmine.createSpyObj('MenuContainerEl', ['appendChild', 'show']);
      spyOn(service, 'getMenuContainerEl_').and.returnValue({eventTarget: mockMenuContainerEl});
      service
          .showMenu(
              mockMenu,
              anchorElement,
              AnchorLocation.TOP_LEFT,
              AnchorLocation.BOTTOM_RIGHT)
          .then(() => {
            expect(mockMenuContainerEl.show).not.toHaveBeenCalled();
            done();
          }, done.fail);
    });
  });
});
