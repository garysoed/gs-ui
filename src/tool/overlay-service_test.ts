import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {Interval} from 'external/gs_tools/src/async';
import {ListenableDom} from 'external/gs_tools/src/event';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {AnchorLocation} from './anchor-location';
import {Anchors} from './anchors';
import {OverlayContainer} from './menu-container';
import {OverlayService} from './overlay-service';


describe('gs.tool.OverlayService', () => {
  let mockDocument;
  let service;
  let window;

  beforeEach(() => {
    mockDocument = jasmine.createSpyObj('Document', ['createElement', 'querySelector']);
    window = Mocks.object('window');
    service = new OverlayService(mockDocument, window);
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

      assert(service['getMenuContainerEl_']()).to.equal(listenableContainer);
      assert(ListenableDom.of).to.haveBeenCalledWith(menuContainerEl);
      assert(mockBody.appendChild).to.haveBeenCalledWith(menuContainerEl);
      assert(mockDocument.createElement).to.haveBeenCalledWith('gs-overlay-container');
      assert(mockDocument.querySelector).to.haveBeenCalledWith('gs-overlay-container');
    });

    it('should grab the menu container element if one already exists', () => {
      let menuContainerEl = Mocks.object('menuContainerEl');
      mockDocument.querySelector.and.returnValue(menuContainerEl);

      let mockBody = jasmine.createSpyObj('Body', ['appendChild']);
      mockDocument.body = mockBody;

      let listenableContainer = Mocks.disposable('listenableContainer');
      spyOn(ListenableDom, 'of').and.returnValue(listenableContainer);

      assert(service['getMenuContainerEl_']()).to.equal(listenableContainer);
      assert(ListenableDom.of).to.haveBeenCalledWith(menuContainerEl);
      assert(mockDocument.createElement).toNot.haveBeenCalled();
      assert(mockDocument.querySelector).to.haveBeenCalledWith('gs-overlay-container');
    });

    it('should return the existing menu container element', () => {
      let listenableContainer = Mocks.disposable('listenableContainer');
      TestDispose.add(listenableContainer);
      service['menuContainerEl_'] = listenableContainer;

      assert(service['getMenuContainerEl_']()).to.equal(listenableContainer);
      assert(mockDocument.querySelector).toNot.haveBeenCalled();
    });
  });

  describe('onTick_', () => {
    it('should set the anchor target', () => {
      let menuContainerEl = Mocks.object('menuContainerEl');
      let anchorTarget = Mocks.object('anchorTarget');
      let anchorElement = Mocks.object('anchorElement');

      spyOn(service, 'setAnchorTarget_');

      service['onTick_'](menuContainerEl, anchorTarget, anchorElement);

      assert(service['setAnchorTarget_'])
          .to.haveBeenCalledWith(menuContainerEl, anchorTarget, anchorElement);
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

      assert(menuContainerEl['gsAnchorTargetX']).to.equal(left);
      assert(menuContainerEl['gsAnchorTargetY']).to.equal(top);
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

      assert(menuContainerEl['gsAnchorTargetX']).to.equal(68);
      assert(menuContainerEl['gsAnchorTargetY']).to.equal(top);
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

      assert(menuContainerEl['gsAnchorTargetX']).to.equal(68);
      assert(menuContainerEl['gsAnchorTargetY']).to.equal(112);
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

      assert(menuContainerEl['gsAnchorTargetX']).to.equal(left);
      assert(menuContainerEl['gsAnchorTargetY']).to.equal(112);
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

      assert(menuContainerEl['gsAnchorTargetX']).to.equal(left);
      assert(menuContainerEl['gsAnchorTargetY']).to.equal(top);
      assert(Anchors.resolveAutoLocation).to.haveBeenCalledWith(40, 73, window);
    });
  });

  describe('hideMenu', () => {
    it('should hide the menu container', () => {
      let mockMenuContainer = jasmine.createSpyObj('MenuContainer', ['hide']);
      spyOn(service, 'getMenuContainerEl_').and
          .returnValue({getEventTarget: () => mockMenuContainer});
      service.hideMenu();
      assert(mockMenuContainer.hide).to.haveBeenCalledWith();
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
            assert(mockMenu.appendChild).to.haveBeenCalledWith(menuContent);
            assert(mockAnchorTargetWatcher.dispose).to.haveBeenCalledWith();

            assert(mockMenuContainerEl.show).to.haveBeenCalledWith();
            assert(mockListenableMenuContainer.once).to.haveBeenCalledWith(
                OverlayContainer.HIDE_EVENT,
                Matchers.any(Function),
                false);

            assert(service['setAnchorTarget_'])
                .to.haveBeenCalledWith(mockMenuContainerEl, anchorTarget, anchorElement);
            assert(mockMenuContainerEl['gsAnchorPoint']).to.equal(anchorPoint);
            assert(mockMenuContainerEl.appendChild).to.haveBeenCalledWith(menuContent);

            assert(mockAnchorTargetWatcher.start).to.haveBeenCalledWith();
            assert(mockAnchorTargetWatcher.on).to.haveBeenCalledWith(
                Interval.TICK_EVENT,
                Matchers.any(Function),
                service);
            mockAnchorTargetWatcher.on.calls.argsFor(0)[1]();
            assert(service['onTick_'])
                .to.haveBeenCalledWith(mockMenuContainerEl, anchorTarget, anchorElement);

            assert(Interval.newInstance)
                .to.haveBeenCalledWith(OverlayService['ANCHOR_TARGET_INTERVAL_']);

            assert(mockMenu.querySelector).to.haveBeenCalledWith('[gs-content]');
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
            assert(mockMenuContainerEl.show).toNot.haveBeenCalled();
            done();
          }, done.fail);
    });
  });
});
