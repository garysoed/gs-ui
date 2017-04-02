import { Interval } from 'external/gs_tools/src/async';
import { DomEvent } from 'external/gs_tools/src/event';
import { Parser } from 'external/gs_tools/src/interfaces';
import { BooleanParser } from 'external/gs_tools/src/parse';
import { DomHook, handle } from 'external/gs_tools/src/webc';

import { BaseActionElement } from '../common/base-action-element';
import { ThemeService } from '../theming/theme-service';


export abstract class BaseInput<T> extends BaseActionElement {
  private static INPUT_INTERVAL_: number = 500;

  protected readonly valueParser_: Parser<T>;
  protected readonly gsValueHook_: DomHook<T>;
  protected readonly inputDisabledHook_: DomHook<boolean>;
  protected readonly inputValueHook_: DomHook<string>;

  private readonly interval_: Interval;
  private inputEl_: HTMLInputElement | null = null;

  constructor(
      themeService: ThemeService,
      gsValueHook: DomHook<T>,
      valueHook: DomHook<string>,
      valueParser: Parser<T>) {
    super(themeService);
    this.gsValueHook_ = gsValueHook;
    this.inputDisabledHook_ = DomHook.of<boolean>(true);
    this.inputValueHook_ = valueHook;
    this.valueParser_ = valueParser;
    this.interval_ = new Interval(BaseInput.INPUT_INTERVAL_);
    this.addDisposable(this.interval_);
  }

  /**
   * @override
   */
  protected onClick_(): void {
    super.onClick_();
    if (this.inputEl_ !== null && !this.isDisabled()) {
      // TODO: Bind element.
      this.inputEl_.click();
      this.inputEl_.focus();
    }
  }

  /**
   * Handles event when the value of gs-value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  protected onGsValueChange_(newValue: T): void {
    let parsedValue = this.valueParser_.parse(this.inputValueHook_.get());
    if (this.isValueChanged_(parsedValue, newValue)) {
      this.inputValueHook_.set(this.valueParser_.stringify(newValue));
    }
  }

  /**
   * Handles event when the value of disabled attribute was changed.
   *
   * @param newValue The value of the disabled attribute..
   */
  @handle(null).attributeChange('disabled', BooleanParser)
  protected onDisabledChange_(newValue: boolean): void {
    this.inputDisabledHook_.set(newValue);
  }

  /**
   * Handler called when the input element fires a change event.
   */
  protected onInputTick_(): void {
    let previousValue = this.gsValueHook_.get();
    let parsedNewValue: T | null = this.valueParser_.parse(this.inputValueHook_.get());
    if (parsedNewValue === null) {
      return;
    }

    if (!this.isValueChanged_(previousValue, parsedNewValue)) {
      return;
    }

    this.gsValueHook_.set(parsedNewValue);
    let element = this.getElement();
    if (element !== null) {
      element.dispatch(DomEvent.CHANGE);
    }
  }

  protected isValueChanged_(oldValue: T | null, newValue: T | null): boolean {
    return oldValue !== newValue;
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.inputEl_ = element.shadowRoot.querySelector('input');
    this.addDisposable(this.interval_.on(Interval.TICK_EVENT, this.onInputTick_, this));
  }

  /**
   * @override
   */
  onInserted(element: HTMLElement): void {
    super.onInserted(element);
    this.interval_.start();
  }

  /**
   * @override
   */
  onRemoved(element: HTMLElement): void {
    super.onRemoved(element);
    this.interval_.stop();
  }
}
