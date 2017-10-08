/**
 * @webcomponent gs-check-input
 * Element for checkbox.
 *
 * @attr {<boolean} disabled True iff the input should be disabled.
 * @attr {=enum<CheckState>} value Value of the checkbox.
 *
 * @event {null} change Dispatched when the value has changed.
 */
import { InstanceofType } from 'external/gs_tools/src/check';
import { Graph, GraphTime } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { Disposable, Event } from 'external/gs_tools/src/interfaces';
import { EnumParser } from 'external/gs_tools/src/parse';
import { component, elementSelector, resolveSelectors } from 'external/gs_tools/src/persona';

import { ListenableDom } from 'external/gs_tools/src/event';
import { $ as $base, BaseInput } from '../input/base-input2';
import { CheckState } from '../input/check-state';
import { ThemeService } from '../theming';

export const $ = resolveSelectors({
  input: {
    el: elementSelector('#input', InstanceofType(HTMLInputElement)),
  },
});

@component({
  inputs: [
    $.input.el,
    $base.host.disabled,
    $base.host.dispatch,
  ],
  tag: 'gs-check-input',
  templateKey: 'src/input/check-input',
})
export class CheckInput extends BaseInput<CheckState> {
  constructor( @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService, EnumParser(CheckState));
  }

  protected getInputEl_(time: GraphTime): Promise<HTMLInputElement> {
    return Graph.get($.input.el.getId(), time, this);
  }

  protected getInputElValue_(inputEl: HTMLInputElement): CheckState {
    if (inputEl.indeterminate) {
      return CheckState.INDETERMINATE;
    } else if (inputEl.checked) {
      return CheckState.CHECKED;
    } else {
      return CheckState.UNCHECKED;
    }
  }

  protected listenToValueChanges_(
      element: HTMLInputElement,
      callback: (event: Event<any>) => void): Disposable {
    const listenableDom = ListenableDom.of(element);
    const disposable = listenableDom.on('change', callback, this);
    this.addDisposable(listenableDom);
    return disposable;
  }

  protected setInputElDisabled_(inputEl: HTMLInputElement, disabled: boolean): void {
    if (disabled) {
      inputEl.setAttribute('disabled', '');
    } else {
      inputEl.removeAttribute('disabled');
    }
  }

  protected setInputElValue_(inputEl: HTMLInputElement, newValue: CheckState | null): void {
    const normalizedValue = newValue === null ? CheckState.INDETERMINATE : newValue;
    inputEl.checked = normalizedValue === CheckState.CHECKED;
    inputEl.indeterminate = normalizedValue === CheckState.INDETERMINATE;
  }
}
