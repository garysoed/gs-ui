import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Interval } from 'external/gs_tools/src/async';
import { ListenableDom } from 'external/gs_tools/src/event';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { EnumParser } from 'external/gs_tools/src/parse';
import { TestDispose } from 'external/gs_tools/src/testing';

import { AnchorLocation } from '../tool/anchor-location';
import { Anchors } from '../tool/anchors';
import { OverlayBus } from '../tool/overlay-bus';
import { __shownId, OverlayService } from '../tool/overlay-service';


describe('gs.tool.OverlayService', () => {
  let mockDocument: any;
  let service: OverlayService;
  let window: any;

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

      assert(service['getOverlayContainerEl_']()).to.equal(menuContainerEl);
      assert(mockBody.appendChild).to.haveBeenCalledWith(menuContainerEl);
      assert(mockDocument.createElement).to.haveBeenCalledWith('gs-overlay-container');
      assert(mockDocument.querySelector).to.haveBeenCalledWith('gs-overlay-container');
    });

    it('should grab the overlay container element if one already exists', () => {
      const menuContainerEl = Mocks.object('menuContainerEl');
      mockDocument.querySelector.and.returnValue(menuContainerEl);

      const mockBody = jasmine.createSpyObj('Body', ['appendChild']);
      mockDocument.body = mockBody;

      assert(service['getOverlayContainerEl_']()).to.equal(menuContainerEl);
      assert(mockDocument.createElement).toNot.haveBeenCalled();
      assert(mockDocument.querySelector).to.haveBeenCalledWith('gs-overlay-container');
    });
  });

  describe('getShownId_', () => {
    it(`should return the ID in the container element`, () => {
      const shownId = Symbol('shownId');
      const containerEl = Mocks.object('containerEl');
      containerEl[__shownId] = shownId;
      spyOn(service, 'getOverlayContainerEl_').and.returnValue(containerEl);
      assert(service['getShownId_']()).to.equal(shownId);
    });

    it(`should return null if there are no shown IDs`, () => {
      const containerEl = Mocks.object('containerEl');
      spyOn(service, 'getOverlayContainerEl_').and.returnValue(containerEl);
      assert(service['getShownId_']()).to.beNull();
    });
  });

  describe('hideOverlay', () => {
    it('should hide the menu container', () => {
      const id = Symbol('id');
      const mockMenuContainer = jasmine.createSpyObj('MenuContainer', ['setAttribute']);
      spyOn(service, 'getOverlayContainerEl_').and.returnValue(mockMenuContainer);
      spyOn(service, 'getShownId_').and.returnValue(id);
      Fakes.build(spyOn(OverlayBus, 'dispatch')).call((_: any, fn: () => void) => fn());
      service.hideOverlay(id);
      assert(mockMenuContainer.setAttribute).to.haveBeenCalledWith('visible', 'false');
      assert(OverlayBus.dispatch).to
          .haveBeenCalledWith({id, type: 'hide'}, Matchers.any(Function) as any);
    });

    it(`should do nothing if the ID does not match`, () => {
      const mockMenuContainer = jasmine.createSpyObj('MenuContainer', ['setAttribute']);
      spyOn(service, 'getShownId_').and.returnValue(Symbol('otherId'));
      Fakes.build(spyOn(OverlayBus, 'dispatch')).call((_: any, fn: () => void) => fn());
      service.hideOverlay(Symbol('id'));
      assert(mockMenuContainer.setAttribute).toNot.haveBeenCalled();
      assert(OverlayBus.dispatch).toNot.haveBeenCalled();
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
    let mockParentElement: any;

    beforeEach(() => {
      mockParentElement = jasmine.createSpyObj('ParentElement', ['getBoundingClientRect']);
    });

    it('should set the correct X and Y for TOP_LEFT', () => {
      const mockMenuContainerEl = jasmine.createSpyObj('MenuContainerEl', ['setAttribute']);
      const left = 12;
      const top = 34;

      mockParentElement.getBoundingClientRect.and.returnValue({
        left: left,
        top: top,
      });

      service['setAnchorTarget_'](
          mockMenuContainerEl,
          AnchorLocation.TOP_LEFT,
          mockParentElement);

      assert(mockMenuContainerEl.setAttribute).to
          .haveBeenCalledWith('anchor-target-x', `${left}`);
      assert(mockMenuContainerEl.setAttribute).to
          .haveBeenCalledWith('anchor-target-y', `${top}`);
    });

    it('should set the correct X and Y for TOP_RIGHT', () => {
      const mockMenuContainerEl = jasmine.createSpyObj('MenuContainerEl', ['setAttribute']);
      const left = 12;
      const top = 34;
      const width = 56;

      mockParentElement.getBoundingClientRect.and.returnValue({
        left: left,
        top: top,
        width: width,
      });

      service['setAnchorTarget_'](
          mockMenuContainerEl,
          AnchorLocation.TOP_RIGHT,
          mockParentElement);

      assert(mockMenuContainerEl.setAttribute).to.haveBeenCalledWith('anchor-target-x', `68`);
      assert(mockMenuContainerEl.setAttribute).to
          .haveBeenCalledWith('anchor-target-y', `${top}`);
    });

    it('should set the correct X and Y for BOTTOM_RIGHT', () => {
      const mockMenuContainerEl = jasmine.createSpyObj('MenuContainerEl', ['setAttribute']);
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
          mockMenuContainerEl,
          AnchorLocation.BOTTOM_RIGHT,
          mockParentElement);

      assert(mockMenuContainerEl.setAttribute).to.haveBeenCalledWith('anchor-target-x', `68`);
      assert(mockMenuContainerEl.setAttribute).to.haveBeenCalledWith('anchor-target-y', `112`);
    });

    it('should set the correct X and T for BOTTOM_LEFT', () => {
      const mockMenuContainerEl = jasmine.createSpyObj('MenuContainerEl', ['setAttribute']);
      const left = 12;
      const top = 34;
      const height = 78;

      mockParentElement.getBoundingClientRect.and.returnValue({
        height: height,
        left: left,
        top: top,
      });

      service['setAnchorTarget_'](
          mockMenuContainerEl,
          AnchorLocation.BOTTOM_LEFT,
          mockParentElement);

      assert(mockMenuContainerEl.setAttribute).to
          .haveBeenCalledWith('anchor-target-x', `${left}`);
      assert(mockMenuContainerEl.setAttribute).to.haveBeenCalledWith('anchor-target-y', `112`);
    });

    it('should resolve auto location if the anchor target is AUTO', () => {
      const mockMenuContainerEl = jasmine.createSpyObj('MenuContainerEl', ['setAttribute']);
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
          mockMenuContainerEl,
          AnchorLocation.AUTO,
          mockParentElement);

      assert(mockMenuContainerEl.setAttribute).to
          .haveBeenCalledWith('anchor-target-x', `${left}`);
      assert(mockMenuContainerEl.setAttribute).to
          .haveBeenCalledWith('anchor-target-y', `${top}`);
      assert(Anchors.resolveAutoLocation).to.haveBeenCalledWith(40, 73, window);
    });
  });

  describe('showOverlay', () => {
    let anchorElement: any;

    beforeEach(() => {
      anchorElement = Mocks.object('anchorElement');
    });

    it('should open the menu container correctly', async () => {
      const id = Symbol('id');
      const mockOverlayParent = jasmine.createSpyObj('OverlayParent', ['appendChild']);
      const menuContent = Mocks.object('menuContent');

      const anchorTarget = AnchorLocation.TOP_LEFT;
      const anchorPoint = AnchorLocation.BOTTOM_RIGHT;

      const mockMenuContainerEl = jasmine.createSpyObj(
          'MenuContainerEl',
          ['appendChild', 'setAttribute']);
      const mockListenableMenuContainer = jasmine.createSpyObj(
          'ListenableMenuContainer',
          ['dispose', 'getEventTarget', 'once']);
      mockListenableMenuContainer.getEventTarget.and.returnValue(mockMenuContainerEl);
      Fakes.build(mockListenableMenuContainer.once)
          .call((_eventType: any, handler: () => void, _useCapture: any) => {
            handler();
            return Mocks.disposable('ListenableMenuContainer.once');
          });
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableMenuContainer);
      spyOn(service, 'getOverlayContainerEl_').and.returnValue(mockMenuContainerEl);

      const mockAnchorTargetWatcher = jasmine
          .createSpyObj('AnchorTargetWatcher', ['dispose', 'on', 'start']);
      mockAnchorTargetWatcher.on.and.returnValue(jasmine.createSpyObj('DisposableFn', ['dispose']));
      spyOn(Interval, 'newInstance').and.returnValue(mockAnchorTargetWatcher);

      spyOn(service, 'onTick_');
      spyOn(service, 'setAnchorTarget_');
      spyOn(service, 'getShownId_').and.returnValue(null);
      Fakes.build(spyOn(OverlayBus, 'dispatch')).call((_: any, fn: () => void) => fn());

      await service.showOverlay(
          id,
          mockOverlayParent,
          menuContent,
          anchorElement,
          anchorTarget,
          anchorPoint);
      assert(OverlayBus.dispatch).to
          .haveBeenCalledWith({id, type: 'show'}, Matchers.any(Function) as any);
      assert(mockMenuContainerEl.setAttribute).to.haveBeenCalledWith('visible', 'true');
      assert(mockOverlayParent.appendChild).to.haveBeenCalledWith(menuContent);
      assert(mockAnchorTargetWatcher.dispose).to.haveBeenCalledWith();

      assert(mockListenableMenuContainer.once).to.haveBeenCalledWith(
          'gs-hide',
          Matchers.any(Function),
          false);

      assert(service['setAnchorTarget_'])
          .to.haveBeenCalledWith(mockMenuContainerEl, anchorTarget, anchorElement);
      assert(mockMenuContainerEl.setAttribute).to
          .haveBeenCalledWith('anchor-point', EnumParser(AnchorLocation).stringify(anchorPoint));
      assert(mockMenuContainerEl.appendChild).to.haveBeenCalledWith(menuContent);

      assert(mockAnchorTargetWatcher.start).to.haveBeenCalledWith();
      assert(mockAnchorTargetWatcher.on).to.haveBeenCalledWith(
          'tick',
          Matchers.any(Function) as any,
          service);
      mockAnchorTargetWatcher.on.calls.argsFor(0)[1]();
      assert(service['onTick_'])
          .to.haveBeenCalledWith(mockMenuContainerEl, anchorTarget, anchorElement);

      assert(Interval.newInstance)
          .to.haveBeenCalledWith(OverlayService['ANCHOR_TARGET_INTERVAL_']);

      assert(ListenableDom.of).to.haveBeenCalledWith(mockMenuContainerEl);
      assert(mockListenableMenuContainer.dispose).to.haveBeenCalledWith();
    });

    it(`should hide the previous overlay if one is already shown`, async () => {
      const otherId = Symbol('otherId');
      spyOn(service, 'getShownId_').and.returnValue(otherId);

      const id = Symbol('id');
      const mockOverlayParent = jasmine.createSpyObj('OverlayParent', ['appendChild']);
      const menuContent = Mocks.object('menuContent');

      const anchorTarget = AnchorLocation.TOP_LEFT;
      const anchorPoint = AnchorLocation.BOTTOM_RIGHT;

      const mockMenuContainerEl = jasmine.createSpyObj(
          'MenuContainerEl',
          ['appendChild', 'setAttribute']);
      const mockListenableMenuContainer = jasmine.createSpyObj(
          'ListenableMenuContainer',
          ['dispose', 'getEventTarget', 'once']);
      mockListenableMenuContainer.getEventTarget.and.returnValue(mockMenuContainerEl);
      Fakes.build(mockListenableMenuContainer.once)
          .call((_eventType: any, handler: () => void, _useCapture: any) => {
            handler();
            return Mocks.disposable('ListenableMenuContainer.once');
          });
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableMenuContainer);

      spyOn(service, 'getOverlayContainerEl_').and.returnValue(mockMenuContainerEl);

      const mockAnchorTargetWatcher = jasmine
          .createSpyObj('AnchorTargetWatcher', ['dispose', 'on', 'start']);
      mockAnchorTargetWatcher.on.and.returnValue(jasmine.createSpyObj('DisposableFn', ['dispose']));
      spyOn(Interval, 'newInstance').and.returnValue(mockAnchorTargetWatcher);

      spyOn(service, 'onTick_');
      spyOn(service, 'setAnchorTarget_');
      spyOn(service, 'hideOverlay');

      Fakes.build(spyOn(OverlayBus, 'dispatch')).call((_: any, fn: () => void) => fn());

      await service.showOverlay(
          id,
          mockOverlayParent,
          menuContent,
          anchorElement,
          anchorTarget,
          anchorPoint);
      assert(OverlayBus.dispatch).to
          .haveBeenCalledWith({id, type: 'show'}, Matchers.any(Function) as any);
      assert(mockMenuContainerEl.setAttribute).to.haveBeenCalledWith('visible', 'true');
      assert(mockOverlayParent.appendChild).to.haveBeenCalledWith(menuContent);
      assert(mockAnchorTargetWatcher.dispose).to.haveBeenCalledWith();

      assert(mockListenableMenuContainer.once).to.haveBeenCalledWith(
          'gs-hide',
          Matchers.any(Function),
          false);

      assert(service['setAnchorTarget_'])
          .to.haveBeenCalledWith(mockMenuContainerEl, anchorTarget, anchorElement);
      assert(mockMenuContainerEl.setAttribute).to
          .haveBeenCalledWith('anchor-point', EnumParser(AnchorLocation).stringify(anchorPoint));
      assert(mockMenuContainerEl.appendChild).to.haveBeenCalledWith(menuContent);

      assert(mockAnchorTargetWatcher.start).to.haveBeenCalledWith();
      assert(mockAnchorTargetWatcher.on).to.haveBeenCalledWith(
          'tick',
          Matchers.any(Function) as any,
          service);
      mockAnchorTargetWatcher.on.calls.argsFor(0)[1]();

      assert(Interval.newInstance)
          .to.haveBeenCalledWith(OverlayService['ANCHOR_TARGET_INTERVAL_']);
      assert(service.hideOverlay).to.haveBeenCalledWith(otherId);
    });

    it(`should do nothing if the overlay corresponding to the ID is already shown`, async () => {
      const id = Symbol('id');
      const mockOverlayParent = jasmine.createSpyObj('OverlayParent', ['appendChild']);
      const menuContent = Mocks.object('menuContent');

      const anchorTarget = AnchorLocation.TOP_LEFT;
      const anchorPoint = AnchorLocation.BOTTOM_RIGHT;

      const mockMenuContainerEl = jasmine.createSpyObj(
          'MenuContainerEl',
          ['appendChild', 'setAttribute']);
      spyOn(service, 'getOverlayContainerEl_').and.returnValue(mockMenuContainerEl);

      const mockAnchorTargetWatcher = jasmine
          .createSpyObj('AnchorTargetWatcher', ['dispose', 'start']);
      spyOn(Interval, 'newInstance').and.returnValue(mockAnchorTargetWatcher);

      spyOn(service, 'setAnchorTarget_');

      spyOn(service, 'getShownId_').and.returnValue(id);
      spyOn(OverlayBus, 'dispatch');

      await service.showOverlay(
          id,
          mockOverlayParent,
          menuContent,
          anchorElement,
          anchorTarget,
          anchorPoint);

      assert(OverlayBus.dispatch).toNot.haveBeenCalled();
      assert(mockMenuContainerEl.setAttribute).toNot.haveBeenCalled();
    });
  });
});
