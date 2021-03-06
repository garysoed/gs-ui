import { assert, TestBase } from '../test-base';
TestBase.setup();

import { RgbColor } from 'external/gs_tools/src/color';
import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { Theme } from '../theming/theme';
import { ThemeService } from '../theming/theme-service';


describe('theming.ThemeService', () => {
  let mockDocument: any;
  let mockTemplates: any;
  let mockWindow: any;
  let service: ThemeService;

  beforeEach(() => {
    mockDocument = jasmine.createSpyObj('Document', ['createElement', 'querySelector']);
    mockTemplates = jasmine.createSpyObj('Templates', ['getTemplate']);
    mockWindow = jasmine.createSpyObj('Window', ['getComputedStyle']);
    service = new ThemeService(mockTemplates, mockWindow, mockDocument);
    TestDispose.add(service);
  });

  describe('getThemeStyleEl_', () => {
    it('should return the theme element correctly if exists', () => {
      const themeStyleEl = Mocks.object('themeStyleEl');
      themeStyleEl.innerHTML = 'oldInnerHTML';
      mockDocument.querySelector.and.returnValue(themeStyleEl);

      assert(service['getThemeStyleEl_']()).to.equal(themeStyleEl);
      assert(mockDocument.querySelector).to.haveBeenCalledWith('style#gs-theme');
      assert(mockDocument.createElement).toNot.haveBeenCalled();
    });

    it('should create a new theme element if does not exist', () => {
      const themeStyleEl = Mocks.object('themeStyleEl');
      mockDocument.createElement.and.returnValue(themeStyleEl);
      mockDocument.querySelector.and.returnValue(null);

      const mockHeadEl = jasmine.createSpyObj('HeadEl', ['appendChild']);
      mockDocument.head = mockHeadEl;

      assert(service['getThemeStyleEl_']()).to.equal(themeStyleEl);
      assert(themeStyleEl.id).to.equal('gs-theme');

      assert(mockDocument.querySelector).to.haveBeenCalledWith('style#gs-theme');
      assert(mockDocument.createElement).to.haveBeenCalledWith('style');
    });
  });

  describe('applyTheme', () => {
    it('should append the style element correctly', () => {
      const styleEl = Mocks.object('styleEl');
      const mockCssTemplateEl = jasmine.createSpyObj('CssTemplateEl', ['querySelector']);
      mockCssTemplateEl.querySelector.and.returnValue(styleEl);
      const mockRoot = jasmine.createSpyObj('Root', ['appendChild']);

      const cssTemplate = 'cssTemplate';
      mockTemplates.getTemplate.and.returnValue(cssTemplate);

      spyOn(service['parser_'], 'parseFromString').and.returnValue(mockCssTemplateEl);

      service.applyTheme(mockRoot);

      assert(mockRoot.appendChild).to.haveBeenCalledWith(styleEl);
      assert(mockCssTemplateEl.querySelector).to.haveBeenCalledWith('style');
      assert(service['parser_'].parseFromString).to.haveBeenCalledWith(cssTemplate, 'text/html');
      assert(mockTemplates.getTemplate).to.haveBeenCalledWith('src/theming/common');
    });

    it('should append the style element to the document head if root is document', () => {
      const styleEl = Mocks.object('styleEl');
      const mockCssTemplateEl = jasmine.createSpyObj('CssTemplateEl', ['querySelector']);
      mockCssTemplateEl.querySelector.and.returnValue(styleEl);
      const mockHeadEl = jasmine.createSpyObj('HeadEl', ['appendChild']);

      const document = Mocks.object('document');
      document.head = mockHeadEl;
      Object.setPrototypeOf(document, Document.prototype);

      const cssTemplate = 'cssTemplate';
      mockTemplates.getTemplate.and.returnValue(cssTemplate);

      spyOn(service['parser_'], 'parseFromString').and.returnValue(mockCssTemplateEl);

      service.applyTheme(document);

      assert(mockHeadEl.appendChild).to.haveBeenCalledWith(styleEl);
    });

    it('should throw error if style element cannot be found', () => {
      const mockCssTemplateEl = jasmine.createSpyObj('CssTemplateEl', ['querySelector']);
      mockCssTemplateEl.querySelector.and.returnValue(null);
      const mockRoot = jasmine.createSpyObj('Root', ['appendChild']);

      const cssTemplate = 'cssTemplate';
      mockTemplates.getTemplate.and.returnValue(cssTemplate);

      spyOn(service['parser_'], 'parseFromString').and.returnValue(mockCssTemplateEl);

      assert(() => {
        service.applyTheme(mockRoot);
      }).to.throwError(/style element not found/);

      assert(mockCssTemplateEl.querySelector).to.haveBeenCalledWith('style');
      assert(service['parser_'].parseFromString).to.haveBeenCalledWith(cssTemplate, 'text/html');
      assert(mockTemplates.getTemplate).to.haveBeenCalledWith('src/theming/common');
    });

    it('should throw error if the common template is not available', () => {
      const mockRootEl = Mocks.object('RootEl');
      mockTemplates.getTemplate.and.returnValue(null);

      assert(() => {
        service.applyTheme(mockRootEl);
      }).to.throwError(/src\/theming\/common not found/);
    });
  });

  describe('initialize', () => {
    it('should initialize the app correctly', () => {
      const mockHeadEl = jasmine.createSpyObj('HeadEl', ['appendChild']);
      mockDocument.head = mockHeadEl;

      const cssTemplate = 'cssTemplate';
      mockTemplates.getTemplate.and.returnValue(cssTemplate);

      const styleEl = Mocks.object('styleEl');
      const mockParsedCss = jasmine.createSpyObj('ParsedCss', ['querySelector']);
      mockParsedCss.querySelector.and.returnValue(styleEl);
      spyOn(service['parser_'], 'parseFromString').and.returnValue(mockParsedCss);

      service.initialize();

      assert(mockHeadEl.appendChild).to.haveBeenCalledWith(styleEl);
      assert(mockParsedCss.querySelector).to.haveBeenCalledWith('style');
      assert(service['parser_'].parseFromString).to.haveBeenCalledWith(cssTemplate, 'text/html');
      assert(mockTemplates.getTemplate).to.haveBeenCalledWith('src/theming/global');
      assert(service['initialized_'] as boolean).to.beTrue();
    });

    it('should not initialize again if called the second time', () => {
      service['initialized_'] = true;
      service.initialize();
      assert(mockDocument.querySelector).toNot.haveBeenCalled();
    });

    it('should throw error if style element cannot be found', () => {
      const mockHeadEl = jasmine.createSpyObj('HeadEl', ['appendChild']);
      mockDocument.head = mockHeadEl;

      const cssTemplate = 'cssTemplate';
      mockTemplates.getTemplate.and.returnValue(cssTemplate);

      const mockParsedCss = jasmine.createSpyObj('ParsedCss', ['querySelector']);
      mockParsedCss.querySelector.and.returnValue(null);
      spyOn(service['parser_'], 'parseFromString').and.returnValue(mockParsedCss);

      assert(() => {
        service.initialize();
      }).to.throwError(/element not found/);

      assert(mockParsedCss.querySelector).to.haveBeenCalledWith('style');
      assert(service['parser_'].parseFromString).to.haveBeenCalledWith(cssTemplate, 'text/html');
      assert(mockTemplates.getTemplate).to.haveBeenCalledWith('src/theming/global');
    });

    it('should throw error if the theme template cannot be found', () => {
      mockTemplates.getTemplate.and.returnValue(null);

      assert(() => {
        service.initialize();
      }).to.throwError(/not found/);
    });
  });

  describe('install', () => {
    it('should append the correct template to the header element', () => {
      const themeStyleEl = Mocks.object('themeStyleEl');
      spyOn(service, 'getThemeStyleEl_').and.returnValue(themeStyleEl);

      const mockHeadEl = jasmine.createSpyObj('HeadEl', ['appendChild']);
      mockDocument.head = mockHeadEl;

      const theme = Theme.newInstance(
          RgbColor.newInstance(255, 255, 255),
          RgbColor.newInstance(0, 0, 0));

      service.install(theme);
      assert(themeStyleEl.innerHTML).to.equal(jasmine.stringMatching(/body{--/));
    });
  });

  describe('isHighlightMode', () => {
    it('should return true if the element is in highlight mode', () => {
      const element = Mocks.object('element');
      const mockComputedStyle = jasmine.createSpyObj('ComputedStyle', ['getPropertyValue']);
      mockComputedStyle.getPropertyValue.and.returnValue('  true');
      mockWindow.getComputedStyle.and.returnValue(mockComputedStyle);
      assert(service.isHighlightMode(element)).to.beTrue();
      assert(mockComputedStyle.getPropertyValue).to.haveBeenCalledWith('--gsColorHighlightMode');
      assert(mockWindow.getComputedStyle).to.haveBeenCalledWith(element);
    });

    it('should return false if the element is not in highlight mode', () => {
      const element = Mocks.object('element');
      const mockComputedStyle = jasmine.createSpyObj('ComputedStyle', ['getPropertyValue']);
      mockComputedStyle.getPropertyValue.and.returnValue('  false ');
      mockWindow.getComputedStyle.and.returnValue(mockComputedStyle);
      assert(service.isHighlightMode(element)).to.beFalse();
      assert(mockComputedStyle.getPropertyValue).to.haveBeenCalledWith('--gsColorHighlightMode');
      assert(mockWindow.getComputedStyle).to.haveBeenCalledWith(element);
    });
  });

  describe('isReversedMode', () => {
    it('should return true if the element is in reversed mode', () => {
      const element = Mocks.object('element');
      const mockComputedStyle = jasmine.createSpyObj('ComputedStyle', ['getPropertyValue']);
      mockComputedStyle.getPropertyValue.and.returnValue('  true');
      mockWindow.getComputedStyle.and.returnValue(mockComputedStyle);
      assert(service.isReversedMode(element)).to.beTrue();
      assert(mockComputedStyle.getPropertyValue).to.haveBeenCalledWith('--gsColorReverseMode');
      assert(mockWindow.getComputedStyle).to.haveBeenCalledWith(element);
    });

    it('should return false if the element is not in reversed mode', () => {
      const element = Mocks.object('element');
      const mockComputedStyle = jasmine.createSpyObj('ComputedStyle', ['getPropertyValue']);
      mockComputedStyle.getPropertyValue.and.returnValue('  false ');
      mockWindow.getComputedStyle.and.returnValue(mockComputedStyle);
      assert(service.isReversedMode(element)).to.beFalse();
      assert(mockComputedStyle.getPropertyValue).to.haveBeenCalledWith('--gsColorReverseMode');
      assert(mockWindow.getComputedStyle).to.haveBeenCalledWith(element);
    });
  });
});
