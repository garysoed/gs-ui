import { Interval } from 'external/gs_tools/src/async';
import { Maps } from 'external/gs_tools/src/collection';
import { Color, Colors, HslColor } from 'external/gs_tools/src/color';
import { inject } from 'external/gs_tools/src/inject';
import {
  BooleanParser,
  EnumParser,
  StringParser } from 'external/gs_tools/src/parse';
import { Solve, Spec } from 'external/gs_tools/src/solver';
import { Enums } from 'external/gs_tools/src/typescript';
import { Reflect } from 'external/gs_tools/src/util';
import { Validate } from 'external/gs_tools/src/valid';
import {
  bind,
  customElement,
  DomHook,
  handle,
  IDomBinder } from 'external/gs_tools/src/webc';

import { ThemeServiceEvents } from '../const/theme-service-events';
import { BaseInput } from '../input/base-input';
import { DefaultPalettes } from '../theming/default-palettes';
import { ThemeService } from '../theming/theme-service';


export enum Languages {
  CSS,
  HANDLEBARS,
  HTML,
  JAVASCRIPT,
  TYPESCRIPT,
}


/**
 * Binder that passes the value to the Ace editor.
 */
export class EditorValueBinder implements IDomBinder<string> {
  private editor_: AceAjax.Editor | null = null;

  /**
   * @override
   */
  delete(): void {
    this.set('');
  }

  /**
   * @override
   */
  get(): string | null {
    if (this.editor_ === null) {
      return null;
    }

    return this.editor_.getValue();
  }

  /**
   * @override
   */
  set(value: string): void {
    if (this.editor_ === null) {
      return;
    }

    this.editor_.setValue(value, this.editor_.getCursorPositionScreen());
  }

  /**
   * @param editor The editor to set.
   */
  setEditor(editor: AceAjax.Editor): void {
    this.editor_ = editor;
  }
}


/**
 * Element to input code.
 */
@customElement({
  tag: 'gs-code-input',
  templateKey: 'src/input/code-input',
})
export class CodeInput extends BaseInput<string> {

  @bind(null).attribute('gs-value', StringParser)
  readonly boundGsValueHook_: DomHook<string>;

  @bind('#customStyle').property('innerHTML')
  readonly customStyleInnerHtmlHook_: DomHook<string>;

  @bind(null).attribute('gs-show-gutter', BooleanParser)
  readonly gsShowGutterHook_: DomHook<boolean>;

  @bind('#editor').attribute('disabled', BooleanParser)
  readonly boundInputDisabledHook_: DomHook<boolean>;

  private readonly editorValueHook_: DomHook<string>;

