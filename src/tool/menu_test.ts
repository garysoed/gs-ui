import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { FakeMonadSetter } from 'external/gs_tools/src/event';
import { AnchorLocation } from '../const';
import { Menu } from '../tool';

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
      const anchorPoint = AnchorLocation.BOTTOM_LEFT;
      const visible = true;

      const fakeAnchorPointSetter = new FakeMonadSetter<AnchorLocation | null>(anchorPoint);
      const fakeAnchorTargetSetter = new FakeMonadSetter<AnchorLocation | null>(null);
      const fakeVisibleSetter = new FakeMonadSetter<boolean | null>(visible);

      const list = menu.onCreated_(
          fakeAnchorPointSetter,
          fakeAnchorTargetSetter,
          fakeVisibleSetter);
      assert(fakeAnchorPointSetter.findValue(list)).to.beNull();
      assert(fakeAnchorTargetSetter.findValue(list)!.value).to.equal(AnchorLocation.AUTO);
      assert(fakeVisibleSetter.findValue(list)).to.beNull();
    });

    it('should default the anchor point to AUTO', () => {
      const anchorTarget = AnchorLocation.BOTTOM_LEFT;
      const visible = true;

      const fakeAnchorPointSetter = new FakeMonadSetter<AnchorLocation | null>(null);
      const fakeAnchorTargetSetter = new FakeMonadSetter<AnchorLocation | null>(anchorTarget);
      const fakeVisibleSetter = new FakeMonadSetter<boolean | null>(visible);

      const list = menu.onCreated_(
          fakeAnchorPointSetter,
          fakeAnchorTargetSetter,
          fakeVisibleSetter);
      assert(fakeAnchorPointSetter.findValue(list)!.value).to.equal(AnchorLocation.AUTO);
      assert(fakeAnchorTargetSetter.findValue(list)).to.beNull();
      assert(fakeVisibleSetter.findValue(list)).to.beNull();
    });

    it(`should default the visibility to false`, () => {
      const anchorTarget = AnchorLocation.BOTTOM_LEFT;
      const anchorPoint = AnchorLocation.BOTTOM_LEFT;

      const fakeAnchorPointSetter = new FakeMonadSetter<AnchorLocation | null>(anchorPoint);
      const fakeAnchorTargetSetter = new FakeMonadSetter<AnchorLocation | null>(anchorTarget);
      const fakeVisibleSetter = new FakeMonadSetter<boolean | null>(null);

      const list = menu.onCreated_(
          fakeAnchorPointSetter,
          fakeAnchorTargetSetter,
          fakeVisibleSetter);
      assert(fakeAnchorPointSetter.findValue(list)).to.beNull();
      assert(fakeAnchorTargetSetter.findValue(list)).to.beNull();
      assert(fakeVisibleSetter.findValue(list)!.value).to.beFalse();
    });
  });

  describe('onOverlayVisibilityChange_', () => {
    it(`should set the visible attribute to true if event type is show`, () => {
      const event = {id: menu['id_'], type: 'show' as 'show'};
      const fakeVisibleSetter = new FakeMonadSetter<boolean | null>(null);

      const list = menu.onOverlayVisibilityChange_(event, fakeVisibleSetter);
      assert(fakeVisibleSetter.findValue(list)!.value).to.beTrue();
    });

    it(`should set the visible attribute to hide if event type is hide`, () => {
      const event = {id: menu['id_'], type: 'hide' as 'hide'};
      const fakeVisibleSetter = new FakeMonadSetter<boolean | null>(null);

      const list = menu.onOverlayVisibilityChange_(event, fakeVisibleSetter);
      assert(fakeVisibleSetter.findValue(list)!.value).to.beFalse();
    });

    it(`should do nothing the ID does not match`, () => {
      const event = {id: Symbol('otherId'), type: 'hide' as 'hide'};
      const fakeVisibleSetter = new FakeMonadSetter<boolean | null>(null);

      const list = menu.onOverlayVisibilityChange_(event, fakeVisibleSetter);
      assert([...list]).to.equal([]);
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
