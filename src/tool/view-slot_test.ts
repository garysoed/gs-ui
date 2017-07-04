import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableList } from 'external/gs_tools/src/immutable';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { LocationService } from 'external/gs_tools/src/ui';
import { Doms } from 'external/gs_tools/src/ui';

import { __fullPath, ViewSlot } from './view-slot';


describe('tool.ViewSlot', () => {
  let viewSlot: ViewSlot;

  beforeEach(() => {
    viewSlot = new ViewSlot(
        document,
        jasmine.createSpyObj('ThemeService', ['applyTheme']));
    TestDispose.add(viewSlot);
  });

  describe('getFullPath_', () => {
    it(`should return the correct full path`, () => {
      const fullPath = 'fullPath';
      const element = Mocks.object('element');
      element[__fullPath] = fullPath;
      assert(viewSlot['getFullPath_'](element)).to.equal(fullPath);
    });

    it(`should return null if there are no full paths`, () => {
      const element = Mocks.object('element');
      assert(viewSlot['getFullPath_'](element)).to.beNull();
    });
  });

  describe('onChildListChange_', () => {
    it(`should remove the previous children and append the new ones`, () => {
      const element = document.createElement('div');
      const rootEl = Mocks.object('rootEl');
      const switchEl = document.createElement('div');

      const correctChildName = 'correctChildName';
      const correctChild = document.createElement('div');
      correctChild.setAttribute('gs-view-path', correctChildName);
      element.appendChild(correctChild);

      spyOn(viewSlot, 'updateActiveView_');

      viewSlot.onChildListChange_(element, rootEl, switchEl);
      assert(viewSlot.updateActiveView_).to.haveBeenCalledWith(element, rootEl, switchEl);
      assert(correctChild.getAttribute('slot')).to.equal(correctChildName);
      assert(switchEl.children.length).to.equal(1);

      const slotEl = switchEl.children.item(0) as HTMLSlotElement;
      assert(slotEl.name).to.equal(correctChildName);
      assert(slotEl.getAttribute('slot')).to.equal(correctChildName);
    });

    it(`should skip children with no 'gs-view-path'`, () => {
      const element = document.createElement('div');
      const rootEl = Mocks.object('rootEl');
      const switchEl = document.createElement('div');

      const correctChild = document.createElement('div');
      element.appendChild(correctChild);

      spyOn(viewSlot, 'updateActiveView_');

      viewSlot.onChildListChange_(element, rootEl, switchEl);
      assert(viewSlot.updateActiveView_).to.haveBeenCalledWith(element, rootEl, switchEl);
      assert(switchEl).to.haveChildren([]);
    });
  });

  describe('onInserted', () => {
    it('should assign the full path correctly', () => {
      const element = Mocks.object('element');
      const rootEl = Mocks.object('rootEl');
      const switchEl = Mocks.object('switchEl');
      const rootPath = 'rootPath';
      const searchedElement = Mocks.object('rootElement');
      searchedElement[__fullPath] = rootPath;
      searchedElement.nodeName = 'GS-VIEW-SLOT';

      const currentPath = 'currentPath';
      const mockPathElement = jasmine.createSpyObj('PathElement', ['getAttribute']);
      mockPathElement.getAttribute.and.returnValue(currentPath);

      const appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      spyOn(Doms, 'parentIterable').and.returnValue([mockPathElement, searchedElement]);
      spyOn(viewSlot, 'updateActiveView_');

      viewSlot.onInserted(element, rootEl, switchEl);

      assert(viewSlot.updateActiveView_).to.haveBeenCalledWith(element, rootEl, switchEl);
      assert(element[__fullPath]).to.equal(appendedPath);
      assert(LocationService.appendParts).to
          .haveBeenCalledWith(ImmutableList.of([rootPath, currentPath]));
      assert(mockPathElement.getAttribute).to.haveBeenCalledWith('gs-view-path');
      assert(Doms.parentIterable).to.haveBeenCalledWith(element, true /* bustShadow */);
    });

    it('should assign the path to "/" if there are no current path or root path', () => {
      const element = Mocks.object('element');
      const rootEl = Mocks.object('rootEl');
      const switchEl = Mocks.object('switchEl');
      const appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      spyOn(Doms, 'parentIterable').and.returnValue([]);
      spyOn(viewSlot, 'updateActiveView_');

      viewSlot.onInserted(element, rootEl, switchEl);

      assert(element[__fullPath]).to.equal(appendedPath);
      assert(LocationService.appendParts).to.haveBeenCalledWith(ImmutableList.of(['', '']));
    });
  });

  describe('setActiveElement_', () => {
    it(`should set the attribute correctly`, () => {
      const slotName = 'slotName';
      const switchEl = document.createElement('div');
      viewSlot.setActiveElement_(slotName, switchEl);
      assert(switchEl.getAttribute('value')).to.equal(slotName);
    });

    it(`should delete the attribute if no elements is active`, () => {
      const switchEl = document.createElement('div');
      switchEl.setAttribute('value', 'slotName');
      viewSlot.setActiveElement_(null, switchEl);
      assert(switchEl.getAttribute('value')).to.beNull();
    });
  });

  describe('setRootElVisible_', () => {
    it('should add the "hidden" classname when setting to not visible', () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['toggle']);
      const rootEl = Mocks.object('rootEl');
      rootEl.classList = mockClassList;
      viewSlot['setRootElVisible_'](rootEl, false);
      assert(mockClassList.toggle).to.haveBeenCalledWith('hidden', true);
    });

    it('should remove the "hidden" classname when setting to be visible', () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['toggle']);
      const rootEl = Mocks.object('rootEl');
      rootEl.classList = mockClassList;
      viewSlot['setRootElVisible_'](rootEl, true);
      assert(mockClassList.toggle).to.haveBeenCalledWith('hidden', false);
    });
  });

  describe('updateActiveView_', () => {
    it('should set the correct target element to active', () => {
      const rootEl = Mocks.object('rootEl');
      const switchEl = Mocks.object('switchEl');
      const fullPath = 'fullPath';

      const slotName = 'slotName';
      const path = 'path';
      const mockChildWithPath = jasmine.createSpyObj('ChildWithPath', ['getAttribute']);
      Fakes.build(mockChildWithPath.getAttribute)
          .when('gs-view-path').return(path)
          .when('slot').return(slotName);

      const mockChildNoPath = jasmine.createSpyObj('ChildNoPath', ['getAttribute']);
      mockChildNoPath.getAttribute.and.returnValue(null);

      const element = Mocks.object('element');
      element.children = {
        item(index: number): any {
          return (index === 0) ? mockChildNoPath : mockChildWithPath;
        },
        length: 2,
      };
      element[__fullPath] = fullPath;

      const appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      spyOn(LocationService, 'hasMatch').and.returnValue(true);

      spyOn(viewSlot, 'setRootElVisible_');
      spyOn(viewSlot, 'setActiveElement_');

      viewSlot.updateActiveView_(element, rootEl, switchEl);

      assert(viewSlot['setRootElVisible_']).to.haveBeenCalledWith(rootEl, true);
      assert(viewSlot['setActiveElement_']).to.haveBeenCalledWith(slotName, switchEl);

      assert(LocationService.appendParts).to.haveBeenCalledWith(ImmutableList.of([fullPath, path]));
      assert(LocationService.hasMatch).to.haveBeenCalledWith(appendedPath);
      assert(mockChildWithPath.getAttribute).to.haveBeenCalledWith('gs-view-path');
      assert(mockChildNoPath.getAttribute).to.haveBeenCalledWith('gs-view-path');
    });

    it('should set no elements to active if there are no active elements', () => {
      const rootEl = Mocks.object('rootEl');
      const switchEl = Mocks.object('switchEl');
      const element = Mocks.object('element');
      element.children = {
        item(): any {
          return null;
        },
        length: 0,
      };
      element[__fullPath] = 'fullPath';

      const mockChild = jasmine.createSpyObj('Child', ['getAttribute']);
      mockChild.getAttribute.and.returnValue(null);

      spyOn(viewSlot, 'setRootElVisible_');
      spyOn(viewSlot, 'setActiveElement_');

      viewSlot.updateActiveView_(element, rootEl, switchEl);

      assert(viewSlot['setRootElVisible_']).to.haveBeenCalledWith(rootEl, false);
      assert(viewSlot['setActiveElement_']).to.haveBeenCalledWith(null, switchEl);
    });

    it('should do nothing if there are no full paths', () => {
      const rootEl = Mocks.object('rootEl');
      const switchEl = Mocks.object('switchEl');
      const element = Mocks.object('element');
      spyOn(viewSlot, 'getFullPath_').and.returnValue(null);
      spyOn(viewSlot, 'setActiveElement_');
      spyOn(viewSlot, 'setRootElVisible_');

      viewSlot.updateActiveView_(rootEl, switchEl, element);
      assert(viewSlot['setActiveElement_']).toNot.haveBeenCalled();
      assert(viewSlot['setRootElVisible_']).toNot.haveBeenCalled();
    });
  });
});
