import { Log } from 'external/gs_tools/src/util';
import { WindowBus } from 'external/gs_tools/src/webc';

const LOG: Log = Log.of('common.WindowBus');
export const WINDOW_BUS = new WindowBus(window, LOG);
