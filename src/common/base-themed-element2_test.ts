import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { __onCreated } from 'external/gs_tools/src/persona';
import { TestDispose } from 'external/gs_tools/src/testing';

import { BaseThemedElement2 } from '../common/base-themed-element2';


describe('common.BaseThemedElement2', () => {
  let mockThemeService: any;
  let element: BaseThemedElement2;

  beforeEach(() => {
    mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    element = new BaseThemedElement2(mockThemeService);
    TestDispose.add(element);
  });

  describe('__onCreated', () => {
    it(`should apply the theme to the shadow root correctly`, () => {
      const shadowRoot = Mocks.object('shadowRoot');

      element[__onCreated](shadowRoot);
      assert(mockThemeService.applyTheme).to.haveBeenCalledWith(shadowRoot);
    });
  });

  describe('onCreate', () => {
    it('should apply the theme to the shadow root', () => {
      const shadowRoot = Mocks.object('shadowRoot');
      const htmlElement = Mocks.object('htmlElement');
      htmlElement.shadowRoot = shadowRoot;
      element.onCreate(htmlElement);
      assert(mockThemeService.applyTheme).to.haveBeenCalledWith(shadowRoot);
    });

    it('should throw error if shadowRoot cannot be found', () => {
      const htmlElement = Mocks.object('htmlElement');
      htmlElement.shadowRoot = null;
      assert(() => {
        element.onCreate(htmlElement);
      }).to.throwError(/Shadow root is null/i);
    });
  });
});
