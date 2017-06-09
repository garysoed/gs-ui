import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { ListenableDom, MonadSetter } from 'external/gs_tools/src/event';
import { ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, EnumParser } from 'external/gs_tools/src/parse';
import {
  BaseElement,
  customElement,
  dom,
  DomHook,
  domOut,
  hook,
  onDom} from 'external/gs_tools/src/webc';
import { onLifecycle } from 'external/gs_tools/src/webc/on-lifecycle';

import { BaseThemedElement } from '../common/base-themed-element';
import { Event } from '../const/event';
import { AnchorLocation } from '../tool/anchor-location';
import { AnchorLocationParser } from '../tool/anchor-location-parser';
import { OverlayService } from '../tool/overlay-service';


const ANCHOR_POINT_ATTR = {
  name: 'gs-anchor-point',
  parser: AnchorLocationParser,
  selector: null,
};
const ANCHOR_TARGET_ATTR = {
  name: 'gs-anchor-target',
  parser: AnchorLocationParser,
  selector: null,
};
const FIT_PARENT_WIDTH_ATTR = {name: 'gs-fit-parent-width', parser: BooleanParser, selector: null};


@customElement({
  dependencies: ImmutableSet.of([
    OverlayService,
  ]),
  tag: 'gs-menu',
  templateKey: 'src/tool/menu',
})
export class Menu extends BaseDisposable {
  constructor(@inject('gs.tool.OverlayService') private overlayService_: OverlayService) {
    super();
  }

  /**
   * Handler called when there is an action.
   */
  @onDom.event('parent', Event.ACTION)
  onAction_(
      @dom.element(null) element: HTMLElement,
      @dom.attribute(FIT_PARENT_WIDTH_ATTR) fitParentWidth: boolean | null,
      @dom.attribute(ANCHOR_TARGET_ATTR) anchorTarget: AnchorLocation | null,
      @dom.attribute(ANCHOR_POINT_ATTR) anchorPoint: AnchorLocation | null): void {
    const parentElement = element.parentElement;
    if (!parentElement) {
      throw new Error('No parent element found');
    }
    const menuContent = element.firstElementChild as HTMLElement | null;

    if (fitParentWidth && menuContent) {
      menuContent.style.width = `${parentElement.clientWidth}px`;
    }

    this.overlayService_.showOverlay(
        element,
        menuContent,
        parentElement,
        anchorTarget || AnchorLocation.AUTO,
        anchorPoint || AnchorLocation.AUTO);
  }

  /**
   * @override
   */
  @onLifecycle('create')
  onCreated(
      @domOut.attribute(ANCHOR_POINT_ATTR)
          {id: anchorPointId, value: anchorPoint}: MonadSetter<null | AnchorLocation>,
      @domOut.attribute(ANCHOR_TARGET_ATTR)
          {id: anchorTargetId, value: anchorTarget}: MonadSetter<null | AnchorLocation>):
      ImmutableMap<any, any> {
    if (anchorPoint === null) {
      anchorPoint = AnchorLocation.AUTO;
    }

    if (anchorTarget === null) {
      anchorTarget = AnchorLocation.AUTO;
    }

    return ImmutableMap.of([
      [anchorPointId, anchorPoint],
      [anchorTargetId, anchorTarget],
    ]);
  }
}
