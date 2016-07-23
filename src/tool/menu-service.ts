import {Bind, Inject} from '../../external/gs_tools/src/inject';


@Bind()
export class MenuService {
  constructor(
      @Inject('x.dom.document') private document_: Document) { }

  addMenu(menu: HTMLElement, parentElement: HTMLElement): Promise<void> {
    return new Promise((resolve: () => void, reject: () => void): void => {

    });
  }
}
