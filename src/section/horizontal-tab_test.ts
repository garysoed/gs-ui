import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();
import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { HorizontalTab } from './horizontal-tab';


describe('section.HorizontalTab', () => {
  let tab: HorizontalTab;

  beforeEach(() => {
    tab = new HorizontalTab(Mocks.object('ThemeService'));
    TestDispose.add(tab);
  });

  describe('getAnimationKeyframe', () => {
    it('should return the correct keyframe', () => {
      const start = 123;
      const length = 456;
      assert(tab.getAnimationKeyframe(start, length)).to
          .equal({left: `${start}px`, width: `${length}px`});
    });
  });

  describe('getLength', () => {
    it('should return the correct width', () => {
      const width = 123;
      const element = Mocks.object('element');
      element.clientWidth = width;
      assert(tab.getLength(element)).to.equal(width);
    });
  });

  describe('getStartPosition', () => {
    it('should return the offsetLeft', () => {
      const left = 123;
      const element = Mocks.object('element');
      element.offsetLeft = left;
      assert(tab.getStartPosition(element)).to.equal(left);
    });
  });

  describe('parseAnimationKeyframe', () => {
    it(`should return the correct object`, () => {
      const left = 12;
      const width = 34;
      assert(tab['parseAnimationKeyframe']({left: `${left}px`, width: `${width}px`}))
          .to.equal({length: width, start: left});
    });

    it(`should throw error if length is invalid`, () => {
      assert(() => {
        tab['parseAnimationKeyframe']({left: `12px`, width: `abcd`});
      }).to.throwError(/Invalid keyframe value/);
    });

    it(`should throw error if start is invalid`, () => {
      assert(() => {
        tab['parseAnimationKeyframe']({left: `abc`, width: `34px`});
      }).to.throwError(/Invalid keyframe value/);
    });

    it(`should throw error if left does not exist`, () => {
      assert(() => {
        tab['parseAnimationKeyframe']({width: `34px`});
      }).to.throwError(/Invalid keyframe/);
    });

    it(`should throw error if width does not exist`, () => {
      assert(() => {
        tab['parseAnimationKeyframe']({left: `34px`});
      }).to.throwError(/Invalid keyframe/);
    });
  });

  describe('setHighlightEl', () => {
    it('should set the left and width correctly', () => {
      const start = 123;
      const length = 456;
      const style = Mocks.object('style');
      tab.setHighlightEl(start, length, {style} as HTMLElement);
      assert(style).to.equal(Matchers.objectContaining({left: `${start}px`, width: `${length}px`}));
    });
  });
});
