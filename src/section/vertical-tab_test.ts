import { assert, TestBase } from '../test-base';
TestBase.setup();
import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { VerticalTab } from './vertical-tab';


describe('section.HorizontalTab', () => {
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

  describe('setHighlightEl', () => {
    it('should set the left and width correctly', () => {
      const start = 123;
      const length = 456;
      const style = Mocks.object('style');
      tab.setHighlightEl(start, length, {style} as HTMLElement);
      assert(style).to.equal({top: `${start}px`, height: `${length}px`});
    });
  });
});
