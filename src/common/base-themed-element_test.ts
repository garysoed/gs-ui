import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { BaseThemedElement } from './base-themed-element';


describe('common.BaseThemedElement', () => {
  let themedElement: BaseThemedElement;
  let mockThemeService: any;

  beforeEach(() => {
    mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    themedElement = new BaseThemedElement(mockThemeService);
    TestDispose.add(themedElement);
  });

  describe('onCreated', () => {
    it('should apply the theme to the shadow root', () => {
      const shadowRoot = Mocks.object('shadowRoot');
      const element = Mocks.object('element');
      element.shadowRoot = shadowRoot;

      themedElement.onCreated(element);

      assert(mockThemeService.applyTheme).to.haveBeenCalledWith(element.shadowRoot);
    });

    it('should throw error if shadow root is null', () => {
      const element = Mocks.object('element');
      element.shadowRoot = null;
      assert(() => {
        themedElement.onCreated(element);
      }).to.throwError(/root is null/);
    });
  });
});
