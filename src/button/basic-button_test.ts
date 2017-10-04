import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';

import { BasicButton } from '../button';
import { $ } from '../button/basic-button';
import { ActionTracker } from '../tool';

describe('button.BasicButton HTMLElement', () => {
  let button: BasicButton;

  beforeEach(() => {
    Graph.clearAllNodesForTest();
    button = new BasicButton(Mocks.object('ThemeService'));
    TestDispose.add(button);
  });

  describe('onClick_', () => {
    it('should dispatch the correct event', async () => {
      const x = 123;
      const y = 456;
      const mockDispatcher = jasmine.createSpy('Dispatcher');
      Graph.createProvider($.host.dispatch.getId(), mockDispatcher);
      Graph.createProvider($.host.disabled.getId(), false);

      spyOn(ActionTracker, 'set');

      await button.onClick_({x, y} as any);
      assert(ActionTracker.set).to.haveBeenCalledWith({type: 'click', x, y});
      assert(mockDispatcher).to.haveBeenCalledWith('gs-action', null);
    });

    it('should not dispatch any events if disabled', async () => {
      const x = 123;
      const y = 456;
      const mockDispatcher = jasmine.createSpy('Dispatcher');
      Graph.createProvider($.host.dispatch.getId(), mockDispatcher);
      Graph.createProvider($.host.disabled.getId(), true);

      spyOn(ActionTracker, 'set');

      await button.onClick_({x, y} as any);
      assert(ActionTracker.set).toNot.haveBeenCalled();
      assert(mockDispatcher).toNot.haveBeenCalled();
    });
  });
});

