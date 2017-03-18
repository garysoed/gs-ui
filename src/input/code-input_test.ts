import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Interval } from 'external/gs_tools/src/async';
import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { Reflect } from 'external/gs_tools/src/util';

import { CodeInput, EditorValueBinder, Languages } from './code-input';


describe('input.EditorValueBinder', () => {
  let binder;

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
  let mockAce;
  let mockDocument;
  let input: CodeInput;

  beforeEach(() => {
    const mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    mockAce = jasmine.createSpyObj('Ace', ['edit']);
    mockDocument = jasmine.createSpyObj('Document', ['getElementById']);
    input = new CodeInput(mockThemeService, mockAce, mockDocument);
    TestDispose.add(input);
  });

  describe('[Reflect.__initialize]', () => {
    it('should open the editor value bridge', () => {
      spyOn(input['editorValueHook_'], 'open');

      input[Reflect.__initialize]();

      assert(input['editorValueHook_'].open).to.haveBeenCalledWith(input['editorValueBinder_']);
    });
  });

  describe('onGsLanguageAttrChange_', () => {
    it('should set the mode correctly', () => {
      const mockSession = jasmine.createSpyObj('Session', ['setMode']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy', 'getSession']);
      mockEditor.getSession.and.returnValue(mockSession);
      input['editor_'] = mockEditor;

      input['onGsLanguageAttrChange_'](Languages.JAVASCRIPT);

      assert(mockSession.setMode).to.haveBeenCalledWith('ace/mode/javascript');
    });

    it('should do nothing if there is no editor', () => {
      const mockSession = jasmine.createSpyObj('Session', ['setMode']);

      input['onGsLanguageAttrChange_'](Languages.JAVASCRIPT);

      assert(mockSession.setMode).toNot.haveBeenCalled();
    });

    it('should do nothing if the new language is null', () => {
      const mockSession = jasmine.createSpyObj('Session', ['setMode']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy', 'getSession']);
      mockEditor.getSession.and.returnValue(mockSession);
      input['editor_'] = mockEditor;

      input['onGsLanguageAttrChange_'](null);

      assert(mockSession.setMode).toNot.haveBeenCalled();
    });
  });

  describe('onGsShowGutterAttrChange_', () => {
    it('should set the show gutter to true if the new value is true', () => {
      const mockRenderer = jasmine.createSpyObj('Renderer', ['setShowGutter']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      mockEditor.renderer = mockRenderer;
      input['editor_'] = mockEditor;
      input['onGsShowGutterAttrChange_'](true);
      assert(mockRenderer.setShowGutter).to.haveBeenCalledWith(true);
    });

    it('should set the show gutter to false if the new value is false', () => {
      const mockRenderer = jasmine.createSpyObj('Renderer', ['setShowGutter']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      mockEditor.renderer = mockRenderer;
      input['editor_'] = mockEditor;
      input['onGsShowGutterAttrChange_'](false);
      assert(mockRenderer.setShowGutter).to.haveBeenCalledWith(false);
    });

    it('should set the show gutter to true if the new value is null', () => {
      const mockRenderer = jasmine.createSpyObj('Renderer', ['setShowGutter']);
      const mockEditor = jasmine.createSpyObj('Editor', ['destroy']);
      mockEditor.renderer = mockRenderer;
      input['editor_'] = mockEditor;
      input['onGsShowGutterAttrChange_'](null);
      assert(mockRenderer.setShowGutter).to.haveBeenCalledWith(true);
    });

    it('should not throw errors there are no editors', () => {
      assert(() => {
        input['onGsShowGutterAttrChange_'](true);
      }).toNot.throw();
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

      const mockDeregisterFn = jasmine.createSpyObj('DeregisterFn', ['dispose']);
      const mockInterval = jasmine.createSpyObj('Interval', ['dispose', 'on', 'start']);
      mockInterval.on.and.returnValue(mockDeregisterFn);
      spyOn(Interval, 'newInstance').and.returnValue(mockInterval);

      spyOn(input, 'addDisposable').and.callThrough();

      input.onCreated(element);

      assert(mockShadowRoot.appendChild).to.haveBeenCalledWith(styleEl);
      assert(styleEl.innerHTML).to.equal(aceInnerHtml);
      assert(mockOwnerDocument.createElement).to.haveBeenCalledWith('style');
      assert(mockDocument.getElementById).to.haveBeenCalledWith('ace_editor.css');
      assert(input['editorValueBinder_'].setEditor).to.haveBeenCalledWith(mockEditor);
      assert(mockShadowRoot.querySelector).to.haveBeenCalledWith('#editor');
      assert(input['gsShowGutterHook_'].set).to.haveBeenCalledWith(true);
      assert(mockInterval.on).to.haveBeenCalledWith(Interval.TICK_EVENT, input['onTick_'], input);
      assert(mockInterval.start).to.haveBeenCalledWith();
      assert(input.addDisposable).to.haveBeenCalledWith(mockInterval);
      assert(input.addDisposable).to.haveBeenCalledWith(mockDeregisterFn);
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

      input.onCreated(element);

      assert(input['gsShowGutterHook_'].set).toNot.haveBeenCalled();
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
