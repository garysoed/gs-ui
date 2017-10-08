/**
 * @webcomponent gs-drawer
 * An expandable side drawer.
 *
 * To use this, put the content of the drawer as the child element.
 *
 * @attr {'left'|'right'} align-content The content alignment.
 * @attr {'left'|'right'} anchor-point The side to anchor the content to.
 * @attr {boolean} expanded True iff the drawer should be expanded.
 * @attr {Size} max-width The max width of the drawer when expanded, in px.
 * @attr {Size} min-width The min width of the drawer when collapsed, in px.
 */
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser, StringSetParser } from 'external/gs_tools/src/parse';
import { assertUnreachable } from 'external/gs_tools/src/typescript';
import { customElement, dom, onDom } from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common/base-themed-element2';
import { ThemeService } from '../theming/theme-service';

type Sides = 'left' | 'right';
const SidesParser = StringSetParser<Sides>(['left', 'right']);

const ALIGN_CONTENT_ATTR = {name: 'align-content', selector: null, parser: SidesParser};
const ANCHOR_POINT_ATTR = {name: 'anchor-point', selector: null, parser: SidesParser};
const IS_EXPANDED_ATTR = {name: 'expanded', selector: null, parser: BooleanParser};
const MAX_WIDTH_ATTR = {name: 'max-width', selector: null, parser: StringParser};
const MIN_WIDTH_ATTR = {name: 'min-width', selector: null, parser: StringParser};

const CONTAINER_EL = '#container';
const ITEM_EL = '#item';
const ROOT_EL = '#root';

@customElement({
  tag: 'gs-drawer',
  templateKey: 'src/section/drawer',
})
export class Drawer extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.attributeChange(ALIGN_CONTENT_ATTR)
  onAlignContentChanged_(
      @dom.attribute(ALIGN_CONTENT_ATTR) alignContent: Sides | null,
      @dom.element(ITEM_EL) itemEl: HTMLElement): void {
    if (alignContent === null) {
      return;
    }

    switch (alignContent) {
      case 'left':
        itemEl.style.left = '0';
        itemEl.style.right = null;
        break;
      case 'right':
        itemEl.style.left = null;
        itemEl.style.right = '0';
        break;
      default:
        throw assertUnreachable(alignContent);
    }
  }

  /**
   * Handles when the gs-anchor-point attribute is changed.
   *
   * @param anchorPoint The new value of the anchor point.
   */
  @onDom.attributeChange(ANCHOR_POINT_ATTR)
  onAnchorPointChanged_(
      @dom.attribute(ANCHOR_POINT_ATTR) anchorPoint: Sides | null,
      @dom.element(CONTAINER_EL) containerEl: HTMLElement): void {
    if (anchorPoint === null) {
      return;
    }

    switch (anchorPoint) {
      case 'left':
        containerEl.style.left = '0';
        containerEl.style.right = null;
        break;
      case 'right':
        containerEl.style.left = null;
        containerEl.style.right = '0';
        break;
      default:
        throw assertUnreachable(anchorPoint);
    }
  }

  /**
   * Handles when the gs-is-expanded attribute is changed.
   *
   * @param isExpanded True iff the drawer should be expanded.
   */
  @onDom.attributeChange(IS_EXPANDED_ATTR)
  onExpandedChanged_(
      @dom.element(ROOT_EL) rootEl: HTMLElement,
      @dom.attribute(IS_EXPANDED_ATTR) isExpanded: boolean): void {
    if (isExpanded) {
      rootEl.classList.add('expanded');
    } else {
      rootEl.classList.remove('expanded');
    }
  }

  /**
   * Handles when the gs-max-width attribute is changed.
   *
   * @param width The maximum width of the drawer to set.
   */
  @onDom.attributeChange(MAX_WIDTH_ATTR)
  onMaxWidthChanged_(
      @dom.attribute(MAX_WIDTH_ATTR) width: string | null,
      @dom.element(ROOT_EL) rootEl: HTMLElement): void {
    rootEl.style.setProperty('--gsDrawerExpandedWidth', StringParser.stringify(width));
  }

  /**
   * Handles when the gs-min-width attribute is changed.
   *
   * @param width The minimum width of the drawer to set.
   */
  @onDom.attributeChange(MIN_WIDTH_ATTR)
  onMinWidthChanged_(
      @dom.attribute(MIN_WIDTH_ATTR) width: string | null,
      @dom.element(ROOT_EL) rootEl: HTMLElement): void {
    rootEl.style.setProperty('--gsDrawerCollapsedWidth', StringParser.stringify(width));
  }
}
