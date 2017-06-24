import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Interval } from 'external/gs_tools/src/async';
import { Colors, HslColor, RgbColor } from 'external/gs_tools/src/color';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { Solve, Spec } from 'external/gs_tools/src/solver';
import { TestDispose } from 'external/gs_tools/src/testing';

import { DisposableFunction } from 'external/gs_tools/src/dispose';
import { DefaultPalettes } from '../theming/default-palettes';
import { CodeInput, Languages } from './code-input';

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
    mockDocument = jasmine.createSpyObj('Document', ['createElement', 'getElementById']);
    mockWindow = jasmine.createSpyObj('Window', ['getComputedStyle']);
    input = new CodeInput(mockThemeService, mockAce, mockDocument, mockWindow);
    TestDispose.add(input);
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

  describe('getEditor', () => {
    it(`should return the correct editor`, () => {
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
      mockDocument.createElement.and.returnValue(styleEl);

      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['appendChild', 'querySelector']);
      const containerEl = Mocks.object('containerEl');
      containerEl.parentNode = mockShadowRoot;

      const aceInnerHtml = 'aceInnerHtml';
      mockDocument.getElementById.and.returnValue({innerHTML: aceInnerHtml});

      const addDisposableSpy = spyOn(input, 'addDisposable').and.callThrough();

      assert(input['getEditor_'](containerEl)).to.equal(mockEditor);
      assert(mockShadowRoot.appendChild).to.haveBeenCalledWith(styleEl);
      assert(styleEl.innerHTML).to.equal(aceInnerHtml);
      assert(mockDocument.createElement).to.haveBeenCalledWith('style');
      assert(mockDocument.getElementById).to.haveBeenCalledWith('ace_editor.css');
      assert(input.addDisposable).to.haveBeenCalledWith(Matchers.any(DisposableFunction));
      addDisposableSpy.calls.argsFor(0)[0].run();
      assert(mockEditor.destroy).to.haveBeenCalledWith();
    });

    it(`should throw error if shadow roots were not found`, () => {
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

      const containerEl = Mocks.object('containerEl');
      containerEl.parentNode = null;

      mockDocument.getElementById.and.returnValue({innerHTML: 'aceInnerHtml'});

      spyOn(input, 'addDisposable').and.callThrough();

      assert(() => {
        input['getEditor_'](containerEl);
      }).to.throwError(/No shadow roots/);
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
      const containerEl = Mocks.object('containerEl');
      containerEl.parentNode = mockShadowRoot;

      mockDocument.getElementById.and.returnValue(null);

      spyOn(input, 'addDisposable').and.callThrough();

      assert(() => {
        input['getEditor_'](containerEl);
      }).to.throwError(/css not found/);

      assert(mockDocument.getElementById).to.haveBeenCalledWith('ace_editor.css');
    });
  });

  describe('getInputElValue_', () => {
    it(`should return the correct value`, () => {
      const containerEl = Mocks.object('containerEl');
      const value = 'value';
      const mockEditor = jasmine.createSpyObj('Editor', ['getValue']);
      mockEditor.getValue.and.returnValue(value);
      spyOn(input, 'getEditor_').and.returnValue(mockEditor);

      assert(input['getInputElValue_'](containerEl)).to.equal(value);
      assert(input['getEditor_']).to.haveBeenCalledWith(containerEl);
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

  describe('isValueChanged_', () => {
    it(`should return true if the value has changed`, () => {
      assert(input['isValueChanged_']('a', 'b')).to.beTrue();
    });

    it(`should return false if the value has not changed`, () => {
      assert(input['isValueChanged_']('a', 'a')).to.beFalse();
    });
  });

  describe('listenToValueChange', () => {
    it(`should listen to the editor correctly`, () => {
      const containerEl = Mocks.object('containerEl');
      const mockCallback = jasmine.createSpy('Callback');
      const mockSession = jasmine.createSpyObj('Session', ['on']);
      const mockEditor = jasmine.createSpyObj('Editor', ['getSession']);
      mockEditor.getSession.and.returnValue(mockSession);
      spyOn(input, 'getEditor_').and.returnValue(mockEditor);

      const disposable = input['listenToValueChanges_'](containerEl, mockCallback);
      assert(mockSession.on).to.haveBeenCalledWith('change', Matchers.any(Function));
      const changeCallback = mockSession.on.calls.argsFor(0)[1];
      changeCallback();
      assert(mockCallback).to.haveBeenCalledWith({type: 'change'});

      mockCallback.calls.reset();
      disposable.dispose();
      changeCallback();
      assert(mockCallback).toNot.haveBeenCalled();

      assert(input['getEditor_']).to.haveBeenCalledWith(containerEl);
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      const showGutterId = 'showGutterId';
      const customStyleEl = Mocks.object('customStyleEl');
      const editorEl = Mocks.object('editorEl');

      const mockInterval = jasmine.createSpyObj('Interval', ['dispose', 'on', 'start']);
      mockInterval.on.and.returnValue(jasmine.createSpyObj('DisposableFn', ['dispose']));
      spyOn(Interval, 'newInstance').and.returnValue(mockInterval);

      spyOn(input, 'addDisposable').and.callThrough();
      spyOn(input, 'onThemeChanged_');
      spyOn(input, 'onTick_');

      assert(input.onCreated({id: showGutterId, value: null}, customStyleEl, editorEl))
          .to.haveElements([[showGutterId, true]]);

      assert(input.onThemeChanged_).to.haveBeenCalledWith(customStyleEl, editorEl);
      assert(mockInterval.on).to.haveBeenCalledWith('tick', Matchers.any(Function), input);
      mockInterval.on.calls.argsFor(0)[1]();
      assert(input['onTick_']).to.haveBeenCalledWith(editorEl);
      assert(mockInterval.start).to.haveBeenCalledWith();
      assert(input.addDisposable).to.haveBeenCalledWith(mockInterval);
    });

    it(`should not override the show-gutter value if specified`, () => {
      const showGutterId = 'showGutterId';
      const customStyleEl = Mocks.object('customStyleEl');
      const editorEl = Mocks.object('editorEl');

      const mockInterval = jasmine.createSpyObj('Interval', ['dispose', 'on', 'start']);
      mockInterval.on.and.returnValue(jasmine.createSpyObj('DisposableFn', ['dispose']));
      spyOn(Interval, 'newInstance').and.returnValue(mockInterval);

      spyOn(input, 'onThemeChanged_');
      spyOn(input, 'onTick_');

      assert(input.onCreated({id: showGutterId, value: true}, customStyleEl, editorEl))
          .to.haveElements([]);
    });
  });

  describe('onLanguageAttrChange_', () => {
    it('should set the mode correctly', () => {
      const editorEl = Mocks.object('editorEl');
      const mockSession = jasmine.createSpyObj('Session', ['setMode']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy', 'getSession']);
      mockEditor.getSession.and.returnValue(mockSession);
      spyOn(input, 'getEditor_').and.returnValue(mockEditor);

      input.onLanguageAttrChange_(editorEl, Languages.JAVASCRIPT);

      assert(mockSession.setMode).to.haveBeenCalledWith('ace/mode/javascript');
      assert(input['getEditor_']).to.haveBeenCalledWith(editorEl);
    });

    it('should do nothing if the new language is null', () => {
      const editorEl = Mocks.object('editorEl');
      const mockSession = jasmine.createSpyObj('Session', ['setMode']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy', 'getSession']);
      mockEditor.getSession.and.returnValue(mockSession);
      spyOn(input, 'getEditor_').and.returnValue(mockEditor);

      input.onLanguageAttrChange_(editorEl, null);

      assert(mockSession.setMode).toNot.haveBeenCalled();
    });
  });

  describe('onShowGutterAttrChange_', () => {
    it('should set the show gutter to true if the new value is true', () => {
      const editorEl = Mocks.object('editorEl');
      const mockRenderer = jasmine.createSpyObj('Renderer', ['setShowGutter']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      mockEditor.renderer = mockRenderer;
      spyOn(input, 'getEditor_').and.returnValue(mockEditor);
      input.onShowGutterAttrChange_(editorEl, true);
      assert(mockRenderer.setShowGutter).to.haveBeenCalledWith(true);
      assert(input['getEditor_']).to.haveBeenCalledWith(editorEl);
    });

    it('should set the show gutter to false if the new value is false', () => {
      const editorEl = Mocks.object('editorEl');
      const mockRenderer = jasmine.createSpyObj('Renderer', ['setShowGutter']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      mockEditor.renderer = mockRenderer;
      spyOn(input, 'getEditor_').and.returnValue(mockEditor);
      input.onShowGutterAttrChange_(editorEl, false);
      assert(mockRenderer.setShowGutter).to.haveBeenCalledWith(false);
      assert(input['getEditor_']).to.haveBeenCalledWith(editorEl);
    });

    it('should set the show gutter to true if the new value is null', () => {
      const editorEl = Mocks.object('editorEl');
      const mockRenderer = jasmine.createSpyObj('Renderer', ['setShowGutter']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      mockEditor.renderer = mockRenderer;
      spyOn(input, 'getEditor_').and.returnValue(mockEditor);
      input.onShowGutterAttrChange_(editorEl, null);
      assert(mockRenderer.setShowGutter).to.haveBeenCalledWith(true);
      assert(input['getEditor_']).to.haveBeenCalledWith(editorEl);
    });
  });

  describe('onThemeChanged_', () => {
    it('should update the custom style correctly', () => {
      const customStyleEl = Mocks.object('customStyleEl');

      const baseHue = Mocks.object('baseHue');
      const mockTheme = jasmine.createSpyObj('Theme', ['getBaseHue', 'getContrast']);
      mockTheme.getBaseHue.and.returnValue(baseHue);
      mockThemeService.getTheme.and.returnValue(mockTheme);

      spyOn(DefaultPalettes, 'getClosestIndex').and.returnValue(0);

      spyOn(Colors, 'fromCssColor').and.returnValue(Mocks.object('backgroundColor'));

      const backgroundColorString = 'backgroundColorString';
      mockWindow.getComputedStyle.and.returnValue({backgroundColor: backgroundColorString});

      const editorEl = Mocks.object('editorEl');

      mockThemeService.isHighlightMode.and.returnValue(false);
      mockThemeService.isReversedMode.and.returnValue(false);

      spyOn(input, 'getColorShade_').and.returnValue(RgbColor.newInstance(0, 0, 0));

      input.onThemeChanged_(customStyleEl, editorEl);

      assert(customStyleEl.innerHTML).to
          .equal(Matchers.stringMatching(/#editor {.*--gsCodeInputColorCharacter.*}/));
      assert(DefaultPalettes.getClosestIndex).to.haveBeenCalledWith(baseHue);
      assert(Colors.fromCssColor).to.haveBeenCalledWith(backgroundColorString);
      assert(mockWindow.getComputedStyle).to.haveBeenCalledWith(editorEl);
      assert(mockThemeService.isHighlightMode).to.haveBeenCalledWith(editorEl);
      assert(mockThemeService.isReversedMode).to.haveBeenCalledWith(editorEl);
    });

    it('should do nothing if background color cannot be determined', () => {
      const customStyleEl = Mocks.object('customStyleEl');

      const baseHue = Mocks.object('baseHue');
      const mockTheme = jasmine.createSpyObj('Theme', ['getBaseHue']);
      mockTheme.getBaseHue.and.returnValue(baseHue);
      mockThemeService.getTheme.and.returnValue(mockTheme);

      spyOn(Colors, 'fromCssColor').and.returnValue(null);

      const backgroundColorString = 'backgroundColorString';
      mockWindow.getComputedStyle.and.returnValue({backgroundColor: backgroundColorString});

      const editorEl = Mocks.object('editorEl');

      mockThemeService.isHighlightMode.and.returnValue(false);
      mockThemeService.isReversedMode.and.returnValue(false);

      input.onThemeChanged_(customStyleEl, editorEl);

      assert(customStyleEl.innerHTML).toNot.beDefined();
    });

    it('should do nothing if highlight mode cannot be determined', () => {
      const customStyleEl = Mocks.object('customStyleEl');

      const baseHue = Mocks.object('baseHue');
      const mockTheme = jasmine.createSpyObj('Theme', ['getBaseHue']);
      mockTheme.getBaseHue.and.returnValue(baseHue);
      mockThemeService.getTheme.and.returnValue(mockTheme);

      spyOn(Colors, 'fromCssColor').and.returnValue(null);

      const editorEl = Mocks.object('editorEl');

      mockThemeService.isHighlightMode.and.returnValue(null);
      mockThemeService.isReversedMode.and.returnValue(false);

      input.onThemeChanged_(customStyleEl, editorEl);

      assert(customStyleEl.innerHTML).toNot.beDefined();
    });

    it('should do nothing if reversed mode cannot be determined', () => {
      const customStyleEl = Mocks.object('customStyleEl');

      const baseHue = Mocks.object('baseHue');
      const mockTheme = jasmine.createSpyObj('Theme', ['getBaseHue']);
      mockTheme.getBaseHue.and.returnValue(baseHue);
      mockThemeService.getTheme.and.returnValue(mockTheme);

      spyOn(Colors, 'fromCssColor').and.returnValue(null);

      const editorEl = Mocks.object('editorEl');

      mockThemeService.isReversedMode.and.returnValue(null);

      input.onThemeChanged_(customStyleEl, editorEl);

      assert(customStyleEl.innerHTML).toNot.beDefined();
    });

    it('should do nothing if theme cannot be found', () => {
      const customStyleEl = Mocks.object('customStyleEl');
      const editorEl = Mocks.object('editorEl');

      mockThemeService.getTheme.and.returnValue(null);

      spyOn(Colors, 'fromCssColor').and.returnValue(null);

      mockThemeService.isReversedMode.and.returnValue(null);

      input.onThemeChanged_(customStyleEl, editorEl);

      assert(customStyleEl.innerHTML).toNot.beDefined();
    });
  });

  describe('onTick_', () => {
    it('should resize the editor if available', () => {
      const editorEl = Mocks.object('editorEl');
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy', 'resize']);
      spyOn(input, 'getEditor_').and.returnValue(mockEditor);
      input['onTick_'](editorEl);
      assert(mockEditor.resize).to.haveBeenCalledWith();
      assert(input['getEditor_']).to.haveBeenCalledWith(editorEl);
    });
  });
});
