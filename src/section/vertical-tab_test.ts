import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();
import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { VerticalTab } from './vertical-tab';


describe('section.VerticalTab', () => {
  let tab: VerticalTab;

  beforeEach(() => {
    tab = new VerticalTab(Mocks.object('ThemeService'));
    TestDispose.add(tab);
  });

  describe('getAnimationKeyframe', () => {
    it('should return the correct keyframe', () => {
      const start = 123;
      const length = 456;
      assert(tab.getAnimationKeyframe(start, length)).to
          .equal({top: `${start}px`, height: `${length}px`});
    });
  });

  describe('getLength', () => {
    it('should return the correct height', () => {
      const height = 123;
      const element = Mocks.object('element');
      element.clientHeight = height;
      assert(tab.getLength(element)).to.equal(height);
    });
  });

  describe('getStartPosition', () => {
    it('should return the offsetTop', () => {
      const top = 123;
      const element = Mocks.object('element');
      element.offsetTop = top;
      assert(tab.getStartPosition(element)).to.equal(top);
    });
  });

  describe('parseAnimationKeyframe', () => {
    it(`should return the correct object`, () => {
      const top = 12;
      const height = 34;
      assert(tab['parseAnimationKeyframe']({top: `${top}px`, height: `${height}px`}))
          .to.equal({length: height, start: top});
    });

    it(`should throw error if length is invalid`, () => {
      assert(() => {
        tab['parseAnimationKeyframe']({top: `12px`, height: `abcd`});
      }).to.throwError(/Invalid keyframe value/);
    });

    it(`should throw error if start is invalid`, () => {
      assert(() => {
        tab['parseAnimationKeyframe']({top: `abc`, height: `34px`});
      }).to.throwError(/Invalid keyframe value/);
    });

    it(`should throw error if top does not exist`, () => {
      assert(() => {
        tab['parseAnimationKeyframe']({height: `34px`});
      }).to.throwError(/Invalid keyframe/);
    });

    it(`should throw error if height does not exist`, () => {
      assert(() => {
        tab['parseAnimationKeyframe']({top: `34px`});
      }).to.throwError(/Invalid keyframe/);
    });
  });

  describe('setHighlightEl', () => {
    it('should set the top and height correctly', () => {
      const start = 123;
      const length = 456;
      const style = Mocks.object('style');
      tab.setHighlightEl(start, length, {style} as HTMLElement);
      assert(style).to.equal(Matchers.objectContaining({top: `${start}px`, height: `${length}px`}));
    });
  });
});
