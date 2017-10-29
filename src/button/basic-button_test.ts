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

  describe('activate_', () => {
    it('should dispatch the correct event', async () => {
      const mockDispatcher = jasmine.createSpy('Dispatcher');
      Graph.createProvider($.host.dispatch.getId(), mockDispatcher);
      Graph.createProvider($.host.disabled.getId(), false);

      await button['activate_'](Graph.getTimestamp());
      assert(mockDispatcher).to.haveBeenCalledWith('gs-action', null);
    });

    it('should not dispatch any events if disabled', async () => {
      const mockDispatcher = jasmine.createSpy('Dispatcher');
      Graph.createProvider($.host.dispatch.getId(), mockDispatcher);
      Graph.createProvider($.host.disabled.getId(), true);

      await button['activate_'](Graph.getTimestamp());
      assert(mockDispatcher).toNot.haveBeenCalled();
    });
  });

  describe('onAction_', () => {
    it('should activate correctly', async () => {
      spyOn(ActionTracker, 'set');
      spyOn(button, 'activate_');

      await button.onAction_();
      assert(ActionTracker.set).to.haveBeenCalledWith({type: 'keyboard'});
      assert(button['activate_']).to.haveBeenCalledWith(Graph.getTimestamp());
    });
  });

  describe('onClick_', () => {
    it('should activate correctly', async () => {
      const x = 123;
      const y = 456;

      spyOn(ActionTracker, 'set');
      spyOn(button, 'activate_');

      await button.onClick_({x, y} as any);
      assert(ActionTracker.set).to.haveBeenCalledWith({type: 'click', x, y});
      assert(button['activate_']).to.haveBeenCalledWith(Graph.getTimestamp());
    });
  });
});

