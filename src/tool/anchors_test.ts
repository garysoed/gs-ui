import { assert, TestBase } from '../test-base';
TestBase.setup();

import { Mocks } from 'external/gs_tools/src/mock';

import { AnchorLocation } from './anchor-location';
import { Anchors } from './anchors';


describe('tool.Anchors', () => {
  describe('resolveAutoLocation', () => {
    let window: any;

    beforeEach(() => {
      window = Mocks.object('window');
    });

    it('should return TOP_LEFT if the anchor target is at the top left of the screen', () => {
      window.innerWidth = 100;
      window.innerHeight = 100;
      assert(Anchors.resolveAutoLocation(25, 25, window)).to.equal(AnchorLocation.TOP_LEFT);
    });

    it('should return TOP_RIGHT if the anchor target is at the top right of the screen', () => {
      window.innerWidth = 100;
      window.innerHeight = 100;
      assert(Anchors.resolveAutoLocation(75, 25, window)).to.equal(AnchorLocation.TOP_RIGHT);
    });

    it('should return BOTTOM_RIGHT if the anchor target is at the bottom right of the screen',
        () => {
          window.innerWidth = 100;
          window.innerHeight = 100;
          assert(Anchors.resolveAutoLocation(75, 75, window)).to.equal(AnchorLocation.BOTTOM_RIGHT);
        });

    it('should return BOTTOM_LEFT if the anchor target is at the bottom left of the screen',
        () => {
          window.innerWidth = 100;
          window.innerHeight = 100;
          assert(Anchors.resolveAutoLocation(25, 75, window)).to.equal(AnchorLocation.BOTTOM_LEFT);
        });
  });
});
