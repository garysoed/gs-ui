import {AbstractRouteFactory} from './abstract-route-factory';


export class SimpleRouteFactory<T, PR>
    extends AbstractRouteFactory<T, {}, PR, PR> {
  private readonly path_: string;
  private readonly name_: string;

  constructor(
      type: T,
      path: string,
      name: string,
      parent: AbstractRouteFactory<T, {}, PR, any> | null = null) {
    super(type, parent);
    this.path_ = path;
    this.name_ = name;
  }

  /**
   * @override
   */
  protected getRelativeMatchParams_(matches: {[key: string]: string}): {} {
    return {};
  }

  /**
   * @override
   */
  protected getRelativeMatcher_(): string {
    return this.getRelativePath_();
  }

  /**
   * @override
   */
  protected getRelativePath_(): string {
    return this.path_;
  }

  /**
   * @override
   */
  getName(): Promise<string> {
    return Promise.resolve(this.name_);
  }
}
