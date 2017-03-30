import { Maps } from 'external/gs_tools/src/collection';
import { Color } from 'external/gs_tools/src/color';
import { bind, inject } from 'external/gs_tools/src/inject';
import { Validate } from 'external/gs_tools/src/valid';
import { Templates } from 'external/gs_tools/src/webc';

import { Theme } from './theme';


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

  /**
   * Applies the theme to the given element.
   *
   * @param root The root element to add the element to. If document, this method will append the
   *    style tag to the header element.
   */
  applyTheme(root: Element | Document): void {
    const targetEl: Element = root instanceof Document ? root.head : root;
    const cssTemplate = this.templates_.getTemplate('src/theming/common');
    Validate.any(cssTemplate).to.exist()
        .orThrows(`Template for src/theming/common not found`)
        .assertValid();
    const cssTemplateEl = this.parser_.parseFromString(cssTemplate!, 'text/html');
    targetEl.appendChild(cssTemplateEl.querySelector('style'));
  }

  /**
   * Initializes the app.
   */
  initialize(): void {
    if (this.initialized_) {
      return;
    }

    const globalCssTemplate = this.templates_.getTemplate('src/theming/global');
    Validate
        .any(globalCssTemplate).to.exist()
        .orThrows(`Template for src/theming/global not found`)
        .assertValid();

    const styleEl = this.parser_.parseFromString(globalCssTemplate!, 'text/html');
    const headEl = this.document_.querySelector('head');
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
      const headEl = this.document_.querySelector('head');
      headEl.appendChild(themeStyleEl);
    }

    const vars = Maps
        .fromRecord({
          'gsThemeAccent': theme.getAccent(),
          'gsThemeActionNormal': theme.getAction(),
          'gsThemeActionNormalDark': theme.getActionDark(false),
          'gsThemeActionNormalDarkest': theme.getActionDarkest(false),
          'gsThemeActionNormalLight': theme.getActionLight(false),
          'gsThemeActionNormalLightest': theme.getActionLightest(false),
          'gsThemeActionReversed': theme.getAction(),
          'gsThemeActionReversedDark': theme.getActionDark(true),
          'gsThemeActionReversedDarkest': theme.getActionDarkest(true),
          'gsThemeActionReversedLight': theme.getActionLight(true),
          'gsThemeActionReversedLightest': theme.getActionLightest(true),
          'gsThemeBaseNormal': theme.getBase(),
          'gsThemeBaseNormalDark': theme.getBaseDark(false),
          'gsThemeBaseNormalDarkest': theme.getBaseDarkest(false),
          'gsThemeBaseNormalLight': theme.getBaseLight(false),
          'gsThemeBaseNormalLightest': theme.getBaseLightest(false),
          'gsThemeBaseReversed': theme.getBase(),
          'gsThemeBaseReversedDark': theme.getBaseDark(true),
          'gsThemeBaseReversedDarkest': theme.getBaseDarkest(true),
          'gsThemeBaseReversedLight': theme.getBaseLight(true),
          'gsThemeBaseReversedLightest': theme.getBaseLightest(true),
          'gsThemeBlackFade': theme.getBlackFade(),
          'gsThemeBlackOnAccent': theme.getBlackOnAccent(),
          'gsThemeWhiteFade': theme.getWhiteFade(),
        })
        .entries()
        .map(([name, color]: [string, Color]) => {
          return `--${name}:rgb(${color.getRed()},${color.getGreen()},${color.getBlue()});`;
        })
        .asArray()
        .join('');

    themeStyleEl.innerHTML = `body{${vars}}`;
  }
}
