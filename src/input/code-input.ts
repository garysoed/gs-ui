import { Interval } from 'external/gs_tools/src/async';
import { Color, Colors, HslColor } from 'external/gs_tools/src/color';
import { cache } from 'external/gs_tools/src/data/cache';
import { on } from 'external/gs_tools/src/event';
import { ImmutableList, ImmutableMap, Iterables } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { Disposable, ElementSelector, Event, MonadSetter } from 'external/gs_tools/src/interfaces';
import {
  BooleanParser,
  EnumParser,
  StringParser } from 'external/gs_tools/src/parse';
import { Solve, Spec } from 'external/gs_tools/src/solver';
import { Enums } from 'external/gs_tools/src/typescript';
import {
  customElement,
  dom,
  domOut,
  onDom,
  onLifecycle} from 'external/gs_tools/src/webc';

import { DisposableFunction } from 'external/gs_tools/src/dispose';

import { ThemeServiceEvents } from '../const/theme-service-events';
import { BaseInput } from '../input/base-input';
import { DefaultPalettes, ThemeService } from '../theming';

export enum Languages {
  CSS,
  HANDLEBARS,
  HTML,
  JAVASCRIPT,
  TYPESCRIPT,
}

const CUSTOM_STYLE_EL = '#customStyle';
const EDITOR_EL_ID = 'editor';
const EDITOR_EL = `#${EDITOR_EL_ID}`;

const LANGUAGE_ATTRIBUTE = {name: 'language', parser: EnumParser(Languages), selector: null};
const SHOW_GUTTER_ATTRIBUTE = {name: 'show-gutter', parser: BooleanParser, selector: null};

/**
 * Element to input code.
 */
@customElement({
  tag: 'gs-code-input',
  templateKey: 'src/input/code-input',
})
export class CodeInput extends BaseInput<string, HTMLDivElement> {
  private readonly ace_: AceAjax.Ace;
  private readonly document_: Document;
  private readonly window_: Window;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService,
      @inject('x.ace') ace: AceAjax.Ace,
      @inject('x.dom.document') document: Document,
      @inject('x.dom.window') window: Window) {
    super(themeService, StringParser);
    this.ace_ = ace;
    this.document_ = document;
    this.window_ = window;
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

  @cache()
  private getEditor_(containerEl: HTMLElement): AceAjax.Editor {
    const editor = this.ace_.edit(containerEl);

    editor.setHighlightActiveLine(true);
    editor.setReadOnly(false);
    editor.setFontSize('14px');

    editor.session.setTabSize(2);
    editor.session.setUseSoftTabs(true);

    this.addDisposable(DisposableFunction.of(() => {
      editor.destroy();
    }));

    const aceCss = this.document_.getElementById('ace_editor.css');
    if (aceCss === null) {
      throw new Error('#ace_editor.css not found');
    }

    const shadowRoot = containerEl.parentNode;
    if (shadowRoot === null) {
      throw new Error('No shadow roots were found');
    }
    const styleEl = this.document_.createElement('style');
    styleEl.innerHTML = aceCss.innerHTML;
    shadowRoot.appendChild(styleEl);

    return editor;
  }

  protected getInputElSelector_(): ElementSelector {
    return EDITOR_EL;
  }

  protected getInputElValue_(containerEl: HTMLDivElement): string {
    return this.getEditor_(containerEl).getValue();
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

  protected isValueChanged_(oldValue: string | null, newValue: string | null): boolean {
    return oldValue !== newValue;
  }

  protected listenToValueChanges_(
      containerEl: HTMLDivElement,
      callback: (event: Event<any>) => void): Disposable {
    let isListening = true;
    const editor = this.getEditor_(containerEl);
    editor.getSession().on('change', () => {
      if (isListening) {
        callback({type: 'change'});
      }
    });
    return DisposableFunction.of(() => {
      isListening = false;
    });
  }

  /**
   * @override
   */
  @onLifecycle('create')
  onCreated(
      @domOut.attribute(SHOW_GUTTER_ATTRIBUTE) showGutterSetter: MonadSetter<boolean | null>,
      @dom.element(CUSTOM_STYLE_EL) customStyleEl: HTMLStyleElement,
      @dom.element(EDITOR_EL) editorEl: HTMLElement):
      ImmutableList<MonadSetter<any>> {
    const changes: MonadSetter<any>[] = [];
    if (showGutterSetter.value === null) {
      showGutterSetter.value = true;
      changes.push(showGutterSetter);
    }

    const interval = Interval.newInstance(500);
    this.addDisposable(interval);
    this.addDisposable(interval.on('tick', this.onTick_.bind(this, editorEl), this));
    interval.start();

    this.onThemeChanged_(customStyleEl, editorEl);
    return ImmutableList.of(changes);
  }

  @onDom.attributeChange(LANGUAGE_ATTRIBUTE)
  onLanguageAttrChange_(
      @dom.element(EDITOR_EL) editorEl: HTMLDivElement,
      @dom.attribute(LANGUAGE_ATTRIBUTE) newValue: Languages | null): void {
    if (newValue !== null) {
      this.getEditor_(editorEl)
          .getSession()
          .setMode(`ace/mode/${Enums.toLowerCaseString(newValue, Languages)}`);
    }
  }

  @onDom.attributeChange(SHOW_GUTTER_ATTRIBUTE)
  onShowGutterAttrChange_(
      @dom.element(EDITOR_EL) editorEl: HTMLDivElement,
      @dom.attribute(SHOW_GUTTER_ATTRIBUTE) newValue: boolean | null): void {
    this.getEditor_(editorEl).renderer.setShowGutter(newValue === null ? true : newValue);
  }

  /**
   * Handles when the theme is changed.
   */
  @on((instance: CodeInput) => instance.themeService_, ThemeServiceEvents.THEME_CHANGED)
  onThemeChanged_(
      @dom.element(CUSTOM_STYLE_EL) customStyleEl: HTMLStyleElement,
      @dom.element(EDITOR_EL) editorEl: HTMLElement): void {
    const theme = this.themeService_.getTheme();
    if (theme === null) {
      return;
    }

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
    const mappedEntries = ImmutableMap
        .of({
          gsCodeInputColorCharacter: characterColor,
          gsCodeInputColorLanguage: languageColor,
          gsCodeInputColorNumeric: numericColor,
          gsCodeInputColorRegexp: regexpColor,
          gsCodeInputColorString: stringColor,
          gsCodeInputColorVariable: variableColor,
        })
        .entries()
        .mapItem(([name, color]: [string, Color]) => {
          return `--${name}:rgb(${color.getRed()},${color.getGreen()},${color.getBlue()});`;
        });
    const cssContent = Iterables.toArray(mappedEntries).join('');
    customStyleEl.innerHTML = `#editor {${cssContent}}`;
  }

  /**
   * Called when the interval ticks.
   */
  private onTick_(editorEl: HTMLElement): void {
    this.getEditor_(editorEl).resize();
  }

  protected setInputElDisabled_(containerEl: HTMLDivElement, disabled: boolean): void {
    this.getEditor_(containerEl).setReadOnly(disabled);
  }

  protected setInputElValue_(containerEl: HTMLDivElement, newValue: string): void {
    const editor = this.getEditor_(containerEl);
    editor.setValue(newValue, editor.getCursorPositionScreen());
  }
}