  private readonly ace_: AceAjax.Ace;
  private readonly document_: Document;
  private readonly editorValueBinder_: EditorValueBinder;
  private readonly window_: Window;
  private editor_: AceAjax.Editor | null;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService,
      @inject('x.ace') ace: AceAjax.Ace,
      @inject('x.dom.document') document: Document,
      @inject('x.dom.window') window: Window) {
    super(
        themeService,
        DomHook.of<string>(),
        DomHook.of<string>(),
        StringParser);
    this.ace_ = ace;
    this.document_ = document;
    this.editor_ = null;
    this.boundGsValueHook_ = this.gsValueHook_;
    this.boundInputDisabledHook_ = this.inputDisabledHook_;
    this.customStyleInnerHtmlHook_ = DomHook.of<string>();
    this.editorValueBinder_ = new EditorValueBinder();
    this.editorValueHook_ = this.inputValueHook_;
    this.gsShowGutterHook_ = DomHook.of<boolean>();
    this.window_ = window;
  }

  /**
   * Handles initialization.
   */
  [Reflect.__initialize](): void {
    this.editorValueHook_.open(this.editorValueBinder_);
  }

  /**
   * @override
   */
  disposeInternal(): void {
    if (this.editor_ !== null) {
      this.editor_.destroy();
    }
    super.disposeInternal();
  }

  /**
   * @param backgroundColor
   * @param hueColor The base color whose lightness should be modified.
   * @param idealContrast Target contrast ratio with the given background color.
   * @param reverseMode True iff the background is dark.
   * @return The shade that just passes the ideal contrast.
   */
  private getColorShade_(
      backgroundColor: Color,
      hueColor: Color,
      idealContrast: number,
      reverseMode: boolean): Color {
    const distance = Solve.findThreshold(
        Spec.newInstance(0, 0.05, 1),
        (value: number) => {
          return this.isHighContrast_(
              HslColor.newInstance(hueColor.getHue(), hueColor.getSaturation(), value),
              backgroundColor,
              idealContrast);
        },
        !reverseMode);
    if (distance === null) {
      throw new Error('Color shade cannot be computed');
    }
    return HslColor.newInstance(hueColor.getHue(), hueColor.getSaturation(), distance);
  }

  /**
   * @param foreground
   * @param background
   * @param idealContrast
   * @return True iff the foreground has a contrast higher than the given contrast on the given
   *    background.
   */
  private isHighContrast_(foreground: Color, background: Color, idealContrast: number): boolean {
    return Colors.getContrast(foreground, background) >= idealContrast;
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    if (this.gsShowGutterHook_.get() === null) {
      this.gsShowGutterHook_.set(true);
    }
    this.editor_ = this.ace_.edit(<HTMLElement> element.shadowRoot.querySelector('#editor'));
    this.editorValueBinder_.setEditor(this.editor_);

    this.editor_.setHighlightActiveLine(true);
    this.editor_.setReadOnly(false);
    this.editor_.setFontSize('14px');

    this.editor_.session.setTabSize(2);
    this.editor_.session.setUseSoftTabs(true);

    const interval = Interval.newInstance(500);
    this.addDisposable(interval);
    this.listenTo(interval, Interval.TICK_EVENT, this.onTick_);
    interval.start();

    const aceCss = this.document_.getElementById('ace_editor.css');
    if (aceCss === null) {
      throw Validate.fail('#ace_editor.css not found');
    }
    const styleEl = element.ownerDocument.createElement('style');
    styleEl.innerHTML = aceCss.innerHTML;
    element.shadowRoot.appendChild(styleEl);

    this.listenTo(this.themeService_, ThemeServiceEvents.THEME_CHANGED, this.onThemeChanged_);
    this.onThemeChanged_();
  }

  /**
   * @override
   */
  @handle(null).attributeChange('gs-value', StringParser)
  onGsValueChange_(newValue: string | null): void {
    super.onGsValueChange_(newValue || '');
  };

  @handle(null).attributeChange('gs-language', EnumParser(Languages))
  onGsLanguageAttrChange_(newValue: Languages | null): void {
    if (this.editor_ !== null && newValue !== null) {
      this.editor_.getSession().setMode(`ace/mode/${Enums.toLowerCaseString(newValue, Languages)}`);
    }
  }

  @handle(null).attributeChange('gs-show-gutter', BooleanParser)
  onGsShowGutterAttrChange_(newValue: boolean | null): void {
    if (this.editor_ !== null) {
      this.editor_.renderer.setShowGutter(newValue === null ? true : newValue);
    }
  }

  /**
   * Handles when the theme is changed.
   */
  private onThemeChanged_(): void {
    const theme = this.themeService_.getTheme();
    if (theme === null) {
      return;
    }

    const listenableElement = this.getElement();
    if (listenableElement === null) {
      return;
    }

    const editorEl = listenableElement.getEventTarget().shadowRoot.querySelector('#editor');
    const reverseMode = this.themeService_.isReversedMode(editorEl);
    if (reverseMode === null) {
      return;
    }

    const highlightMode = this.themeService_.isHighlightMode(editorEl);
    if (highlightMode === null) {
      return;
    }

    const computedStyle = this.window_.getComputedStyle(editorEl);
    const backgroundColor = Colors.fromCssColor(computedStyle.backgroundColor!);
    if (backgroundColor === null) {
      return;
    }

    const closestIndex = DefaultPalettes.getClosestIndex(theme.getBaseHue());
    const index = highlightMode ? -1 * closestIndex : closestIndex;
    const variableColor = this.getColorShade_(
        backgroundColor,
        DefaultPalettes.getAt(index - 4),
        theme.getContrast(),
        reverseMode);
    const stringColor = this.getColorShade_(
        backgroundColor,
        DefaultPalettes.getAt(index + 4),
        theme.getContrast(),
        reverseMode);
    const languageColor = this.getColorShade_(
        backgroundColor,
        DefaultPalettes.getAt(index - 8),
        theme.getContrast(),
        reverseMode);
    const numericColor = this.getColorShade_(
        backgroundColor,
        DefaultPalettes.getAt(index + 8),
        theme.getContrast(),
        reverseMode);
    const characterColor = this.getColorShade_(
        backgroundColor,
        DefaultPalettes.getAt(index - 12),
        theme.getContrast(),
        reverseMode);
    const regexpColor = this.getColorShade_(
        backgroundColor,
        DefaultPalettes.getAt(index + 12),
        theme.getContrast(),
        reverseMode);
    const cssContent = Maps
        .fromRecord({
          gsCodeInputColorCharacter: characterColor,
          gsCodeInputColorLanguage: languageColor,
          gsCodeInputColorNumeric: numericColor,
          gsCodeInputColorRegexp: regexpColor,
          gsCodeInputColorString: stringColor,
          gsCodeInputColorVariable: variableColor,
        })
        .entries()
        .map(([name, color]: [string, Color]) => {
          return `--${name}:rgb(${color.getRed()},${color.getGreen()},${color.getBlue()});`;
        })
        .asArray()
        .join('');
    this.customStyleInnerHtmlHook_.set(`#editor {${cssContent}}`);
  }

  /**
   * Called when the interval ticks.
   */
  private onTick_(): void {
    if (this.editor_ !== null) {
      this.editor_.resize();
    }
  }
}
