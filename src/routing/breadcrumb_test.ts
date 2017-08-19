import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeMonadSetter } from 'external/gs_tools/src/event';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { Breadcrumb, FakeRouteNavigator } from '../routing';
import { CRUMB_CHILDREN_CONFIG, CrumbData } from '../routing/breadcrumb';


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

      assert(CRUMB_CHILDREN_CONFIG.bridge.create(mockDocument))
          .to.equal(mockRootEl);
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
      assert(CRUMB_CHILDREN_CONFIG.bridge.get(mockElement)).to.equal({name, url});
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should return null if there are no text contents', () => {
      const url = 'url';
      const linkEl = Mocks.object('linkEl');
      linkEl.href = `#${url}`;
      linkEl.textContent = null;
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);
      assert(CRUMB_CHILDREN_CONFIG.bridge.get(mockElement)).to.beNull();
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should return null if the href does not start with #', () => {
      const linkEl = Mocks.object('linkEl');
      linkEl.href = `url`;
      linkEl.textContent = null;
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(linkEl);
      assert(CRUMB_CHILDREN_CONFIG.bridge.get(mockElement)).to.beNull();
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should return null if the link element cannot be found', () => {
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(null);
      assert(CRUMB_CHILDREN_CONFIG.bridge.get(mockElement)).to.equal(null);
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
      CRUMB_CHILDREN_CONFIG.bridge.set({name: name, url: url}, mockElement);

      assert(linkEl.textContent).to.equal(name);
      assert(linkEl.href).to.equal(`#${url}`);
      assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    });

    it('should throw error if the link element cannot be found', () => {
      const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
      mockElement.querySelector.and.returnValue(null);

      assert(() => {
        CRUMB_CHILDREN_CONFIG.bridge.set({name: 'name', url: 'url'}, mockElement);
      }).to.throwError(/element not found/);
    });
  });
});


describe('routing.Breadcrumb', () => {
  let breadcrumb: Breadcrumb<any>;
  let mockRouteService: any;

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

      mockRouteService.getRouteFactory = jasmine.createSpy('RouteService.getRouteFactory')
          .and.returnValue(mockRouteFactory);

      const fakeCrumbSetter = new FakeMonadSetter<ImmutableList<CrumbData>>(ImmutableList.of([]));
      const fakeRouteNavigator = new FakeRouteNavigator([
        [/.*/, {params, type}] as any,
      ]);

      const list = await breadcrumb.onRouteChanged_(fakeRouteNavigator, fakeCrumbSetter);
      assert(fakeCrumbSetter.findValue(list)!.value).to.haveElements([
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

      const fakeCrumbSetter = new FakeMonadSetter<ImmutableList<CrumbData>>(ImmutableList.of([]));
      const fakeRouteNavigator = new FakeRouteNavigator([
        [/.*/, {params, type}] as any,
      ]);

      const list = await breadcrumb.onRouteChanged_(fakeRouteNavigator, fakeCrumbSetter);
      assert([...list]).to.equal([]);
    });

    it('should not update the bridge if there are no matches', async () => {
      const fakeCrumbSetter = new FakeMonadSetter<ImmutableList<CrumbData>>(ImmutableList.of([]));
      const fakeRouteNavigator = new FakeRouteNavigator();

      const list = await breadcrumb.onRouteChanged_(fakeRouteNavigator, fakeCrumbSetter);
      assert([...list]).to.equal([]);
    });
  });
});
