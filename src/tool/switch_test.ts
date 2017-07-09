import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Vector2d } from 'external/gs_tools/src/immutable';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { ANIMATE_CONTAINER_ID, ANIMATE_SLOT_ID, NULL_ID, Switch } from '../tool/switch';

describe('tool.Switch', () => {
  let mockDocument: any;
  let window: any;
  let switchEl: Switch;

  beforeEach(() => {
    mockDocument = jasmine.createSpyObj('Document', ['createElement']);
    window = Mocks.object('window');
    switchEl = new Switch(Mocks.object('ThemeService'), mockDocument, window);
    TestDispose.add(switchEl);
  });

  describe('applyKeyframe_', () => {
    it(`should copy all the styles in the keyframe to the element`, () => {
      const left = 'left';
      const right = 'right';
      const element = Mocks.object('element');
      const style = Mocks.object('style');
      element.style = style;

      switchEl['applyKeyframe_'](element, {left, right});
      assert(element.style).to.equal(Matchers.objectContaining({left, right}));
    });
  });

  describe('computeAnimations_', () => {
    it(`should return the correct animations`, () => {
      const clientRect = {height: 12, left: 34, top: 56, width: 78} as ClientRect;
      const circleCenter = Vector2d.of(9, 10);
      const animations = switchEl['computeAnimations_'](clientRect, circleCenter);

      const relativeCenterX = -25;
      const relativeCenterY = -46;
      const minLength = Math.sqrt(25 * 25 + 46 * 46);
      const maxLength = Math.sqrt(103 * 103 + 58 * 58);
      assert(animations.container['keyframes_']).to.equal([
        {
          height: `${2 * minLength}px`,
          left: `${relativeCenterX - minLength}px`,
          top: `${relativeCenterY - minLength}px`,
          width: `${2 * minLength}px`,
        },
        {
          height: `${2 * maxLength}px`,
          left: `${relativeCenterX - maxLength}px`,
          top: `${relativeCenterY - maxLength}px`,
          width: `${2 * maxLength}px`,
        },
      ]);
      assert(animations.slot['keyframes_']).to.equal([
        {
          left: `${minLength - relativeCenterX}px`,
          top: `${minLength - relativeCenterY}px`,
        },
        {
          left: `${maxLength - relativeCenterX}px`,
          top: `${maxLength - relativeCenterY}px`,
        },
      ]);
    });
  });

  describe('getAnimationCircleCenter_', () => {
    it(`should return the correct coordinate for click actions`, () => {
      const x = 12;
      const y = 34;
      const action = {type: 'click' as 'click', x: 12, y: 34};
      assert(switchEl['getAnimationCircleCenter_'](action)).to
          .equal(Matchers.objectContaining({x, y}));
    });

    it(`should return the correct coordinate for no actions`, () => {
      window.innerWidth = 12;
      assert(switchEl['getAnimationCircleCenter_'](null)).to
          .equal(Matchers.objectContaining({x: 6, y: 0}));
    });
  });

  describe('onAnimateContainerFinish_', () => {
    it(`should remove all the previous siblings and apply the last keyframe`, () => {
      const rootEl = document.createElement('div');
      const otherEl1 = document.createElement('other-element-1');
      const otherEl2 = document.createElement('other-element-2');
      const targetEl = document.createElement('div');
      const otherEl3 = document.createElement('other-element-3');
      rootEl.appendChild(otherEl1);
      rootEl.appendChild(otherEl2);
      rootEl.appendChild(targetEl);
      rootEl.appendChild(otherEl3);

      const lastKeyframe = Mocks.object('lastKeyframe');
      const customEvent = {
        detail: {
          id: ANIMATE_CONTAINER_ID,
          keyframes: [
            Mocks.object('otherKeyframe'),
            lastKeyframe,
          ],
        },
        target: targetEl,
      } as any;
      spyOn(switchEl, 'applyKeyframe_');

      switchEl.onAnimateContainerFinish_(customEvent);
      assert(switchEl['applyKeyframe_']).to.haveBeenCalledWith(targetEl, lastKeyframe);
      assert(rootEl).to.haveChildren([targetEl, otherEl3]);
    });

    it(`should do nothing if the animation ID does not match`, () => {
      const rootEl = document.createElement('div');
      const otherEl1 = document.createElement('other-element-1');
      const targetEl = document.createElement('div');
      const otherEl2 = document.createElement('other-element-3');
      rootEl.appendChild(otherEl1);
      rootEl.appendChild(targetEl);
      rootEl.appendChild(otherEl2);

      const lastKeyframe = Mocks.object('lastKeyframe');
      const customEvent = {
        detail: {
          id: Symbol('otherId'),
          keyframes: [
            Mocks.object('otherKeyframe'),
            lastKeyframe,
          ],
        },
        target: targetEl,
      } as any;
      spyOn(switchEl, 'applyKeyframe_');

      switchEl.onAnimateContainerFinish_(customEvent);
      assert(switchEl['applyKeyframe_']).toNot.haveBeenCalled();
      assert(rootEl).to.haveChildren([otherEl1, targetEl, otherEl2]);
    });

    it(`should throw error if target is not HTMLElement`, () => {
      const targetEl = Mocks.object('targetEl');
      const customEvent = {
        detail: {
          id: ANIMATE_CONTAINER_ID,
          keyframes: [],
        },
        target: targetEl,
      } as any;

      assert(() => {
        switchEl.onAnimateContainerFinish_(customEvent);
      }).to.throwError(/not an HTMLElement/i);
    });
  });

  describe('onAnimateSlotFinish_', () => {
    it(`should apply the last keyframe`, () => {
      const targetEl = document.createElement('div');

      const lastKeyframe = Mocks.object('lastKeyframe');
      const customEvent = {
        detail: {
          id: ANIMATE_SLOT_ID,
          keyframes: [
            Mocks.object('otherKeyframe'),
            lastKeyframe,
          ],
        },
        target: targetEl,
      } as any;
      spyOn(switchEl, 'applyKeyframe_');

      switchEl.onAnimateSlotFinish_(customEvent);
      assert(switchEl['applyKeyframe_']).to.haveBeenCalledWith(targetEl, lastKeyframe);
    });

    it(`should do nothing if the animation ID does not match`, () => {
      const targetEl = document.createElement('div');
      const customEvent = {
        detail: {
          id: Symbol('otherId'),
          keyframes: [],
        },
        target: targetEl,
      } as any;
      spyOn(switchEl, 'applyKeyframe_');

      switchEl.onAnimateSlotFinish_(customEvent);
      assert(switchEl['applyKeyframe_']).toNot.haveBeenCalled();
    });

    it(`should throw error if target is not HTMLElement`, () => {
      const targetEl = Mocks.object('targetEl');
      const customEvent = {
        detail: {
          id: Symbol('otherId'),
          keyframes: [],
        },
        target: targetEl,
      } as any;
      spyOn(switchEl, 'applyKeyframe_');

      assert(() => {
        switchEl.onAnimateSlotFinish_(customEvent);
      }).to.throwError(/not an HTMLElement/i);
    });
  });

  describe('onRootDimensionChange_', () => {
    it(`should delete all the root children and add a single slot element`, () => {
      const rootEl = document.createElement('div');
      const child1 = document.createElement('child-1');
      rootEl.appendChild(child1);
      const child2 = document.createElement('child-2');
      rootEl.appendChild(child2);
      const child3 = document.createElement('child-3');
      rootEl.appendChild(child3);

      const value = 'value';
      const slotEl = document.createElement('slot');

      mockDocument.createElement.and.returnValue(slotEl);

      switchEl.onRootDimensionChange_(rootEl, value);
      assert(rootEl).to.haveChildren([slotEl]);
      assert(slotEl.getAttribute('name')).to.equal(value);
      assert(mockDocument.createElement).to.haveBeenCalledWith('slot');
    });

    it(`should do nothing if the value is null`, () => {
      const rootEl = document.createElement('div');
      const child1 = document.createElement('child-1');
      rootEl.appendChild(child1);
      const child2 = document.createElement('child-2');
      rootEl.appendChild(child2);
      const child3 = document.createElement('child-3');
      rootEl.appendChild(child3);

      switchEl.onRootDimensionChange_(rootEl, null);
      assert(rootEl).to.haveChildren([child1, child2, child3]);
      assert(mockDocument.createElement).toNot.haveBeenCalled();
    });
  });

  describe('onValueChange_', () => {
    it(`should delete old duplicate animations and create the animations correctly`, () => {
      const value = 'value';
      const height = 12;
      const width = 34;
      const clientRect = {height, width} as any;
      const center = Vector2d.of(56, 78);
      const rootEl = document.createElement('div');
      spyOn(rootEl, 'getBoundingClientRect').and.returnValue(clientRect);
      const otherEl = document.createElement('div');
      otherEl.id = value;
      rootEl.appendChild(otherEl);

      const containerEl = document.createElement('div');
      const slotContainerEl = document.createElement('div');
      const slotEl = document.createElement('slot');
      let callCount = 0;
      Fakes.build(mockDocument.createElement)
          .when('div').call(() => {
            const toReturn = callCount === 0 ? slotContainerEl : containerEl;
            callCount++;
            return toReturn;
          })
          .when('slot').return(slotEl);

      const lastAction = Mocks.object('lastAction');
      const mockContainerAnimation = jasmine.createSpyObj('ContainerAnimation', ['start']);
      const mockSlotAnimation = jasmine.createSpyObj('SlotAnimation', ['start']);

      spyOn(switchEl, 'computeAnimations_').and.returnValue({
        container: mockContainerAnimation,
        slot: mockSlotAnimation,
      });
      spyOn(switchEl, 'getAnimationCircleCenter_').and.returnValue(center);

      switchEl.onValueChange_(value, rootEl, lastAction);
      assert(mockSlotAnimation.start).to.haveBeenCalledWith(switchEl, `#${value} > *`);
      assert(mockContainerAnimation.start).to.haveBeenCalledWith(switchEl, `#${value}`);
      assert(rootEl).to.haveChildren([containerEl]);

      assert(containerEl).to.haveChildren([slotContainerEl]);
      assert(containerEl).to.haveClasses(['container']);
      assert(containerEl.id).to.equal(value);

      assert(slotContainerEl).to.haveChildren([slotEl]);
      assert(slotContainerEl).to.haveClasses(['slotContainer']);
      assert(slotContainerEl.style).to
          .equal(Matchers.objectContaining({height: `${height}px`, width: `${width}px`}));

      assert(slotEl.getAttribute('name')).to.equal(value);

      assert(switchEl['computeAnimations_']).to.haveBeenCalledWith(clientRect, center);
      assert(switchEl['getAnimationCircleCenter_']).to.haveBeenCalledWith(lastAction);
    });

    it(`should handle '.' and '/' correctly`, () => {
      const value = './.';
      const normalizedValue = '___';
      const height = 12;
      const width = 34;
      const clientRect = {height, width} as any;
      const center = Vector2d.of(56, 78);
      const rootEl = document.createElement('div');
      spyOn(rootEl, 'getBoundingClientRect').and.returnValue(clientRect);
      const otherEl = document.createElement('div');
      otherEl.id = normalizedValue;
      rootEl.appendChild(otherEl);

      const containerEl = document.createElement('div');
      const slotContainerEl = document.createElement('div');
      const slotEl = document.createElement('slot');
      let callCount = 0;
      Fakes.build(mockDocument.createElement)
          .when('div').call(() => {
            const toReturn = callCount === 0 ? slotContainerEl : containerEl;
            callCount++;
            return toReturn;
          })
          .when('slot').return(slotEl);

      const lastAction = Mocks.object('lastAction');
      const mockContainerAnimation = jasmine.createSpyObj('ContainerAnimation', ['start']);
      const mockSlotAnimation = jasmine.createSpyObj('SlotAnimation', ['start']);

      spyOn(switchEl, 'computeAnimations_').and.returnValue({
        container: mockContainerAnimation,
        slot: mockSlotAnimation,
      });
      spyOn(switchEl, 'getAnimationCircleCenter_').and.returnValue(center);

      switchEl.onValueChange_(value, rootEl, lastAction);
      assert(mockSlotAnimation.start).to.haveBeenCalledWith(switchEl, `#${normalizedValue} > *`);
      assert(mockContainerAnimation.start).to.haveBeenCalledWith(switchEl, `#${normalizedValue}`);
      assert(rootEl).to.haveChildren([containerEl]);

      assert(containerEl).to.haveChildren([slotContainerEl]);
      assert(containerEl).to.haveClasses(['container']);
      assert(containerEl.id).to.equal(normalizedValue);

      assert(slotContainerEl).to.haveChildren([slotEl]);
      assert(slotContainerEl).to.haveClasses(['slotContainer']);
      assert(slotContainerEl.style).to
          .equal(Matchers.objectContaining({height: `${height}px`, width: `${width}px`}));

      assert(slotEl.getAttribute('name')).to.equal(value);

      assert(switchEl['computeAnimations_']).to.haveBeenCalledWith(clientRect, center);
      assert(switchEl['getAnimationCircleCenter_']).to.haveBeenCalledWith(lastAction);
    });

    it(`should handle null values correctly`, () => {
      const value = null;
      const height = 12;
      const width = 34;
      const clientRect = {height, width} as any;
      const center = Vector2d.of(56, 78);
      const rootEl = document.createElement('div');
      spyOn(rootEl, 'getBoundingClientRect').and.returnValue(clientRect);
      const otherEl = document.createElement('div');
      otherEl.id = NULL_ID;
      rootEl.appendChild(otherEl);

      const containerEl = document.createElement('div');
      const slotContainerEl = document.createElement('div');
      const slotEl = document.createElement('slot');
      let callCount = 0;
      Fakes.build(mockDocument.createElement)
          .when('div').call(() => {
            const toReturn = callCount === 0 ? slotContainerEl : containerEl;
            callCount++;
            return toReturn;
          })
          .when('slot').return(slotEl);

      const lastAction = Mocks.object('lastAction');
      const mockContainerAnimation = jasmine.createSpyObj('ContainerAnimation', ['start']);
      const mockSlotAnimation = jasmine.createSpyObj('SlotAnimation', ['start']);

      spyOn(switchEl, 'computeAnimations_').and.returnValue({
        container: mockContainerAnimation,
        slot: mockSlotAnimation,
      });
      spyOn(switchEl, 'getAnimationCircleCenter_').and.returnValue(center);

      switchEl.onValueChange_(value, rootEl, lastAction);
      assert(mockSlotAnimation.start).to.haveBeenCalledWith(switchEl, `#${NULL_ID} > *`);
      assert(mockContainerAnimation.start).to.haveBeenCalledWith(switchEl, `#${NULL_ID}`);
      assert(rootEl).to.haveChildren([containerEl]);

      assert(containerEl).to.haveChildren([slotContainerEl]);
      assert(containerEl).to.haveClasses(['container']);
      assert(containerEl.id).to.equal(NULL_ID);

      assert(slotContainerEl).to.haveChildren([slotEl]);
      assert(slotContainerEl).to.haveClasses(['slotContainer']);
      assert(slotContainerEl.style).to
          .equal(Matchers.objectContaining({height: `${height}px`, width: `${width}px`}));

      assert(slotEl.getAttribute('name')).to.equal(NULL_ID);

      assert(switchEl['computeAnimations_']).to.haveBeenCalledWith(clientRect, center);
      assert(switchEl['getAnimationCircleCenter_']).to.haveBeenCalledWith(lastAction);
    });
  });
});
