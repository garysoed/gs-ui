
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, FloatParser } from 'external/gs_tools/src/parse';
import {
  customElement,
  dom,
  DomHook,
  handle,
  hook,
  onDom} from 'external/gs_tools/src/webc';

import { BaseInput } from '../input/base-input';
import { ThemeService } from '../theming/theme-service';


const VALUE_ATTRIBUTE = {name: 'gs-value', parser: FloatParser, selector: null};


@customElement({
  tag: 'gs-float-input',
  templateKey: 'src/input/float-input',
})
export class FloatInput extends BaseInput<number> {
  @hook(null).attribute('gs-value', FloatParser)
  private readonly boundGsValueHook_: DomHook<number>;

  @hook('#input').attribute('disabled', BooleanParser)
  private readonly boundInputDisabledHook_: DomHook<boolean>;

  @hook('#input').property('value')
  private readonly boundInputValueHook_: DomHook<string>;

  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(
        themeService,
        DomHook.of<number>(),
        DomHook.of<string>(),
        FloatParser);
    this.boundGsValueHook_ = this.gsValueHook_;
    this.boundInputDisabledHook_ = this.inputDisabledHook_;
    this.boundInputValueHook_ = this.inputValueHook_;
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
    return super.isValueChanged_(oldValue, newValue);
  }

  /**
   * Handles event when the value of gs-value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  @onDom.attributeChange(VALUE_ATTRIBUTE)
  protected onGsValueChange_(
      @dom.attribute(VALUE_ATTRIBUTE) newValue: number): void {
    super.onGsValueChange_(newValue);
  }
}
// TODO: Mutable
