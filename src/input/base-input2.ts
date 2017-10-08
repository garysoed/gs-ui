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
  Persona,
  render,
  resolveSelectors,
  shadowHostSelector} from 'external/gs_tools/src/persona';

import { Graph, GraphTime, instanceId, nodeIn } from 'external/gs_tools/src/graph';
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
    value: attributeSelector(
        elementSelector('host.el'),
        'value',
        StringParser,
        StringType,
        ''),
  },
});
export const $inputValue = instanceId('inputValue', StringType);
export const inputValueProvider = Graph.createProvider($inputValue, '');

export abstract class BaseInput<T, E extends HTMLElement = HTMLInputElement>
    extends BaseThemedElement2 {
  constructor(
      themeService: ThemeService,
      private readonly valueParser_: Parser<T>) {
    super(themeService);
  }

  protected abstract getInputEl_(time: GraphTime): Promise<E>;

  protected abstract getInputElValue_(inputEl: E): T;

  protected abstract listenToValueChanges_(
      element: E,
      callback: (event: Event<any>) => void): Disposable;

  /**
   * @override
   */
  @onDom.event(shadowHostSelector, 'click')
  async onClick_(): Promise<void> {
    const time = Graph.getTimestamp();
    const inputEl = await this.getInputEl_(time);

    if (Persona.getValue($.host.disabled, this) || false) {
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
  @onDom.event(shadowHostSelector, 'gs-connected')
  async onDisabledChange_(): Promise<void> {
    const time = Graph.getTimestamp();
    const inputEl = await this.getInputEl_(time);
    this.setInputElDisabled_(inputEl, Persona.getValue($.host.disabled, this) || false);
  }

  @onDom.event(shadowHostSelector, 'gs-connected')
  async onHostCreated_(): Promise<void> {
    const time = Graph.getTimestamp();
    const inputEl = await this.getInputEl_(time);
    this.addDisposable(this.listenToValueChanges_(inputEl, () => {
      return inputValueProvider(this.valueParser_.stringify(this.getInputElValue_(inputEl)), this);
    }));
    await inputValueProvider(this.valueParser_.stringify(this.getInputElValue_(inputEl)), this);
  }

  /**
   * Handles event when the value of value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  @onDom.attributeChange($.host.value)
  @onDom.event(shadowHostSelector, 'gs-connected')
  async onValueChange_(): Promise<void> {
    const time = Graph.getTimestamp();
    const inputEl = await this.getInputEl_(time);
    this.setInputElValue_(inputEl, this.valueParser_.parse(Persona.getValue($.host.value, this)));
  }

  @render.attribute($.host.value)
  async renderValue_(
      @nodeIn($.host.dispatch.getId()) dispatcher: DispatchFn<null>,
      @nodeIn($inputValue) inputValue: string): Promise<string> {
    dispatcher(CHANGE_EVENT, null);
    return inputValue;
  }

  protected abstract setInputElDisabled_(inputEl: E, disabled: boolean): void;

  protected abstract setInputElValue_(inputEl: E, newValue: T | null): void;
}
