import { ImmutableMap } from 'external/gs_tools/src/immutable';

import { AbstractRouteFactory } from '../routing/abstract-route-factory';
import { FakeRouteFactory } from '../routing/fake-route-factory';
import { IRouteFactoryService } from '../routing/i-route-factory-service';

export class FakeRouteFactoryService<T> implements IRouteFactoryService<T> {
  constructor(private readonly factories_: Iterable<AbstractRouteFactory<T, any, any, any>>) { }

  getFactories(): Iterable<AbstractRouteFactory<T, any, any, any>> {
    return this.factories_;
  }

  static create<T>(factoryMap: Iterable<[string, T]>): FakeRouteFactoryService<T> {
    const factories = ImmutableMap.of([...factoryMap])
        .map((type: T) => new FakeRouteFactory(type));
    const service = new FakeRouteFactoryService(factories.values());

    for (const [key] of factoryMap) {
      service[key] = () => factories.get(key);
    }

    return service;
  }
}
