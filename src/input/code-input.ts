import {inject} from 'external/gs_tools/src/inject';
import {Enums} from 'external/gs_tools/src/typescript';
import {Reflect} from 'external/gs_tools/src/util';
import {Validate} from 'external/gs_tools/src/valid';
import {
  bind,
  BooleanParser,
  customElement,
  DomHook,
  EnumParser,
  handle,
  IDomBinder,
  StringParser} from 'external/gs_tools/src/webc';

import {ThemeService} from '../theming/theme-service';

import {BaseInput} from './base-input';


export enum Languages {
  HANDLEBARS,
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
  private readonly boundGsValueHook_: DomHook<string>;

  @bind(null).attribute('gs-show-gutter', BooleanParser)
  private readonly gsShowGutterHook_: DomHook<boolean>;

  @bind('#editor').attribute('disabled', BooleanParser)
  private readonly boundInputDisabledHook_: DomHook<boolean>;

  private readonly editorValueHook_: DomHook<string>;

  private readonly ace_: AceAjax.Ace;
  private readonly document_: Document;
  private readonly editorValueBinder_: EditorValueBinder;
  private editor_: AceAjax.Editor | null;

  constructor(
      @inject('theming.ThemeService') themeService: ThemeService,
      @inject('x.ace') ace: AceAjax.Ace,
      @inject('x.dom.document') document: Document) {
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
    this.editorValueBinder_ = new EditorValueBinder();
    this.editorValueHook_ = this.inputValueHook_;
    this.gsShowGutterHook_ = DomHook.of<boolean>();
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
  @handle(null).attributeChange('gs-value', StringParser)
  protected onGsValueChange_(newValue: string | null): void {
    super.onGsValueChange_(newValue || '');
  };

  @handle(null).attributeChange('gs-language', EnumParser(Languages))
  protected onGsLanguageAttrChange_(newValue: Languages | null): void {
    if (this.editor_ !== null && newValue !== null) {
      this.editor_.getSession().setMode(`ace/mode/${Enums.toLowerCaseString(newValue, Languages)}`);
    }
  }

  @handle(null).attributeChange('gs-show-gutter', BooleanParser)
  protected onGsShowGutterAttrChange_(newValue: boolean | null): void {
    if (this.editor_ !== null) {
      this.editor_.renderer.setShowGutter(newValue === null ? true : newValue);
    }
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
   * @override
   */
  onCreated(element: HTMLElement): void {
    if (this.gsShowGutterHook_.get() === null) {
      this.gsShowGutterHook_.set(true);
    }
    this.editor_ = this.ace_.edit(<HTMLElement> element.shadowRoot.querySelector('#editor'));
    this.editorValueBinder_.setEditor(this.editor_);

    super.onCreated(element);

    this.editor_.setHighlightActiveLine(true);

    this.editor_.setReadOnly(false);
    this.editor_.setFontSize('14px');

    let aceCss = this.document_.getElementById('ace_editor.css');
    if (aceCss === null) {
      throw Validate.fail('#ace_editor.css not found');
    }
    let styleEl = element.ownerDocument.createElement('style');
    styleEl.innerHTML = aceCss.innerHTML;
    element.shadowRoot.appendChild(styleEl);
  };
}
