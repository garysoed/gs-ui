import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';
import { TestDispose } from 'external/gs_tools/src/testing';

import { Drawer } from './drawer';


describe('section.Drawer', () => {
  let drawer: Drawer;

  beforeEach(() => {
    drawer = new Drawer(Mocks.object('ThemeService'));
    TestDispose.add(drawer);
  });

  describe('onAlignContentChanged_', () => {
    it('should set the style correctly if the anchor point is "left"', () => {
      const style = Mocks.object('style');
      const itemEl = Mocks.object('itemEl');
      itemEl.style = style;

      drawer.onAlignContentChanged_('left', itemEl);

      assert(style.left).to.equal('0');
      assert(style.right).to.beNull();
    });

    it('should set the style correctly if the anchor point is "right"', () => {
      const style = Mocks.object('style');
      const itemEl = Mocks.object('itemEl');
      itemEl.style = style;

      drawer.onAlignContentChanged_('right', itemEl);

      assert(style.left).to.beNull();
      assert(style.right).to.equal('0');
    });

    it('should not throw error if alignContent is null', () => {
      const style = Mocks.object('style');
      const itemEl = Mocks.object('itemEl');
      itemEl.style = style;

      assert(() => {
        drawer.onAlignContentChanged_(null, itemEl);
      }).toNot.throw();
    });
  });

  describe('onAnchorPointChanged_', () => {
    it('should set the style correctly if the anchor point is "left"', () => {
      const style = Mocks.object('style');
      const itemEl = Mocks.object('itemEl');
      itemEl.style = style;

      drawer.onAnchorPointChanged_('left', itemEl);

      assert(style.left).to.equal('0');
      assert(style.right).to.beNull();
    });

    it('should set the style correctly if the anchor point is "right"', () => {
      const style = Mocks.object('style');
      const itemEl = Mocks.object('itemEl');
      itemEl.style = style;

      drawer.onAnchorPointChanged_('right', itemEl);

      assert(style.left).to.beNull();
      assert(style.right).to.equal('0');
    });

    it('should not throw error if anchorPoint is null', () => {
      const style = Mocks.object('style');
      const itemEl = Mocks.object('itemEl');
      itemEl.style = style;

      assert(() => {
        drawer.onAnchorPointChanged_(null, itemEl);
      }).toNot.throw();
    });
  });

  describe('onExpandedChanged_', () => {
    it('should add the expanded class name if set to true', () => {
      const existingClassName = 'existingClassName';
      const rootEl = document.createElement('div');
      rootEl.classList.add(existingClassName);

      drawer.onExpandedChanged_(rootEl, true);

      assert(rootEl).to.haveClasses([existingClassName, 'expanded']);
    });

    it('should remove the expanded class name if set to false', () => {
      const existingClassName = 'existingClassName';
      const rootEl = document.createElement('div');
      rootEl.classList.add(existingClassName);
      rootEl.classList.add('expanded');

      drawer.onExpandedChanged_(rootEl, false);

      assert(rootEl).to.haveClasses([existingClassName]);
    });
  });

  describe('onMaxWidthChanged_', () => {
    it('should set the expanded width correctly', () => {
      const width = {unit: 'rem' as 'rem', value: 123};
      const rootEl = document.createElement('div');

      drawer.onMaxWidthChanged_(width, rootEl);

      assert(rootEl.style.getPropertyValue('--gsDrawerExpandedWidth')).to.equal(`123rem`);
    });
  });

  describe('onMinWidthChanged_', () => {
    it('should set the collapsed width correctly', () => {
      const width = {unit: 'rem' as 'rem', value: 123};
      const rootEl = document.createElement('div');

      drawer.onMinWidthChanged_(width, rootEl);

      assert(rootEl.style.getPropertyValue('--gsDrawerCollapsedWidth')).to.equal(`123rem`);
    });
  });
});
