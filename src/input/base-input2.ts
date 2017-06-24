import { MonadSetter } from 'external/gs_tools/src/event';
import { DispatchFn, Parser } from 'external/gs_tools/src/interfaces';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import { dom, domOut, onDom } from 'external/gs_tools/src/webc';

import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { BaseThemedElement2 } from '../common/base-themed-element2';
import { ThemeService } from '../theming/theme-service';

const INPUT_EL = 'input';
const DISABLED_ATTR = {name: 'disabled', parser: BooleanParser, selector: null};
const INPUT_DISABLED_ATTR = {name: 'disabled', selector: INPUT_EL, parser: BooleanParser};
const VALUE_ATTR = {name: 'value', selector: null, parser: StringParser};
const CHANGE_EVENT = 'change';

export abstract class BaseInput2<T> extends BaseThemedElement2 {
  constructor(
      themeService: ThemeService,
      private readonly valueParser_: Parser<T>) {
    super(themeService);
  }

  protected abstract isValueChanged_(oldValue: T | null, newValue: T | null): boolean;

  /**
   * @override
   */
  @onDom.event(null, 'click')
  onClick_(
      @dom.attribute(DISABLED_ATTR) disabled: boolean,
      @dom.element(INPUT_EL) inputEl: HTMLElement): void {
    if (disabled) {
      return;
    }

    inputEl.click();
    inputEl.focus();
  }

  /**
   * Handles event when the value of disabled attribute was changed.
   *
   * @param newValue The value of the disabled attribute..
   */
  @onDom.attributeChange(DISABLED_ATTR)
  onDisabledChange_(
      @dom.attribute(DISABLED_ATTR) newValue: boolean,
      @domOut.attribute(INPUT_DISABLED_ATTR) {id: inputDisabledId}: MonadSetter<boolean>):
      ImmutableMap<string, any> {
    return ImmutableMap.of([[inputDisabledId, newValue]]);
  }

  /**
   * Handles event when the value of gs-value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  @onDom.attributeChange(VALUE_ATTR)
  onElValueChange_(
      @dom.attribute(VALUE_ATTR) elValue: string | null,
      @dom.element(INPUT_EL) inputEl: HTMLInputElement): void {
    const inputValue = inputEl.value;
    const parsedInputValue = this.valueParser_.parse(inputValue);
    const parsedElValue = this.valueParser_.parse(elValue);
    if (!this.isValueChanged_(parsedInputValue, parsedElValue)) {
      return;
    }

    inputEl.value = elValue || '';
  }

  /**
   * Handler called when the input element fires a change event.
   */
  @onDom.event(INPUT_EL, 'change')
  onInputChange_(
      @domOut.attribute(VALUE_ATTR) {id: elValueId, value: elValue}: MonadSetter<string | null>,
      @dom.element(INPUT_EL) inputEl: HTMLInputElement,
      @dom.eventDispatcher() dispatcher: DispatchFn<{}>): ImmutableMap<string, any> {
    const inputValue = inputEl.value;
    const parsedInputValue = this.valueParser_.parse(inputValue);
    const parsedElValue = this.valueParser_.parse(elValue);
    if (!this.isValueChanged_(parsedInputValue, parsedElValue)) {
      return ImmutableMap.of<string, any>([]);
    }

    dispatcher(CHANGE_EVENT, {});
    return ImmutableMap.of([[elValueId, inputValue]]);
  }
}
