import { eventDetails } from 'external/gs_tools/src/event';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import {
  customElement,
  dom,
  DomHook,
  hook,
  onDom} from 'external/gs_tools/src/webc';

import { BaseActionElement } from '../common/base-action-element';
import { RadioButtonService } from '../input/radio-button-service';
import { ThemeService } from '../theming/theme-service';


const CHECKED_ATTRIBUTE = {name: 'gs-checked', parser: BooleanParser, selector: null};
const GROUP_ATTRIBUTE = {name: 'gs-group', parser: StringParser, selector: null};


@customElement({
  attributes: {
    'gsChecked': BooleanParser,
    'gsGroup': StringParser,
  },
  dependencies: ImmutableSet.of([RadioButtonService]),
  tag: 'gs-radio-button',
  templateKey: 'src/input/radio-button',
})
export class RadioButton extends BaseActionElement {
  protected radioButtonService_: RadioButtonService;

  @hook(null).attribute('gs-checked', BooleanParser)
  private gsCheckedHook_: DomHook<boolean>;

  constructor(
      @inject('input.RadioButtonService') radioButtonService: RadioButtonService,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.gsCheckedHook_ = DomHook.of<boolean>(false /* deleteOnFalsy */);
    this.radioButtonService_ = radioButtonService;
  }

  /**
   * @override
   */
  protected onClick_(): void {
    super.onClick_();
    const element = this.getElement();
    if (!this.isDisabled() && element !== null) {
      this.radioButtonService_.setSelected(element.getEventTarget(), true);
    }
  }

  /**
   * Handles event when gs-checked attribute is changed.
   *
   * @param newValue The new value of gs-checked.
   * @param oldValue The old value of gs-checked.
   */
  @onDom.attributeChange(CHECKED_ATTRIBUTE)
  protected onGsCheckedChanged_(
      @dom.attribute(CHECKED_ATTRIBUTE) newValue: boolean,
      @eventDetails() {oldValue}: {oldValue: boolean}): void {
    if (newValue !== oldValue) {
      this.updateService_(newValue);
    }
  }

  /**
   * Handles event when gs-group attribute is changed.
   */
  @onDom.attributeChange(GROUP_ATTRIBUTE)
  protected onGsGroupChanged_(): void {
    this.updateService_(this.gsCheckedHook_.get() || false);
  }

  /**
   * Updates the radio button service.
   *
   * @param isChecked True iff the element should be checked.
   */
  protected updateService_(isChecked: boolean): void {
    const element = this.getElement();
    if (element !== null) {
      this.radioButtonService_.setSelected(element.getEventTarget(), isChecked);
    }
  }
}
// TODO: Mutable
