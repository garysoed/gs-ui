import { BooleanType, StringType } from 'external/gs_tools/src/check';
import {
  DispatchFn,
  Disposable,
  Event,
  Parser} from 'external/gs_tools/src/interfaces';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  dispatcherSelector,
  elementSelector,
  onDom,
  render,
  resolveSelectors,
  shadowHostSelector} from 'external/gs_tools/src/persona';

import { Graph, nodeIn } from 'external/gs_tools/src/graph';
import { BaseThemedElement2 } from '../common';
import { ThemeService } from '../theming';

const CHANGE_EVENT = 'change';

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
    inValue: attributeSelector(
        elementSelector('host.el'),
        'in-value',
        StringParser,
        StringType),
    outValue: attributeSelector(
        elementSelector('host.el'),
        'out-value',
        StringParser,
        StringType),
  },
});

export abstract class BaseInput<T, E extends HTMLElement = HTMLInputElement>
    extends BaseThemedElement2 {
  constructor(
      themeService: ThemeService,
      private readonly valueParser_: Parser<T>) {
    super(themeService);
  }

  protected abstract getInputEl_(): Promise<E>;

  protected abstract getInputElValue_(inputEl: E): string;

  protected abstract listenToValueChanges_(
      element: E,
      callback: (event: Event<any>) => void): Disposable;

  /**
   * @override
   */
  @onDom.event(shadowHostSelector, 'click')
  async onClick_(): Promise<void> {
    const [disabled, inputEl] = await Promise.all([
      Graph.get($.host.disabled.getId(), this),
      this.getInputEl_(),
    ]);

    if (disabled) {
      return;
    }

    inputEl.focus();
  }

  /**
   * Handles event when the value of disabled attribute was changed.
   *
   * @param newValue The value of the disabled attribute..
   */
  @onDom.attributeChange($.host.disabled)
  async onDisabledChange_(): Promise<void> {
    const [disabled, inputEl] = await Promise.all([
      Graph.get($.host.disabled.getId(), this),
      this.getInputEl_(),
    ]);
    this.setInputElDisabled_(inputEl, disabled);
  }

  @onDom.event(shadowHostSelector, 'gs-create')
  async onHostCreated_(): Promise<void> {
    const inputEl = await this.getInputEl_();
    this.addDisposable(this.listenToValueChanges_(inputEl, () => {
      Graph.refresh($.host.outValue.getId(), this);
    }));
  }

  /**
   * Handles event when the value of value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  @onDom.attributeChange($.host.inValue)
  async onInValueChange_(): Promise<void> {
    const [inputEl, inValue] = await Promise.all([
      this.getInputEl_(),
      Graph.get($.host.inValue.getId(), this),
    ]);
    this.setInputElValue_(inputEl, this.valueParser_.parse(inValue));
  }

  protected refreshOutValue_(): void {
    Graph.refresh($.host.outValue.getId(), this);
  }

  @render.attribute($.host.outValue)
  async renderOutValue_(
      @nodeIn($.host.dispatch.getId()) dispatcher: DispatchFn<null>):
      Promise<string> {
    const inputEl = await this.getInputEl_();
    const inputValue = this.getInputElValue_(inputEl);
    dispatcher(CHANGE_EVENT, null);
    return inputValue;
  }

  protected abstract setInputElDisabled_(inputEl: E, disabled: boolean): void;

  protected abstract setInputElValue_(inputEl: E, newValue: T | null): void;
}
