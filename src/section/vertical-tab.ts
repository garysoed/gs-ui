/**
 * @webcomponent gs-vertical-tab
 * A vertical tab.
 *
 * Every child of this tab represents a single tab. They should have an attribute called `tab-id`
 * so `vertical-tab` can select it.
 *
 * @attr {string} selected-tab The currently selected tab. Defaults to the first tab.
 *
 * @event {{}} gs-tab-change Dispatched when the tab is changed.
 */
import { inject } from 'external/gs_tools/src/inject';
import { SizeParser, StringParser } from 'external/gs_tools/src/parse';
import { customElement } from 'external/gs_tools/src/webc';

import { BaseTab } from '../section/base-tab';
import { ThemeService } from '../theming/theme-service';

@customElement({
  attributes: {
    'gsSelectedTab': StringParser,
  },
  tag: 'gs-vertical-tab',
  templateKey: 'src/section/vertical-tab',
})
export class VerticalTab extends BaseTab {
  constructor( @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  /**
   * @override
   */
  getAnimationKeyframe(start: number, length: number): AnimationKeyframe {
    return {
      height: SizeParser.stringify({value: length, unit: 'px'}),
      top: SizeParser.stringify({value: start, unit: 'px'}),
    };
  }

  /**
   * @override
   */
  getLength(element: HTMLElement): number {
    return element.clientHeight;
  }

  /**
   * @override
   */
  getStartPosition(element: HTMLElement): number {
    return element.offsetTop;
  }

  protected parseAnimationKeyframe(keyframe: AnimationKeyframe): {length: number; start: number} {
    const {top, height} = keyframe;
    if (top === undefined || height === undefined) {
      throw new Error(`Invalid keyframe. One of [top, height] does not exist: ${top}, ${height}`);
    }

    const length = SizeParser.parse(height);
    const start = SizeParser.parse(top);
    if (length === null || start === null) {
      throw new Error(`Invalid keyframe value: ${top}, ${height}`);
    }
    return {
      length: length.value,
      start: start.value,
    };
  }

  /**
   * @override
   */
  setHighlightEl(start: number, length: number, highlightEl: HTMLElement): void {
    highlightEl.style.top = SizeParser.stringify({value: start, unit: 'px'});
    highlightEl.style.height = SizeParser.stringify({value: length, unit: 'px'});
  }
}
