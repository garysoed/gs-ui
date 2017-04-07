import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Interval } from 'external/gs_tools/src/async';
import { ListenableDom } from 'external/gs_tools/src/event';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { AnchorLocation } from './anchor-location';
import { Anchors } from './anchors';
import { OverlayContainer } from './overlay-container';
import { OverlayService } from './overlay-service';


describe('gs.tool.OverlayService', () => {
  let mockDocument;
  let service: OverlayService;
  let window;

  beforeEach(() => {
    mockDocument = jasmine.createSpyObj('Document', ['createElement', 'querySelector']);
    window = Mocks.object('window');
    service = new OverlayService(mockDocument, window);
    TestDispose.add(service);
  });

  describe('getOverlayContainerEl_', () => {
    it('should create the overlay container element correctly', () => {
      mockDocument.querySelector.and.returnValue(null);

      const menuContainerEl = Mocks.object('menuContainerEl');
      mockDocument.createElement.and.returnValue(menuContainerEl);

      const mockBody = jasmine.createSpyObj('Body', ['appendChild']);
      mockDocument.body = mockBody;

      const listenableContainer = Mocks.disposable('listenableContainer');
      spyOn(ListenableDom, 'of').and.returnValue(listenableContainer);

      assert(service['getOverlayContainerEl_']()).to.equal(listenableContainer);
      assert(ListenableDom.of).to.haveBeenCalledWith(menuContainerEl);
      assert(mockBody.appendChild).to.haveBeenCalledWith(menuContainerEl);
      assert(mockDocument.createElement).to.haveBeenCalledWith('gs-overlay-container');
      assert(mockDocument.querySelector).to.haveBeenCalledWith('gs-overlay-container');
    });

    it('should grab the overlay container element if one already exists', () => {
      const menuContainerEl = Mocks.object('menuContainerEl');
      mockDocument.querySelector.and.returnValue(menuContainerEl);

      const mockBody = jasmine.createSpyObj('Body', ['appendChild']);
      mockDocument.body = mockBody;

      const listenableContainer = Mocks.disposable('listenableContainer');
      spyOn(ListenableDom, 'of').and.returnValue(listenableContainer);

      assert(service['getOverlayContainerEl_']()).to.equal(listenableContainer);
      assert(ListenableDom.of).to.haveBeenCalledWith(menuContainerEl);
      assert(mockDocument.createElement).toNot.haveBeenCalled();
      assert(mockDocument.querySelector).to.haveBeenCalledWith('gs-overlay-container');
    });

    it('should return the existing menu container element', () => {
      const listenableContainer = Mocks.disposable('listenableContainer');
      TestDispose.add(listenableContainer);
      service['overlayContainerEl_'] = listenableContainer;

      assert(service['getOverlayContainerEl_']()).to.equal(listenableContainer);
      assert(mockDocument.querySelector).toNot.haveBeenCalled();
    });
  });

  describe('onTick_', () => {
    it('should set the anchor target', () => {
      const menuContainerEl = Mocks.object('menuContainerEl');
      const anchorTarget = Mocks.object('anchorTarget');
      const anchorElement = Mocks.object('anchorElement');

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
      const menuContainerEl = Mocks.object('menuContainerEl');
      const left = 12;
      const top = 34;

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
      const menuContainerEl = Mocks.object('menuContainerEl');
      const left = 12;
      const top = 34;
      const width = 56;

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
      const menuContainerEl = Mocks.object('menuContainerEl');
      const left = 12;
      const top = 34;
      const width = 56;
      const height = 78;

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
      const menuContainerEl = Mocks.object('menuContainerEl');
      const left = 12;
      const top = 34;
      const height = 78;

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
      const menuContainerEl = Mocks.object('menuContainerEl');
      const left = 12;
      const top = 34;
      const width = 56;
      const height = 78;

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

  describe('hideOverlay', () => {
    it('should hide the menu container', () => {
      const mockMenuContainer = jasmine.createSpyObj('MenuContainer', ['hide']);
      spyOn(service, 'getOverlayContainerEl_').and
          .returnValue({getEventTarget: () => mockMenuContainer});
      service.hideOverlay();
      assert(mockMenuContainer.hide).to.haveBeenCalledWith();
    });
  });

  describe('showOverlay', () => {
    let anchorElement;

    beforeEach(() => {
      anchorElement = Mocks.object('anchorElement');
    });

    it('should open the menu container correctly', async () => {
      const mockOverlayParent = jasmine.createSpyObj('OverlayParent', ['appendChild']);
      const menuContent = Mocks.object('menuContent');

      const anchorTarget = AnchorLocation.TOP_LEFT;
      const anchorPoint = AnchorLocation.BOTTOM_RIGHT;

      const mockMenuContainerEl = jasmine.createSpyObj(
          'MenuContainerEl',
          ['appendChild', 'show']);
      const mockListenableMenuContainer = jasmine.createSpyObj(
          'ListenableMenuContainer',
          ['getEventTarget', 'once']);
      mockListenableMenuContainer.getEventTarget.and.returnValue(mockMenuContainerEl);
      Fakes.build(mockListenableMenuContainer.once)
          .call((eventType: any, handler: () => void, useCapture: any) => {
            handler();
            return Mocks.disposable('ListenableMenuContainer.once');
          });
      spyOn(service, 'getOverlayContainerEl_').and.returnValue(mockListenableMenuContainer);

      const mockAnchorTargetWatcher = jasmine
          .createSpyObj('AnchorTargetWatcher', ['dispose', 'on', 'start']);
      spyOn(Interval, 'newInstance').and.returnValue(mockAnchorTargetWatcher);

      spyOn(service, 'onTick_');
      spyOn(service, 'setAnchorTarget_');

      await service.showOverlay(
          mockOverlayParent,
          menuContent,
          anchorElement,
          anchorTarget,
          anchorPoint);
      assert(mockOverlayParent.appendChild).to.haveBeenCalledWith(menuContent);
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
    });
  });
});
