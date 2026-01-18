/**
 * Link abstraction - defines relationships between nodes and how state changes propagate.
 */

import type { NodeId, State } from "./types";

/**
 * Trigger defines when a Link should activate.
 * A Link activates when a specific node transitions to a specific state.
 */
export interface Trigger {
  /** The node that must change state */
  sourceId: NodeId;
  /** Optional: only trigger if coming FROM this state */
  fromState?: State;
  /** Required: trigger when node transitions TO this state */
  toState: State;
}

/**
 * Guard types for conditional logic.
 * - ALL_OF: All conditions must be true (AND logic, for merge)
 * - ANY_OF: At least one condition must be true (OR logic)
 */
export type GuardType = "ALL_OF" | "ANY_OF";

/**
 * A single condition checking if a node is in a specific state.
 */
export interface GuardCondition {
  nodeId: NodeId;
  state: State;
}

/**
 * Guard defines conditions that must be met before a Link's actions execute.
 * Used for merge patterns where multiple nodes must reach certain states.
 */
export interface Guard {
  type: GuardType;
  conditions: GuardCondition[];
}

/**
 * Action to perform when a Link fires.
 * Sets a target node to a specific state.
 */
export interface TargetAction {
  targetId: NodeId;
  targetState: State;
}

/**
 * Link is a declarative rule that defines:
 * - When to activate (trigger)
 * - Optional conditions to check (guard)
 * - What state changes to apply (actions)
 */
export interface Link {
  /** Unique identifier for this link */
  id: string;
  /** When this link should activate */
  trigger: Trigger;
  /** Optional conditions that must be met */
  guard?: Guard;
  /** State changes to apply when link fires */
  actions: TargetAction[];
}
