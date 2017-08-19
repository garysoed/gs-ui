import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';
import { Reflect } from 'external/gs_tools/src/util';

import { LocationService, LocationServiceEvents } from 'external/gs_tools/src/ui';

import { RouteServiceEvents } from '../const';
import { RouteService } from '../routing';


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

  describe('monad', () => {
    it(`should return the correct monad`, () => {
      const monad = service.monad();
      const path = 'path';
      const mockNavigator = jasmine.createSpyObj('Navigator', ['getDestination']);
      mockNavigator.getDestination.and.returnValue({path});

      spyOn(LocationService, 'goTo');

      monad.set(mockNavigator);
      assert(LocationService.goTo).to.haveBeenCalledWith(path);
    });

    it(`should not goTo any locations if there are no destinations set`, () => {
      const monad = service.monad();
      const mockNavigator = jasmine.createSpyObj('Navigator', ['getDestination']);
      mockNavigator.getDestination.and.returnValue(null);

      spyOn(LocationService, 'goTo');

      monad.set(mockNavigator);
      assert(LocationService.goTo).toNot.haveBeenCalled();
    });
  });

  describe('onLocationChanged_', () => {
    it('should dispatch the CHANGED event', () => {
      spyOn(service, 'dispatch');
      service['onLocationChanged_']();
      assert(service.dispatch).to.haveBeenCalledWith({type: RouteServiceEvents.CHANGED});
    });
  });
});
