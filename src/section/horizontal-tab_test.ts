import {assert, TestBase} from '../test-base';
TestBase.setup();
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {HorizontalTab} from './horizontal-tab';


describe('section.HorizontalTab', () => {
  let tab;

  beforeEach(() => {
    tab = new HorizontalTab(Mocks.object('ThemeService'));
    TestDispose.add(tab);
  });

  describe('getAnimationKeyframe', () => {
    it('should return the correct keyframe', () => {
      let start = 123;
      let length = 456;
      assert(tab.getAnimationKeyframe(start, length)).to
          .equal({left: `${start}px`, width: `${length}px`});
    });
  });

  describe('getLength', () => {
    it('should return the correct width', () => {
      let width = 123;
      let element = Mocks.object('element');
      element.clientWidth = width;
      assert(tab.getLength(element)).to.equal(width);
    });
  });

  describe('getStartPosition', () => {
    it('should return the offsetLeft', () => {
      let left = 123;
      let element = Mocks.object('element');
      element.offsetLeft = left;
      assert(tab.getStartPosition(element)).to.equal(left);
    });
  });

  describe('setHighlightEl', () => {
    it('should set the left and width correctly', () => {
      let start = 123;
      let length = 456;
      let style = Mocks.object('style');
      tab.setHighlightEl(start, length, {style});
      assert(style).to.equal({left: `${start}px`, width: `${length}px`});
    });
  });
});
