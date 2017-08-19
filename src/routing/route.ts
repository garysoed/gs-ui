/**
 * Represents a route in the app.
 *
 * @param <T> Enum type of the route factory.
 * @param <P> Type of the params.
 */
export type Route<T, P> = {
  readonly params: P,
  readonly path: string,
  readonly type: T,
};
