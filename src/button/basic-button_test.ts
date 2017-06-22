import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { BasicButton } from '../button/basic-button';


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
      const map = button.onClick_(
          false,
          mockEventDispatcher,
          {x, y} as MouseEvent,
          {id: actionTrackerId} as any);
      assert(map).to.haveElements([[actionTrackerId, {type: 'click', x, y}]]);
      assert(mockEventDispatcher).to.haveBeenCalledWith('gs-action', {});
    });

    it('should not dispatch any events if disabled', () => {
      const mockEventDispatcher = jasmine.createSpy('EventDispatcher');
      const map = button.onClick_(true, mockEventDispatcher, {} as any, {} as any);
      assert(map).to.haveElements([]);
      assert(mockEventDispatcher).toNot.haveBeenCalled();
    });
  });
});

