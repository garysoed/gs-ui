import { AnchorLocation } from './anchor-location';


export class Anchors {
  /**
   * Resolves the AnchorLocation when it is set to "AUTO"
   *
   * @param x The screen x coordinate of the anchor.
   * @param y The screen y coordinate of the anchor.
   * @param windowEl The window element reference.
   */
  static resolveAutoLocation(x: number, y: number, windowEl: Window): AnchorLocation {
    const normalizedX = x / windowEl.innerWidth;
    const normalizedY = y / windowEl.innerHeight;
    if (normalizedX > 0.5) {
      if (normalizedY > 0.5) {
        return AnchorLocation.BOTTOM_RIGHT;
      } else {
        return AnchorLocation.TOP_RIGHT;
      }
    } else {
      if (normalizedY > 0.5) {
        return AnchorLocation.BOTTOM_LEFT;
      } else {
        return AnchorLocation.TOP_LEFT;
      }
    }
  }
}
// TODO: Mutable
