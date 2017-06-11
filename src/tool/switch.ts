import { inject } from 'external/gs_tools/src/inject';
import { StringParser } from 'external/gs_tools/src/parse';
import { customElement, dom, DomHook, hook, onDom } from 'external/gs_tools/src/webc';

import { BaseThemedElement } from '../common/base-themed-element';
import { ThemeService } from '../theming/theme-service';


const VALUE_ATTRIBUTE = {name: 'gs-value', parser: StringParser, selector: null};

/**
 * Switches the content depending on the value.
 */
@customElement({
  tag: 'gs-switch',
  templateKey: 'src/tool/switch',
})
export class Switch extends BaseThemedElement {
  @hook('#content').attribute('select', StringParser)
  private readonly selectHook_: DomHook<string>;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.selectHook_ = DomHook.of<string>(true);
  }

  @onDom.attributeChange(VALUE_ATTRIBUTE)
  protected onGsValueChange_(
      @dom.attribute(VALUE_ATTRIBUTE) value: string | null): void {
    if (value === null) {
      this.selectHook_.delete();
    } else {
      this.selectHook_.set(`[gs-when="${value}"]`);
    }
  }
}
// TODO: Mutable
