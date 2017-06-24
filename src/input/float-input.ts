/**
 * @webcomponent gs-float-input
 * Element for inputting float.
 *
 * @attr {boolean} disabled True iff the input should be disabled.
 * @attr {float} value Value of the input.
 *
 * @event {{}} change Dispatched when the value has changed.
 */
import { inject } from 'external/gs_tools/src/inject';
import { FloatParser } from 'external/gs_tools/src/parse';
import { customElement } from 'external/gs_tools/src/webc';

import { BaseInput2 } from '../input/base-input2';
import { ThemeService } from '../theming/theme-service';

@customElement({
  tag: 'gs-float-input',
  templateKey: 'src/input/float-input',
})
export class FloatInput extends BaseInput2<number> {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService, FloatParser);
  }

  /**
   * @override
   */
  protected isValueChanged_(oldValue: number | null, newValue: number | null): boolean {
    if (newValue !== null
        && oldValue !== null
        && Number.isNaN(oldValue)
        && Number.isNaN(newValue)) {
      return false;
    }
    return oldValue !== newValue;
  }
}
