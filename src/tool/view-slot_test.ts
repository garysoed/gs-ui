import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableList } from 'external/gs_tools/src/immutable';
import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { LocationService } from 'external/gs_tools/src/ui';
import { Doms } from 'external/gs_tools/src/ui';

import { FakeMonadSetter } from 'external/gs_tools/src/event';
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
      const switchEl = document.createElement('div');

      const correctChildName = 'correctChildName';
      const correctChild = document.createElement('div');
      correctChild.setAttribute('gs-view-path', correctChildName);
      element.appendChild(correctChild);

      viewSlot.onChildListChange_(element, switchEl);
      assert(correctChild.getAttribute('slot')).to.equal(correctChildName);
      assert(switchEl.children.length).to.equal(1);

      const slotEl = switchEl.children.item(0) as HTMLSlotElement;
      assert(slotEl.name).to.equal(correctChildName);
      assert(slotEl.getAttribute('slot')).to.equal(correctChildName);
    });

    it(`should skip children with no 'gs-view-path'`, () => {
      const element = document.createElement('div');
      const switchEl = document.createElement('div');

      const correctChild = document.createElement('div');
      element.appendChild(correctChild);

      viewSlot.onChildListChange_(element, switchEl);
      assert(switchEl).to.haveChildren([]);
    });
  });

  describe('onInserted', () => {
    it('should assign the full path correctly', () => {
      const element = Mocks.object('element');
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

      viewSlot.onInserted(element);

      assert(element[__fullPath]).to.equal(appendedPath);
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

      viewSlot.onInserted(element);

      assert(element[__fullPath]).to.equal(appendedPath);
      assert(LocationService.appendParts).to.haveBeenCalledWith(ImmutableList.of(['', '']));
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
      const fullPath = 'fullPath';

      const slotName = 'slotName';
      const path = 'path';
      const childWithPath = document.createElement('div');
      childWithPath.setAttribute('gs-view-path', path);
      childWithPath.setAttribute('slot', slotName);

      const childNoPath = document.createElement('div');

      const element = document.createElement('div');
      element.appendChild(childNoPath);
      element.appendChild(childWithPath);
      element[__fullPath] = fullPath;

      const appendedPath = 'appendedPath';
      spyOn(LocationService, 'appendParts').and.returnValue(appendedPath);

      spyOn(LocationService, 'hasMatch').and.returnValue(true);

      spyOn(viewSlot, 'setRootElVisible_');

      const fakeSwitchValueSetter = new FakeMonadSetter<string | null>(null);

      const updates = viewSlot.updateActiveView_(element, rootEl, fakeSwitchValueSetter);
      assert(fakeSwitchValueSetter.findValue(updates)!.value).to.equal(slotName);
      assert(viewSlot['setRootElVisible_']).to.haveBeenCalledWith(rootEl, true);
      assert(LocationService.appendParts).to.haveBeenCalledWith(ImmutableList.of([fullPath, path]));
      assert(LocationService.hasMatch).to.haveBeenCalledWith(appendedPath);
      assert(childWithPath.getAttribute('gs-view-active')).to.equal('true');
    });

    it('should set no elements to active if there are no active elements', () => {
      const rootEl = Mocks.object('rootEl');
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

      const fakeSwitchValueSetter = new FakeMonadSetter<string | null>(null);

      const updates = viewSlot.updateActiveView_(element, rootEl, fakeSwitchValueSetter);
      assert(fakeSwitchValueSetter.findValue(updates)!.value).to.beNull();
      assert(viewSlot['setRootElVisible_']).to.haveBeenCalledWith(rootEl, false);
    });

    it('should do nothing if there are no full paths', () => {
      const rootEl = Mocks.object('rootEl');
      const element = Mocks.object('element');
      spyOn(viewSlot, 'getFullPath_').and.returnValue(null);
      spyOn(viewSlot, 'setRootElVisible_');

      const fakeSwitchValueSetter = new FakeMonadSetter<string | null>(null);

      assert(viewSlot.updateActiveView_(element, rootEl, fakeSwitchValueSetter)).to.equal([]);
      assert(viewSlot['setRootElVisible_']).toNot.haveBeenCalled();
    });
  });
});
