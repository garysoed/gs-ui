import { inject } from 'external/gs_tools/src/inject';
import { component } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from '../common';
import { ThemeService } from '../theming';

@component({
  tag: 'gs-menu-item',
  templateKey: 'src/tool/menu-item',
})
export class MenuItem extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }
}
