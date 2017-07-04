import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { Reflect } from 'external/gs_tools/src/util';

import { LocationService, LocationServiceEvents } from 'external/gs_tools/src/ui';

import { RouteService } from './route-service';
import { RouteServiceEvents } from './route-service-events';


describe('routing.RouteService', () => {
  let mockRouteFactoryService: any;
  let service: RouteService<any>;

  beforeEach(() => {
    mockRouteFactoryService = jasmine.createSpyObj('RouteFactoryService', ['getFactories']);
    service = new RouteService(mockRouteFactoryService);
    TestDispose.add(service);
  });

  describe('[Reflect.__initialize]', () => {
    it('should listen to the CHANGED event on the location service', () => {
      const mockDisposable = jasmine.createSpyObj('Disposable', ['dispose']);
      spyOn(LocationService, 'on').and.returnValue(mockDisposable);
      spyOn(service, 'addDisposable').and.callThrough();

      const type1 = Mocks.object('type1');
      const mockFactory1 = jasmine.createSpyObj('Factory1', ['getType']);
      mockFactory1.getType.and.returnValue(type1);

      const type2 = Mocks.object('type2');
      const mockFactory2 = jasmine.createSpyObj('Factory2', ['getType']);
      mockFactory2.getType.and.returnValue(type2);

      mockRouteFactoryService.getFactories.and.returnValue([mockFactory1, mockFactory2]);

      service[Reflect.__initialize]();

      assert(LocationService.on).to.haveBeenCalledWith(
          LocationServiceEvents.CHANGED,
          service['onLocationChanged_'],
          service);
      assert(service.addDisposable).to.haveBeenCalledWith(mockDisposable);

      assert(service['routeFactoryMap_']).to.haveEntries([
        [type1, mockFactory1],
        [type2, mockFactory2],
      ]);
    });
  });

  describe('onLocationChanged_', () => {
    it('should dispatch the CHANGED event', () => {
      spyOn(service, 'dispatch');
      service['onLocationChanged_']();
      assert(service.dispatch).to.haveBeenCalledWith({type: RouteServiceEvents.CHANGED});
    });
  });

  describe('getParams', () => {
    it('should return the correct params', () => {
      const path = 'path';
      spyOn(service, 'getPath').and.returnValue(path);

      const params = Mocks.object('params');
      const mockRoute = jasmine.createSpyObj('Route', ['getParams']);
      mockRoute.getParams.and.returnValue(params);

      const mockRouteFactory = jasmine.createSpyObj('RouteFactory', ['createFromPath']);
      mockRouteFactory.createFromPath.and.returnValue(mockRoute);

      assert(service.getParams(mockRouteFactory)).to.equal(params);
      assert(mockRouteFactory.createFromPath).to.haveBeenCalledWith(path);
    });

    it('should return null if the path does not match the route factory', () => {
      const path = 'path';
      spyOn(service, 'getPath').and.returnValue(path);

      const mockRouteFactory = jasmine.createSpyObj('RouteFactory', ['createFromPath']);
      mockRouteFactory.createFromPath.and.returnValue(null);

      assert(service.getParams(mockRouteFactory)).to.beNull();
      assert(mockRouteFactory.createFromPath).to.haveBeenCalledWith(path);
    });
  });

  describe('getPath', () => {
    it('should return the path', () => {
      const path = 'path';
      spyOn(LocationService, 'getPath').and.returnValue(path);
      assert(service.getPath()).to.equal(path);
    });
  });

  describe('getRoute', () => {
    it('should return the first matching route', () => {
      const path = 'path';
      spyOn(LocationService, 'getPath').and.returnValue(path);

      const route = Mocks.object('route');
      const mockFactory1 = jasmine.createSpyObj('Factory1', ['createFromPath']);
      mockFactory1.createFromPath.and.returnValue(null);

      const mockFactory2 = jasmine.createSpyObj('Factory2', ['createFromPath']);
      mockFactory2.createFromPath.and.returnValue(route);

      const mockFactory3 = jasmine.createSpyObj('Factory3', ['createFromPath']);
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
      spyOn(LocationService, 'getPath').and.returnValue('path');

      const mockFactory = jasmine.createSpyObj('Factory', ['createFromPath']);
      mockFactory.createFromPath.and.returnValue(null);

      mockRouteFactoryService.getFactories.and.returnValue([mockFactory]);

      assert(service.getRoute()).to.equal(null);
    });
  });

  describe('getRouteFactory', () => {
    it('should return the factory that matches the type', () => {
      const type = Mocks.object('type');
      const factory = Mocks.object('factory');
      service['routeFactoryMap_'].set(type, factory);
      assert(service.getRouteFactory(type)).to.equal(factory);
    });

    it('should return null if there are no factories matching the type', () => {
      assert(service.getRouteFactory('type')).to.equal(null);
    });
  });

  describe('goTo', () => {
    it('should go to the correct location', () => {
      const params = Mocks.object('params');

      const path = 'path';
      const mockRoute = jasmine.createSpyObj('Route', ['getPath']);
      mockRoute.getPath.and.returnValue(path);
      const mockRouteFactory = jasmine.createSpyObj('RouteFactory', ['create']);
      mockRouteFactory.create.and.returnValue(mockRoute);

      spyOn(service, 'goToPath');

      service.goTo(mockRouteFactory, params);

      assert(service.goToPath).to.haveBeenCalledWith(path);
      assert(mockRouteFactory.create).to.haveBeenCalledWith(params);
    });
  });

  describe('goToPath', () => {
    it('should navigate to the given path', () => {
      spyOn(LocationService, 'goTo');
      const path = 'path';
      service.goToPath(path);
      assert(LocationService.goTo).to.haveBeenCalledWith(path);
    });
  });
});
