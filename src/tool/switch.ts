import {inject} from 'external/gs_tools/src/inject';
import {bind, customElement, DomBridge, handle, StringParser} from 'external/gs_tools/src/webc';

import {BaseThemedElement} from '../common/base-themed-element';
import {ThemeService} from '../theming/theme-service';


/**
 * Switches the content depending on the value.
 */
@customElement({
  tag: 'gs-switch',
  templateKey: 'src/tool/switch',
})
export class Switch extends BaseThemedElement {
  @bind('#content').attribute('select', StringParser)
  private readonly selectBridge_: DomBridge<string>;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.selectBridge_ = DomBridge.of<string>(true);
  }

  @handle(null).attributeChange('gs-value', StringParser)
  protected onGsValueChange_(value: string | null): void {
    if (value === null) {
      this.selectBridge_.delete();
    } else {
      this.selectBridge_.set(`[gs-when="${value}"]`);
    }
  }
}
