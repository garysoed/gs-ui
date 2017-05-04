/**
 * Represents a route in the app.
 *
 * @param <T> Enum type of the route factory.
 * @param <P> Type of the params.
 */
export class Route<T, P> {
  private readonly params_: P;
  private readonly path_: string;
  private readonly type_: T;

  /**
   * @param path The path corresponding to the route.
   */
  constructor(type: T, path: string, params: P) {
    this.path_ = path;
    this.params_ = params;
    this.type_ = type;
  }

  /**
   * @return The params that matches the path.
   */
  getParams(): P {
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
