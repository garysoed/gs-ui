import { inject } from 'external/gs_tools/src/inject';
import { StringParser } from 'external/gs_tools/src/parse';
import { customElement } from 'external/gs_tools/src/webc';

import { ThemeService } from '../theming/theme-service';

import { BaseTab } from './base-tab';


@customElement({
  attributes: {
    'gsSelectedTab': StringParser,
  },
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
    return {left: `${start}px`, width: `${length}px`};
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

  /**
   * @override
   */
  setHighlightEl(start: number, length: number, highlightEl: HTMLElement): void {
    highlightEl.style.left = `${start}px`;
    highlightEl.style.width = `${length}px`;
  }
}
