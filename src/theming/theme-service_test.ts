import {assert, TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from 'external/gs_tools/src/mock';

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

  describe('initialize', () => {
    it('should initialize the app correctly', () => {
      let mockHeadEl = jasmine.createSpyObj('HeadEl', ['appendChild']);

      mockDocument.querySelector.and.returnValue(mockHeadEl);

      let cssTemplate = 'cssTemplate';
      mockTemplates.getTemplate.and.returnValue(cssTemplate);

      let styleEl = Mocks.object('styleEl');
      let mockParsedCss = jasmine.createSpyObj('ParsedCss', ['querySelector']);
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
      let themeStyleEl = Mocks.object('themeStyleEl');
      mockDocument.createElement.and.returnValue(themeStyleEl);

      let mockHeadEl = jasmine.createSpyObj('HeadEl', ['appendChild']);
      mockDocument.querySelector.and.callFake((query: string) => {
        switch (query) {
          case 'head':
            return mockHeadEl;
          default:
            return null;
        }
      });

      let theme = Mocks.object('theme');
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
          'body{--gsRgbBaseDark:1,2,3;--gsRgbBaseNormal:7,8,9;' +
          '--gsRgbBaseLight:4,5,6;--gsRgbAccent:10,11,12;}');
      assert(themeStyleEl.id).to.equal('gs-theme');

      assert(mockHeadEl.appendChild).to.haveBeenCalledWith(themeStyleEl);
      assert(mockDocument.querySelector).to.haveBeenCalledWith('head');
      assert(mockDocument.querySelector).to.haveBeenCalledWith('style#gs-theme');
      assert(mockDocument.createElement).to.haveBeenCalledWith('style');
    });

    it('should reuse the previous style element', () => {
      let themeStyleEl = Mocks.object('themeStyleEl');
      themeStyleEl.innerHTML = 'oldInnerHTML';

      mockDocument.querySelector.and.returnValue(themeStyleEl);

      let theme = Mocks.object('theme');
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
          'body{--gsRgbBaseDark:1,2,3;--gsRgbBaseNormal:7,8,9;' +
          '--gsRgbBaseLight:4,5,6;--gsRgbAccent:10,11,12;}');

      assert(mockDocument.querySelector).to.haveBeenCalledWith('style#gs-theme');
      assert(mockDocument.createElement).toNot.haveBeenCalled();
    });
  });
});
