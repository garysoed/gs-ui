import { DomEvent } from 'external/gs_tools/src/event';
import { inject } from 'external/gs_tools/src/inject';
import { StringParser } from 'external/gs_tools/src/parse';
import { customElement, DomHook, handle, hook } from 'external/gs_tools/src/webc';

import { BaseThemedElement } from '../common/base-themed-element';
import { ThemeService } from '../theming/theme-service';
import { OverlayService } from '../tool/overlay-service';


@customElement({
  dependencies: [OverlayService],
  tag: 'gs-menu-item',
  templateKey: 'src/tool/menu-item',
})
export class MenuItem extends BaseThemedElement {
  private readonly menuService_: OverlayService;

  @hook('#content').innerText()
  private readonly nameHook_: DomHook<string>;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService,
      @inject('gs.tool.OverlayService') menuService: OverlayService) {
    super(themeService);
    this.menuService_ = menuService;
    this.nameHook_ = DomHook.of<string>();
  }

  @handle(null).event(DomEvent.CLICK)
  protected onClicked_(): void {
    this.menuService_.hideOverlay();
  }

  @handle(null).attributeChange('gs-content', StringParser)
  protected onDataAttributeChange_(newContent: string): void {
    this.nameHook_.set(newContent);
  }
}
