/**
 * @webcomponent gs-code-input
 * Input component for codes.
 *
 * To use this, watch for changes to the bundle-id attribute. Whenever it changes, you can grab the
 * file and its contents using gs-ui.input.FileService.
 *
 * @attr {string} in-value The initial value of the editor.
 * @attr {string} out-value The output value of the editor.
 * @attr {enum<Language>} language Language for syntax highlighting the code.
 * @attr {boolean} show-gutter True iff the gutter should be shown.
 *
 * @event {null} change Dispatched when the out-value has been updated. Value might stay the same.
 */

import { Interval } from 'external/gs_tools/src/async';
import { BooleanType, EnumType, InstanceofType, NullableType } from 'external/gs_tools/src/check';
import { Colors, HslColor } from 'external/gs_tools/src/color';
import { cache } from 'external/gs_tools/src/data/cache';
import { DisposableFunction } from 'external/gs_tools/src/dispose';
import { on } from 'external/gs_tools/src/event';
import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import {
  Color,
  Disposable,
  Event } from 'external/gs_tools/src/interfaces';
import {
  BooleanParser,
  EnumParser,
  StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  component,
  elementSelector,
  onDom,
  resolveSelectors,
  shadowHostSelector } from 'external/gs_tools/src/persona';
import { Solve, Spec } from 'external/gs_tools/src/solver';
import { Enums } from 'external/gs_tools/src/typescript';

import { ThemeServiceEvents } from '../const/theme-service-events';
import { $ as $base, BaseInput } from '../input/base-input2';
import { DefaultPalettes, ThemeService } from '../theming';

export enum Languages {
  CSS,
  HANDLEBARS,
  HTML,
  JAVASCRIPT,
  TYPESCRIPT,
}

export const $ = resolveSelectors({
  customStyle: {
    el: elementSelector('#customStyle', InstanceofType(HTMLStyleElement)),
  },
  editor: {
    el: elementSelector('#editor', InstanceofType(HTMLDivElement)),
  },
  host: {
    el: shadowHostSelector,
    language: attributeSelector(
        elementSelector('host.el'),
        'language',
        EnumParser(Languages),
        NullableType<Languages | null>(EnumType(Languages))),
    showGutter: attributeSelector(
        elementSelector('host.el'),
        'show-gutter',
        BooleanParser,
        BooleanType,
        true),
  },
});

/**
 * Element to input code.
 */
@component({
  inputs: [
    $.host.showGutter,
    $.host.language,
    $.customStyle.el,
    $.editor.el,
    $base.host.disabled,
    $base.host.dispatch,
    $base.host.inValue,
  ],
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

  protected getInputEl_(): Promise<HTMLDivElement> {
    return Graph.get($.editor.el.getId(), this);
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
  @onDom.event(shadowHostSelector, 'gs-create')
  async onCodeHostCreated_(): Promise<void> {
    const editorEl = await Graph.get($.editor.el.getId(), this);

    const interval = Interval.newInstance(500);
    this.addDisposable(interval);
    this.addDisposable(interval.on('tick', this.onTick_.bind(this, editorEl), this));
    interval.start();
  }

  @onDom.attributeChange($.host.language)
  @onDom.event(shadowHostSelector, 'gs-create')
  async onLanguageAttrChange_(): Promise<void> {
    const [editorEl, newValue] = await Promise.all([
      Graph.get($.editor.el.getId(), this),
      Graph.get($.host.language.getId(), this),
    ]);

    if (newValue !== null) {
      this.getEditor_(editorEl)
          .getSession()
          .setMode(`ace/mode/${Enums.toLowerCaseString(newValue, Languages)}`);
    }
  }

  @onDom.attributeChange($.host.showGutter)
  async onShowGutterAttrChange_(): Promise<void> {
    const [editorEl, newValue] = await Promise.all([
      Graph.get($.editor.el.getId(), this),
      Graph.get($.host.showGutter.getId(), this),
    ]);
    this.getEditor_(editorEl).renderer.setShowGutter(newValue);
  }

  /**
   * Handles when the theme is changed.
   */
  @on((instance: CodeInput) => instance.themeService_, ThemeServiceEvents.THEME_CHANGED)
  @onDom.event(shadowHostSelector, 'gs-create')
  async onThemeChanged_(): Promise<void> {
    const [customStyleEl, editorEl] = await Promise.all([
      Graph.get($.customStyle.el.getId(), this),
      Graph.get($.editor.el.getId(), this),
    ]);
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
    const cssContent = [...mappedEntries].join('');
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
