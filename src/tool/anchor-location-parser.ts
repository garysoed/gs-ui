import { Parser } from 'external/gs_tools/src/interfaces';
import { Enums } from 'external/gs_tools/src/typescript';

import { AnchorLocation } from '../const';


/**
 * Parser for [AnchorLocation]s.
 */
export const AnchorLocationParser: Parser<AnchorLocation> = {
  /**
   * Parses the given string to anchor locations.
   *
   * @param stringValue The string to parse.
   * @return The anchor location corresponding to the string.
   */
  parse(stringValue: string | null): AnchorLocation | null {
    if (stringValue === null) {
      return null;
    }
    const parsedValue = Enums.fromLowerCaseString<AnchorLocation>(stringValue!, AnchorLocation);
    return parsedValue === undefined ? null : parsedValue;
  },

  /**
   * Converts the given AnchorLocation to its string representation.
   *
   * @param anchorLocation The anchor location to be converted to string.
   * @return The string representation of the given anchor location.
   */
  stringify(anchorLocation: AnchorLocation | null): string {
    if (anchorLocation === null) {
      return '';
    }
    return Enums.toLowerCaseString(anchorLocation, AnchorLocation);
  },
};
// TODO: Mutable
