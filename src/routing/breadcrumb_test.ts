import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { Breadcrumb, CRUMB_DATA_HELPER } from './breadcrumb';
import { RouteServiceEvents } from './route-service-events';


describe('CRUMB_DATA_HELPER', () => {
  describe('create', () => {
    it('should create the element correctly', () => {
      const mockClassList = jasmine.createSpyObj('ClassList', ['add']);
      const mockRootEl = jasmine.createSpyObj('RootEl', ['appendChild', 'setAttribute']);
      mockRootEl.classList = mockClassList;

      const linkEl = Mocks.object('linkEl');
      const arrowEl = Mocks.object('arrowEl');
      const mockDocument = jasmine.createSpyObj('Document', ['createElement']);
      Fakes.build(mockDocument.createElement)
          .when('div').return(mockRootEl)
          .when('a').return(linkEl)
          .when('gs-icon').return(arrowEl);

      assert(CRUMB_DATA_HELPER.create(mockDocument, Mocks.object('instance'))).to.equal(mockRootEl);
      assert(mockRootEl.appendChild).to.haveBeenCalledWith(arrowEl);
      assert(mockRootEl.appendChild).to.haveBeenCalledWith(linkEl);
      assert(arrowEl.textContent).to.equal('keyboard_arrow_right');
      assert(mockRootEl.setAttribute).to.haveBeenCalledWith('flex-align', 'center');
      assert(mockRootEl.setAttribute).to.haveBeenCalledWith('layout', 'row');
      assert(mockClassList.add).to.haveBeenCalledWith('crumb');
    });
  });

  describe('get', () => {
    it('should return the correct data', () => {
      const url = 'url';
      const name = 'name';
      const linkEl = Mocks.object('linkEl');
      linkEl.href = `#${url}`;
      linkEl.textContent = name;
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);
      assert(CRUMB_DATA_HELPER.get(mockElement)).to.equal({name, url});
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should return null if there are no text contents', () => {
      const url = 'url';
      const linkEl = Mocks.object('linkEl');
      linkEl.href = `#${url}`;
      linkEl.textContent = null;
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);
      assert(CRUMB_DATA_HELPER.get(mockElement)).to.beNull();
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should return null if the href does not start with #', () => {
      const linkEl = Mocks.object('linkEl');
      linkEl.href = `url`;
      linkEl.textContent = null;
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);
      assert(CRUMB_DATA_HELPER.get(mockElement)).to.beNull();
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should return null if the link element cannot be found', () => {
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(null);
      assert(CRUMB_DATA_HELPER.get(mockElement)).to.equal(null);
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });
  });

  describe('set', () => {
    it('should set the data correctly', () => {
      const linkEl = Mocks.object('linkEl');
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);

      const url = 'url';
      const name = 'name';
      CRUMB_DATA_HELPER.set({name: name, url: url}, mockElement, Mocks.object('instance'));

      assert(linkEl.textContent).to.equal(name);
      assert(linkEl.href).to.equal(`#${url}`);
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should throw error if the link element cannot be found', () => {
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(null);

      assert(() => {
        CRUMB_DATA_HELPER.set({name: 'name', url: 'url'}, mockElement, Mocks.object('instance'));
      }).to.throwError(/element not found/);
    });
  });
});


describe('routing.Breadcrumb', () => {
  let breadcrumb: Breadcrumb<any>;
  let mockRouteService;

  beforeEach(() => {
    mockRouteService = Mocks.listenable('RouteService');
    TestDispose.add(mockRouteService);
    const mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    breadcrumb = new Breadcrumb<any>(mockRouteService, mockThemeService);
    TestDispose.add(breadcrumb);
  });

  describe('onRouteChanged_', () => {
    it('should set the bridge with the correct data', async () => {
      const name1 = 'name1';
      const url1 = 'url1';

      const name2 = 'name2';
      const url2 = 'url2';

      const mockRouteFactory =
          jasmine.createSpyObj('RouteFactory', ['getCascadeNames', 'getCascadePaths']);
      mockRouteFactory.getCascadeNames.and
          .returnValue([Promise.resolve(name1), Promise.resolve(name2)]);
      mockRouteFactory.getCascadePaths.and.returnValue([url1, url2]);

      const type = Mocks.object('type');
      const params = Mocks.object('params');
      const mockRoute = jasmine.createSpyObj('Route', ['getParams', 'getType']);
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

    it('should not update the bridge if the route factory cannot be found', async () => {
      const type = Mocks.object('type');
      const params = Mocks.object('params');
      const mockRoute = jasmine.createSpyObj('Route', ['getParams', 'getType']);
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

    it('should not update the bridge if there are no routes', async () => {
      mockRouteService.getRoute = jasmine.createSpy('RouteService.getRoute')
          .and.returnValue(null);

      spyOn(breadcrumb['crumbHook_'], 'set');

      await breadcrumb['onRouteChanged_']();
      assert(breadcrumb['crumbHook_'].set).toNot.haveBeenCalled();
    });
  });

  describe('onCreated', () => {
    it('should listen to the CHANGED event', () => {
      spyOn(breadcrumb, 'listenTo');

      breadcrumb.onCreated(Mocks.object('element'));

      assert(breadcrumb.listenTo).to.haveBeenCalledWith(
          mockRouteService,
          RouteServiceEvents.CHANGED,
          breadcrumb['onRouteChanged_']);
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
