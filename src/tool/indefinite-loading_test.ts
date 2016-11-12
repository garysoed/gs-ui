import {assert, TestBase} from '../test-base';
TestBase.setup();

import {TestDispose} from 'external/gs_tools/src/testing';

import {IndefiniteLoading} from './indefinite-loading';


describe('tool.IndefiniteLoading', () => {
  let loading;

  beforeEach(() => {
    loading = new IndefiniteLoading();
    TestDispose.add(loading);
  });

  describe('onCreated', () => {
    it('should add the gs-action class', () => {
      let mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      loading.onCreated({classList: mockClassList});
      assert(mockClassList.add).to.haveBeenCalledWith('gs-action');
    });
  });
});
