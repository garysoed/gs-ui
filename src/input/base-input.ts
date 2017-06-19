import { Interval } from 'external/gs_tools/src/async';
import { DomEvent } from 'external/gs_tools/src/event';
import { Parser } from 'external/gs_tools/src/interfaces';
import { BooleanParser } from 'external/gs_tools/src/parse';
import { dom, DomHook, onDom } from 'external/gs_tools/src/webc';

import { BaseActionElement } from '../common/base-action-element';
import { ThemeService } from '../theming/theme-service';


const DISABLED_ATTRIBUTE = {name: 'disabled', parser: BooleanParser, selector: null};


export abstract class BaseInput<T> extends BaseActionElement {
  private static INPUT_INTERVAL_: number = 500;

  protected readonly gsValueHook_: DomHook<T>;
  protected readonly inputDisabledHook_: DomHook<boolean>;
  protected readonly inputValueHook_: DomHook<string>;
  protected readonly valueParser_: Parser<T>;

  private inputEl_: HTMLInputElement | null = null;
  private readonly interval_: Interval;

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

  protected isValueChanged_(oldValue: T | null, newValue: T | null): boolean {
    return oldValue !== newValue;
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
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    const shadowRoot = element.shadowRoot;
    if (shadowRoot === null) {
      throw new Error('No shadow roots were found');
    }
    this.inputEl_ = shadowRoot.querySelector('input');
    this.addDisposable(this.interval_.on('tick', this.onInputTick_, this));
  }

  /**
   * Handles event when the value of disabled attribute was changed.
   *
   * @param newValue The value of the disabled attribute..
   */
  @onDom.attributeChange(DISABLED_ATTRIBUTE)
  protected onDisabledChange_(
      @dom.attribute(DISABLED_ATTRIBUTE) newValue: boolean): void {
    this.inputDisabledHook_.set(newValue);
  }

  /**
   * Handles event when the value of gs-value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  protected onGsValueChange_(newValue: T): void {
    const parsedValue = this.valueParser_.parse(this.inputValueHook_.get());
    if (this.isValueChanged_(parsedValue, newValue)) {
      this.inputValueHook_.set(this.valueParser_.stringify(newValue));
    }
  }

  /**
   * Handler called when the input element fires a change event.
   */
  protected onInputTick_(): void {
    const previousValue = this.gsValueHook_.get();
    const parsedNewValue: T | null = this.valueParser_.parse(this.inputValueHook_.get());
    if (parsedNewValue === null) {
      return;
    }

    if (!this.isValueChanged_(previousValue, parsedNewValue)) {
      return;
    }

    this.gsValueHook_.set(parsedNewValue);
    const element = this.getElement();
    if (element !== null) {
      element.dispatch(DomEvent.CHANGE);
    }
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
// TODO: Mutable
