import {assert, Matchers, TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {Drawer} from './drawer';


describe('section.Drawer', () => {
  let drawer: Drawer;

  beforeEach(() => {
    drawer = new Drawer(Mocks.object('ThemeService'));
    TestDispose.add(drawer);
  });

  describe('onAnchorPointChanged_', () => {
    it('should set the flex justify value correctly', () => {
      spyOn(drawer['flexJustifyHook_'], 'set');

      drawer['onAnchorPointChanged_']('left');

      assert(drawer['flexJustifyHook_'].set).to.haveBeenCalledWith('flex-start');
    });

    it('should throw error if the value is invalid', () => {
      assert(() => {
        drawer['onAnchorPointChanged_']('unknown');
      }).to.throwError(/Invalid anchor point/);
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
