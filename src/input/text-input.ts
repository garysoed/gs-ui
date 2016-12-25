import {Interval} from 'external/gs_tools/src/async';
import {DomEvent} from 'external/gs_tools/src/event';
import {inject} from 'external/gs_tools/src/inject';
import {
  bind,
  BooleanParser,
  customElement,
  DomBridge,
  handle,
  StringParser} from 'external/gs_tools/src/webc';

import {BaseActionElement} from '../common/base-action-element';
import {ThemeService} from '../theming/theme-service';


@customElement({
  attributes: {
    'disabled': BooleanParser,
    'gsPlaceHolder': StringParser,
    'gsValue': StringParser,
  },
  tag: 'gs-text-input',
  templateKey: 'src/input/text-input',
})
export class TextInput extends BaseActionElement {
  private static INPUT_INTERVAL_: number = 500;

  @bind(null).attribute('gs-value', StringParser)
  private readonly gsValueBridge_: DomBridge<string>;

  @bind('input[type="text"]').attribute('disabled', BooleanParser)
  private readonly inputDisabledBridge_: DomBridge<boolean>;

  @bind('input').property('value')
  private readonly inputValueBridge_: DomBridge<string>;

  private readonly interval_: Interval;
  private inputEl_: HTMLInputElement | null = null;

  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.gsValueBridge_ = DomBridge.of<string>();
    this.inputDisabledBridge_ = DomBridge.of<boolean>(true);
    this.inputValueBridge_ = DomBridge.of<string>();
    this.interval_ = new Interval(TextInput.INPUT_INTERVAL_);
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
  @handle(null).attributeChange('gs-value', StringParser)
  protected onGsValueChange_(newValue: string): void {
    if (this.inputValueBridge_.get() !== newValue) {
      this.inputValueBridge_.set(newValue);
    }
  }

  /**
   * Handles event when the value of disabled attribute was changed.
   *
   * @param newValue The value of the disabled attribute..
   */
  @handle(null).attributeChange('disabled', BooleanParser)
  protected onDisabledChange_(newValue: boolean): void {
    this.inputDisabledBridge_.set(newValue);
  }

  /**
   * Handler called when the input element fires a change event.
   */
  protected onInputTick_(): void {
    let previousValue = this.gsValueBridge_.get();
    let newValue: string | null = null;
    if (this.inputEl_ !== null) {
      newValue = this.inputEl_.value;
      if (newValue !== previousValue) {
        this.gsValueBridge_.set(newValue);
        let element = this.getElement();
        if (element !== null) {
          element.dispatch(DomEvent.CHANGE);
        }
      }
    }
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
