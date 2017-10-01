import { inject } from 'external/gs_tools/src/inject';
import { component } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from '../common';
import { ThemeService } from '../theming';


@component({
  tag: 'gs-icon',
  templateKey: 'src/tool/icon',
})
export class Icon extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }
}
