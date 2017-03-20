import { BaseElement } from 'external/gs_tools/src/webc';

import { ThemeService } from '../theming/theme-service';


export class BaseThemedElement extends BaseElement {
  private themeService_: ThemeService;

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
    this.themeService_.applyTheme(element.shadowRoot);
  }
}
