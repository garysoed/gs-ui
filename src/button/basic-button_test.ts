import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeMonadSetter } from 'external/gs_tools/src/event';
import { Iterables } from 'external/gs_tools/src/immutable';
import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { BasicButton } from '../button';
import { Action } from '../tool';


describe('button.BasicButton', () => {
  let button: BasicButton;

  beforeEach(() => {
    button = new BasicButton(Mocks.object('ThemeService'));
    TestDispose.add(button);
  });

  describe('onClick_', () => {
    it('should dispatch the correct event', () => {
      const x = 12;
      const y = 34;
      const mockEventDispatcher = jasmine.createSpy('EventDispatcher');
      const fakeActionSetter = new FakeMonadSetter<Action | null>(null);
      const list = button.onClick_(
          false,
          mockEventDispatcher,
          {x, y} as MouseEvent,
          fakeActionSetter);
      assert(fakeActionSetter.findValue(list)!.value).to.equal({type: 'click', x, y});
      assert(mockEventDispatcher).to.haveBeenCalledWith('gs-action', {});
    });

    it('should not dispatch any events if disabled', () => {
      const mockEventDispatcher = jasmine.createSpy('EventDispatcher');
      const list = button.onClick_(true, mockEventDispatcher, {} as any, {} as any);
      assert(Iterables.unsafeToArray(list)).to.equal([]);
      assert(mockEventDispatcher).toNot.haveBeenCalled();
    });
  });
});

