/**
 * WorkflowEngine - the main orchestration loop for state propagation.
 */

import type { InMemoryStore } from "../storage/inMemoryStore";
import type { StateChanged } from "../domain/event";
import type { NodeId, State } from "../domain/types";
import type { TraceEntry } from "./trace";
import { matchLink } from "./linkMatcher";
import { evaluateGuard } from "./guardEvaluator";
import { MaxEventsExceededError } from "./errors";

/** Default maximum events to process before assuming infinite loop */
const DEFAULT_MAX_EVENTS = 1000;

/**
 * Configuration options for the WorkflowEngine.
 */
export interface WorkflowEngineOptions {
  /** Maximum events to process in a single updateState call (default: 1000) */
  maxEvents?: number;
}

/**
 * WorkflowEngine orchestrates state changes and cascades through Links.
 *
 * Algorithm:
 * 1. Apply initial state change, emit StateChanged event
 * 2. Add event to queue
 * 3. While queue is not empty:
 *    a. Dequeue event
 *    b. Find all Links triggered by this event
 *    c. For each matching Link:
 *       - Evaluate Guard (if present)
 *       - If Guard passes, apply actions
 *       - Each action may produce new StateChanged events
 *    d. Add new events to queue
 * 4. Return trace of all state changes
 */
export class WorkflowEngine {
  private store: InMemoryStore;
  private maxEvents: number;

  constructor(store: InMemoryStore, options: WorkflowEngineOptions = {}) {
    this.store = store;
    this.maxEvents = options.maxEvents ?? DEFAULT_MAX_EVENTS;
  }

  /**
   * Update a node's state and process all cascading changes.
   *
   * @param nodeId - The node to update
   * @param newState - The new state value
   * @returns Array of trace entries showing all state changes that occurred
   */
  updateState(nodeId: NodeId, newState: State): TraceEntry[] {
    // TODO: implement
    return [];
  }

  /**
   * Get a snapshot of all current node states.
   */
  getAllStates(): Record<NodeId, State> {
    // TODO: implement
    return {};
  }
}
