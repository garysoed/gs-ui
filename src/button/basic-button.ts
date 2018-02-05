/**
 * @webcomponent gs-basic-button
 * A basic button.
 *
 * @attr {<boolean} disabled True iff the button should be disabled.
 * @attr {<boolean} primary True iff the button is primary button.
 *
 * @css {color} gsButtonFG The foreground color of the button.
 * @css {color} gsButtonFG The background color of the button.
 *
 * @event {{}} gs-action Dispatched when the button is clicked.
 */
import { BooleanType } from 'external/gs_tools/src/check';
import { Graph, GraphTime, nodeIn } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  component,
  dispatcherSelector,
  elementSelector,
  onDom,
  render,
  resolveSelectors,
  shadowHostSelector } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from '../common';
import { ThemeService } from '../theming';
import { ActionTracker } from '../tool';

export const $ = resolveSelectors({
  host: {
    ariaDisabled: attributeSelector(
        elementSelector('host.el'),
        'aria-disabled',
        BooleanParser,
        BooleanType,
        false),
    disabled: attributeSelector(
        elementSelector('host.el'),
        'disabled',
        BooleanParser,
        BooleanType,
        false),
    dispatch: dispatcherSelector<null>(elementSelector('host.el')),
    el: shadowHostSelector,
  },
});

@component({
  defaultAttrs: new Map([
    ['role', 'button'],
    ['tabindex', '0'],
  ]),
  inputs: [
    $.host.disabled,
    $.host.dispatch,
  ],
  tag: 'gs-basic-button',
  templateKey: 'src/button/basic-button',
})
export class BasicButton extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  private async activate_(time: GraphTime): Promise<void> {
    const [disabled, dispatcher] = await Promise.all([
      Graph.get($.host.disabled.getId(), time, this),
      Graph.get($.host.dispatch.getId(), time, this),
    ]);

    if (disabled) {
      return;
    }
    dispatcher('gs-action', null);
  }

  @onDom.keystroke($.host.el, 'Enter')
  @onDom.keystroke($.host.el, ' ')
  onAction_(): void {
    this.activate_(Graph.getTimestamp());
    ActionTracker.set({type: 'keyboard'});
  }

  @onDom.event($.host.el, 'click')
  onClick_(event: MouseEvent): void {
    this.activate_(Graph.getTimestamp());
    ActionTracker.set({type: 'click', x: event.x, y: event.y});
  }

  @render.attribute($.host.ariaDisabled)
  renderRootAriaDisabled_(@nodeIn($.host.disabled.getId()) hostDisabled: boolean): boolean {
    return hostDisabled;
  }
}
