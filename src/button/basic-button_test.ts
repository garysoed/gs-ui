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
      const mockEventDispatcher = jasmine.createSpy('EventDispatcher');
      button.onClick_(false, mockEventDispatcher);
      assert(mockEventDispatcher).to.haveBeenCalledWith('gs-action', {});
    });

    it('should not dispatch any events if disabled', () => {
      const mockEventDispatcher = jasmine.createSpy('EventDispatcher');
      button.onClick_(true, mockEventDispatcher);
      assert(mockEventDispatcher).toNot.haveBeenCalled();
    });
  });
});

