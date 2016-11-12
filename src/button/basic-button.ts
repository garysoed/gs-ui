import {customElement} from 'external/gs_tools/src/webc';

import {BaseActionElement} from '../common/base-action-element';


@customElement({
  tag: 'gs-basic-button',
  templateKey: 'src/button/basic-button',
})
export class BasicButton extends BaseActionElement { }
