import {inject} from 'external/gs_tools/src/inject';
import {
  customElement,
  StringParser} from 'external/gs_tools/src/webc';
import {ThemeService} from '../theming/theme-service';

import {BaseTab} from './base-tab';


@customElement({
  attributes: {
    'gsSelectedTab': StringParser,
  },
  tag: 'gs-vertical-tab',
  templateKey: 'src/section/vertical-tab',
})
export class VerticalTab extends BaseTab {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  /**
   * @override
   */
  getAnimationKeyframe(start: number, length: number): AnimationKeyframe {
    return {top: `${start}px`, height: `${length}px`};
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

  /**
   * @override
   */
  setHighlightEl(start: number, length: number, highlightEl: HTMLElement): void {
    highlightEl.style.top = `${start}px`;
    highlightEl.style.height = `${length}px`;
  }
}
