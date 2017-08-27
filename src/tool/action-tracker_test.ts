import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ActionTracker, MAX_ACTION_AGE_ } from '../tool/action-tracker';

describe('tool.ActionTracker', () => {
  describe('get', () => {
    it(`should return the last recorded action`, async () => {
      const action = {type: 'click' as 'click', x: 123, y: 456};
      const now = 123;
      spyOn(Date, 'now').and.returnValue(now);

      await ActionTracker.set(action);
      assert(await ActionTracker.get()).to.equal(action);
    });

    it(`should return null if the last recorded action was too old`, async () => {
      const action = {type: 'click' as 'click', x: 123, y: 456};
      const now = 123;
      const dateNowSpy = spyOn(Date, 'now').and.returnValue(now);
      await ActionTracker.set(action);

      dateNowSpy.and.returnValue(now + MAX_ACTION_AGE_ + 1);
      assert(await ActionTracker.get()).to.beNull();
    });
  });
});

