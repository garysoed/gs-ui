import { AbstractRouteFactory } from '../routing/abstract-route-factory';

export class FakeRouteFactory<T> extends AbstractRouteFactory<T, any, any, any> {
  async getName(): Promise<string> {
    return 'name';
  }

  protected getRelativeMatcher_(): string {
    return 'relativeMatcher';
  }

  protected getRelativeMatchParams_(): any {
    return {};
  }

  protected getRelativePath_(): string {
    return 'relativePath';
  }
}
