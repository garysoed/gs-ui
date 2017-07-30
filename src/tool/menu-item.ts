import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { StringParser } from 'external/gs_tools/src/parse';
import { customElement, dom, domOut, onDom } from 'external/gs_tools/src/webc';

import { MonadSetter, MonadValue } from 'external/gs_tools/src/interfaces';
import { BaseThemedElement2 } from '../common';
import { ThemeService } from '../theming';

const CONTENT_EL = '#content';

const CONTENT_ATTRIBUTE = {name: 'content', parser: StringParser, selector: null};
const CONTENT_INNER_TEXT = {parser: StringParser, selector: CONTENT_EL};

@customElement({
  tag: 'gs-menu-item',
  templateKey: 'src/tool/menu-item',
})
export class MenuItem extends BaseThemedElement2 {
  constructor(
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.attributeChange(CONTENT_ATTRIBUTE)
  onDataAttributeChange_(
      @dom.attribute(CONTENT_ATTRIBUTE) newContent: string,
      @domOut.innerText(CONTENT_INNER_TEXT) contentSetter: MonadSetter<string | null>):
      Iterable<MonadValue<any>> {
    return ImmutableSet.of([contentSetter.set(newContent)]);
  }
}
