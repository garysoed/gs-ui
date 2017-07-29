/**
 * @webcomponent gs-basic-button
 * A basic button.
 *
 * @attr {boolean} disabled True iff the button should be disabled.
 * @attr {boolean} primary True iff the button is primary button.
 *
 * @css {color} gsButtonFG The foreground color of the button.
 * @css {color} gsButtonFG The background color of the button.
 *
 * @event {{}} gs-action Dispatched when the button is clicked.
 */
import { eventDetails, monadOut } from 'external/gs_tools/src/event';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { DispatchFn, MonadSetter, MonadValue } from 'external/gs_tools/src/interfaces';
import { BooleanParser } from 'external/gs_tools/src/parse';
import { customElement, dom, onDom } from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common';
import { ThemeService } from '../theming';
import { Action, ActionTracker } from '../tool';


const DISABLED_ATTR = {name: 'disabled', parser: BooleanParser, selector: null};

@customElement({
  tag: 'gs-basic-button',
  templateKey: 'src/button/basic-button',
})
export class BasicButton extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.event(null, 'click')
  onClick_(
      @dom.attribute(DISABLED_ATTR) disabled: boolean | null,
      @dom.eventDispatcher() dispatcher: DispatchFn<{}>,
      @eventDetails() event: MouseEvent,
      @monadOut(ActionTracker) actionSetter: MonadSetter<Action | null>):
      Iterable<MonadValue<any>> {
    if (disabled) {
      return ImmutableSet.of([]);
    }
    dispatcher('gs-action', {});
    return ImmutableSet.of([actionSetter.set({type: 'click', x: event.x, y: event.y})]);
  }
}
