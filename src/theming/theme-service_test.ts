import {TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from '../../external/gs_tools/src/mock';
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
      let initialInnerHTML = 'initialInnerHTML';
      let headEl = Mocks.object('headEl');
      headEl.innerHTML = initialInnerHTML;

      mockDocument.querySelector.and.returnValue(headEl);

      let cssTemplate = 'cssTemplate';
      mockTemplates.getTemplate.and.returnValue(cssTemplate);

      service.initialize();

      expect(headEl.innerHTML).toEqual(initialInnerHTML + cssTemplate);
      expect(mockTemplates.getTemplate).toHaveBeenCalledWith('src/theming/theme');
      expect(mockDocument.querySelector).toHaveBeenCalledWith('head');
    });

    it('should not initialize again if called the second time', () => {
      let headEl = Mocks.object('headEl');
      headEl.innerHTML = '';
      mockDocument.querySelector.and.returnValue(headEl);

      let cssTemplate = 'cssTemplate';
      mockTemplates.getTemplate.and.returnValue(cssTemplate);

      service.initialize();
      service.initialize();

      expect(headEl.innerHTML).toEqual(cssTemplate);
    });

    it('should throw error if the theme template cannot be found', () => {
      mockTemplates.getTemplate.and.returnValue(null);

      expect(() => {
        service.initialize();
      }).toThrowError(/not found/);
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

      expect(themeStyleEl.innerHTML).toEqual(
          'body{--gsRgbBaseDark:1,2,3;--gsRgbBaseNormal:7,8,9;' +
          '--gsRgbBaseLight:4,5,6;--gsRgbAccent:10,11,12;}');
      expect(themeStyleEl.id).toEqual('gs-theme');

      expect(mockHeadEl.appendChild).toHaveBeenCalledWith(themeStyleEl);
      expect(mockDocument.querySelector).toHaveBeenCalledWith('head');
      expect(mockDocument.querySelector).toHaveBeenCalledWith('style#gs-theme');
      expect(mockDocument.createElement).toHaveBeenCalledWith('style');
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

      expect(themeStyleEl.innerHTML).toEqual(
          'body{--gsRgbBaseDark:1,2,3;--gsRgbBaseNormal:7,8,9;' +
          '--gsRgbBaseLight:4,5,6;--gsRgbAccent:10,11,12;}');

      expect(mockDocument.querySelector).toHaveBeenCalledWith('style#gs-theme');
      expect(mockDocument.createElement).not.toHaveBeenCalled();
    });
  });
});
