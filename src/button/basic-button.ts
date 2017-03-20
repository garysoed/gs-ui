import { inject } from 'external/gs_tools/src/inject';
import { customElement } from 'external/gs_tools/src/webc';

import { BaseActionElement } from '../common/base-action-element';
import { ThemeService } from '../theming/theme-service';


@customElement({
  tag: 'gs-basic-button',
  templateKey: 'src/button/basic-button',
})
export class BasicButton extends BaseActionElement {
  constructor(
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }
}
