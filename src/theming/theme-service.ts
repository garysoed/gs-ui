import {Templates} from '../../external/gs_tools/src/webc';
import {Theme} from './theme';
import {Validate} from '../../external/gs_tools/src/valid';


export class ThemeService {
  /**
   * Installs the given theme.
   *
   * @param theme The theme to be installed.
   */
  static install(theme: Theme): void {
    let mainCssTemplate = Templates.getTemplate('src/theming/theme-style');
    Validate.any(mainCssTemplate).to.exist()
        .orThrows('Template for src/theming/theme-style not found')
        .assertValid();

    let replacedTemplate = mainCssTemplate!
        .replace(
            /rgba\(11,11,11/g,
            `rgba(${theme.base.dark.red},${theme.base.dark.green},${theme.base.dark.blue}`)
        .replace(
            /rgba\(22,22,22/g,
            `rgba(${theme.base.normal.red},${theme.base.normal.green},${theme.base.normal.blue}`)
        .replace(
            /rgba\(33,33,33/g,
            `rgba(${theme.base.light.red},${theme.base.light.green},${theme.base.light.blue}`)
        .replace(
            /rgba\(44,44,44/g,
            `rgba(${theme.accent.accent.red},${theme.accent.accent.green},`
                + `${theme.accent.accent.blue}`);
    let headEl = document.querySelector('head');
    headEl.innerHTML += replacedTemplate;
  }
}
