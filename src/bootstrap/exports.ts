import { HslColor } from 'external/gs_tools/src/color';
import { Jsons } from 'external/gs_tools/src/data';
import { Log } from 'external/gs_tools/src/util';
import { Templates } from 'external/gs_tools/src/webc';

import { Main } from '../bootstrap/main';
import { routeFactoriesProvider } from '../routing';
import { SimpleRouteFactory } from '../routing/simple-route-factory';
import { DefaultPalettes } from '../theming/default-palettes';
import { Theme } from '../theming/theme';

Jsons.setValue(window, 'gs.Templates', Templates);
Jsons.setValue(window, 'gs.ui.Color', HslColor);
Jsons.setValue(window, 'gs.ui.DefaultPalettes', DefaultPalettes);
Jsons.setValue(window, 'gs.ui.Main', Main);
Jsons.setValue(window, 'gs.ui.SimpleRouteFactory', SimpleRouteFactory);
Jsons.setValue(window, 'gs.ui.Theme', Theme);
Jsons.setValue(window, 'gs.ui.routeFactoriesProvider', routeFactoriesProvider);
Jsons.setValue(window, 'gs.ui.setLogLevel', Log.setEnabledLevel);
