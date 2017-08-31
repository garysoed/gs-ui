import {
  AnyType,
  FiniteIterableOfType,
  HasPropertiesType,
  InstanceofType,
  IterableOfType,
  NullableType,
  StringType,
  TupleOfType} from 'external/gs_tools/src/check';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location } from 'external/gs_tools/src/ui';

import { AbstractRouteFactory } from '../routing/abstract-route-factory';
import { Route } from '../routing/route';

type RouteFactory<T> = AbstractRouteFactory<T, any, any, any>;
type RouteFactoryMap<T> = ImmutableMap<T, RouteFactory<T>>;

export const $route = {
  match: staticId(
      'match',
      NullableType(
          HasPropertiesType({
            params: AnyType(),
            path: StringType,
            type: AnyType(),
          }))),
  routeFactories: staticId(
      'routeFactories',
      IterableOfType<RouteFactory<any>, Iterable<RouteFactory<any>>>(
          InstanceofType<RouteFactory<any>>(AbstractRouteFactory)),
  ),
  routeFactoryMap: staticId(
      'routeFactoryMap',
      FiniteIterableOfType<[any, RouteFactory<any>], ImmutableMap<any, RouteFactory<any>>>(
          TupleOfType<any, RouteFactory<any>>([
            AnyType(),
            InstanceofType<RouteFactory<any>>(AbstractRouteFactory),
          ]))),
};

export function providesMatch<T>(
    path: string,
    routeFactoryMap: RouteFactoryMap<T>): Route<T, any> | null {
  for (const [, factory] of routeFactoryMap) {
    const route = factory.createFromPath(path);
    if (route !== null) {
      return route;
    }
  }

  return null;
}
Graph.registerProvider($route.match, true, providesMatch, $location.path, $route.routeFactoryMap);

export function providesRouteFactoryMap<T>(
    routeFactories: Iterable<RouteFactory<T>>): RouteFactoryMap<T> {
  return ImmutableMap.of(
      ImmutableSet.of([...routeFactories])
          .mapItem((factory: RouteFactory<T>) => {
            return [factory.getType(), factory] as [T, RouteFactory<T>];
          }));
}
Graph.registerProvider(
    $route.routeFactoryMap,
    true,
    providesRouteFactoryMap,
    $route.routeFactories);

export const routeFactoriesProvider = Graph.createProvider(
    $route.routeFactories,
    ImmutableSet.of<RouteFactory<any>>([]));