import {assert, TestBase} from '../test-base';
TestBase.setup();

import {Fakes, Mocks} from 'external/gs_tools/src/mock';

import {ThemeService} from './theme-service';


describe('theming.ThemeService', () => {
  let mockDocument;
  let mockTemplates;
  let service;

  beforeEach(() => {
    mockDocument = jasmine.createSpyObj('Document', ['createElement', 'querySelector']);
    mockTemplates = jasmine.createSpyObj('Templates', ['getTemplate']);
    service = new ThemeService(mockTemplates, mockDocument);
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

      mockDocument.querySelector.and.returnValue(mockHeadEl);

      const cssTemplate = 'cssTemplate';
      mockTemplates.getTemplate.and.returnValue(cssTemplate);

      const styleEl = Mocks.object('styleEl');
      const mockParsedCss = jasmine.createSpyObj('ParsedCss', ['querySelector']);
      mockParsedCss.querySelector.and.returnValue(styleEl);
      spyOn(service['parser_'], 'parseFromString').and.returnValue(mockParsedCss);

      service.initialize();

      assert(mockHeadEl.appendChild).to.haveBeenCalledWith(styleEl);
      assert(mockParsedCss.querySelector).to.haveBeenCalledWith('style');
      assert(mockDocument.querySelector).to.haveBeenCalledWith('head');
      assert(service['parser_'].parseFromString).to.haveBeenCalledWith(cssTemplate, 'text/html');
      assert(mockTemplates.getTemplate).to.haveBeenCalledWith('src/theming/global');
      assert(<boolean> service['initialized_']).to.beTrue();
    });

    it('should not initialize again if called the second time', () => {
      service['initialized_'] = true;
      service.initialize();
      assert(mockDocument.querySelector).toNot.haveBeenCalled();
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
      mockDocument.createElement.and.returnValue(themeStyleEl);

      const mockHeadEl = jasmine.createSpyObj('HeadEl', ['appendChild']);
      Fakes.build(mockDocument.querySelector)
          .when('head').return(mockHeadEl)
          .else().return(null);

      const theme = Mocks.object('theme');
      theme['base'] = {
        'dark': {getBlue: () => 3, getGreen: () => 2, getRed: () => 1},
        'light': {getBlue: () => 6, getGreen: () => 5, getRed: () => 4},
        'normal': {getBlue: () => 9, getGreen: () => 8, getRed: () => 7},
      };
      theme['accent'] = {
        'accent': {getBlue: () => 12, getGreen: () => 11, getRed: () => 10},
      };

      service.install(theme);

      assert(themeStyleEl.innerHTML).to.equal(
          'body{--gsRgbAccent:10,11,12;--gsRgbBaseDark:1,2,3;' +
          '--gsRgbBaseLight:4,5,6;--gsRgbBaseNormal:7,8,9;}');
      assert(themeStyleEl.id).to.equal('gs-theme');

      assert(mockHeadEl.appendChild).to.haveBeenCalledWith(themeStyleEl);
      assert(mockDocument.querySelector).to.haveBeenCalledWith('head');
      assert(mockDocument.querySelector).to.haveBeenCalledWith('style#gs-theme');
      assert(mockDocument.createElement).to.haveBeenCalledWith('style');
    });

    it('should reuse the previous style element', () => {
      const themeStyleEl = Mocks.object('themeStyleEl');
      themeStyleEl.innerHTML = 'oldInnerHTML';

      mockDocument.querySelector.and.returnValue(themeStyleEl);

      const theme = Mocks.object('theme');
      theme['base'] = {
        'dark': {getBlue: () => 3, getGreen: () => 2, getRed: () => 1},
        'light': {getBlue: () => 6, getGreen: () => 5, getRed: () => 4},
        'normal': {getBlue: () => 9, getGreen: () => 8, getRed: () => 7},
      };
      theme['accent'] = {
        'accent': {getBlue: () => 12, getGreen: () => 11, getRed: () => 10},
      };

      service.install(theme);

      assert(themeStyleEl.innerHTML).to.equal(
          'body{--gsRgbAccent:10,11,12;--gsRgbBaseDark:1,2,3;' +
          '--gsRgbBaseLight:4,5,6;--gsRgbBaseNormal:7,8,9;}');

      assert(mockDocument.querySelector).to.haveBeenCalledWith('style#gs-theme');
      assert(mockDocument.createElement).toNot.haveBeenCalled();
    });
  });
});
