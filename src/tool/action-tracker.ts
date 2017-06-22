/**
 * Tracks actions in the UI.
 *
 * Use this whenever a `gs-action` is dispatched.
 */
import { MonadFactory } from 'external/gs_tools/src/interfaces/monad-factory';

type ClickAction = { type: 'click', x: number, y: number };
export type Action = ClickAction;

let lastAction: Action | null = null;
let lastActionTimestamp: number | null;

export const MAX_ACTION_AGE_ = 300;

export const ActionTracker: MonadFactory<Action | null> = () => {
  return {
    get(): Action | null {
      if (lastActionTimestamp === null) {
        return null;
      }
      const now = Date.now();
      return (now - lastActionTimestamp) < MAX_ACTION_AGE_ ? lastAction : null;
    },

    set(action: Action | null): void {
      lastAction = action;
      lastActionTimestamp = Date.now();
    },
  };
};
