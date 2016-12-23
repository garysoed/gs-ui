import {assert, TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from 'external/gs_tools/src/mock';

import {AbstractRouteFactory} from './abstract-route-factory';


const TYPE = Mocks.object('type');

class TestFactory extends AbstractRouteFactory<any, any, any> {
  constructor(parent: TestFactory | null) {
    super(TYPE, parent);
  }

  getRelativeMatchParams_(matches: any): any {
    return null;
  }

  getRelativeMatcher_(): any {
    return null;
  }

  getRelativePath_(params: any): any {
    return null;
  }

  getName(params: any): Promise<string> {
    return Promise.resolve();
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
      let parentMatcher = 'parentMatcher';
      let matcher = 'matcher';
      spyOn(factory, 'getRelativeMatcher_').and.returnValue(matcher);
      spyOn(parentFactory, 'getMatcher_').and.returnValue(parentMatcher);

      assert(factory['getMatcher_']()).to.equal(`${parentMatcher}${matcher}`);
    });

    it('should return the correct matcher for factories with no parents', () => {
      let matcher = 'matcher';
      spyOn(parentFactory, 'getRelativeMatcher_').and.returnValue(matcher);

      assert(parentFactory['getMatcher_']()).to.equal(`${matcher}`);
    });
  });

  describe('getMatchParams_', () => {
    it('should mixin the params from the factory and its parent', () => {
      let matches = Mocks.object('matches');
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
      let matches = Mocks.object('matches');
      spyOn(parentFactory, 'getRelativeMatchParams_').and.returnValue({key: 'value'});

      assert(parentFactory['getMatchParams_'](matches)).to.equal({
        key: 'value',
      });
      assert(parentFactory['getRelativeMatchParams_']).to.haveBeenCalledWith(matches);
    });
  });

  describe('create', () => {
    it('should create the correct route', () => {
      let path = 'path';
      let params = Mocks.object('params');
      spyOn(factory, 'getPath').and.returnValue(path);

      let route = factory.create(params);
      assert(route.getParams()).to.equal(params);
      assert(route.getPath()).to.equal(path);
      assert(route.getType()).to.equal(TYPE);
    });
  });

  describe('getCascadeNames', () => {
    it('should return the correct names', (done: any) => {
      let name = 'name';
      spyOn(factory, 'getName').and.returnValue(Promise.resolve(name));

      let parentName = 'parentName';
      spyOn(parentFactory, 'getName').and.returnValue(Promise.resolve(parentName));

      let params = Mocks.object('params');
      Promise
          .all(factory.getCascadeNames(params))
          .then((names: string[]) => {
            assert(names).to.equal([parentName, name]);
            assert(parentFactory.getName).to.haveBeenCalledWith(params);
            assert(factory.getName).to.haveBeenCalledWith(params);
            done();
          }, done.fail);
    });
  });

  describe('getCascadePaths', () => {
    it('should return the correct paths', () => {
      let params = Mocks.object('params');

      let path = 'path';
      spyOn(factory, 'getPath').and.returnValue(path);

      let parentPath = 'parentPath';
      spyOn(parentFactory, 'getPath').and.returnValue(parentPath);

      assert(factory.getCascadePaths(params)).to.equal([parentPath, path]);
      assert(factory.getPath).to.haveBeenCalledWith(params);
      assert(parentFactory.getPath).to.haveBeenCalledWith(params);
    });
  });

  describe('getPath', () => {
    it('should append the paths if the factory has a parent', () => {
      let params = Mocks.object('params');
      let path = 'path';
      spyOn(factory, 'getRelativePath_').and.returnValue(path);

      let parentPath = 'parentPath';
      spyOn(parentFactory, 'getPath').and.returnValue(parentPath);

      assert(factory.getPath(params)).to.equal(`${parentPath}${path}`);
      assert(factory['getRelativePath_']).to.haveBeenCalledWith(params);
      assert(parentFactory['getPath']).to.haveBeenCalledWith(params);
    });

    it('should return the correct path if the factory has no parents', () => {
      let params = Mocks.object('params');
      let path = 'path';
      spyOn(parentFactory, 'getRelativePath_').and.returnValue(path);

      assert(parentFactory.getPath(params)).to.equal(path);
      assert(parentFactory['getRelativePath_']).to.haveBeenCalledWith(params);
    });
  });
});
