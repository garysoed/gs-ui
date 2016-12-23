import {Arrays} from 'external/gs_tools/src/collection';
import {Jsons} from 'external/gs_tools/src/collection';
import {Locations} from 'external/gs_tools/src/ui';

import {Route} from './route';


/**
 * Base class for all route factories.
 *
 * @param <T> Enum type of the route factories.
 * @param <A> Arguments for creating a route.
 * @param <P> Type of the parent route factory.
 */
export abstract class AbstractRouteFactory<T, PP, P extends PP> {
  protected readonly type_: T;
  protected readonly parent_: AbstractRouteFactory<T, any, PP> | null;

  /**
   * @param type Type of the route factory.
   * @param parent Parent of the route factory. This should match the prefix of any routes matching
   *    this factory. Null if there are no parents.
   */
  constructor(type: T, parent: AbstractRouteFactory<T, any, PP> | null = null) {
    this.type_ = type;
    this.parent_ = parent;
  }

  /**
   * @param matches The key value of matches from the path.
   * @return Parsed object containing the matches that this factory can recognize.
   */
  protected abstract getRelativeMatchParams_(matches: {[key: string]: string}): P;

  /**
   * @return Matcher string for this route factory. This should exclude matchers for the parent
   *    factories.
   */
  protected abstract getRelativeMatcher_(): string

  /**
   * @param params Params to create the path.
   * @return Path created using the given params. This path is not prefixed by the path created
   *    by the ancestors.
   */
  protected abstract getRelativePath_(params: P): string

  /**
   * @return The full matcher for this factory.
   */
  private getMatcher_(): string {
    let currentMatcher = this.getRelativeMatcher_();
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
  private getMatchParams_(matches: {[key: string]: string}): P {
    let currentMatchParams = this.getRelativeMatchParams_(matches);
    if (this.parent_ !== null) {
      Jsons.mixin(this.parent_.getMatchParams_(matches), currentMatchParams);
    }
    return currentMatchParams;
  }

  /**
   * @param params Params to create the path.
   * @return The path created from the given params.
   */
  create(params: P): Route<T, P> {
    return new Route(this.type_, this.getPath(params), params);
  }

  /**
   * @param path Path to create the route object from.
   * @return Route object matching the path, or null if there are none.
   */
  createFromPath(path: string) : Route<T, P> | null {
    let matches = Locations.getMatches(path, `${this.getMatcher_()}$`);
    return matches === null ? null : this.create(this.getMatchParams_(matches));
  }

  /**
   * @param params Params to determine the name of the route.
   * @return Array of names of the current route and its ancestors. The oldest ancestors come
   *    first in the array.
   */
  getCascadeNames(params: P): Promise<string>[] {
    let names: Promise<string>[] = [];
    let current: AbstractRouteFactory<any, any, any> | null = this;
    while (current !== null) {
      names.push(current.getName(params));
      current = current.parent_;
    }
    return Arrays
        .of(names)
        .reverse()
        .asArray();
  }

  /**
   * @param params Params to create the paths.
   * @return Array of paths for the current route and its ancestors. The oldest ancestors come
   *    first in the array.
   */
  getCascadePaths(params: P): string[] {
    let paths: string[] = [];
    let current: AbstractRouteFactory<any, any, any> | null = this;
    while (current !== null) {
      paths.push(current.getPath(params));
      current = current.parent_;
    }
    return Arrays
        .of(paths)
        .reverse()
        .asArray();
  }

  /**
   * @param params Param to generate the name.
   * @return Promise that will be resolved with the name of the route produced by the factory.
   */
  abstract getName(params: P): Promise<string>;

  /**
   * @param params Params to generate the path.
   * @return Full path for the given param.
   */
  getPath(params: P): string {
    let currentPath = this.getRelativePath_(params);
    if (this.parent_ === null) {
      return currentPath;
    } else {
      return `${this.parent_.getPath(params)}${currentPath}`;
    }
  }

  /**
   * @return Type of the factory.
   */
  getType(): T {
    return this.type_;
  }
}
