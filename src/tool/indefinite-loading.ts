import { BaseElement, customElement } from 'external/gs_tools/src/webc';


@customElement({
  tag: 'gs-indefinite-loading',
  templateKey: 'src/tool/indefinite-loading',
})
export class IndefiniteLoading extends BaseElement {
  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    element.classList.add('gs-action');
  }
}
