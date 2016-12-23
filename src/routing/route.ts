/**
 * Represents a route in the app.
 *
 * @param <T> Enum type of the route factory.
 * @param <A> Type of the params.
 */
export class Route<T, A> {
  private readonly path_: string;
  private readonly params_: A;
  private readonly type_: T;

  /**
   * @param path The path corresponding to the route.
   */
  constructor(type: T, path: string, params: A) {
    this.path_ = path;
    this.params_ = params;
    this.type_ = type;
  }

  /**
   * @return The params that matches the path.
   */
  getParams(): A {
    return this.params_;
  }

  /**
   * @return The path corresponding to the route.
   */
  getPath(): string {
    return this.path_;
  }

  /**
   * @return The type of the route factory producing this route.
   */
  getType(): T {
    return this.type_;
  }
}
