/**
 * orderFlowTs - Event-driven workflow engine
 * A minimal, clean implementation of a state machine / workflow engine.

 */

// Domain types
export type { NodeId, State } from "./domain/types";
export type { Node } from "./domain/node";
export type { StateChanged } from "./domain/event";
export type {
  Trigger,
  GuardType,
  GuardCondition,
  Guard,
  TargetAction,
  Link,
} from "./domain/link";

// Storage
export { InMemoryStore } from "./storage/inMemoryStore";

// Engine
export { WorkflowEngine } from "./engine/workflowEngine";
export type { WorkflowEngineOptions } from "./engine/workflowEngine";
export { evaluateGuard } from "./engine/guardEvaluator";
export type { TraceEntry } from "./engine/trace";
export { formatTrace } from "./engine/trace";

// Errors
export { NodeNotFoundError, MaxEventsExceededError } from "./engine/errors";
