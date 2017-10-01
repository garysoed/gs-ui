import { TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { Injector } from 'external/gs_tools/src/inject';
import { Persona } from 'external/gs_tools/src/persona';
import { forceImport } from 'external/gs_tools/src/typescript';
import { Templates } from 'external/gs_tools/src/webc';

import { BasicButton } from '../button';
import { $ } from '../button/basic-button';

forceImport(BasicButton);

describe('button.BasicButton HTMLElement', () => {
  let button: HTMLElement;

  beforeAll(() => {
    const mockThemeService = jasmine.createSpyObj('ThemeService', ['applyTheme']);
    const injector = Injector.newInstance();
    Injector.bindProvider(() => mockThemeService, 'theming.ThemeService');

    Templates.register('src/button/basic-button', '<div></div>');
    Persona.registerAll(injector, Templates.newInstance());
  });

  beforeEach(() => {
    button = document.createElement('gs-basic-button');
    document.body.appendChild(button);
  });

  afterEach(() => {
    button.remove();
  });

  describe('onClick_', () => {
    it('should dispatch the correct event', async () => {
      await new Promise((resolve: any) => {
        TestDispose.add(Graph.on('change', (event: any) => {
          if (event.id === $.host.dispatch.getId()) {
            resolve();
          }
        }, window));
      });
      const eventPromise = new Promise((resolve: any) => {
        button.addEventListener('gs-action', resolve);
      });
      button.click();

      await eventPromise;
    });

    it('should not dispatch any events if disabled', async () => {
      await new Promise((resolve: any) => {
        TestDispose.add(Graph.on('change', (event: any) => {
          if (event.id === $.host.dispatch.getId()) {
            resolve();
          }
        }, window));
      });

      const eventPromise = new Promise((resolve: any, reject: any) => {
        button.addEventListener('gs-action', reject);
        setTimeout(resolve, 100);
      });

      const disabledUpdated = new Promise((resolve: any) => {
        TestDispose.add(Graph.on('change', (event: any) => {
          if (event.id === $.host.disabled.getId()) {
            resolve();
          }
        }, window));
      });
      button.setAttribute('disabled', 'true');
      await disabledUpdated;

      button.click();

      await eventPromise;
    });
  });
});

