import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {Arrays} from 'external/gs_tools/src/collection';
import {Doms} from 'external/gs_tools/src/ui';
import {LocationService, LocationServiceEvents} from 'external/gs_tools/src/ui';
import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {__FULL_PATH, ViewSlot} from './view-slot';


describe('tool.ViewSlot', () => {
  let viewSlot: ViewSlot;
  let mockLocationService;

  beforeEach(() => {
    mockLocationService = Mocks.listenable('LocationService');
    TestDispose.add(mockLocationService);

    spyOn(mockLocationService, 'on').and.callThrough();
    spyOn(ViewSlot.prototype, 'onLocationChanged_').and.callThrough();

    viewSlot = new ViewSlot(mockLocationService);
    TestDispose.add(viewSlot);
  });

  describe('constructor', () => {
    it('should listen to location service changed event', () => {
      assert(mockLocationService.on).to.haveBeenCalledWith(
          LocationServiceEvents.CHANGED,
          Matchers.any(Function));

      mockLocationService.on.calls.argsFor(0)[1]();
      assert(viewSlot['onLocationChanged_']).to.haveBeenCalledWith();
    });
  });

  describe('onLocationChanged_', () => {
    it('should update the selector', () => {
      spyOn(viewSlot, 'updateSelector_');
      viewSlot['onLocationChanged_']();
      assert(viewSlot['updateSelector_']).to.haveBeenCalledWith();
    });
  });

  describe('setRootElVisible_', () => {
    it('should add the "hidden" classname when setting to not visible', () => {
      let mockClassList = jasmine.createSpyObj('ClassList', ['toggle']);
      viewSlot['rootEl_'] = <HTMLElement> {classList: mockClassList};
      viewSlot['setRootElVisible_'](false);
      assert(mockClassList.toggle).to.haveBeenCalledWith('hidden', true);
    });

    it('should remove the "hidden" classname when setting to be visible', () => {
      let mockClassList = jasmine.createSpyObj('ClassList', ['toggle']);
      viewSlot['rootEl_'] = <HTMLElement> {classList: mockClassList};
      viewSlot['setRootElVisible_'](true);
      assert(mockClassList.toggle).to.haveBeenCalledWith('hidden', false);
    });
  });

  describe('updateSelector_', () => {
    it('should set the selector correctly', () => {
      let fullPath = 'fullPath';
      let children = Mocks.object('children');
      let element = Mocks.object('element');
      element.children = children;
      element[__FULL_PATH] = fullPath;

      let mockListenableElement = jasmine.createSpyObj('ListenableElement', ['getEventTarget']);
      mockListenableElement.getEventTarget.and.returnValue(element);
      spyOn(viewSlot, 'getElement').and.returnValue(mockListenableElement);

      let path = 'path';
      let mockChildWithPath = jasmine.createSpyObj('ChildWithPath', ['getAttribute']);
      mockChildWithPath.getAttribute.and.returnValue(path);

      let mockChildNoPath = jasmine.createSpyObj('ChildNoPath', ['getAttribute']);
      mockChildNoPath.getAttribute.and.returnValue(null);
      spyOn(Arrays, 'fromHtmlCollection').and
          .returnValue(Arrays.of([mockChildNoPath, mockChildWithPath]));

      let appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      mockLocationService.hasMatch = jasmine.createSpy('LocationService.hasMatch').and
          .returnValue(true);

      spyOn(viewSlot, 'setRootElVisible_');
      spyOn(viewSlot['contentSelectBridge_'], 'set');

      viewSlot['updateSelector_']();

      assert(viewSlot['setRootElVisible_']).to.haveBeenCalledWith(true);
      assert(viewSlot['contentSelectBridge_'].set).to
          .haveBeenCalledWith(`[gs-view-path="${path}"]`);

      assert(LocationService.appendParts).to.haveBeenCalledWith([fullPath, path]);
      assert(mockLocationService.hasMatch).to.haveBeenCalledWith(appendedPath);
      assert(mockChildWithPath.getAttribute).to.haveBeenCalledWith('gs-view-path');
      assert(mockChildNoPath.getAttribute).to.haveBeenCalledWith('gs-view-path');
      assert(Arrays.fromHtmlCollection).to.haveBeenCalledWith(children);
    });

    it('should delete the select attribute if there are no target elements found', () => {
      let element = Mocks.object('element');
      element.children = Mocks.object('children');

      let mockListenableElement = jasmine.createSpyObj('ListenableElement', ['getEventTarget']);
      mockListenableElement.getEventTarget.and.returnValue(element);
      spyOn(viewSlot, 'getElement').and.returnValue(mockListenableElement);

      let mockChild = jasmine.createSpyObj('Child', ['getAttribute']);
      mockChild.getAttribute.and.returnValue(null);
      spyOn(Arrays, 'fromHtmlCollection').and.returnValue(Arrays.of([mockChild]));

      spyOn(viewSlot, 'setRootElVisible_');
      spyOn(viewSlot['contentSelectBridge_'], 'delete');

      viewSlot['updateSelector_']();

      assert(viewSlot['setRootElVisible_']).to.haveBeenCalledWith(false);
      assert(viewSlot['contentSelectBridge_'].delete).to.haveBeenCalled();
    });

    it('should not throw error if there are no listenable elements', () => {
      spyOn(viewSlot, 'getElement').and.returnValue(null);

      assert(() => {
        viewSlot['updateSelector_']();
      }).toNot.throw();
    });
  });

  describe('onCreated', () => {
    it('should get the reference to the root element', () => {
      let rootEl = Mocks.object('rootEl');
      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(rootEl);
      viewSlot.onCreated(<HTMLElement> {shadowRoot: mockShadowRoot});
      assert(viewSlot['rootEl_']).to.equal(rootEl);
      assert(mockShadowRoot.querySelector).to.haveBeenCalledWith('.root');
    });
  });

  describe('onInserted', () => {
    it('should assign the full path correctly', () => {
      let element = Mocks.object('element');
      let rootPath = 'rootPath';
      let rootElement = Mocks.object('rootElement');
      rootElement[__FULL_PATH] = rootPath;
      rootElement.nodeName = 'GS-VIEW-SLOT';

      let currentPath = 'currentPath';
      let mockPathElement = jasmine.createSpyObj('PathElement', ['getAttribute']);
      mockPathElement.getAttribute.and.returnValue(currentPath);

      let appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      spyOn(Doms, 'parentIterable').and.returnValue([mockPathElement, rootElement]);
      spyOn(viewSlot, 'updateSelector_');

      viewSlot.onInserted(element);

      assert(viewSlot['updateSelector_']).to.haveBeenCalledWith();
      assert(element[__FULL_PATH]).to.equal(appendedPath);
      assert(LocationService.appendParts).to.haveBeenCalledWith([rootPath, currentPath]);
      assert(mockPathElement.getAttribute).to.haveBeenCalledWith('gs-view-path');
      assert(Doms.parentIterable).to.haveBeenCalledWith(element, true /* bustShadow */);
    });

    it('should assign the path to "/" if there are no current path or root path', () => {
      let element = Mocks.object('element');
      let appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      spyOn(Doms, 'parentIterable').and.returnValue([]);
      spyOn(viewSlot, 'updateSelector_');

      viewSlot.onInserted(element);

      assert(element[__FULL_PATH]).to.equal(appendedPath);
      assert(LocationService.appendParts).to.haveBeenCalledWith(['', '']);
    });
  });
});
