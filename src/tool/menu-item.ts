import {DomEvent} from 'external/gs_tools/src/event';
import {inject} from 'external/gs_tools/src/inject';
import {bind, customElement, DomBridge, handle, StringParser} from 'external/gs_tools/src/webc';

import {BaseThemedElement} from '../common/base-themed-element';
import {ThemeService} from '../theming/theme-service';
import {OverlayService} from '../tool/overlay-service';


@customElement({
  dependencies: [OverlayService],
  tag: 'gs-menu-item',
  templateKey: 'src/tool/menu-item',
})
export class MenuItem extends BaseThemedElement {
  @bind('#content').innerText()
  private readonly nameBridge_: DomBridge<string>;

  private readonly menuService_: OverlayService;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService,
      @inject('gs.tool.OverlayService') menuService: OverlayService) {
    super(themeService);
    this.menuService_ = menuService;
    this.nameBridge_ = DomBridge.of<string>();
  }

  @handle(null).attributeChange('gs-content', StringParser)
  protected onDataAttributeChange_(newContent: string): void {
    this.nameBridge_.set(newContent);
  }

  @handle(null).event(DomEvent.CLICK)
  protected onClicked_(): void {
    this.menuService_.hideOverlay();
  }
}
