import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {Jsons} from 'external/gs_tools/src/collection';
import {DomEvent, ListenableDom} from 'external/gs_tools/src/event';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {AnchorLocation} from './anchor-location';
import {Anchors} from './anchors';
import {MenuContainer} from './menu-container';


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
      container['element_'] = {getEventTarget: () => element};

      let window = Mocks.object('window');
      container['windowEl_'] = {getEventTarget: () => window};

      let anchorLocation = AnchorLocation.TOP_LEFT;
      spyOn(Anchors, 'resolveAutoLocation').and.returnValue(anchorLocation);

      assert(container['getAnchorPoint_']()).to.equal(anchorLocation);
      assert(Anchors.resolveAutoLocation)
          .to.haveBeenCalledWith(anchorTargetX, anchorTargetY, window);
    });

    it('should return the set anchor point if it is not AUTO', () => {
      let element = Mocks.object('element');
      element['gsAnchorPoint'] = AnchorLocation.TOP_RIGHT;
      container['element_'] = {getEventTarget: () => element};

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
      let containerEl = Mocks.object('containerEl');
      container['containerEl_'] = {getEventTarget: () => containerEl};

      let animate = Mocks.object('animate');
      spyOn(MenuContainer['HIDE_ANIMATION_'], 'applyTo').and.returnValue(animate);

      let mockListenableAnimate =
          jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
      mockListenableAnimate.once.and.returnValue(Mocks.disposable('ListenableAnimate.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

      let mockListenableElement = jasmine.createSpyObj('ListenableElement', ['dispatch']);
      container['element_'] = mockListenableElement;

      spyOn(container, 'onFinishAnimate_');

      container['hide_']();

      assert(mockListenableAnimate.once)
          .to.haveBeenCalledWith(DomEvent.FINISH, container['onFinishAnimate_'], container);
      assert(MenuContainer['HIDE_ANIMATION_'].applyTo).to.haveBeenCalledWith(containerEl);
      assert(ListenableDom.of).to.haveBeenCalledWith(animate);
    });
  });

  describe('onBackdropClick_', () => {
    it('should hide the menu', () => {
      spyOn(container, 'hide_');
      container['onBackdropClick_']();
      assert(container['hide_']).to.haveBeenCalledWith();
    });
  });

  describe('onFinishAnimate_', () => {
    it('should remove the SHOW class and dispatch the HIDE event', () => {
      let mockRootElement = Mocks.element();
      container['rootEl_'] = {getEventTarget: () => mockRootElement};

      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);
      spyOn(container, 'getElement').and.returnValue(mockElement);

      spyOn(mockRootElement.classList, 'remove');

      container['onFinishAnimate_']();

      assert(mockRootElement.classList.remove).to.haveBeenCalledWith(MenuContainer['SHOW_CLASS_']);
      assert(mockElement.dispatch).to.haveBeenCalledWith(
          MenuContainer.HIDE_EVENT,
          Matchers.any(Function));
    });

    it('should not throw error if there are no elements', () => {
      let mockRootElement = Mocks.element();
      container['rootEl_'] = {getEventTarget: () => mockRootElement};

      spyOn(container, 'getElement').and.returnValue(null);

      spyOn(mockRootElement.classList, 'remove');

      assert(() => {
        container['onFinishAnimate_']();
      }).toNot.throw();

      assert(mockRootElement.classList.remove).to.haveBeenCalledWith(MenuContainer['SHOW_CLASS_']);
    });
  });

  describe('onWindowResize_', () => {
    it('should update the content', () => {
      spyOn(container, 'updateContent_');
      container['onWindowResize_']();
      assert(container['updateContent_']).to.haveBeenCalledWith();
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

      container['containerEl_'] = {getEventTarget: () => containerEl};
      container['contentEl_'] = {getEventTarget: () => mockContentEl};
      container['element_'] = mockListenableElement;
      container['rootEl_'] = {getEventTarget: () => rootEl};
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

          assert(mockListenableElement.dispatch).to.haveBeenCalledWith(
              MenuContainer.SHOW_EVENT,
              Matchers.any(Function));

          mockListenableElement.dispatch.calls.argsFor(0)[1]();
          assert(mockClassList.add).to.haveBeenCalledWith(MenuContainer['SHOW_CLASS_']);
          assert(mockAnimation.applyTo).to.haveBeenCalledWith(containerEl);
          assert(MenuContainer['BASE_SHOW_ANIMATION_'].appendKeyframe).to.haveBeenCalledWith(
              jasmine.objectContaining({
                height: `${height}px`,
                width: `${width}px`,
              }));

          assert(Jsons.setTemporaryValue).to.haveBeenCalledWith(
              rootEl,
              {
                'style.display': 'block',
                'style.visibility': 'hidden',
              },
              <any> Matchers.any(Function));
        });

    it('should do nothing if the distributed element cannot be found', () => {
      mockContentEl.getDistributedNodes.and.returnValue([]);
      let mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      rootEl.classList = mockClassList;

      container['show_']();

      assert(mockClassList.add).toNot.haveBeenCalled();
    });

    it('should not throw error if there are no elements', () => {
      container['element_'] = null;

      let distributedElement = Mocks.object('distributedElement');
      distributedElement.clientHeight = 123;
      distributedElement.clientWidth = 456;
      mockContentEl.getDistributedNodes.and.returnValue([distributedElement]);

      spyOn(Jsons, 'setTemporaryValue').and.callFake(
          (json: any, substitutions: any, callback: any) => {
            callback();
          });

      let mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      spyOn(MenuContainer['BASE_SHOW_ANIMATION_'], 'appendKeyframe').and
          .returnValue(mockAnimation);

      assert(() => {
        container['show_']();
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

      container['containerEl_'] = {getEventTarget: () => containerEl};
      container['element_'] = {getEventTarget: () => element};
    });

    it('should set the location of the container element correctly for TOP_LEFT anchor point',
        () => {
          element['gsAnchorTargetX'] = 12;
          element['gsAnchorTargetY'] = 34;

          window.innerHeight = 100;
          window.innerWidth = 200;

          spyOn(container, 'getAnchorPoint_').and.returnValue(AnchorLocation.TOP_LEFT);

          container['updateContent_']();

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

          container['updateContent_']();

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

          container['updateContent_']();

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

          container['updateContent_']();

          assert(containerEl.style.top).to.equal('');
          assert(containerEl.style.right).to.equal('');
          assert(containerEl.style.bottom).to.equal('66px');
          assert(containerEl.style.left).to.equal('12px');
        });

    it('should do nothing if anchorTargetX is not set', () => {
      element['gsAnchorTargetX'] = null;
      element['gsAnchorTargetY'] = 34;

      spyOn(container, 'getAnchorPoint_');

      container['updateContent_']();

      assert(container['getAnchorPoint_']).toNot.haveBeenCalled();
    });

    it('should do nothing if anchorTargetY is not set', () => {
      element['gsAnchorTargetX'] = 12;
      element['gsAnchorTargetY'] = null;

      spyOn(container, 'getAnchorPoint_');

      container['updateContent_']();

      assert(container['getAnchorPoint_']).toNot.haveBeenCalled();
    });

    it('should not throw error if there are no elements', () => {
      spyOn(container, 'getElement').and.returnValue(null);

      assert(() => {
        container['updateContent_']();
      }).toNot.throw();
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

      assert(container['backdropEl_'].getEventTarget()).to.equal(backdropEl);
      assert(container['containerEl_'].getEventTarget()).to.equal(containerEl);
      assert(container['contentEl_'].getEventTarget()).to.equal(contentEl);
      assert(container['document_'].getEventTarget()).to.equal(document);
      assert(container['element_'].getEventTarget()).to.equal(element);
      assert(container['rootEl_'].getEventTarget()).to.equal(rootEl);

      element.hide();
      assert(container['hide_']).to.haveBeenCalledWith();

      element.show();
      assert(container['show_']).to.haveBeenCalledWith();

      assert(element['gsAnchorPoint']).to.equal(AnchorLocation.AUTO);
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

      assert(element['gsAnchorPoint']).to.equal(anchorPoint);
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

      assert(container['updateContent_']).to.haveBeenCalledWith();

      assert(mockListenableBackdrop.on)
          .to.haveBeenCalledWith(DomEvent.CLICK, container['onBackdropClick_'], container);
      assert(mockListenableWindow.on)
          .to.haveBeenCalledWith(DomEvent.RESIZE, container['onWindowResize_'], container);
    });
  });
});
