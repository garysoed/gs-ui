import {TestBase} from '../test-base';
TestBase.setup();

import {AnchorLocation} from './anchor-location';
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
    let containerEl;
    let document;
    let element;

    beforeEach(() => {
      containerEl = Mocks.object('containerEl');
      document = Mocks.object('document');
      element = Mocks.object('element');

      container['containerEl_'] = containerEl;
      container['document_'] = document;
      container['element_'] = element;
    });

    it('should return TOP_LEFT if the anchor target is at the top left of the screen', () => {
      document.documentElement = {
        clientHeight: 100,
        clientWidth: 100,
      };
      element['gsAnchorPoint'] = AnchorLocation.AUTO;
      element['gsAnchorTargetX'] = 25;
      element['gsAnchorTargetY'] = 25;

      expect(container['getAnchorPoint_']()).toEqual(AnchorLocation.TOP_LEFT);
    });

    it('should return TOP_RIGHT if the anchor target is at the top right of the screen', () => {
      document.documentElement = {
        clientHeight: 100,
        clientWidth: 100,
      };
      element['gsAnchorPoint'] = AnchorLocation.AUTO;
      element['gsAnchorTargetX'] = 75;
      element['gsAnchorTargetY'] = 25;

      expect(container['getAnchorPoint_']()).toEqual(AnchorLocation.TOP_RIGHT);
    });

    it('should return BOTTOM_RIGHT if the anchor target is at the bottom right of the screen',
        () => {
          document.documentElement = {
            clientHeight: 100,
            clientWidth: 100,
          };
          element['gsAnchorPoint'] = AnchorLocation.AUTO;
          element['gsAnchorTargetX'] = 75;
          element['gsAnchorTargetY'] = 75;

          expect(container['getAnchorPoint_']()).toEqual(AnchorLocation.BOTTOM_RIGHT);
        });

    it('should return BOTTOM_LEFT if the anchor target is at the bottom left of the screen',
        () => {
          document.documentElement = {
            clientHeight: 100,
            clientWidth: 100,
          };
          element['gsAnchorPoint'] = AnchorLocation.AUTO;
          element['gsAnchorTargetX'] = 25;
          element['gsAnchorTargetY'] = 75;

          expect(container['getAnchorPoint_']()).toEqual(AnchorLocation.BOTTOM_LEFT);
        });

    it('should return the set anchor point if it is not AUTO', () => {
      element['gsAnchorPoint'] = AnchorLocation.TOP_RIGHT;

      expect(container['getAnchorPoint_']()).toEqual(AnchorLocation.TOP_RIGHT);
    });
  });

  describe('hide_', () => {
    it('should play the hide animation and remove the "show" class', () => {
      let mockClassList = jasmine.createSpyObj('ClassList', ['remove']);
      let rootEl = Mocks.object('rootEl');
      rootEl.classList = mockClassList;
      container['rootEl_'] = rootEl;

      let containerEl = Mocks.object('containerEl');
      container['containerEl_'] = containerEl;

      let animate = Mocks.object('animate');
      spyOn(MenuContainer['HIDE_ANIMATION_'], 'applyTo').and.returnValue(animate);

      let mockListenableDom = jasmine.createSpyObj('ListenableDom', ['dispose', 'once']);
      mockListenableDom.once.and.returnValue(Mocks.disposable('ListenableDom.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableDom);

      container['hide_']();

      expect(MenuContainer['HIDE_ANIMATION_'].applyTo).toHaveBeenCalledWith(containerEl);
      expect(ListenableDom.of).toHaveBeenCalledWith(animate);
      expect(mockListenableDom.once).toHaveBeenCalledWith(DomEvent.FINISH, jasmine.any(Function));

      mockListenableDom['once'].calls.argsFor(0)[1]();
      expect(mockClassList.remove).toHaveBeenCalledWith(MenuContainer['SHOW_CLASS_']);
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
    let rootEl;

    beforeEach(() => {
      containerEl = Mocks.object('containerEl');
      mockContentEl = jasmine.createSpyObj('ContentEl', ['getDistributedNodes']);
      rootEl = Mocks.object('rootEl');

      container['containerEl_'] = containerEl;
      container['contentEl_'] = mockContentEl;
      container['rootEl_'] = rootEl;
    });

    it('should measure the size of the first distributed element, play the show animation, and ' +
        'add the "show" class',
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

      container['containerEl_'] = containerEl;
      container['element_'] = element;
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
      let containerEl = Mocks.object('containerEl');
      let contentEl = Mocks.object('contentEl');
      let document = Mocks.object('document');
      let rootEl = Mocks.object('rootEl');

      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.callFake((query: string) => {
        switch (query) {
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

      spyOn(container, 'hide_');
      spyOn(container, 'show_');

      container.onCreated(element);

      expect(container['containerEl_']).toEqual(containerEl);
      expect(container['contentEl_']).toEqual(contentEl);
      expect(container['document_']).toEqual(document);
      expect(container['element_']).toEqual(element);
      expect(container['rootEl_']).toEqual(rootEl);

      element.hide();
      expect(container['hide_']).toHaveBeenCalledWith();

      element.show();
      expect(container['show_']).toHaveBeenCalledWith();
    });
  });

  describe('onInserted', () => {
    it('should listen to window resize event and update the content', () => {
      let mockListenableDom = jasmine.createSpyObj('ListenableDom', ['dispose', 'on']);
      mockListenableDom.on.and.returnValue(Mocks.disposable('ListenableDom.on'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableDom);

      spyOn(container, 'onWindowResize_');
      spyOn(container, 'updateContent_');

      container.onInserted();

      expect(container['updateContent_']).toHaveBeenCalledWith();
      expect(mockListenableDom.on).toHaveBeenCalledWith(DomEvent.RESIZE, jasmine.any(Function));
      mockListenableDom.on.calls.argsFor(0)[1]();
      expect(container['onWindowResize_']).toHaveBeenCalledWith();

      expect(ListenableDom.of).toHaveBeenCalledWith(window);
    });
  });
});
