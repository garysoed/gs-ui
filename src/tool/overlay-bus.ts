import { Bus } from 'external/gs_tools/src/event';
import { Log } from 'external/gs_tools/src/util';

export type OverlayEventType = 'show' | 'hide';
type OverlayEvent = {
  id: symbol,
  type: OverlayEventType,
};

const LOGGER = Log.of('gs-ui.tool.OverlayBus');

export const OverlayBus = new (class extends Bus<OverlayEventType, OverlayEvent> { })(LOGGER);
