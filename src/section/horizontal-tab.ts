/**
 * @webcomponent gs-horizontal-tab
 * A horizontal tab.
 *
 * Every child of this tab represents a single tab. They should have an attribute called `tab-id`
 * so `horizontal-tab` can select it.
 *
 * @attr {string} selected-tab The currently selected tab. Defaults to the first tab.
 *
 * @event {{}} gs-tab-change Dispatched when the tab is changed.
 */
import { inject } from 'external/gs_tools/src/inject';
import { SizeParser } from 'external/gs_tools/src/parse';
import { customElement } from 'external/gs_tools/src/webc';

import { BaseTab } from '../section/base-tab';
import { ThemeService } from '../theming/theme-service';

@customElement({
  tag: 'gs-horizontal-tab',
  templateKey: 'src/section/horizontal-tab',
})
export class HorizontalTab extends BaseTab {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  /**
   * @override
   */
  getAnimationKeyframe(start: number, length: number): AnimationKeyframe {
    return {
      left: SizeParser.stringify({value: start, unit: 'px'}),
      width: SizeParser.stringify({value: length, unit: 'px'}),
    };
  }

  /**
   * @override
   */
  getLength(element: HTMLElement): number {
    return element.clientWidth;
  }

  /**
   * @override
   */
  getStartPosition(element: HTMLElement): number {
    return element.offsetLeft;
  }

  protected parseAnimationKeyframe(keyframe: AnimationKeyframe): {length: number; start: number} {
    const {left, width} = keyframe;
    if (left === undefined || width === undefined) {
      throw new Error(`Invalid keyframe. One of [left, width] does not exist: ${left}, ${width}`);
    }

    const length = SizeParser.parse(width);
    const start = SizeParser.parse(left);
    if (length === null || start === null) {
      throw new Error(`Invalid keyframe value: ${left}, ${width}`);
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
    highlightEl.style.left = SizeParser.stringify({value: start, unit: 'px'});
    highlightEl.style.width = SizeParser.stringify({value: length, unit: 'px'});
  }
}
