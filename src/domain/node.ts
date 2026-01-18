/**
 * Node represents a stateful component in the workflow.
 */

import type { NodeId, State } from "./types";

/**
 * A Node is a stateful component with an id and current state.
 * Whether it represents a "workflow" or "task" is purely semantic -
 * the engine treats all nodes identically.
 */
export interface Node {
  id: NodeId;
  state: State;
}
