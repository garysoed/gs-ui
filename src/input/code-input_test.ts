import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Interval } from 'external/gs_tools/src/async';
import { Colors, HslColor, RgbColor } from 'external/gs_tools/src/color';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { Solve, Spec } from 'external/gs_tools/src/solver';
import { TestDispose } from 'external/gs_tools/src/testing';
import { Reflect } from 'external/gs_tools/src/util';

import { ThemeServiceEvents } from '../const/theme-service-events';
import { DefaultPalettes } from '../theming/default-palettes';
import { CodeInput, EditorValueBinder, Languages } from './code-input';


describe('input.EditorValueBinder', () => {
  let binder: EditorValueBinder;

  beforeEach(() => {
    binder = new EditorValueBinder();
  });

  describe('delete', () => {
    it('should set the value to empty string', () => {
      spyOn(binder, 'set');
      binder.delete();
      assert(binder.set).to.haveBeenCalledWith('');
    });
  });

  describe('get', () => {
    it('should return the value of the editor', () => {
      const value = 'value';
      const mockEditor = jasmine.createSpyObj('Editor', ['getValue']);
      mockEditor.getValue.and.returnValue(value);

      binder['editor_'] = mockEditor;

      assert(binder.get()).to.equal(value);
    });

    it('should return null if the editor is not set', () => {
      assert(binder.get()).to.beNull();
    });
  });

  describe('set', () => {
    it('should set the editor value correctly', () => {
      const position = 123;
      const mockEditor = jasmine.createSpyObj('Editor', ['getCursorPositionScreen', 'setValue']);
      mockEditor.getCursorPositionScreen.and.returnValue(position);
      binder['editor_'] = mockEditor;

      const value = 'value';
      binder.set(value);

      assert(mockEditor.setValue).to.haveBeenCalledWith(value, position);
    });

    it('should not throw error if the editor is not set', () => {
      assert(() => {
        binder.set('value');
      }).toNot.throw();
    });
  });
});

