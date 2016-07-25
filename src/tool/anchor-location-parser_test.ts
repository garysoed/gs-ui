import {TestBase} from '../test-base';
TestBase.setup();

import {AnchorLocation} from './anchor-location';
import {AnchorLocationParser} from './anchor-location-parser';


describe('tool.AnchorLocationParser', () => {
  describe('parse', () => {
    it('should return the correct enum', () => {
      expect(AnchorLocationParser.parse('bottom_right')).toEqual(AnchorLocation.BOTTOM_RIGHT);
    });

    it('should return null if the string is invalid', () => {
      expect(AnchorLocationParser.parse('invalid')).toEqual(null);
    });

    it('should return null if the string is null', () => {
      expect(AnchorLocationParser.parse(null)).toEqual(null);
    });
  });

  describe('stringify', () => {
    it('should return the correct string', () => {
      expect(AnchorLocationParser.stringify(AnchorLocation.BOTTOM_RIGHT)).toEqual('bottom_right');
    });

    it('should return empty string if the enum is null', () => {
      expect(AnchorLocationParser.stringify(null)).toEqual('');
    });
  });
});
