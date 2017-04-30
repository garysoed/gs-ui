import { BaseElement } from 'external/gs_tools/src/webc';

import { ThemeService } from '../theming/theme-service';


export class BaseThemedElement extends BaseElement {
  protected readonly themeService_: ThemeService;

  /**
   * @param themeService
   */
  constructor(themeService: ThemeService) {
    super();
    this.themeService_ = themeService;
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    const shadowRoot = element.shadowRoot;
    if (shadowRoot === null) {
      throw new Error('Shadow root is null');
    }
    this.themeService_.applyTheme(shadowRoot);
  }
}
