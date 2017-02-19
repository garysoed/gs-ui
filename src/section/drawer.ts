import {inject} from 'external/gs_tools/src/inject';
import {
  bind,
  BooleanParser,
  customElement,
  DomHook,
  handle,
  StringParser} from 'external/gs_tools/src/webc';

import {BaseThemedElement} from '../common/base-themed-element';
import {ThemeService} from '../theming/theme-service';


@customElement({
  tag: 'gs-drawer',
  templateKey: 'src/section/drawer',
})
export class Drawer extends BaseThemedElement {
  @bind('#root').classList()
  readonly classListHook_: DomHook<Set<string>>;

  @bind('#container').property('style')
  readonly containerStyleHook_: DomHook<CSSStyleDeclaration>;

  @bind('#root').attribute('flex-justify', StringParser)
  readonly flexJustifyHook_: DomHook<string>;

  @bind('#root').property('style')
  readonly rootStyleHook_: DomHook<CSSStyleDeclaration>;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.classListHook_ = DomHook.of<Set<string>>();
    this.containerStyleHook_ = DomHook.of<CSSStyleDeclaration>();
    this.flexJustifyHook_ = DomHook.of<string>();
    this.rootStyleHook_ = DomHook.of<CSSStyleDeclaration>();
  }

  /**
   * Handles when the gs-anchor-point attribute is changed.
   *
   * @param anchorPoint The new value of the anchor point.
   */
  @handle(null).attributeChange('gs-anchor-point', StringParser)
  protected onAnchorPointChanged_(anchorPoint: string): void {
    const style = this.containerStyleHook_.get();
    if (style === null) {
      return;
    }

    switch (anchorPoint.toLowerCase()) {
      case 'left':
        style.left = '0';
        style.right = null;
        break;
      case 'right':
        style.left = null;
        style.right = '0';
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
    const classListSet = this.classListHook_.get() || new Set();
    if (isExpanded) {
      classListSet.add('expanded');
    } else {
      classListSet.delete('expanded');
    }
    this.classListHook_.set(classListSet);
  }

  /**
   * Handles when the gs-min-width attribute is changed.
   *
   * @param width The minimum width of the drawer to set.
   */
  @handle(null).attributeChange('gs-min-width', StringParser)
  protected onMinWidthChanged_(width: string): void {
    const styleDeclaration = this.rootStyleHook_.get();
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
    const styleDeclaration = this.rootStyleHook_.get();
    if (styleDeclaration !== null) {
      styleDeclaration.setProperty('--gsDrawerExpandedWidth', width);
    }
  }
}
