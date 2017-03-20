import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { Reflect } from 'external/gs_tools/src/util';

import { LocationServiceEvents } from 'external/gs_tools/src/ui';

import { RouteService } from './route-service';
import { RouteServiceEvents } from './route-service-events';


describe('routing.RouteService', () => {
  let mockRouteFactoryService;
  let mockLocationService;
  let service: RouteService<any>;

  beforeEach(() => {
    mockRouteFactoryService = jasmine.createSpyObj('RouteFactoryService', ['getFactories']);
    mockLocationService = Mocks.listenable('LocationService');
    mockLocationService.getPath = jasmine.createSpy('LocationService.getPath');
    service = new RouteService(mockLocationService, mockRouteFactoryService);
    TestDispose.add(mockLocationService, service);
  });

  describe('onLocationChanged_', () => {
    it('should dispatch the CHANGED event', () => {
      spyOn(service, 'dispatch');
      service['onLocationChanged_']();
      assert(service.dispatch).to.haveBeenCalledWith(RouteServiceEvents.CHANGED);
    });
  });

  describe('[Reflect.__initialize]', () => {
    it('should listen to the CHANGED event on the location service', () => {
      spyOn(mockLocationService, 'on').and.callThrough();

      mockRouteFactoryService.getFactories.and.returnValue([]);

      service[Reflect.__initialize]();

      assert(mockLocationService.on).to.haveBeenCalledWith(
          LocationServiceEvents.CHANGED,
          service['onLocationChanged_'],
          service);
    });

    it('should initialize the route factory map', () => {
      let type1 = Mocks.object('type1');
      let mockFactory1 = jasmine.createSpyObj('Factory1', ['getType']);
      mockFactory1.getType.and.returnValue(type1);

      let type2 = Mocks.object('type2');
      let mockFactory2 = jasmine.createSpyObj('Factory2', ['getType']);
      mockFactory2.getType.and.returnValue(type2);

      mockRouteFactoryService.getFactories.and.returnValue([mockFactory1, mockFactory2]);

      service[Reflect.__initialize]();

      assert(service['routeFactoryMap_']).to.haveEntries([
        [type1, mockFactory1],
        [type2, mockFactory2],
      ]);
    });
  });

  describe('getParams', () => {
    it('should return the correct params', () => {
      let path = 'path';
      spyOn(service, 'getPath').and.returnValue(path);

      let params = Mocks.object('params');
      let mockRoute = jasmine.createSpyObj('Route', ['getParams']);
      mockRoute.getParams.and.returnValue(params);

      let mockRouteFactory = jasmine.createSpyObj('RouteFactory', ['createFromPath']);
      mockRouteFactory.createFromPath.and.returnValue(mockRoute);

      assert(service.getParams(mockRouteFactory)).to.equal(params);
      assert(mockRouteFactory.createFromPath).to.haveBeenCalledWith(path);
    });

    it('should return null if the path does not match the route factory', () => {
      let path = 'path';
      spyOn(service, 'getPath').and.returnValue(path);

      let mockRouteFactory = jasmine.createSpyObj('RouteFactory', ['createFromPath']);
      mockRouteFactory.createFromPath.and.returnValue(null);

      assert(service.getParams(mockRouteFactory)).to.beNull();
      assert(mockRouteFactory.createFromPath).to.haveBeenCalledWith(path);
    });
  });

  describe('getPath', () => {
    it('should return the path', () => {
      let path = 'path';
      mockLocationService.getPath.and.returnValue(path);
      assert(service.getPath()).to.equal(path);
    });
  });

  describe('getRoute', () => {
    it('should return the first matching route', () => {
      let path = 'path';
      mockLocationService.getPath.and.returnValue(path);

      let route = Mocks.object('route');
      let mockFactory1 = jasmine.createSpyObj('Factory1', ['createFromPath']);
      mockFactory1.createFromPath.and.returnValue(null);

      let mockFactory2 = jasmine.createSpyObj('Factory2', ['createFromPath']);
      mockFactory2.createFromPath.and.returnValue(route);

      let mockFactory3 = jasmine.createSpyObj('Factory3', ['createFromPath']);
      mockFactory3.createFromPath.and.returnValue(Mocks.object('route2'));

      mockRouteFactoryService.getFactories.and.returnValue([
        mockFactory1,
        mockFactory2,
        mockFactory3,
      ]);

      assert(service.getRoute()).to.equal(route);
      assert(mockFactory1.createFromPath).to.haveBeenCalledWith(path);
      assert(mockFactory2.createFromPath).to.haveBeenCalledWith(path);
      assert(mockFactory3.createFromPath).toNot.haveBeenCalled();
    });

    it('should return null if there are no matching routes', () => {
      mockLocationService.getPath.and.returnValue('path');

      let mockFactory = jasmine.createSpyObj('Factory', ['createFromPath']);
      mockFactory.createFromPath.and.returnValue(null);

      mockRouteFactoryService.getFactories.and.returnValue([mockFactory]);

      assert(service.getRoute()).to.equal(null);
    });
  });

  describe('getRouteFactory', () => {
    it('should return the factory that matches the type', () => {
      let type = Mocks.object('type');
      let factory = Mocks.object('factory');
      service['routeFactoryMap_'].set(type, factory);
      assert(service.getRouteFactory(type)).to.equal(factory);
    });

    it('should return null if there are no factories matching the type', () => {
      assert(service.getRouteFactory('type')).to.equal(null);
    });
  });

  describe('goTo', () => {
    it('should go to the correct location', () => {
      let params = Mocks.object('params');

      let path = 'path';
      let mockRoute = jasmine.createSpyObj('Route', ['getPath']);
      mockRoute.getPath.and.returnValue(path);
      let mockRouteFactory = jasmine.createSpyObj('RouteFactory', ['create']);
      mockRouteFactory.create.and.returnValue(mockRoute);

      spyOn(service, 'goToPath');

      service.goTo(mockRouteFactory, params);

      assert(service.goToPath).to.haveBeenCalledWith(path);
      assert(mockRouteFactory.create).to.haveBeenCalledWith(params);
    });
  });

  describe('goToPath', () => {
    it('should navigate to the given path', () => {
      mockLocationService.goTo = jasmine.createSpy('LocationService#goTo');
      let path = 'path';
      service.goToPath(path);
      assert(mockLocationService.goTo).to.haveBeenCalledWith(path);
    });
  });
});
