import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { DomEvent, ListenableDom } from 'external/gs_tools/src/event';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { AnchorLocation } from './anchor-location';
import { Anchors } from './anchors';
import { OverlayContainer } from './overlay-container';


describe('tool.OverlayContainer', () => {
  let window;
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

      const element = Mocks.object('element');
      element['gsAnchorPoint'] = AnchorLocation.AUTO;
      element['gsAnchorTargetX'] = anchorTargetX;
      element['gsAnchorTargetY'] = anchorTargetY;
      container['element_'] = {getEventTarget: () => element} as any;

      const anchorLocation = AnchorLocation.TOP_LEFT;
      spyOn(Anchors, 'resolveAutoLocation').and.returnValue(anchorLocation);

      assert(container['getAnchorPoint_']()).to.equal(anchorLocation);
      assert(Anchors.resolveAutoLocation)
          .to.haveBeenCalledWith(anchorTargetX, anchorTargetY, window);
    });

    it('should return the set anchor point if it is not AUTO', () => {
      const element = Mocks.object('element');
      element['gsAnchorPoint'] = AnchorLocation.TOP_RIGHT;
      container['element_'] = {getEventTarget: () => element} as any;

      assert(container['getAnchorPoint_']()).to.equal(AnchorLocation.TOP_RIGHT);
    });

    it('should throw error if no elements are found', () => {
      container['element_'] = null;

      assert(() => {
        container['getAnchorPoint_']();
      }).to.throwError(/No element found/);
    });
  });

  describe('hide_', () => {
    it('should play the hide animation', () => {
      const rootEl = Mocks.object('rootEl');
      const containerEl = Mocks.object('containerEl');

      const animate = Mocks.object('animate');
      spyOn(OverlayContainer['HIDE_ANIMATION_'], 'applyTo').and.returnValue(animate);

      const mockListenableAnimate =
          jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
      mockListenableAnimate.once.and.returnValue(Mocks.disposable('ListenableAnimate.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

      const mockListenableElement = jasmine.createSpyObj('ListenableElement', ['dispatch']);
      container['element_'] = mockListenableElement;

      spyOn(container, 'onFinishAnimate_');

      container['hide_'](containerEl, rootEl);

      assert(mockListenableAnimate.once)
          .to.haveBeenCalledWith(DomEvent.FINISH, Matchers.any(Function), container);
      mockListenableAnimate.once.calls.argsFor(0)[1]();
      assert(container['onFinishAnimate_']).to.haveBeenCalledWith(rootEl);
      assert(OverlayContainer['HIDE_ANIMATION_'].applyTo).to.haveBeenCalledWith(containerEl);
      assert(ListenableDom.of).to.haveBeenCalledWith(animate);
    });
  });

  describe('onAttributesChanged_', () => {
    it('should update the content correctly', () => {
      const containerEl = Mocks.object('containerEl');
      spyOn(container, 'updateContent_');
      container.onAttributesChanged_(containerEl);
      assert(container['updateContent_']).to.haveBeenCalledWith(containerEl);
    });
  });

  describe('onBackdropClick_', () => {
    it('should hide the menu', () => {
      const id = 123;
      const value = true;
      spyOn(container, 'hide_');
      assert(container.onBackdropClick_({id, value})).to.haveElements([[id, false]]);
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      const element = Mocks.object('element');
      element['gsAnchorPoint'] = null;

      container.onCreated(element);

      assert(container['element_']!.getEventTarget()).to.equal(element);

      assert(element['gsAnchorPoint']).to.equal(AnchorLocation.AUTO);
    });

    it('should use the existing anchor point if given', () => {
      const anchorPoint = AnchorLocation.BOTTOM_RIGHT;
      const element = Mocks.object('element');
      element.ownerDocument = Mocks.object('document');
      element['gsAnchorPoint'] = anchorPoint;

      container.onCreated(element);

      assert(element['gsAnchorPoint']).to.equal(anchorPoint);
    });
  });

  describe('onFinishAnimate_', () => {
    it('should remove the SHOW class and dispatch the HIDE event', () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['remove']);
      const rootEl = Mocks.object('rootEl');
      rootEl.classList = mockClassList;

      const mockElement = jasmine.createSpyObj('Element', ['dispatch']);
      spyOn(container, 'getElement').and.returnValue(mockElement);

      container['onFinishAnimate_'](rootEl);

      assert(mockClassList.remove).to
          .haveBeenCalledWith(OverlayContainer['SHOW_CLASS_']);
      assert(mockElement.dispatch).to.haveBeenCalledWith(
          OverlayContainer.HIDE_EVENT,
          Matchers.any(Function));
    });

    it('should not throw error if there are no elements', () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['remove']);
      const rootEl = Mocks.object('rootEl');
      rootEl.classList = mockClassList;

      spyOn(container, 'getElement').and.returnValue(null);

      assert(() => {
        container['onFinishAnimate_'](rootEl);
      }).toNot.throw();

      assert(mockClassList.remove).to
          .haveBeenCalledWith(OverlayContainer['SHOW_CLASS_']);
    });
  });

  describe('onInserted', () => {
    it('should update the content correctly', () => {
      const containerEl = Mocks.object('containerEl');
      spyOn(container, 'updateContent_');
      container.onInserted(containerEl);
      assert(container['updateContent_']).to.haveBeenCalledWith(containerEl);
    });
  });

  describe('onWindowResize_', () => {
    it('should update the content', () => {
      const containerEl = Mocks.object('containerEl');
      spyOn(container, 'updateContent_');
      container['onWindowResize_'](containerEl);
      assert(container['updateContent_']).to.haveBeenCalledWith(containerEl);
    });
  });

  describe('show_', () => {
    let containerEl;
    let mockSlotEl;
    let mockListenableElement;
    let rootEl;

    beforeEach(() => {
      containerEl = Mocks.object('containerEl');
      mockListenableElement = jasmine.createSpyObj('ListenableElement', ['dispatch']);
      mockSlotEl = jasmine.createSpyObj('SlotEl', ['assignedNodes']);
      rootEl = Mocks.object('rootEl');

      container['element_'] = mockListenableElement;
    });

    it('should measure the size of the first distributed element, play the show animation, add ' +
        'the "show" class, and dispatch the show event.',
        () => {
          const height = 123;
          const width = 456;
          const assignedNode = Mocks.object('distributedElement');
          assignedNode.clientHeight = height;
          assignedNode.clientWidth = width;
          mockSlotEl.assignedNodes.and.returnValue([assignedNode]);

          const mockClassList = jasmine.createSpyObj('ClassList', ['add']);
          rootEl.classList = mockClassList;
          rootEl.style = {};

          const mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
          spyOn(OverlayContainer['BASE_SHOW_ANIMATION_'], 'appendKeyframe').and
              .returnValue(mockAnimation);

          container['show_'](containerEl, rootEl, mockSlotEl);

          assert(mockListenableElement.dispatch).to.haveBeenCalledWith(
              OverlayContainer.SHOW_EVENT,
              Matchers.any(Function));

          mockListenableElement.dispatch.calls.argsFor(0)[1]();
          assert(mockClassList.add).to.haveBeenCalledWith(OverlayContainer['SHOW_CLASS_']);
          assert(mockAnimation.applyTo).to.haveBeenCalledWith(containerEl);
          assert(OverlayContainer['BASE_SHOW_ANIMATION_'].appendKeyframe).to.haveBeenCalledWith(
              jasmine.objectContaining({
                height: `${height}px`,
                width: `${width}px`,
              }));
        });

    it('should do nothing if the distributed element cannot be found', () => {
      mockSlotEl.assignedNodes.and.returnValue([]);
      const mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      rootEl.classList = mockClassList;

      container['show_'](containerEl, rootEl, mockSlotEl);

      assert(mockClassList.add).toNot.haveBeenCalled();
    });

    it('should not throw error if there are no elements', () => {
      container['element_'] = null;

      rootEl.style = {};

      const assignedNode = Mocks.object('distributedElement');
      assignedNode.clientHeight = 123;
      assignedNode.clientWidth = 456;
      mockSlotEl.assignedNodes.and.returnValue([assignedNode]);

      const mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      spyOn(OverlayContainer['BASE_SHOW_ANIMATION_'], 'appendKeyframe').and
          .returnValue(mockAnimation);

      assert(() => {
        container['show_'](containerEl, rootEl, mockSlotEl);
      }).toNot.throw();
    });
  });

  describe('updateContent_', () => {
    let containerEl;
    let element;

    beforeEach(() => {
      containerEl = Mocks.object('containerEl');
      containerEl.style = {};
      element = Mocks.object('element');

      container['element_'] = {getEventTarget: () => element} as any;
    });

    it('should set the location of the container element correctly for TOP_LEFT anchor point',
        () => {
          element['gsAnchorTargetX'] = 12;
          element['gsAnchorTargetY'] = 34;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.TOP_LEFT);

          container['updateContent_'](containerEl);

          assert(containerEl.style.top).to.equal('34px');
          assert(containerEl.style.right).to.equal('');
          assert(containerEl.style.bottom).to.equal('');
          assert(containerEl.style.left).to.equal('12px');
        });

    it('should set the location of the container element correctly for TOP_RIGHT anchor point',
        () => {
          element['gsAnchorTargetX'] = 12;
          element['gsAnchorTargetY'] = 34;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.TOP_RIGHT);

          container['updateContent_'](containerEl);

          assert(containerEl.style.top).to.equal('34px');
          assert(containerEl.style.right).to.equal('188px');
          assert(containerEl.style.bottom).to.equal('');
          assert(containerEl.style.left).to.equal('');
        });

    it('should set the location of the container element correctly for BOTTOM_RIGHT anchor point',
        () => {
          element['gsAnchorTargetX'] = 12;
          element['gsAnchorTargetY'] = 34;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.BOTTOM_RIGHT);

          container['updateContent_'](containerEl);

          assert(containerEl.style.top).to.equal('');
          assert(containerEl.style.right).to.equal('188px');
          assert(containerEl.style.bottom).to.equal('66px');
          assert(containerEl.style.left).to.equal('');
        });

    it('should set the location of the container element correctly for BOTTOM_LEFT anchor point',
        () => {
          element['gsAnchorTargetX'] = 12;
          element['gsAnchorTargetY'] = 34;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.BOTTOM_LEFT);

          container['updateContent_'](containerEl);

          assert(containerEl.style.top).to.equal('');
          assert(containerEl.style.right).to.equal('');
          assert(containerEl.style.bottom).to.equal('66px');
          assert(containerEl.style.left).to.equal('12px');
        });

    it('should do nothing if anchorTargetX is not set', () => {
      element['gsAnchorTargetX'] = null;
      element['gsAnchorTargetY'] = 34;

      spyOn(container, 'getAnchorPoint_');

      container['updateContent_'](containerEl);

      assert(container['getAnchorPoint_']).toNot.haveBeenCalled();
    });

    it('should do nothing if anchorTargetY is not set', () => {
      element['gsAnchorTargetX'] = 12;
      element['gsAnchorTargetY'] = null;

      spyOn(container, 'getAnchorPoint_');

      container['updateContent_'](containerEl);

      assert(container['getAnchorPoint_']).toNot.haveBeenCalled();
    });

    it('should not throw error if there are no elements', () => {
      spyOn(container, 'getElement').and.returnValue(null);

      assert(() => {
        container['updateContent_'](containerEl);
      }).toNot.throw();
    });
  });
});
