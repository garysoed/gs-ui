import { ImmutableList, ImmutableMap } from 'external/gs_tools/src/immutable';
import { Locations } from 'external/gs_tools/src/ui';

import { Route } from '../routing/route';


/**
 * Base class for all route factories.
 *
 * @param <T> Enum type of the route factories.
 * @param <CP> Parameters for the current part of the path.
 * @param <CR> Parameters for the entire path.
 * @param <PR> Full parameters of the parent path. CR = CP & CR.
 */
export abstract class AbstractRouteFactory<T, CP, CR extends CP & PR, PR> {
  protected readonly parent_: AbstractRouteFactory<T, any, PR, any> | null;
  protected readonly type_: T;

  /**
   * @param type Type of the route factory.
   * @param parent Parent of the route factory. This should match the prefix of any routes matching
   *    this factory. Null if there are no parents.
   */
  constructor(type: T, parent: AbstractRouteFactory<T, any, PR, any> | null = null) {
    this.type_ = type;
    this.parent_ = parent;
  }

  /**
   * @param params Params to create the path.
   * @return The path created from the given params.
   */
  create(params: CR): Route<T, CR> {
    return {
      params,
      path: this.getPath(params),
      type: this.type_,
    };
  }

  /**
   * @param path Path to create the route object from.
   * @return Route object matching the path, or null if there are none.
   */
  createFromPath(path: string): Route<T, CR> | null {
    const matches = Locations.getMatches(path, `${this.getMatcher_()}$`);
    return matches === null ? null : this.create(this.getMatchParams_(matches));
  }

  async getCascadeCrumbs(params: CR): Promise<{name: string, url: string}[]> {
    const crumbs: {name: string, url: string}[] = [];
    let current: AbstractRouteFactory<any, any, any, any> | null = this;
    while (current !== null) {
      crumbs.push({
        name: await current.getName(params),
        url: current.getPath(params),
      });
      current = current.parent_;
    }
    return [...ImmutableList.of(crumbs).reverse()];
  }

  /**
   * @param params Params to determine the name of the route.
   * @return Array of names of the current route and its ancestors. The oldest ancestors come
   *    first in the array.
   */
  getCascadeNames(params: CR): Promise<string>[] {
    const names: Promise<string>[] = [];
    let current: AbstractRouteFactory<any, any, any, any> | null = this;
    while (current !== null) {
      names.push(current.getName(params));
      current = current.parent_;
    }
    return [...ImmutableList.of(names).reverse()];
  }

  /**
   * @param params Params to create the paths.
   * @return Array of paths for the current route and its ancestors. The oldest ancestors come
   *    first in the array.
   */
  getCascadePaths(params: CR): string[] {
    const paths: string[] = [];
    let current: AbstractRouteFactory<any, any, any, any> | null = this;
    while (current !== null) {
      paths.push(current.getPath(params));
      current = current.parent_;
    }
    return [...ImmutableList.of(paths).reverse()];
  }

  /**
   * @return The full matcher for this factory.
   */
  private getMatcher_(): string {
    const currentMatcher = this.getRelativeMatcher_();
    if (this.parent_ === null) {
      return currentMatcher;
    } else {
      return `${this.parent_.getMatcher_()}${currentMatcher}`;
    }
  }

  /**
   * @param matches The key value of matches from the path.
   * @return Parsed object containing the matches that this factory and its ancestors can
   *    recognize.
   */
  private getMatchParams_(matches: ImmutableMap<string, string>): CR {
    const currentMatchParams = this.getRelativeMatchParams_(matches) as Object;
    if (this.parent_ !== null) {
      const matchParams = this.parent_.getMatchParams_(matches) as Object;
      return {...matchParams, ...currentMatchParams} as CR;
    } else {
      return currentMatchParams as CR;
    }
  }

  /**
   * @param params Param to generate the name.
   * @return Promise that will be resolved with the name of the route produced by the factory.
   */
  abstract getName(params: CR): Promise<string>;

  /**
   * @param params Params to generate the path.
   * @return Full path for the given param.
   */
  getPath(params: CR): string {
    const currentPath = this.getRelativePath_(params);
    if (this.parent_ === null) {
      return currentPath;
    } else {
      return `${this.parent_.getPath(params)}${currentPath}`;
    }
  }

  /**
   * @return Matcher string for this route factory. This should exclude matchers for the parent
   *    factories.
   */
  protected abstract getRelativeMatcher_(): string;

  /**
   * @param matches The key value of matches from the path.
   * @return Parsed object containing the matches that this factory can recognize.
   */
  protected abstract getRelativeMatchParams_(matches: ImmutableMap<string, string>): CP;

  /**
   * @param params Params to create the path.
   * @return Path created using the given params. This path is not prefixed by the path created
   *    by the ancestors.
   */
  protected abstract getRelativePath_(params: CP): string;

  /**
   * @return Type of the factory.
   */
  getType(): T {
    return this.type_;
  }
}
