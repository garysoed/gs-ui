import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableList, ImmutableMap } from 'external/gs_tools/src/immutable';

import { providesMatch, providesRouteFactoryMap } from '../routing/route-graph';


describe('routing.route-graph.providesMatch', () => {
  it(`should return the correct route`, () => {
    const path = 'path';
    const mockFactory1 = jasmine.createSpyObj('Factory1', ['createFromPath']);
    mockFactory1.createFromPath.and.returnValue(null);

    const route = Mocks.object('route');
    const mockFactory2 = jasmine.createSpyObj('Factory2', ['createFromPath']);
    mockFactory2.createFromPath.and.returnValue(route);
    const map = ImmutableMap.of([
      [Mocks.object('view1'), mockFactory1],
      [Mocks.object('view2'), mockFactory2],
    ]);

    assert(providesMatch(path, map)).to.equal(route);
    assert(mockFactory1.createFromPath).to.haveBeenCalledWith(path);
    assert(mockFactory2.createFromPath).to.haveBeenCalledWith(path);
  });

  it(`should return null if none of the route factory maps produces any routes`, () => {
    const path = 'path';
    const mockFactory = jasmine.createSpyObj('Factory', ['createFromPath']);
    mockFactory.createFromPath.and.returnValue(null);

    const map = ImmutableMap.of([
      [Mocks.object('view'), mockFactory],
    ]);

    assert(providesMatch(path, map)).to.beNull();
    assert(mockFactory.createFromPath).to.haveBeenCalledWith(path);
  });
});

describe('routing.route-graph.providesRouteFactoryMap', () => {
  it(`should return the correct map`, () => {
    const type1 = Mocks.object('type1');
    const mockFactory1 = jasmine.createSpyObj('Factory1', ['getType']);
    mockFactory1.getType.and.returnValue(type1);

    const type2 = Mocks.object('type2');
    const mockFactory2 = jasmine.createSpyObj('Factory2', ['getType']);
    mockFactory2.getType.and.returnValue(type2);

    const routeFactories = ImmutableList.of([mockFactory1, mockFactory2]);

    assert(providesRouteFactoryMap(routeFactories)).to.haveElements([
      [type1, mockFactory1],
      [type2, mockFactory2],
    ]);
  });
});
