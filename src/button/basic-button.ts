/**
 * @webcomponent gs-basic-button
 * A basic button.
 *
 * @attr {boolean} disabled True iff the button should be disabled.
 * @attr {boolean} primary True iff the button is primary button.
 *
 * @css {color} gsButtonFG The foreground color of the button.
 * @css {color} gsButtonFG The background color of the button.
 *
 * @event {{}} gs-action Dispatched when the button is clicked.
 */

import { inject } from 'external/gs_tools/src/inject';
import { DispatchFn } from 'external/gs_tools/src/interfaces';
import { BooleanParser } from 'external/gs_tools/src/parse';
import { customElement, dom, onDom } from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common/base-themed-element2';
import { ThemeService } from '../theming/theme-service';

const DISABLED_ATTR = {name: 'disabled', parser: BooleanParser, selector: null};

@customElement({
  tag: 'gs-basic-button',
  templateKey: 'src/button/basic-button',
})
export class BasicButton extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.event(null, 'click')
  onClick_(
      @dom.attribute(DISABLED_ATTR) disabled: boolean | null,
      @dom.eventDispatcher() dispatcher: DispatchFn<{}>): void {
    if (!disabled) {
      dispatcher('gs-action', {});
    }
  }
}
