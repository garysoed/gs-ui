import {BaseActionElement} from '../common/base-action-element';
import {
  BooleanParser,
  customElement,
  StringParser} from '../../external/gs_tools/src/webc';
import {inject} from '../../external/gs_tools/src/inject';
import {RadioButtonService} from './radio-button-service';


@customElement({
  attributes: {
    'gsChecked': BooleanParser,
    'gsGroup': StringParser,
  },
  dependencies: [RadioButtonService],
  tag: 'gs-radio-button',
  templateKey: 'src/input/radio-button',
})
export class RadioButton extends BaseActionElement {
  constructor(
      @inject('input.RadioButtonService') protected radioButtonService_: RadioButtonService) {
    super();
  }

  /**
   * @override
   */
  protected onClick_(): void {
    super.onClick_();
    if (!this.isDisabled()) {
      this.radioButtonService_.setSelected(this.getElement().getEventTarget(), true);
    }
  }

  /**
   * @override
   */
  onAttributeChanged(attrName: string, oldValue: string, newValue: string): void {
    super.onAttributeChanged(attrName, oldValue, newValue);
    switch (attrName) {
      case 'gs-checked':
      case 'gs-group':
        let element = this.getElement().getEventTarget();
        this.radioButtonService_.setSelected(element, element['gsChecked']);
        break;
    }
  }
}