describe('input.CodeInput', () => {
  let mockAce: any;
  let mockDocument: any;
  let mockThemeService: any;
  let mockWindow: any;
  let input: CodeInput;

  beforeEach(() => {
    mockThemeService = jasmine.createSpyObj(
        'ThemeService',
        ['applyTheme', 'getTheme', 'isHighlightMode', 'isReversedMode', 'on']);
    mockAce = jasmine.createSpyObj('Ace', ['edit']);
    mockDocument = jasmine.createSpyObj('Document', ['getElementById']);
    mockWindow = jasmine.createSpyObj('Window', ['getComputedStyle']);
    input = new CodeInput(mockThemeService, mockAce, mockDocument, mockWindow);
    TestDispose.add(input);
  });

  describe('[Reflect.__initialize]', () => {
    it('should open the editor value bridge', () => {
      spyOn(input['editorValueHook_'], 'open');

      input[Reflect.__initialize](input);

      assert(input['editorValueHook_'].open).to.haveBeenCalledWith(input['editorValueBinder_']);
    });
  });

  describe('disposeInternal', () => {
    it('should destroy the editor if there is one', () => {
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      input['editor_'] = mockEditor;

      input.disposeInternal();

      assert(mockEditor.destroy).to.haveBeenCalledWith();
    });

    it('should not throw error if there are no editors', () => {
      assert(() => {
        input.disposeInternal();
      }).toNot.throw();
    });
  });

  describe('getColorShade_', () => {
    it('should return the correct shade', () => {
      const backgroundColor = Mocks.object('backgroundColor');

      const hue = 78;
      const saturation = .9;
      const mockHueColor = jasmine.createSpyObj('HueColor', ['getHue', 'getSaturation']);
      mockHueColor.getHue.and.returnValue(hue);
      mockHueColor.getSaturation.and.returnValue(saturation);
      const idealContrast = 12;

      const distance = 0.34;
      const solveSpy = spyOn(Solve, 'findThreshold').and.returnValue(distance);

      const testValue = 0.56;
      const testForeground = Mocks.object('testForeground');
      const shade = Mocks.object('shade');
      Fakes.build(spyOn(HslColor, 'newInstance'))
          .when(Matchers.anyThing(), Matchers.anyThing(), distance).return(shade)
          .when(Matchers.anyThing(), Matchers.anyThing(), testValue).return(testForeground);

      assert(input['getColorShade_'](backgroundColor, mockHueColor, idealContrast, false))
          .to.equal(shade);
      assert(HslColor.newInstance).to.haveBeenCalledWith(hue, saturation, distance);
      assert(Solve.findThreshold).to
          .haveBeenCalledWith(Matchers.any(Spec), Matchers.any(Function) as any, true);

      const spec = solveSpy.calls.argsFor(0)[0];
      assert(spec.getStart()).to.equal(0);
      assert(spec.getDelta()).to.equal(0.05);
      assert(spec.getEnd()).to.equal(1);

      spyOn(input, 'isHighContrast_').and.returnValue(true);
      assert(solveSpy.calls.argsFor(0)[1](testValue) as boolean).to.beTrue();
      assert(input['isHighContrast_']).to
          .haveBeenCalledWith(testForeground, backgroundColor, idealContrast);
      assert(HslColor.newInstance).to.haveBeenCalledWith(hue, saturation, testValue);
    });

    it('should return the correct shade for reverseMode', () => {
      const backgroundColor = Mocks.object('backgroundColor');

      const hue = 78;
      const saturation = .9;
      const mockHueColor = jasmine.createSpyObj('HueColor', ['getHue', 'getSaturation']);
      mockHueColor.getHue.and.returnValue(hue);
      mockHueColor.getSaturation.and.returnValue(saturation);
      const idealContrast = 12;

      const distance = 0.34;
      spyOn(Solve, 'findThreshold').and.returnValue(distance);

      const testValue = 0.56;
      const testForeground = Mocks.object('testForeground');
      const shade = Mocks.object('shade');
      Fakes.build(spyOn(HslColor, 'newInstance'))
          .when(Matchers.anyThing(), Matchers.anyThing(), distance).return(shade)
          .when(Matchers.anyThing(), Matchers.anyThing(), testValue).return(testForeground);

      assert(input['getColorShade_'](backgroundColor, mockHueColor, idealContrast, true))
          .to.equal(shade);
      assert(HslColor.newInstance).to.haveBeenCalledWith(hue, saturation, distance);
      assert(Solve.findThreshold).to
          .haveBeenCalledWith(Matchers.any(Spec), Matchers.any(Function) as any, false);
    });

    it('should throw error if the shade cannot be computed', () => {
      const backgroundColor = Mocks.object('backgroundColor');
      const mockHueColor = jasmine.createSpyObj('HueColor', ['getHue', 'getSaturation']);
      mockHueColor.getHue.and.returnValue(78);
      mockHueColor.getSaturation.and.returnValue(.9);

      spyOn(Solve, 'findThreshold').and.returnValue(null);

      assert(() => {
        input['getColorShade_'](backgroundColor, mockHueColor, 12, false);
      }).to.throwError(/shade cannot be computed/);
    });
  });

  describe('isHighContrast_', () => {
    it('should return true if the contrast is high enough', () => {
      const foreground = Mocks.object('foreground');
      const background = Mocks.object('background');
      spyOn(Colors, 'getContrast').and.returnValue(34);
      assert(input['isHighContrast_'](foreground, background, 12)).to.beTrue();
      assert(Colors.getContrast).to.haveBeenCalledWith(foreground, background);
    });

    it('should return false if the contrast is too low', () => {
      const foreground = Mocks.object('foreground');
      const background = Mocks.object('background');
      spyOn(Colors, 'getContrast').and.returnValue(3.4);
      assert(input['isHighContrast_'](foreground, background, 12)).to.beFalse();
      assert(Colors.getContrast).to.haveBeenCalledWith(foreground, background);
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      const mockSession = jasmine.createSpyObj('Session', ['setTabSize', 'setUseSoftTabs']);
      const mockEditor = jasmine.createSpyObj(
          'Editor',
          [
            'destroy',
            'setFontSize',
            'setHighlightActiveLine',
            'setReadOnly',
          ]);
      mockEditor.session = mockSession;
      mockAce.edit.and.returnValue(mockEditor);

      const styleEl = Mocks.object('styleEl');
      const mockOwnerDocument = jasmine.createSpyObj('OwnerDocument', ['createElement']);
      mockOwnerDocument.createElement.and.returnValue(styleEl);

      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['appendChild', 'querySelector']);
      const element = Mocks.object('element');
      element.ownerDocument = mockOwnerDocument;
      element.shadowRoot = mockShadowRoot;

      const aceInnerHtml = 'aceInnerHtml';
      mockDocument.getElementById.and.returnValue({innerHTML: aceInnerHtml});

      spyOn(input['gsShowGutterHook_'], 'get').and.returnValue(null);
      spyOn(input['gsShowGutterHook_'], 'set');

      spyOn(input['editorValueBinder_'], 'setEditor');

      const mockInterval = jasmine.createSpyObj('Interval', ['dispose', 'start']);
      spyOn(Interval, 'newInstance').and.returnValue(mockInterval);

      spyOn(input, 'addDisposable').and.callThrough();

      spyOn(input, 'onThemeChanged_');
      spyOn(input, 'listenTo');

      input.onCreated(element);

      assert(input['onThemeChanged_']).to.haveBeenCalledWith();
      assert(input.listenTo).to.haveBeenCalledWith(
          mockThemeService, ThemeServiceEvents.THEME_CHANGED, input['onThemeChanged_']);
      assert(mockShadowRoot.appendChild).to.haveBeenCalledWith(styleEl);
      assert(styleEl.innerHTML).to.equal(aceInnerHtml);
      assert(mockOwnerDocument.createElement).to.haveBeenCalledWith('style');
      assert(mockDocument.getElementById).to.haveBeenCalledWith('ace_editor.css');
      assert(input['editorValueBinder_'].setEditor).to.haveBeenCalledWith(mockEditor);
      assert(mockShadowRoot.querySelector).to.haveBeenCalledWith('#editor');
      assert(input['gsShowGutterHook_'].set).to.haveBeenCalledWith(true);
      assert(input.listenTo).to.haveBeenCalledWith(
          mockInterval, Interval.TICK_EVENT, input['onTick_']);
      assert(mockInterval.start).to.haveBeenCalledWith();
      assert(input.addDisposable).to.haveBeenCalledWith(mockInterval);
    });

    it('should throw error if the ace editor CSS style cannot be found', () => {
      const mockSession = jasmine.createSpyObj('Session', ['setTabSize', 'setUseSoftTabs']);
      const mockEditor = jasmine.createSpyObj(
          'Editor',
          [
            'destroy',
            'setFontSize',
            'setHighlightActiveLine',
            'setReadOnly',
          ]);
      mockEditor.session = mockSession;
      mockAce.edit.and.returnValue(mockEditor);

      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['appendChild', 'querySelector']);
      const element = Mocks.object('element');
      element.shadowRoot = mockShadowRoot;

      mockDocument.getElementById.and.returnValue(null);

      spyOn(input['gsShowGutterHook_'], 'get').and.returnValue(true);

      spyOn(input['editorValueBinder_'], 'setEditor');

      assert(() => {
        input.onCreated(element);
      }).to.throwError(/css not found/);
    });

    it('should not override the show gutter attribute value if it is non null', () => {
      const mockEditor = jasmine.createSpyObj(
          'Editor',
          [
            'destroy',
            'setFontSize',
            'setHighlightActiveLine',
            'setReadOnly',
          ]);
      const mockSession = jasmine.createSpyObj('Session', ['setTabSize', 'setUseSoftTabs']);
      mockEditor.session = mockSession;
      mockAce.edit.and.returnValue(mockEditor);

      const styleEl = Mocks.object('styleEl');
      const mockOwnerDocument = jasmine.createSpyObj('OwnerDocument', ['createElement']);
      mockOwnerDocument.createElement.and.returnValue(styleEl);

      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['appendChild', 'querySelector']);
      const element = Mocks.object('element');
      element.ownerDocument = mockOwnerDocument;
      element.shadowRoot = mockShadowRoot;

      mockDocument.getElementById.and.returnValue({innerHTML: 'aceInnerHtml'});

      spyOn(input['gsShowGutterHook_'], 'get').and.returnValue(true);
      spyOn(input['gsShowGutterHook_'], 'set');

      spyOn(input['editorValueBinder_'], 'setEditor');
      spyOn(input, 'onThemeChanged_');
      mockThemeService.on.and.returnValue(jasmine.createSpyObj('Deregister', ['dispose']));

      input.onCreated(element);

      assert(input['gsShowGutterHook_'].set).toNot.haveBeenCalled();
    });
  });

  describe('onGsLanguageAttrChange_', () => {
    it('should set the mode correctly', () => {
      const mockSession = jasmine.createSpyObj('Session', ['setMode']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy', 'getSession']);
      mockEditor.getSession.and.returnValue(mockSession);
      input['editor_'] = mockEditor;

      input.onGsLanguageAttrChange_(Languages.JAVASCRIPT);

      assert(mockSession.setMode).to.haveBeenCalledWith('ace/mode/javascript');
    });

    it('should do nothing if there is no editor', () => {
      const mockSession = jasmine.createSpyObj('Session', ['setMode']);

      input.onGsLanguageAttrChange_(Languages.JAVASCRIPT);

      assert(mockSession.setMode).toNot.haveBeenCalled();
    });

    it('should do nothing if the new language is null', () => {
      const mockSession = jasmine.createSpyObj('Session', ['setMode']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy', 'getSession']);
      mockEditor.getSession.and.returnValue(mockSession);
      input['editor_'] = mockEditor;

      input.onGsLanguageAttrChange_(null);

      assert(mockSession.setMode).toNot.haveBeenCalled();
    });
  });

  describe('onGsShowGutterAttrChange_', () => {
    it('should set the show gutter to true if the new value is true', () => {
      const mockRenderer = jasmine.createSpyObj('Renderer', ['setShowGutter']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      mockEditor.renderer = mockRenderer;
      input['editor_'] = mockEditor;
      input.onGsShowGutterAttrChange_(true);
      assert(mockRenderer.setShowGutter).to.haveBeenCalledWith(true);
    });

    it('should set the show gutter to false if the new value is false', () => {
      const mockRenderer = jasmine.createSpyObj('Renderer', ['setShowGutter']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      mockEditor.renderer = mockRenderer;
      input['editor_'] = mockEditor;
      input.onGsShowGutterAttrChange_(false);
      assert(mockRenderer.setShowGutter).to.haveBeenCalledWith(false);
    });

    it('should set the show gutter to true if the new value is null', () => {
      const mockRenderer = jasmine.createSpyObj('Renderer', ['setShowGutter']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      mockEditor.renderer = mockRenderer;
      input['editor_'] = mockEditor;
      input.onGsShowGutterAttrChange_(null);
      assert(mockRenderer.setShowGutter).to.haveBeenCalledWith(true);
    });

    it('should not throw errors there are no editors', () => {
      assert(() => {
        input.onGsShowGutterAttrChange_(true);
      }).toNot.throw();
    });
  });

  describe('onThemeChanged_', () => {
    it('should update the custom style correctly', () => {
      spyOn(input.customStyleInnerHtmlHook_, 'set');

      const baseHue = Mocks.object('baseHue');
      const mockTheme = jasmine.createSpyObj('Theme', ['getBaseHue', 'getContrast']);
      mockTheme.getBaseHue.and.returnValue(baseHue);
      mockThemeService.getTheme.and.returnValue(mockTheme);

      spyOn(DefaultPalettes, 'getClosestIndex').and.returnValue(0);

      spyOn(Colors, 'fromCssColor').and.returnValue(Mocks.object('backgroundColor'));

      const backgroundColorString = 'backgroundColorString';
      mockWindow.getComputedStyle.and.returnValue({backgroundColor: backgroundColorString});

      const editorEl = Mocks.object('editorEl');
      spyOn(input.editorElHook_, 'get').and.returnValue(editorEl);

      mockThemeService.isHighlightMode.and.returnValue(false);
      mockThemeService.isReversedMode.and.returnValue(false);

      spyOn(input, 'getColorShade_').and.returnValue(RgbColor.newInstance(0, 0, 0));

      input['onThemeChanged_']();

      assert(input.customStyleInnerHtmlHook_.set).to
          .haveBeenCalledWith(Matchers.stringMatching(/#editor {.*--gsCodeInputColorCharacter.*}/));
      assert(DefaultPalettes.getClosestIndex).to.haveBeenCalledWith(baseHue);
      assert(Colors.fromCssColor).to.haveBeenCalledWith(backgroundColorString);
      assert(mockWindow.getComputedStyle).to.haveBeenCalledWith(editorEl);
      assert(mockThemeService.isHighlightMode).to.haveBeenCalledWith(editorEl);
      assert(mockThemeService.isReversedMode).to.haveBeenCalledWith(editorEl);
    });

    it('should do nothing if background color cannot be determined', () => {
      spyOn(input.customStyleInnerHtmlHook_, 'set');

      const baseHue = Mocks.object('baseHue');
      const mockTheme = jasmine.createSpyObj('Theme', ['getBaseHue']);
      mockTheme.getBaseHue.and.returnValue(baseHue);
      mockThemeService.getTheme.and.returnValue(mockTheme);

      spyOn(Colors, 'fromCssColor').and.returnValue(null);

      const backgroundColorString = 'backgroundColorString';
      mockWindow.getComputedStyle.and.returnValue({backgroundColor: backgroundColorString});

      const editorEl = Mocks.object('editorEl');
      spyOn(input.editorElHook_, 'get').and.returnValue(editorEl);

      mockThemeService.isHighlightMode.and.returnValue(false);
      mockThemeService.isReversedMode.and.returnValue(false);

      input['onThemeChanged_']();

      assert(input.customStyleInnerHtmlHook_.set).toNot.haveBeenCalled();
    });

    it('should do nothing if highlight mode cannot be determined', () => {
      spyOn(input.customStyleInnerHtmlHook_, 'set');

      const baseHue = Mocks.object('baseHue');
      const mockTheme = jasmine.createSpyObj('Theme', ['getBaseHue']);
      mockTheme.getBaseHue.and.returnValue(baseHue);
      mockThemeService.getTheme.and.returnValue(mockTheme);

      spyOn(Colors, 'fromCssColor').and.returnValue(null);

      const editorEl = Mocks.object('editorEl');
      spyOn(input.editorElHook_, 'get').and.returnValue(editorEl);

      mockThemeService.isHighlightMode.and.returnValue(null);
      mockThemeService.isReversedMode.and.returnValue(false);

      input['onThemeChanged_']();

      assert(input.customStyleInnerHtmlHook_.set).toNot.haveBeenCalled();
    });

    it('should do nothing if reversed mode cannot be determined', () => {
      spyOn(input.customStyleInnerHtmlHook_, 'set');

      const baseHue = Mocks.object('baseHue');
      const mockTheme = jasmine.createSpyObj('Theme', ['getBaseHue']);
      mockTheme.getBaseHue.and.returnValue(baseHue);
      mockThemeService.getTheme.and.returnValue(mockTheme);

      spyOn(Colors, 'fromCssColor').and.returnValue(null);

      const editorEl = Mocks.object('editorEl');
      spyOn(input.editorElHook_, 'get').and.returnValue(editorEl);

      mockThemeService.isReversedMode.and.returnValue(null);

      input['onThemeChanged_']();

      assert(input.customStyleInnerHtmlHook_.set).toNot.haveBeenCalled();
    });

    it('should do nothing if editorEl cannot be found', () => {
      spyOn(input.customStyleInnerHtmlHook_, 'set');

      const mockTheme = jasmine.createSpyObj('Theme', ['getBaseHue']);
      mockThemeService.getTheme.and.returnValue(mockTheme);

      spyOn(Colors, 'fromCssColor').and.returnValue(null);
      spyOn(input.editorElHook_, 'get').and.returnValue(null);

      mockThemeService.isReversedMode.and.returnValue(null);

      input['onThemeChanged_']();

      assert(input.customStyleInnerHtmlHook_.set).toNot.haveBeenCalled();
    });

    it('should do nothing if theme cannot be found', () => {
      spyOn(input.customStyleInnerHtmlHook_, 'set');

      mockThemeService.getTheme.and.returnValue(null);

      spyOn(Colors, 'fromCssColor').and.returnValue(null);
      spyOn(input, 'getElement').and.returnValue(null);

      mockThemeService.isReversedMode.and.returnValue(null);

      input['onThemeChanged_']();

      assert(input.customStyleInnerHtmlHook_.set).toNot.haveBeenCalled();
    });
  });

  describe('onTick_', () => {
    it('should resize the editor if available', () => {
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy', 'resize']);
      input['editor_'] = mockEditor;
      input['onTick_']();
      assert(mockEditor.resize).to.haveBeenCalledWith();
    });

    it('should not throw error if editor is not available', () => {
      assert(() => {
        input['onTick_']();
      }).toNot.throw();
    });
  });
});
