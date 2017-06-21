import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { Animation } from 'external/gs_tools/src/webc';

import { BaseTab, HIGHLIGHT_EL, HIGHLIGHT_MOVE_ANIMATION } from '../section/base-tab';


class TestTab extends BaseTab {
  constructor(themeService: any) {
    super(themeService);
  }

  protected getAnimationKeyframe(): AnimationKeyframe {
    return {};
  }

  protected getLength(): number {
    return -1;
  }

  protected getStartPosition(): number {
    return -1;
  }

  protected parseAnimationKeyframe(): {length: number, start: number} {
    return {length: 0, start: 0};
  }

  protected setHighlightEl(): void { }
}

describe('section.BaseTab', () => {
  let tab: BaseTab;

  beforeEach(() => {
    tab = new TestTab(jasmine.createSpyObj('ThemeService', ['applyTheme']));
    TestDispose.add(tab);
  });

  describe('onAnimationFinish_', () => {
    it(`should parse the keyframe and update the highlight element`, () => {
      const keyframe = Mocks.object('keyframe');
      const keyframes = [Mocks.object('otherKeyframe'), keyframe];
      const detail = {id: HIGHLIGHT_MOVE_ANIMATION, keyframes};
      const highlightEl = Mocks.object('highlightEl');

      const start = 12;
      const length = 34;
      spyOn(tab, 'parseAnimationKeyframe').and.returnValue({start, length});
      spyOn(tab, 'setHighlightEl');

      tab.onAnimationFinish_({detail}, highlightEl);
      assert(tab['parseAnimationKeyframe']).to.haveBeenCalledWith(keyframe);
      assert(tab['setHighlightEl']).to.haveBeenCalledWith(start, length, highlightEl);
    });

    it(`should do nothing if the ID is incorrect`, () => {
      const keyframes = Mocks.object('keyframes');
      const detail = {id: Symbol('otherId'), keyframes};
      const highlightEl = Mocks.object('highlightEl');

      spyOn(tab, 'parseAnimationKeyframe');
      spyOn(tab, 'setHighlightEl');

      tab.onAnimationFinish_({detail}, highlightEl);
      assert(tab['parseAnimationKeyframe']).toNot.haveBeenCalled();
      assert(tab['setHighlightEl']).toNot.haveBeenCalled();
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      spyOn(tab['interval_'], 'start');
      tab.onCreated();
      assert(tab['interval_'].start).to.haveBeenCalledWith();
    });
  });

  describe('onSelectedTabChanged_', () => {
    it('should dispatch the change event', () => {
      const mockDispatcher = jasmine.createSpy('Dispatcher');
      tab.onSelectedTabChanged_(mockDispatcher);

      assert(mockDispatcher).to.haveBeenCalledWith(BaseTab.CHANGE_EVENT, {});
    });
  });

  describe('setHighlight_', () => {
    it('should update the highlight element correctly', () => {
      const currentStart = 12;
      const currentLength = 34;
      const targetStart = 56;
      const targetLength = 78;

      const animate = Mocks.object('animate');
      const mockAnimation = jasmine.createSpyObj('Animation', ['start']);
      mockAnimation.start.and.returnValue(animate);
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      const keyframe1 = Mocks.object('keyframe1');
      const keyframe2 = Mocks.object('keyframe2');
      Fakes.build(spyOn(tab, 'getAnimationKeyframe'))
          .when(currentStart).return(keyframe1)
          .when(targetStart).return(keyframe2);

      spyOn(tab, 'setHighlightEl');

      tab['setHighlight_'](targetStart, targetLength, currentStart, currentLength);

      assert(mockAnimation.start).to.haveBeenCalledWith(tab, HIGHLIGHT_EL);
      assert(Animation.newInstance).to.haveBeenCalledWith(
          [keyframe1, keyframe2],
          Matchers.any(Object),
          Matchers.anyThing());
      assert(tab['getAnimationKeyframe']).to.haveBeenCalledWith(currentStart, currentLength);
      assert(tab['getAnimationKeyframe']).to.haveBeenCalledWith(targetStart, targetLength);
    });

    it('should set the start to the destination midpoint if the current length is 0', () => {
      const targetStart = 56;
      const targetLength = 78;

      const mockAnimation = jasmine.createSpyObj('Animation', ['start']);
      mockAnimation.start.and.returnValue(Mocks.object('animate'));
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      spyOn(tab, 'setHighlightEl');
      spyOn(tab, 'getAnimationKeyframe').and.returnValue({});

      tab['setHighlight_'](targetStart, targetLength, 12, 0);
      assert(tab['getAnimationKeyframe']).to.haveBeenCalledWith(95, 0);
    });

    it('should not update if the highlight is up to date', () => {
      const targetStart = 56;
      const targetLength = 78;

      spyOn(Animation, 'newInstance');

      tab['setHighlight_'](targetStart, targetLength, targetStart, targetLength);

      assert(Animation.newInstance).toNot.haveBeenCalled();
    });
  });

  describe('updateHighlight_', () => {
    it('should grab the destination start and length correctly', () => {
      const targetStart = 12;
      const targetLength = 34;
      const currentStart = 56;
      const currentLength = 78;
      const selectedId = 'selectedId';

      const selectedTab = Mocks.object('selectedTab');
      const highlightElement = Mocks.object('highlightElement');
      Fakes.build(spyOn(tab, 'getStartPosition'))
          .when(highlightElement).return(currentStart)
          .when(selectedTab).return(targetStart);
      Fakes.build(spyOn(tab, 'getLength'))
          .when(highlightElement).return(currentLength)
          .when(selectedTab).return(targetLength);

      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(selectedTab);

      spyOn(tab, 'setHighlight_').and.returnValue(Promise.resolve());

      tab.updateHighlight_(selectedId, mockElement, highlightElement);
      assert(tab['setHighlight_']).to.haveBeenCalledWith(
          targetStart,
          targetLength,
          currentStart,
          currentLength);
      assert(mockElement.querySelector).to.haveBeenCalledWith(`[tab-id="${selectedId}"]`);
      assert(tab['getStartPosition']).to.haveBeenCalledWith(selectedTab);
      assert(tab['getLength']).to.haveBeenCalledWith(selectedTab);
      assert(tab['getStartPosition']).to.haveBeenCalledWith(highlightElement);
      assert(tab['getLength']).to.haveBeenCalledWith(highlightElement);
    });

    it('should shrink to 0 length if there are no selected Ids', () => {
      const currentStart = 12;
      const currentLength = 34;

      const element = Mocks.object('element');
      const highlightElement = Mocks.object('highlightElement');

      spyOn(tab, 'getStartPosition').and.returnValue(currentStart);
      spyOn(tab, 'getLength').and.returnValue(currentLength);

      spyOn(tab, 'setHighlight_').and.returnValue(Promise.resolve());

      tab.updateHighlight_(null, element, highlightElement);
      assert(tab['setHighlight_']).to.haveBeenCalledWith(29, 34, currentStart, currentLength);
    });

    it(`should handle the case where the selectedId does not correspond to any tabs`, () => {
      const selectedId = 'selectedId';

      const highlightElement = Mocks.object('highlightElement');
      spyOn(tab, 'getStartPosition').and.returnValue(12);
      spyOn(tab, 'getLength').and.returnValue(34);

      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(null);

      spyOn(tab, 'setHighlight_').and.returnValue(Promise.resolve());

      tab.updateHighlight_(selectedId, mockElement, highlightElement);
      assert(tab['setHighlight_']).toNot.haveBeenCalled();
    });
  });
});
