import {TestBase} from '../test-base';
TestBase.setup();

import {AnchorLocation} from './anchor-location';
import {Anchors} from './anchors';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';
import {Jsons} from '../../external/gs_tools/src/collection';
import {MenuContainer} from './menu-container';
import {Mocks} from '../../external/gs_tools/src/mock';
import {TestDispose} from '../../external/gs_tools/src/testing';


describe('tool.MenuContainer', () => {
  let window;
  let container;

  beforeEach(() => {
    window = Mocks.object('window');

    container = new MenuContainer(window);
    TestDispose.add(container);
  });

  describe('getAnchorPoint_', () => {
    it('should return the location resolved by Anchors if the anchor point is AUTO', () => {
      let anchorTargetX = 12;
      let anchorTargetY = 34;

      let element = Mocks.object('element');
      element['gsAnchorPoint'] = AnchorLocation.AUTO;
      element['gsAnchorTargetX'] = anchorTargetX;
      element['gsAnchorTargetY'] = anchorTargetY;
      container['element_'] = {eventTarget: element};

      let window = Mocks.object('window');
      container['windowEl_'] = {eventTarget: window};

      let anchorLocation = AnchorLocation.TOP_LEFT;
      spyOn(Anchors, 'resolveAutoLocation').and.returnValue(anchorLocation);

      expect(container['getAnchorPoint_']()).toEqual(anchorLocation);
      expect(Anchors.resolveAutoLocation)
          .toHaveBeenCalledWith(anchorTargetX, anchorTargetY, window);
    });

    it('should return the set anchor point if it is not AUTO', () => {
      let element = Mocks.object('element');
      element['gsAnchorPoint'] = AnchorLocation.TOP_RIGHT;
      container['element_'] = {eventTarget: element};

      expect(container['getAnchorPoint_']()).toEqual(AnchorLocation.TOP_RIGHT);
    });
  });

  describe('hide_', () => {
    it('should play the hide animation, remove the "show" class, and dispatches the HIDE event',
        () => {
          let mockClassList = jasmine.createSpyObj('ClassList', ['remove']);
          let rootEl = Mocks.object('rootEl');
          rootEl.classList = mockClassList;
          container['rootEl_'] = {eventTarget: rootEl};

          let containerEl = Mocks.object('containerEl');
          container['containerEl_'] = {eventTarget: containerEl};

          let animate = Mocks.object('animate');
          spyOn(MenuContainer['HIDE_ANIMATION_'], 'applyTo').and.returnValue(animate);

          let mockListenableAnimate =
              jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
          mockListenableAnimate.once.and.returnValue(Mocks.disposable('ListenableAnimate.once'));
          spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

          let mockListenableElement = jasmine.createSpyObj('ListenableElement', ['dispatch']);
          container['element_'] = mockListenableElement;

          container['hide_']();

          expect(mockListenableAnimate.once)
              .toHaveBeenCalledWith(DomEvent.FINISH, jasmine.any(Function));
          mockListenableAnimate['once'].calls.argsFor(0)[1]();
          expect(mockClassList.remove).toHaveBeenCalledWith(MenuContainer['SHOW_CLASS_']);
          expect(mockListenableElement.dispatch).toHaveBeenCalledWith(
              MenuContainer.HIDE_EVENT,
              jasmine.any(Function));

          expect(MenuContainer['HIDE_ANIMATION_'].applyTo).toHaveBeenCalledWith(containerEl);
          expect(ListenableDom.of).toHaveBeenCalledWith(animate);
        });
      });

  describe('onBackdropClick_', () => {
    it('should hide the menu', () => {
      spyOn(container, 'hide_');
      container['onBackdropClick_']();
      expect(container['hide_']).toHaveBeenCalledWith();
    });
  });

  describe('onWindowResize_', () => {
    it('should update the content', () => {
      spyOn(container, 'updateContent_');
      container['onWindowResize_']();
      expect(container['updateContent_']).toHaveBeenCalledWith();
    });
  });

  describe('show_', () => {
    let containerEl;
    let mockContentEl;
    let mockListenableElement;
    let rootEl;

    beforeEach(() => {
      containerEl = Mocks.object('containerEl');
      mockListenableElement = jasmine.createSpyObj('ListenableElement', ['dispatch']);
      mockContentEl = jasmine.createSpyObj('ContentEl', ['getDistributedNodes']);
      rootEl = Mocks.object('rootEl');

      container['containerEl_'] = {eventTarget: containerEl};
      container['contentEl_'] = {eventTarget: mockContentEl};
      container['element_'] = mockListenableElement;
      container['rootEl_'] = {eventTarget: rootEl};
    });

    it('should measure the size of the first distributed element, play the show animation, add ' +
        'the "show" class, and dispatch the show event.',
        () => {
          let height = 123;
          let width = 456;
          let distributedElement = Mocks.object('distributedElement');
          distributedElement.clientHeight = height;
          distributedElement.clientWidth = width;
          mockContentEl.getDistributedNodes.and.returnValue([distributedElement]);

          let mockClassList = jasmine.createSpyObj('ClassList', ['add']);
          rootEl.classList = mockClassList;

          spyOn(Jsons, 'setTemporaryValue').and.callFake(
              (json: any, substitutions: any, callback: any) => {
                callback();
              });

          let mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
          spyOn(MenuContainer['BASE_SHOW_ANIMATION_'], 'appendKeyframe').and
              .returnValue(mockAnimation);

          container['show_']();

          expect(mockListenableElement.dispatch).toHaveBeenCalledWith(
              MenuContainer.SHOW_EVENT,
              jasmine.any(Function));

          mockListenableElement.dispatch.calls.argsFor(0)[1]();
          expect(mockClassList.add).toHaveBeenCalledWith(MenuContainer['SHOW_CLASS_']);
          expect(mockAnimation.applyTo).toHaveBeenCalledWith(containerEl);
          expect(MenuContainer['BASE_SHOW_ANIMATION_'].appendKeyframe).toHaveBeenCalledWith(
              jasmine.objectContaining({
                height: `${height}px`,
                width: `${width}px`,
              }));

          expect(Jsons.setTemporaryValue).toHaveBeenCalledWith(
              rootEl,
              {
                'style.display': 'block',
                'style.visibility': 'hidden',
              },
              jasmine.any(Function));
        });

    it('should do nothing if the distributed element cannot be found', () => {
      mockContentEl.getDistributedNodes.and.returnValue([]);
      let mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      rootEl.classList = mockClassList;

      container['show_']();

      expect(mockClassList.add).not.toHaveBeenCalled();
    });
  });

  describe('updateContent_', () => {
    let containerEl;
    let element;

    beforeEach(() => {
      containerEl = Mocks.object('containerEl');
      containerEl.style = {};
      element = Mocks.object('element');

      container['containerEl_'] = {eventTarget: containerEl};
      container['element_'] = {eventTarget: element};
    });

    it('should set the location of the container element correctly for TOP_LEFT anchor point',
        () => {
          element['gsAnchorTargetX'] = 12;
          element['gsAnchorTargetY'] = 34;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.TOP_LEFT);

          container['updateContent_']();

          expect(containerEl.style.top).toEqual('34px');
          expect(containerEl.style.right).toEqual('');
          expect(containerEl.style.bottom).toEqual('');
          expect(containerEl.style.left).toEqual('12px');
        });

    it('should set the location of the container element correctly for TOP_RIGHT anchor point',
        () => {
          element['gsAnchorTargetX'] = 12;
          element['gsAnchorTargetY'] = 34;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.TOP_RIGHT);

          container['updateContent_']();

          expect(containerEl.style.top).toEqual('34px');
          expect(containerEl.style.right).toEqual('188px');
          expect(containerEl.style.bottom).toEqual('');
          expect(containerEl.style.left).toEqual('');
        });

    it('should set the location of the container element correctly for BOTTOM_RIGHT anchor point',
        () => {
          element['gsAnchorTargetX'] = 12;
          element['gsAnchorTargetY'] = 34;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.BOTTOM_RIGHT);

          container['updateContent_']();

          expect(containerEl.style.top).toEqual('');
          expect(containerEl.style.right).toEqual('188px');
          expect(containerEl.style.bottom).toEqual('66px');
          expect(containerEl.style.left).toEqual('');
        });

    it('should set the location of the container element correctly for BOTTOM_LEFT anchor point',
        () => {
          element['gsAnchorTargetX'] = 12;
          element['gsAnchorTargetY'] = 34;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.BOTTOM_LEFT);

          container['updateContent_']();

          expect(containerEl.style.top).toEqual('');
          expect(containerEl.style.right).toEqual('');
          expect(containerEl.style.bottom).toEqual('66px');
          expect(containerEl.style.left).toEqual('12px');
        });

    it('should do nothing if anchorTargetX is not set', () => {
      element['gsAnchorTargetX'] = null;
      element['gsAnchorTargetY'] = 34;

      spyOn(container, 'getAnchorPoint_');

      container['updateContent_']();

      expect(container['getAnchorPoint_']).not.toHaveBeenCalled();
    });

    it('should do nothing if anchorTargetY is not set', () => {
      element['gsAnchorTargetX'] = 12;
      element['gsAnchorTargetY'] = null;

      spyOn(container, 'getAnchorPoint_');

      container['updateContent_']();

      expect(container['getAnchorPoint_']).not.toHaveBeenCalled();
    });
  });

  describe('onAttributeChanged', () => {
    it('should update the content when gs-anchor-point attribute was changed', () => {
      spyOn(container, 'updateContent_');

      container.onAttributeChanged('gs-anchor-target-x', 12, 23);

      expect(container['updateContent_']).toHaveBeenCalledWith();
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      let backdropEl = Mocks.object('backdropEl');
      let containerEl = Mocks.object('containerEl');
      let contentEl = Mocks.object('contentEl');
      let document = Mocks.object('document');
      let rootEl = Mocks.object('rootEl');

      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.callFake((query: string) => {
        switch (query) {
          case '.backdrop':
            return backdropEl;
          case '.container':
            return containerEl;
          case '.root':
            return rootEl;
          case 'content':
            return contentEl;
          default:
            return null;
        }
      });
      let element = Mocks.object('element');
      element.ownerDocument = document;
      element.shadowRoot = mockShadowRoot;
      element['gsAnchorPoint'] = null;

      spyOn(container, 'hide_');
      spyOn(container, 'show_');

      container.onCreated(element);

      expect(container['backdropEl_'].eventTarget).toEqual(backdropEl);
      expect(container['containerEl_'].eventTarget).toEqual(containerEl);
      expect(container['contentEl_'].eventTarget).toEqual(contentEl);
      expect(container['document_'].eventTarget).toEqual(document);
      expect(container['element_'].eventTarget).toEqual(element);
      expect(container['rootEl_'].eventTarget).toEqual(rootEl);

      element.hide();
      expect(container['hide_']).toHaveBeenCalledWith();

      element.show();
      expect(container['show_']).toHaveBeenCalledWith();

      expect(element['gsAnchorPoint']).toEqual(AnchorLocation.AUTO);
    });

    it('should use the existing anchor point if given', () => {
      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(Mocks.object('queryResult'));

      let anchorPoint = AnchorLocation.BOTTOM_RIGHT;
      let element = Mocks.object('element');
      element.ownerDocument = Mocks.object('document');
      element.shadowRoot = mockShadowRoot;
      element['gsAnchorPoint'] = anchorPoint;

      container.onCreated(element);

      expect(element['gsAnchorPoint']).toEqual(anchorPoint);
    });
  });

  describe('onInserted', () => {
    it('should listen to window resize event and update the content', () => {
      let mockListenableWindow = jasmine.createSpyObj('ListenableWindow', ['on']);
      mockListenableWindow.on.and.returnValue(Mocks.disposable('ListenableWindow.on'));
      container['windowEl_'] = mockListenableWindow;

      let mockListenableBackdrop = jasmine.createSpyObj('ListenableBackdrop', ['on']);
      mockListenableBackdrop.on.and.returnValue(Mocks.disposable('ListenableBackdrop.on'));
      container['backdropEl_'] = mockListenableBackdrop;

      spyOn(container, 'onBackdropClick_');
      spyOn(container, 'onWindowResize_');
      spyOn(container, 'updateContent_');

      container.onInserted();

      expect(container['updateContent_']).toHaveBeenCalledWith();

      expect(mockListenableBackdrop.on)
          .toHaveBeenCalledWith(DomEvent.CLICK, jasmine.any(Function));
      mockListenableBackdrop.on.calls.argsFor(0)[1]();
      expect(container['onBackdropClick_']).toHaveBeenCalledWith();

      expect(mockListenableWindow.on)
          .toHaveBeenCalledWith(DomEvent.RESIZE, jasmine.any(Function));
      mockListenableWindow.on.calls.argsFor(0)[1]();
      expect(container['onWindowResize_']).toHaveBeenCalledWith();
    });
  });
});
