/**
 * @webcomponent gs-radio-button
 * A radio button.
 *
 * @attr {boolean} checked True iff the button is checked.
 * @attr {boolean} disabled True iff the button is disabled.
 * @attr {string} group-id ID of the group that the button belongs to. Only one button in the group
 *     can be checked at any time.
 */
import { eventDetails } from 'external/gs_tools/src/event';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import { customElement, dom, onDom } from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common/base-themed-element2';
import { RadioButtonService } from '../input/radio-button-service';
import { ThemeService } from '../theming/theme-service';

const CHECKED_ATTR = {name: 'checked', parser: BooleanParser, selector: null};
const DISABLED_ATTR = {name: 'disabled', parser: BooleanParser, selector: null};
const GROUP_ATTRIBUTE = {name: 'group-id', parser: StringParser, selector: null};

@customElement({
  dependencies: ImmutableSet.of([RadioButtonService]),
  tag: 'gs-radio-button',
  templateKey: 'src/input/radio-button',
})
export class RadioButton extends BaseThemedElement2 {
  constructor(
      @inject('input.RadioButtonService') private readonly radioButtonService_: RadioButtonService,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  /**
   * Handles event when checked attribute is changed.
   *
   * @param newValue The new value of checked.
   * @param oldValue The old value of checked.
   */
  @onDom.attributeChange(CHECKED_ATTR)
  onCheckedChanged_(
      @dom.attribute(CHECKED_ATTR) newValue: boolean,
      @dom.element(null) element: HTMLElement,
      @eventDetails() {oldValue}: {oldValue: boolean}): void {
    if (newValue !== oldValue) {
      this.radioButtonService_.setSelected(element, newValue);
    }
  }

  /**
   * @override
   */
  @onDom.event(null, 'click')
  onClick_(
      @dom.element(null) element: HTMLElement,
      @dom.attribute(DISABLED_ATTR) disabled: boolean | null): void {
    if (!disabled) {
      this.radioButtonService_.setSelected(element, true);
    }
  }

  /**
   * Handles event when group-id attribute is changed.
   */
  @onDom.attributeChange(GROUP_ATTRIBUTE)
  onGroupChanged_(
      @dom.element(null) element: HTMLElement,
      @dom.attribute(CHECKED_ATTR) checked: boolean | null): void {
    this.radioButtonService_.setSelected(element, checked || false);
  }
}
