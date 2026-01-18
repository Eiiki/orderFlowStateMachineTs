/**
 * Events emitted when node state changes.
 */

import type { NodeId, State } from "./types";

/**
 * Emitted when a Node's state changes.
 * This event triggers Link evaluation in the engine.
 */
export interface StateChanged {
  nodeId: NodeId;
  fromState: State;
  toState: State;
}
