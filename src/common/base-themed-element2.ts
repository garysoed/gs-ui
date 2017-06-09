import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { dom, onLifecycle } from 'external/gs_tools/src/webc';

import { ThemeService } from '../theming/theme-service';

export class BaseThemedElement2 extends BaseDisposable {
  constructor(private readonly themeService_: ThemeService) {
    super();
  }

  @onLifecycle('create')
  onCreate(@dom.element(null) element: HTMLElement): void {
    const shadowRoot = element.shadowRoot;
    if (shadowRoot === null) {
      throw new Error('Shadow root is null');
    }
    this.themeService_.applyTheme(shadowRoot);
  }
}
