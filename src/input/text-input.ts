
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import {
  customElement,
  DomHook,
  handle,
  hook } from 'external/gs_tools/src/webc';

import { BaseInput } from '../input/base-input';
import { ThemeService } from '../theming/theme-service';


@customElement({
  tag: 'gs-text-input',
  templateKey: 'src/input/text-input',
})
export class TextInput extends BaseInput<string> {
  @hook(null).attribute('gs-value', StringParser)
  private readonly boundGsValueHook_: DomHook<string>;

  @hook('#input').attribute('disabled', BooleanParser)
  private readonly boundInputDisabledHook_: DomHook<boolean>;

  @hook('#input').property('value')
  private readonly boundInputValueHook_: DomHook<string>;

  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(
        themeService,
        DomHook.of<string>(),
        DomHook.of<string>(),
        StringParser);
    this.boundGsValueHook_ = this.gsValueHook_;
    this.boundInputDisabledHook_ = this.inputDisabledHook_;
    this.boundInputValueHook_ = this.inputValueHook_;
  }

  /**
   * Handles event when the value of gs-value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  @handle(null).attributeChange('gs-value', StringParser)
  protected onGsValueChange_(newValue: string): void {
    super.onGsValueChange_(newValue);
  }
}
// TODO: Mutable
