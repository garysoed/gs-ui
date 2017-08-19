import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { LocationService } from 'external/gs_tools/src/ui';

import { AbstractRouteFactory } from '../routing/abstract-route-factory';
import { RouteNavigator } from '../routing/route-navigator';


describe('routing.RouteNavigator', () => {
  let routeFactories: AbstractRouteFactory<any, any, any, any>[];
  let navigator: RouteNavigator<any>;

  beforeEach(() => {
    routeFactories = [];
    navigator = new RouteNavigator<any>(routeFactories, null);
  });

  describe('getMatch', () => {
    it(`should return the route that can be created from the path from the factory`, () => {
      const route = Mocks.object('route');
      const mockFactory1 = jasmine.createSpyObj('Factory1', ['createFromPath']);
      mockFactory1.createFromPath.and.returnValue(null);
      const mockFactory2 = jasmine.createSpyObj('Factory2', ['createFromPath']);
      mockFactory2.createFromPath.and.returnValue(route);
      routeFactories.push(mockFactory1, mockFactory2);

      const path = 'path';
      spyOn(LocationService, 'getPath').and.returnValue(path);

      assert(navigator.getMatch()).to.equal(route);
      assert(mockFactory1.createFromPath).to.haveBeenCalledWith(path);
      assert(mockFactory2.createFromPath).to.haveBeenCalledWith(path);
    });

    it(`should return null if there are no factories that are compatible with the route`, () => {
      const mockFactory = jasmine.createSpyObj('Factory1', ['createFromPath']);
      mockFactory.createFromPath.and.returnValue(null);
      routeFactories.push(mockFactory);

      const path = 'path';
      spyOn(LocationService, 'getPath').and.returnValue(path);

      assert(navigator.getMatch()).to.beNull();
      assert(mockFactory.createFromPath).to.haveBeenCalledWith(path);
    });
  });

  describe('getRoute', () => {
    it(`should return the correct route object`, () => {
      const path = 'path';
      spyOn(LocationService, 'getPath').and.returnValue(path);

      const route = Mocks.object('route');
      const mockFactory = jasmine.createSpyObj('Factory', ['createFromPath']);
      mockFactory.createFromPath.and.returnValue(route);

      assert(navigator.getRoute(mockFactory)).to.equal(route);
      assert(mockFactory.createFromPath).to.haveBeenCalledWith(path);
    });
  });

  describe('goTo', () => {
    it(`should return a new navigator with the correct destination`, () => {
      const route = Mocks.object('route');
      const mockFactory = jasmine.createSpyObj('Factory', ['create']);
      mockFactory.create.and.returnValue(route);
      const params = Mocks.object('params');

      const newNavigator = navigator.goTo(mockFactory, params);
      assert(newNavigator.getDestination()).to.equal(route);
      assert(mockFactory.create).to.haveBeenCalledWith(params);
    });
  });
});
