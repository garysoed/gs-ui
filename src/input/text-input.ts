/**
 * @webcomponent gs-text-input
 * Element for inputting texts.
 *
 * @attr {boolean} disabled True iff the input should be disabled.
 * @attr {float} value Value of the input.
 *
 * @event {{}} change Dispatched when the value has changed.
 */
import { ListenableDom } from 'external/gs_tools/src/event';
import { inject } from 'external/gs_tools/src/inject';
import { Event } from 'external/gs_tools/src/interfaces';
import { Disposable, ElementSelector } from 'external/gs_tools/src/interfaces';
import { StringParser } from 'external/gs_tools/src/parse';
import { customElement } from 'external/gs_tools/src/webc';

import { BaseInput2 } from '../input/base-input2';
import { ThemeService } from '../theming/theme-service';

@customElement({
  tag: 'gs-text-input',
  templateKey: 'src/input/text-input',
})
export class TextInput extends BaseInput2<string> {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService, StringParser);
  }

  protected getInputElSelector_(): ElementSelector {
    return '#input';
  }

  protected getInputElValue_(inputEl: HTMLInputElement): string {
    return inputEl.value;
  }

  protected isValueChanged_(oldValue: string | null, newValue: string | null): boolean {
    return oldValue !== newValue;
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

  protected setInputElValue_(inputEl: HTMLInputElement, newValue: string): void {
    inputEl.value = newValue;
  }
}
