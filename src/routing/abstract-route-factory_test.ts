import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';

import { AbstractRouteFactory } from './abstract-route-factory';


const TYPE = Mocks.object('type');

class TestFactory extends AbstractRouteFactory<any, any, any, any> {
  constructor(parent: TestFactory | null) {
    super(TYPE, parent);
  }

  getName(_: any): Promise<string> {
    return Promise.resolve('');
  }

  getRelativeMatcher_(): any {
    return null;
  }

  getRelativeMatchParams_(_: any): any {
    return null;
  }

  getRelativePath_(_: any): any {
    return null;
  }
}

describe('routing.AbstractRouteFactory', () => {
  let parentFactory: TestFactory;
  let factory: TestFactory;

  beforeEach(() => {
    parentFactory = new TestFactory(null);
    factory = new TestFactory(parentFactory);
  });

  describe('getMatcher_', () => {
    it('should append the relative matchers for factories with parents', () => {
      const parentMatcher = 'parentMatcher';
      const matcher = 'matcher';
      spyOn(factory, 'getRelativeMatcher_').and.returnValue(matcher);
      spyOn(parentFactory, 'getMatcher_').and.returnValue(parentMatcher);

      assert(factory['getMatcher_']()).to.equal(`${parentMatcher}${matcher}`);
    });

    it('should return the correct matcher for factories with no parents', () => {
      const matcher = 'matcher';
      spyOn(parentFactory, 'getRelativeMatcher_').and.returnValue(matcher);

      assert(parentFactory['getMatcher_']()).to.equal(`${matcher}`);
    });
  });

  describe('getMatchParams_', () => {
    it('should mixin the params from the factory and its parent', () => {
      const matches = Mocks.object('matches');
      spyOn(factory, 'getRelativeMatchParams_').and.returnValue({key1: 'value1', key2: 'value2'});
      spyOn(parentFactory, 'getMatchParams_').and.returnValue({parentKey: 'parentValue'});

      assert(factory['getMatchParams_'](matches)).to.equal({
        key1: 'value1',
        key2: 'value2',
        parentKey: 'parentValue',
      });
      assert(factory['getRelativeMatchParams_']).to.haveBeenCalledWith(matches);
      assert(parentFactory['getMatchParams_']).to.haveBeenCalledWith(matches);
    });

    it('should return the correct params if the factory has no parents', () => {
      const matches = Mocks.object('matches');
      spyOn(parentFactory, 'getRelativeMatchParams_').and.returnValue({key: 'value'});

      assert(parentFactory['getMatchParams_'](matches)).to.equal({
        key: 'value',
      });
      assert(parentFactory['getRelativeMatchParams_']).to.haveBeenCalledWith(matches);
    });
  });

  describe('create', () => {
    it('should create the correct route', () => {
      const path = 'path';
      const params = Mocks.object('params');
      spyOn(factory, 'getPath').and.returnValue(path);

      assert(factory.create(params)).to.equal({
        params,
        path,
        type: TYPE,
      });
    });
  });

  describe('getCascadeNames', () => {
    it('should return the correct names', async () => {
      const name = 'name';
      spyOn(factory, 'getName').and.returnValue(Promise.resolve(name));

      const parentName = 'parentName';
      spyOn(parentFactory, 'getName').and.returnValue(Promise.resolve(parentName));

      const params = Mocks.object('params');
      const names = await Promise.all(factory.getCascadeNames(params));
      assert(names).to.equal([parentName, name]);
      assert(parentFactory.getName).to.haveBeenCalledWith(params);
      assert(factory.getName).to.haveBeenCalledWith(params);
    });
  });

  describe('getCascadePaths', () => {
    it('should return the correct paths', () => {
      const params = Mocks.object('params');

      const path = 'path';
      spyOn(factory, 'getPath').and.returnValue(path);

      const parentPath = 'parentPath';
      spyOn(parentFactory, 'getPath').and.returnValue(parentPath);

      assert(factory.getCascadePaths(params)).to.equal([parentPath, path]);
      assert(factory.getPath).to.haveBeenCalledWith(params);
      assert(parentFactory.getPath).to.haveBeenCalledWith(params);
    });
  });

  describe('getPath', () => {
    it('should append the paths if the factory has a parent', () => {
      const params = Mocks.object('params');
      const path = 'path';
      spyOn(factory, 'getRelativePath_').and.returnValue(path);

      const parentPath = 'parentPath';
      spyOn(parentFactory, 'getPath').and.returnValue(parentPath);

      assert(factory.getPath(params)).to.equal(`${parentPath}${path}`);
      assert(factory['getRelativePath_']).to.haveBeenCalledWith(params);
      assert(parentFactory['getPath']).to.haveBeenCalledWith(params);
    });

    it('should return the correct path if the factory has no parents', () => {
      const params = Mocks.object('params');
      const path = 'path';
      spyOn(parentFactory, 'getRelativePath_').and.returnValue(path);

      assert(parentFactory.getPath(params)).to.equal(path);
      assert(parentFactory['getRelativePath_']).to.haveBeenCalledWith(params);
    });
  });
});
