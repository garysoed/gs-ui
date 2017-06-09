import { deprecated } from 'external/gs_tools/src/typescript/deprecated';
import { Log } from 'external/gs_tools/src/util';
import { BaseElement, dom, onLifecycle } from 'external/gs_tools/src/webc';

import { ThemeService } from '../theming/theme-service';

const LOG = Log.of('gs-ui.common.BaseThemedElement');

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
  @deprecated(LOG, 'Use BaseThemedElement2 instead')
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    const shadowRoot = element.shadowRoot;
    if (shadowRoot === null) {
      throw new Error('Shadow root is null');
    }
    this.themeService_.applyTheme(shadowRoot);
  }
}
