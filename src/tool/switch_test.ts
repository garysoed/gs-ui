import {assert, TestBase} from '../test-base';
TestBase.setup();

import {Mocks} from 'external/gs_tools/src/mock';
import {TestDispose} from 'external/gs_tools/src/testing';

import {Switch} from './switch';


describe('tool.Switch', () => {
  let switchEl: Switch;

  beforeEach(() => {
    switchEl = new Switch(Mocks.object('ThemeService'));
    TestDispose.add(switchEl);
  });

  describe('onGsValueChange_', () => {
    it('should set the select attribute correctly', () => {
      let value = 'value';
      spyOn(switchEl['selectBridge_'], 'set');

      switchEl['onGsValueChange_'](value);

      assert(switchEl['selectBridge_'].set).to.haveBeenCalledWith(`[gs-when="${value}"]`);
    });

    it('should delete the select attribute if value is null', () => {
      spyOn(switchEl['selectBridge_'], 'delete');

      switchEl['onGsValueChange_'](null);

      assert(switchEl['selectBridge_'].delete).to.haveBeenCalledWith();
    });
  });
});