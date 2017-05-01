import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Interval } from 'external/gs_tools/src/async';
import { DomEvent, ListenableDom } from 'external/gs_tools/src/event';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { Animation } from 'external/gs_tools/src/webc';

import { BaseTab } from './base-tab';


class TestTab extends BaseTab {
  constructor(themeService: any) {
    super(themeService);
  }

  protected getAnimationKeyframe(start: number, length: number): AnimationKeyframe {
    return {};
  }

  protected getLength(element: HTMLElement): number {
    return -1;
  }

  protected getStartPosition(element: HTMLElement): number {
    return -1;
  }

  protected setHighlightEl(start: number, length: number, highlightEl: HTMLElement): void { }
}

describe('section.BaseTab', () => {
  let tab: BaseTab;

  beforeEach(() => {
    tab = new TestTab(jasmine.createSpyObj('ThemeService', ['applyTheme']));
    TestDispose.add(tab);
  });

  describe('onAction_', () => {
    it('should update the selected tab', () => {
      const attribute = 'attribute';
      const mockTarget = jasmine.createSpyObj('Target', ['getAttribute']);
      mockTarget.getAttribute.and.returnValue(attribute);

      spyOn(tab.selectedTabHook_, 'set');

      tab['onAction_']({target: mockTarget} as Event);

      assert(tab.selectedTabHook_.set).to.haveBeenCalledWith(attribute);
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
      const mockElement = jasmine.createSpyObj('Element', ['dispatch']);
      tab['element_'] = mockElement;
      spyOn(tab, 'updateHighlight_');

      tab['onSelectedTabChanged_']();

      assert(mockElement.dispatch)
          .to.haveBeenCalledWith(BaseTab.CHANGE_EVENT, Matchers.any(Function));
      assert(tab['updateHighlight_']).to.haveBeenCalledWith();
    });

    it('should not update any events if there are no elements', () => {
      const mockElement = jasmine.createSpyObj('Element', ['dispatch']);
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
    it('should update the highlight element correctly', async () => {
      const currentStart = 12;
      const currentLength = 34;
      const targetStart = 56;
      const targetLength = 78;

      tab['highlightStart_'] = currentStart;
      tab['highlightLength_'] = currentLength;

      const animate = Mocks.object('animate');
      const mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      mockAnimation.applyTo.and.returnValue(animate);
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      const mockListenableAnimate = jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
      mockListenableAnimate.once.and.returnValue(Mocks.disposable('Animate.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

      const highlightEl = Mocks.object('highlightEl');
      tab['highlightEl_'] = highlightEl;

      const keyframe1 = Mocks.object('keyframe1');
      const keyframe2 = Mocks.object('keyframe2');
      Fakes.build(spyOn(tab, 'getAnimationKeyframe'))
          .when(currentStart).return(keyframe1)
          .when(targetStart).return(keyframe2);

      spyOn(tab, 'setHighlightEl');

      const promise = tab['setHighlight_'](targetStart, targetLength);

      assert(mockListenableAnimate.once)
          .to.haveBeenCalledWith(DomEvent.FINISH, Matchers.any(Function), tab);
      mockListenableAnimate.once.calls.argsFor(0)[1]();

      await promise;
      assert(tab['setHighlightEl']).to
          .haveBeenCalledWith(targetStart, targetLength, highlightEl);
      assert(tab['highlightStart_']).to.equal(targetStart);
      assert(tab['highlightLength_']).to.equal(targetLength);

      assert(ListenableDom.of).to.haveBeenCalledWith(animate);
      assert(mockAnimation.applyTo).to.haveBeenCalledWith(highlightEl);
      assert(Animation.newInstance).to.haveBeenCalledWith(
          [keyframe1, keyframe2],
          Matchers.any(Object));
      assert(tab['getAnimationKeyframe']).to.haveBeenCalledWith(currentStart, currentLength);
      assert(tab['getAnimationKeyframe']).to.haveBeenCalledWith(targetStart, targetLength);
    });

    it('should set the start to the destination midpoint if the current length is 0', () => {
      const targetStart = 56;
      const targetLength = 78;

      tab['highlightStart_'] = 12;
      tab['highlightLength_'] = 0;

      const mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      mockAnimation.applyTo.and.returnValue(Mocks.object('animate'));
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      const mockListenableAnimate =
          jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
      mockListenableAnimate.once.and.returnValue(Mocks.disposable('Animate.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

      tab['highlightEl_'] = Mocks.object('highlightEl');

      spyOn(tab, 'setHighlightEl');
      spyOn(tab, 'getAnimationKeyframe').and.returnValue({});

      tab['setHighlight_'](targetStart, targetLength);
      assert(tab['getAnimationKeyframe']).to.haveBeenCalledWith(95, 0);
    });

    it('should not update if the highlight is up to date', () => {
      const targetStart = 56;
      const targetLength = 78;

      tab['highlightStart_'] = targetStart;
      tab['highlightLength_'] = targetLength;

      spyOn(Animation, 'newInstance');

      tab['setHighlight_'](targetStart, targetLength);

      assert(Animation.newInstance).toNot.haveBeenCalled();
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      const tabContainer = Mocks.object('tabContainer');
      const highlightEl = Mocks.object('highlightEl');
      const highlightContainer = Mocks.object('highlightContainer');

      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      Fakes.build(mockShadowRoot.querySelector)
          .when('.highlight-container').return(highlightContainer)
          .when('.highlight').return(highlightEl)
          .when('.tab-container').return(tabContainer);
      const element = Mocks.object('element');
      element.shadowRoot = mockShadowRoot;

      spyOn(tab, 'onTick_');
      spyOn(tab['mutationObserver_'], 'observe');
      spyOn(tab['interval_'], 'start');
      spyOn(tab, 'listenTo');

      tab.onCreated(element);

      assert(tab['mutationObserver_']['observe']).to.haveBeenCalledWith(element, {childList: true});

      assert(tab['interval_'].start).to.haveBeenCalledWith();
      assert(tab.listenTo)
          .to.haveBeenCalledWith(tab['interval_'], Interval.TICK_EVENT, tab['onTick_']);

      assert(tab['tabContainer_'].getEventTarget()).to.equal(tabContainer);
      assert(tab['highlightEl_']).to.equal(highlightEl);
      assert(tab['highlightContainerEl_'].getEventTarget()).to.equal(highlightContainer);
    });

    it('should throw error if shadow root is null', () => {
      const element = Mocks.object('element');
      element.shadowRoot = null;
      assert(() => {
        tab.onCreated(element);
      }).to.throwError(/root is null/);
    });
  });

  describe('onInserted', () => {
    it('should listen to the gse-action event', () => {
      const mockElement = jasmine.createSpyObj('Element', ['on']);
      tab['element_'] = mockElement;

      spyOn(tab, 'onAction_');
      spyOn(tab, 'listenTo');

      tab.onInserted();

      assert(tab.listenTo).to.haveBeenCalledWith(mockElement, 'gse-action', tab['onAction_']);
    });

    it('should not throw error if there are no elements', () => {
      tab['element_'] = null;

      spyOn(tab, 'onAction_');
      spyOn(tab, 'listenTo');

      assert(() => {
        tab.onInserted();
      }).toNot.throw();
    });
  });

  describe('updateHighlight_', () => {
    it('should grab the destination start and length correctly', async () => {
      const start = 12;
      const length = 34;
      const selectedId = 'selectedId';
      spyOn(tab.selectedTabHook_, 'get').and.returnValue(selectedId);

      const selectedTab = Mocks.object('selectedTab');
      spyOn(tab, 'getStartPosition').and.returnValue(start);
      spyOn(tab, 'getLength').and.returnValue(length);

      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(selectedTab);
      tab['element_'] = {getEventTarget: () => mockElement} as ListenableDom<HTMLElement>;

      spyOn(tab, 'setHighlight_').and.returnValue(Promise.resolve());

      await tab['updateHighlight_']();
      assert(tab['setHighlight_']).to.haveBeenCalledWith(start, length);
      assert(mockElement.querySelector).to.haveBeenCalledWith(`[gs-tab-id="${selectedId}"]`);
      assert(tab['getStartPosition']).to.haveBeenCalledWith(selectedTab);
      assert(tab['getLength']).to.haveBeenCalledWith(selectedTab);
    });

    it('should shrink to 0 length if there are no selected Ids', async () => {
      const start = 12;
      const length = 34;
      spyOn(tab.selectedTabHook_, 'get').and.returnValue(null);

      tab['highlightStart_'] = start;
      tab['highlightLength_'] = length;

      const element = Mocks.object('element');
      tab['element_'] = {getEventTarget: () => element} as ListenableDom<HTMLElement>;

      spyOn(tab, 'setHighlight_').and.returnValue(Promise.resolve());

      await tab['updateHighlight_']();
      assert(tab['setHighlight_']).to.haveBeenCalledWith(29, 34);
    });

    it('should reject if there are no elements', async (done: any) => {
      spyOn(tab.selectedTabHook_, 'get').and.returnValue(null);
      tab['element_'] = null;

      try {
        await tab['updateHighlight_']();
        done.fail();
      } catch (e) {
        assert(e as string).to.match(/elements are found/);
      }
    });
  });
});
