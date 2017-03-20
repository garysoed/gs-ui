import { assert, TestBase } from '../test-base';
TestBase.setup();

import { AnchorLocation } from './anchor-location';
import { AnchorLocationParser } from './anchor-location-parser';


describe('tool.AnchorLocationParser', () => {
  describe('parse', () => {
    it('should return the correct enum', () => {
      assert(AnchorLocationParser.parse('bottom_right')).to.equal(AnchorLocation.BOTTOM_RIGHT);
    });

    it('should return null if the string is invalid', () => {
      assert(AnchorLocationParser.parse('invalid')).to.beNull();
    });

    it('should return null if the string is null', () => {
      assert(AnchorLocationParser.parse(null)).to.beNull();
    });
  });

  describe('stringify', () => {
    it('should return the correct string', () => {
      assert(AnchorLocationParser.stringify(AnchorLocation.BOTTOM_RIGHT)).to.equal('bottom_right');
    });

    it('should return empty string if the enum is null', () => {
      assert(AnchorLocationParser.stringify(null)).to.equal('');
    });
  });
});
