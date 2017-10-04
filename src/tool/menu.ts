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
import {
  BooleanType,
  EnumType,
  InstanceofType,
  NullableType,
  StringType } from 'external/gs_tools/src/check';
import { DisposableFunction } from 'external/gs_tools/src/dispose';
import { Graph, GraphTime, instanceId, nodeIn } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  component,
  elementSelector,
  onDom,
  Persona,
  render,
  resolveSelectors,
  shadowHostSelector} from 'external/gs_tools/src/persona';
import { QuerySelectorType } from 'external/gs_tools/src/ui';
import { Log } from 'external/gs_tools/src/util';

import { BaseThemedElement2 } from '../common';
import { AnchorLocation } from '../const';
import { ThemeService } from '../theming';
import { AnchorLocationParser } from '../tool/anchor-location-parser';
import { $overlay } from '../tool/overlay-graph';
import { OverlayService } from '../tool/overlay-service';

const LOG = Log.of('gs-ui.Menu');

export const $ = resolveSelectors({
  host: {
    anchorPoint: attributeSelector(
        elementSelector('host.el'),
        'anchor-point',
        AnchorLocationParser,
        EnumType(AnchorLocation),
        AnchorLocation.AUTO),
    anchorTarget: attributeSelector(
        elementSelector('host.el'),
        'anchor-target',
        AnchorLocationParser,
        EnumType(AnchorLocation),
        AnchorLocation.AUTO),
    el: shadowHostSelector,
    fitParentWidth: attributeSelector(
        elementSelector('host.el'),
        'fit-parent-width',
        BooleanParser,
        BooleanType,
        false),
    triggeredBy: attributeSelector(
        elementSelector('host.el'),
        'triggered-by',
        StringParser,
        NullableType(StringType),
        null),
    visible: attributeSelector(
        elementSelector('host.el'),
        'visible',
        BooleanParser,
        BooleanType,
        false),
  },
});
export const $triggeredByRegistration = instanceId(
    'triggeredByRegistration',
    NullableType(InstanceofType(DisposableFunction)));
export const triggeredByRegistrationProvider = Graph.createProvider($triggeredByRegistration, null);

@component({
  dependencies: [
    OverlayService,
  ],
  inputs: [
    $.host.anchorPoint,
    $.host.anchorTarget,
    $.host.el,
    $.host.fitParentWidth,
    $.host.triggeredBy,
  ],
  tag: 'gs-menu',
  templateKey: 'src/tool/menu',
})
export class Menu extends BaseThemedElement2 {
  private readonly id_: symbol = Symbol('menuId');

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService,
      @inject('gs.tool.OverlayService') private overlayService_: OverlayService) {
    super(themeService);
  }

  private async onTriggered_(): Promise<void> {
    const time = Graph.getTimestamp();
    const visible = await Graph.get($.host.visible.getId(), time, this);
    this.setOverlayVisible_(!visible, time);
  }

  @onDom.attributeChange($.host.triggeredBy)
  async onTriggeredByChanged_(): Promise<void> {
    const triggeredBy = Persona.getValue($.host.triggeredBy, this);
    if (!triggeredBy) {
      return;
    }

    const time = Graph.getTimestamp();
    const [element, triggeredByRegistration] = await Promise.all([
      Graph.get($.host.el.getId(), time, this),
      Graph.get($triggeredByRegistration, time, this),
    ]);

    const rootNode = element.getRootNode();
    if (!QuerySelectorType.check(rootNode)) {
      throw new Error(`Cannot run query selector on ${rootNode}`);
    }

    const targetEl = rootNode.querySelector(triggeredBy);
    if (!targetEl) {
      Log.warn(LOG, 'No target elements found for', triggeredBy, 'in', rootNode);
      return;
    }

    if (triggeredByRegistration) {
      triggeredByRegistration.dispose();
    }

    const listener = () => {
      this.onTriggered_();
    };
    targetEl.addEventListener('gs-action', listener);
    return triggeredByRegistrationProvider(
        DisposableFunction.of(() => {
          targetEl.removeEventListener('gs-action', listener);
        }),
        this);
  }

  @onDom.attributeChange($.host.visible)
  onVisibleChanged_(): void {
    this.setOverlayVisible_(Persona.getValue($.host.visible, this) || false, Graph.getTimestamp());
  }

  @render.attribute($.host.visible)
  renderVisible_(@nodeIn($overlay.state) state: {id: symbol, visible: boolean} | null): boolean {
    if (!state) {
      return false;
    }

    if (state.id !== this.id_) {
      return false;
    }

    return state.visible;
  }

  private async setOverlayVisible_(visible: boolean, time: GraphTime): Promise<void> {
    const [element, fitParentWidth, anchorTarget, anchorPoint] = await Promise.all([
      Graph.get($.host.el.getId(), time, this),
      Graph.get($.host.fitParentWidth.getId(), time, this),
      Graph.get($.host.anchorTarget.getId(), time, this),
      Graph.get($.host.anchorPoint.getId(), time, this),
    ]);

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
