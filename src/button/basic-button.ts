import {BaseElement, CustomElement} from '../../external/gs_tools/src/webc';


@CustomElement({
  tag: 'gs-basic-button',
  templateKey: 'src/button/basic-button',
})
export class BasicButton extends BaseElement {
  onCreated(element: HTMLElement): void {
    element.classList.add('gs-action');
  }
}
