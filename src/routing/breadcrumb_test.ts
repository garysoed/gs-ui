import {assert, TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {Breadcrumb, crumbDataGetter, crumbDataSetter, crumbGenerator} from './breadcrumb';
import {RouteServiceEvents} from './route-service-events';


describe('routing.Breadcrumb', () => {
  let breadcrumb: Breadcrumb<any>;
  let mockRouteService;

  beforeEach(() => {
    mockRouteService = Mocks.listenable('RouteService');
    TestDispose.add(mockRouteService);
    let mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    breadcrumb = new Breadcrumb<any>(mockRouteService, mockThemeService);
    TestDispose.add(breadcrumb);
  });

  describe('crumbGenerator', () => {
    it('should create the element correctly', () => {
      let mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      let mockRootEl = jasmine.createSpyObj('RootEl', ['appendChild', 'setAttribute']);
      mockRootEl.classList = mockClassList;

      let linkEl = Mocks.object('linkEl');
      let arrowEl = Mocks.object('arrowEl');
      let mockDocument = jasmine.createSpyObj('Document', ['createElement']);
      mockDocument.createElement.and.callFake((name: string) => {
        switch (name) {
          case 'div':
            return mockRootEl;
          case 'a':
            return linkEl;
          case 'gs-icon':
            return arrowEl;
        }
      });

      assert(crumbGenerator(mockDocument)).to.equal(mockRootEl);
      assert(mockRootEl.appendChild).to.haveBeenCalledWith(arrowEl);
      assert(mockRootEl.appendChild).to.haveBeenCalledWith(linkEl);
      assert(arrowEl.textContent).to.equal('keyboard_arrow_right');
      assert(mockRootEl.setAttribute).to.haveBeenCalledWith('flex-align', 'center');
      assert(mockRootEl.setAttribute).to.haveBeenCalledWith('layout', 'row');
      assert(mockClassList.add).to.haveBeenCalledWith('crumb');
    });
  });

  describe('crumbDataGetter', () => {
    it('should return the correct data', () => {
      const url = 'url';
      const name = 'name';
      const linkEl = Mocks.object('linkEl');
      linkEl.href = `#${url}`;
      linkEl.textContent = name;
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);
      assert(crumbDataGetter(mockElement)).to.equal({name, url});
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should return null if there are no text contents', () => {
      const url = 'url';
      const linkEl = Mocks.object('linkEl');
      linkEl.href = `#${url}`;
      linkEl.textContent = null;
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);
      assert(crumbDataGetter(mockElement)).to.beNull();
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should return null if the href does not start with #', () => {
      const linkEl = Mocks.object('linkEl');
      linkEl.href = `url`;
      linkEl.textContent = null;
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);
      assert(crumbDataGetter(mockElement)).to.beNull();
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });
  });

  describe('crumbDataSetter', () => {
    it('should set the data correctly', () => {
      let linkEl = Mocks.object('linkEl');
      let mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);

      let url = 'url';
      let name = 'name';
      crumbDataSetter({name: name, url: url}, mockElement);

      assert(linkEl.textContent).to.equal(name);
      assert(linkEl.href).to.equal(`#${url}`);
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });
  });

  describe('onRouteChanged_', () => {
    it('should set the bridge with the correct data', async (done: any) => {
      let name1 = 'name1';
      let url1 = 'url1';

      let name2 = 'name2';
      let url2 = 'url2';

      let mockRouteFactory =
          jasmine.createSpyObj('RouteFactory', ['getCascadeNames', 'getCascadePaths']);
      mockRouteFactory.getCascadeNames.and
          .returnValue([Promise.resolve(name1), Promise.resolve(name2)]);
      mockRouteFactory.getCascadePaths.and.returnValue([url1, url2]);

      let type = Mocks.object('type');
      let params = Mocks.object('params');
      let mockRoute = jasmine.createSpyObj('Route', ['getParams', 'getType']);
      mockRoute.getParams.and.returnValue(params);
      mockRoute.getType.and.returnValue(type);

      mockRouteService.getRouteFactory = jasmine.createSpy('RouteService.getRouteFactory')
          .and.returnValue(mockRouteFactory);
      mockRouteService.getRoute = jasmine.createSpy('RouteService.getRoute')
          .and.returnValue(mockRoute);

      spyOn(breadcrumb['crumbHook_'], 'set');

      await breadcrumb['onRouteChanged_']();
      assert(breadcrumb['crumbHook_'].set).to.haveBeenCalledWith([
        {name: name1, url: url1},
        {name: name2, url: url2},
      ]);
      assert(mockRouteFactory.getCascadePaths).to.haveBeenCalledWith(params);
      assert(mockRouteFactory.getCascadeNames).to.haveBeenCalledWith(params);
      assert(mockRouteService.getRouteFactory).to.haveBeenCalledWith(type);
    });

    it('should not update the bridge if the route factory cannot be found', async (done: any) => {
      let type = Mocks.object('type');
      let params = Mocks.object('params');
      let mockRoute = jasmine.createSpyObj('Route', ['getParams', 'getType']);
      mockRoute.getParams.and.returnValue(params);
      mockRoute.getType.and.returnValue(type);

      mockRouteService.getRouteFactory = jasmine.createSpy('RouteService.getRouteFactory')
          .and.returnValue(null);
      mockRouteService.getRoute = jasmine.createSpy('RouteService.getRoute')
          .and.returnValue(mockRoute);

      spyOn(breadcrumb['crumbHook_'], 'set');

      await breadcrumb['onRouteChanged_']();
      assert(breadcrumb['crumbHook_'].set).toNot.haveBeenCalled();
    });

    it('should not update the bridge if there are no routes', async (done: any) => {
      mockRouteService.getRoute = jasmine.createSpy('RouteService.getRoute')
          .and.returnValue(null);

      spyOn(breadcrumb['crumbHook_'], 'set');

      await breadcrumb['onRouteChanged_']();
      assert(breadcrumb['crumbHook_'].set).toNot.haveBeenCalled();
    });
  });

  describe('onCreated', () => {
    it('should listen to the CHANGED event', () => {
      spyOn(mockRouteService, 'on').and.callThrough();

      breadcrumb.onCreated(Mocks.object('element'));

      assert(mockRouteService.on).to.haveBeenCalledWith(
          RouteServiceEvents.CHANGED,
          breadcrumb['onRouteChanged_'],
          breadcrumb);
    });
  });

  describe('onInserted', () => {
    it('should call route changed method', () => {
      spyOn(breadcrumb, 'onRouteChanged_');

      breadcrumb.onInserted(Mocks.object('element'));

      assert(breadcrumb['onRouteChanged_']).to.haveBeenCalledWith();
    });
  });
});
