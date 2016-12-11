import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {Animation} from 'external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from 'external/gs_tools/src/event';
import {Interval} from 'external/gs_tools/src/async';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {HorizontalTab} from './horizontal-tab';


describe('section.HorizontalTab', () => {
  let tab;

  beforeEach(() => {
    tab = new HorizontalTab();
    TestDispose.add(tab);
  });

  describe('onAction_', () => {
    it('should update the selected tab', () => {
      let attribute = 'attribute';
      let mockTarget = jasmine.createSpyObj('Target', ['getAttribute']);
      mockTarget.getAttribute.and.returnValue(attribute);

      let element = Mocks.object('element');
      tab['element_'] = {getEventTarget: () => element};

      tab['onAction_']({target: mockTarget});

      assert(element['gsSelectedTab']).to.equal(attribute);
      assert(mockTarget.getAttribute).to.haveBeenCalledWith('gs-tab-id');
    });
  });

  describe('onMutate_', () => {
    it('should update the highlight', () => {
      spyOn(tab, 'updateHighlight_');
      tab['onMutate_']();
      assert(tab['updateHighlight_']).to.haveBeenCalledWith();
    });
  });

  describe('onSelectedTabChanged_', () => {
    it('should dispatch the change event and update highlight', () => {
      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);
      tab['element_'] = mockElement;
      spyOn(tab, 'updateHighlight_');

      tab['onSelectedTabChanged_']();

      assert(mockElement.dispatch)
          .to.haveBeenCalledWith(HorizontalTab.CHANGE_EVENT, Matchers.any(Function));
      assert(tab['updateHighlight_']).to.haveBeenCalledWith();
    });

    it('should not update any events if there are no elements', () => {
      let mockElement = jasmine.createSpyObj('Element', ['dispatch']);
      tab['element_'] = null;
      spyOn(tab, 'updateHighlight_');

      tab['onSelectedTabChanged_']();

      assert(mockElement.dispatch).toNot.haveBeenCalled();
      assert(tab['updateHighlight_']).to.haveBeenCalledWith();
    });
  });

  describe('onTick_', () => {
    it('should update the highlight', () => {
      spyOn(tab, 'updateHighlight_');
      tab['onTick_']();
      assert(tab['updateHighlight_']).to.haveBeenCalledWith();
    });
  });

  describe('setHighlight_', () => {
    it('should update the highlight element correctly', (done: any) => {
      let left = 12;
      let width = 34;
      let targetLeft = 56;
      let targetWidth = 78;

      tab['highlightLeft_'] = left;
      tab['highlightWidth_'] = width;

      let animate = Mocks.object('animate');
      let mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      mockAnimation.applyTo.and.returnValue(animate);
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      let mockListenableAnimate = jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
      mockListenableAnimate.once.and.returnValue(Mocks.disposable('Animate.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

      let highlightEl = Mocks.object('highlightEl');
      highlightEl.style = {};
      tab['highlightEl_'] = {getEventTarget: () => highlightEl};

      tab['setHighlight_'](targetLeft, targetWidth)
          .then(() => {
            assert(highlightEl.style)
                .to.equal({left: `${targetLeft}px`, width: `${targetWidth}px`});
            assert(tab['highlightLeft_']).to.equal(targetLeft);
            assert(tab['highlightWidth_']).to.equal(targetWidth);

            assert(ListenableDom.of).to.haveBeenCalledWith(animate);
            assert(mockAnimation.applyTo).to.haveBeenCalledWith(highlightEl);
            assert(Animation.newInstance).to.haveBeenCalledWith(
                [
                  {left: `${left}px`, width: `${width}px`},
                  {left: `${targetLeft}px`, width: `${targetWidth}px`},
                ],
                Matchers.any(Object));
            done();
          }, done.fail);

      assert(mockListenableAnimate.once)
          .to.haveBeenCalledWith(DomEvent.FINISH, Matchers.any(Function), tab);
      mockListenableAnimate.once.calls.argsFor(0)[1]();
    });

    it('should set the left to the destination midpoint if the current width is 0', () => {
      let targetLeft = 56;
      let targetWidth = 78;

      tab['highlightLeft_'] = 12;
      tab['highlightWidth_'] = 0;

      let mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      mockAnimation.applyTo.and.returnValue(Mocks.object('animate'));
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      let mockListenableAnimate = jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
      mockListenableAnimate.once.and.returnValue(Mocks.disposable('Animate.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

      let highlightEl = Mocks.object('highlightEl');
      highlightEl.style = {};
      tab['highlightEl_'] = {getEventTarget: () => highlightEl};

      tab['setHighlight_'](targetLeft, targetWidth);

      assert(Animation.newInstance).to.haveBeenCalledWith(
          [
            {left: '95px', width: '0px'},
            Matchers.any(Object),
          ],
          Matchers.any(Object));
    });

    it('should not update if the highlight is up to date', () => {
      let targetLeft = 56;
      let targetWidth = 78;

      tab['highlightLeft_'] = targetLeft;
      tab['highlightWidth_'] = targetWidth;

      spyOn(Animation, 'newInstance');

      tab['setHighlight_'](targetLeft, targetWidth);

      assert(Animation.newInstance).toNot.haveBeenCalled();
    });
  });

  describe('updateHighlight_', () => {
    it('should grab the destination width and left correctly', (done: any) => {
      let left = 12;
      let width = 34;
      let selectedId = 'selectedId';

      let selectedTab = Mocks.object('selectedTab');
      selectedTab.offsetLeft = left;
      selectedTab.clientWidth = width;

      let mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(selectedTab);
      mockElement['gsSelectedTab'] = selectedId;
      tab['element_'] = {getEventTarget: () => mockElement};

      spyOn(tab, 'setHighlight_').and.returnValue(Promise.resolve());

      tab['updateHighlight_']()
          .then(() => {
            assert(tab['setHighlight_']).to.haveBeenCalledWith(left, width);
            assert(mockElement.querySelector).to.haveBeenCalledWith(`[gs-tab-id="${selectedId}"]`);
            done();
          }, done.fail);
    });

    it('should shrink to 0 width if there are no selected Ids', (done: any) => {
      let left = 12;
      let width = 34;

      tab['highlightLeft_'] = left;
      tab['highlightWidth_'] = width;

      let element = Mocks.object('element');
      tab['element_'] = {getEventTarget: () => element};

      spyOn(tab, 'setHighlight_').and.returnValue(Promise.resolve());

      tab['updateHighlight_']()
          .then(() => {
            assert(tab['setHighlight_']).to.haveBeenCalledWith(29, 34);
            done();
          }, done.fail);
    });

    it('should reject if there are no elements', (done: any) => {
      tab['element_'] = null;

      tab['updateHighlight_']().then(
          done.fail,
          (error: string) => {
            assert(error).to.match(/elements are found/);
            done();
          });
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      let tabContainer = Mocks.object('tabContainer');
      let highlightEl = Mocks.object('highlightEl');
      let highlightContainer = Mocks.object('highlightContainer');

      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.callFake((query: string) => {
        switch (query) {
          case '.highlight-container':
            return highlightContainer;
          case '.highlight':
            return highlightEl;
          case '.tab-container':
            return tabContainer;
        }
      });
      let element = Mocks.object('element');
      element.shadowRoot = mockShadowRoot;

      spyOn(tab, 'onTick_');
      spyOn(tab['mutationObserver_'], 'observe');
      spyOn(tab['interval_'], 'on').and.returnValue(Mocks.disposable('Interval.on'));
      spyOn(tab['interval_'], 'start');

      tab.onCreated(element);

      assert(tab['mutationObserver_']['observe']).to.haveBeenCalledWith(element, {childList: true});

      assert(tab['interval_'].start).to.haveBeenCalledWith();
      assert(tab['interval_'].on)
          .to.haveBeenCalledWith(Interval.TICK_EVENT, tab['onTick_'], tab);

      assert(tab['tabContainer_'].getEventTarget()).to.equal(tabContainer);
      assert(tab['highlightEl_'].getEventTarget()).to.equal(highlightEl);
      assert(tab['highlightContainerEl_'].getEventTarget()).to.equal(highlightContainer);
    });
  });

  describe('onInserted', () => {
    it('should listen to the gse-action event', () => {
      let mockElement = jasmine.createSpyObj('Element', ['on']);
      tab['element_'] = mockElement;

      spyOn(tab, 'onAction_');

      tab.onInserted();

      assert(tab['element_'].on).to.haveBeenCalledWith('gse-action', tab['onAction_'], tab);
    });

    it('should not throw error if there are no elements', () => {
      tab['element_'] = null;

      spyOn(tab, 'onAction_');

      assert(() => {
        tab.onInserted();
      }).toNot.throw();
    });
  });
});
