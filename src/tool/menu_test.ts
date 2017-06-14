import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { AnchorLocation } from '../tool/anchor-location';
import { Menu } from '../tool/menu';


describe('tool.Menu', () => {
  let menu: Menu;
  let mockOverlayService: any;

  beforeEach(() => {
    mockOverlayService = jasmine.createSpyObj('MenuService', ['hideOverlay', 'showOverlay']);
    menu = new Menu(mockOverlayService);
    TestDispose.add(menu);
  });

  describe('onCreated_', () => {
    it('should default the anchor target to AUTO', () => {
      const anchorPointId = Mocks.object('anchorPointId');
      const anchorTargetId = Mocks.object('anchorTargetId');
      const visibleId = 'visibleId';
      const anchorPoint = AnchorLocation.BOTTOM_LEFT;
      const visible = true;

      const value = menu.onCreated_(
          {id: anchorPointId, value: anchorPoint},
          {id: anchorTargetId, value: null},
          {id: visibleId, value: visible});

      assert(value).to.haveElements([
        [anchorPointId, anchorPoint],
        [anchorTargetId, AnchorLocation.AUTO],
        [visibleId, visible],
      ]);
    });

    it('should default the anchor point to AUTO', () => {
      const anchorPointId = Mocks.object('anchorPointId');
      const anchorTargetId = Mocks.object('anchorTargetId');
      const visibleId = 'visibleId';
      const anchorTarget = AnchorLocation.BOTTOM_LEFT;
      const visible = true;

      const value = menu.onCreated_(
          {id: anchorPointId, value: null},
          {id: anchorTargetId, value: anchorTarget},
          {id: visibleId, value: visible});

      assert(value).to.haveElements([
        [anchorPointId, AnchorLocation.AUTO],
        [anchorTargetId, anchorTarget],
        [visibleId, visible],
      ]);
    });

    it(`should default the visibility to false`, () => {
      const anchorPointId = Mocks.object('anchorPointId');
      const anchorTargetId = Mocks.object('anchorTargetId');
      const visibleId = 'visibleId';
      const anchorTarget = AnchorLocation.BOTTOM_LEFT;
      const anchorPoint = AnchorLocation.BOTTOM_LEFT;

      const value = menu.onCreated_(
          {id: anchorPointId, value: anchorPoint},
          {id: anchorTargetId, value: anchorTarget},
          {id: visibleId, value: null});

      assert(value).to.haveElements([
        [anchorPointId, anchorPoint],
        [anchorTargetId, anchorTarget],
        [visibleId, false],
      ]);
    });
  });

  describe('onOverlayVisibilityChange_', () => {
    it(`should set the visible attribute to true if event type is show`, () => {
      const visibleId = 'visibleId';
      const event = {id: menu['id_'], type: 'show' as 'show'};
      assert(menu.onOverlayVisibilityChange_(event, {id: visibleId, value: null})).to
          .haveElements([[visibleId, true]]);
    });

    it(`should set the visible attribute to hide if event type is hide`, () => {
      const visibleId = 'visibleId';
      const event = {id: menu['id_'], type: 'hide' as 'hide'};
      assert(menu.onOverlayVisibilityChange_(event, {id: visibleId, value: null})).to
          .haveElements([[visibleId, false]]);
    });

    it(`should do nothing the ID does not match`, () => {
      const event = {id: Symbol('otherId'), type: 'hide' as 'hide'};
      assert(menu.onOverlayVisibilityChange_(event, {id: 'visibleId', value: null})).to
          .haveElements([]);
    });
  });

  describe('onVisibleChanged_', () => {
    it('should call the overlay service correctly', () => {
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

      menu.onVisibleChanged_(element, true, true, anchorTarget, anchorPoint);

      assert(mockOverlayService.showOverlay).to.haveBeenCalledWith(
          menu['id_'],
          element,
          menuContent,
          parentElement,
          anchorTarget,
          anchorPoint);
      assert(menuContentStyle.width).to.equal(`${parentWidth}px`);
    });

    it('should not set the width to the parent element if it-parent-width is not set', () => {
      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = 123;

      const menuContentStyle = Mocks.object('menuContentStyle');
      const menuContent = Mocks.object('menuContent');
      menuContent.style = menuContentStyle;

      const element = Mocks.object('element');
      element.firstElementChild = menuContent;
      element.parentElement = parentElement;

      menu.onVisibleChanged_(
          element,
          false,
          true,
          AnchorLocation.BOTTOM_LEFT,
          AnchorLocation.TOP_RIGHT);

      assert(menuContentStyle.width).toNot.beDefined();
    });

    it('should throw error if there are no parent elements', () => {
      const element = Mocks.object('element');
      element.parentElement = null;
      assert(() => {
        menu.onVisibleChanged_(
            element,
            false,
            true,
            AnchorLocation.BOTTOM_LEFT,
            AnchorLocation.TOP_RIGHT);
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
        menu.onVisibleChanged_(
            element,
            true,
            true,
            AnchorLocation.BOTTOM_LEFT,
            AnchorLocation.TOP_RIGHT);
      }).toNot.throw();
    });

    it(`should hide the overlay if not visible`, () => {
      menu.onVisibleChanged_(
          Mocks.object('element'),
          false,
          false,
          AnchorLocation.BOTTOM_LEFT,
          AnchorLocation.TOP_RIGHT);

      assert(mockOverlayService.hideOverlay).to.haveBeenCalledWith(menu['id_']);
    });
  });
});
