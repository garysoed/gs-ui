import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import {
  customElement,
  dom,
  DomHook,
  hook,
  onDom} from 'external/gs_tools/src/webc';

import { BaseThemedElement } from '../common/base-themed-element';
import { ThemeService } from '../theming/theme-service';


const ALIGN_CONTENT_ATTRIBUTE = {name: 'gs-align-content', selector: null, parser: StringParser};
const ANCHOR_POINT_ATTRIBUTE = {name: 'gs-anchor-point', selector: null, parser: StringParser};
const IS_EXPANDED_ATTRIBUTE = {name: 'gs-is-expanded', selector: null, parser: BooleanParser};
const MAX_WIDTH_ATTRIBUTE = {name: 'gs-max-width', selector: null, parser: StringParser};
const MIN_WIDTH_ATTRIBUTE = {name: 'gs-min-width', selector: null, parser: StringParser};


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

  @onDom.attributeChange(ALIGN_CONTENT_ATTRIBUTE)
  onAlignContentChanged_(
      @dom.attribute(ALIGN_CONTENT_ATTRIBUTE) alignContent: string | null): void {
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
  @onDom.attributeChange(ANCHOR_POINT_ATTRIBUTE)
  onAnchorPointChanged_(
      @dom.attribute(ANCHOR_POINT_ATTRIBUTE) anchorPoint: string | null): void {
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

  /**
   * Handles when the gs-is-expanded attribute is changed.
   *
   * @param isExpanded True iff the drawer should be expanded.
   */
  @onDom.attributeChange(IS_EXPANDED_ATTRIBUTE)
  protected onIsExpandedChanged_(
      @dom.attribute(IS_EXPANDED_ATTRIBUTE) isExpanded: boolean): void {
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
  @onDom.attributeChange(MAX_WIDTH_ATTRIBUTE)
  protected onMaxWidthChanged_(
      @dom.attribute(MAX_WIDTH_ATTRIBUTE) width: string): void {
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
  @onDom.attributeChange(MIN_WIDTH_ATTRIBUTE)
  protected onMinWidthChanged_(
      @dom.attribute(MIN_WIDTH_ATTRIBUTE) width: string): void {
    const styleDeclaration = this.rootStyleHook_.get();
    if (styleDeclaration !== null) {
      styleDeclaration.setProperty('--gsDrawerCollapsedWidth', width);
    }
  }
}
// TODO: Mutable
