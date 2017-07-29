import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeMonadSetter } from 'external/gs_tools/src/event';
import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { AnimationEventDetail } from 'external/gs_tools/src/webc';

import { AnchorLocation } from '../const';
import { Anchors, OverlayContainer } from '../tool';
import { HIDE_ANIM } from '../tool/overlay-container';


describe('tool.OverlayContainer', () => {
  let window: any;
  let container: OverlayContainer;

  beforeEach(() => {
    window = Mocks.object('window');

    container = new OverlayContainer(window);
    TestDispose.add(container);
  });

  describe('getAnchorPoint_', () => {
    it('should return the location resolved by Anchors if the anchor point is AUTO', () => {
      const anchorTargetX = 12;
      const anchorTargetY = 34;
      const anchorLocation = AnchorLocation.TOP_LEFT;
      spyOn(Anchors, 'resolveAutoLocation').and.returnValue(anchorLocation);

      assert(container['getAnchorPoint_'](
          AnchorLocation.AUTO,
          anchorTargetX,
          anchorTargetY)).to.equal(anchorLocation);
      assert(Anchors.resolveAutoLocation)
          .to.haveBeenCalledWith(anchorTargetX, anchorTargetY, window);
    });

    it('should return the set anchor point if it is not AUTO', () => {
      const anchorPoint = AnchorLocation.TOP_RIGHT;
      assert(container['getAnchorPoint_'](anchorPoint, 123, 456)).to.equal(anchorPoint);
    });
  });

  describe('hide_', () => {
    it('should play the hide animation correctly', () => {
      spyOn(OverlayContainer['HIDE_ANIMATION_'], 'start');

      container['hide_']();
      assert(OverlayContainer['HIDE_ANIMATION_'].start).to
          .haveBeenCalledWith(container, '#container');
    });
  });

  describe('onAttributesChanged_', () => {
    it('should update the content correctly', () => {
      const anchorPoint = AnchorLocation.BOTTOM_RIGHT;
      const anchorTargetX = 123;
      const anchorTargetY = 456;
      const containerEl = Mocks.object('containerEl');
      spyOn(container, 'updateContent_');
      container.onAttributesChanged_(anchorPoint, anchorTargetX, anchorTargetY, containerEl);
      assert(container['updateContent_']).to
          .haveBeenCalledWith(anchorPoint, anchorTargetX, anchorTargetY, containerEl);
    });
  });

  describe('onBackdropClick_', () => {
    it('should hide the menu', () => {
      const value = true;
      spyOn(container, 'hide_');
      const fakeVisibleSetter = new FakeMonadSetter<boolean>(value);

      const list = container.onBackdropClick_(fakeVisibleSetter);
      assert(fakeVisibleSetter.findValue(list)!.value).to.beFalse();
    });
  });

  describe('onCreated', () => {
    it('should default the anchor point to AUTO if not given', () => {
      const fakeAnchorPointSetter = new FakeMonadSetter<AnchorLocation | null>(null);

      const list = container.onCreated(fakeAnchorPointSetter);
      assert(fakeAnchorPointSetter.findValue(list)!.value).to.equal(AnchorLocation.AUTO);
    });

    it('should use the existing anchor point if given', () => {
      const fakeAnchorPointSetter = new FakeMonadSetter<AnchorLocation>(AnchorLocation.AUTO);

      const list = container.onCreated(fakeAnchorPointSetter);
      assert([...list]).to.equal([]);
    });
  });

  describe('onFinishAnimate_', () => {
    it('should remove the SHOW class and dispatch the HIDE event', () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['remove']);
      const rootEl = Mocks.object('rootEl');
      rootEl.classList = mockClassList;

      const mockDispatcher = jasmine.createSpy('Dispatcher');
      const detail = {id: HIDE_ANIM} as AnimationEventDetail;

      container.onFinishAnimate_({detail}, rootEl, mockDispatcher);

      assert(mockClassList.remove).to
          .haveBeenCalledWith(OverlayContainer['SHOW_CLASS_']);
      assert(mockDispatcher).to.haveBeenCalledWith('gs-hide', {});
    });

    it(`should do nothing if the ID is incorrect`, () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['remove']);
      const rootEl = Mocks.object('rootEl');
      rootEl.classList = mockClassList;

      const mockDispatcher = jasmine.createSpy('Dispatcher');
      const detail = {id: Symbol('otherId')} as AnimationEventDetail;

      container.onFinishAnimate_({detail}, rootEl, mockDispatcher);

      assert(mockClassList.remove).toNot.haveBeenCalled();
      assert(mockDispatcher).toNot.haveBeenCalled();
    });
  });

  describe('onVisibilityChange_', () => {
    it(`should show the overlay correctly if visible`, () => {
      const rootEl = Mocks.object('rootEl');
      const slotEl = Mocks.object('slotEl');
      const dispatcher = Mocks.object('dispatcher');

      spyOn(container, 'show_');

      container.onVisibilityChange_(true, rootEl, slotEl, dispatcher);
      assert(container['show_']).to.haveBeenCalledWith(rootEl, slotEl, dispatcher);
    });

    it(`should hide the overlay correctly if not visible`, () => {
      spyOn(container, 'hide_');

      container.onVisibilityChange_(
          false,
          Mocks.object('rootEl'),
          Mocks.object('slotEl'),
          Mocks.object('dispatcher'));
      assert(container['hide_']).to.haveBeenCalledWith();
    });
  });

  describe('show_', () => {
    it('should measure the size of the first distributed element, play the show animation, add ' +
        'the "show" class, and dispatch the show event.',
        () => {
          const height = 123;
          const width = 456;
          const assignedNode = Mocks.object('distributedElement');
          assignedNode.clientHeight = height;
          assignedNode.clientWidth = width;

          const mockSlotEl = jasmine.createSpyObj('SlotEl', ['assignedNodes']);
          mockSlotEl.assignedNodes.and.returnValue([assignedNode]);

          const mockClassList = jasmine.createSpyObj('ClassList', ['add']);
          const rootEl = Mocks.object('rootEl');
          rootEl.classList = mockClassList;
          rootEl.style = {};

          const mockDispatcher = jasmine.createSpy('Dispatcher');

          const mockAnimation = jasmine.createSpyObj('Animation', ['start']);
          spyOn(OverlayContainer['BASE_SHOW_ANIMATION_'], 'appendKeyframe').and
              .returnValue(mockAnimation);

          container['show_'](rootEl, mockSlotEl, mockDispatcher);

          assert(mockDispatcher).to.haveBeenCalledWith('gs-show', {});

          assert(mockClassList.add).to.haveBeenCalledWith(OverlayContainer['SHOW_CLASS_']);
          assert(mockAnimation.start).to.haveBeenCalledWith(container, '#container');
          assert(OverlayContainer['BASE_SHOW_ANIMATION_'].appendKeyframe).to.haveBeenCalledWith(
              jasmine.objectContaining({
                height: `${height}px`,
                width: `${width}px`,
              }));
        });

    it('should do nothing if the distributed element cannot be found', () => {
      const mockSlotEl = jasmine.createSpyObj('SlotEl', ['assignedNodes']);
      mockSlotEl.assignedNodes.and.returnValue([]);

      const mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      const rootEl = Mocks.object('rootEl');
      rootEl.classList = mockClassList;
      rootEl.style = {};

      const mockDispatcher = jasmine.createSpy('Dispatcher');

      container['show_'](rootEl, mockSlotEl, mockDispatcher);

      assert(mockClassList.add).toNot.haveBeenCalled();
      assert(mockDispatcher).toNot.haveBeenCalled();
    });
  });

  describe('updateContent_', () => {
    let containerEl: any;

    beforeEach(() => {
      containerEl = Mocks.object('containerEl');
      containerEl.style = {};
    });

    it('should set the location of the container element correctly for TOP_LEFT anchor point',
        () => {
          const anchorTargetX = 12;
          const anchorTargetY = 34;
          const anchorPointAttr = AnchorLocation.AUTO;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.TOP_LEFT);

          container['updateContent_'](anchorPointAttr, anchorTargetX, anchorTargetY, containerEl);

          assert(containerEl.style.top).to.equal('34px');
          assert(containerEl.style.right).to.equal('');
          assert(containerEl.style.bottom).to.equal('');
          assert(containerEl.style.left).to.equal('12px');
          assert(container['getAnchorPoint_']).to
              .haveBeenCalledWith(anchorPointAttr, anchorTargetX, anchorTargetY);
        });

    it('should set the location of the container element correctly for TOP_RIGHT anchor point',
        () => {
          const anchorTargetX = 12;
          const anchorTargetY = 34;
          const anchorPointAttr = AnchorLocation.AUTO;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.TOP_RIGHT);

          container['updateContent_'](anchorPointAttr, anchorTargetX, anchorTargetY, containerEl);

          assert(containerEl.style.top).to.equal('34px');
          assert(containerEl.style.right).to.equal('188px');
          assert(containerEl.style.bottom).to.equal('');
          assert(containerEl.style.left).to.equal('');
        });

    it('should set the location of the container element correctly for BOTTOM_RIGHT anchor point',
        () => {
          const anchorTargetX = 12;
          const anchorTargetY = 34;
          const anchorPointAttr = AnchorLocation.AUTO;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.BOTTOM_RIGHT);

          container['updateContent_'](anchorPointAttr, anchorTargetX, anchorTargetY, containerEl);

          assert(containerEl.style.top).to.equal('');
          assert(containerEl.style.right).to.equal('188px');
          assert(containerEl.style.bottom).to.equal('66px');
          assert(containerEl.style.left).to.equal('');
        });

    it('should set the location of the container element correctly for BOTTOM_LEFT anchor point',
        () => {
          const anchorTargetX = 12;
          const anchorTargetY = 34;
          const anchorPointAttr = AnchorLocation.AUTO;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.BOTTOM_LEFT);

          container['updateContent_'](anchorPointAttr, anchorTargetX, anchorTargetY, containerEl);

          assert(containerEl.style.top).to.equal('');
          assert(containerEl.style.right).to.equal('');
          assert(containerEl.style.bottom).to.equal('66px');
          assert(containerEl.style.left).to.equal('12px');
        });

    it('should do nothing if anchorTargetX is not set', () => {
      spyOn(container, 'getAnchorPoint_');

      container['updateContent_'](AnchorLocation.AUTO, null, 34, containerEl);

      assert(container['getAnchorPoint_']).toNot.haveBeenCalled();
    });

    it('should do nothing if anchorTargetY is not set', () => {
      spyOn(container, 'getAnchorPoint_');

      container['updateContent_'](AnchorLocation.AUTO, 12, null, containerEl);

      assert(container['getAnchorPoint_']).toNot.haveBeenCalled();
    });
  });
});
