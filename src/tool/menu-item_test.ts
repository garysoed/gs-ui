import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { FakeMonadSetter } from 'external/gs_tools/src/event';
import { TestDispose } from 'external/gs_tools/src/testing';

import { MenuItem } from './menu-item';


describe('tool.MenuItem', () => {
  let item: MenuItem;

  beforeEach(() => {
    item = new MenuItem(Mocks.object('ThemeService'));
    TestDispose.add(item);
  });

  describe('onDataAttributeChange_', () => {
    it(`should set the content correctly`, () => {
      const content = 'content';
      const fakeContentSetter = new FakeMonadSetter<string | null>(null);

      const updates = item.onDataAttributeChange_(content, fakeContentSetter);
      assert(fakeContentSetter.findValue(updates)!.value).to.equal(content);
    });
  });
});
