import { HslColor } from 'external/gs_tools/src/color';
import { Jsons } from 'external/gs_tools/src/data';
import { Templates } from 'external/gs_tools/src/webc';

import { SimpleRouteFactory } from '../routing/simple-route-factory';
import { DefaultPalettes } from '../theming/default-palettes';
import { Theme } from '../theming/theme';

import { Main } from './main';


Jsons.setValue(window, 'gs.Templates', Templates);
Jsons.setValue(window, 'gs.ui.Color', HslColor);
Jsons.setValue(window, 'gs.ui.DefaultPalettes', DefaultPalettes);
Jsons.setValue(window, 'gs.ui.Main', Main);
Jsons.setValue(window, 'gs.ui.SimpleRouteFactory', SimpleRouteFactory);
Jsons.setValue(window, 'gs.ui.Theme', Theme);
