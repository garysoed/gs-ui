/**
 * Tracks actions in the UI.
 *
 * Use this whenever a `gs-action` is dispatched.
 */
import {
  HasPropertyType,
  NullType,
  NumberType,
  StringType,
  UnionType } from 'external/gs_tools/src/check';
import { Graph, GraphTime, staticId } from 'external/gs_tools/src/graph';

type ClickAction = {type: 'click', x: number, y: number};
type KeyboardAction = {type: 'keyboard'};
export type Action = ClickAction | KeyboardAction;

export const MAX_ACTION_AGE_ = 300;

const ActionType = UnionType.builder<Action | null>()
    .addType(HasPropertyType<Action>('type', StringType))
    .addType(NullType)
    .build();
const $lastAction = staticId('lastAction', ActionType);
const lastActionProvider = Graph.createProvider($lastAction, null);

const TimestampType = UnionType.builder<number | null>()
    .addType(NumberType)
    .addType(NullType)
    .build();
const $lastActionTimestamp = staticId('lastActionTimestamp', TimestampType);
const lastActionTimestampProvider = Graph.createProvider($lastActionTimestamp, null);

export const ActionTracker = {
  async get(time: GraphTime): Promise<Action | null> {
    const [lastAction, lastActionTimestamp] = await Promise.all([
      Graph.get($lastAction, time),
      Graph.get($lastActionTimestamp, time),
    ]);

    if (lastActionTimestamp === null) {
      return null;
    }
    const now = Date.now();
    return (now - lastActionTimestamp) < MAX_ACTION_AGE_ ? lastAction : null;
  },

  async set(action: Action | null): Promise<void> {
    return Promise
        .all([
          lastActionProvider(action),
          lastActionTimestampProvider(Date.now()),
        ])
        .then(() => undefined);
  },
};
