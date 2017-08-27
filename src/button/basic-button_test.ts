import { TestBase } from '../test-base';
TestBase.setup();

import { Injector } from 'external/gs_tools/src/inject';
import { Persona } from 'external/gs_tools/src/persona';
import { forceImport } from 'external/gs_tools/src/typescript';
import { Templates } from 'external/gs_tools/src/webc';

import { BasicButton } from '../button';

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
      const eventPromise = new Promise((resolve: any) => {
        button.addEventListener('gs-action', resolve);
      });
      button.click();

      await eventPromise;
    });

    it('should not dispatch any events if disabled', async () => {
      const eventPromise = new Promise((resolve: any, reject: any) => {
        button.addEventListener('gs-action', reject);
        setTimeout(resolve, 100);
      });

      button.setAttribute('disabled', 'true');
      button.click();

      await eventPromise;
    });
  });
});

