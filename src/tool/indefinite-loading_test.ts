import { assert, TestBase } from '../test-base';
TestBase.setup();

import { TestDispose } from 'external/gs_tools/src/testing';

import { IndefiniteLoading } from './indefinite-loading';


describe('tool.IndefiniteLoading', () => {
  let loading: IndefiniteLoading;

  beforeEach(() => {
    loading = new IndefiniteLoading();
    TestDispose.add(loading);
  });

  describe('onCreated', () => {
    it('should add the gs-action class', () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      loading.onCreated({classList: mockClassList} as HTMLElement);
      assert(mockClassList.add).to.haveBeenCalledWith('gs-action');
    });
  });
});
