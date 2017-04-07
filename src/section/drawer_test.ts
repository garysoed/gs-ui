import { assert, Matchers, TestBase } from '../test-base';
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
      spyOn(drawer.itemStyleHook_, 'get').and.returnValue(style);

      drawer.onAlignContentChanged_('left');

      assert(style.left).to.equal('0');
      assert(style.right).to.beNull();
    });

    it('should set the style correctly if the anchor point is "right"', () => {
      const style = Mocks.object('style');
      spyOn(drawer.itemStyleHook_, 'get').and.returnValue(style);

      drawer.onAlignContentChanged_('right');

      assert(style.left).to.beNull();
      assert(style.right).to.equal('0');
    });

    it('should throw error if the value is invalid', () => {
      spyOn(drawer.itemStyleHook_, 'get').and.returnValue(Mocks.object('style'));
      assert(() => {
        drawer.onAlignContentChanged_('unknown');
      }).to.throwError(/Invalid align point/);
    });

    it('should not throw error if alignContent is null', () => {
      const style = Mocks.object('style');
      spyOn(drawer.itemStyleHook_, 'get').and.returnValue(style);

      assert(() => {
        drawer.onAlignContentChanged_(null);
      }).toNot.throw();
    });

    it('should not throw error if style is null', () => {
      spyOn(drawer.itemStyleHook_, 'get').and.returnValue(null);

      assert(() => {
        drawer.onAlignContentChanged_('left');
      }).toNot.throw();
    });
  });

  describe('onAnchorPointChanged_', () => {
    it('should set the style correctly if the anchor point is "left"', () => {
      const style = Mocks.object('style');
      spyOn(drawer.containerStyleHook_, 'get').and.returnValue(style);

      drawer.onAnchorPointChanged_('left');

      assert(style.left).to.equal('0');
      assert(style.right).to.beNull();
    });

    it('should set the style correctly if the anchor point is "right"', () => {
      const style = Mocks.object('style');
      spyOn(drawer.containerStyleHook_, 'get').and.returnValue(style);

      drawer.onAnchorPointChanged_('right');

      assert(style.left).to.beNull();
      assert(style.right).to.equal('0');
    });

    it('should throw error if the value is invalid', () => {
      spyOn(drawer.containerStyleHook_, 'get').and.returnValue(Mocks.object('style'));
      assert(() => {
        drawer.onAnchorPointChanged_('unknown');
      }).to.throwError(/Invalid anchor point/);
    });

    it('should not throw error if anchorPoint is null', () => {
      const style = Mocks.object('style');
      spyOn(drawer.containerStyleHook_, 'get').and.returnValue(style);

      assert(() => {
        drawer.onAnchorPointChanged_(null);
      }).toNot.throw();
    });

    it('should not throw error if style is null', () => {
      spyOn(drawer.containerStyleHook_, 'get').and.returnValue(null);

      assert(() => {
        drawer.onAnchorPointChanged_('left');
      }).toNot.throw();
    });
  });

  describe('onIsExpandedChanged_', () => {
    it('should add the expanded class name if set to true', () => {
      let existingClassName = 'existingClassName';

      spyOn(drawer['classListHook_'], 'get').and.returnValue(new Set([existingClassName]));
      let bridgeSetSpy = spyOn(drawer['classListHook_'], 'set');

      drawer['onIsExpandedChanged_'](true);

      assert(drawer['classListHook_'].set).to.haveBeenCalledWith(Matchers.any(Set));
      assert(<Set<string>> bridgeSetSpy.calls.argsFor(0)[0]).to
          .haveElements([existingClassName, 'expanded']);
    });

    it('should remove the expanded class name if set to false', () => {
      let existingClassName = 'existingClassName';

      spyOn(drawer['classListHook_'], 'get').and
          .returnValue(new Set([existingClassName, 'expanded']));
      let bridgeSetSpy = spyOn(drawer['classListHook_'], 'set');

      drawer['onIsExpandedChanged_'](false);

      assert(drawer['classListHook_'].set).to.haveBeenCalledWith(Matchers.any(Set));
      assert(<Set<string>> bridgeSetSpy.calls.argsFor(0)[0]).to .haveElements([existingClassName]);
    });

    it('should handle the case where there is no set of class lists', () => {
      spyOn(drawer['classListHook_'], 'get').and.returnValue(null);
      let bridgeSetSpy = spyOn(drawer['classListHook_'], 'set');

      drawer['onIsExpandedChanged_'](true);

      assert(drawer['classListHook_'].set).to.haveBeenCalledWith(Matchers.any(Set));
      assert(<Set<string>> bridgeSetSpy.calls.argsFor(0)[0]).to
          .haveElements(['expanded']);
    });
  });

  describe('onMinWidthChanged_', () => {
    it('should set the collapsed width correctly', () => {
      let width = 'width';
      let mockStyle = jasmine.createSpyObj('Style', ['setProperty']);

      spyOn(drawer['rootStyleHook_'], 'get').and.returnValue(mockStyle);

      drawer['onMinWidthChanged_'](width);

      assert(mockStyle.setProperty).to.haveBeenCalledWith('--gsDrawerCollapsedWidth', width);
    });

    it('should not set the style if there is no style property', () => {
      spyOn(drawer['rootStyleHook_'], 'get').and.returnValue(null);

      assert(() => {
        drawer['onMinWidthChanged_']('width');
      }).toNot.throw();
    });
  });

  describe('onMaxWidthChanged_', () => {
    it('should set the expanded width correctly', () => {
      let width = 'width';
      let mockStyle = jasmine.createSpyObj('Style', ['setProperty']);

      spyOn(drawer['rootStyleHook_'], 'get').and.returnValue(mockStyle);

      drawer['onMaxWidthChanged_'](width);

      assert(mockStyle.setProperty).to.haveBeenCalledWith('--gsDrawerExpandedWidth', width);
    });

    it('should not set the style if there is no style property', () => {
      spyOn(drawer['rootStyleHook_'], 'get').and.returnValue(null);

      assert(() => {
        drawer['onMaxWidthChanged_']('width');
      }).toNot.throw();
    });
  });
});
