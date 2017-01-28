import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {Interval} from 'external/gs_tools/src/async';
import {DomEvent, ListenableDom} from 'external/gs_tools/src/event';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';
import {Animation} from 'external/gs_tools/src/webc';

import {BaseTab} from './base-tab';


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
      let attribute = 'attribute';
      let mockTarget = jasmine.createSpyObj('Target', ['getAttribute']);
      mockTarget.getAttribute.and.returnValue(attribute);

      spyOn(tab, 'setAttribute');

      tab['onAction_'](<Event> {target: mockTarget});

      assert(tab.setAttribute).to.haveBeenCalledWith('gsSelectedTab', attribute);
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
          .to.haveBeenCalledWith(BaseTab.CHANGE_EVENT, Matchers.any(Function));
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
      let currentStart = 12;
      let currentLength = 34;
      let targetStart = 56;
      let targetLength = 78;

      tab['highlightStart_'] = currentStart;
      tab['highlightLength_'] = currentLength;

      let animate = Mocks.object('animate');
      let mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      mockAnimation.applyTo.and.returnValue(animate);
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      let mockListenableAnimate = jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
      mockListenableAnimate.once.and.returnValue(Mocks.disposable('Animate.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

      let highlightEl = Mocks.object('highlightEl');
      tab['highlightEl_'] = highlightEl;

      let keyframe1 = Mocks.object('keyframe1');
      let keyframe2 = Mocks.object('keyframe2');
      spyOn(tab, 'getAnimationKeyframe').and.callFake((start: any) => {
        switch (start) {
          case currentStart:
            return keyframe1;
          case targetStart:
            return keyframe2;
        }
      });

      spyOn(tab, 'setHighlightEl');

      tab['setHighlight_'](targetStart, targetLength)
          .then(() => {
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
            done();
          }, done.fail);

      assert(mockListenableAnimate.once)
          .to.haveBeenCalledWith(DomEvent.FINISH, Matchers.any(Function), tab);
      mockListenableAnimate.once.calls.argsFor(0)[1]();
    });

    it('should set the start to the destination midpoint if the current length is 0', () => {
      let targetStart = 56;
      let targetLength = 78;

      tab['highlightStart_'] = 12;
      tab['highlightLength_'] = 0;

      let mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      mockAnimation.applyTo.and.returnValue(Mocks.object('animate'));
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      let mockListenableAnimate =
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
      let targetStart = 56;
      let targetLength = 78;

      tab['highlightStart_'] = targetStart;
      tab['highlightLength_'] = targetLength;

      spyOn(Animation, 'newInstance');

      tab['setHighlight_'](targetStart, targetLength);

      assert(Animation.newInstance).toNot.haveBeenCalled();
    });
  });

  describe('updateHighlight_', () => {
    it('should grab the destination start and length correctly', (done: any) => {
      let start = 12;
      let length = 34;
      let selectedId = 'selectedId';

      let selectedTab = Mocks.object('selectedTab');
      spyOn(tab, 'getStartPosition').and.returnValue(start);
      spyOn(tab, 'getLength').and.returnValue(length);

      let mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(selectedTab);
      mockElement['gsSelectedTab'] = selectedId;
      tab['element_'] = <ListenableDom<HTMLElement>> {getEventTarget: () => mockElement};

      spyOn(tab, 'setHighlight_').and.returnValue(Promise.resolve());

      tab['updateHighlight_']()
          .then(() => {
            assert(tab['setHighlight_']).to.haveBeenCalledWith(start, length);
            assert(mockElement.querySelector).to.haveBeenCalledWith(`[gs-tab-id="${selectedId}"]`);
            assert(tab['getStartPosition']).to.haveBeenCalledWith(selectedTab);
            assert(tab['getLength']).to.haveBeenCalledWith(selectedTab);
            done();
          }, done.fail);
    });

    it('should shrink to 0 length if there are no selected Ids', (done: any) => {
      let start = 12;
      let length = 34;

      tab['highlightStart_'] = start;
      tab['highlightLength_'] = length;

      let element = Mocks.object('element');
      tab['element_'] = <ListenableDom<HTMLElement>> {getEventTarget: () => element};

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
      assert(tab['highlightEl_']).to.equal(highlightEl);
      assert(tab['highlightContainerEl_'].getEventTarget()).to.equal(highlightContainer);
    });
  });

  describe('onInserted', () => {
    it('should listen to the gse-action event', () => {
      let mockElement = jasmine.createSpyObj('Element', ['on']);
      tab['element_'] = mockElement;

      spyOn(tab, 'onAction_');

      tab.onInserted();

      assert(mockElement.on).to.haveBeenCalledWith('gse-action', tab['onAction_'], tab);
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
