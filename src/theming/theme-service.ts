import {IColor} from 'external/gs_tools/src/color';
import {bind, inject} from 'external/gs_tools/src/inject';
import {Maps} from 'external/gs_tools/src/collection';
import {Templates} from 'external/gs_tools/src/webc';
import {Validate} from 'external/gs_tools/src/valid';

import {Theme} from './theme';


@bind('theming.ThemeService')
export class ThemeService {
  private readonly document_: Document;
  private readonly parser_: DOMParser;
  private readonly templates_: Templates;
  private initialized_: boolean = false;

  constructor(
      @inject('x.gs_tools.templates') templates: Templates,
      @inject('x.dom.document') document: Document = window.document) {
    this.document_ = document;
    this.parser_ = new DOMParser();
    this.templates_ = templates;
  }

  applyTheme(root: Element): void {
    let cssTemplate = this.templates_.getTemplate('src/theming/common');
    Validate.any(cssTemplate).to.exist()
        .orThrows(`Template for src/theming/common not found`)
        .assertValid();
    let styleEl = this.parser_.parseFromString(cssTemplate!, 'text/html');
    root.appendChild(styleEl.querySelector('style'));
  }

  /**
   * Initializes the app.
   */
  initialize(): void {
    if (this.initialized_) {
      return;
    }

    let globalCssTemplate = this.templates_.getTemplate('src/theming/global');
    Validate.any(globalCssTemplate).to.exist()
        .orThrows(`Template for src/theming/global not found`)
        .assertValid();

    let styleEl = this.parser_.parseFromString(globalCssTemplate!, 'text/html');
    let headEl = this.document_.querySelector('head');
    headEl.appendChild(styleEl.querySelector('style'));
    this.initialized_ = true;
  }

  /**
   * Installs the given theme.
   *
   * @param theme The theme to be installed.
   */
  install(theme: Theme): void {
    let themeStyleEl = this.document_.querySelector('style#gs-theme');
    if (!themeStyleEl) {
      themeStyleEl = this.document_.createElement('style');
      themeStyleEl.id = 'gs-theme';
      let headEl = this.document_.querySelector('head');
      headEl.appendChild(themeStyleEl);
    }

    const vars = Maps
        .fromRecord({
          'gsRgbBaseDark': theme.base.dark,
          'gsRgbBaseNormal': theme.base.normal,
          'gsRgbBaseLight': theme.base.light,
          'gsRgbAccent': theme.accent.accent,
        })
        .entries()
        .map(([name, color]: [string, IColor]) => {
          return `--${name}:${color.getRed()},${color.getGreen()},${color.getBlue()};`;
        })
        .asArray()
        .join('');

    themeStyleEl.innerHTML = `body{${vars}}`;
  }
}
