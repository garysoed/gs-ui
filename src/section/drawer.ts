import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import {
  customElement,
  DomHook,
  handle,
  hook } from 'external/gs_tools/src/webc';

import { BaseThemedElement } from '../common/base-themed-element';
import { ThemeService } from '../theming/theme-service';


@customElement({
  tag: 'gs-drawer',
  templateKey: 'src/section/drawer',
})
export class Drawer extends BaseThemedElement {
  @hook('#root').classList()
  readonly classListHook_: DomHook<Set<string>>;

  @hook('#container').property('style')
  readonly containerStyleHook_: DomHook<CSSStyleDeclaration>;

  @hook('#root').attribute('flex-justify', StringParser)
  readonly flexJustifyHook_: DomHook<string>;

  @hook('#item').property('style')
  readonly itemStyleHook_: DomHook<CSSStyleDeclaration>;

  @hook('#root').property('style')
  readonly rootStyleHook_: DomHook<CSSStyleDeclaration>;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.classListHook_ = DomHook.of<Set<string>>();
    this.containerStyleHook_ = DomHook.of<CSSStyleDeclaration>();
    this.flexJustifyHook_ = DomHook.of<string>();
    this.itemStyleHook_ = DomHook.of<CSSStyleDeclaration>();
    this.rootStyleHook_ = DomHook.of<CSSStyleDeclaration>();
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

  @handle(null).attributeChange('gs-align-content', StringParser)
  onAlignContentChanged_(alignContent: string | null): void {
    const style = this.itemStyleHook_.get();
    if (style === null) {
      return;
    }

    if (alignContent === null) {
      return;
    }

    switch (alignContent.toLowerCase()) {
      case 'left':
        style.left = '0';
        style.right = null;
        break;
      case 'right':
        style.left = null;
        style.right = '0';
        break;
      default:
        throw Error(`Invalid align point ${alignContent}`);
    }
  }

  /**
   * Handles when the gs-anchor-point attribute is changed.
   *
   * @param anchorPoint The new value of the anchor point.
   */
  @handle(null).attributeChange('gs-anchor-point', StringParser)
  onAnchorPointChanged_(anchorPoint: string | null): void {
    const style = this.containerStyleHook_.get();
    if (style === null) {
      return;
    }

    if (anchorPoint === null) {
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
}
// TODO: Mutable
