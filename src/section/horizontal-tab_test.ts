import {TestBase} from '../test-base';
TestBase.setup();

import {Animation} from '../../external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';
import {HorizontalTab} from './horizontal-tab';
import {Interval} from '../../external/gs_tools/src/async';
import {Mocks} from '../../external/gs_tools/src/mock';
import {TestDispose} from '../../external/gs_tools/src/testing';


describe('section.HorizontalTab', () => {
  let tab;

  beforeEach(() => {
    tab = new HorizontalTab();
    TestDispose.add(tab);
  });

  describe('onMutate_', () => {
    it('should update the highlight', () => {
      spyOn(tab, 'updateHighlight_');
      tab['onMutate_']();
      expect(tab['updateHighlight_']).toHaveBeenCalledWith();
    });
  });

  describe('onTick_', () => {
    it('should update the highlight', () => {
      spyOn(tab, 'updateHighlight_');
      tab['onTick_']();
      expect(tab['updateHighlight_']).toHaveBeenCalledWith();
    });
  });

  describe('setHighlight_', () => {
    it('should update the highlight element correctly', () => {
      let left = 12;
      let width = 34;
      let targetLeft = 56;
      let targetWidth = 78;

      tab['highlightLeft_'] = left;
      tab['highlightWidth_'] = width;

      let animate = Mocks.object('animate');
      let mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      mockAnimation.applyTo.and.returnValue(animate);
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      let mockListenableAnimate = jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
      mockListenableAnimate.once.and.returnValue(Mocks.disposable('Animate.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

      let highlightEl = Mocks.object('highlightEl');
      highlightEl.style = {};
      tab['highlightEl_'] = {eventTarget: highlightEl};

      tab['setHighlight_'](targetLeft, targetWidth);

      expect(mockListenableAnimate.once)
          .toHaveBeenCalledWith(DomEvent.FINISH, jasmine.any(Function));
      mockListenableAnimate.once.calls.argsFor(0)[1]();

      expect(highlightEl.style).toEqual({left: `${targetLeft}px`, width: `${targetWidth}px`});
      expect(tab['highlightLeft_']).toEqual(targetLeft);
      expect(tab['highlightWidth_']).toEqual(targetWidth);

      expect(ListenableDom.of).toHaveBeenCalledWith(animate);
      expect(mockAnimation.applyTo).toHaveBeenCalledWith(highlightEl);
      expect(Animation.newInstance).toHaveBeenCalledWith(
          [
            {left: `${left}px`, width: `${width}px`},
            {left: `${targetLeft}px`, width: `${targetWidth}px`},
          ],
          jasmine.any(Object));
    });

    it('should set the left to the destination midpoint if the current width is 0', () => {
      let targetLeft = 56;
      let targetWidth = 78;

      tab['highlightLeft_'] = 12;
      tab['highlightWidth_'] = 0;

      let mockAnimation = jasmine.createSpyObj('Animation', ['applyTo']);
      mockAnimation.applyTo.and.returnValue(Mocks.object('animate'));
      spyOn(Animation, 'newInstance').and.returnValue(mockAnimation);

      let mockListenableAnimate = jasmine.createSpyObj('ListenableAnimate', ['dispose', 'once']);
      mockListenableAnimate.once.and.returnValue(Mocks.disposable('Animate.once'));
      spyOn(ListenableDom, 'of').and.returnValue(mockListenableAnimate);

      let highlightEl = Mocks.object('highlightEl');
      highlightEl.style = {};
      tab['highlightEl_'] = {eventTarget: highlightEl};

      tab['setHighlight_'](targetLeft, targetWidth);

      expect(Animation.newInstance).toHaveBeenCalledWith(
          [
            {left: '95px', width: '0px'},
            jasmine.any(Object),
          ],
          jasmine.any(Object));
    });

    it('should not update if the highlight is up to date', () => {
      let targetLeft = 56;
      let targetWidth = 78;

      tab['highlightLeft_'] = targetLeft;
      tab['highlightWidth_'] = targetWidth;

      spyOn(Animation, 'newInstance');

      tab['setHighlight_'](targetLeft, targetWidth);

      expect(Animation.newInstance).not.toHaveBeenCalled();
    });
  });

  describe('updateHighlight_', () => {
    it('should grab the destination width and left correctly', () => {
      let left = 12;
      let width = 34;
      let selectedId = 'selectedId';

      let selectedTab = Mocks.object('selectedTab');
      selectedTab.offsetLeft = left;
      selectedTab.clientWidth = width;

      let mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(selectedTab);
      mockElement['gsSelectedTab'] = selectedId;
      tab['element_'] = {eventTarget: mockElement};

      spyOn(tab, 'setHighlight_');

      tab['updateHighlight_']();

      expect(tab['setHighlight_']).toHaveBeenCalledWith(left, width);
      expect(mockElement.querySelector).toHaveBeenCalledWith(`[gs-tab-id="${selectedId}"]`);
    });

    it('should shrink to 0 width if there are no selected Ids', () => {
      let left = 12;
      let width = 34;

      tab['highlightLeft_'] = left;
      tab['highlightWidth_'] = width;

      let element = Mocks.object('element');
      tab['element_'] = {eventTarget: element};

      spyOn(tab, 'setHighlight_');

      tab['updateHighlight_']();

      expect(tab['setHighlight_']).toHaveBeenCalledWith(29, 34);
    });
  });

  describe('onCreated', () => {
    it('should initialize correctly', () => {
      let tabContainer = Mocks.object('tabContainer');
      let highlightEl = Mocks.object('highlightEl');
      let highlightContainer = Mocks.object('highlightContainer');

      let mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelector']);
      mockShadowRoot.querySelector.and.callFake((query: string) => {
        switch (query) {
          case '.highlight-container':
            return highlightContainer;
          case '.highlight':
            return highlightEl;
          case '.tab-container':
            return tabContainer;
        }
      });
      let element = Mocks.object('element');
      element.shadowRoot = mockShadowRoot;

      spyOn(tab, 'onTick_');
      spyOn(tab['mutationObserver_'], 'observe');
      spyOn(tab['interval_'], 'on').and.returnValue(Mocks.disposable('Interval.on'));
      spyOn(tab['interval_'], 'start');

      tab.onCreated(element);

      expect(tab['mutationObserver_']['observe']).toHaveBeenCalledWith(element, {childList: true});

      expect(tab['interval_'].start).toHaveBeenCalledWith();
      expect(tab['interval_'].on) .toHaveBeenCalledWith(Interval.TICK_EVENT, jasmine.any(Function));
      tab['interval_']['on'].calls.argsFor(0)[1]();
      expect(tab['onTick_']).toHaveBeenCalledWith();

      expect(tab['tabContainer_'].eventTarget).toEqual(tabContainer);
      expect(tab['highlightEl_'].eventTarget).toEqual(highlightEl);
      expect(tab['highlightContainerEl_'].eventTarget).toEqual(highlightContainer);
    });
  });
});
