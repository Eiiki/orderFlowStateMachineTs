/**
 * Link matching logic - determines if a Link's trigger matches an event.
 */

import type { Link } from "../domain/link";
import type { StateChanged } from "../domain/event";

/**
 * Check if a Link's trigger matches a StateChanged event.
 *
 * Matching rules:
 * - trigger.sourceId must match event.nodeId
 * - trigger.toState must match event.toState
 * - trigger.fromState (if specified) must match event.fromState
 *
 * @param link - The link to check
 * @param event - The state change event
 * @returns true if the link's trigger matches the event
 */
export function matchLink(link: Link, event: StateChanged): boolean {
  const { trigger } = link;

  // Source must match
  if (trigger.sourceId !== event.nodeId) {
    return false;
  }

  // Target state must match
  if (trigger.toState !== event.toState) {
    return false;
  }

  // If fromState specified, it must match
  if (trigger.fromState !== undefined && trigger.fromState !== event.fromState) {
    return false;
  }

  return true;
}
