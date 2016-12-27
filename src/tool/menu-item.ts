import {inject} from 'external/gs_tools/src/inject';
import {DomEvent} from 'external/gs_tools/src/event';
import {bind, customElement, StringParser, handle, DomBridge} from 'external/gs_tools/src/webc';

import {BaseThemedElement} from '../common';
import {ThemeService} from '../theming';
import {MenuService} from '../tool';


@customElement({
  dependencies: [MenuService],
  tag: 'gs-menu-item',
  templateKey: 'src/tool/menu-item',
})
export class MenuItem extends BaseThemedElement {
  @bind('#content').innerText()
  private readonly nameBridge_: DomBridge<string>;

  private readonly menuService_: MenuService;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService,
      @inject('tool.MenuService') menuService: MenuService) {
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
    this.menuService_.hideMenu();
  }
}
