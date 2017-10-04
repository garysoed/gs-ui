import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { DisposableFunction } from 'external/gs_tools/src/dispose';
import { Graph, GraphTime } from 'external/gs_tools/src/graph';
import { Mocks } from 'external/gs_tools/src/mock';
import { Persona } from 'external/gs_tools/src/persona';
import { TestDispose } from 'external/gs_tools/src/testing';

import { AnchorLocation } from '../const';
import { Menu } from '../tool';
import { $, $triggeredByRegistration } from '../tool/menu';

describe('tool.Menu', () => {
  let menu: Menu;
  let mockOverlayService: any;

  beforeEach(() => {
    Graph.clearAllNodesForTest();
    mockOverlayService = jasmine.createSpyObj('MenuService', ['hideOverlay', 'showOverlay']);
    menu = new Menu(Mocks.object('ThemeService'), mockOverlayService);
    TestDispose.add(menu);
  });

  describe('onTriggered_', () => {
    it(`should toggle the overlay visibility`, async () => {
      const time = GraphTime.new();
      spyOn(Graph, 'getTimestamp').and.returnValue(time);
      spyOn(menu, 'setOverlayVisible_');

      Graph.createProvider($.host.visible.getId(), true);

      await menu['onTriggered_']();
      assert(menu['setOverlayVisible_']).to.haveBeenCalledWith(false, time);
    });
  });

  describe('onTriggeredByChanged_', () => {
    it(`should listen for gs-action events from the element and dispose the previous `
        + `registration`, async () => {
      const triggeredBy = 'triggeredBy';
      spyOn(Persona, 'getValue').and.returnValue(triggeredBy);

      const origDisposable = DisposableFunction.of(() => undefined);
      Graph.createProvider($triggeredByRegistration, origDisposable);

      const mockTargetEl =
          jasmine.createSpyObj('TargetEl', ['addEventListener', 'removeEventListener']);

      const mockRootNode = jasmine.createSpyObj('RootNode', ['querySelector']);
      Object.setPrototypeOf(mockRootNode, Element.prototype);
      mockRootNode.querySelector.and.returnValue(mockTargetEl);

      const mockElement = jasmine.createSpyObj('Element', ['getRootNode']);
      mockElement.getRootNode.and.returnValue(mockRootNode);
      Object.setPrototypeOf(mockElement, HTMLElement.prototype);
      await Graph.createProvider($.host.el.getId(), mockElement);

      spyOn(menu, 'onTriggered_');

      await menu.onTriggeredByChanged_();
      const disposable = await Graph.get($triggeredByRegistration, Graph.getTimestamp(), menu);
      disposable!.dispose();
      assert(mockTargetEl.removeEventListener).to
          .haveBeenCalledWith('gs-action', Matchers.any(Function));

      const handler = mockTargetEl.removeEventListener.calls.argsFor(0)[1];
      assert(mockTargetEl.addEventListener).to.haveBeenCalledWith('gs-action', handler);
      assert(mockRootNode.querySelector).to.haveBeenCalledWith(triggeredBy);
      assert(origDisposable.isDisposed()).to.beTrue();

      const event = Mocks.object('event');
      handler(event);
      assert(Persona.getValue).to.haveBeenCalledWith($.host.triggeredBy, menu);
    });

    it(`should do nothing if the target element cannot be found`, async () => {
      const triggeredBy = 'triggeredBy';
      spyOn(Persona, 'getValue').and.returnValue(triggeredBy);

      const origDisposable = DisposableFunction.of(() => undefined);
      Graph.createProvider($triggeredByRegistration, origDisposable);
      TestDispose.add(origDisposable);

      const mockRootNode = jasmine.createSpyObj('RootNode', ['querySelector']);
      Object.setPrototypeOf(mockRootNode, Element.prototype);
      mockRootNode.querySelector.and.returnValue(null);

      const mockElement = jasmine.createSpyObj('Element', ['getRootNode']);
      mockElement.getRootNode.and.returnValue(mockRootNode);
      Object.setPrototypeOf(mockElement, HTMLElement.prototype);
      await Graph.createProvider($.host.el.getId(), mockElement);

      await menu.onTriggeredByChanged_();
      assert(mockRootNode.querySelector).to.haveBeenCalledWith(triggeredBy);
      assert(origDisposable.isDisposed()).to.beFalse();
    });

    it(`should reject error if the root node is not a query selector type`, async () => {
      const triggeredBy = 'triggeredBy';
      spyOn(Persona, 'getValue').and.returnValue(triggeredBy);

      Graph.createProvider($triggeredByRegistration, null);

      const mockRootNode = jasmine.createSpyObj('RootNode', ['querySelector']);
      const mockElement = jasmine.createSpyObj('Element', ['getRootNode']);
      mockElement.getRootNode.and.returnValue(mockRootNode);
      Object.setPrototypeOf(mockElement, HTMLElement.prototype);
      await Graph.createProvider($.host.el.getId(), mockElement);

      await assert(menu.onTriggeredByChanged_()).to.rejectWithError(/Cannot run query selector/);
    });

    it(`should not reject if the triggeredBy value is falsy`, async () => {
      spyOn(Persona, 'getValue').and.returnValue(null);

      await menu.onTriggeredByChanged_();
    });
  });

  describe('onVisibleChanged_', () => {
    it(`should set the overlay to visible correctly`, () => {
      const time = Graph.getTimestamp();

      spyOn(Persona, 'getValue').and.returnValue(true);
      spyOn(menu, 'setOverlayVisible_');

      menu.onVisibleChanged_();
      assert(menu['setOverlayVisible_']).to.haveBeenCalledWith(true, time);
      assert(Persona.getValue).to.haveBeenCalledWith($.host.visible, menu);
    });

    it(`should default the visibility to false`, () => {
      const time = Graph.getTimestamp();

      spyOn(Persona, 'getValue').and.returnValue(null);
      spyOn(menu, 'setOverlayVisible_');

      menu.onVisibleChanged_();
      assert(menu['setOverlayVisible_']).to.haveBeenCalledWith(false, time);
      assert(Persona.getValue).to.haveBeenCalledWith($.host.visible, menu);
    });
  });

  describe('renderVisible_', () => {
    it(`should return the visible state`, () => {
      const visible = true;

      assert(menu.renderVisible_({id: menu['id_'], visible})).to.be(visible);
    });

    it(`should return false if the state ID is not the same as the menu ID`, () => {
      assert(menu.renderVisible_({id: Symbol('otherId'), visible: true})).to.beFalse();
    });

    it(`should return false if there are no states`, () => {
      assert(menu.renderVisible_(null)).to.beFalse();
    });
  });

  describe('setOverlayVisible_', () => {
    it('should call the overlay service correctly', async () => {
      const parentWidth = 123;
      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = parentWidth;

      Graph.createProvider($.host.fitParentWidth.getId(), true);

      const anchorPoint = AnchorLocation.BOTTOM_LEFT;
      Graph.createProvider($.host.anchorPoint.getId(), anchorPoint);

      const anchorTarget = AnchorLocation.TOP_RIGHT;
      Graph.createProvider($.host.anchorTarget.getId(), anchorTarget);

      const menuContentStyle = Mocks.object('menuContentStyle');
      const menuContent = Mocks.object('menuContent');
      menuContent.style = menuContentStyle;

      const element = Mocks.object('element');
      element.firstElementChild = menuContent;
      element.parentElement = parentElement;
      Object.setPrototypeOf(element, HTMLElement.prototype);
      Graph.createProvider($.host.el.getId(), element);

      await menu['setOverlayVisible_'](true, Graph.getTimestamp());
      assert(mockOverlayService.showOverlay).to.haveBeenCalledWith(
          menu['id_'],
          element,
          menuContent,
          parentElement,
          anchorTarget,
          anchorPoint);
      assert(menuContentStyle.width).to.equal(`${parentWidth}px`);
    });

    it('should not set the width to the parent element if fit-parent-width is not set',
        async () => {
      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = 123;

      Graph.createProvider($.host.fitParentWidth.getId(), false);
      Graph.createProvider($.host.anchorPoint.getId(), AnchorLocation.BOTTOM_LEFT);
      Graph.createProvider($.host.anchorTarget.getId(), AnchorLocation.TOP_RIGHT);

      const menuContentStyle = Mocks.object('menuContentStyle');
      const menuContent = Mocks.object('menuContent');
      menuContent.style = menuContentStyle;

      const element = Mocks.object('element');
      element.firstElementChild = menuContent;
      element.parentElement = parentElement;
      Object.setPrototypeOf(element, HTMLElement.prototype);
      Graph.createProvider($.host.el.getId(), element);

      await menu['setOverlayVisible_'](true, Graph.getTimestamp());
      assert(menuContentStyle.width).toNot.beDefined();
    });

    it('should reject if there are no parent elements', async () => {
      Graph.createProvider($.host.fitParentWidth.getId(), false);
      Graph.createProvider($.host.anchorPoint.getId(), AnchorLocation.BOTTOM_LEFT);
      Graph.createProvider($.host.anchorTarget.getId(), AnchorLocation.TOP_RIGHT);

      const element = Mocks.object('element');
      element.parentElement = null;
      Object.setPrototypeOf(element, HTMLElement.prototype);
      Graph.createProvider($.host.el.getId(), element);

      await assert(menu['setOverlayVisible_'](true, Graph.getTimestamp()))
          .to.rejectWithError(/No parent element/i);
    });

    it('should resolve if there are no menu contents', async () => {
      Graph.createProvider($.host.fitParentWidth.getId(), true);
      Graph.createProvider($.host.anchorPoint.getId(), AnchorLocation.BOTTOM_LEFT);
      Graph.createProvider($.host.anchorTarget.getId(), AnchorLocation.TOP_RIGHT);

      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = 123;

      const element = Mocks.object('element');
      element.parentElement = parentElement;
      element.firstElementChild = null;
      Object.setPrototypeOf(element, HTMLElement.prototype);
      Graph.createProvider($.host.el.getId(), element);

      await menu['setOverlayVisible_'](true, Graph.getTimestamp());
    });

    it(`should hide the overlay if set to hide`, async () => {
      Graph.createProvider($.host.fitParentWidth.getId(), false);
      Graph.createProvider($.host.anchorPoint.getId(), AnchorLocation.BOTTOM_LEFT);
      Graph.createProvider($.host.anchorTarget.getId(), AnchorLocation.TOP_RIGHT);

      const parentElement = Mocks.object('parentElement');
      parentElement.clientWidth = 123;

      const element = Mocks.object('element');
      element.parentElement = parentElement;
      Object.setPrototypeOf(element, HTMLElement.prototype);
      Graph.createProvider($.host.el.getId(), element);

      await menu['setOverlayVisible_'](false, Graph.getTimestamp());
      assert(mockOverlayService.hideOverlay).to.haveBeenCalledWith(menu['id_']);
    });
  });
});
