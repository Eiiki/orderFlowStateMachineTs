/**
 * Trace utilities for debugging and logging state changes.
 */

import type { StateChanged } from "../domain/event";

/**
 * A trace entry records a single state change in the cascade.
 */
export interface TraceEntry {
  /** The state change that occurred */
  event: StateChanged;
  /** Optional: the link that caused this change (undefined for initial change) */
  triggeredBy?: string;
}

/**
 * Format a single trace entry as a readable string.
 */
export function formatTraceEntry(entry: TraceEntry): string {
  const { event, triggeredBy } = entry;
  const base = `${event.nodeId}: ${event.fromState} → ${event.toState}`;

  if (triggeredBy) {
    return `${base} (via ${triggeredBy})`;
  }
  return base;
}

/**
 * Format a complete trace as a readable multi-line string.
 */
export function formatTrace(trace: TraceEntry[]): string {
  if (trace.length === 0) {
    return "(no changes)";
  }
  return trace.map(formatTraceEntry).join("\n");
}
