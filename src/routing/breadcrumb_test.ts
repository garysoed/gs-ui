import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Fakes, Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { Breadcrumb } from '../routing';
import { crumbFactory, crumbGetter, crumbSetter } from '../routing/breadcrumb';


describe('crumbFactory', () => {
  it('should create the element correctly', () => {
    const mockClassList = jasmine.createSpyObj('ClassList', ['add']);
    const mockRootEl = jasmine.createSpyObj('RootEl', ['appendChild', 'setAttribute']);
    mockRootEl.classList = mockClassList;

    const linkEl = Mocks.object('linkEl');
    const arrowEl = document.createElement('div');
    const mockDocument = jasmine.createSpyObj('Document', ['createElement']);
    Fakes.build(mockDocument.createElement)
        .when('li').return(mockRootEl)
        .when('a').return(linkEl)
        .when('gs-icon').return(arrowEl);

    assert(crumbFactory(mockDocument)).to.equal(mockRootEl);
    assert(mockRootEl.appendChild).to.haveBeenCalledWith(arrowEl);
    assert(mockRootEl.appendChild).to.haveBeenCalledWith(linkEl);
    assert(arrowEl.textContent).to.equal('keyboard_arrow_right');
    assert(arrowEl.getAttribute('aria-hidden')).to.equal('true');
    assert(mockRootEl.setAttribute).to.haveBeenCalledWith('flex-align', 'center');
    assert(mockRootEl.setAttribute).to.haveBeenCalledWith('layout', 'row');
    assert(mockClassList.add).to.haveBeenCalledWith('crumb');
  });
});

describe('crumbGetter', () => {
  it('should return the correct data', () => {
    const url = 'url';
    const name = 'name';
    const linkEl = Mocks.object('linkEl');
    linkEl.href = `#${url}`;
    linkEl.textContent = name;
    const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
    mockElement.querySelector.and.returnValue(linkEl);
    assert(crumbGetter(mockElement)).to.equal({name, url});
    assert(mockElement.querySelector).to.haveBeenCalledWith('a');
  });

  it('should return null if there are no text contents', () => {
    const url = 'url';
    const linkEl = Mocks.object('linkEl');
    linkEl.href = `#${url}`;
    linkEl.textContent = null;
    const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
    mockElement.querySelector.and.returnValue(linkEl);
    assert(crumbGetter(mockElement)).to.beNull();
    assert(mockElement.querySelector).to.haveBeenCalledWith('a');
  });

  it('should return null if the href does not start with #', () => {
    const linkEl = Mocks.object('linkEl');
    linkEl.href = `url`;
    linkEl.textContent = null;
    const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
    mockElement.querySelector.and.returnValue(linkEl);
    assert(crumbGetter(mockElement)).to.beNull();
    assert(mockElement.querySelector).to.haveBeenCalledWith('a');
  });

  it('should return null if the link element cannot be found', () => {
    const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
    mockElement.querySelector.and.returnValue(null);
    assert(crumbGetter(mockElement)).to.equal(null);
    assert(mockElement.querySelector).to.haveBeenCalledWith('a');
  });
});

describe('crumbSetter', () => {
  it('should set the data correctly', () => {
    const linkEl = document.createElement('a');
    const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
    mockElement.querySelector.and.returnValue(linkEl);

    const url = 'url';
    const name = 'name';
    crumbSetter({name: name, url: url}, mockElement, 3, 4);

    assert(linkEl.textContent).to.equal(name);
    assert(linkEl.href).to.match(/#url$/);
    assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    assert(linkEl.getAttribute('aria-current')).to.equal('page');
  });

  it(`should delete the aria-current if not the last crumb`, () => {
    const linkEl = document.createElement('a');
    linkEl.setAttribute('aria-current', 'page');
    const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
    mockElement.querySelector.and.returnValue(linkEl);

    const url = 'url';
    const name = 'name';
    crumbSetter({name: name, url: url}, mockElement, 3, 5);

    assert(linkEl.textContent).to.equal(name);
    assert(linkEl.href).to.match(/#url$/);
    assert(mockElement.querySelector).to.haveBeenCalledWith('a');
    assert(linkEl.hasAttribute('aria-current')).to.beFalse();
  });

  it('should throw error if the link element cannot be found', () => {
    const mockElement = jasmine.createSpyObj('Element', ['querySelector']);
    mockElement.querySelector.and.returnValue(null);

    assert(() => {
      crumbSetter({name: 'name', url: 'url'}, mockElement, 1, 2);
    }).to.throwError(/element not found/);
  });
});

describe('routing.Breadcrumb', () => {
  let breadcrumb: Breadcrumb;
  let mockRouteService: any;

  beforeEach(() => {
    mockRouteService = Mocks.listenable('RouteService');
    TestDispose.add(mockRouteService);
    const mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    breadcrumb = new Breadcrumb(mockThemeService);
    TestDispose.add(breadcrumb);
  });

  describe('renderChildren_', () => {
    it('should return the correct crumb data', () => {
      const crumbData = Mocks.object('crumbData');

      assert(breadcrumb.renderChildren_(crumbData)).to.equal(crumbData);
    });
  });
});
