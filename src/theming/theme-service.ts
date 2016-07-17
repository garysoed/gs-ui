import {IColor} from '../../external/gs_tools/src/color';
import {Bind, Inject} from '../../external/gs_tools/src/inject';
import {Maps} from '../../external/gs_tools/src/collection';
import {Templates} from '../../external/gs_tools/src/webc';
import {Theme} from './theme';
import {Validate} from '../../external/gs_tools/src/valid';


@Bind('theming.ThemeService')
export class ThemeService {
  private initialized_: boolean = false;

  constructor(
      @Inject('x.gs_tools.templates') private templates_: Templates,
      @Inject('x.dom.document') private document_: Document = window.document) { }

  /**
   * Initializes the app.
   */
  initialize(): void {
    if (this.initialized_) {
      return;
    }

    let mainCssTemplate = this.templates_.getTemplate('src/theming/theme');
    Validate.any(mainCssTemplate).to.exist()
        .orThrows(`Template for src/theming/theme not found`)
        .assertValid();

    let headEl = this.document_.querySelector('head');
    headEl.innerHTML += mainCssTemplate;
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
          return `--${name}:${color.red},${color.green},${color.blue};`;
        })
        .asArray()
        .join('');

    themeStyleEl.innerHTML = `body{${vars}}`;
  }
}
