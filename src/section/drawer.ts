import {
  bind,
  BooleanParser,
  customElement,
  DomBridge,
  handle,
  StringParser} from 'external/gs_tools/src/webc';
import {inject} from 'external/gs_tools/src/inject';

import {BaseThemedElement} from '../common/base-themed-element';
import {ThemeService} from '../theming/theme-service';


@customElement({
  tag: 'gs-drawer',
  templateKey: 'src/section/drawer',
})
export class Drawer extends BaseThemedElement {
  @bind('#root').classList()
  private readonly classListBridge_: DomBridge<Set<string>>;

  @bind('#root').attribute('flex-justify', StringParser)
  private readonly flexJustifyBridge_: DomBridge<string>;

  @bind('#root').property('style')
  private readonly rootStyleBridge_: DomBridge<CSSStyleDeclaration>;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.classListBridge_ = DomBridge.of<Set<string>>();
    this.flexJustifyBridge_ = DomBridge.of<string>();
    this.rootStyleBridge_ = DomBridge.of<CSSStyleDeclaration>();
  }

  /**
   * Handles when the gs-anchor-point attribute is changed.
   *
   * @param anchorPoint The new value of the anchor point.
   */
  @handle(null).attributeChange('gs-anchor-point', StringParser)
  protected onAnchorPointChanged_(anchorPoint: string): void {
    switch (anchorPoint.toLowerCase()) {
      case 'left':
        this.flexJustifyBridge_.set('flex-start');
        break;
      case 'right':
        this.flexJustifyBridge_.set('flex-end');
        break;
      default:
        throw Error(`Invalid anchor point ${anchorPoint}`);
    }
  }

  /**
   * Handles when the gs-is-expanded attribute is changed.
   *
   * @param isExpanded True iff the drawer should be expanded.
   */
  @handle(null).attributeChange('gs-is-expanded', BooleanParser)
  protected onIsExpandedChanged_(isExpanded: boolean): void {
    let classListSet = this.classListBridge_.get() || new Set();
    if (isExpanded) {
      classListSet.add('expanded');
    } else {
      classListSet.delete('expanded');
    }
    this.classListBridge_.set(classListSet);
  }

  /**
   * Handles when the gs-min-width attribute is changed.
   *
   * @param width The minimum width of the drawer to set.
   */
  @handle(null).attributeChange('gs-min-width', StringParser)
  protected onMinWidthChanged_(width: string): void {
    let styleDeclaration = this.rootStyleBridge_.get();
    if (styleDeclaration !== null) {
      styleDeclaration.setProperty('--gsDrawerCollapsedWidth', width);
    }
  }

  /**
   * Handles when the gs-max-width attribute is changed.
   *
   * @param width The maximum width of the drawer to set.
   */
  @handle(null).attributeChange('gs-max-width', StringParser)
  protected onMaxWidthChanged_(width: string): void {
    let styleDeclaration = this.rootStyleBridge_.get();
    if (styleDeclaration !== null) {
      styleDeclaration.setProperty('--gsDrawerExpandedWidth', width);
    }
  }
}