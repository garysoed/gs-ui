import { HslColor } from 'external/gs_tools/src/color';
import { Jsons } from 'external/gs_tools/src/data';
import { Debug, Graph } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { ListParser, ObjectParser, StringParser } from 'external/gs_tools/src/parse';
import { $location } from 'external/gs_tools/src/ui';
import { Log } from 'external/gs_tools/src/util';
import { Templates } from 'external/gs_tools/src/webc';

import { Main } from '../bootstrap/main';
import { routeFactoriesProvider } from '../routing';
import { $route } from '../routing/route-graph';
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
Jsons.setValue(window, 'gs.ui.Graph', Graph);
Jsons.setValue(window, 'gs.ui.$location', $location);
Jsons.setValue(window, 'gs.ui.$route', $route);
Jsons.setValue(window, 'gs.ui.ListParser', ListParser);
Jsons.setValue(window, 'gs.ui.ObjectParser', ObjectParser);
Jsons.setValue(window, 'gs.ui.StringParser', StringParser);
Jsons.setValue(window, 'gs.ui.ImmutableList', ImmutableList);
Jsons.setValue(window, 'gs.tools.Graph.Debug', Debug);
