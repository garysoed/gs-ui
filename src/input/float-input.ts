/**
 * @webcomponent gs-float-input
 * Element for inputting float.
 *
 * @attr {boolean} disabled True iff the input should be disabled.
 * @attr {float} value Value of the input.
 *
 * @event {{}} change Dispatched when the value has changed.
 */
import { inject } from 'external/gs_tools/src/inject';
import { Disposable, ElementSelector, Event } from 'external/gs_tools/src/interfaces';
import { FloatParser } from 'external/gs_tools/src/parse';
import { customElement } from 'external/gs_tools/src/webc';

import { ListenableDom } from 'external/gs_tools/src/event';
import { BaseInput2 } from '../input/base-input2';
import { ThemeService } from '../theming/theme-service';

const INPUT_EL = 'input';

@customElement({
  tag: 'gs-float-input',
  templateKey: 'src/input/float-input',
})
export class FloatInput extends BaseInput2<number> {
  constructor( @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService, FloatParser);
  }

  protected getInputElSelector_(): ElementSelector {
    return INPUT_EL;
  }

  protected getInputElValue_(inputEl: HTMLInputElement): string {
    return inputEl.value;
  }

  /**
   * @override
   */
  protected isValueChanged_(oldValue: number | null, newValue: number | null): boolean {
    if (newValue !== null
        && oldValue !== null
        && Number.isNaN(oldValue)
        && Number.isNaN(newValue)) {
      return false;
    }
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
