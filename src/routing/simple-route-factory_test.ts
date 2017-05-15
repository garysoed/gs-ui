import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableMap } from 'external/gs_tools/src/immutable';

import { SimpleRouteFactory } from '../routing/simple-route-factory';


describe('routing.SimpleRouteFactory', () => {
  const NAME = 'NAME';
  const PATH = 'PATH';
  let factory: SimpleRouteFactory<any, any>;

  beforeEach(() => {
    factory = new SimpleRouteFactory<any, any>('type', PATH, NAME);
  });

  describe('getRelativeMatchParams_', () => {
    it('should return empty object', () => {
      assert(factory['getRelativeMatchParams_'](ImmutableMap.of<string, string>([]))).to.equal({});
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
    it('should resolve with the correct name', async () => {
      const name = await factory.getName();
      assert(name).to.equal(NAME);
    });
  });
});
