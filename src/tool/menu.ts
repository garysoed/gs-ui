/**
 * @webcomponent gs-menu
 * Triggers a menu.
 *
 * The menu content is the child element(s). Use the `visible` attribute to show / hide the menu.
 * The menu conten will be anchored to the parent element.
 *
 * @attr {enum<AnchorLocation>} anchor-point Location on the menu content to anchor it to.
 * @attr {enum<AnchorLocation>} anchor-target Location on the parent element to anchor the menu
 *     content to.
 * @attr {boolean} fit-parent-width True iff the menu content should fit the parent element's
 *     width.
 * @attr {string} triggered-by Selector that points to an element that is a descendant of the
 *     gs-menu's root node. Whenever this element dispatches a gs-action event, this menu will
 *     toggle its visibility.
 * @attr {boolean} visible True iff the menu is shown.
 */
import { BaseDisposable, DisposableFunction } from 'external/gs_tools/src/dispose';
import { eventDetails, monadOut, MonadUtil, on, SimpleMonad } from 'external/gs_tools/src/event';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { Disposable, MonadSetter, MonadValue } from 'external/gs_tools/src/interfaces';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import { QuerySelectorType } from 'external/gs_tools/src/ui';
import { Log } from 'external/gs_tools/src/util';
import { customElement, dom, domOut, onDom} from 'external/gs_tools/src/webc';
import { onLifecycle } from 'external/gs_tools/src/webc/on-lifecycle';

import { AnchorLocation } from '../const';
import { AnchorLocationParser } from '../tool/anchor-location-parser';
import { OverlayBus, OverlayEventType } from '../tool/overlay-bus';
import { OverlayService } from '../tool/overlay-service';

const LOG = Log.of('gs-ui.Menu');

const ANCHOR_POINT_ATTR = {
  name: 'anchor-point',
  parser: AnchorLocationParser,
  selector: null,
};
const ANCHOR_TARGET_ATTR = {
  name: 'anchor-target',
  parser: AnchorLocationParser,
  selector: null,
};
const FIT_PARENT_WIDTH_ATTR = {name: 'fit-parent-width', parser: BooleanParser, selector: null};
const TRIGGERED_BY_ATTR = {name: 'triggered-by', parser: StringParser, selector: null};
const VISIBLE_ATTR = {name: 'visible', parser: BooleanParser, selector: null};

const TRIGGERED_BY_REGISTRATION_FACTORY = SimpleMonad.newFactory(Symbol('triggeredBy'), null);

@customElement({
  dependencies: ImmutableSet.of([
    OverlayService,
  ]),
  tag: 'gs-menu',
  templateKey: 'src/tool/menu',
})
export class Menu extends BaseDisposable {
  private readonly id_: symbol = Symbol('menuId');

  constructor(@inject('gs.tool.OverlayService') private overlayService_: OverlayService) {
    super();
  }

  @onLifecycle('create')
  onCreated_(
      @domOut.attribute(ANCHOR_POINT_ATTR) anchorPointSetter: MonadSetter<null | AnchorLocation>,
      @domOut.attribute(ANCHOR_TARGET_ATTR) anchorTargetSetter: MonadSetter<null | AnchorLocation>,
      @domOut.attribute(VISIBLE_ATTR) visibleSetter: MonadSetter<null | boolean>):
      Iterable<MonadValue<any>> {
    const values: MonadValue<any>[] = [];
    if (anchorPointSetter.value === null) {
      values.push(anchorPointSetter.set(AnchorLocation.AUTO));
    }

    if (anchorTargetSetter.value === null) {
      values.push(anchorTargetSetter.set(AnchorLocation.AUTO));
    }

    if (visibleSetter.value === null) {
      values.push(visibleSetter.set(false));
    }

    return ImmutableSet.of(values);
  }

  @on(OverlayBus, 'show')
  @on(OverlayBus, 'hide')
  onOverlayVisibilityChange_(
      @eventDetails() {id, type}: {id: symbol, type: OverlayEventType},
      @domOut.attribute(VISIBLE_ATTR) visibleSetter: MonadSetter<boolean | null>):
      Iterable<MonadValue<any>> {
    if (id !== this.id_) {
      return ImmutableSet.of([]);
    }

    return ImmutableSet.of([visibleSetter.set(type === 'show')]);
  }

  onTriggered_(
      @domOut.attribute(VISIBLE_ATTR) visibleAttrSetter: MonadSetter<boolean | null>):
      Iterable<MonadValue<any>> {
    return ImmutableSet.of([
      visibleAttrSetter.set(!visibleAttrSetter.value),
    ]);
  }

  @onDom.attributeChange(TRIGGERED_BY_ATTR)
  onTriggeredByChanged_(
      @monadOut(TRIGGERED_BY_REGISTRATION_FACTORY) triggeredByRegistrationSetter:
          MonadSetter<Disposable | null>,
      @dom.element(null) element: HTMLElement,
      @dom.attribute(TRIGGERED_BY_ATTR) triggeredBy: string | null): Iterable<MonadValue<any>> {
    if (triggeredByRegistrationSetter.value) {
      triggeredByRegistrationSetter.value.dispose();
    }

    if (!triggeredBy) {
      return ImmutableSet.of([]);
    }

    const rootNode = element.getRootNode();
    if (!QuerySelectorType.check(rootNode)) {
      throw new Error(`Cannot run query selector on ${rootNode}`);
    }

    const targetEl = rootNode.querySelector(triggeredBy);
    if (!targetEl) {
      Log.warn(LOG, 'No target elements found for', triggeredBy, 'in', rootNode);
      return ImmutableSet.of([]);
    }

    const listener = (event: Event) => {
      MonadUtil.callFunction(event, this, 'onTriggered_');
    };
    targetEl.addEventListener('gs-action', listener);
    return ImmutableSet.of([
      triggeredByRegistrationSetter.set(DisposableFunction.of(() => {
        targetEl.removeEventListener('gs-action', listener);
      })),
    ]);
  }

  @onDom.attributeChange(VISIBLE_ATTR)
  onVisibleChanged_(
      @dom.element(null) element: HTMLElement,
      @dom.attribute(FIT_PARENT_WIDTH_ATTR) fitParentWidth: boolean | null,
      @dom.attribute(VISIBLE_ATTR) visible: boolean | null,
      @dom.attribute(ANCHOR_TARGET_ATTR) anchorTarget: AnchorLocation | null,
      @dom.attribute(ANCHOR_POINT_ATTR) anchorPoint: AnchorLocation | null): void {
    if (visible) {
      const parentElement = element.parentElement;
      if (!parentElement) {
        throw new Error('No parent element found');
      }
      const menuContent = element.firstElementChild as HTMLElement | null;
      if (fitParentWidth && menuContent) {
        menuContent.style.width = `${parentElement.clientWidth}px`;
      }
      this.overlayService_.showOverlay(
          this.id_,
          element,
          menuContent,
          parentElement,
          anchorTarget || AnchorLocation.AUTO,
          anchorPoint || AnchorLocation.AUTO);
    } else {
      this.overlayService_.hideOverlay(this.id_);
    }
  }
}
