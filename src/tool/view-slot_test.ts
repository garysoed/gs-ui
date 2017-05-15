import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableList } from 'external/gs_tools/src/immutable';
import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { LocationService, LocationServiceEvents } from 'external/gs_tools/src/ui';
import { Doms } from 'external/gs_tools/src/ui';

import { __FULL_PATH, ViewSlot } from './view-slot';


describe('tool.ViewSlot', () => {
  let viewSlot: ViewSlot;
  let mockLocationService;

  beforeEach(() => {
    mockLocationService = Mocks.listenable('LocationService');
    TestDispose.add(mockLocationService);

    spyOn(mockLocationService, 'on').and.callThrough();
    spyOn(ViewSlot.prototype, 'onLocationChanged_').and.callThrough();

    viewSlot = new ViewSlot(
        jasmine.createSpyObj('ThemeService', ['applyTheme']),
        mockLocationService);
    TestDispose.add(viewSlot);
  });

  describe('onLocationChanged_', () => {
    it('should update the selector', () => {
      spyOn(viewSlot, 'updateActiveView_');
      viewSlot['onLocationChanged_']();
      assert(viewSlot['updateActiveView_']).to.haveBeenCalledWith();
    });
  });

  describe('setActiveElement_', () => {
    it('should deactivate the currently active element and activates the target element', () => {
      const mockCurrentActiveEl = jasmine.createSpyObj('CurrentActiveEl', ['setAttribute']);
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(mockCurrentActiveEl);

      const mockListenableElement = jasmine.createSpyObj('ListenableElement', ['getEventTarget']);
      mockListenableElement.getEventTarget.and.returnValue(mockElement);
      spyOn(viewSlot, 'getElement').and.returnValue(mockListenableElement);

      const mockTargetElement = jasmine.createSpyObj('TargetElement', ['setAttribute']);

      viewSlot['setActiveElement_'](mockTargetElement);

      assert(mockTargetElement.setAttribute).to.haveBeenCalledWith('gs-view-active', 'true');
      assert(mockCurrentActiveEl.setAttribute).to.haveBeenCalledWith('gs-view-active', 'false');
      assert(mockElement.querySelector).to.haveBeenCalledWith('[gs-view-active="true"]');
    });

    it('should deactive the currently active element if target element is null', () => {
      const mockCurrentActiveEl = jasmine.createSpyObj('CurrentActiveEl', ['setAttribute']);
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(mockCurrentActiveEl);

      const mockListenableElement = jasmine.createSpyObj('ListenableElement', ['getEventTarget']);
      mockListenableElement.getEventTarget.and.returnValue(mockElement);
      spyOn(viewSlot, 'getElement').and.returnValue(mockListenableElement);

      viewSlot['setActiveElement_'](null);

      assert(mockCurrentActiveEl.setAttribute).to.haveBeenCalledWith('gs-view-active', 'false');
      assert(mockElement.querySelector).to.haveBeenCalledWith('[gs-view-active="true"]');
    });

    it('should not throw error if there are no current active element', () => {
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(null);

      const mockListenableElement = jasmine.createSpyObj('ListenableElement', ['getEventTarget']);
      mockListenableElement.getEventTarget.and.returnValue(mockElement);
      spyOn(viewSlot, 'getElement').and.returnValue(mockListenableElement);

      assert(() => {
        viewSlot['setActiveElement_'](null);
      }).toNot.throw();
    });

    it('should not throw error if there are no listenable elements', () => {
      assert(() => {
        viewSlot['setActiveElement_'](null);
      }).toNot.throw();
    });
  });

  describe('setRootElVisible_', () => {
    it('should add the "hidden" classname when setting to not visible', () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['toggle']);
      spyOn(viewSlot.rootElClassListHook_, 'get').and.returnValue(mockClassList);
      viewSlot['setRootElVisible_'](false);
      assert(mockClassList.toggle).to.haveBeenCalledWith('hidden', true);
    });

    it('should remove the "hidden" classname when setting to be visible', () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['toggle']);
      spyOn(viewSlot.rootElClassListHook_, 'get').and.returnValue(mockClassList);
      viewSlot['setRootElVisible_'](true);
      assert(mockClassList.toggle).to.haveBeenCalledWith('hidden', false);
    });

    it('should do nothing if class list cannot be found', () => {
      spyOn(viewSlot.rootElClassListHook_, 'get').and.returnValue(null);
      assert(() => {
        viewSlot['setRootElVisible_'](true);
      }).toNot.throw();
    });
  });

  describe('updateActiveView_', () => {
    it('should set the correct target element to active', () => {
      const fullPath = 'fullPath';
      const children = Mocks.object('children');

      const path = 'path';
      const mockChildWithPath = jasmine.createSpyObj('ChildWithPath', ['getAttribute']);
      mockChildWithPath.getAttribute.and.returnValue(path);

      const mockChildNoPath = jasmine.createSpyObj('ChildNoPath', ['getAttribute']);
      mockChildNoPath.getAttribute.and.returnValue(null);

      const element = Mocks.object('element');
      element.children = {
        item(index: number): any {
          return (index === 0) ? mockChildNoPath : mockChildWithPath;
        },
        length: 2,
      };
      element[__FULL_PATH] = fullPath;

      const mockListenableElement = jasmine.createSpyObj('ListenableElement', ['getEventTarget']);
      mockListenableElement.getEventTarget.and.returnValue(element);
      spyOn(viewSlot, 'getElement').and.returnValue(mockListenableElement);

      const appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      mockLocationService.hasMatch = jasmine.createSpy('LocationService.hasMatch').and
          .returnValue(true);

      spyOn(viewSlot, 'setRootElVisible_');
      spyOn(viewSlot, 'setActiveElement_');

      viewSlot['updateActiveView_']();

      assert(viewSlot['setRootElVisible_']).to.haveBeenCalledWith(true);
      assert(viewSlot['setActiveElement_']).to.haveBeenCalledWith(mockChildWithPath);

      assert(LocationService.appendParts).to.haveBeenCalledWith(ImmutableList.of([fullPath, path]));
      assert(mockLocationService.hasMatch).to.haveBeenCalledWith(appendedPath);
      assert(mockChildWithPath.getAttribute).to.haveBeenCalledWith('gs-view-path');
      assert(mockChildNoPath.getAttribute).to.haveBeenCalledWith('gs-view-path');
    });

    it('should set no elements to active if there are no active elements', () => {
      const element = Mocks.object('element');
      element.children = {
        item(): any {
          return null;
        },
        length: 0,
      };
      element[__FULL_PATH] = 'fullPath';

      const mockListenableElement = jasmine.createSpyObj('ListenableElement', ['getEventTarget']);
      mockListenableElement.getEventTarget.and.returnValue(element);
      spyOn(viewSlot, 'getElement').and.returnValue(mockListenableElement);

      const mockChild = jasmine.createSpyObj('Child', ['getAttribute']);
      mockChild.getAttribute.and.returnValue(null);

      spyOn(viewSlot, 'setRootElVisible_');
      spyOn(viewSlot, 'setActiveElement_');

      viewSlot['updateActiveView_']();

      assert(viewSlot['setRootElVisible_']).to.haveBeenCalledWith(false);
      assert(viewSlot['setActiveElement_']).to.haveBeenCalledWith(null);
    });

    it('should not throw error if there are no listenable elements', () => {
      spyOn(viewSlot, 'getElement').and.returnValue(null);

      assert(() => {
        viewSlot['updateActiveView_']();
      }).toNot.throw();
    });
  });

  describe('onCreated', () => {
    it('should get the reference to the root element', () => {
      const rootEl = Mocks.object('rootEl');
      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.returnValue(rootEl);
      spyOn(viewSlot, 'listenTo');

      viewSlot.onCreated({shadowRoot: mockShadowRoot} as HTMLElement);
      assert(viewSlot.listenTo).to.haveBeenCalledWith(
          mockLocationService,
          LocationServiceEvents.CHANGED,
          viewSlot['onLocationChanged_']);
    });
  });

  describe('onInserted', () => {
    it('should assign the full path correctly', () => {
      const element = Mocks.object('element');
      const rootPath = 'rootPath';
      const rootElement = Mocks.object('rootElement');
      rootElement[__FULL_PATH] = rootPath;
      rootElement.nodeName = 'GS-VIEW-SLOT';

      const currentPath = 'currentPath';
      const mockPathElement = jasmine.createSpyObj('PathElement', ['getAttribute']);
      mockPathElement.getAttribute.and.returnValue(currentPath);

      const appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      spyOn(Doms, 'parentIterable').and.returnValue([mockPathElement, rootElement]);
      spyOn(viewSlot, 'updateActiveView_');

      viewSlot.onInserted(element);

      assert(viewSlot['updateActiveView_']).to.haveBeenCalledWith();
      assert(element[__FULL_PATH]).to.equal(appendedPath);
      assert(LocationService.appendParts).to
          .haveBeenCalledWith(ImmutableList.of([rootPath, currentPath]));
      assert(mockPathElement.getAttribute).to.haveBeenCalledWith('gs-view-path');
      assert(Doms.parentIterable).to.haveBeenCalledWith(element, true /* bustShadow */);
    });

    it('should assign the path to "/" if there are no current path or root path', () => {
      const element = Mocks.object('element');
      const appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      spyOn(Doms, 'parentIterable').and.returnValue([]);
      spyOn(viewSlot, 'updateActiveView_');

      viewSlot.onInserted(element);

      assert(element[__FULL_PATH]).to.equal(appendedPath);
      assert(LocationService.appendParts).to.haveBeenCalledWith(ImmutableList.of(['', '']));
    });
  });
});
