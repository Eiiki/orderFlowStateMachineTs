/**
 * Guard evaluation logic - checks if Link conditions are satisfied.
 */

import type { Guard, GuardCondition } from "../domain/link";
import type { InMemoryStore } from "../storage/inMemoryStore";

/**
 * Evaluate a Guard against current node states.
 *
 * Guard types:
 * - ALL_OF: All conditions must be satisfied (AND logic)
 * - ANY_OF: At least one condition must be satisfied (OR logic)
 *
 * @param guard - The guard to evaluate
 * @param store - The store to read current node states from
 * @returns true if the guard conditions are satisfied
 */
export function evaluateGuard(guard: Guard, store: InMemoryStore): boolean {
  function checkCondition(condition: GuardCondition): boolean {
    const node = store.getNode(condition.nodeId);
    return node?.state === condition.state;
  }

  switch (guard.type) {
    case "ALL_OF":
      return guard.conditions.every(checkCondition);
    case "ANY_OF":
      return guard.conditions.some(checkCondition);
  }
}
