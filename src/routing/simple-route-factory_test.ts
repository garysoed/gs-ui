import {assert, TestBase} from '../test-base';
TestBase.setup();

import {SimpleRouteFactory} from './simple-route-factory';


describe('routing.SimpleRouteFactory', () => {
  const NAME = 'NAME';
  const PATH = 'PATH';
  let factory: SimpleRouteFactory<any>;

  beforeEach(() => {
    factory = new SimpleRouteFactory<any>('type', PATH, NAME);
  });

  describe('getRelativeMatchParams_', () => {
    it('should return empty object', () => {
      assert(factory['getRelativeMatchParams_']({})).to.equal({});
    });
  });

  describe('getRelativeMatcher_', () => {
    it('should return the path', () => {
      assert(factory['getRelativeMatcher_']()).to.equal(PATH);
    });
  });

  describe('getRelativePath_', () => {
    it('should return the correct path', () => {
      assert(factory['getRelativePath_']()).to.equal(PATH);
    });
  });

  describe('getName', () => {
    it('should resolve with the correct name', (done: any) => {
      factory.getName()
          .then((name: string) => {
            assert(name).to.equal(NAME);
            done();
          }, done.fail);
    });
  });
});
