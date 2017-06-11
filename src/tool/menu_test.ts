import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { AnchorLocation } from '../tool/anchor-location';
import { Menu } from '../tool/menu';


describe('tool.Menu', () => {
  let menu: Menu;
  let mockMenuService: any;

  beforeEach(() => {
    mockMenuService = jasmine.createSpyObj('MenuService', ['showOverlay']);
    menu = new Menu(mockMenuService);
    TestDispose.add(menu);
  });

  describe('onAction_', () => {
    it('should call the menu service correctly', () => {
      const parentWidth = 123;
      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = parentWidth;

      const anchorPoint = AnchorLocation.BOTTOM_LEFT;
      const anchorTarget = AnchorLocation.TOP_RIGHT;

      const menuContentStyle = Mocks.object('menuContentStyle');
      const menuContent = Mocks.object('menuContent');
      menuContent.style = menuContentStyle;

      const element = Mocks.object('element');
      element.firstElementChild = menuContent;
      element.parentElement = parentElement;

      menu.onAction_(element, true, anchorTarget, anchorPoint);

      assert(mockMenuService.showOverlay).to.haveBeenCalledWith(
          element,
          menuContent,
          parentElement,
          anchorTarget,
          anchorPoint);
      assert(menuContentStyle.width).to.equal(`${parentWidth}px`);
    });

    it('should not set the width to the parent element if fit-parent-width is not set', () => {
      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = 123;

      const menuContentStyle = Mocks.object('menuContentStyle');
      const menuContent = Mocks.object('menuContent');
      menuContent.style = menuContentStyle;

      const element = Mocks.object('element');
      element.firstElementChild = menuContent;
      element.parentElement = parentElement;

      menu.onAction_(element, false, AnchorLocation.BOTTOM_LEFT, AnchorLocation.TOP_RIGHT);

      assert(menuContentStyle.width).toNot.beDefined();
    });

    it('should not throw error if there are no parent elements', () => {
      const element = Mocks.object('element');
      element.parentElement = null;
      assert(() => {
        menu.onAction_(element, false, AnchorLocation.BOTTOM_LEFT, AnchorLocation.TOP_RIGHT);
      }).to.throwError(/No parent element/i);
    });

    it('should not throw error if there are no menu contents', () => {
      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = 123;

      const menuContentStyle = Mocks.object('menuContentStyle');
      const menuContent = Mocks.object('menuContent');
      menuContent.style = menuContentStyle;

      const element = Mocks.object('element');
      element.parentElement = parentElement;

      assert(() => {
        menu.onAction_(element, true, AnchorLocation.BOTTOM_LEFT, AnchorLocation.TOP_RIGHT);
      }).toNot.throw();
    });
  });

  describe('onCreated', () => {
    it('should default the anchor target to AUTO', () => {
      const anchorPointId = Mocks.object('anchorPointId');
      const anchorTargetId = Mocks.object('anchorTargetId');
      const anchorPoint = AnchorLocation.BOTTOM_LEFT;

      const value = menu.onCreated(
          {id: anchorPointId, value: anchorPoint},
          {id: anchorTargetId, value: null});

      assert(value).to.haveElements([
        [anchorPointId, anchorPoint],
        [anchorTargetId, AnchorLocation.AUTO],
      ]);
    });

    it('should default the anchor point to AUTO', () => {
      const anchorPointId = Mocks.object('anchorPointId');
      const anchorTargetId = Mocks.object('anchorTargetId');
      const anchorTarget = AnchorLocation.BOTTOM_LEFT;

      const value = menu.onCreated(
          {id: anchorPointId, value: null},
          {id: anchorTargetId, value: anchorTarget});

      assert(value).to.haveElements([
        [anchorPointId, AnchorLocation.AUTO],
        [anchorTargetId, anchorTarget],
      ]);
    });
  });
});
