import {assert, TestBase} from '../test-base';
TestBase.setup();

import {IndefiniteLoading} from './indefinite-loading';
import {TestDispose} from '../../external/gs_tools/src/testing';


describe('tool.IndefiniteLoading', () => {
  let loading;

  beforeEach(() => {
    loading = new IndefiniteLoading();
    TestDispose.add(loading);
  });

  describe('onCreated', () => {
    fit('should add the gs-action class', () => {
      let mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      loading.onCreated({classList: mockClassList});
      assert(mockClassList.add).to.haveBeenCalledWith('gs-action');
    });
  });
});
