/**
 * @webcomponent gs-text-input
 * Element for inputting texts.
 *
 * @attr {boolean} disabled True iff the input should be disabled.
 * @attr {string} in-value Value to set the input.
 * @attr {string} out-value New value of the input.
 *
 * @event {null} change Dispatched when the value has changed.
 */
import { InstanceofType } from 'external/gs_tools/src/check';
import { ListenableDom } from 'external/gs_tools/src/event';
import { Graph } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { Event } from 'external/gs_tools/src/interfaces';
import { Disposable } from 'external/gs_tools/src/interfaces';
import { StringParser } from 'external/gs_tools/src/parse';
import { component, elementSelector, resolveSelectors } from 'external/gs_tools/src/persona';

import { $ as $base, BaseInput } from '../input/base-input2';
import { ThemeService } from '../theming/theme-service';

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
    $base.host.inValue,
  ],
  tag: 'gs-text-input',
  templateKey: 'src/input/text-input',
})
export class TextInput extends BaseInput<string> {
  constructor( @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService, StringParser);
  }

  protected getInputEl_(): Promise<HTMLInputElement> {
    return Graph.get($.input.el.getId(), this);
  }

  protected getInputElValue_(inputEl: HTMLInputElement): string {
    return inputEl.value;
  }

  protected listenToValueChanges_(
      element: HTMLInputElement,
      callback: (event: Event<any>) => void): Disposable {
    const listenableDom = ListenableDom.of(element);
    const disposable = listenableDom.on('input', callback, this);
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

  protected setInputElValue_(inputEl: HTMLInputElement, newValue: string): void {
    inputEl.value = newValue;
  }
}
