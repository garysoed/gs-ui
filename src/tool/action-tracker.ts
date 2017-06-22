/**
 * Tracks actions in the UI.
 *
 * Use this whenever a `gs-action` is dispatched.
 */
import { MonadFactory } from 'external/gs_tools/src/interfaces/monad-factory';

type ClickAction = { type: 'click', x: number, y: number };
export type Action = ClickAction;

let lastAction: Action | null = null;

export const ActionTracker: MonadFactory<Action | null> = () => {
  return {
    get(): Action | null {
      return lastAction;
    },

    set(action: Action | null): void {
      lastAction = action;
    },
  };
};
