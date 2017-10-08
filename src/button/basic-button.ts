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
import { Graph } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  component,
  dispatcherSelector,
  elementSelector,
  onDom,
  resolveSelectors,
  shadowHostSelector} from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from '../common';
import { ThemeService } from '../theming';
import { ActionTracker } from '../tool';

export const $ = resolveSelectors({
  host: {
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

  @onDom.event($.host.el, 'click')
  async onClick_(event: MouseEvent): Promise<void> {
    const time = Graph.getTimestamp();
    const [disabled, dispatcher] = await Promise.all([
      Graph.get($.host.disabled.getId(), time, this),
      Graph.get($.host.dispatch.getId(), time, this),
    ]);

    if (disabled) {
      return;
    }
    dispatcher('gs-action', null);
    ActionTracker.set({type: 'click', x: event.x, y: event.y});
  }
}
