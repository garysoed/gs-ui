import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { Monad } from 'external/gs_tools/src/interfaces/monad';

import { Action, ActionTracker, MAX_ACTION_AGE_ } from '../tool/action-tracker';

describe('tool.ActionTracker', () => {
  let actionTracker: Monad<Action | null>;

  beforeEach(() => {
    actionTracker = ActionTracker(Mocks.object('instance'));
  });

  describe('get', () => {
    it(`should return the last recorded action`, () => {
      const action = Mocks.object('action');
      actionTracker.set(action);
      assert(actionTracker.get()).to.equal(action);
    });

    it(`should return null if the last recorded action was too old`, () => {
      const action = Mocks.object('action');
      const now = 123;
      const dateNowSpy = spyOn(Date, 'now').and.returnValue(now);
      actionTracker.set(action);

      dateNowSpy.and.returnValue(now + MAX_ACTION_AGE_ + 1);
      assert(actionTracker.get()).to.beNull();
    });
  });
});

