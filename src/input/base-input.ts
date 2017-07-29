import { MonadUtil } from 'external/gs_tools/src/event';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import {
  DispatchFn,
  Disposable,
  ElementSelector,
  Event,
  MonadSetter,
  MonadValue,
  Parser} from 'external/gs_tools/src/interfaces';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import { dom, domOut, onDom, onLifecycle, Util } from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common';
import { ThemeService } from '../theming';

const DISABLED_ATTR = {name: 'disabled', parser: BooleanParser, selector: null};
const VALUE_ATTR = {name: 'value', selector: null, parser: StringParser};
const CHANGE_EVENT = 'change';

export abstract class BaseInput<T, E extends HTMLElement = HTMLInputElement>
    extends BaseThemedElement2 {
  constructor(
      themeService: ThemeService,
      private readonly valueParser_: Parser<T>) {
    super(themeService);
  }

  protected getInputEl_(element: HTMLElement): E {
    return Util.requireSelector(this.getInputElSelector_(), element) as E;
  }

  protected abstract getInputElSelector_(): ElementSelector;

  protected abstract getInputElValue_(inputEl: E): string;

  protected abstract isValueChanged_(oldValue: T | null, newValue: T | null): boolean;

  protected abstract listenToValueChanges_(
      element: E,
      callback: (event: Event<any>) => void): Disposable;

  /**
   * @override
   */
  @onDom.event(null, 'click')
  onClick_(
      @dom.attribute(DISABLED_ATTR) disabled: boolean,
      @dom.element(null) rootEl: HTMLElement): void {
    if (disabled) {
      return;
    }

    const inputEl = this.getInputEl_(rootEl);
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
      @dom.element(null) element: HTMLElement,
      @dom.attribute(DISABLED_ATTR) newValue: boolean): void {
    this.setInputElDisabled_(this.getInputEl_(element), newValue);
  }

  /**
   * Handles event when the value of value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  @onDom.attributeChange(VALUE_ATTR)
  onElValueChange_(
      @dom.attribute(VALUE_ATTR) elValue: string | null,
      @dom.element(null) element: HTMLElement): void {
    const inputEl = this.getInputEl_(element);
    const inputValue = this.getInputElValue_(inputEl);
    const parsedInputValue = this.valueParser_.parse(inputValue);
    const parsedElValue = this.valueParser_.parse(elValue);
    if (!this.isValueChanged_(parsedInputValue, parsedElValue)) {
      return;
    }

    this.setInputElValue_(inputEl, elValue || '');
  }

  /**
   * Handler called when the input element fires a change event.
   */
  onInputChange_(
      @domOut.attribute(VALUE_ATTR) valueSetter: MonadSetter<string | null>,
      @dom.element(null) element: HTMLElement,
      @dom.eventDispatcher() dispatcher: DispatchFn<{}>): Iterable<MonadValue<any>> {
    const inputValue = this.getInputElValue_(this.getInputEl_(element));
    const parsedInputValue = this.valueParser_.parse(inputValue);
    const parsedElValue = this.valueParser_.parse(valueSetter.value);
    if (!this.isValueChanged_(parsedInputValue, parsedElValue)) {
      return ImmutableSet.of([]);
    }

    dispatcher(CHANGE_EVENT, {});
    return ImmutableSet.of([valueSetter.set(inputValue)]);
  }

  @onLifecycle('insert')
  onInserted_(@dom.element(null) element: HTMLElement): void {
    const inputEl = this.getInputEl_(element);
    this.addDisposable(this.listenToValueChanges_(inputEl, (event: Event<any>) => {
      MonadUtil.callFunction(event, this, 'onInputChange_');
    }));
  }

  protected abstract setInputElDisabled_(inputEl: E, disabled: boolean): void;

  protected abstract setInputElValue_(inputEl: E, newValue: string): void;
}
