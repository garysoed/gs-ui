import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { BasicButton } from '../button';


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
      const actionTrackerId = 'actionTrackerId';
      const mockEventDispatcher = jasmine.createSpy('EventDispatcher');
      const list = button.onClick_(
          false,
          mockEventDispatcher,
          {x, y} as MouseEvent,
          {id: actionTrackerId} as any);
      assert(list).to.haveElements([Matchers.monadSetterWith({type: 'click', x, y})]);
      assert(mockEventDispatcher).to.haveBeenCalledWith('gs-action', {});
    });

    it('should not dispatch any events if disabled', () => {
      const mockEventDispatcher = jasmine.createSpy('EventDispatcher');
      const list = button.onClick_(true, mockEventDispatcher, {} as any, {} as any);
      assert(list).to.haveElements([]);
      assert(mockEventDispatcher).toNot.haveBeenCalled();
    });
  });
});

