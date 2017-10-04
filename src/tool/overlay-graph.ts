import {
  BooleanType,
  HasPropertiesType,
  NullableType,
  SymbolType } from 'external/gs_tools/src/check';
import { Graph, staticId } from 'external/gs_tools/src/graph';

import { OverlayBus, OverlayEvent } from '../tool/overlay-bus';

export const $overlay = {
  state: staticId('state', NullableType(HasPropertiesType({id: SymbolType, visible: BooleanType}))),
};
const overlayStateProvider = Graph.createProvider($overlay.state, null);

OverlayBus.on('show', ({id}: OverlayEvent) => {
  overlayStateProvider({id, visible: true});
}, false);
OverlayBus.on('hide', ({id}: OverlayEvent) => {
  overlayStateProvider({id, visible: false});
}, false);
