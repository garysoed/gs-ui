import {BaseActionElement} from '../common/base-action-element';
import {customElement} from '../../external/gs_tools/src/webc';


@customElement({
  tag: 'gs-basic-button',
  templateKey: 'src/button/basic-button',
})
export class BasicButton extends BaseActionElement { }
