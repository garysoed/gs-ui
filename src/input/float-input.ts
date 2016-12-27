
import {inject} from 'external/gs_tools/src/inject';
import {
  bind,
  BooleanParser,
  customElement,
  DomBridge,
  FloatParser,
  handle} from 'external/gs_tools/src/webc';

import {ThemeService} from '../theming/theme-service';

import {BaseInput} from './base-input';


@customElement({
  tag: 'gs-float-input',
  templateKey: 'src/input/float-input',
})
export class FloatInput extends BaseInput<number> {
  @bind(null).attribute('gs-value', FloatParser)
  private readonly boundGsValueBridge_: DomBridge<number>;

  @bind('#input').attribute('disabled', BooleanParser)
  private readonly boundInputDisabledBridge_: DomBridge<boolean>;

  @bind('#input').property('value')
  private readonly boundInputValueBridge_: DomBridge<string>;

  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(
        themeService,
        DomBridge.of<number>(),
        DomBridge.of<string>(),
        FloatParser);
    this.boundGsValueBridge_ = this.gsValueBridge_;
    this.boundInputDisabledBridge_ = this.inputDisabledBridge_;
    this.boundInputValueBridge_ = this.inputValueBridge_;
  }

  /**
   * Handles event when the value of gs-value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  @handle(null).attributeChange('gs-value', FloatParser)
  protected onGsValueChange_(newValue: number): void {
    super.onGsValueChange_(newValue);
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
}
